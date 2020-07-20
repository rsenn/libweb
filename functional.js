const slice1 = [].slice;

export class Functional {
  static I(a) {
    return a;
  }

  static builtin = this.I.bind.bind(this.I.call);

  static _toString = this.builtin(Object.prototype.toString);

  static shallow = a => {
    var i, q, r, ref, ref1, t;
    if(!a) {
      return a;
    }
    r = null;
    if((ref = t = this.type(a)) === 'string' || ref === 'number' || ref === 'boolean' || ref === 'symbol') {
      r = a;
    } else if(t === 'array') {
      r = [];
      for(i = q = 0, ref1 = a.length; q < ref1; i = q += 1) {
        r[i] = a[i];
      }
    } else if(t === 'date') {
      r = new Date(a.getTime());
    } else if(this.isplain(a)) {
      r = this.merge({}, a);
    } else {
      throw new TypeError("Can't shallow " + a);
    }
    return r;
  };

  static clone = a => {
    var i, k, q, ref, s, v;
    if(!a) {
      return a;
    }
    s = this.shallow(a);
    if(this.type(a) === 'array') {
      for(i = q = 0, ref = a.length; q < ref; i = q += 1) {
        s[i] = this.clone(s[i]);
      }
    } else if(this.isplain(s)) {
      for(k in s) {
        v = s[k];
        s[k] = this.clone(v);
      }
    }
    return s;
  };

  static isplain = (() => {
    var iscons, isobject, isobjobj, isprot, isprotobj;
    isobject = function(o) {
      return !!o && typeof o === 'object';
    };
    isobjobj = function(o) {
      return this.isobject(o) && Object.prototype.toString.call(o) === '[object Object]';
    };
    iscons = function(o) {
      return typeof o.constructor === 'function';
    };
    isprot = function(o) {
      return this.isobjobj(o.constructor.prototype);
    };
    isprotobj = function(o) {
      return o.constructor.prototype.hasOwnProperty('isPrototypeOf');
    };
    return function(o) {
      return this.isobjobj(o) && this.iscons(o) && this.isprot(o) && this.isprotobj(o);
    };
  })();

  static isdef(o) {
    return o != null;
  }

  static type = a => {
    return this._toString(a)
      .slice(8, -1)
      .toLowerCase();
  };

  static head(a) {
    return a[0];
  }

  static tail(a) {
    return a.slice(1);
  }

  static last(a) {
    return a[a.length - 1];
  }

  static _nary = (n, fn) => {
    //console.log('_nary', { n, fn });

    let ret = (n => {
      switch (n) {
        case 0:
          return function() {
            return fn.apply(null, arguments);
          };
        case 1:
          return function(a) {
            return fn.apply(null, arguments);
          };
        case 2:
          return function(a, b) {
            return fn.apply(null, arguments);
          };
        case 3:
          return function(a, b, c) {
            return fn.apply(null, arguments);
          };
        case 4:
          return function(a, b, c, d) {
            return fn.apply(null, arguments);
          };
        case 5:
          return function(a, b, c, d, e) {
            return fn.apply(null, arguments);
          };
        case 6:
          return function(a, b, c, d, e, f) {
            return fn.apply(null, arguments);
          };
        case 7:
          return function(a, b, c, d, e, f, g) {
            return fn.apply(null, arguments);
          };
        case 8:
          return function(a, b, c, d, e, f, g, h) {
            return fn.apply(null, arguments);
          };
        case 9:
          return function(a, b, c, d, e, f, g, h, i) {
            return fn.apply(null, arguments);
          };
        case 10:
          return function(a, b, c, d, e, f, g, h, i, j) {
            return fn.apply(null, arguments);
          };
      }
    })(n);
    if(ret) ret.arity = n;
    return ret;
  };

  static arity(fn, n) {
    if(arguments.length === 1) {
      n = fn;
      return function(fn) {
        return Functional._nary(n, fn);
      };
    } else {
      return this._nary(n, fn);
    }
  }

  static arityof = f => {
    if(typeof f === 'function') {
      if(f.arity !== undefined) return f.arity;
      return f.length;
    }
  };

  static unary = fn => {
    return function(a) {
      return fn.apply(null, arguments);
    };
  };

  static binary = fn => {
    return function(a, b) {
      return fn.apply(null, arguments);
    };
  };

  static ternary = fn => {
    return function(a, b, c) {
      return fn.apply(null, arguments);
    };
  };

