import '../css/app.css';

// DON'T import this for now:
// import 'antd/dist/reset.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';

import { App as AntApp, ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

declare global {
  const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'eKabataan';

const antdTheme = {
  token: {
    colorPrimary: '#047857',
    colorInfo: '#047857',
    borderRadius: 6,
  },
  components: {
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
    },
  },
};


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

createInertiaApp({
  title: (title) => `${title} - ${appName}`,

  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob('./pages/**/*.tsx'),
    ),

  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <QueryClientProvider client={queryClient}>
        <StyleProvider layer>
          <ConfigProvider theme={antdTheme}>
            <AntApp>
              <App {...props} />
            </AntApp>
          </ConfigProvider>
        </StyleProvider>,
      </QueryClientProvider>
    );
  },

  progress: {
    color: '#4B5563',
  },
});
