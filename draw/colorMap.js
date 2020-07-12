import { Util } from '../util.js';
import { RGBA } from '../color/rgba.js';
import { HSLA } from '../color/hsla.js';
import { Iterator } from '../iterator.js';

export class ColorMap extends Map {
  constructor(...args) {
    super();
    let isNew = this instanceof ColorMap;
    let obj = isNew ? this : new Map();
    let type;
    for(let arg of args) {
      if(Util.isConstructor(arg)) {
        type = arg;
        continue;
      }
      for(let [key, color] of Util.entries(arg)) {
        let item = color;
        if(!(color instanceof RGBA || color instanceof HSLA)) item = RGBA.fromString(item);
        if(type === HSLA) item = item.toHSLA();
        obj.set(key, item || color);
      }
    }
    Util.define(obj, { type: RGBA, base: 10 });
    if(!isNew) return obj;
  }

  toString(opts = {}) {
    const base = opts.base || this.base;
    let a = [];
    for(let [key, color] of this) a.push(color.toString ? color.toString(',', num => num.toString(base)) : '' + color);
    a.join(',');
  }

  *toScalar(ofpts = {}) {
    const base = opts.base || this.base;
    const fmt = opts.fmt || this.fmt || (n => n.toFixed(3));
    for(let [key, color] of this) {
      if(color instanceof HSLA) color = color.toRGBA();
      if(!(color instanceof RGBA)) color = RGBA.fromString(color);
      let { r, g, b, a } = color;
      yield [r, g, b, a].map(fmt);
    }
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this;
  }
}

//ColorMap.prototype = new Array();

//Object.assign(ColorMap.prototype, Util.getMethods(Array.prototype));

/*

    a.push(color.toString ? color.toString(',', num => num.toString(base)) : ''+color);
  }
  a.join(',');
}*/
