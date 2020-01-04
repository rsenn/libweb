import { isPoint, Point, PointList } from "./dom.js";
import { trkl } from "./trkl.js";
import { ScrollDisabler } from "../utils/scrollHandler.js";

export function MovementListener(handler, options) {
  var start = null;
  var move = {};
  var end = {};
  var index = 0;
  var active = false;
  var starttime = 0;
  var points = new PointList();
  var prev;

  function cancel() {
    start = null;
    move = {};
    end = {};
    index = 0;
    active = false;
    starttime = 0;
    points = new PointList();
    prev = {};
    //console.log('MovementListener cancelled');
  }

  options = { step: 1, round: false, angle: false, noscroll: true, ...options };
  //console.log("new MovementListener(", handler, ",", options, ")");

  var self = function(event) {
    //console.log("MovementListener(", { event }, ")");
    const { nativeEvent, button, buttons } = event;
    let currentTarget = nativeEvent ? nativeEvent.currentTarget : event.currentTarget;

    var type = event.type.toLowerCase();
    var started = type.endsWith("start") || type.endsWith("down");
    var ends = type.endsWith("end") || type.endsWith("cancel") || type.endsWith("up");

    if(!started && !ends && start === null) return;

    if(ends) {
      let x = prev && prev.x !== undefined ? prev.x : 0;
      let y = prev && prev.y !== undefined ? prev.y : 0;
      active = false;
      end = { x, y, ...event, start, starttime, points, cancel, type, index, active };
      end.time = Date.now() - starttime;
      if(end && prev) end.timediff = end.time - prev.time;
      end.distance = Point.distance(end, { x, y });
      //end.type = 'touchend';$

      self.handler({ ...end, type: "touchend", end });

      self.handler.start(null);
      self.handler.end(end);
      /*if(type.endsWith('cancel'))*/ cancel();
      return;
    }
    if(event.touches !== undefined && event.touches.length === 0) return;

    let touches = event.touches && event.touches.length > 0 ? event.touches : [event];

    if(options.lastTouch) touches = [touches[touches.length - 1]];

    let num = touches.length;

    const getPos = (obj, prefix) => ({ x: obj[prefix + "X"], y: obj[prefix + "Y"] });
    [...touches].forEach((touch, touchNum) => {
      let { rotationAngle, target } = touch;
      let client = getPos(touch, "client");
      let page = getPos(touch, "page");
      let radius = getPos(touch, "radius");
      let newpos = { radius, rotationAngle, target, currentTarget, button, buttons, ...client };
      let angle;
      if(started) {
        index = 0;
        points = new PointList();
        newpos.prev = null;
        starttime = Date.now();
        start = { type: "touchstart", index, num, time: 0, ...newpos, client, page };
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
        move = { type, index, ...newpos, distance, angle, type: "touchmove" };
      }
      index++;

      move.start = start;
      //move.time = index == 0 ? 0 : Date.now() - start.time;
      if(ends) {
        end = move;
        active = false;
        move.type = "touchend";
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
  self.handler.isActive = () => {
    return active;
  };
  self.isActive = self.handler.isActive;

  if(options.noscroll) {
    self.scrollDisabler = ScrollDisabler(self.isActive);
    self.handler.scrollDisabler = self.scrollDisabler;

    self.handler.start.subscribe(event => (event === null ? self.scrollDisabler.remove() : self.scrollDisabler.add()));
    self.handler.end.subscribe(event => self.scrollDisabler.remove());
  }

  return self;
}

export function MultitouchListener(handler, options) {
  var start = null;
  var move = {};
  var end = null;
  var index = 0;
  var active = false;
  var starttime = 0;
  var points = new PointList();
  var prev;

  options = { num: 1, noscroll: true, ...options };

  const getPos = (obj, prefix) => ({ x: obj[prefix + "X"], y: obj[prefix + "Y"] });

  function cancel() {
    start = {};
    move = {};
    end = {};
    index = 0;
    active = false;
    starttime = 0;
    points = new PointList();
    //console.log('MultitouchListener cancelled');
  }

  var self = function(event) {
    var type = event.type;
    var started = type.endsWith("start") || type.endsWith("down");
    var ends = type.endsWith("end") || type.endsWith("cancel") || type.endsWith("up");

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

    type = type || "touchmove";
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
  self.handler.subscribe(event => {
    //console.debug('MultitouchListener handler(', event, ')');

    return handler(event);
  });
  return self;
}

export function TurnListener(handler, options) {
  var index, angle, accum, distance, center, direction, prev, startangle, turns, numTurns;

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
      const type = event.type || "";
      var end = type.endsWith("up") || type.endsWith("cancel") || type.endsWith("end") || event.active === false;
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

export const TouchEvents = listener => ({
  onTouchStart: listener,
  onTouchEnd: listener,
  onTouchMove: listener,
  onTouchCancel: listener
});

export const MouseEvents = listener => ({
  onMouseDown: listener,
  onMouseMove: listener,
  onMouseUp: listener
});

export const addTouchListeners = (listener, element, passive = true) => {
  element.addEventListener("touchstart", listener, { passive });
  element.addEventListener("touchend", listener, { passive });
  element.addEventListener("touchmove", listener, { passive });
  element.addEventListener("touchcancel", listener, { passive });
  return element;
};

export const addMouseListeners = (listener, element, passive = true) => {
  element.addEventListener("mousedown", listener, { passive });
  element.addEventListener("mouseup", listener, { passive });
  element.addEventListener("mousemove", listener, { passive });
  return element;
};

export function TouchListener(handler, options) {
  options = { listener: MovementListener, noscroll: true, lastTouch: true, ...options };
  //console.log("new TouchListener ", { handler, options });

  var listen = options.listener(handler, options);
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
  var running = false;
  //console.log("new TouchHandler ", { handle, options });

  var fn = function(event) {
    const { nativeEvent } = event;
    event = typeof event.type == "string" && event.type.length >= 1 ? event : nativeEvent;
    const { type } = event;

    //console.log("TouchHandler ", { type, event });
    if(type.endsWith("start") || type.endsWith("down")) {
      running = true;
      handle.start(event);
    } else if(type.endsWith("move")) {
      if(global.window) {
        window.touchEvent = event;
        window.touchNativeEvent = nativeEvent;
      }

      if(running) handle.move(event);
    } else if(type.endsWith("end") || type.endsWith("up")) {
      running = false;
      handle.end(event);
      //  event.cancel();
    } else if(type.endsWith("cancel")) handle.cancel(event);
  };
  return TouchListener(fn, options);
};

export default TouchListener;
