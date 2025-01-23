import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer'; 
import removeConsole from 'vite-plugin-remove-console';
// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        plugins: [
            vue(),
            removeConsole(),
            visualizer({  // Adiciona o visualizer como plugin
                open: true,  // Abre o relatório automaticamente após o build
                filename: 'stats.html',  // Gera o relatório de análise
                gzipSize: true,  // Inclui o tamanho gzip do bundle no relatório
                brotliSize: true  // Inclui o tamanho brotli no relatório
            })
        ],
        base: '/',
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        }
    };
});