  static _defprop(t, n, v) {
    Object.defineProperty(t, n, {
      value: v
    });
    return t;
  }

  static ncurry = (n, v, f, as) => {
    var l, nf;
    if(as == null) {
      as = [];
    }
    if(typeof n !== 'number') {
      throw new Error('Bad ncurry ' + n);
    }
    l = n - as.length;
    nf = this._nary(l, function() {
      var bs, cs;
      bs = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
      cs = (bs.length <= l ? bs : v ? bs : bs.slice(0, l)).concat(as);
      if(cs.length < n) {
        return Functional.ncurry(n, v, f, cs);
      } else {
        return f.apply(null, cs);
      }
    });
    return this._defprop(nf, '__fnuc_curry', function() {
      if(as.length === 0) {
        return f;
      } else {
        return Functional.partialr.apply(null, [f].concat(slice1.call(as)));
      }
    });
  };

  static curry2 = f => {
    var f2;
    return this._defprop(
      (f2 = function(a, b) {
        var n;
        n = arguments.length;
        if(n === 0) {
          return f2;
        } else if(n === 1) {
          b = a;
          return function(a) {
            return f(a, b);
          };
        } else {
          return f(a, b);
        }
      }),
      '__fnuc_curry',
      function() {
        return f;
      }
    );
  };

  static curry2var = f => {
    var f2;
    return this._defprop(
      (f2 = function(a, b) {
        var n;
        n = arguments.length;
        if(n === 0) {
          return f2;
        } else if(n === 1) {
          b = a;
          return function(a) {
            return f.apply(null, slice1.call(arguments).concat([b]));
          };
        } else {
          return f.apply(null, arguments);
        }
      }),
      '__fnuc_curry',
      function() {
        return f;
      }
    );
  };

  static curry3 = f => {
    var f2;
    return this._defprop(
      (f2 = function(a, b, c) {
        var n;
        n = arguments.length;
        if(n === 0) {
          return f2;
        } else if(n === 1) {
          c = a;
          return Functional.curry2(function(a, b) {
            return f(a, b, c);
          });
        } else if(n === 2) {
          c = b;
          b = a;
          return function(a) {
            return f(a, b, c);
          };
        } else {
          return f(a, b, c);
        }
      }),
      '__fnuc_curry',
      function() {
        return f;
      }
    );
  };

  static curry3var = f => {
    var f2;
    return this._defprop(
      (f2 = function(a, b, c) {
        var n;
        n = arguments.length;
        if(n === 0) {
          return f2;
        } else if(n === 1) {
          c = a;
          return Functional.curry2var(function(a, b) {
            return f.apply(null, slice1.call(arguments).concat([c]));
          });
        } else if(n === 2) {
          c = b;
          b = a;
          return function(a) {
            return f.apply(null, slice1.call(arguments).concat([b], [c]));
          };
        } else {
          return f.apply(null, arguments);
        }
      }),
      '__fnuc_curry',
      function() {
        return f;
      }
    );
  };

  static curry = f => {
    var n;
    n = this.arityof(f);
    //console.log('curry', { f, n });
    if(n < 2) {
      return f;
    } else if(n === 2) {
      return this.curry2(f);
    } else if(n === 3) {
      return this.curry3(f);
    } else {
      return this.ncurry(n, false, f);
    }
  };

  static _uncurry = f => {
    if(f.__fnuc_curry) {
      return f.__fnuc_curry();
    } else {
      return f;
    }
  };

  static partial() {
    var as, f, fn, n;
    (f = arguments[0]), (as = 2 <= arguments.length ? slice1.call(arguments, 1) : []);
    f = this._uncurry(f);
    n = this.arityof(f) - as.length;
    fn = function() {
      var bs;
      bs = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
      return f.apply(null, as.concat(bs));
    };
    if(n <= 0) {
      return fn;
    } else {
      return this.curry(this._nary(n, fn));
    }
  }

  static partialr() {
    var as, f, fn, n;
    (f = arguments[0]), (as = 2 <= arguments.length ? slice1.call(arguments, 1) : []);
    f = this._uncurry(f);
    n = this.arityof(f) - as.length;
    fn = function() {
      var bs;
      bs = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
      return f.apply(null, bs.slice(0, n).concat(as));
    };
    if(n <= 0) {
      return fn;
    } else {
      return this.curry(this._nary(n, fn));
    }
  }

