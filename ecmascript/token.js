/*
 * Token Definitions
 */
export class Token {
  static types = {
    comment: "comment",
    stringLiteral: "stringLiteral",
    numericLiteral: "numericLiteral",
    booleanLiteral: "booleanLiteral",
    nullLiteral: "nullLiteral",
    punctuator: "punctuator",
    keyword: "keyword",
    identifier: "identifier",
    regexpLiteral: "regexpLiteral",
    eof: "eof"
  };

  constructor(type, value, start, end, pos) {
    const token = this;
    this.type = type;
    this.value = value;
    this.start = start;
    this.end = end;
    this.pos = pos;
    const delta = end - start - 1;
    this.position = {
      column: pos ? pos.column : 0,
      line: pos ? pos.line : 0,
      [Symbol.toStringTag]() {
        return this.toString();
      },
      toString() {
        let s = this.line + ":" + this.column;
        if(delta > 0) s += ` len=${delta + 1}`;
        return s;
      }
    };
  }
}

export default Token;
