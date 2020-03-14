"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BBox = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var BBox = /*#__PURE__*/ (function() {
  (0, _createClass2["default"])(BBox, null, [
    {
      key: "fromPoints",
      value: function fromPoints(pts) {
        var pt = pts.shift();
        var bb = new BBox(pt.x, pt.y, pt.x, pt.y);
        bb.update(pts);
        return bb;
      }
    }
  ]);

  function BBox(x1, y1, x2, y2) {
    (0, _classCallCheck2["default"])(this, BBox);

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

  (0, _createClass2["default"])(
    BBox,
    [
      {
        key: "update",
        value: function update(list) {
          var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.0;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for(var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var arg = _step.value;
              if(arg.x !== undefined && arg.y != undefined) this.updateXY(arg.x, arg.y, offset);
              if(arg.x1 !== undefined && arg.y1 != undefined) this.updateXY(arg.x1, arg.y1, 0);
              if(arg.x2 !== undefined && arg.y2 != undefined) this.updateXY(arg.x2, arg.y2, 0);
            }
          } catch(err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if(!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if(_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      },
      {
        key: "updateXY",
        value: function updateXY(x, y) {
          var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
          var updated = {};

          if(this.x1 > x - offset) {
            this.x1 = x - offset;
            updated.x1 = true;
          }

          if(this.x2 < x + offset) {
            this.x2 = x + offset;
            updated.x2 = true;
          }

          if(this.y1 > y - offset) {
            this.y1 = y - offset;
            updated.y1 = true;
          }

          if(this.y2 < y + offset) {
            this.y2 = y + offset;
            updated.y2 = true;
          } // if(Object.keys(updated)) console.log(`BBox update ${x},${y} `, updated);
        }
      },
      {
        key: "relative_to",
        value: function relative_to(x, y) {
          return new BBox(this.x1 - x, this.y1 - y, this.x2 - x, this.y2 - y);
        }
      },
      {
        key: "toString",
        value: function toString() {
          return "["
            .concat(this.x1, ",")
            .concat(this.y1, "] - [")
            .concat(this.x2, ",")
            .concat(this.y2, "]");
        }
      },
      {
        key: "transform",
        value: function transform() {
          var fn =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : function(arg) {
                  return arg;
                };
          var out = arguments.length > 1 ? arguments[1] : undefined;
          if(!out) out = this;

          for(var _i = 0, _arr = ["x1", "y1", "x2", "y2"]; _i < _arr.length; _i++) {
            var prop = _arr[_i];
            var v = this[prop];
            out[prop] = fn(v);
          }

          return this;
        }
      },
      {
        key: "round",
        value: function round() {
          var ret = new BBox();
          this.transform(function(arg) {
            return Math.round(arg);
          }, ret);
          return ret;
        }
      },
      {
        key: "center",
        get: function get() {
          return new Point({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
          });
        }
      },
      {
        key: "x",
        get: function get() {
          return this.x1;
        },
        set: function set(x) {
          var ix = x - this.x1;
          this.x1 += ix;
          this.x2 += ix;
        }
      },
      {
        key: "width",
        get: function get() {
          return Math.abs(this.x2 - this.x1);
        },
        set: function set(w) {
          this.x2 = this.x1 + w;
        }
      },
      {
        key: "y",
        get: function get() {
          return this.y1 < this.y2 ? this.y1 : this.y2;
        },
        set: function set(y) {
          var iy = y - this.y1;
          this.y1 += iy;
          this.y2 += iy;
        }
      },
      {
        key: "height",
        get: function get() {
          return Math.abs(this.y2 - this.y1);
        },
        set: function set(h) {
          this.y2 = this.y1 + h;
        }
      },
      {
        key: "rect",
        get: function get() {
          return new Rect({
            x: this.x1,
            y: this.y1,
            width: this.x2 - this.x1,
            height: this.y2 - this.y1
          });
        }
      }
    ],
    [
      {
        key: "from",
        value: function from(iter) {
          var tp =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : function(p) {
                  return p;
                };
          return (function() {
            if(typeof iter == "object" && iter[Symbol.iterator]) iter = iter[Symbol.iterator]();
            var r = new BBox();
            var result = iter.next();
            var p;

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
              if(r.x1 > p.x) r.x1 = p.x;
              if(r.x2 < p.x) r.x2 = p.x;
              if(r.y1 > p.y) r.y1 = p.y;
              if(r.y2 < p.y) r.y2 = p.y;
            }

            return r;
          })();
        }
      }
    ]
  );
  return BBox;
})();

exports.BBox = BBox;