  static flip = f => {
    var g;
    if(f.__fnuc_flip) {
      return f.__fnuc_flip;
    }
    g = this.curry(
      this._nary(this.arityof(f), function() {
        var as;
        as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
        return Functional._uncurry(f).apply(null, as.reverse());
      })
    );
    return this._defprop(g, '__fnuc_flip', f);
  };

  static compose() {
    var fs;
    fs = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    fs = Functional._pliftall(fs);
    return Functional.ncurry(
      Functional.arityof(Functional.last(fs)),
      true,
      Functional.fold1(fs, (f, g) => {
        return function() {
          var as;
          as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
          return f(g.apply(null, as));
        };
      })
    );
  }

  static pipe() {
    var ar, fn, fs;
    fs = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    fs = this._pliftall(fs);
    fn = this.foldr1(fs, function(f, g) {
      return function() {
        var as;
        as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
        return f(g.apply(null, as));
      };
    });
    ar = this.arityof(this.head(fs));
    if(ar >= 2) {
      return this.ncurry(ar, true, fn);
    } else {
      return this._nary(ar, fn);
    }
  }

  static converge = this.curry3var(function() {
    var after, ar, fn, fs, q;
    (fs = 2 <= arguments.length ? slice1.call(arguments, 0, (q = arguments.length - 1)) : ((q = 0), [])), (after = arguments[q++]);
    fs = this._pliftall(fs);
    after = this.plift(after);
    ar = this.apply(Math.max)(this.map(fs, arityof));
    fn = function() {
      var args, context;
      args = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
      context = this;
      return after.apply(
        context,
        Functional.map(fs, function(fn) {
          return fn.apply(context, args);
        })
      );
    };
    if(ar >= 2) {
      return this.ncurry(ar, true, fn);
    } else {
      return this._nary(ar, fn);
    }
  });

  static typeis = this.curry2(function(a, s) {
    return Functional.type(a) === s;
  });

  static tap = this.curry2(function(a, f) {
    f(a);
    return a;
  });

  static call = this.curry2var(function() {
    var as, fn;
    (fn = arguments[0]), (as = 2 <= arguments.length ? slice1.call(arguments, 1) : []);
    return fn.apply(null, as);
  });

  static apply = fn => {
    return function(as) {
      return fn.apply(null, as);
    };
  };

  static unapply = fn => {
    return function() {
      var as;
      as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
      return fn(as);
    };
  };

  static iif = this.curry3((c, t, f) =>
    this.curry(
      this._nary(
        this.arityof(c),
        this.plift(function() {
          var as;
          as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
          if(c.apply(null, as)) {
            return typeof t === 'function' ? t.apply(null, as) : void 0;
          } else {
            return typeof f === 'function' ? f.apply(null, as) : void 0;
          }
        })
      )
    )
  );

  static maybe = fn => {
    return this.unary(
      this.plift(function() {
        var as;
        as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
        if(as.every(isdef)) {
          return fn.apply(null, as);
        }
      })
    );
  };

  static always = v => {
    return this.plift(function() {
      return v;
    });
  };

  static nth = n => {
    return this.curry(
      this._nary(n + 1, function() {
        var as;
        as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
        return as[n];
      })
    );
  };

  static once = fn => {
    var ran, ret;
    ran = ret = null;
    return function() {
      var as;
      as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
      if(ran) {
        return ret;
      } else {
        ran = true;
        return (ret = fn.apply(null, as));
      }
    };
  };

  static at = this.curry2(function(as, n) {
    return as[n];
  });

  static cond = cs => {
    return this.curry(
      this._nary(this.arityof(cs[0][0]), function() {
        var as, fn, len1, q, ref;
        as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
        for(q = 0, len1 = cs.length; q < len1; q++) {
          (ref = cs[q]), (cond = ref[0]), (fn = ref[1]);
          if(cond.apply(null, as)) {
            return fn.apply(null, as);
          }
        }
        return void 0;
      })
    );
  };

  static all = this.curry2var(this.builtin(Array.prototype.every));

  static any = this.curry2var(this.builtin(Array.prototype.some));

  static contains = this.curry2(function(as, a) {
    return Functional.index(as, a) >= 0;
  });

  static concat = this.curry2var(function() {
    var as, ref;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return (ref = []).concat.apply(ref, as);
  });

  static each = this.curry2var(this.builtin(Array.prototype.forEach));

