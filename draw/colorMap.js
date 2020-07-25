import Util from '../util.js';
import { RGBA } from '../color/rgba.js';
import { HSLA } from '../color/hsla.js';
import { Iterator } from '../iterator.js';

export class ColorMap extends Map {
  constructor(...args) {
    super();
    let isNew = this instanceof ColorMap;
    let obj = isNew ? this : new Map();
    let type = RGBA;
    let i = -1;
    for(let arg of args) {
      i++;

      if(i == 0 && Util.isConstructor(arg)) {
        type = arg;
        continue;
      }
      for(let [key, color] of Util.entries(arg)) {
        let item = color;
        if(typeof item == 'string') {
          console.log(type);
          item = type.fromString(item);
        } else if(!(color instanceof type) && type === HSLA && Util.isObject(item) && typeof item.toHSLA == 'function') item = item.toHSLA();
        obj.set(key, item || color);
      }
    }
    Util.define(obj, { type, base: 10 });
    if(!isNew) return obj;
  }

  toString(opts = {}) {
    const base = opts.base || this.base;
    let a = [];
    for(let [key, color] of this) a.push(color.toString ? color.toString(',', num => num.toString(base)) : '' + color);
    a.join(',');
  }

  getChannel(name, t = entries => new Map(entries)) {
    return t([...this.entries()].map(([key, color]) => [key, color[name]]));
  }

  getMinMax() {
    let channels = this.type == RGBA ? ['r', 'g', 'b', 'a'] : this.type == HSLA ? ['h', 's', 'l', 'a'] : [];
    const minmax = a => [Math.min(...a), Math.max(...a)];
    return channels.reduce((acc, chan) => ({ ...acc, [chan]: minmax(this.getChannel(chan, e => e).map(([k, c]) => c)) }), {});
  }

  remapChannel(chan, fn = (v, k) => v) {
    for(let [k, v] of this) {
      let newVal = fn(v[chan], k);
      if(v !== newVal) {
        v = Util.clone(v);
        v[chan] = newVal;
        this.set(k, v);
      }
    }
  }

  remap(fn = (c, k) => c) {
    for(let [k, c] of this.entries()) {
      let newColor = fn(Util.clone(c), k);
      if(newColor && !newColor.equals(c)) this.set(k, newColor);
    }
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
  /*

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

    let a = Util.range(1, hues).map((e, i) => Util.randInt(-36, +36, prng));

    let b = Util.range(0, sq)
      .map((e, i) => (i * 360) / sq)
      .map(Util.add(Util.randInt(0, 360)));

    let f = Util.chunkArray(a, sq).map((g, i) => g.sort((a, b) => a - b).map(Util.add(b[i])));
    let g = gcd_two_numbers(Math.round(sq * tones * 10), hues);
    return [f];
  }*/

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
