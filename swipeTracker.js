import { Point, Rect } from "../utils/dom.js";
import { rect } from "../utils/devtools.js";
import Util from "../utils/util.js";
import { trkl } from "./trkl.js";

export class SwipeTracker {
  static H = 2;
  static V = 1;

  position = null;
  start = null;
  end = null;
  delta = new Point();
  axis = 0;
  mouse = null;
  touch = null;
  debug = false;

  constructor(threshold, handler = () => {}, debug = true) {
    this.threshold = threshold || 10;
    this.quadrant = new Point();
    this.handler = handler;
    this.debug = debug;
    this.active = false;

    this.getEventHandlers = this.getEventHandlers.bind(this);
    this.createSwipeEvent = this.createSwipeEvent.bind(this);
    this.updateSwipeRectangle = this.updateSwipeRectangle.bind(this);

    if(global.window) {
      const mouseObserver = trkl.from(observable => {
        window.addEventListener("mousemove", e => {
          const pos = { x: e.clientX + window.pageXOffset, y: e.clientY + window.pageYOffset };
          observable(pos);
        });
      });
      mouseObserver.subscribe(pos => {
        if(this.mouse === null || !this.mouse || typeof this.mouse.move != "function") this.mouse = new Point(pos);
        else this.mouse.move(pos.x, pos.y);
      });
      const touchObserver = trkl.from(observable => {
        const handler = event => {
          let pos = {
            x: event.clientX + window.pageXOffset,
            y: event.clientY + window.pageYOffset
          };
          if(event.touches && event.touches.length !== undefined) {
            [...event.touches].forEach(touch => {
              pos.x = touch.clientX;
              pos.y = touch.clientY;
            });
          } else {
            pos.x = event.clientX;
            pos.y = event.clientY;
          }
          observable(pos);
        };
        ["touchstart", "touchmove", "touchend"].forEach(name => window.addEventListener(name, handler));
      });
      touchObserver.subscribe(pos => {
        if(!this.touch || typeof this.touch.move !== "function") this.touch = new Point(pos);
        else this.touch.move(pos.x, pos.y);
      });
    }

    this.emitEvent = function(name) {
      const e = this.createSwipeEvent(name);
      this.handler(e);
      return e;
    }.bind(this);
  }

  updateSwipeRectangle(pos) {
    let p1 = new Point(0, 0);
    let p2 = new Point(pos);
    const { touch, start } = this;
    let pointer = this.getPointer();
    if(pointer) {
      p1 = p1.add(pointer);
      p2 = p2.add(pointer);
    }
    let delta = Point.diff(p2, p1);
    this.delta = delta;
    let x = Math.min(p1.x, p2.x);
    let y = Math.min(p1.y, p2.y);
    let width = Math.abs(p1.x - p2.x);
    let height = Math.abs(p1.y - p2.y);
    if(height > width) {
      width = 50;
      x = pointer.x - width / 2;
    } else {
      height = 50;
      y = pointer.y - height / 2;
    }
    let r = new Rect(x, y, width, height);
    if(this.debug) {
      if(!this.elem) {
        this.elem = rect(r.width, r.height);
        this.elem.style.position = "absolute";
      }
      this.elem.style.display = "block";
      this.elem.style.border = "2px white dashed";
      this.elem.style.boxShadow = "none";
      Object.assign(this.elem.style, Rect.toCSS(r));
    }
  }

  getPointer(round = true) {
    let p = new Point(this.mouse != null ? this.mouse : this.touch);
    if(round) p.round();
    return p;
  }

  createSwipeEvent(name) {
    function SwipeEvent(position, args = {}) {
      this.name = name;
      this.position = position;
      this.start = (args && args.start) || null;
      this.delta = (args && args.delta) || null;
      this.quadrant = (args && args.quadrant) || null;
      this.axis = (args && args.axis) || null;
      this.mouse = (args && args.mouse) || null;
    }
    SwipeEvent.prototype = {
      ...(global.document ? document.createEvent("Event") : {}),
      getAxis: function() {
        let ret = "";
        if(this.quadrant) {
          if(Math.abs(this.quadrant.x) > 0) ret += "H";
          if(Math.abs(this.quadrant.y) > 0) ret += "Y";
        }
        return ret;
      },
      getDist: function() {
        return this.axis & SwipeTracker.H ? this.delta.x : this.delta.y;
      },
      toSource: function() {
        return Object.keys(this)
          .map(key => {
            let value = Util.toSource(this[key]);
            return `${key}:${value}`;
          })
          .join(", ");
      },
      toString: function() {
        return (
          `SwipeEvent ${this.name.toUpperCase()}(` +
          (this.delta && this.delta.toString(false)) +
          ") " +
          this.getAxis() +
          " " +
          this.dist +
          " [" +
          (this.mouse && this.mouse.toSource(false)) +
          "]"
        );
      }
    };
    Object.defineProperty(SwipeEvent.prototype, "dist", {
      get: function() {
        return this.getDist();
      }
    });
    return new SwipeEvent(this.position, this);
  }
  handleSwipeDirection = (event, direction, vec) => {
    let amount = this.state.amount;
    if(vec.x < 0) amount *= 10;
    if(vec.x > 0) amount *= 0.1;
    this.setState({ amount });
    console.log("Payment.handleSwipeDirection ", {
      event,
      direction,
      vec
    });
  };

  getEventHandlers() {
    const inst = this;
    return Util.bindMethods(
      {
        onSwipeStart: function(event) {
          console.log("swipestart: ", { event });
          inst.end = null;
          inst.start = null;
        },
        onSwipeMove: function(pos, event) {
          let name = "move";
          if(!inst.start) {
            inst.start = new Point(this.mouse);
          }
          if(inst.position == null) inst.position = new Point(pos.x, pos.y);
          else inst.position.set(pos);

          //inst.position.add(inst.start);

          if(inst.start instanceof Point) {
            inst.delta = inst.position.diff(inst.start);
            if(inst.quadrant.distance() == 0) {
              if(Math.abs(inst.delta.x) > Math.abs(inst.delta.y)) {
                if(Math.abs(inst.delta.x) >= inst.threshold) {
                  inst.quadrant.x = inst.delta.x < 0 ? -1 : 1;
                }
              } else if(Math.abs(inst.delta.y) >= inst.threshold) {
                inst.quadrant.y = inst.delta.y < 0 ? -1 : 1;
              }
            }
            if(Math.abs(inst.quadrant.x) > 0) inst.axis |= SwipeTracker.H;
            else if(Math.abs(inst.quadrant.y) > 0) inst.axis |= SwipeTracker.V;

            const { start, position, delta, quadrant } = inst;
            inst.active = true;
            //console.log(`Swipe move: position=` + position, 'delta=' + delta, 'quadrant=' + quadrant);
            //console.log('New event: ', inst.emitEvent(name).toSource());
          }
        },
        onSwipeEnd: function(pos, event) {
          const { start, end, delta, quadrant } = this;
          const position = new Point(pos.x, pos.y);
          if(inst.start && inst.start.x !== undefined) {
            inst.delta = Point.diff(inst.position, inst.start);
          }
          inst.end = position;
          inst.emitEvent("end");
          inst.start = null;
          inst.quadrant.set(0, 0);
          inst.delta.set(0, 0);
          inst.active = false;
        }
      },
      inst
    );
  }
}

Util.defineGetter(SwipeTracker.prototype, "events", SwipeTracker.prototype.getEventHandlers);

export default SwipeTracker;
