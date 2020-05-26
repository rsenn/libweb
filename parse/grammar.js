import { Lexer, lexMatch, lexIsToken, lexDump } from './lexer.js';
import Util from '../util.js';

const addUnique = (arr, item) => (arr && arr.indexOf(item) != -1 ? arr || [] : add(arr.item));
const add = (arr, item) => [...(arr || []), item];

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
    //    str = str.replace(/([-.+*^()]|\[|\]|\?)/g, '\\$1');
    let re = new RegExp(str);
    ret.re = re;
    ret.str = str;
    //    return re;
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

  return (this.invert ? '~' : '') + Util.colorText(str, 1, this.tok == Lexer.tokens.REGEXP ? 35 : this.tok == Lexer.tokens.IDENTIFIER ? 33 : 36) + (this.repeat ? Util.colorText(this.repeat, 1, 34) : '');
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
if(ret)
   console.log('Pattern.match:', { ret, tok1: t, tok2: { tok, str } });

  return null;
};

Pattern.prototype[Symbol.for('nodejs.util.inspect.custom')] = function() {
  return this.toString();
};

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
      //  if(match) console.log('match:', Lexer.tokenName(match.tok), match);
      /*if(match.str == '~') {
        invert = true;
        matches.shift();
        match = matches[0];
      }*/

      if(match && match.tok == Lexer.token.IDENTIFIER) {
        pattern = match.str;
        this.push(pattern);
        match = matches.shift();
      }

      if(matches.length)
        if('length' in matches[0]) {
          pattern = new ctor(this.rule).parse(matches.shift(), Match);
          if(invert) pattern.invert = invert;
          if(matches && matches.length) {
            // console.log('matches[0]:', matches[0]);
            if(/[\*\?\+]/.test(matches[0].str)) {
              let sym = matches.shift();
              pattern.repeat = sym.str;
            }
          }
        } else if(matches[0].tok == 2) {
          pattern = matches.shift().str;
          // console.log('new Rule match:',pattern);
        } else {
          //console.log('new Pattern matches:', matches[0].tok, Lexer.tokenName(matches[0].tok), matches[0].str);

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
    let { grammar} = this.rule;
    let keys =  [...grammar.rules.keys()];
    let values =  [...grammar.rules.values()];
  // console.log("grammar:", grammar.rules.keys());
let ri = values.indexOf(rule);
   console.log("rule:", ri);
    let p = parser.clone();
    for(let pattern of this) {
      if(grammar.rules.has(pattern)/* typeof(pattern) == 'string'*/) {
        let ruleName = pattern;
      //  pattern = grammar.getRule(ruleName);
      console.log("rule:",ruleName);
      let stack = Util.getCallerStack();
      console.log("stack:", stack.length);
      }
      if(!pattern) continue;
      if(!pattern.match(p)) {
        ret = false;
        break;
      }  

          console.log('Match.match: ', this, { pattern, p });

      ret.push(pattern);
      p.copyTo(parser);
      p = parser.clone();
    }
    //if(ret)
    return ret;
  }

  toString() {
    const { repeat = '', length, invert } = this;
    if(this.length == 1) return `${invert ? '~' : ''}${Util.colorText(this[0], 1, 36)}`;
    return `${Util.colorText(Util.className(this), 1, 31)}(${this.length}) ${invert ? '~' : ''}[ ${this.join(Util.colorText(' ⏵ ', 1, 30))} ]${repeat}`;
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
    //console.log('matches', matches);
    let pattern, match;
    while(matches.length) {
      let invert = false;
      match = matches[0];
      if(match.tok == Lexer.token.PUNCTUATION && match.str == '~') {
        invert = true;
        matches.shift();
      }
      match = matches.shift();
      //  console.log(`SubMatch parse ${this.rule.grammar.lexer.line}:`, { match, invert });
      pattern = new ctor(this.rule).parse(match, SubMatch);
      if(invert) pattern.invert = invert;
      //  console.log('pattern', pattern);
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

    return (false ? `${Util.colorText(Util.className(this), 1, 31)}(${this.length}) ` : '') + `${invert ? '~' : ''}( ${this.join(Util.colorText(' | ', 1, 30))} )${repeat}`;
  }
}

export class Rule extends Array {
  constructor(grammar) {
    super();
    if(grammar) Util.define(this, { grammar });
    Util.define(this, { resolved: {}, identifiers: [] });

    return this;
  }

