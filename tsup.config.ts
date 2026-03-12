import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'parse/index': 'src/parse/index.ts',
    'stringify/index': 'src/stringify/index.ts',
    'url/index': 'src/url/index.ts',
    'compat/index': 'src/compat/index.ts',
    'utils/index': 'src/utils/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
})
