import { ScrollDisabler } from '../lib/scrollHandler.js';
//import { Element } from './dom.js';
import { trkl } from './trkl.js';
import { roundDigits, roundTo } from './misc.js';

function CreateElement(tag, attributes = {}, parent = document.body) {
  let e = attributes.xmlns ? document.createElementNS(attributes.xmlns, tag) : document.createElement(tag);

  for(let attr in attributes) e.setAttribute(attr, attributes[attr]);

  if(parent) parent.appendChild(e);

  return e;
}

function SetCSS(element, properties) {
  Object.assign(element.style, properties);
  return element;
}

function isPoint(a) {
  return typeof a == 'object' && 'x' in a && 'y' in a;
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  static sub(pt, other) {
    pt.x -= other.x;
    pt.y -= other.y;
    return pt;
  }

  static distanceSquared(a, b) {
    return (b.y - a.y) * (b.y - a.y) + (b.x - a.x) * (b.x - a.x);
  }
  static distance(a, b) {
    return Math.sqrt(Point.distanceSquared(a, b));
  }

  static toAngle(pt, deg = false) {
    return Math.atan2(pt.x, pt.y) * (deg ? 180 / Math.PI : 1);
  }
  static diff(a, b) {
    return { x: b.x - a.x, y: b.y - a.y };
  }

  static angle(pt, other, deg = false) {
    return Point.toAngle(Point.diff(pt, other), deg);
  }

  static round(pt, prec = 1) {
    pt.x = roundTo(pt.x, prec);
    pt.y = roundTo(pt.y, prec);
    return pt;
  }
}

class Rect {
  static round(rt, prec = 1) {
    rt.x = roundTo(rt.x, prec);
    rt.y = roundTo(rt.y, prec);
    rt.width = roundTo(rt.width, prec);
    rt.height = roundTo(rt.height, prec);
    return pt;
  }
}

class Line {
  constructor(a, b) {
    this.x1 = a.x;
    this.y1 = a.y;
    this.x2 = b.x;
    this.y2 = b.y;
  }

  bbox() {
    return {
      x: Math.min(this.x1, this.x2),
      y: Math.min(this.y1, this.y2),
      width: Math.abs(this.x1 - this.x2),
      height: Math.abs(this.y1 - this.y2)
    };
  }
}

export function MovementListener(handler, options) {
  let start = null;
  let move = {};
  let end = {};
  let index = 0;
  let active = false;
  let starttime = 0;
  let points = [];
  let prev;

  const cancel = trkl(event => {
    start = null;
    move = {};
    end = {};
    index = 0;
    active = false;
    starttime = 0;
    points = [];
    prev = {};
    //console.log('MovementListener cancelled');
  });

  options = { step: 1, round: false, angle: false, noscroll: true, ...options };
  //console.log("new MovementListener(", handler, ",", options, ")");

  var self = function(event) {
    const { nativeEvent, button, buttons } = event;
    let currentTarget = nativeEvent ? nativeEvent.currentTarget : event.currentTarget;

    let type = event.type.toLowerCase();
    let started = type.endsWith('start') || type.endsWith('down');
    let ends = type.endsWith('end') || type.endsWith('cancel') || type.endsWith('up');

    //console.log("MovementListener", { type, started, ends });

    //console.log("Touch ", type);

    if(ends) {
      let x = prev && prev.x !== undefined ? prev.x : 0;
      let y = prev && prev.y !== undefined ? prev.y : 0;
      active = false;
      end = {
        x,
        y,
        ...event,
        start,
        starttime,
        points,
        cancel,
        type,
        index,
        active
      };
      end.time = Date.now() - starttime;
      if(end && prev) end.timediff = end.time - prev.time;
      end.distance = Point.distance(end, { x, y });
      //end.type = 'touchend';$

      self.handler({ ...end, type: 'touchend', end });

      self.handler.start(null);
      self.handler.end(end);
      /*if(type.endsWith('cancel'))*/ cancel();

      //console.log("MovementListener", { type });
      return;
    }
    if(!started && !ends && start === null) return;

    if(event.touches !== undefined && event.touches.length === 0) return;

    let touches = event.touches && event.touches.length > 0 ? event.touches : [event];

    if(options.lastTouch) touches = [touches[touches.length - 1]];

    let num = touches.length;

    const getPos = (obj, prefix) => ({
      x: obj[prefix + 'X'],
      y: obj[prefix + 'Y']
    });
    [...touches].forEach((touch, touchNum) => {
      let { rotationAngle, target } = touch;
      let client = getPos(touch, 'client');
      let page = getPos(touch, 'page');
      let radius = getPos(touch, 'radius');
      let newpos = {
        radius,
        rotationAngle,
        target,
        currentTarget,
        button,
        buttons,
        ...client
      };
      let angle;
      if(started) {
        index = 0;
        points = [];
        newpos.prev = null;
        starttime = Date.now();
        start = {
          type: 'touchstart',
          index,
          num,
          time: 0,
          ...newpos,
          client,
          page
        };
        started = false;
        end = null;
        move = { ...start, x: 0, y: 0 };
        active = true;
      } else {
        //newpos.prev = move;
        if(start && isPoint(start.client)) Point.sub(newpos, start.client);
        let distance = Point.distance(newpos, move);
        angle = /* options.angle ?*/ (Point.angle(newpos, move) * 180) / Math.PI; /* : undefined*/
        if(distance < options.step) return;
        move = { type, index, ...newpos, distance, angle, type: 'touchmove' };
      }
      index++;

      move.start = start;
      //move.time = index == 0 ? 0 : Date.now() - start.time;
      if(ends) {
        end = move;
        active = false;
        move.type = 'touchend';

        /*   move.x = prev.x;
        move.y = prev.y;*/
      }
      if(options.round) Point.round(move);
      points.push({ x: move.x, y: move.y });
      move.points = points;
      move.cancel = cancel;
      move.nativeEvent = event;
      move.index = index;
      move.num = start.num;
      //devp.logEntry(`EVENT: ${index} ${Math.round(angle)} ${move.x} ${move.y}`);
      move.prev = prev;

      (move.time = Date.now() - starttime), (move.timediff = prev && prev.time !== undefined ? move.time - prev.time : 0);

      if(/*prev && prev.time === 0 &&*/ Math.abs(90 - Math.abs(angle)) < 45) {
        if(self.handler.start() === null) self.handler.start(move);
      }

      self.handler(move);
      prev = move;
    });
  };

  self.handler = handler; /*event => {
    //console.debug('MovementListener handler(', event, ')');

    return handler(event);
  };*/
  self.handler.start = trkl(null);
  self.handler.end = trkl(null);
  self.handler.isActive = () => active;
  self.isActive = self.handler.isActive;

  if(options.noscroll) {
    self.scrollDisabler = ScrollDisabler(self.isActive, options.element);
    self.handler.scrollDisabler = self.scrollDisabler;

    self.handler.start.subscribe(event => (event === null ? self.scrollDisabler.remove() : self.scrollDisabler.add()));
    self.handler.end.subscribe(event => self.scrollDisabler.remove());
  }

  return self;
}

