import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ''); // Use process.cwd() for consistency

    // Determine the base path
    const base = mode === 'production' ? '/fraction_addition_visualisation/' : '/';

    console.log(`[vite.config.ts] Mode: ${mode}, Base path set to: ${base}`); // For debugging

    return {
        base: base, // Set the base path here
        define: {
            // Regarding GEMINI_API_KEY:
            // If this key is ONLY for local development and NOT needed for the deployed build,
            // you might consider removing these lines or ensuring env.GEMINI_API_KEY is undefined in production.
            // If it IS needed and safe to be client-side, it's fine.
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});