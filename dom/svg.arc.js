import "svgjs";

(function() {
  var Trig = (function() {
    function Trig() {}

    return Trig;
  })();

  Trig.CLOSE_ENOUGH_DISTANCE = 4;
  Trig.TOLERANCE_DISTANCE = 4;
  Trig.TOLERANCE_DISTANCE_SQR = 16;

  if(!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != "undefined" ? args[number] : match;
      });
    };
  }

  SVG.extend(SVG.Element, {
    x1: function() {
      return this.attr("x1");
    },
    y1: function() {
      return this.attr("y1");
    },
    x2: function() {
      return this.attr("x2");
    },
    y2: function() {
      return this.attr("y2");
    },
    translateFull: function(x, y, relative) {
      return this.transform({ x: x, y: y }, relative);
    },
    container() {
      return this.parent(SVG.Container);
    }
  });

  SVG.extend(SVG.Line, {
    // Get point
    mid: function() {
      return new SVG.Point((this.x1() + this.x2()) / 2.0, (this.y1() + this.y2()) / 2.0);
    }
  });

  SVG.extend(SVG.Point, {
    distance: function(pt) {
      var dx = this.x - pt.x;
      var dy = this.y - pt.y;
      return Math.sqrt(dx * dx + dy * dy);
    },

    distanceToLine: function(pt1, pt2) {
      return Math.abs((pt2.y - pt1.y) * this.x - (pt2.x - pt1.x) * this.y + pt2.x * pt1.y - pt2.y * pt1.x) / Math.sqrt((pt2.y - pt1.y) * (pt2.y - pt1.y) + (pt2.x - pt1.x) * (pt2.x - pt1.x));
    },
    withinLineRange: function(pt1, pt2) {
      var minX = Math.min(pt1.x, pt2.x);
      var minY = Math.min(pt1.y, pt2.y);
      var maxX = Math.max(pt1.x, pt2.x);
      var maxY = Math.max(pt1.y, pt2.y);

      return this.x >= minX - Trig.CLOSE_ENOUGH_DISTANCE && this.x <= maxX + Trig.CLOSE_ENOUGH_DISTANCE && this.y >= minY - Trig.CLOSE_ENOUGH_DISTANCE && this.y <= maxY + Trig.CLOSE_ENOUGH_DISTANCE;
    },
    onArc: function(arc) {
      //x = cx + rx*cos(theta)
      //y = cy + ry*sin(theta)
      if(arc.bbox().contains(this)) {
        x = arc.cx() + arc.r * Math.cos(arc.ang);
        y = arc.cy() + arc.r * Math.sin(arc.ang);
        return (this.x - x) * (this.x - x) + (this.y - y) * (this.y - y) <= Trig.TOLERANCE_DISTANCE_SQR;
      }
      return false;
    },
    translate(x, y) {
      this.x = this.x + x;
      this.y = this.y + y;
      return this;
    },
    equals: function(p) {
      return this.x == p.x && this.y == p.y;
    },
    closeEnough(x, y) {
      return Math.abs(this.x - x) <= Trig.CLOSE_ENOUGH_DISTANCE && Math.abs(this.y - y) <= Trig.CLOSE_ENOUGH_DISTANCE;
    }
  });

  SVG.extend(SVG.BBox, {
    contains: function(pt) {
      return pt.x >= this.x && pt.y >= this.y && pt.x <= this.x + this.width && pt.y <= this.y + this.height;
    }
  });

  SVG.extend(SVG.Circle, {
    inside: function(x, y) {
      return x >= this.cx() - this.rx() && y >= this.cy() - this.ry() && x <= this.cx() + this.rx() && y <= this.cy() + this.ry();
    }
  });

  SVG.extend(SVG.Rect, {
    leftTopX: function() {
      return this.x();
    },
    leftTopY: function() {
      return this.y();
    },
    rightBottomX: function() {
      return this.x() + this.width();
    },
    rightBottomY: function() {
      return this.y() + this.height();
    },
    inside: function(x, y) {
      return x >= this.x() && x <= this.x() + this.width() && y >= this.y() && y <= this.y() + this.height();
    }
  });

  SVG.Arc = SVG.invent({
    // Initialize node
    create: "path",

    // Inherit from
    inherit: SVG.Path,

    // Add class methods
    extend: {
      plotRadius: function(x1, y1, r, largeArcFlag, sweepFlag, x2, y2) {
        var p = "M {0},{1} A {2},{2} 0 {3},{4} {5},{6}".format(x1.toFixed(2), y1.toFixed(2), r.toFixed(2), largeArcFlag.toFixed(0), sweepFlag.toFixed(0), x2.toFixed(2), y2.toFixed(2));
        this.r = r;
        this.largeArcFlag = largeArcFlag;
        this.sweepFlag = sweepFlag;
        this.x11 = x1;
        this.y11 = y1;
        this.x12 = x2;
        this.y12 = y2;
        this.ang = Math.PI;
        return this.attr("d", (this._array = new SVG.PathArray(p)));
      },

      plot: function(x1, y1, h, sweepFlag, x2, y2) {
        //cord length
        var lc = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        //cord lineAngle
        var ac = this.lineAngle(x1, y1, x2, y2);
        //now calculate radius of the arc
        this.r = (((lc / 2.0) * lc) / 2.0 + h * h) / (2.0 * h);
        //arc lineAngle
        if(h * 2 <= lc) this.ang = Math.PI - 2.0 * Math.acos(lc / (2.0 * this.r));
        else this.ang = Math.PI + 2.0 * Math.acos(lc / (2.0 * this.r));

        var phi = Math.PI * 0.5 + ac - this.ang * 0.5;
        this.center.x = x1 + this.r * Math.cos(phi);
        this.center.y = y1 + this.r * Math.sin(phi);

        this.largeArcFlag = h > this.r ? 1 : 0;
        this.sweepFlag = sweepFlag;
        this.x11 = x1;
        this.y11 = y1;
        this.x12 = x2;
        this.y12 = y2;
        var p = "M {0},{1} A {2},{2} 0 {3},{4} {5},{6}".format(x1.toFixed(2), y1.toFixed(2), this.r.toFixed(2), this.largeArcFlag.toFixed(0), this.sweepFlag.toFixed(0), x2.toFixed(2), y2.toFixed(2));
        return this.attr("d", (this._array = new SVG.PathArray(p)));
      },
      lineAngle(x1, y1, x2, y2) {
        var t = Math.atan2(y2 - y1, x2 - x1);
        while(t < 0) t += 2 * Math.PI;

        return t;
      },
      ptOnArc(pt) {
        //x = cx + rx*cos(theta)
        //y = cy + ry*sin(theta)
        if(this.bbox().contains(pt)) {
          var theta = this.lineAngle(this.cx(), this.cy(), pt.x, pt.y);

          x = this.cx() + this.r * Math.cos(theta);
          y = this.cy() + this.r * Math.sin(theta);
          return (pt.x - x) * (pt.x - x) + (pt.y - y) * (pt.y - y) <= Trig.TOLERANCE_DISTANCE_SQR;
        }
        return false;
      },
      mid: function() {
        var cordMidX = (this.x11 + this.x12) / 2.0;
        var cordMidY = (this.y11 + this.y12) / 2.0;
        var h = this.r - this.r * Math.cos(this.ang / 2.0);
        var sign = this.sweepFlag === 0 ? 1 : -1;
        var theta = this.lineAngle(this.x11, this.y11, this.x12, this.y12);
        var cx = cordMidX - Math.sin(theta) * h * sign;
        var cy = cordMidY + Math.cos(theta) * h * sign;
        return new SVG.Point(cx, cy);
      },
      length: function() {
        return this.r * this.ang;
      },
      cx: function() {
        return this.center.x;
      },
      cy: function() {
        return this.center.y;
      },
      x1: function() {
        return this.x11;
      },
      y1: function() {
        return this.y11;
      },
      x2: function() {
        return this.x12;
      },
      y2: function() {
        return this.y12;
      },
      h: function() {
        return this.r - this.r * Math.cos(this.ang / 2.0);
      },
      angle: function() {
        return this.ang;
      },
      flag: function() {
        return this.largeArcFlag;
      },
      sweep: function(f) {
        if(f != undefined) {
          this.sweepFlag = f;
          this.plot(this.x1(), this.y1(), this.h(), this.sweepFlag, this.x2(), this.y2());
        } else return this.sweepFlag;
      }
    },
    // Add parent method
    construct: {
      // Create a line element
      arc: function(x1, y1, r, sweepFlag, x2, y2) {
        return this.put(new SVG.Arc()).plot(x1, y1, r, sweepFlag, x2, y2);
      }
    }
  });
}.call(this));
