import type { RollupOptions } from 'rollup';

const config: RollupOptions = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
};

export default config;
