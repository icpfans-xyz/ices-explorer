import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import reactRefresh from '@vitejs/plugin-react-refresh'
import tsconfigPaths from 'vite-tsconfig-paths'
import usePluginImport from 'vite-plugin-importer'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        reactRefresh(), 
        tsconfigPaths(),
        usePluginImport({
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: 'css',
        }),
    ],
    css: {
        preprocessorOptions: {
            less: {
            // 支持内联 JavaScript
                javascriptEnabled: true,
            }
        }
    },
})
