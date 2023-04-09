import { colorText, define } from '../misc.js';
import Util from '../util.js';

export class Rule {
  productions = [];
  fragment = false;
  //grammar = null;

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
