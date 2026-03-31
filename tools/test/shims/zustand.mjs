import { useSyncExternalStore } from 'react';

export function create(initializer) {
  let state;
  const listeners = new Set();

  const getState = () => state;
  const setState = (partial, replace = false) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = replace ? nextState : { ...state, ...nextState };
    listeners.forEach((listener) => listener());
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const api = { getState, setState, subscribe };
  state = initializer(setState, getState, api);

  function useStore(selector = (value) => value) {
    return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
  }

  Object.assign(useStore, api);
  return useStore;
}
