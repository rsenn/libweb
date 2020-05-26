import Util from '../util.js';
import { Lexer, lexMatch, lexIsToken } from './lexer.js';

const addUnique = (arr, item) => (arr && arr.indexOf(item) != -1 ? arr || [] : add(arr.item));
const add = (arr, item) => [...(arr || []), item];

export class Parser {
  tokens = [];
  // lexer = null;

  constructor(lexer) {
    Util.define(this, { lexer });
    //this.lexer = lexer;
    return this;
  }
  clone() {
    let { tokens, token, lexer } = this;

    tokens = [...tokens];

    return Object.assign(new Parser(lexer.clone()), { tokens, token });
    //, Object.getPrototypeOf(this));
  }
  copyTo(dst) {
    let { tokens, token, lexer } = this;
    //console.log("copyTo", { parser: this, dst });
    Object.assign(dst, { tokens, token, lexer });
    return dst;
  }
  getTok() {
    let it = this.lexer.next();
    let { value, done } = it;
    if(!done) {
      let { tok, str, unget } = value;
      this.token = { tok, str };
      this.tokens = add(this.tokens, this.token);
      return Util.define({ ...this.token }, { unget });
    }
    return null;
  }
  match(id, s) {
    let value = this.getTok();
    if(value) {
      let { tok, str, unget } = value;
      unget();
      let ok = s === undefined ? lexIsToken(id, value) : lexMatch(id, s, value);
      return ok ? value : null;
    }
  }
  expect(id, s) {
    let { value, done } = this.lexer.next();
    let { tok, str, unget } = value;
    let ok = s === undefined ? lexIsToken(id, value) : lexMatch(id, s, value);
    if(!ok) {
      throw new Error(`Parser.expect ${id} ${Lexer.tokenName(id)} ${s} ${tok} ${Lexer.tokenName(tok)} ${str}`);
    }
    this.tokens = add(this.tokens, this.token);
    return value;
  }
}
