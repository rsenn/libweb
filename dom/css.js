import Util from '../util.js';
import { Element } from './element.js';

const getStyleMap = (obj, key) => {
  let rule = Util.find(obj, item => item.selectorText == key);
  return Util.adapter(rule,
    obj => (obj && obj.styleMap && obj.styleMap.size !== undefined ? obj.styleMap.size : 0),
    (obj, i) => [...obj.styleMap.keys()][i],
    (obj, key) =>
      obj.styleMap
        .getAll(key)
        .map(v => String(v))
        .join(' ')
  );
};
const getStyleSheet = (obj, key) => {
  let sheet = obj.cssRules ? obj : Util.find(obj, entry => entry.href == key || entry.ownerNode.id == key) || obj[key];

  return Util.adapter(sheet.rules,
    obj => (obj && obj.length !== undefined ? obj.length : 0),
    (obj, i) => obj[i].selectorText,
    getStyleMap
  );
};

export class CSS {
  static get document() {
    return CSS.getDocument();
  }

  static getDocument = Util.memoize(() =>
    Util.tryCatch(() => window.document,
      d => (console.log('document:', d), d)
    )
  );

  static list = Util.memoize(doc => {
    if(!doc) doc = this.document;
    let adapter = Util.adapter([...doc.styleSheets],
      obj => obj.length,
      (obj, i) => obj[i].href || obj[i].ownerNode.id || i,
      getStyleSheet
    );

    return [...adapter].map(([file, stylesheet]) => ({ file, stylesheet }));
  });

  static styles(stylesheet) {
    let ret;

    if(Util.isObject(stylesheet) && stylesheet.cssRules !== undefined) ret = getStyleSheet(stylesheet);
    else {
      ret = [...CSS.list()];
      ret =
        typeof stylesheet == 'number'
          ? ret[stylesheet]
          : ret.find((item, i) => i === stylesheet || item.file === stylesheet);

      if(ret) ret = ret.stylesheet;
    }

    console.log('ret:', ret);

    /*
    list.forEach(s =>
        [...(s.cssRules || s.rules)].forEach(rule => {
        ret.push(rule.cssText);
      })
    );*/
    return ret;
  }

  static classes(selector = '*') {
    return Util.unique([...Element.findAll(selector)]
        .filter(e => e.classList.length)
        .map(e => [...e.classList])
        .flat()
    );
  }

  static section(selector, props) {
    let s = `${selector} {\n`;
    for(let [name, value] of props) {
      s += `  ${Util.decamelize(name)}: ${value};\n`;
    }
    s += `}\n`;
    return s;
  }

  static parse(str) {
    let css = new Map();
    for(let [wholeRule, selectors, body] of Util.matchAll(/([^{]*)\s*{\s*([^}]*)}?/gm, str)) {
      selectors = selectors.split(/,\s*/g).map(s => s.trim());
      let rule = new Map();

      for(let [wholeDeclaration, name, value] of Util.matchAll(/([^:]*)\s*:\s*([^;]*);?/gm, body)) {
        rule.set(name.trim(), value.trim());
      }
      css.set(selectors, rule);
    }
    return css;
  }

  static match(stylesheet, selector) {
    if(typeof selector == 'string') selector = selector.split(/\s+/g);
    let ret = new Map();
    for(let [selectors, rule] of stylesheet) {
      if(typeof selectors == 'string') selectors = selectors.split(/,\s*/g).map(s => s.trim().split(/\s+/g));

      if(selectors.some(s => Util.equals(s, selector))) ret = Util.merge(ret, rule);
      //       ret.push([selectors,rule]);
    }
    return new Map(ret);
  }

  static format(css) {
    let out = '';
    for(let [selectors, rules] of css) {
      out += selectors.join(', ');
      out += ' {\n';

      for(let [name, value] of rules) out += `  ${name}: ${value};\n`;
      out += '}\n';
    }
    return out;
  }

  static create(parent = 'head') {
    parent = typeof parent == 'string' ? Element.find(parent) : parent;
    const element = Element.create('style', {}, parent);
    const proto = {
      element: null,
      map: null,
      set(selector, props) {
        const exists = this.map.has(selector);
        this.map.set(selector, Util.toMap(props));
        return this.update(exists);
      },
      get(selector) {
        const props = this.map.get(selector);
        return 'toObject' in props ? props.toObject() : props;
      },
      keys() {
        return this.map.keys();
      },
      *entries() {
        for(let [selector, props] of this.map.entries()) yield [selector, props.toObject()];
      },
      update(text = '') {
        if(text != '') {
          let node = document.createTextNode('\n' + text);
          this.element.appendChild(node);
          return this;
        }
        return this.generate();
      },
      generate() {
        this.element.innerHTML = '';
        for(let [selector, props] of this.map) this.update(CSS.section(selector, props));
        return this;
      },
      get text() {
        return (this.element.innerText + '').trim();
      }
    };

    const obj = Object.create(null);
    Object.setPrototypeOf(obj, proto);
    Object.assign(obj, { element, map: new Map() });
    return obj;
  }

  static consolidate(properties) {
    let props = new Map(Util.isIterable(properties) ? properties : Object.entries(properties));

    const trblExpr = /(Top|Right|Bottom|Left)/;
    const cswExpr = /(Color|Style|Width)/;

    let keyList = [...props.keys()].filter(k => trblExpr.test(k) || cswExpr.test(k));

    //console.log("props:",Util.unique(keyList.filter(k => k.startsWith('border')).map(k => k.replace(/^border/, "").replace(trblExpr, ""))));
    for(let key of keyList) {
    }
  }
}
