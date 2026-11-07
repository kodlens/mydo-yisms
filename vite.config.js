import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import {
    defineConfig
} from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    // server: {
    //     host: '127.0.0.1',
    //     hmr: {
    //         host: '127.0.0.1',
    //     },
    //     watch: {
    //         ignored: ['**/app/**'],
    //     },
    // },

    plugins: [

        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: false,
        }),
        tailwindcss(),
        react(),

    ],
    esbuild: {
        jsx: 'automatic',
    },
});
