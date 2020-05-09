import { Util } from "../util.js";
import { RGBA } from "../dom/rgba.js";
import { HSLA } from "../dom/hsla.js";

export function ColorMap(...args) {
  let isNew = this instanceof ColorMap;
  let obj = isNew ? this : new ColorMap();

  for(let arg of args) {
    for(let color of arg) {
      // console.log("arg:", color);

      let item;
      /*if(typeof(arg) == 'string')
   item = RGBA.fromString(arg);*/

      if(!(color instanceof RGBA || color instanceof HSLA)) item = RGBA.fromString(color);
      obj.push(item || color);
    }
  }

  if(!isNew) return obj;
}

Util.extend(ColorMap.prototype, Util.getMethods(Array.prototype));

ColorMap.prototype.type = RGBA;
ColorMap.prototype.base = 10;

ColorMap.prototype.toString = function(opts = {}) {
  const base = opts.base || this.base;
  let a = [];
  for(let color of this) a.push(color.toString ? color.toString(",", num => num.toString(base)) : "" + color);
  a.join(",");
};
ColorMap.prototype.toScalar = function*(opts = {}) {
  const base = opts.base || this.base;
  const fmt = opts.fmt || this.fmt || (n => n.toFixed(3));
  for(let color of this) {
    if(color instanceof HSLA) color = color.toRGBA();
    if(!(color instanceof RGBA)) color = RGBA.fromString(color);
    let { r, g, b, a } = color;
    yield [r, g, b, a].map(fmt);
  }
};
/*

    a.push(color.toString ? color.toString(',', num => num.toString(base)) : ''+color);
  }
  a.join(',');
}*/