  static filter = this.curry2(function(as, f) {
    var len1, q, r, ri, v;
    r = [];
    ri = -1;
    for(q = 0, len1 = as.length; q < len1; q++) {
      v = as[q];
      if(f(v)) {
        r[++ri] = v;
      }
    }
    return r;
  });

  static _filter(as, f) {
    var i, len1, q, r, ri, v;
    r = [];
    ri = -1;
    for(i = q = 0, len1 = as.length; q < len1; i = ++q) {
      v = as[i];
      if(f(v, i)) {
        r[++ri] = v;
      }
    }
    return r;
  }

  static _fold(as, f, acc, arrInit) {
    var i, l;
    i = 0;
    l = as.length;
    if(arrInit) {
      acc = as[i++];
    }
    for(; i < l; ++i) {
      acc = f(acc, as[i]);
    }
    return acc;
  }

  static _foldr(as, f, acc, arrInit) {
    var i;
    i = as.length;
    if(arrInit) {
      acc = as[--i];
    }
    while(i--) {
      acc = f(acc, as[i]);
    }
    return acc;
  }

  static fold = this.curry3((as, f, v) => {
    return this._fold(as, f, v, false);
  });

  static fold1 = this.curry2((as, f) => {
    return this._fold(as, f, null, true);
  });

  static foldr = this.curry3((as, f, v) => {
    return this._foldr(as, f, v, false);
  });

  static foldr1 = this.curry2((as, f) => {
    return this._foldr(as, f, null, true);
  });

  static index = this.curry2((as, v) => {
    var i, l;
    l = as.length;
    i = -1;
    while(++i < l) {
      if(as[i] === v) return i;
    }
    return -1;
  });

  static indexfn = this.curry2((as, fn) => {
    var i, l;
    l = as.length;
    i = -1;
    while(++i < l) {
      if(fn(as[i])) return i;
    }
    return -1;
  });

  static firstfn = this.curry2((as, fn) => {
    var i, l, r;
    r = null;
    l = (as != null ? as.length : void 0) || 0;
    if(!l) {
      return null;
    }
    i = 0;
    for(; i < l; ++i) {
      if(fn((r = as[i]))) return r;
    }
    return null;
  });

  static lastfn = this.curry2((as, fn) => {
    var i, r;
    r = null;
    i = (as != null ? as.length : void 0) - 1;
    if(!(i < (as != null ? as.length : void 0))) {
      return null;
    }
    for(; i >= 0; --i) {
      if(fn((r = as[i]))) return r;
    }
    return null;
  });

  static join = this.curry2var(this.builtin(Array.prototype.join));

  static map = this.curry2((as, f) => {
    var i, l, r;
    r = Array(as.length);
    l = as.length;
    i = 0;
    for(; i < l; ++i) {
      r[i] = f(as[i]);
    }
    return r;
  });

  static reverse = this.unary(this.builtin(Array.prototype.reverse));

  static sort = this.curry2(this.builtin(Array.prototype.sort));

  static uniqfn = this.curry2((as, fn) => {
    var fned;
    if(!as) {
      return as;
    }
    fned = this.map(as, fn);
    return this._filter(as, (v, i) => {
      return fned.indexOf(fned[i]) === i;
    });
  });

  static uniq = as => {
    if(!as) {
      return as;
    }
    return this._filter(as, (v, i) => {
      return as.indexOf(v) === i;
    });
  };

  static merge() {
    var k, len1, o, os, q, t, v;
    (t = arguments[0]), (os = 2 <= arguments.length ? slice1.call(arguments, 1) : []);
    for(q = 0, len1 = os.length; q < len1; q++) {
      o = os[q];
      for(k in o) {
        v = o[k];
        t[k] = v;
      }
    }
    return t;
  }

  static mixin = this.curry2var(function() {
    var os;
    os = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return merge.apply(null, [{}].concat(slice1.call(os)));
  });