export function MultitouchListener(handler, options) {
  let start = null;
  let move = {};
  let end = null;
  let index = 0;
  let active = false;
  let starttime = 0;
  let points = [];
  let prev;

  options = { num: 1, noscroll: true, ...options };

  const getPos = (obj, prefix) => ({
    x: obj[prefix + 'X'],
    y: obj[prefix + 'Y']
  });

  const cancel = new trkl(() => {
    start = {};
    move = {};
    end = {};
    index = 0;
    active = false;
    starttime = 0;
    points = [];
    //console.log('MultitouchListener cancelled');
  });

  var self = function(event) {
    let type = event.type;
    let started = type.endsWith('start') || type.endsWith('down');
    let ends = type.endsWith('end') || type.endsWith('cancel') || type.endsWith('up');

    let num = event.touches && event.touches.length;
    //let touches = num > 0 ? event.touches : [event];

    if(started) {
      if(options.num != num) return true;
      start = event;
    } else if(start === null) {
      return true;
    } /*

    touches = [...touches].map((touch, touchNum) => {
      let { rotationAngle, target } = touch;
      let client = getPos(touch, 'client');
      //let page = getPos(touch, 'page');
      let radius = getPos(touch, 'radius');
      return { ...touch, radius, ...client };
    });*/

    type = type || 'touchmove';
    move = { type, index, num, time: 0, ...event };

    if(started) {
      started = false;
      index = 0;
      starttime = Date.now();
      start = move;
      end = null;
      active = true;
    } else {
      index++;
    }

    if(ends) {
      end = move;
      active = false;
    }

    event.index = index;
    event.start = start;
    event.end = end;
    event.active = active;

    self.handler(event);
    prev = event;
    if(ends) {
      end = null;
      start = null;
    }
  };

  self.handler = trkl();
  self.handler.subscribe(event =>
    //console.debug('MultitouchListener handler(', event, ')');

    handler(event)
  );
  return self;
}

export function TurnListener(handler, options) {
  let index, angle, accum, distance, center, direction, prev, startangle, turns, numTurns;

  function cancel(event) {
    angle = undefined;
    distance = undefined;
    center = undefined;
    direction = undefined;
    prev = undefined;
    numTurns = undefined;
    turns = undefined;
    //console.log('TurnListener cancelled ', event.type);
    return this.cancel(event);
  }

  return MultitouchListener(
    MovementListener(event => {
      const { points, x, y } = event;
      const type = event.type || '';
      let end = type.endsWith('up') || type.endsWith('cancel') || type.endsWith('end') || event.active === false;
      //if(type != 'touchmove') console.log('type = ', type);
      if(points.length >= 2) {
        center = points.avg();
        distance = Point.distance(event, center);
        angle = (Point.angle(center, event) * 180) / Math.PI + 90;
        angle = Math.round(angle);
        //while(angle < 0) angle += 360;
        let diff = angle - ((prev && prev.angle) || 0);
        let dir = diff > 0 ? 1 : diff < 0 ? -1 : 0;
        diff = Math.abs(diff);
        //if(diff > 270) diff -= 360;
        if(points.length == 2) {
          index = 0;
          direction = dir;
          startangle = angle;
          accum = 0;
          numTurns = 0;
        } else {
          index++;

          accum += diff;
          //if((diff > 0 && direction < 0) || (diff < 0 && direction > 0)) return cancel(event);
        }
        if(Math.abs(accum) >= 360) {
          numTurns++;
          accum = 0;
        }
        turns = numTurns + Math.abs(accum) / 360;
        //console.log('TurnListener ', { turns,numTurns, center, distance, angle, diff, direction });
      }
      let turnEvent = {
        ...event,
        index,
        turns,
        numTurns,
        center,
        distance,
        angle,
        direction,
        prev,
        cancel: cancel.bind(event)
      };
      handler(turnEvent);
      prev = turnEvent;
    }, options),
    { num: 1, ...options }
  );
}

