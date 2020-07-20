import { Lexer, lexMatch } from './lexer.js';
import { Parser, Node } from './parser.js';
import Util from '../util.js';

const nodeInspect = Symbol.for('nodejs.util.inspect.custom');

export class Rule {
  productions = [];
  fragment = false;
  //grammar = null;

  static Symbol = class Symbol extends Node {
    constructor(str, id) {
      super();
      let terminal = str ? true : false;
      /*if(this.str)*/ this.str = str;
      if(id !== undefined) this.id = id;
      Util.define(this, { terminal });
      //return this;
    }
    toString() {
      if(this.id !== undefined && this.str !== undefined) return Util.colorText(this.str, 1, this.id == Lexer.tokens.REGEXP ? 35 : this.id == Lexer.tokens.STRING ? 36 : 33);

      let str = Util.colorText(this.str, 1, /^['"`]/.test(this.str) ? 36 : 33);
      return `${Util.className(this)}(${str})`;
    }
  };

  static Self = class Self extends Rule.Symbol {
    constructor() {
      super('arguments.callee');
    }
    toString() {
      return 'arguments.callee';
    }
  };

  static Match = class Match extends Array {
    constructor(rule) {
      super();
      if(rule) Util.define(this, { rule });
      return this;
    }
    get [Symbol.species]() {
      return Rule.Match;
    }

    parse(symbols) {
      if(symbols[symbols.length - 1] == Grammar.SKIP) {
        symbols = symbols.slice(0, -1);
        this.skip = true;
        console.log('SKIP!');
      }

      let i = 0;
      for(let sym of symbols) {
        if(i == 0 && sym && sym.str == this.rule.name) {
          sym = new Rule.Self();
          this.selfReferential = true;
          this.rule.selfReferential = true;
        }

        //console.log("sym:", sym);
        this.push(sym);
        i++;
      }
      //if(symbols[0] && symbols[0].str == this.rule.name) console.log('SELF:', this.rule.name, this);
    }

    generate() {
      return this.map(sym => (!sym.generate ? Util.className(sym) : sym.generate())).join(', ');
    }

    [Symbol.for('nodejs.util.inspect.custom')]() {
      return this.toString();
    }

    toString() {
      const { repeat = '', length, invert } = this;
      if(this.length == 1) return `${invert ? '~' : ''}${Util.colorText(this[0], 1, 36)}`;
      return `${Util.colorText(Util.className(this), 1, 31)}(${this.length}) ${invert ? '~' : ''}[ ${this.map(n => /*Util.className(n) + ' ' +*/ n.toString()).join(Util.colorText(' ⏵ ', 1, 30))} ]${repeat}`;
    }
  };
  static Literal = class Literal extends Rule.Symbol {
    constructor(str) {
      super(str);
    }

    toString() {
      return `'${this.str}'`;
    }
  };
  static Operator = class Operator extends Node {
    constructor(op, ...args) {
      super();
      this.op = op;
      this.args = args;
      //return this;
    }

    toString() {
      return `${this.args.length > 1 ? '' : this.op}(` + this.args.map(n => n.toString()).join(' ' + this.op + ' ') + `)`;
    }
  };

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
        m = new Rule.Operator('|', ...match[0]);
        m.rule = this;

        m.parse(match[0]);
      } else {
        m = new Rule.Match(this);
        m.parse(match);
      }

      this.productions.push(m);
    }
  }

  toString(name, multiline) {
    let nl = '',
      sep = ' ';

    if(multiline) (nl = '\n'), (sep = ' | ');
    return `Rule ${this.fragment ? 'fragment ' : ''}${name ? Util.colorText(name, 1, 32) + ' ' : ''}${nl}: ${this.productions.map(l => /* Util.className(l) + ' ' +*/ l.toString()).join(`${nl}${sep}`)}${nl};${nl}`;
  }

  match(parser) {
    let i;
    let r = -1;
    let y = parser.clone();

    for(i = 0; i < this.length; i++) {
      const production = this[i];
      if(production.match(y)) {
        //console.log('production:', production);

        r = i;
        y.copyTo(parser);
        y = parser.clone();
      }

      if(y.tokens.length) console.log('tokens:', y.tokens);
      if(r != -1) break;
    }
    return r;
  }

  static generate(a, f = 'choice', sep = ', ') {
    let s = ``;
    let skip = false;
    const operatorFunctions = {
      '+': 'many',
      '*': 'any',
      '?': 'option',
      '~': 'invert'
    };
    if(f == 'choice' /*|| f == null*/) sep = ',\n  ';
    let cls = Util.className(a);
    //if(a.str && a.str[0] == '[') console.log("a:",(a.str, Util.className(a)), a.id);

    if(a.length == 1 && (f == 'seq' || f == 'choice')) {
      f = null;
      //console.log('f:', a.length, f);
    }
    if(a.id == Lexer.tokens.REGEXP) {
      f = 'regex';
      s = `/${a.str}/g`;
    } else if(a instanceof Rule.Literal) {
      let fn = 'token';
      if(/[\r\n\t\ ]/.test(a.str) || a.str == '\\n' || a.str == '\\r') fn = 'char';
      //console.log("a.str:",a.str);
      //{ f = a.str.length ==1 ? 'char': 'token'; s = a.str ? `'${a.str}'` : a; }
      return (s = a.str.length == 1 ? `${fn}('${a.str}')` : `${fn}('${a.str}')`);
    } else if(a instanceof Rule.Operator) s = Rule.generate(a.args, operatorFunctions[a.op]);
    else if(a instanceof Rule.Match /*|| a instanceof Array*/) {
      //console.log('a:', a);
      if(f == null && a.length > 1) {
        f = 'seq';
        sep = ', ';
      }
      s = a.map(p => Rule.generate(p, p instanceof Rule.Match && p.length > 1 ? 'seq' : null)).join(sep);

      if(a.skip) skip = true;

      if(a.length <= 1) f = null;
    } else if(a instanceof Array) {
      //console.log('arr:', a, f);
      if(f == null && a.length > 1) {
        f = 'seq';
        sep = ', ';
      }
      s = a.map(p => Rule.generate(p, null, sep)).join(sep);
    } else if(cls == 'Symbol' || a instanceof Rule.Symbol) s = a.str;
    else s = `${Util.className(a)}(${a.str ? a.str : a})`;

    if(f == 'x') console.log(Util.className(a), a);

    if(f) s = `${f}(${sep.substring(1)}${s}${sep[1]})`;

    if(s == '') s = 'empty()';

    if(skip) s = `ignore(${s})`;
    return s;
  }

  generate() {
    let s = Rule.generate(this.productions, this.productions.length > 1 ? 'choice' : null, ',\n  ');

    return s;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return Rule.prototype.toString.call(this, this.name, true);
  }
}

