import { Lexer, lexMatch } from './lexer.js';
import { Parser, Node } from './parser.js';
import Util from '../util.js';

const nodeInspect = Symbol.for('nodejs.util.inspect.custom');

export class Rule {
  productions = [];
  fragment = false;
  //grammar = null;

  static Symbol = class Symbol extends Node {
    constructor(str, id, rule) {
      super();
      let terminal = !!str;
      /*if(this.str)*/ this.str = str;
      if(id !== undefined) this.id = id;

      Util.define(this, { terminal /*, rule*/ });
      this.rule = rule;
      //return this;
    }

    clone() {
      const { str, id, rule } = this;
      return new Rule.Symbol(str, id, rule);
    }

    toString() {
      if(this.id !== undefined && this.str !== undefined)
        return Util.colorText(this.str,
          1,
          this.id == Lexer.tokens.REGEXP ? 35 : this.id == Lexer.tokens.STRING ? 36 : 33
        );

      let str = Util.colorText(this.str, 1, /^['"`]/.test(this.str) ? 36 : 33);
      return `${Util.className(this)}(${str})`;
    }

    toCowbird() {
      return [this.id == Lexer.tokens.REGEXP ? this.str : `<${this.str}>`];
    }
  };

  static Self = class Self extends Rule.Symbol {
    constructor(rule) {
      super('arguments.callee', (rule && rule.name) || 'arguments.callee', rule);
    }

    clone() {
      const { rule } = this;
      return new Rule.Self(rule);
    }

    toString() {
      return Util.colorText('Self', 0, 36) || 'arguments.callee';
    }

    toCowbird() {
      return ['<this>'];
    }

    [Symbol.for('nodejs.util.inspect.custom')]() {
      return Util.colorText('Self', 0, 36);
    }
  };

  static Match = class Match extends Array {
    constructor(rule, ...args) {
      super(...args);
      /*if(rule)*/ Util.define(this, { rule });
      if(args.constructor == Array && args.length == 1) return Util.define(args[0], { rule });

      //      this.splice(0, this.length, ...args);
      return this;
    }

    clone(pred = (p, i) => true) {
      const { rule } = this;
      let ret = new Rule.Match(rule);
      ret.splice(0, ret.length, ...this.filter(pred));
      return ret;
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
      const { repeat = '', length, invert } = this;
      if(this.length == 1) return `${invert ? '~' : ''}${Util.colorText(this[0], 1, 36)}`;
      return `${Util.colorText(Util.className(this), 1, 31)}(${this.length}) ${
        invert ? '~' : ''
      }[ ${this.map(n => {
        /*Util.className(n) + ' ' +*/

        if(!n[Symbol.for('nodejs.util.inspect.custom')])
          throw new Error(`Symbol.for('nodejs.util.inspect.custom') ${Util.className(n)} ${n}`);

        return n[Symbol.for('nodejs.util.inspect.custom')]();
      }).join(Util.colorText(' ⏵ ', 1, 30))} ]${repeat}`;
    }

    toString() {
      const { repeat = '', length, invert } = this;
      if(this.length == 1) return `${invert ? '~' : ''}${Util.colorText(this[0], 1, 36)}`;
      return `${Util.colorText(Util.className(this), 1, 31)}(${this.length}) ${
        invert ? '~' : ''
      }[ ${this.map(n => /*Util.className(n) + ' ' +*/ n.toString()).join(Util.colorText(' ⏵ ', 1, 30)
      )} ]${repeat}`;
    }

    /*   *entries() {
      for(let match of this) yield [Util.className(match), match];
    }*/

    combinations() {
      let operators = new Map([...this].reduce(
          (a, part, i) =>
            part instanceof Rule.Operator && '?*'.indexOf(part.op) != -1
              ? [...a, [i, 1 << a.length]]
              : a,
          []
        )
      );
      if(operators.size == 0) return [this];
      console.log('Match operators:', operators, [...this]);
      let n = Math.pow(2, operators.size);
      let r = [];

      for(let i = 0; i < n; i++) {
        let match = new Rule.Match(this.rule);

        for(let j = 0; j < this.length; j++) {
          if(!operators.has(j)) {
            match.push(this[j]);
            continue;
          }
          let flag = operators.get(j);
          if(!(i & flag)) continue;

          let part = this[j].clone();

          if(part.op == '*') {
            part.op = '+';
            match.push(part);
            continue;
          }
          console.log(`part.args ${i & flag}:`, part.args);
          match.splice(match.length, 0, ...part.args);
        }
        console.log(`Match combinations [${i}]:`, match);
        r.push(match);
      }
      console.log('Match combinations:', r);
      return r;
    }

    toCowbird(accu, combinations = true) {
      //      console.log('Match array:', [...this].map(Util.toPlainObject));
      if(combinations) {
        return this.combinations().map(match => match.toCowbird(accu, false));
      }
      let matches = this.filter(m => m.str != 'eof()').map(rule => {
        if(!rule.toCowbird)
          throw new Error(`toCowbird ${Util.className(rule)} ${Util.toString(rule)}`);
        return rule.toCowbird(accu, false);
      });
      console.log('matches:', matches);
      return matches.join(' ');
    }
  };

  static Literal = class Literal extends Rule.Symbol {
    constructor(str, rule) {
      super(str, undefined, rule);
    }

    clone() {
      const { str, rule } = this;
      return new Rule.Literal(str, rule);
    }

    toString() {
      return `'${this.str}'`;
    }

    toCowbird(accu) {
      return [Util.escapeRegex(this.str)];
    }
  };

  static Operator = class Operator extends Node {
    constructor(op, rule, ...args) {
      super();
      this.op = op;
      this.args = args;
      Util.define(this, { rule });
      //return this;
    }

    toString() {
      return (`${this.args.length > 1 ? '' : this.op}(` +
        this.args.map(n => n.toString()).join(' ' + this.op + ' ') +
        `)`
      );
    }

    clone() {
      const { op, rule, args } = this;
      return new Rule.Operator(op, rule, ...args);
    }

    toCowbird(accu, name) {
      let { args } = this;
      let { grammar } = this.rule || {};
      let ret = [];

      if(args.length == 1 && args[0].constructor === Array) args = args[0];

      if(this.op == '|' && args.length > 1) {
        //console.log("this.rule =", this.rule, Util.isObject(this.rule), !(this.rule === null)) ;
        let subname =
          (name || 'rule') +
          '_' +
          (Util.isObject(this.rule)
            ? (this.rule.n = (this.rule.n ? this.rule.n : 0) + 1)
            : Util.randStr(8));

        args = args.map(arg => (arg instanceof Array && arg.length == 1 ? arg[0] : arg));

        console.log('args:', args, args.map(Util.toPlainObject));
        let rule = Rule.from(args, grammar);

        accu.push(rule.toCowbird(accu, subname));
        return [`<${subname}>`];
      } else if(args.length == 1) {
        if(!args[0].toCowbird)
          throw new Error(`toCowbird ${Util.className(args[0])} ${Util.toString(args[0])}`);
        ret = ret.concat(args[0].toCowbird(accu));
      }
      let op = this.op == '+' ? '\\+' : this.op;
      return ret.map(str =>
        typeof str == 'string' && str.startsWith('<') ? `${str} ${op}` : str + op[op.length - 1]
      );
    }
  };

  constructor(grammar, fragment) {
    if(grammar) Util.define(this, { grammar });
    if(fragment) this.fragment = true;
    Util.define(this, { resolved: {}, identifiers: [] });

    return this;
  }

  static from(array, grammar) {
    let rule = new Rule(grammar);
    rule.productions.splice(0, 0, ...array);
    return rule;
  }

  parse(productions) {
    let match, m;
    while(productions.length) {
      match = productions.shift();

      if(match && match[0] && match[0].length) {
        m = new Rule.Operator('|', this, ...match[0]);
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

    if(multiline) (nl = '\n\t'), (sep = ' | ');
    return `Rule ${this.fragment ? 'fragment ' : ''}${
      name ? Util.colorText(name, 1, 32) + ' ' : ''
    }${nl}: ${this.productions.map(l => l.toString()).join(`${nl}${sep}`)}${nl};${nl}`;
  }

  toCowbird(accu, name) {
    let a = [];
    for(let production of this) {
      let p = production;
      if(!p.toCowbird) throw new Error(`toCowbird ${Util.className(p)} ${Util.toString(p)}`);

      let productions = /*!p.toCowbird ? p.toString() :*/ p.toCowbird(accu);

      let c = Util.className(p);
      a = a.concat(productions);
    }
    return [name, a.map(part => new RegExp(part))];
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
      s = a
        .map(p => Rule.generate(p, p instanceof Rule.Match && p.length > 1 ? 'seq' : null))
        .join(sep);

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

  [Symbol.iterator]() {
    return this.productions[Symbol.iterator]();
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

      if(r instanceof Array) {
        if(r.every(isCharMatch)) {
          n = new Rule.Symbol(toRegExp(r, invert), Lexer.tokens.REGEXP, null);
          invert = false;
        } else {
          n = new Rule.Operator('|', null, ...r);
        }
      } else if(r.tok == Lexer.tokens.STRING) {
        n = new Rule.Literal(r.str.substring(1, r.str.length - 1), null);
      } else if(r.tok == Lexer.tokens.REGEXP) {
        n = new Rule.Symbol(r.str, r.tok, null);
      } else {
        if(r.tok == Lexer.tokens.IDENTIFIER) {
          if(/-/.test(r.str)) r.str = Util.camelize(r.str);
        }
        n = new Rule.Symbol(r.str, r.tok, null);
      }
      if(parser.matchPunctuation(['*', '?', '+'])) {
        let op = parser.expectPunctuation();
        n = new Rule.Operator(op.str, null, n);
      }

      if(invert) n = new Rule.Operator('~', null, n);

      patterns.push(n);
    }

    function isCharMatch(m) {
      if(m instanceof Array) {
        if(m.length == 3 && m[1].str == '..') return isCharMatch(m[0]) && isCharMatch(m[2]);
        if(m.length == 1) return isCharMatch(m[0]);
      } else if(typeof m == 'string') {
        return m.length == 1 || (m.length == 2 && m[0] == '\\');
      } else if(Util.isObject(m) && 'str' in m) {
        return isCharMatch(m.str);
      }
      return false;
    }

    function toRegExp(a, invert = false) {
      return ('[' +
        (invert ? '^' : '') +
        a
          .map(m => {
            m = m.map(tok => tok.str);
            if(m.length == 3 && m[1] == '..')
              return `${Util.escapeRegex(m[0])}-${Util.escapeRegex(m[2])}`;
            if(m.length == 1) return m[0].length == 1 ? Util.escapeRegex(m[0]) : m[0];
          })
          .join('') +
        ']'
      );
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
      let { str } = name;
      if(/-/.test(str)) str = Util.camelize(str);
      let matches = this.parseRule(':', ';', str);
      rule = this.addRule(str, matches, fragment);
      matches.forEach(m => Util.define(m, { rule }));
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

  generate(dir = '../parse/') {
    let s = `import { choice, seq, token, char, regex, option, any, many, eof, ignore, concat, invert } from '${dir}fn.js';\n\n`;
    let names = [];

    s += `function wrap(parser, name) {
  return (str,pos) => {
    let r = parser(str,pos);
    if(r[0] || name.startsWith('direct')) console.log("matched (" + name + ") " + pos + " - " + r[2] + ": '", r[1] , "'");
    return r;
  };
}
`;
    for(let [name, rule] of this.rules) {
      let calls;
      let append;
      if(rule.selfReferential) {
        let a = [
          rule.productions.filter(p => !p.selfReferential),
          rule.productions.filter(p => p.selfReferential).map(m => m.slice(1))
        ];
        {
          let m = new Rule.Match(rule);
          let o = a[1];
          if(o.length > 1) {
            o = new Rule.Operator('|', ...o);
            s;
          }
          o = new Rule.Operator('?', o);
          let e = a[0];
          if(e.length > 1) e = new Rule.Operator('|', ...e);
          m.splice(0, m.length, e, o);
          rule.productions = [m];
        }
      }
      calls = rule.generate().replace(/\n/g, '\n  ');
      if(append) calls = `seq(${calls}, ${rule.generate()})`;
      s += `function ${name}(...args) {
  return wrap( ${calls}, '${name}' )(...args);
}`;
      s += `\n\n`;
      names.push(name);
    }
    s += `export default { ${names.join(', ')} };\n`;
    return s;
  }

  toCowbird() {
    let accu = [];
    for(let [name, rule] of this.rules) {
      accu.push(rule.toCowbird(accu, name));
    }
    return Object.fromEntries(accu);
  }
}
