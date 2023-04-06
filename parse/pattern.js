import { Lexer, lexMatch, lexIsToken } from './lexer.js';
import Util from '../util.js';

export function Pattern(patterns, shift, match) {
  let i = 0;
  let repeat;
  let ret = this;
  let r = shift();
  let { str, tok } = r;
  if(lexIsToken('STRING', r)) {
    ret.tok = tok;
    str = str.substring(1, str.length - 1);
    ret.str = str;
  } else if(lexIsToken('IDENTIFIER', r)) {
    console.log('Pattern ', Lexer.tokenName(r.tok), r.str);

    ret.rule = str;

    match.rule.identifiers = addUnique(match.rule.identifiers, str);
  } else if(lexIsToken('REGEXP', r)) {
    //str = str.substring(1, str.length - 1);
    let { length } = str;
    //str = str.replace(/([-.+*^()]|\[|\]|\?)/g, '\\$1');
    let re = new RegExp(str);
    ret.re = re;
    ret.str = str;
    //return re;
  }
  ret.type = tok;
  if(patterns.length && lexMatch('PUNCTUATION', ch => ch === '+' || ch === '*' || ch === '?', patterns[0])) repeat = shift().str;
  if(repeat) ret.repeat = repeat;
  //console.log("Pattern.parse",patterns[0]);
  Object.assign(ret, repeat !== undefined ? { tok, str, repeat } : { tok, str });
  return ret;
}

Pattern.prototype.toString = function() {
  let { tok, str } = this;
  if(tok == Lexer.tokens.STRING) str = "'" + str + "'";

  return (
    (this.invert ? '~' : '') + Util.colorText(str, 1, this.tok == Lexer.tokens.REGEXP ? 35 : this.tok == Lexer.tokens.IDENTIFIER ? 33 : 36) + (this.repeat ? Util.colorText(this.repeat, 1, 34) : '')
  );
};

Pattern.prototype.match = function(parser) {
  let y = parser.clone();
  let lexer = y.lexer;

  let t = y.getTok();
  let tokName = Lexer.tokenName(this.type);
  let pattern = this;

  let { tok, str } = this;
  let ret = null;
  if(this.tok >= 2 && this.tok <= 3 && t.tok >= 2 && t.tok <= 3) {
    if(this.str == t.str) {
      ret = t;
      y.copyTo(parser);
    }
  }
  if(ret) console.log('Pattern.match:', { ret, tok1: t, tok2: { tok, str } });

  return null;
};

Pattern.prototype[Symbol.for('nodejs.util.inspect.custom')] = function() {
  return this.toString();
};
