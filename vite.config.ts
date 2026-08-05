import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        plugins: [react(), tailwindcss()],
        // resolve: {
        //     dedupe: ['react', 'react-dom'],
        // },
        optimizeDeps: {
            exclude: ['@rssa-project/study-template'],
            include: ['@headlessui/react', '@react-aria/interactions', '@react-aria/utils', 'react-dom'],
        },
        build: {
            outDir: 'dist',
        },
        server: {
            port: 3360,
        },
    };
});