  static plift = (() => {
    const isthenable = p => {
      var ref;
      if(!p) {
        return false;
      }
      if((ref = typeof p) !== 'object' && ref !== 'function') {
        return false;
      }
      return typeof p.then === 'function';
    };
    const thenbind = p => {
      return p.then.bind(p);
    };
    const firstthen = as => {
      var t;
      t = this.firstfn(isthenable)(as);
      if(t) {
        return thenbind(t);
      } else {
        return null;
      }
    };
    const promapply = errfn => {
      return (pfn, parg) => {
        var fn;
        fn = null;
        const onacc = arg => {
          if(errfn) {
            return arg;
          } else {
            return fn(arg);
          }
        };
        const onrej = err => {
          if(errfn) {
            return errfn(err);
          } else {
            throw err;
          }
        };
        return pfn
          .then(_fn => {
            fn = _fn;
            return parg;
          })
          .then(onacc, onrej);
      };
    };
    return f => {
      var nf;
      if(f.__fnuc_plift) {
        return f;
      }
      nf = this.curry(
        this._nary(this.arityof(f), function() {
          var alws, as, currfn, failfn, t0;
          as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
          t0 = firstthen(as);
          if(t0) {
            currfn = Functional.ncurry(as.length, false, f);
            alws = () => {
              return currfn;
            };
            failfn = Functional._ispfail(f) ? Functional.once(f) : null;
            return Functional.foldr(as, promapply(failfn), t0(alws, alws));
          } else {
            if(Functional._ispfail(f)) {
              return as != null ? as[0] : void 0;
            } else {
              return f.apply(null, as);
            }
          }
        })
      );
      return this._defprop(nf, '__fnuc_plift', true);
    };
  })();

  static _pliftall = this.map(this.plift);

  static pfail = f => {
    return this.plift(this._defprop(f, '__fnuc_fail', true));
  };

  static _ispfail(fn) {
    return !!(fn != null ? fn.__fnuc_fail : void 0);
  }

  static pall = (() => {
    var args;
    args = this.plift(this.unapply(this.I));
    return as => args.apply(null, as);
  })();

  static has = this.curry2(function(o, k) {
    return o.hasOwnProperty(k);
  });

  static get = this.curry2(function(o, k) {
    return o[k];
  });

  static set = this.curry3(function(o, k, v) {
    o[k] = v;
    f;
    return o;
  });

  static keys = o => {
    return Object.keys(o);
  };

  static values = o => {
    return this.map(this.keys(o), function(k) {
      return o[k];
    });
  };

  static ofilter = this.curry2(function(o, f) {
    var k, r, v;
    r = {};
    for(k in o) {
      v = o[k];
      if(f(k, v)) {
        r[k] = v;
      }
    }
    return r;
  });

  static omap = this.curry2(function(o, f) {
    var k, r, v;
    r = {};
    for(k in o) {
      v = o[k];
      r[k] = f(k, v);
    }
    return r;
  });

  static evolve = this.curry2((o, t) => {
    return this.omap(o, (k, v) => {
      if(this.has(t, k)) {
        return t[k](v);
      } else {
        return v;
      }
    });
  });

  static pick = this.curry2var(
    function() {
      var as, k, len1, o, q, r;
      (o = arguments[0]), (as = 2 <= arguments.length ? slice1.call(arguments, 1) : []);
      if(Functional.typeis(as[0], 'array')) {
        as = as[0];
      }
      r = {};
      for(q = 0, len1 = as.length; q < len1; q++) {
        k = as[q];
        r[k] = o[k];
      }
      return r;
    }.bind(this)
  );

  static keyval = this.curry2((k, v) => {
    var o;
    this.set((o = {}), k, v);
    return o;
  });

  static split = this.curry2(this.builtin(String.prototype.split));

  static match = this.curry2(this.builtin(String.prototype.match));

  static replace = this.curry3(this.builtin(String.prototype.replace));

  static search = this.curry2(this.builtin(String.prototype.search));

  static trim = this.unary(this.builtin(String.prototype.trim));

  static ucase = this.unary(this.builtin(String.prototype.toUpperCase));

  static lcase = this.unary(this.builtin(String.prototype.toLowerCase));

  static slice = this.curry3(function(s, m, n) {
    return s.slice(m, n);
  });

  static drop = this.curry2(function(s, n) {
    return s.slice(n);
  });

  static take = this.curry2(function(s, n) {
    return s.slice(0, n);
  });

  static len(t) {
    return t.length;
  }

  static add = this.curry2var(function() {
    var as;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Functional.fold1(as, function(a, b) {
      return a + b;
    });
  });

  static sub = this.curry2var(function() {
    var as;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Functional.fold1(as, function(a, b) {
      return a - b;
    });
  });

  static mul = this.curry2var(function() {
    var as;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Functional.fold1(as, function(a, b) {
      return a * b;
    });
  });

