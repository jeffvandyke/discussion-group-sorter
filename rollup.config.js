import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: './main.ts',
    output: {
        file: 'main.js',
        format: 'cjs',
    },
    plugins: [typescript(), commonjs()],
    external: ['lodash', 'crypto', 'fs/promises', 'csv-parse/sync', 'xlsx']
}
