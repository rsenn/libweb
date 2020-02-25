'use strict';

/*
 * Token Definitions
 */
class Token {
  constructor(type, value, from, to, pos) {
    const token = this;
    this.type = type;
    this.value = value;
    this.from = from;
    this.to = to;
    const delta = to - from - 1;
    this.pos = {
      column: pos ? pos.column : 0,
      line: pos ? pos.line : 0,
      toString() {
        let s = this.line + ':' + this.column;
        if(delta > 0) s += '-' + (this.column + delta);
        return s;
      }
    };
  }
}

const tokenTypes = {
  comment: 'comment',
  stringLiteral: 'stringLiteral',
  numericLiteral: 'numericLiteral',
  booleanLiteral: 'booleanLiteral',
  nullLiteral: 'nullLiteral',
  punctuator: 'punctuator',
  keyword: 'keyword',
  identifier: 'identifier',
  regexpLiteral: 'regexpLiteral',
  eof: 'eof'
};

exports.Token = Token;
exports.tokenTypes = tokenTypes;
