import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifest: {
        name: 'hint',
        description: 'An AI assistant for writing prompts:',
        version: '1.0.1',
        permissions: ['storage'],
    }
});
