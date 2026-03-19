import { defineConfig } from 'tsup';

export default defineConfig([
    // Core (framework-agnostic)
    {
        entry: { index: 'src/core/index.ts' },
        format: ['cjs', 'esm'],
        dts: true,
        splitting: false,
        sourcemap: true,
        clean: true,
        outDir: 'dist/core',
        treeshake: true,
    },
    // React wrapper
    {
        entry: { index: 'src/react/index.tsx' },
        format: ['cjs', 'esm'],
        dts: true,
        splitting: false,
        sourcemap: true,
        clean: true,
        outDir: 'dist/react',
        external: ['react', 'react-dom', 'react-markdown', 'remark-gfm', 'lucide-react'],
        treeshake: true,
    },
    // Vue wrapper
    {
        entry: { index: 'src/vue/index.ts' },
        format: ['cjs', 'esm'],
        dts: true,
        splitting: false,
        sourcemap: true,
        clean: true,
        outDir: 'dist/vue',
        external: ['vue', 'lucide-vue-next', 'markdown-it'],
        treeshake: true,
    },
]);
