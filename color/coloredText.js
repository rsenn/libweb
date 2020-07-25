import Util from '../util.js';
import { RGBA, HSLA } from '../color.js';

const FOREGROUND = Symbol.for('foreground');
const BACKGROUND = Symbol.for('background');
const NO_COLOR = Symbol.for('no-color');
const INSPECT = Symbol.for('nodejs.util.inspect.custom');
const TO_STRING = Symbol.toStringTag;

export class ColoredText extends Array {
  static FG = FOREGROUND;
  static BG = BACKGROUND;
  static NC = NO_COLOR;

  static get [Symbol.species]() {
    return ColoredText;
  }

  constructor(...args) {
    super();
    Util.define(this, { current: { [FOREGROUND]: null, [BACKGROUND]: null } });

    const { FG, BG, NC } = ColoredText;

    for(let arg of args) {
      if(arg === NC) {
        this.current[FG] = null;
        this.current[BG] = null;
      } else if(Util.isObject(arg)) {
        if(arg[FG] !== undefined) this.current[FG] = arg[FG] || null;
        if(arg[BG] !== undefined) this.current[BG] = arg[BG] || null;
      }
      this.push(arg);
    }
  }

  write(text, fg, bg) {
    if(fg) this.setForeground(fg);
    if(bg) this.setBackground(bg);
    this.push(text);
  }

  append(text, fg, bg) {
    return this.write(text, fg, bg);
  }

  setForeground(color) {
    if(color instanceof Array) color = new RGBA(...color);
    const last = this[this.length - 1];
    if(Util.isObject(last)) last[FOREGROUND] = color;
    else this.push({ [FOREGROUND]: color });
  }

  setBackground(color) {
    if(color instanceof Array) color = new RGBA(...color);
    const last = this[this.length - 1];
    if(Util.isObject(last)) last[BACKGROUND] = color;
    else this.push({ [BACKGROUND]: color });
  }

  getForeground() {
    const { current } = this;
    return current[FOREGROUND];
  }

  getBackground() {
    const { current } = this;
    return current[BACKGROUND];
  }

  unshift(...args) {
    Array.prototype.splice.call(this, 0, 0, ...args);
    return this;
  }

  push(...args) {
    for(let arg of args) Array.prototype.push.call(this, arg);
    return this;
  }

  pop(n = 1) {
    let r = Array.prototype.splice.call(this, this.length - n, n);
    return n > 1 ? r : r[0];
  }

  shift(n = 1) {
    let r = Array.prototype.splice.call(this, 0, n);
    return n > 1 ? r : r[0];
  }

  setColors(fg, bg) {
    const { current } = this;
    let o = {};
    const { FG, BG } = ColoredText;

    if(this.getForeground() !== fg) current[FG] = o[FG] = fg;
    else fg = null;

    if(this.getBackground() !== bg) current[BG] = o[BG] = bg;
    else bg = null;

    if(fg || bg) this.push(o);
  }

  clearColors() {
    this.push(NO_COLOR);
  }

  stripColors() {
    return this.filter(p => !Util.isObject(p) && p !== NO_COLOR);
  }

  output() {
    const a = this[Symbol.for('nodejs.util.inspect.custom')]();
    console.log(...a);
  }

  toArray() {
    let a = Util.isBrowser() ? this.toConsole() : this.toAnsi256();

    return a;
  }

  toString(color = true) {
    let a = this;

    if(!color || Util.isBrowser()) a = a.stripColors();

    a = Util.isBrowser() ? a : a.toAnsi256();
    return a.join('');
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return Util.isBrowser() ? this.toConsole() : this.toAnsi256();
  }

  toConsole() {
    const { FG, BG, NC } = ColoredText;
    let a = [];
    let t = '';
    let state = { [FG]: null, [BG]: null };
    for(let p of this) {
      if(p === NC) {
        t += '%c';
        a.push('color:none; background-color: none;');
        state[FG] = null;
        state[BG] = null;
      } else if(Util.isObject(p)) {
        const fg = p[FG];
        const bg = p[BG];
        let css = [];
        if(fg || bg) {
          t += '%c';
          if(fg) {
            css.push(`color:${fg.toString()};`);
            state[FG] = fg;
          }
          if(bg) {
            css.push(`background-color:${bg.toString()};`);
            state[BG] = bg;
          }
        }
        if(css.length) a.push(css.join(' '));
      } else {
        t += p;
      }
    }
    a.unshift(t);
    if(state[FG] !== null || state[BG] !== null) {
      this.push(NC);
      return this.toConsole();
    }
    Object.assign(a, {
      append(...args) {
        let s = '',
          v = [],
          i = 0;
        for(let a of args) {
          if(i == 0 || /%c/.test(a)) s += a;
          else v.push(a);
          i++;
        }
        this[0] += s;
        if(v.length) Array.prototype.splice.call(this, this.length, 0, ...v);
        return this;
      },
      prepend(...args) {
        let s = '',
          v = [],
          i = 0;
        for(let a of args) {
          if(i == 0 || /%c/.test(a)) s += a;
          else v.push(a);
          i++;
        }
        this[0] = s + this[0];
        if(v.length) Array.prototype.splice.call(this, 1, 0, ...v);
        return this;
      },
      [INSPECT]() {
        return this;
      },
      toConsole(c = console) {
        c.log(...this[INSPECT]());
      }
    });
    return a;
  }

  toAnsi256() {
    const { FG, BG, NC } = ColoredText;
    let a = [];
    let state = { [FG]: null, [BG]: null };

    for(let p of this) {
      if(p === NC) {
        state[FG] = null;
        state[BG] = null;
      } else if(Util.isObject(p)) {
        if(p[FG] !== undefined) state[FG] = p[FG];
        if(p[BG] !== undefined) state[BG] = p[BG];
      }
      a.push(partToStr(p));
    }

    if(state[FG] !== null || state[BG] !== null) {
      this.push(NC);
      //  console.log("this:",[...this].map(partToStr).join("").split("\x1b"));
      return this.toAnsi256();
    }
    Object.assign(a, {
      append(...args) {
        for(let other of args) {
          if(Util.isArray(other)) {
            let i = 0;
            for(let arg of other) {
              this.push(arg);
              ++i;
            }
          } else {
            this.push(other);
          }
        }
        return this;
      },
      [INSPECT]() {
        return [this[TO_STRING]()];
      },
      [TO_STRING]() {
        let s = '';
        for(let p of [...this]) s += partToStr(p);
        return s + `\x1b[0m`;
      },
      toConsole(c = console) {
        c.log(...this[INSPECT]());
      }
    });

    function partToStr(p) {
      let s = '';
      if(typeof p == 'symbol' || p === NC) {
        s += `\x1b[0m`;
      } else if(Util.isObject(p)) {
        if(Util.isObject(p[FG]) && p[FG].toAnsi256) s += p[FG].toAnsi256(false);
        if(Util.isObject(p[BG]) && p[BG].toAnsi256) s += p[BG].toAnsi256(true);
      } else {
        s += p + '';
      }
      return s;
    }

    return a;
  }
}
