import { Lexer, lexMatch } from './lexer.js';
import { Parser } from './parser.js';
import Util from '../util.js';
import { Match, SubMatch } from './match.js';



export class Rule {
  productions = [];
  fragment = false;
  // grammar = null;

  constructor(grammar, fragment) {
    if(grammar) Util.define(this, { grammar });
    if(fragment) this.fragment = true;
    Util.define(this, { resolved: {}, identifiers: [] });

    return this;
  }

  parse(productions) {
    let match, m;
    while(productions.length) {
      match = productions.shift();

      if(match && match[0] && match[0].length) {
        m = new SubMatch(this);
        m.parse(match[0]);
      } else {
        m = new Match(this);
        m.parse(match);
      }

      this.productions.push(m);
    }
  }

  toString(name, multiline) {
    let nl = '',
      sep = ' ';

    if(multiline) (nl = '\n'), (sep = ' | ');
    return `Rule ${this.fragment ? 'fragment ' : ''}${name ? Util.colorText(name, 1, 32) + ' ' : ''}${nl}: ${this.productions.map(l => l.toString()).join(`${nl}${sep}`)}${nl};${nl}`;
  }

  match(parser) {
    let i;
    let r = -1;
    let y = parser.clone();

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
    return this.toString(this.name, true);
  }
}


export class Grammar {
  rules = new Map();

  constructor(source, file) {
    let parser = new Parser(new Lexer(source, file));
    Util.define(this, { source, parser });
  }

  addRule(name, productions, fragment) {
    let rule = new Rule(this);
    rule.parse(productions);
    if(fragment) rule.fragment = fragment;
    this.rules.set(name, rule);
    rule.name = name;
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
    while((r = parser.getTok())) {
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
    return matches;
  }

  parsePatterns(endTok = [';', '|']) {
    //console.log('parsePatterns', { endTok });
    const { parser } = this;
    let r;
    let patterns = [];
    while((r = parser.getTok())) {
      //console.log('r', r);
      if(lexMatch(Lexer.tokens.PUNCTUATION, endTok, r)) {
        r.unget();
        break;
      }
      if(lexMatch(Lexer.tokens.PUNCTUATION, '(', r)) {
        r.unget();
        r = this.parseRule('(', ')');
      } else if(lexMatch(Lexer.tokens.PUNCTUATION, '->', r)) {
        if(parser.expectIdentifier('skip')) {
          patterns.push('skip');
          continue;
        }
      }
      if(parser.matchPunctuation(['*', '?', '+'])) {
        parser.expectPunctuation();
      }
      patterns.push(r);
    }
    return patterns;
  }

  parseRule(startTok = ':', endTok = ';', name) {
    //console.log('parseRule', { startTok, endTok, name });
    const { parser } = this;
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
    while((r = parser.expectPunctuation([endTok, startTok, '|']))) {
      if(r.str == endTok) break;
      if(r.str == '|' && patterns.length) addPatterns();
      invert = false;
      patterns = this.parsePatterns([endTok, '|']);
      //console.log(parser.token);
    }
    addPatterns();
    return matches;
  }

  resolveRules() {
    for(let [name, rule] of this.rules.entries()) {
      for(let id of rule.identifiers) {
        rule.resolved[id] = this.getRule(id);
      }
    }
  }

  parseLine() {
    const { parser } = this;
    let r;
    let rule;
    let fragment = false;
    this.i = this.i ? this.i + 1 : 1;
    if(parser.matchIdentifier('fragment')) {
      fragment = true;
      parser.expectIdentifier('fragment');
    }
    let name = parser.getTok();
    if(parser.matchPunctuation(':')) {
      let matches = this.parseRule(':', ';', name.str);
      rule = this.addRule(name.str, matches, fragment);
    }
  }

  parse() {
    const { parser } = this;
    let tok;
    while(true) {
      let match;
      while((match = parser.match(Lexer.tokens.COMMENT))) {
        tok = parser.getTok();
      }
      this.parseLine();
      if(parser.lexer.eof) break;
    }
  }
}
