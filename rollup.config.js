import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import path from 'path';
import { createRequire } from 'module';

// Get plugin name from manifest
const require = createRequire(import.meta.url);
const manifest = require('./manifest.json');
const PLUGIN_NAME = manifest.id;

// Target vault path - update this to your actual vault path
const TARGET_VAULT = path.join(process.env.HOME, 'Documents/Obsidian Vault');

export default {
  input: 'main.ts',
  output: {
    dir: path.join(TARGET_VAULT, `.obsidian/plugins/${PLUGIN_NAME}`),
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
    resolve(),
    commonjs(),
    copy({
      targets: [
        { src: 'manifest.json', dest: path.join(TARGET_VAULT, `.obsidian/plugins/${PLUGIN_NAME}`) },
        { src: 'styles.css', dest: path.join(TARGET_VAULT, `.obsidian/plugins/${PLUGIN_NAME}`) },
        { src: 'versions.json', dest: path.join(TARGET_VAULT, `.obsidian/plugins/${PLUGIN_NAME}`) }
      ],
      verbose: true,
    }),
  ],
  watch: {
    include: ['**/*.ts', '**/*.css', 'manifest.json', 'versions.json'],
  },
};
