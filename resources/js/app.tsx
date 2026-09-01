import '../css/app.css';

// DON'T import this for now:
// import 'antd/dist/reset.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';

import { App as AntApp, ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

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
      <StyleProvider layer>
        <ConfigProvider theme={antdTheme}>
          <AntApp>
            <App {...props} />
          </AntApp>
        </ConfigProvider>
      </StyleProvider>,
    );
  },

  progress: {
    color: '#4B5563',
  },
});
