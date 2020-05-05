import { Rect } from '../geom/rect.js';
import Util from '../util.js';

export class BBox {
  static fromPoints(pts) {
    let pt = pts.shift();
    let bb = new BBox(pt.x, pt.y, pt.x, pt.y);
    bb.update(pts);
    return bb;
  }

  constructor(x1, y1, x2, y2) {
    if(x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
      this.x1 = Math.min(x1, x2);
      this.y1 = Math.min(y1, y2);
      this.x2 = Math.max(x1, x2);
      this.y2 = Math.max(y1, y2);
    } else {
      this.x1 = 0;
      this.y1 = 0;
      this.x2 = 0;
      this.y2 = 0;
    }
  }

  updateList(list, offset = 0.0) {
    for(let arg of list) this.update(arg, offset);
    return this;
  }

  update(arg, offset = 0.0) {
    if(Util.isArray(arg)) return this.updateList(arg, offset);

    if(arg.x !== undefined && arg.y != undefined) this.updateXY(arg.x, arg.y, offset);
    if(arg.x1 !== undefined && arg.y1 != undefined) this.updateXY(arg.x1, arg.y1, 0);
    if(arg.x2 !== undefined && arg.y2 != undefined) this.updateXY(arg.x2, arg.y2, 0);
    return this;
  }

  updateXY(x, y, offset = 0) {
    let updated = {};
    if(this.x1 === undefined || this.x1 > x - offset) {
      this.x1 = x - offset;
      updated.x1 = true;
    }
    if(this.x2 === undefined || this.x2 < x + offset) {
      this.x2 = x + offset;
      updated.x2 = true;
    }
    if(this.y1 === undefined || this.y1 > y - offset) {
      this.y1 = y - offset;
      updated.y1 = true;
    }
    if(this.y2 === undefined || this.y2 < y + offset) {
      this.y2 = y + offset;
      updated.y2 = true;
    }
    // if(Object.keys(updated)) console.log(`BBox update ${x},${y} `, updated);
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
    return Math.abs(this.x2 - this.x1);
  }
  get y() {
    return this.y1 < this.y2 ? this.y1 : this.y2;
  }
  get height() {
    return Math.abs(this.y2 - this.y1);
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
    return new Rect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
  }
  toString() {
    return `${this.x1} ${this.y1} ${this.x2 - this.x1} ${this.y2 - this.y1}`;
  }
  transform(fn = arg => arg, out) {
    if(!out) out = this;
    for(let prop of ['x1', 'y1', 'x2', 'y2']) {
      const v = this[prop];
      out[prop] = fn(v);
    }
    return this;
  }
  round() {
    let ret = new BBox();
    this.transform(arg => Math.round(arg), ret);
    return ret;
  }

  static from(iter, tp = p => p) {
    if(typeof iter == 'object' && iter[Symbol.iterator]) iter = iter[Symbol.iterator]();

    let r = new BBox();
    let result = iter.next();
    let p;
    if(result.value) {
      p = tp(result.value);
      r.x1 = p.x;
      r.x2 = p.x;
      r.y1 = p.y;
      r.y2 = p.y;
    }
    while(true) {
      result = iter.next();
      if(!result.value) break;
      p = tp(result.value);

      r.update(p);
    }
    return r;
  }
}
