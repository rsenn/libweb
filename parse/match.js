import Util from '../util.js';
import { Lexer } from './lexer.js';
import { Pattern } from './pattern.js';

export class Match extends Array {
  constructor(rule) {
    super();
    if(rule) Util.define(this, { rule });
    return this;
  }
  get [Symbol.species]() {
    return Pattern;
  }

  parse(matches, ctor = SubMatch) {
    let pattern;
    let invert = false,
      match;
    while(matches.length) {
      invert = false;
      match = matches[0];
      if(match && match.tok == Lexer.token.IDENTIFIER) {
        pattern = match.str;
        this.push(pattern);
        match = matches.shift();
      }
      if(matches.length)
        if(Util.isObject(matches[0]) && 'length' in matches[0]) {
          pattern = new ctor(this.rule).parse(matches.shift(), Match);
          if(invert) pattern.invert = invert;
          if(matches && matches.length) {
            if(/[\*\?\+]/.test(matches[0].str)) {
              let sym = matches.shift();
              pattern.repeat = sym.str;
            }
          }
        } else if(matches[0].tok == 2) {
          pattern = matches.shift().str;
        } else {
          pattern = new Pattern(matches, () => matches.shift(), this);
        }
      if(pattern) this.push(pattern);
      pattern = undefined;
    }
    return this;
  }
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toString();
  }
  match(parser) {
    let ret = [];
    let { rule } = this;
    let { grammar } = this.rule;
    let keys = [...grammar.rules.keys()];
    let values = [...grammar.rules.values()];
    let ri = values.indexOf(rule);
    Util.log('rule:', ri);
    let p = parser.clone();
    for(let pattern of this) {
      if(grammar.rules.has(pattern)) {
        let ruleName = pattern;
        Util.log('rule:', ruleName);
        let stack = Util.getCallerStack();
        Util.log('stack:', stack.length);
      }
      if(!pattern) continue;
      if(!pattern.match(p)) {
        ret = false;
        break;
      }
      Util.log('Match.match: ', this, { pattern, p });
      ret.push(pattern);
      p.copyTo(parser);
      p = parser.clone();
    }
    return ret;
  }
  toString() {
    const { repeat = '', length, invert } = this;
    if(this.length == 1) return `${invert ? '~' : ''}${Util.colorText(this[0], 1, 36)}`;
    return `${Util.colorText(Util.className(this), 1, 31)}(${this.length}) ${invert ? '~' : ''}[ ${this.join(Util.colorText(' ⏵ ', 1, 30)
    )} ]${repeat}`;
  }
}

export class SubMatch extends Match {
  constructor(rule) {
    super(rule);
  }
  get [Symbol.species]() {
    return Match;
  }
  parse(matches, ctor = Match) {
    let pattern, match;
    while(matches.length) {
      let invert = false;
      match = matches[0];
      if(match.tok == Lexer.token.PUNCTUATION && match.str == '~') {
        invert = true;
        matches.shift();
      }
      match = matches.shift();
      pattern = new ctor(this.rule).parse(match, SubMatch);
      if(invert) pattern.invert = invert;
      this.push(pattern);
    }
    return this;
  }
  match(parser) {
    return Match.prototype.match.call(this, parser);
  }
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toString();
  }
  toString() {
    const { repeat = '', invert, length } = this;
    return ((false ? `${Util.colorText(Util.className(this), 1, 31)}(${this.length}) ` : '') +
      `${invert ? '~' : ''}( ${this.join(Util.colorText(' | ', 1, 30))} )${repeat}`
    );
  }
}
