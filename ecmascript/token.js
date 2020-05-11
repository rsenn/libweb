import Util from "../util.js";

/*
 * Token Definitions
 */
export class Token {
  static types = {
    comment: "comment",
    stringLiteral: "stringLiteral",
    templateLiteral: "templateLiteral",
    numericLiteral: "numericLiteral",
    booleanLiteral: "booleanLiteral",
    nullLiteral: "nullLiteral",
    punctuator: "punctuator",
    keyword: "keyword",
    identifier: "identifier",
    regexpLiteral: "regexpLiteral",
    eof: "eof"
  };

  constructor(type, value, position) {
    const token = this;
    this.type = type;
    this.value = value;
    this.position = position;

    /* this.end = end;
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
    };*/
  }

  get length() {
    return this.position.length;
  }
  get start() {
    return this.position.pos;
  }
  get end() {
    return this.position.pos + this.length;
  }

  toString() {
    let { type, value, position } = this;
    value = Util.abbreviate(value, 80);
    if(type == "stringLiteral") value = `'${value}'`;
    else if(type == "templateLiteral") value = "`" + value + "`";
    if(type == "identifier") value = Util.colorText(value, 1, 33);
    else if(type == "keyword") value = Util.colorText(value, 1, 31);
    else if(type == "comment") value = Util.colorText(value, 1, 32);
    else if(type == "templateLiteral") value = Util.colorText(value, 1, 35);
    else value = Util.colorText(value, 1, 36);

    return `${position} ${type} ${value}`;
  }
}

export default Token;
