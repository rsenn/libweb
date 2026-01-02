import { SVG } from '../svg.js';
// Based on Easing Equations (c) 2003 [Robert Penner](http://www.robertpenner.com/), all rights reserved.

var easing = {
  quadIn(pos) {
    return Math.pow(pos, 2);
  },

  quadOut(pos) {
    return -(Math.pow(pos - 1, 2) - 1);
  },

  quadInOut(pos) {
    if((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 2);
    return -0.5 * ((pos -= 2) * pos - 2);
  },

  cubicIn(pos) {
    return Math.pow(pos, 3);
  },

  cubicOut(pos) {
    return Math.pow(pos - 1, 3) + 1;
  },

  cubicInOut(pos) {
    if((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3);
    return 0.5 * (Math.pow(pos - 2, 3) + 2);
  },

  quartIn(pos) {
    return Math.pow(pos, 4);
  },

  quartOut(pos) {
    return -(Math.pow(pos - 1, 4) - 1);
  },

  quartInOut(pos) {
    if((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 4);
    return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
  },

  quintIn(pos) {
    return Math.pow(pos, 5);
  },

  quintOut(pos) {
    return Math.pow(pos - 1, 5) + 1;
  },

  quintInOut(pos) {
    if((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 5);
    return 0.5 * (Math.pow(pos - 2, 5) + 2);
  },

  sineIn(pos) {
    return -Math.cos(pos * (Math.PI / 2)) + 1;
  },

  sineOut(pos) {
    return Math.sin(pos * (Math.PI / 2));
  },

  sineInOut(pos) {
    return -0.5 * (Math.cos(Math.PI * pos) - 1);
  },

  expoIn(pos) {
    return pos == 0 ? 0 : Math.pow(2, 10 * (pos - 1));
  },

  expoOut(pos) {
    return pos == 1 ? 1 : -Math.pow(2, -10 * pos) + 1;
  },

  expoInOut(pos) {
    if(pos == 0) return 0;
    if(pos == 1) return 1;
    if((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1));
    return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
  },

  circIn(pos) {
    return -(Math.sqrt(1 - pos * pos) - 1);
  },

  circOut(pos) {
    return Math.sqrt(1 - Math.pow(pos - 1, 2));
  },

  circInOut(pos) {
    if((pos /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - pos * pos) - 1);
    return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
  },

  backIn(pos) {
    var s = 1.70158;
    return pos * pos * ((s + 1) * pos - s);
  },

  backOut(pos) {
    pos = pos - 1;
    var s = 1.70158;
    return pos * pos * ((s + 1) * pos + s) + 1;
  },

  backInOut(pos) {
    var s = 1.70158;
    if((pos /= 0.5) < 1) return 0.5 * (pos * pos * (((s *= 1.525) + 1) * pos - s));
    return 0.5 * ((pos -= 2) * pos * (((s *= 1.525) + 1) * pos + s) + 2);
  },

  swingFromTo(pos) {
    var s = 1.70158;
    return (pos /= 0.5) < 1 ? 0.5 * (pos * pos * (((s *= 1.525) + 1) * pos - s)) : 0.5 * ((pos -= 2) * pos * (((s *= 1.525) + 1) * pos + s) + 2);
  },

  swingFrom(pos) {
    var s = 1.70158;
    return pos * pos * ((s + 1) * pos - s);
  },

  swingTo(pos) {
    var s = 1.70158;
    return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
  },

  bounce(pos) {
    var s = 7.5625,
      p = 2.75,
      l;

    if(pos < 1 / p) {
      l = s * pos * pos;
    } else {
      if(pos < 2 / p) {
        pos -= 1.5 / p;
        l = s * pos * pos + 0.75;
      } else {
        if(pos < 2.5 / p) {
          pos -= 2.25 / p;
          l = s * pos * pos + 0.9375;
        } else {
          pos -= 2.625 / p;
          l = s * pos * pos + 0.984375;
        }
      }
    }
    return l;
  },

  bounceOut(pos) {
    if(pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    } else if(pos < 2 / 2.75) {
      return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
    } else if(pos < 2.5 / 2.75) {
      return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
    } else {
      return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
    }
  },

  elastic(pos) {
    if(pos == !!pos) return pos;
    return Math.pow(2, -10 * pos) * Math.sin(((pos - 0.075) * (2 * Math.PI)) / 0.3) + 1;
  },
};

for(var key in easing) SVG.easing[key] = easing[key];