  static div = this.curry2var(function() {
    var as;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Functional.fold1(as, function(a, b) {
      return a / b;
    });
  });

  static mod = this.curry2var(function() {
    var as;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Functional.fold1(as, function(a, b) {
      return a % b;
    });
  });

  static min = this.curry2var(function() {
    var as;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Math.min.apply(Math, as);
  });

  static max = this.curry2var(function() {
    var as;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Math.max.apply(Math, as);
  });

  static gt = this.curry2(function(a, b) {
    return a > b;
  });

  static gte = this.curry2(function(a, b) {
    return a >= b;
  });

  static lt = this.curry2(function(a, b) {
    return a < b;
  });

  static lte = this.curry2(function(a, b) {
    return a <= b;
  });

  static eq = (() => {
    var _;
    _ = {};
    return this.curry2var(function() {
      var as;
      as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
      return (
        Functional.fold1(as, function(a, b) {
          if(a === b) {
            return a;
          } else {
            return _;
          }
        }) !== _
      );
    });
  })();

  static aand = this.curry2var(function() {
    var as;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Functional.fold1(as, function(a, b) {
      return !!a && !!b;
    });
  });

  static oor = this.curry2var(function() {
    var as;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Functional.fold1(as, function(a, b) {
      return !!a || !!b;
    });
  });

  static nnot(a) {
    return !a;
  }

  static both = this.curry2var(function() {
    var fs;
    fs = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Functional.unary(function() {
      var as, i, l;
      as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
      i = 0;
      l = fs.length;
      for(; i < l; ++i) {
        if(!fs[i].apply(null, as)) {
          return false;
        }
      }
      return true;
    });
  });

  static either = this.curry2var(function() {
    var fs;
    fs = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return Functional.unary(function() {
      var as, i, l;
      as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
      i = 0;
      l = fs.length;
      for(; i < l; ++i) {
        if(fs[i].apply(null, as)) {
          return true;
        }
      }
      return false;
    });
  });

  static comp = f => {
    return this.unary(function() {
      var as;
      as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
      return !f.apply(null, as);
    });
  };

  static zipwith = this.curry3var(function() {
    var as, f, i, ml, n, q, ref, results, u;
    (as = 2 <= arguments.length ? slice1.call(arguments, 0, (q = arguments.length - 1)) : ((q = 0), [])), (f = arguments[q++]);
    ml = Functional.apply(min)(Functional.map(as, len));
    results = [];
    for(i = u = 0, ref = ml; u < ref; i = u += 1) {
      results.push(
        f.apply(
          null,
          (function() {
            var ref1, results1, w;
            results1 = [];
            for(n = w = 0, ref1 = as.length; w < ref1; n = w += 1) {
              results1.push(as[n][i]);
            }
            return results1;
          })()
        )
      );
    }
    return results;
  });

  static zip = this.zipwith(function() {
    var as;
    as = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
    return as;
  });

  static zipobj = (() => {
    var fn;
    fn = obj => {
      return this.zipwith((k, v) => {
        return this.set(obj, k, v);
      });
    };
    return function(ks, vs) {
      var ret;
      fn((ret = {}))(ks, vs);
      return ret;
    };
  })();

  static eql = (() => {
    var eqarr, eqobj, eqplain, eqtype, sortstr;
    eqtype = function(a, b) {
      return Functional.type(a) === Functional.type(b);
    };
    eqarr = function(a, b) {
      var i, q, ref;
      if(a.length !== b.length) {
        return false;
      }
      for(i = q = 0, ref = a.length; q < ref; i = q += 1) {
        if(!Functional.eql(a[i], b[i])) {
          return false;
        }
      }
      return true;
    };
    eqplain = function(a, b) {
      return Functional.isplain(a) && Functional.isplain(b);
    };
    sortstr = Functional.sort(function(s1, s2) {
      return s1.localeCompare(s2);
    });

    eqobj = function(a, b) {
      var k, ka, len1, q;
      ka = sortstr(this.keys(a));
      if(!eqarr(ka, sortstr(this.keys(b)))) {
        return false;
      }
      for(q = 0, len1 = ka.length; q < len1; q++) {
        k = ka[q];
        if(!Functional.eql(a[k], b[k])) {
          return false;
        }
      }
      return true;
    };
    return Functional.curry2(function(a, b) {
      if(a === b) {
        return true;
      }
      return Functional.both(
        eqtype,
        (function() {
          switch (Functional.type(a)) {
            case 'object':
              return Functional.both(eqplain, eqobj);
            case 'array':
              return eqarr;
            default:
              return function() {
                return false;
              };
          }
        })()
      )(a, b);
    });
  })();