export function SelectionListener(handler, options) {
  let origin = null,
    position,
    line,
    running = false;
  let element = null;

  options = {
    step: 1,
    round: false,
    noscroll: true,
    color: 'white',
    shadow: 'black',
    ...options
  };
  function cancel(event) {
    running = false;
    handler.destroy(event, origin);
    origin = null;
    event.cancel();
    return;
  }
  let callback = function(event) {
    const { start, x, y, type } = event;
    event.cancel.subscribe(cancel);

    if(type.endsWith('end') || type.endsWith('up')) {
      event.cancel(event);
    }

    if(type.endsWith('start') || type.endsWith('down')) {
      origin = new Point(start.x, start.y);
      return;
    }

    if(type.endsWith('move') && origin) {
      position = new Point(x, y).add(origin);
      line = new Line(origin.round(), position.round());
      let rect = Rect.round(line.bbox());
      event.line = line;

      if(!running) {
        running = true;
        handler.create(line, event, origin);
      } else {
        handler.update(line, event, origin);
      }
    }
  };

  return MovementListener(callback, options);
}

export function SelectionRenderer() {
  return {
    element: null,
    create(rect) {
      //console.log("SelectionListener.create(", rect, ")");
      this.element = CreateElement('div', { id: `selection-rect` }, globalThis.window ? window.document.body : null);
      SetCSS(this.element, {
        position: 'fixed',
        border: '3px dashed white',
        filter: `drop-shadow(1px 1px 1px black)`,
        zIndex: 999999999
      });
      this.update(rect);
    },
    update(rect) {
      //console.log("SelectionListener.update(", rect, ")");
      Element.rect(this.element, rect, { position: 'absolute' });
    },
    destroy() {
      //Element.remove(this.element);
      this.element.parentElement.removeChild(this.element);
    }
  };
}

export const TouchEvents = listener => ({
  onTouchStart: listener,
  onTouchEnd: listener,
  onTouchMove: listener,
  onTouchCancel: listener
});

export const MouseEvents = listener => ({
  onMouseDown: listener,
  onMouseMove: listener,
  onMouseUp: listener //e => {console.log("onMouseUp"); listener(e); }
});

export const addTouchListeners = (listener, element, passive = true) => {
  element.addEventListener('touchstart', listener, { passive });
  element.addEventListener('touchend', listener, { passive });
  element.addEventListener('touchmove', listener, { passive });
  element.addEventListener('touchcancel', listener, { passive });
  return element;
};

export const addMouseListeners = (listener, element, passive = true) => {
  element.addEventListener('mousedown', listener, { passive });
  element.addEventListener('mouseup', listener, { passive });
  element.addEventListener('mousemove', listener, { passive });
  return element;
};

export function TouchListener(handler, options) {
  options = {
    listener: MovementListener,
    noscroll: true,
    lastTouch: true,
    ...options
  };
  //console.log("new TouchListener ", { handler, options });

  let listen = options.listener(handler, options);
  listen.handler.listener = listen;
  if(options.element) {
    listen.handler.element = options.element;
    addTouchListeners(listen, options.element);
    addMouseListeners(listen, options.element);
  } else {
    listen.handler.events = {
      ...TouchEvents(listen),
      ...MouseEvents(listen)
    };
  }

  if(!TouchListener.list) {
    TouchListener.list = [];
    TouchListener.list.push(listen);
  }

  return listen.handler;
}

export const TouchHandler = (handle, options) => {
  let running = false;
  //console.log("new TouchHandler ", { handle, options });

  let fn = function(event) {
    const { nativeEvent } = event;
    event = typeof event.type == 'string' && event.type.length >= 1 ? event : nativeEvent;
    const { type } = event;

    //console.log("TouchHandler ", { type, event });
    if(type.endsWith('start') || type.endsWith('down')) {
      running = true;
      handle.start(event);
    } else if(type.endsWith('move')) {
      try {
        if(globalThis.window) {
          window.touchEvent = event;
          window.touchNativeEvent = nativeEvent;
        }
      } catch(err) {}

      if(running) handle.move(event);
    } else if(type.endsWith('end') || type.endsWith('up')) {
      running = false;
      handle.end(event);
      //event.cancel();
    } else if(type.endsWith('cancel')) handle.cancel(event);
  };
  return TouchListener(fn, options);
};

export default TouchListener;
