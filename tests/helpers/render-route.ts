import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';

interface RenderRouteOptions {
  path: string;
  routePath?: string;
  page: ReactElement;
}

export function renderRouteWithShell({ path, routePath = path, page }: RenderRouteOptions): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(
        Routes,
        null,
        createElement(
          Route,
          { element: createElement(AppShell) },
          createElement(Route, { path: routePath, element: page }),
        ),
      ),
    ),
  );
}
