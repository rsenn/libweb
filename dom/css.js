import { Element } from './element.js';
import { decamelize, isObject, matchAll, memoize, tryCatch, unique } from '../misc.js';

function size(...args) {
  function size(obj) {
    if(isObject(obj)) {
      if(obj instanceof Map) return obj.size;
      else if('length' in obj) return obj.length;
      else return Object.keys(obj).length;
    }
  }
  if(args.length == 0) return size;
  return size(args[0]);
}
function adapter(obj, getLength = obj => obj.length, getKey = (obj, index) => obj.key(index), getItem = (obj, key) => obj[key], setItem = (obj, index, value) => (obj[index] = value)) {
  const adapter = obj && {
    /* prettier-ignore */ get length() {
      return getLength(obj);
    },
    /* prettier-ignore */ get instance() {
      return obj;
    },
    key(i) {
      return getKey(obj, i);
    },
    get(key) {
      return getItem(obj, key);
    },
    has(key) {
      return this.get(key) !== undefined;
    },
    set(key, value) {
      return setItem(obj, key, value);
    },
    *keys() {
      const length = getLength(obj);
      for(let i = 0; i < length; i++) yield getKey(obj, i);
    },
    *entries() {
      for(let key of this.keys()) yield [key, getItem(obj, key)];
    },
    [Symbol.iterator]() {
      return this.entries();
    },
    toObject() {
      return Object.fromEntries(this.entries());
    },
    toMap() {
      return new Map(this.entries());
    }
  };
  return adapter;
}

function equals(a, b) {
  if(Array.isArray(a) && Array.isArray(b)) {
    return a.length == b.length && a.every((e, i) => b[i] === e);
  } else if(isObject(a) && isObject(b)) {
    const size_a = size(a);

    if(size_a != size(b)) return false;

    for(let k in a) if(!equals(a[k], b[k])) return false;

    return true;
  }
  return a == b;
}
const getStyleMap = (obj, key) => {
  let rule = find(obj, item => item.selectorText == key);
  return adapter(
    rule,
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
  let sheet = obj.cssRules ? obj : find(obj, entry => entry.href == key || entry.ownerNode.id == key) || obj[key];

  return adapter(
    sheet.rules,
    obj => (obj && obj.length !== undefined ? obj.length : 0),
    (obj, i) => obj[i].selectorText,
    getStyleMap
  );
};

export class CSS {
  static get document() {
    return CSS.getDocument();
  }

  static getDocument = memoize(() =>
    tryCatch(
      () => window.document,
      d => (console.log('document:', d), d)
    )
  );

  static list = memoize(doc => {
    if(!doc) doc = this.document;
    let adapter = adapter(
      [...doc.styleSheets],
      obj => obj.length,
      (obj, i) => obj[i].href || obj[i].ownerNode.id || i,
      getStyleSheet
    );

    return [...adapter].map(([file, stylesheet]) => ({ file, stylesheet }));
  });

  static styles(stylesheet) {
    let ret;

    if(isObject(stylesheet) && stylesheet.cssRules !== undefined) ret = getStyleSheet(stylesheet);
    else {
      ret = [...CSS.list()];
      ret = typeof stylesheet == 'number' ? ret[stylesheet] : ret.find((item, i) => i === stylesheet || item.file === stylesheet);

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
    return unique(
      [...Element.findAll(selector)]
        .filter(e => e.classList.length)
        .map(e => [...e.classList])
        .flat()
    );
  }

  static section(selector, props) {
    let s = `${selector} {\n`;
    for(let [name, value] of props) {
      s += `  ${decamelize(name)}: ${value};\n`;
    }
    s += `}\n`;
    return s;
  }

  static parse(str) {
    let css = new Map();
    for(let [wholeRule, selectors, body] of matchAll(/([^{]*)\s*{\s*([^}]*)}?/gm, str)) {
      selectors = selectors.split(/,\s*/g).map(s => s.trim());
      let rule = new Map();

      for(let [wholeDeclaration, name, value] of matchAll(/([^:]*)\s*:\s*([^;]*);?/gm, body)) {
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

      if(selectors.some(s => equals(s, selector))) ret = merge(ret, rule);
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
        this.map.set(selector, toMap(props));
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
    let props = new Map(isIterable(properties) ? properties : Object.entries(properties));

    const trblExpr = /(Top|Right|Bottom|Left)/;
    const cswExpr = /(Color|Style|Width)/;

    let keyList = [...props.keys()].filter(k => trblExpr.test(k) || cswExpr.test(k));

    //console.log("props:",unique(keyList.filter(k => k.startsWith('border')).map(k => k.replace(/^border/, "").replace(trblExpr, ""))));
    for(let key of keyList) {
    }
  }
}

Object.assign(CSS, globalThis.CSS);
