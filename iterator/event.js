import { EventEmitter } from '../../quickjs/qjs-modules/lib/events.js';
import { tryCatch } from '../misc.js';
import { Repeater } from '../repeater/repeater.js';

export function EventIterator(events, target = tryCatch(() => window)) {
  let emitter = new EventEmitter(target);
  if(typeof events == 'string') events = EventIterator[events + 'Events'] || events.split(/,/g);

  let iter = new Repeater(async (push, stop) => {
    let handler = e => {
      e.emitter = emitter;
      push(e);
    };

    for(let type of events) emitter.on(type, handler);
    console.log('registered', events);
    await stop;

    /*for(let type of events) emitter.off(type, handler);
      console.log('unregistered', events);*/
    emitter.reset();
  });
  return define(iter, { emitter, target });
  iter.emitter = emitter;
  return iter;
}
