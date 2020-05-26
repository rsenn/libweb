import { Lexer, lexMatch, lexIsToken, lexDump } from './lexer.js';
import Util from '../util.js';

export function Pattern(patterns, shift, match) {
  let i = 0;
  let repeat;
  let ret = this;
  let r = shift();
  let { str, tok } = r;
  if(lexIsToken('STRING', r)) {
    ret.tok = tok;
    ret.str = str;
  } else if(lexIsToken('IDENTIFIER', r)) {
    ret.rule = str;
  } else if(lexIsToken('REGEXP', r)) {
    //str = str.substring(1, str.length - 1);
    let { length } = str;
    //    str = str.replace(/([-.+*^()]|\[|\]|\?)/g, '\\$1');
    let re = new RegExp(str);
    ret.re = re;
    ret.str = str;
    //    return re;
  }
  if(patterns.length && lexMatch('PUNCTUATION', ch => ch === '+' || ch === '*' || ch === '?', patterns[0])) repeat = shift().str;
  if(repeat) ret.repeat = repeat;
  //console.log("Pattern.parse",patterns[0]);
  Object.assign(ret, repeat !== undefined ? { tok, str, repeat } : { tok, str });
  return ret;
}

Pattern.prototype.toString = Pattern.prototype[Symbol.for('nodejs.util.inspect.custom')] = function() {
  return Util.colorText(this.str + (this.repeat ? this.repeat : ''), 1, this.tok == Lexer.tokens.REGEXP ? 35 : this.tok == Lexer.tokens.IDENTIFIER ? 33 : 36);
  return Lexer.tokenName(this.tok) + '( ' + Util.colorText(this.str + (this.repeat ? this.repeat : ''), 1, this.tok == Lexer.tokens.REGEXP ? 35 : this.tok == Lexer.tokens.IDENTIFIER ? 33 : 36) + ' )';
};

export class Match extends Array {
  constructor(rule) {
    super();
    if(rule) Util.define(this, { rule });
    return this;
  }
  parse(matches, ctor = SubMatch) {
    let pattern;
    let invert = false;
    while(matches.length) {
      invert = false;

      if(matches[0].str == '~') {
        invert = matches[0].str;
        matches.shift();

      }
      if(matches[0].length > 0) {
        pattern = new ctor(this.rule).parse(matches.shift(), Match);
if(invert)
        pattern.invert = invert;
        if(matches.length) {
          console.log('matches[0]:', matches[0]);

          if(/[\*\?\+]/.test(matches[0].str)) {
            let sym = matches.shift();

            pattern.repeat = sym.str;
          }
        }
      } else {
        pattern = new Pattern(matches, () => matches.shift(), this);
      }
      this.push(pattern);
    }
    return this;
  }
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toString();
  }
  toString() {
    const { repeat = '', length } = this;
    if(this.length == 1)
      return `${Util.colorText(this[0], 1, 36)}`;
    return `${Util.colorText(Util.className(this),1,31)}(${this.length})[ ${this.join(Util.colorText(' ⏵ ', 1, 30))} ]${repeat}`;
  }
}

export class SubMatch extends Match {
  constructor(rule) {
    super(rule);
  }
  parse(matches, ctor = Match) {
    let pattern;
    for(let match of matches) {
      console.log(`SubMatch parse ${this.rule.grammar.lexer.line}:`, match);

      pattern = new ctor(this.rule).parse(match, SubMatch);
      console.log('pattern', pattern);

      this.push(pattern);
    }
    return this;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toString();
  }
  toString() {
    const { repeat = '', invert = '', length } = this;

    return `${Util.colorText(Util.className(this),1,31)} ${invert ? '~' : ''}( ${this.join(Util.colorText(' | ', 1, 30))} )${repeat}`;
  }
}