  parse(productions) {
    let match, m;
    while(productions.length) {
      match = productions.shift(); // matches[0];
      /*console.log("match:", match);
      console.log("match.length:", match && match.length);
      console.log("match[0].length:", match && match[0] && match[0].length);*/
      if(match && match[0] && match[0].length) {
        m = new SubMatch(this);
        m.parse(match[0]);
      } else {
        m = new Match(this);
        m.parse(match);
      }
      ///  console.log('Rule.parse match:', m);
      this.push(m);
    }
    // console.log('Rule.parse:', this);
  }

  toString(name, multiline) {
    let nl = '',
      sep = ' ';

    if(multiline) (nl = '\n'), (sep = ' | ');
    return `Rule ${this.fragment ? 'fragment ' : ''}${name ? Util.colorText(name, 1, 32) + ' ' : ''}(${this.length})${nl} : ${this.map(l => l.toString()).join(`${nl}${sep}`)}${nl};${nl}`;
  }

  match(parser) {
    let i;
    let r = -1;
    let  y = parser.clone();

    for(i = 0; i < this.length; i++) {
      const production = this[i];
      if(production.match(y)) {
         console.log('production:', production);
     
        r = i;
y.copyTo(parser);
y = parser.clone();

      }

      if(y.tokens.length) console.log('tokens:', y.tokens);
      if(r != -1) break;
    }
    return r;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toString();
  }
}

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

export class Grammar extends Parser {
  rules = new Map();

  constructor(source, file) {
    super(new Lexer(source, file));
    Util.define(this, { source });
  }
  addRule(name, matches, fragment) {
    // if(name == 'typeSpecifier') console.log('Rule:', name, '     :', matches, '\n     ;');

    let rule = new Rule(this);
    rule.parse(matches);

    // if(name == 'typeSpecifier') console.log('Rule:', name, '     :', rule, '\n     ;');

    if(fragment) rule.fragment = fragment;

    this.rules.set(name, rule);
    //    this.rules[name] = rule;
    //console.log(this.lexer.line, rule.toString(name));
    return rule;
  }

  getRule(name) {
    return this.rules.get(name);
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
          //     console.log("End of rule" , r);
          break;
        } else if(r.str == ':') continue;
        else if(r.str == '|' && patterns.length) {
          addPatterns();
          continue;
        }
      }
      invert = false;
      if(lexMatch(Lexer.tokens.PUNCTUATION, '->', r)) {
        let id = this.getTok();
        if(lexMatch(Lexer.tokens.IDENTIFIER, 'skip', id)) {
          patterns.push(r);
          patterns.push(id);
          continue;
        }
      }

      /*  if(lexMatch(Lexer.tokens.PUNCTUATION, '~', r)) {
        patterns.push(r);
        invert = true;
        r = this.getTok();
      }*/
      if(lexMatch(Lexer.tokens.PUNCTUATION, '(', r)) {
        r = this.parseRule(')');
        //console.log(`parseRule: ${this.lexer.line}`, r);
      }

      patterns.push(r);

      if(this.match(Lexer.tokens.PUNCTUATION, ch => ch == '*' || ch == '?' || ch == '+')) {
        patterns.push(this.getTok());
      }
    }
    addPatterns();
    //console.log('matches:', matches);

    return matches;
  }

  resolveRules() {
    for(let [name, rule] of this.rules.entries()) {
      // for(let match of rule) {
      for(let id of rule.identifiers) {
        rule.resolved[id] = this.getRule(id);
      }
      //  console.log('rule.resolved:', Object.keys(rule.resolved));
    }
  }

  parseLine() {
    let r;
    let rule;
    let fragment = false;
    this.i = this.i ? this.i + 1 : 1;

    if(this.match(Lexer.tokens.IDENTIFIER, 'fragment')) {
      fragment = true;
      this.expect(Lexer.tokens.IDENTIFIER, 'fragment');
    }

    let name = this.getTok();
    if(this.match(Lexer.tokens.PUNCTUATION, ':')) {
      // if(lexMatch(Lexer.tokens.PUNCTUATION, ';', r)) break;

      //if(lexMatch(Lexer.tokens.PUNCTUATION, ':', r)) break;
      let matches = this.parseRule(';');
      // console.log(this.lexer.line + ' matches: ', matches);

      rule = this.addRule(name.str, matches, fragment);

      //console.log(this.lexer.line + ' ' + rule.toString(name.str));
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
