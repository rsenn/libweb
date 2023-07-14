import { define } from './misc.js';

export function Location(line, column, pos, file, freeze = true) {
  let obj = this || new.target.test || this ? this : {};

  /*console.log("obj.constructor:",obj.constructor);
  //console.log("freeze:",freeze);*/
  Object.assign(obj, {
    line,
    column,
    pos,
    file
  });
  if(this !== obj) Object.setPrototypeOf(obj, Location.prototype);

  return freeze && obj.constructor === Location ? Object.freeze(obj) : obj;
}

Location.prototype.clone = function(freeze = false, withFilename = true) {
  const { line, column, pos, file } = this;

  return new Location(line, column, pos, withFilename ? file : null, freeze);
};
Location.prototype[Symbol.toStringTag] = 'Location';

Location.prototype[Symbol.iterator] = function* () {
  let { file, line, column } = this;
  let v = file ? [file, line, column] : [line, column];
  yield* v;
};
Location.prototype.toString = function(opts = {}) {
  const { line, column, file } = this;
  return (file ? file + ':' : '') + line + ':' + column;
};
Location.prototype.valueOf = function() {
  return this.pos;
};
Location.prototype[Symbol.toPrimitive] = function(hint) {
  if(hint == 'number') return this.pos;
  if(hint == 'string') return this.toString();
};
Location.prototype[Symbol.for('nodejs.util.inspect.custom')] = function(n, opts) {
  return this.toString({ colors: true });
  return inspect(this, {
    colors: true,
    ...opts,
    toString: Symbol.toStringTag
  });
};
/*
Location.prototype.valueOf = function() {
  return this.pos;
};*/

define(Location.prototype, {
  /* prettier-ignore */ get offset() {
    return this.valueOf();
  }
});
