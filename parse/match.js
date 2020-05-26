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
    let { grammar } = this.rule;
    let keys = [...grammar.rules.keys()];
    let values = [...grammar.rules.values()];
    // console.log("grammar:", grammar.rules.keys());
    let ri = values.indexOf(rule);
    console.log('rule:', ri);
    let p = parser.clone();
    for(let pattern of this) {
      if(grammar.rules.has(pattern) /* typeof(pattern) == 'string'*/) {
        let ruleName = pattern;
        //  pattern = grammar.getRule(ruleName);
        console.log('rule:', ruleName);
        let stack = Util.getCallerStack();
        console.log('stack:', stack.length);
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
