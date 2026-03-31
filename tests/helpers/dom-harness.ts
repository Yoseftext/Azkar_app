import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

type GlobalSnapshot = {
  window: typeof globalThis.window | undefined;
  document: typeof globalThis.document | undefined;
  navigator: typeof globalThis.navigator | undefined;
  HTMLElement: typeof globalThis.HTMLElement | undefined;
  Element: typeof globalThis.Element | undefined;
  Node: typeof globalThis.Node | undefined;
  Text: typeof globalThis.Text | undefined;
  Event: typeof globalThis.Event | undefined;
  MouseEvent: typeof globalThis.MouseEvent | undefined;
  requestAnimationFrame: typeof globalThis.requestAnimationFrame | undefined;
  cancelAnimationFrame: typeof globalThis.cancelAnimationFrame | undefined;
  actFlag: unknown;
};

class ClassListShim {
  #element;
  constructor(element) { this.#element = element; }
  #tokens() { return this.#element.className.trim().split(/\s+/).filter(Boolean); }
  #write(tokens) {
    this.#element.className = [...new Set(tokens)].join(' ');
    if (this.#element.className) this.#element.attributes.set('class', this.#element.className);
    else this.#element.attributes.delete('class');
  }
  add(...tokens) { this.#write([...this.#tokens(), ...tokens]); }
  remove(...tokens) { const blocked = new Set(tokens); this.#write(this.#tokens().filter((token) => !blocked.has(token))); }
  contains(token) { return this.#tokens().includes(token); }
  toggle(token, force) {
    if (force === true) { this.add(token); return true; }
    if (force === false) { this.remove(token); return false; }
    if (this.contains(token)) { this.remove(token); return false; }
    this.add(token); return true;
  }
}
class EventShim {
  constructor(type, init = {}) { this.type = type; this.bubbles = Boolean(init.bubbles); this.cancelable = Boolean(init.cancelable); this.target = null; this.currentTarget = null; this.defaultPrevented = false; this.eventPhase = 0; }
  preventDefault() { this.defaultPrevented = true; }
  stopPropagation() { this.__stop = true; }
}
class NodeShim {
  constructor(ownerDocument, nodeType, nodeName) { this.ownerDocument = ownerDocument; this.nodeType = nodeType; this.nodeName = nodeName; this.parentNode = null; this.childNodes = []; this._listeners = { bubble: {}, capture: {} }; }
  appendChild(node) { if (node.parentNode) node.parentNode.removeChild(node); this.childNodes.push(node); node.parentNode = this; return node; }
  removeChild(node) { const index = this.childNodes.indexOf(node); if (index >= 0) { this.childNodes.splice(index, 1); node.parentNode = null; } return node; }
  insertBefore(node, before) { if (!before) return this.appendChild(node); if (node.parentNode) node.parentNode.removeChild(node); const index = this.childNodes.indexOf(before); if (index < 0) return this.appendChild(node); this.childNodes.splice(index, 0, node); node.parentNode = this; return node; }
  get firstChild() { return this.childNodes[0] ?? null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] ?? null; }
  get nextSibling() { if (!this.parentNode) return null; const index = this.parentNode.childNodes.indexOf(this); return this.parentNode.childNodes[index + 1] ?? null; }
  get previousSibling() { if (!this.parentNode) return null; const index = this.parentNode.childNodes.indexOf(this); return this.parentNode.childNodes[index - 1] ?? null; }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(''); }
  set textContent(value) { this.childNodes = []; if (value !== '' && value !== null && value !== undefined) this.appendChild(new TextShim(this.ownerDocument, String(value))); }
  addEventListener(type, fn, options) { const capture = options === true || Boolean(options && 'capture' in options && options.capture); const bucket = capture ? 'capture' : 'bubble'; (this._listeners[bucket][type] ||= new Set()).add(fn); }
  removeEventListener(type, fn, options) { const capture = options === true || Boolean(options && 'capture' in options && options.capture); const bucket = capture ? 'capture' : 'bubble'; this._listeners[bucket][type]?.delete(fn); }
}
class TextShim extends NodeShim { constructor(ownerDocument, data) { super(ownerDocument, 3, '#text'); this.data = data; } get textContent() { return this.data; } set textContent(value) { this.data = String(value); } }
class CommentShim extends NodeShim { constructor(ownerDocument, data) { super(ownerDocument, 8, '#comment'); this.data = data; } get textContent() { return ''; } set textContent(_value) {} }
class ElementShim extends NodeShim {
  constructor(ownerDocument, tagName) { super(ownerDocument, 1, tagName.toUpperCase()); this.tagName = tagName.toUpperCase(); this.localName = tagName.toLowerCase(); this.namespaceURI = 'http://www.w3.org/1999/xhtml'; this.attributes = new Map(); this.style = {}; this.value = ''; this.checked = false; this.id = ''; this.className = ''; this.classList = new ClassListShim(this); }
  setAttribute(name, value) { const normalizedValue = String(value); this.attributes.set(name, normalizedValue); if (name === 'id') this.id = normalizedValue; if (name === 'class') this.className = normalizedValue; if (name === 'value') this.value = normalizedValue; }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); if (name === 'id') this.id = ''; if (name === 'class') this.className = ''; }
  contains(node) { let current = node; while (current) { if (current === this) return true; current = current.parentNode; } return false; }
}
class DocumentShim extends NodeShim {
  constructor() { super(null, 9, '#document'); this.ownerDocument = this; this.documentElement = new ElementShim(this, 'html'); this.body = new ElementShim(this, 'body'); this.documentElement.appendChild(this.body); this.appendChild(this.documentElement); this.defaultView = null; }
  createElement(tagName) { return new ElementShim(this, tagName); }
  createElementNS(namespaceURI, tagName) { const element = new ElementShim(this, tagName); element.namespaceURI = namespaceURI; return element; }
  createTextNode(data) { return new TextShim(this, data); }
  createComment(data) { return new CommentShim(this, data); }
  get activeElement() { return this.body; }
  getElementById(id) { return walkElements(this).find((element) => element.id === id) ?? null; }
}
function walkElements(root) { const elements = []; for (const child of root.childNodes) { if (child instanceof ElementShim) elements.push(child); elements.push(...walkElements(child)); } return elements; }
function getReactProps(node) { const reactKey = Object.keys(node).find((key) => key.startsWith('__reactProps$')); if (!reactKey) throw new Error(`React props key not found for <${node.localName}>`); return node[reactKey]; }
function installDom() {
  const snapshot = { window: globalThis.window, document: globalThis.document, navigator: globalThis.navigator, HTMLElement: globalThis.HTMLElement, Element: globalThis.Element, Node: globalThis.Node, Text: globalThis.Text, Event: globalThis.Event, MouseEvent: globalThis.MouseEvent, requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame, actFlag: globalThis.IS_REACT_ACT_ENVIRONMENT };
  const document = new DocumentShim();
  const existingWindow = globalThis.window;
  const windowShim = { document, location: new URL('https://example.com/app/#/'), navigator: { userAgent: 'component-test' }, localStorage: existingWindow?.localStorage, matchMedia: (query) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }), HTMLElement: ElementShim, HTMLIFrameElement: class HTMLIFrameElement extends ElementShim {}, SVGElement: class SVGElement extends ElementShim {}, Event: EventShim, MouseEvent: EventShim };
  document.defaultView = windowShim;
  Object.defineProperty(globalThis, 'window', { value: windowShim, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'document', { value: document, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'navigator', { value: windowShim.navigator, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'HTMLElement', { value: ElementShim, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'Element', { value: ElementShim, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'Node', { value: NodeShim, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'Text', { value: TextShim, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'Event', { value: EventShim, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'MouseEvent', { value: EventShim, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'requestAnimationFrame', { value: (callback) => setTimeout(() => callback(Date.now()), 0), configurable: true, writable: true });
  Object.defineProperty(globalThis, 'cancelAnimationFrame', { value: (handle) => clearTimeout(handle), configurable: true, writable: true });
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true, writable: true });
  return { document, cleanupGlobals: () => {
    Object.defineProperty(globalThis, 'window', { value: snapshot.window, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'document', { value: snapshot.document, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'navigator', { value: snapshot.navigator, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'HTMLElement', { value: snapshot.HTMLElement, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'Element', { value: snapshot.Element, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'Node', { value: snapshot.Node, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'Text', { value: snapshot.Text, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'Event', { value: snapshot.Event, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'MouseEvent', { value: snapshot.MouseEvent, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'requestAnimationFrame', { value: snapshot.requestAnimationFrame, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'cancelAnimationFrame', { value: snapshot.cancelAnimationFrame, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: snapshot.actFlag, configurable: true, writable: true });
  } };
}
export async function renderWithDom(element) {
  const { document, cleanupGlobals } = installDom();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => { root.render(element); await Promise.resolve(); });
  const bodyText = () => document.body.textContent.replace(/\s+/g, ' ').trim();
  const queryByText = (text, options = {}) => {
    const exact = options.exact ?? false; const needle = text.replace(/\s+/g, ' ').trim();
    return walkElements(document.body).find((element) => { if (options.tagName && element.localName !== options.tagName.toLowerCase()) return false; const normalized = element.textContent.replace(/\s+/g, ' ').trim(); return exact ? normalized === needle : normalized.includes(needle); }) ?? null;
  };
  const findByText = (text, options) => { const match = queryByText(text, options); if (!match) throw new Error(`Element with text not found: ${text}`); return match; };
  const findById = (id) => { const match = document.getElementById(id); if (!match) throw new Error(`Element with id not found: ${id}`); return match; };
  const findByAttribute = (name, value) => { const match = walkElements(document.body).find((element) => element.getAttribute(name) === value); if (!match) throw new Error(`Element with attribute ${name}=${value} not found`); return match; };
  const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve(); await new Promise((resolve) => setTimeout(resolve, 0)); }); };
  const click = async (elementNode) => { const props = getReactProps(elementNode); const handler = props.onClick; if (!handler) throw new Error(`onClick handler not found for <${elementNode.localName}>`); await act(async () => { await handler({ target: elementNode, currentTarget: elementNode, preventDefault() {}, stopPropagation() {} }); }); await settle(); };
  const change = async (elementNode, value) => { const props = getReactProps(elementNode); const handler = props.onChange ?? props.onInput; if (!handler) throw new Error(`onChange/onInput handler not found for <${elementNode.localName}>`); elementNode.value = value; await act(async () => { await handler({ target: elementNode, currentTarget: elementNode }); }); await settle(); };
  const cleanup = async () => { await act(async () => { root.unmount(); await Promise.resolve(); }); cleanupGlobals(); };
  return { document, bodyText, findByText, queryByText, findById, findByAttribute, click, change, settle, cleanup };
}