export class Rule extends Array {
  constructor(grammar) {
    super();
    if(grammar) Util.define(this, { grammar });
    return this;
  }
  parse(matches) {
    for(let tokens of matches) {
      let match = new Match(this);
      //        console.log("tokens:",tokens);

      match.parse(tokens);
      this.push(match);
    }
  }
  toString(name) {
    return `Rule ${Util.colorText(name, 1, 32)} (${this.length}) [\n  ${this.map(l => l.toString()).join('\n  ')}\n]`;
  }
  [Symbol.for('nodejs.util.inspect   .custom')]() {
    return this.toString();
  }
}

export class Parser {
  constructor(lexer) {
    Util.define(this, { lexer });
    return this;
  }
  getTok() {
    let it = this.lexer.next();
    return it.done ? null : it.value;
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
    return value;
  }
}

export class Grammar extends Parser {
  rules = {};
  constructor(source) {
    super(new Lexer(source));
    Util.define(this, { source });
  }
  addRule(name, matches) {
    let rule = new Rule(this);
    rule.parse(matches);
    this.rules[name] = rule;
    //console.log(this.lexer.line, rule.toString(name));
    // console.log('Rule:\n', name, '\n     :', rule, '\n     ;');
    return rule;
  }
  getRule(name) {
    return this.rules[name];
  }

  parseParentheses() {
    let r;
    let match = [];
    let matches = [];

    const addMatches = () => {
      matches.push(match);
      match = [];
    };

    while((r = this.getTok())) {
      //console.log(`r: ${this.lexer.line}`,r);
      if(r.tok == Lexer.tokens.PUNCTUATION) {
        if(r.str == ';') break;
        if(r.str == '|' || r.str == ')') {
          if(match.length) addMatches();
          if(r.str == '|') continue;
          if(r.str == ')') break;
        }
      }
      match.push(r);
    }
    addMatches();
    //    if(match.length) matches.push(match);
    return matches;
  }

  parseRule(endTok = ';', name) {
    let patterns = [],
      matches = [];
    let i = 0;
    let r;
    let rule;
    let invert;

    const addPatterns = () => {
      matches.push(patterns);
      patterns = [];
    };
    for(; (r = this.getTok()); ) {
      //console.log(`r: ${this.lexer.line}`, r);
      if(lexMatch(Lexer.tokens.PUNCTUATION, ch => ch == endTok || ch == ':' || ch == '|', r)) {
        if(r.str == endTok) {
          console.log("End of rule" , r);
          break;
        } else if(r.str == ':') continue;
        else if(r.str == '|' && patterns.length) {
          addPatterns();
          continue;
        }
      }
      invert = false;
      if(lexMatch(Lexer.tokens.PUNCTUATION, '~', r)) {
              patterns.push(r);
r = this.getTok();
      }
    if(lexMatch(Lexer.tokens.PUNCTUATION, '(', r)) {
        r = this.parseRule(')');
      //  console.log(`parseRule: ${this.lexer.line}`, r);
      }
      patterns.push(r);
      if(this.match(Lexer.tokens.PUNCTUATION, ch => ch == '*' || ch == '?' || ch == '+')) {
        patterns.push(this.getTok());
      }
    }
    addPatterns();
 //   console.log('matches:', matches);

    return matches;
  }

  parseLine() {
    let r;
    let rule;
    this.i = this.i ? this.i + 1 : 1;
    let name = this.getTok();
    if(this.match(Lexer.tokens.PUNCTUATION, ':')) {
      // if(lexMatch(Lexer.tokens.PUNCTUATION, ';', r)) break;

      //if(lexMatch(Lexer.tokens.PUNCTUATION, ':', r)) break;
      let matches = this.parseRule(';');

      rule = this.addRule(name.str, matches);

      console.log('rule:', rule);

      //      if(matches && matches.length) rule = this.addRule(name.str, matches);
    }
  }

  parse() {
    let tok;
    while(true) {
      let match;
      while((match = this.match(Lexer.tokens.COMMENT))) {
        tok = this.getTok();
        //console.log('tok', tok);
      }
      this.parseLine();
      if(this.lexer.eof) break;
      // console.log(`this.lexer.tokIndex ${this.i}`, this.lexer.tokIndex);
    }
  }
}
