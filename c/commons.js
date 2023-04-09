import { clone } from '../misc.js';
/*jshint sub:true*/
import Util from '../util.js';

export function EPSILON(token_stream, arrow) {
  return { title: 'EPSILON' };
}

export function TERMINAL(token_stream, arrow, tok) {
  if(token_stream.length <= arrow.pointer) return null;
  else {
    if(token_stream[arrow['pointer']].tokenClass == tok) {
      return token_stream[arrow['pointer']++];
    } else {
      return null;
    }
  }
}

export function iterate_over_rules(token_stream, arrow, rules, node) {
  var new_arrow = Util.clone(arrow);
  for(var i = 0; i < rules.length; i++) {
    rules[i](token_stream, new_arrow, node);
    if(node['children'].length > 0) {
      arrow['pointer'] = new_arrow['pointer'];
      break;
    } else {
      new_arrow['pointer'] = arrow['pointer'];
    }
  }
}
