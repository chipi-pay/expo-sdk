// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/react/index.ts'],
  format: ['cjs', 'esm'],  // Outputs both CommonJS and ES Modules
  dts: true,               // Generates TypeScript declaration files
  splitting: true,         // Enables code splitting
  sourcemap: true,        // Generates source maps for debugging
  clean: true,            // Cleans dist folder before build
  external: ['react', '@tanstack/react-query', 'starknet'],
  treeshake: true,        // Removes unused code
});