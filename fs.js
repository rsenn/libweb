import { isString } from './misc.js';

export function readFileSync(file, options = {}) {
  options = isString(options) ? { encoding: options } : options;
  options ??= {};
}