  static asprop = fn => {
    return {
      value: fn,
      enumerable: true,
      configurable: false,
      writable: false
    };
  };

  static expose = (() => {
    var guard;
    guard = '__fnuc';
    return function(exp) {
      return function() {
        var as, fns, ks, obj, ofexp, props, valid;
        (obj = arguments[0]), (as = 2 <= arguments.length ? slice1.call(arguments, 1) : []);
        if(obj[guard]) {
          return;
        }
        ofexp = Functional.partial(get, exp);
        valid = function(as) {
          return Functional.map(as, function(a) {
            if(ofexp(a)) {
              return a;
            } else {
              throw 'Not found: ' + a;
            }
          });
        };
        ks = as.length ? valid(as) : Functional.keys(exp);
        fns = Functional.map(ofexp)(ks);
        props = Functional.zipobj(ks, Functional.map(asprop)(fns));
        Object.defineProperties(obj, props);
        Object.defineProperty(obj, guard, Functional.asprop(I));
        return exp;
      };
    };
  })();
}
const {
  I,
  builtin,
  shallow,
  clone,
  isplain,
  isdef,
  type,
  head,
  tail,
  last,
  arity,
  binary,
  _defprop,
  ncurry,
  curry2,
  curry2var,
  curry3,
  curry3var,
  curry,
  _uncurry,
  partial,
  partialr,
  flip,
  compose,
  pipe,
  converge,
  typeis,
  tap,
  call,
  apply,
  unapply,
  iif,
  maybe,
  always,
  nth,
  once,
  at,
  cond,
  all,
  any,
  contains,
  concat,
  each,
  filter,
  _filter,
  _fold,
  _foldr,
  fold,
  fold1,
  foldr,
  foldr1,
  index,
  indexfn,
  firstfn,
  lastfn,
  join,
  map,
  reverse,
  sort,
  uniqfn,
  uniq,
  merge,
  mixin,
  plift,
  pfail,
  _ispfail,
  pall,
  has,
  get,
  set,
  keys,
  values,
  ofilter,
  omap,
  evolve,
  pick,
  keyval,
  split,
  match,
  replace,
  search,
  trim,
  ucase,
  lcase,
  slice,
  drop,
  take,
  len,
  add,
  sub,
  mul,
  div,
  mod,
  min,
  max,
  gt,
  gte,
  lt,
  lte,
  eq,
  aand,
  oor,
  nnot,
  both,
  either,
  comp,
  zipwith,
  zip,
  zipobj,
  eql,
  exports,
  asprop,
  expose
} = Functional;

export default {
  I,
  builtin,
  shallow,
  clone,
  isplain,
  isdef,
  type,
  head,
  tail,
  last,
  arity,
  binary,
  _defprop,
  ncurry,
  curry2,
  curry2var,
  curry3,
  curry3var,
  curry,
  _uncurry,
  partial,
  partialr,
  flip,
  compose,
  pipe,
  converge,
  typeis,
  tap,
  call,
  apply,
  unapply,
  iif,
  maybe,
  always,
  nth,
  once,
  at,
  cond,
  all,
  any,
  contains,
  concat,
  each,
  filter,
  _filter,
  _fold,
  _foldr,
  fold,
  fold1,
  foldr,
  foldr1,
  index,
  indexfn,
  firstfn,
  lastfn,
  join,
  map,
  reverse,
  sort,
  uniqfn,
  uniq,
  merge,
  mixin,
  plift,
  pfail,
  _ispfail,
  pall,
  has,
  get,
  set,
  keys,
  values,
  ofilter,
  omap,
  evolve,
  pick,
  keyval,
  split,
  match,
  replace,
  search,
  trim,
  ucase,
  lcase,
  slice,
  drop,
  take,
  len,
  add,
  sub,
  mul,
  div,
  mod,
  min,
  max,
  gt,
  gte,
  lt,
  lte,
  eq,
  aand,
  oor,
  nnot,
  both,
  either,
  comp,
  zipwith,
  zip,
  zipobj,
  eql,
  exports,
  asprop,
  expose
};

export const and = Functional.aand;

export const or = Functional.oor;

export const not = Functional.nnot;
