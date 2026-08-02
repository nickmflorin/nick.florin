import base from './configs/base.mjs';
import ignores from './configs/ignores.mjs';
import importConfig from './configs/import.mjs';
import jest from './configs/jest.mjs';
import jsdoc from './configs/jsdoc.mjs';
import json from './configs/json.mjs';
import node from './configs/node.mjs';
import perfectionist from './configs/perfectionist.mjs';
import prettier from './configs/prettier.mjs';
import react from './configs/react.mjs';
import stylistic from './configs/stylistic.mjs';
import typescript from './configs/typescript.mjs';
import unicorn from './configs/unicorn.mjs';
import yml from './configs/yml.mjs';

/**
 * Defines the base ESLint configuration that the project extends from.  The order of the
 * configurations in this array matters, and is important; only reorder configurations if you
 * understand the implications of doing so.
 *
 * Usually, the {@link prettier} configuration should be after all other configurations to ensure
 * that "eslint-plugin-prettier" can effectively turn off rules that may conflict with formatting
 * routines defined by Prettier.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  { ignores },
  ...base,
  ...unicorn,
  ...typescript,
  ...importConfig,
  ...jsdoc,
  ...node,
  ...perfectionist,
  ...yml,
  ...json,
  ...jest,
  ...react,
  ...prettier,
  ...stylistic,
];
