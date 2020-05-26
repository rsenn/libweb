import { Lexer, lexMatch } from './lexer.js';
import { Parser } from './parser.js';
import { Rule } from './rule.js';
import Util from '../util.js';

export class Grammar extends Parser {
  rules = new Map();

  constructor(source, file) {
    super(new Lexer(source, file));
    Util.define(this, { source });
  }

  addRule(name, matches, fragment) {
    let rule = new Rule(this);
    rule.parse(matches);
    if(fragment) rule.fragment = fragment;
    this.rules.set(name, rule);
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
      if(lexMatch(Lexer.tokens.PUNCTUATION, ch => ch == endTok || ch == ':' || ch == '|', r)) {
        if(r.str == endTok) {
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
      if(lexMatch(Lexer.tokens.PUNCTUATION, '(', r)) {
        r = this.parseRule(')');
      }
      patterns.push(r);
      if(this.match(Lexer.tokens.PUNCTUATION, ch => ch == '*' || ch == '?' || ch == '+')) {
        patterns.push(this.getTok());
      }
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
      let matches = this.parseRule(';');
      rule = this.addRule(name.str, matches, fragment);
    }
  }

  parse() {
    let tok;
    while(true) {
      let match;
      while((match = this.match(Lexer.tokens.COMMENT))) {
        tok = this.getTok();
      }
      this.parseLine();
      if(this.lexer.eof) break;
    }
  }
}
