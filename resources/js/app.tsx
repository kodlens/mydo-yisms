import '../css/app.css';
import 'antd/dist/reset.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
//import { initializeTheme } from './hooks/use-appearance';
import { App as AntApp, ConfigProvider } from 'antd';


declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const antdTheme = {
    token: {
        colorPrimary: '#047857',
        colorInfo: '#047857',
        borderRadius: 6,
    },
    components: {
        Button: {
            colorPrimary: '#047857',
            colorPrimaryHover: '#065f46',
            colorPrimaryActive: '#064e3b',
        },
    },
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ConfigProvider theme={antdTheme}>
                <AntApp>
                    <App {...props} />
                </AntApp>
            </ConfigProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
//initializeTheme();