export class Grammar {
  rules = new Map();

  static SKIP = Symbol('skip');

  constructor(source, file) {
    let parser = new Parser(new Lexer(source, file));
    Util.define(this, { source, parser });
  }

  addRule(name, productions, fragment) {
    let rule = new Rule(this, fragment);
    rule.name = name;
    //console.log("productions:",productions);
    rule.parse(productions);
    //if(fragment) rule.fragment = fragment;
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
    let r, n;
    let patterns = [];
    while((r = parser.getTok())) {
      //console.log('r', r);
      if(lexMatch(Lexer.tokens.PUNCTUATION, endTok, r)) {
        r.unget();
        break;
      }
      let invert = false;

      if(lexMatch(Lexer.tokens.PUNCTUATION, '~', r)) {
        r = parser.getTok();
        invert = true;
      }

      if(lexMatch(Lexer.tokens.PUNCTUATION, '(', r)) {
        r.unget();
        r = this.parseRule('(', ')');
      } else if(lexMatch(Lexer.tokens.IDENTIFIER, 'EOF', r)) {
        r.str = 'eof()';
      } else if(lexMatch(Lexer.tokens.PUNCTUATION, '->', r)) {
        if((r = parser.matchIdentifier('skip'))) {
          parser.expectIdentifier('skip');
          patterns.push(Grammar.SKIP);
        }
        while((r = parser.getTok())) {
          if(lexMatch(Lexer.tokens.PUNCTUATION, endTok, r)) {
            r.unget();
            break;
          }
        }
        continue;
      }

      if(r instanceof Array) n = new Rule.Operator('|', ...r);
      else if(r.tok == Lexer.tokens.STRING) n = new Rule.Literal(r.str.substring(1, r.str.length - 1));
      else if(r.tok == Lexer.tokens.REGEXP) n = new Rule.Symbol(r.str, r.tok);
      else n = new Rule.Symbol(r.str, r.tok);

      if(parser.matchPunctuation(['*', '?', '+'])) {
        let op = parser.expectPunctuation();
        n = new Rule.Operator(op.str, n);
      }

      if(invert) n = new Rule.Operator('~', n);

      patterns.push(n);
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

  generate() {
    let s = `import { choice, seq, token, char, regex, option, any, many, eof,ignore, concat, invert } from './lib/parse/fn.js';\n\n`;
    let names = [];

    s += `function wrap(parser, name) {
  return (str,pos) => {
    let r = parser(str,pos);
    if(r[0] || name.startsWith('direct')) console.log("matched ("+name+") "+pos+" - " +r[2]+": '", r[1] ,"'");
    return r;
  };
}
`;

    for(let [name, rule] of this.rules) {
      let calls;
      let append;

      //rule.productions = rule.productions.reverse();

      if(rule.selfReferential) {
        let a = [rule.productions.filter(p => !p.selfReferential), rule.productions.filter(p => p.selfReferential).map(m => m.slice(1))];

        {
          let m = new Rule.Match(rule);
          let o = a[1];

          if(o.length > 1) {
            //console.log('o:', o);
            o = new Rule.Operator('|', ...o);
            s;
          }
          o = new Rule.Operator('?', o);

          let e = a[0];
          if(e.length > 1) e = new Rule.Operator('|', ...e);
          m.splice(0, m.length, e, o);
          rule.productions = [m];
          //console.log(':', o);
        }
        /*
{ 
rule.productions = a[0];

 append = new Rule(this);

append.productions = new Rule.Operator('*', new Rule.Operator('|', ...a[1]));

}*/

        //console.log('rule:', rule);
        //console.log('a:', a);
      }

      calls = rule.generate().replace(/\n/g, '\n  ');

      if(append) calls = `seq(${calls}, ${rule.generate()})`;

      s += `function ${name}(...args) {
  return wrap( ${calls}, '${name}' )(...args);
}`;
      //console.log("rule:", rule);
      //
      //console.log("rule:", rule);
      //s += `const ${name} = ` + rule.generate();
      s += `\n\n`;
      names.push(name);
    }
    s += `export default { ${names.join(', ')} };`;
    return s;
  }
}
