import Util from '../util.js';

const lexComment = lexer => {
  let s = lexer.source.substring(lexer.start, lexer.pos + 2);
  if(s.startsWith('/*') || s.startsWith('//')) {
    lexer.pos += 2;
    if(s[1] == '*') {
      lexer.lexUntil(/\*\/$/);
      lexer.skip(2);
    } else {
      lexer.lexUntil(/\n$/);
      //lexer.skip(1);
    }
    //console.log('s:', lexer.source.substring(lexer.start, lexer.pos));
    return Lexer.tokens.COMMENT;
  }
};
const lexPreProc = lexer => {
  let s = lexer.source.substring(lexer.start, lexer.pos + 1);
  if(/^\s*#/.test(s)) {
    lexer.start += s.indexOf('#');
    lexer.lexUntil(/\n$/);

    //console.log('s:', lexer.source.substring(lexer.start, lexer.pos));
    return Lexer.tokens.PREPROC;
  }
};

const lexString = lexer => {
  let c = lexer.peek();
  if(/^['"]/.test(c)) {
    lexer.get();
    do {
      let ret;
      lexer.lexUntil(/([^\\]'|\\\\')$/);
      let s = lexer.source.substring(lexer.start, lexer.pos + 1);
      if(s.endsWith(c)) {
        lexer.skip(1);

        break;
      }
      if(ret === -1) break;
      if(s.endsWith('\\\\')) {
        console.log('lexer.source.substring', lexer.source.substring(lexer.pos - 1, lexer.pos + 1));
        lexer.skip();
        continue;
      }
    } while(false);
    return Lexer.tokens.STRING;
  }
};

const lexRegExp = lexer => {
  let s = lexer.source.substring(lexer.start, lexer.start + 2);

  if(/^\./.test(s)) {
    lexer.skip();
    lexer.lexWhile(/[^ ]$/);
    return Lexer.tokens.REGEXP;
  }

  if(/^[\[]/.test(s)) {
    lexer.start = lexer.pos;
    lexer.get();
    do {
      lexer.lexWhile(/.*[^\]]$/);
      lexer.get();
    } while(lexer.peek() == '[');
    if(lexer.peek() == '+') lexer.get();
    if(lexer.peek() == '*') lexer.get();

    return Lexer.tokens.REGEXP;
  }
};

const lexNumber = lexer => {
  if(/^[0-9]/.test(lexer.peek())) {
    lexer.get();
    lexer.lexWhile(/[0-9.]$/);
    return Lexer.tokens.NUMBER;
  }
};

const lexPunctuation = lexer => {
  let s = lexer.source.substring(lexer.start, lexer.pos + 1);
  let c = lexer.peek();

  if(/->$/.test(s)) {
    lexer.skip(2);
    return Lexer.tokens.PUNCTUATION;
  }
  if(/^[-~.<>;,\(\):|+\?*]/.test(s)) {
    lexer.get();
    c = lexer.peek();
    if(s[0] == '-' && c == '>') lexer.get();

    lexer.lexWhile(/^[-~.<>;,\(\):|+\?*]$/);
    //console.log("PUNCT", s);
    return Lexer.tokens.PUNCTUATION;
  }
};

const lexIdentifier = lexer => {
  let c;
  let word = '';
  if(/^[A-Za-z]/.test(lexer.peek())) {
    c = lexer.get();
    word += c;

    for(; (c = lexer.peek()); word += lexer.get()) {
      if(!/[-0-9A-Za-z_]/.test(c)) break;
      //console.log("lexIdentifier: ", word);
    }

    if(/[^-0-9A-Za-z_]$/.test(word)) lexer.pos--;

    //console.log("lexIdentifier: ", lexer.source[lexer.pos-1]);

    let s = lexer.source.substring(lexer.start, lexer.pos);

    let { start, pos, len } = lexer;
    //console.log("lexIdentifier: ", {s,start,pos,len});

    return Lexer.tokens.IDENTIFIER;
  }
};

const lexCond = cond => {
  if(cond instanceof RegExp) {
    let re = cond;
    cond = ch => re.test(ch);
  } else if(cond instanceof Array) {
    let arr = cond;
    cond = ch => arr.indexOf(ch[ch.length - 1]) != -1;
  }
  return cond;
};

export const lexIsToken = Util.curry((id, result) => {
  let ret;

  if(typeof id == 'string') id = Lexer.tokens[id];
  if(typeof id != 'function') {
    let the_id = id;
    id = i => i == the_id;
  }

  ret = id(result.tok);
  return ret;
});

export const lexMatch = Util.curry((id, str, result) => {
  let ret;
  if(typeof id == 'string') id = Lexer.tokens[id];
  if(typeof id != 'function') {
    let the_id = id;
    id = i => i == the_id;
  }

  if(Array.isArray(str)) {
    let the_array = str;
    str = s => the_array.indexOf(s) != -1;
  } else if(typeof str != 'function') {
    let the_str = str;
    str = s => s == the_str;
  }
  ret = id(result.tok) && str(result.str);

  return ret;
});
export const lexDump = result => {
  const { tok, str, unget } = result;
  return `Token ${Lexer.tokenName(tok)} '${str}'`;
};

class Token {
  [Symbol.for('nodejs.util.inspect.custom')]() {
    let str = this.str;

    if(this.tok == Lexer.tokens.STRING) str = str.substring(1, str.length - 1);
    return { tok: Lexer.tokenName(this.tok), str };
  }
  toString() {
    let str = this.str;

    if(this.tok == Lexer.tokens.STRING) str = str.substring(1, str.length - 1);
    return `${Lexer.tokenName(this.tok)} ${str}`;
  }
}

export class Lexer {
  pos = 0;
  len = 0;
  start = 0;
  line = 1;
  column = 1;
  eof = false;
  tok = undefined;

  static tokens = {
    EOF: -1,
    COMMENT: 1,
    PREPROC: 7,
    IDENTIFIER: 2,
    STRING: 3,
    PUNCTUATION: 4,
    NUMBER: 5,
    REGEXP: 6
  };

  static tokenName(i) {
    const tokenNames = Object.entries(this.tokens);
    let token = tokenNames.find(([k, v]) => i == v);
    return token ? token[0] : i;
  }

  static token(obj) {
    Object.setPrototypeOf(obj, Token.prototype);

    let toString = function() {
      return Lexer.tokenName(this.tok) + ' ' + this.str;
    };
    Util.define(obj, { toString });
    return obj;
  }

  static matchers = [
    lexer => {
      lexer.lexWhile(/[ \t]$/);
      lexer.start = lexer.pos;
      if(lexer.eof) return Lexer.EOF;
    },
    lexComment,
    lexString,
    lexRegExp,
    lexNumber,
    lexPunctuation,
    lexIdentifier,
    lexPreProc,
    lexer => {
      lexer.lexWhile(/[ \n\r\t]$/);
      if(lexer.start < lexer.pos) return Lexer.tokens.WHITESPACE;
      if(!(lexer.start < lexer.pos)) {
        console.log(`ERROR file=${lexer.file} pos=${lexer.line}:${lexer.column} start=${lexer.start} pos=${lexer.pos} len=${lexer.len}'${lexer.source.substring(lexer.start, lexer.pos + 1)}'`);
        return 0;
      }
    }
  ];

  constructor(source, file = null) {
    this.pos = 0;
    this.start = 0;
    let tokIndex = -1;
    let len = source.length;

    Util.define(this, {
      source,
      tokIndex,
      file,
      len,
      line: 1,
      column: 1,
      eof: false
    });

    const { pos, start } = this;
    console.log('Lexer.constructor', { file, pos, start, tokIndex, len });
  }

  clone() {
    const { file, source, pos, start, tokIndex, len } = this;

    return Object.setPrototypeOf({ file, source, pos, start, tokIndex, len }, Object.getPrototypeOf(this));
  }

  peek(start = 0, num = 1) {
    if(this.pos == this.len) return -1;
    return this.source.substring(this.pos + start, this.pos + start + num);
  }

  get() {
    if(this.pos == this.len) return -1;

    let c = this.source[this.pos];
    this.pos++;
    if(c == '\n') {
      this.line++;
      this.column = 1;
    }
    return c;
  }

  skip(n = 1) {
    while(n-- > 0) if(this.get() == -1) return -1;
  }
  get position() {
    return `${this.line}:${this.column}`;
  }
  str() {
    return this.source.substring(this.start, this.pos + 1);
  }
  [Symbol.iterator]() {
    return this;
  }

  next() {
    let r;

    const result = (tok, s, done = false) => {
      this.tokIndex++;
      let str = s || (this.pos == this.len ? -1 : this.source.substring(this.start, this.pos));
      let value = Lexer.token({
        tok,
        str
      });
      let unget = () => {
        this.tok = value;
        this.tokIndex--;
      };
      Util.define(value, { unget });
      //console.log(`token ${this.line}:`, value);
      return {
        value,
        done
      };
    };

    if(this.tok !== undefined) {
      r = { value: this.tok, done: false };
      this.tok = undefined;
      this.tokIndex++;

      return r;
    }

    let ret,
      c,
      tok = -1;
    //console.log('next:', this.start, this.pos,this.len, this.eof);

    this.lexWhile(/[ \t\r\n]$/);
    this.start = this.pos;

    if(this.eof) return { done: true };
    if(this.pos == this.len) {
      this.eof = true;
      return { done: true };
    }
    let { start, pos, len } = this;

    this.peek();

    //console.log('this', { start, pos, len });
    let retvals = [];
    let positions = [];

    for(let matcher of Lexer.matchers) {
      positions.push({ start, pos });

      tok = matcher(this);
      retvals.push(tok);

      if(typeof tok == 'number' || tok > 0) break;
    }

    if(tok == Lexer.tokens.COMMENT || tok == Lexer.tokens.PREPROC) {
      //console.log(`skip ${Lexer.tokenName(tok)}:`, this.str());

      return this.next();
    }

    if(tok == -1 || tok === 0) {
      if(tok === 0) console.log('source:', this.source.substring(this.start).split(/\n/g)[0]);

      /*console.log('retvals:', retvals);
      console.log('posisionts:', positions);*/

      return result(tok, null, true);
    }
    let s = this.source.substring(this.start, this.pos);

    r = result(tok, s, this.eof);
    this.start = this.pos;

    return r;
  }

  lexWhile(cond) {
    cond = lexCond(cond);
    let s;
    let c;
    let ret = false;
    do {
      c = this.peek();
      s = this.source.substring(this.start, this.pos + 1);
      ret = cond(s);
      if(!ret) break;
      this.get();
    } while(this.pos < this.len);
    return ret;
  }

  lexUntil(cond) {
    let invCond;
    cond = lexCond(cond);
    invCond = ch => !cond(ch);
    return this.lexWhile(invCond);
  }
}
