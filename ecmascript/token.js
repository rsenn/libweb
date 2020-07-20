import Util from '../util.js';

/*
 * Token Definitions
 */
export class Token {
  static types = {
    comment: 'comment',
    stringLiteral: 'stringLiteral',
    templateLiteral: 'templateLiteral',
    numericLiteral: 'numericLiteral',
    booleanLiteral: 'booleanLiteral',
    nullLiteral: 'nullLiteral',
    punctuator: 'punctuator',
    keyword: 'keyword',
    identifier: 'identifier',
    regexpLiteral: 'regexpLiteral',
    eof: 'eof'
  };

  constructor(type, value, position, offset) {
    const token = this;
    this.type = type;
    this.value = value;
    this.position = position;

    //if(this.position.pos === undefined || isNaN(this.position.pos)) this.position.pos = offset;

    this.offset = offset;
    /* this.end = end;F
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
    return this.offset || this.position.start.valueOf();
  }
  get end() {
    return this.start + this.length || this.position.end.valueOf();
  }

  [Symbol.toStringTag]() {
    return this.toString();
  }

  toString() {
    let { type, value, position } = this;

    value = Util.abbreviate(value, 80);

    value = value.replace(/\n/g, '\\n').replace(/\t/g, '\\t');

    if(type == 'identifier') value = Util.colorText(value, 1, 33);
    else if(type == 'keyword') value = Util.colorText(value, 1, 31);
    else if(type == 'comment') value = Util.colorText(value, 1, 32);
    else if(type == 'templateLiteral') value = Util.colorText(value, 1, 35);
    else value = Util.colorText(value, 1, 36);

    return `${position} ${type} ${value}`;
  }
}

export class TokenList extends Array {
  constructor(tokens = []) {
    super();

    if(Util.isArray(tokens)) for(let token of tokens) this.push(token);

    //Array.prototype.splice.call(this, this.length, this.length, ...tokens);
  }

  get [Symbol.isConcatSpreadable]() {
    return true;
  }
  get [Symbol.species]() {
    return TokenList;
  }

  *[Symbol.iterator]() {
    for(let i = 0; i < this.length; i++) yield this[i];
  }

  get first() {
    return this[0];
  }

  get last() {
    return this[this.length - 1];
  }

  get charRange() {
    let range = [this.first.start, this.last.end];
    return range;
  }

  [Symbol.toStringTag]() {
    return this.toString();
  }

  toString() {
    return this.map(tok => (/(literal|identifier)/i.test(tok.type) && /^[^'"]/.test(tok.value) ? '‹' + tok.value + '›' : tok.value)).join(' ');
  }
}

export default Token;
