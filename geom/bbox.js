import { define, types, isObject } from '../misc.js';
import { isPoint, Point } from '../geom/point.js';
import { isRect, Rect } from '../geom/rect.js';
import { isSize, Size } from '../geom/size.js';

export class BBox {
  static fromPoints(pts) {
    let pt = pts.shift();
    let bb = new BBox(pt.x, pt.y, pt.x, pt.y);
    bb.update(pts);
    return bb;
  }

  static fromRect(rect) {
    return new BBox(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
  }

  static create(arg) {
    if(isRect(arg)) return new BBox(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);

    if(Array.isArray(arg) || types.isIterable(arg)) return BBox.of(...arg);
  }

  static of(...args) {
    return BBox.from(args);
  }

  constructor(...args) {
    if(args.length == 4 && args.every(arg => Number.isFinite(arg))) {
      const [x1, y1, x2, y2] = args;

      this.x1 = Math.min(x1, x2);
      this.y1 = Math.min(y1, y2);
      this.x2 = Math.max(x1, x2);
      this.y2 = Math.max(y1, y2);
    } else if(isBBox(args[0])) {
      const { x1, y1, x2, y2 } = args[0];
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
    } else {
      this.x1 = undefined;
      this.y1 = undefined;
      this.x2 = undefined;
      this.y2 = undefined;
      if(args.length > 0) this.updateList([...args]);
    }

    define(this, { objects: {} });
  }

  getObjects() {
    return new Map(Object.entries(this.objects));
  }

  updateList(list, offset = 0.0, objFn = item => item, t = a => a) {
    for(let arg of list) this.update(t(arg), offset, objFn(arg));
    return this;
  }

  update(arg, offset = 0.0, obj = null) {
    //console.log('BBox.update', { arg, offset, obj });

    if(Array.isArray(arg)) return this.updateList(arg, offset);
    else if(isObject(arg)) {
      if(typeof arg.bbox == 'function') {
        arg = arg.bbox();
      } else if(isPoint(arg)) {
        this.updateXY(arg.x, arg.y, offset, name => (this.objects[name] = obj || arg));
      } else if(isBBox(arg.objects)) {
        this.updateList(Object.values(arg.objects), offset);
      } else {
        if(arg.x2 !== undefined && arg.y2 != undefined) this.updateXY(arg.x2, arg.y2, 0, name => (this.objects[name] = obj || arg));
        if(arg.x1 !== undefined && arg.y1 != undefined) this.updateXY(arg.x1, arg.y1, 0, name => (this.objects[name] = obj || arg));
        if(arg.x !== undefined && arg.y != undefined) this.updateXY(arg.x, arg.y, offset, name => (this.objects[name] = obj || arg));
      }
    }

    return this;
  }

  updateXY(x, y, offset = 0, set = () => {}) {
    let updated = {};
    if(this.x1 === undefined || this.x1 > x - offset) {
      this.x1 = x - offset;
      set('x1');
    }
    if(this.x2 === undefined || this.x2 < x + offset) {
      this.x2 = x + offset;
      set('x2');
    }
    if(this.y1 === undefined || this.y1 > y - offset) {
      this.y1 = y - offset;
      set('y1');
    }
    if(this.y2 === undefined || this.y2 < y + offset) {
      this.y2 = y + offset;
      set('y2');
    }
    //if(Object.keys(updated)) console.log(`BBox update ${x},${y} `, updated);
    return this;
  }

  get center() {
    return new Point({
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    });
  }

  relative_to(x, y) {
    return new BBox(this.x1 - x, this.y1 - y, this.x2 - x, this.y2 - y);
  }

  get x() {
    return this.x1;
  }

  get width() {
    return /*Math.abs*/ this.x2 - this.x1;
  }

  get y() {
    return this.y1 < this.y2 ? this.y1 : this.y2;
  }

  get height() {
    return /*Math.abs*/ this.y2 - this.y1;
  }

  set x(x) {
    let ix = x - this.x1;
    this.x1 += ix;
    this.x2 += ix;
  }

  set width(w) {
    this.x2 = this.x1 + w;
  }

  set y(y) {
    let iy = y - this.y1;
    this.y1 += iy;
    this.y2 += iy;
  }

  set height(h) {
    this.y2 = this.y1 + h;
  }

  get rect() {
    const { x1, y1, x2, y2 } = this;
    return {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1
    };
  }

  get size() {
    const { x1, y1, x2, y2 } = this;
    return new Size(x2 - x1, y2 - y1);
  }

  toRect(proto) {
    let r = this.rect;
    return Object.setPrototypeOf(r, proto || Object.prototype);
  }

  toSize(ctor = obj => Object.setPrototypeOf(obj, Object.prototype)) {
    let width = this.x2 - this.x1;
    let height = this.y2 - this.y1;
    return ctor({ width, height });
  }

  toObject() {
    const { x1, y1, x2, y2 } = this;
    let obj = Object.create(null);
    obj.x1 = x1;
    obj.y1 = y1;
    obj.x2 = x2;
    obj.y2 = y2;
    return obj;
  }

  toString() {
    return `${this.x1} ${this.y1} ${this.x2} ${this.y2}`;
  }

  toSVG() {
    return `${this.x1} ${this.y1} ${this.width} ${this.height}`;
  }

  transform(fn = arg => arg, out) {
    if(!out) out = this;
    for(let prop of ['x1', 'y1', 'x2', 'y2']) {
      const v = this[prop];
      out[prop] = fn(v);
    }
    return this;
  }

  round(fn = arg => Math.round(arg)) {
    let ret = new BBox();
    this.transform(fn, ret);
    return ret;
  }

  move(x, y) {
    this.x1 += x;
    this.y1 += y;
    this.x2 += x;
    this.y2 += y;
    return this;
  }

  outset(...args) {
    if(args.length >= 4) {
      const [top, right, bottom, left] = args;
      return new BBox(this.x1 - left, this.y1 - top, this.x2 + right, this.y2 + bottom);
    }
    if(args.length >= 2) {
      const [vertical, horizontal] = args;
      return this.outset(vertical, horizontal, vertical, horizontal);
    }
    return this.outset(args[0], args[0], args[0], args[0]);
  }

  inset(...args) {
    return this.outset(...args.map(n => -n));
  }

  static from(iter, tp = p => p) {
    if(typeof iter == 'string') {
      let [x1, y1, x2, y2] = [...iter.matchAll(/[-+.0-9]+/g)].map(([m]) => +m);
      iter = [{ x1, y1, x2, y2 }];
    }

    if(typeof iter == 'object' && iter[Symbol.iterator]) iter = iter[Symbol.iterator]();

    let r = new BBox();
    let result = iter.next();
    let p;
    if(result.value) {
      p = tp(result.value);
      r.x1 = p.x1 !== undefined ? p.x1 : p.x;
      r.x2 = p.x2 !== undefined ? p.x2 : p.x;
      r.y1 = p.y1 !== undefined ? p.y1 : p.y;
      r.y2 = p.y2 !== undefined ? p.y2 : p.y;
    }
    while(true) {
      result = iter.next();
      if(!result.value) break;
      p = tp(result.value);

      r.update(p);
    }
    return r;
  }

  static fromString(s) {
    let [x1, y1, x2, y2] = [...s.matchAll(/[-+.0-9]+/g)].map(([m]) => +m);

    let r = new BBox();
    return Object.assign(r, { x1, y1, x2, y2 });
  }

  static fromSVG(s) {
    let [x, y, width, height] = [...s.matchAll(/[-+.0-9]+/g)].map(([m]) => +m);
    return new BBox(x, y, x + width, y + height);
  }

  *[Symbol.iterator]() {
    let [x1, x2, y1, y2] = this;
    for(let prop of [x1, x2, y1, y2]) yield prop;
  }
}

BBox.prototype[Symbol.toStringTag] = 'BBox';

export const isBBox = (bbox, testFn = (prop, name, obj) => name in obj) => isObject(bbox) && ['x1', 'y1', 'x2', 'y2'].every(n => testFn(bbox[n], n, bbox));

export default BBox;
