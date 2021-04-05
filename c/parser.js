/* jshint sub:true */

export { default as lexer } from '../../tokenize.js';

import * as rules from './rules.js';
export { default as rules } from './rules.js';

export function parse(token_stream) {
  var arrow = { pointer: 0 };
  var parse_tree = rules.translation_unit(token_stream, arrow);
  if(arrow.pointer === token_stream.length) return parse_tree;
  else return null;
}
