/* http://Github.com/Canop/hu.js */

//A simple SVG library by denys.seguret@gmail.com
let hu = (function () {
  let document = globalThis.window ? globalThis.window.document : null;
  let window = globalThis.window ? globalThis.window : null;

  let nn = 1, //counter for dynamically generated def id
    U = function(n) {
      this.n = n;
    },
    fn = U.prototype,
    nopx = {
      //css properties which don't need a unit
      'column-count': 1,
      'fill-opacity': 1,
      'flex-grow': 1,
      'flex-shrink': 1,
      'font-weight': 1,
      opacity: 1,
      'z-index': 1
    };

  function node(a, c) {
    if(a instanceof U) return a.n;
    if(c) c = node(c);
    if(typeof a === 'string') {
      let m = a.match(/^\s*<\s*(\w+)\s*>?\s*$/);
      if(m) {
        let n = document.createElementNS('http://www.w3.org/2000/svg', m[1]);
        if(/^svg$/i.test(n.tagName)) {
          //hack to force Firefox to see the dimension of the element
          obj('<rect', n).attr({ width: '100%', height: '100%', opacity: 0 });
        }
        return n;
      }
      return (c || document).querySelector(a);
    }
    return a[0] || a; //to support jQuery elements and nodelists
  }

  var obj = function(a, c) {
    if(!c) return new U(node(a));
    c = node(c);
    a = node(a, c);
    if(!a) return null;
    if(c && !a.parentNode) c.appendChild(a);
    return new U(a);
  };
  obj.fn = fn; //so that obj can be easily extended

  //reverse camel case : "strokeOpacity" -> "stroke-opacity"
  function rcc(n) {
    return n.replace(/[A-Z]/g, l => '-' + l.toLowerCase());
  }

  fn.append = function(a) {
    this.n.appendChild(node(a));
    return this;
  };
  fn.prependTo = function(a) {
    a = node(a);
    a.insertBefore(this.n, a.firstChild);
    return this;
  };
  fn.setDocument = function(d) {
    document = d;
  };

  fn.setWindow = function(d) {
    window = d;
  };

  //removes the graphical nodes, not the defs
  //(to remove everything, just call the standard DOM functions)
  fn.empty = function() {
    for(let l = this.n.childNodes, i = l.length; i--; ) {
      if(!/^defs$/i.test(l[i].tagName)) this.n.removeChild(l[i]);
    }
    return this;
  };

  fn.autoid = function() {
    return this.attrnv('id', 'obj' + nn++);
  };

  fn.text = function(s) {
    this.empty().n.appendChild(document.createTextNode(s));
    return this;
  };

  //stores the passed element in the closest SVG parent of this
  //and gives it an automatic id.
  fn.def = function(a) {
    let u = obj(a),
      p = this;
    while(p) {
      if(p.n.tagName === 'svg') {
        (obj('defs', p) || obj('<defs', p.n)).n.appendChild(u.n);
        return u.autoid();
      }
      p = obj(p.parentNode);
    }
    throw new Error('No parent SVG');
  };

  fn.stops = function() {
    for(let i = 0; i < arguments.length; i++) {
      obj('<stop', this).attr(arguments[i]);
    }
    return this;
  };

  fn.rgrad = function(cx, cy, r, c1, c2) {
    return this.def('<radialGradient').attr({ cx, cy, r }).stops({ offset: '0%', stopColor: c1 }, { offset: '100%', stopColor: c2 });
  };

  fn.width = function(v) {
    //window.getComputedStyle is the only thing that seems to work on FF when
    //there are nested svg elements
    if(v === undefined) return this.n.getBBox().width || parseInt(window.getComputedStyle(this.n).width);
    return this.attrnv('width', v);
  };
  fn.height = function(v) {
    if(v === undefined) return this.n.getBBox().height || parseInt(window.getComputedStyle(this.n).height);
    return this.attrnv('height', v);
  };

  //css name value
  fn.cssnv = function(name, value) {
    name = rcc(name);
    if(value === undefined) return this.n.style[name];
    if(typeof value === 'number' && !nopx[name]) value += 'px';
    this.n.style[name] = value;
    return this;
  };

  fn.css = function(a1, a2) {
    if(typeof a1 === 'string') return this.cssnv(a1, a2);
    for(let k in a1) this.cssnv(k, a1[k]);
    return this;
  };

  //attr name value
  fn.attrnv = function(name, value) {
    name = rcc(name);
    if(value === undefined) return this.n.getAttributeNS(null, name);
    if(value instanceof U) value = 'url(#' + value.n.id + ')';
    this.n.setAttributeNS(null, name, value);
    return this;
  };

  fn.attr = function(a1, a2) {
    if(typeof a1 === 'string') return this.attrnv(a1, a2);
    for(let k in a1) {
      this.attrnv(k, a1[k]);
    }
    return this;
  };

  fn.on = function(et, f) {
    et.split(' ').forEach(function (et) {
      this.addEventListener(et, f);
    }, this.n);
    return this;
  };
  fn.off = function(et, f) {
    et.split(' ').forEach(function (et) {
      this.removeEventListener(et, f);
    }, this.n);
    return this;
  };
  fn.remove = function() {
    if(this.n.parentNode) this.n.parentNode.removeChild(this.n);
    return this;
  };

  //dst is a map containing the destination css or attribute keys and values
  fn.animate = function(dst, duration, cb) {
    let u = this,
      vars = [];
    //the goal of this iteration is to build an array of objects for the
    //animable properties, with
    //- v.k : the key
    //- v.f : the function used to set the style or attribute (fn.css or
    //fn.attr)
    //- v.s : the start value
    //- v.e  : the end value
    for(let k in dst) {
      let dstk = dst[k];
      k = rcc(k);
      let v = { k, e: dstk },
        sk = this.n.style[k];
      if(sk !== undefined && sk !== '') {
        //0 or "0" would be ok
        v.f = fn.css;
        v.s = parseFloat(sk);
      } else {
        v.f = fn.attr;
        let d = this.n[k] || this.attr(k);
        if(d) {
          v.s = parseFloat(d.baseVal ? d.baseVal.value : d); //you have a baseval for example in SVGAnimatedLength
        } else {
          v.s = 0;
        }
      }
      vars.push(v);
    }
    let s = Date.now(),
      e = s + duration;
    (function step(n) {
      n = Date.now();
      vars.forEach(v => {
        v.f.call(u, v.k, v.s + ((n - s) * (v.e - v.s)) / duration);
      });
      if(n < e) return setTimeout(step, 10);
      vars.forEach(v => {
        v.f.call(u, v.k, v.e);
      });
      if(cb) cb.call(u);
    })();
    return this;
  };

  for(let n in fn) {
    if(typeof fn[n] === 'function') obj[n] = fn[n];
  }

  return obj;
})();

module.exports = hu;
