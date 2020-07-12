import { Util } from '../util.js';
import { RGBA } from '../color/rgba.js';
import { HSLA } from '../color/hsla.js';

export class ColorMap extends Map {
  constructor(...args) {
    super();
    let isNew = this instanceof ColorMap;
    let obj = isNew ? this : [];

    for(let arg of args) {
      for(let [key, color] of Util.entries(arg)) {
        //console.log('arg:', {key,color});

        let item;
        /*if(typeof(arg) == 'string')
   item = RGBA.fromString(arg);*/

        if(!(color instanceof RGBA || color instanceof HSLA)) item = RGBA.fromString(color);

        obj.set(key, item || color);
        //        obj.push(item || color);
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
