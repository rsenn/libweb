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
    let i = -1;
    for(let arg of args) {
      i++;

      if(i == 0 && Util.isConstructor(arg)) {
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

  static generate(hues, tones, prng) {
    const gcd = (...input) => {
      var len, a, b;
      len = input.length;
      if(!len) {
        return null;
      }
      a = input[0];
      for(var i = 1; i < len; i++) {
        b = input[i];
        a = gcd_two_numbers(a, b);
      }
      return a;
    };
    const gcd_two_numbers = (x, y) => {
      x = Math.abs(x);
      y = Math.abs(y);
      while(y) {
        var t = y;
        y = x % y;
        x = t;
      }
      return x;
    };
    function lcm_two_numbers(x, y) {
      if(typeof x !== 'number' || typeof y !== 'number') return false;
      return !x || !y ? 0 : Math.abs((x * y) / gcd_two_numbers(x, y));
    }
    let sq = Math.round(Math.sqrt(hues));

    let a = Util.range(1, hues).map((e,i) => Util.randInt(-36,+36,prng));


let b = Util.range(0, sq).map((e,i) => i * 360 / (sq)).map(Util.add(Util.randInt(0,360)));


    let f = Util.chunkArray( a, sq).map((g,i) =>   g.sort((a,b) => a -b).map(Util.add(b[i])));
    let g = gcd_two_numbers(Math.round(sq * tones * 10), hues);
    return [f];
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
