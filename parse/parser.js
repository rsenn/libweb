import Util from '../util.js';
import { Lexer, lexMatch, lexIsToken } from './lexer.js';

const addUnique = (arr, item) => (arr && arr.indexOf(item) != -1 ? arr || [] : add(arr.item));
const add = (arr, item) => [...(arr || []), item];

export class Node {
  constructor() {
    return this;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toString();
  }

  toString() {
    return Util.className(this);
  }
}

export class NodeList extends Array {
  constructor(nodes) {
    for(let node of [...nodes]) this.push(node);
    return this;
  }
  get [Symbol.species]() {
    return NodeList;
  }
}

export class Parser {
  tokens = [];

  constructor(lexer) {
    Util.define(this, { lexer });
    return this;
  }

  clone() {
    let { tokens, token, lexer } = this;
    tokens = [...tokens];
    return Object.assign(new Parser(lexer.clone()), { tokens, token });
  }

  copyTo(dst) {
    let { tokens, token, lexer } = this;
    Object.assign(dst, { tokens, token, lexer });
    return dst;
  }

  getTok() {
    let { lexer } = this;

    const parser = this;
    if(this.tokIndex < this.tokens.length) return newTok(this.tokens[this.tokIndex]);

    let it = this.lexer.next();
    let { value, done } = it;

    this.prevTok = this.tokens.length;

    if(!done) return newTok(value);

    function newTok(value) {
      let { tok, str } = value;
      const tokIndex = parser.tokens.length;
      let unget = () => {
        value.unget();
        parser.tokens.splice(tokIndex, parser.tokens.length);
        //parser.token = parser.tokens[tokIndex - 1];
      };
      parser.token = { tok, str };
      parser.tokens = add(parser.tokens, parser.token);
      if(tokIndex > parser.prevTok)
        console.log(`Parser.getTok ${parser.position} (${parser.tokens.length - 1})`, parser.token);
      return Util.define({ ...parser.token }, { unget });
    }
    return null;
  }

  get position() {
    return `${this.lexer.line}:${this.lexer.column}`;
  }

  match(id, s) {
    let value = this.getTok();
    if(value) {
      let { tok, str, unget } = value;
      unget();
      let ok = s === undefined ? lexIsToken(id, value) : lexMatch(id, s, value);
      if(!ok) return false;
    }
    return value;
  }

  matchPunctuation = s => this.match(Lexer.tokens.PUNCTUATION, s);
  matchIdentifier = s => this.match(Lexer.tokens.IDENTIFIER, s);
  matchString = s => this.match(Lexer.tokens.IDENTIFIER, s);
  matchNumber = s => this.match(Lexer.tokens.NUMBER, s);
  matchRegex = s => this.match(Lexer.tokens.REGEXP, s);

  expect(id, s) {
    let r = this.match(id, s);
    const { token } = this;
    //console.log('token:', token);

    if(!r)
      throw new Error(`Parser.expect ${this.position} (${Lexer.tokenName(id)}, ${Util.toString(s, {
          multiline: false,
          colors: false
        })})  ${Lexer.tokenName(token.tok)}, ${Util.toString(token.str)}`
      );
    return this.getTok();
  }

  expectPunctuation = s => this.expect(Lexer.tokens.PUNCTUATION, s);
  expectIdentifier = s => this.expect(Lexer.tokens.IDENTIFIER, s);
  expectString = s => this.expect(Lexer.tokens.IDENTIFIER, s);
  expectNumber = s => this.expect(Lexer.tokens.NUMBER, s);
  expectRegex = s => this.expect(Lexer.tokens.REGEXP, s);
}
