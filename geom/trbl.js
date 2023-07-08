import { defineGetter } from '../misc.js';
import { immutableClass } from '../misc.js';
import { Rect } from './rect.js';
/**
 * Type for TopRightBottomLeft (paddings and margins)
 *
 * @param {string,object,array} arg [description]
 */
export function TRBL(...args) {
  let ret = this instanceof TRBL ? this : {};
  let [arg]=args;
  // console.log("TRBL",{arg})

  if(args.length==1 && typeof arg === 'object' && !Array.isArray(arg)) {
    Object.keys(arg).forEach(k => {
      const matches = /(top|right|bottom|left)/i.exec(k);
      console.log("TRBL.constructor",{arg,matches,k});
      ret[matches[0].toLowerCase()] = parseInt(arg[k]);
    });
  } else if(arg) {
    if(args.length > 1) arg = args;

    if(typeof arg === 'string') arg = [...arg.matchAll(/^[0-9.]+(|px|em|rem|pt|cm|mm)$/g)];
    else if(arg.length == 4) arg = arg.map(v => parseInt(v.replace(/[a-z]*$/g, '')));

    ret.top = arg[0];
    ret.right = arg[1];
    ret.bottom = arg[2];
    ret.left = arg[3];
  }

  if(isNaN(ret.top)) ret.top = 0;
  if(isNaN(ret.right)) ret.right = 0;
  if(isNaN(ret.bottom)) ret.bottom = 0;
  if(isNaN(ret.left)) ret.left = 0;

  /*   ['toString','toSource'].forEach((name) =>
    Object.defineProperty(ret, name, { enumerable: true, value: TRBL.prototype[name] })
  ); */

  //console.log('ret: ', ret);

  if(!this || this === TRBL) return Object.assign(ret, TRBL.prototype);
}

TRBL.prototype.null = function() {
  return this.top == 0 && this.right == 0 && this.bottom == 0 && this.left == 0;
};
TRBL.null = trbl => TRBL.prototype.null.call(trbl);

TRBL.neg = (trbl = this) => ({
  top: -trbl.top,
  right: -trbl.right,
  bottom: -trbl.bottom,
  left: -trbl.left
});

TRBL.prototype.isNaN = function() {
  return isNaN(this.top) || isNaN(this.right) || isNaN(this.bottom) || isNaN(this.left);
};
Object.defineProperty(TRBL.prototype, 'inset', {
  get() {
    return rect => Rect.inset(rect, this);
  }
});

Object.defineProperty(TRBL.prototype, 'outset', {
  get() {
    return rect => Rect.outset(rect, this);
  }
});

/*TRBL.prototype.outset = function() {
  return this.inset.call(TRBL.neg(this));
};*/

TRBL.prototype.add = function(other) {
  this.top += other.top;
  this.right += other.right;
  this.bottom += other.bottom;
  this.left += other.left;
};

TRBL.prototype.union = function(other) {
  this.top = other.top < this.top ? other.top : this.top;
  this.right = other.right > this.right ? other.right : this.right;
  this.bottom = other.bottom > this.bottom ? other.bottom : this.bottom;
  this.left = other.left < this.left ? other.left : this.left;
};

TRBL.prototype.toRect = function() {
  return new Rect({
    x: this.left,
    y: this.top,
    width: this.right - this.left,
    height: this.bottom - this.top
  });
};
TRBL.prototype.toRect = function() {
  return new Rect({
    x: this.left,
    y: this.top,
    width: this.right - this.left,
    height: this.bottom - this.top
  });
};

TRBL.union = (trbl, other) => ({
  top: other.top < trbl.top ? other.top : trbl.top,
  right: other.right > trbl.right ? other.right : trbl.right,
  bottom: other.bottom > trbl.bottom ? other.bottom : trbl.bottom,
  left: other.left < trbl.left ? other.left : trbl.left
});

TRBL.toRect = trbl => new Rect(trbl.left, trbl.top, trbl.right - trbl.left, trbl.bottom - trbl.top);

TRBL.prototype.toString = function(unit = 'px') {
  return '' + this.top + '' + unit + ' ' + this.right + '' + unit + ' ' + this.bottom + '' + unit + ' ' + this.left + unit;
};
TRBL.prototype.toSource = function() {
  return '{top:' + this.top + ',right:' + this.right + ',bottom:' + this.bottom + ',left:' + this.left + '}';
};

for(let name of ['null', 'isNaN', 'outset', 'toRect', 'toSource']) {
  TRBL[name] = points => TRBL.prototype[name].call(points);
}

export function isTRBL(obj) {
  return top in obj && right in obj && bottom in obj && left in obj;
}

defineGetter(TRBL, Symbol.species, function() {
  return this;
});

export const ImmutableTRBL = immutableClass(TRBL);
defineGetter(ImmutableTRBL, Symbol.species, () => ImmutableTRBL);