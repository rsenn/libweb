import { Match, SubMatch } from './match.js';
import Util from '../util.js';

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
    return this.toString();
  }
}
