import { ImmutablePath } from '../json.js';
import { className, isObject } from '../misc.js';

const isBrowser = () => !!globalThis.navigator;

const pathPadding = isBrowser() ? 0 : 40;

export const coloring = isBrowser()
  ? {
      concat: (...args) => args.join(''),
      text: t => t
    }
  : {
      concat: (...args) => args.join(''),
      text: (t, ...ansi) => `\x1b[${ansi.join(';')}m${t}\x1b[0m`
    };

export const concat = coloring.concat.bind(coloring);

export const text = coloring.text.bind(coloring);

export const dingbatCode = digit => (digit % 10 == 0 ? circles[0] : String.fromCharCode((digit % 10) + circles[1].charCodeAt(0) - 1));

export const Palette = {
  board: (m = (r, g, b) => [r, g, b]) =>
    [
      [255, 255, 255], // 0
      [75, 75, 165],
      [75, 165, 75],
      [75, 165, 165],
      [165, 75, 75],
      [165, 75, 165], // 5
      [165, 165, 75],
      [175, 175, 175], // 7
      [75, 75, 255],
      [75, 255, 75],
      [75, 255, 255],
      [255, 75, 75],
      [255, 75, 255],
      [255, 255, 75],
      [75, 75, 75],
      [165, 165, 165],
      [180, 180, 180], // 16
      [90, 90, 90],
      [192, 192, 192] // 24
    ].map(c => m(...c)),
  schematic: (m = (r, g, b) => [r, g, b]) =>
    [
      [255, 255, 255],
      [75, 75, 165],
      [75, 165, 75],
      [75, 165, 165],
      [165, 75, 75],
      [165, 75, 165],
      [165, 165, 75],
      [175, 175, 175],
      [75, 75, 255],
      [75, 255, 75],
      [75, 255, 255],
      [255, 75, 75],
      [255, 75, 255],
      [255, 255, 75],
      [75, 75, 75],
      [165, 165, 165],
      [175, 175, 175]
    ].map(c => m(...c))
};

export const dump = (o, depth = 2, breakLength = 400) => {
  const isElement = o => isObject(o) && ['EagleElement', 'EagleNode', 'EagleDocument'].indexOf(className(o)) != -1;
  let s;
  if(o instanceof Array) {
    s = '';
    for(let i of o) {
      if(s.length > 0) s += isElement(i) ? ',\n' : ', ';
      s += dump(i, depth - 1, breakLength);
    }
  } else if(isElement(o)) {
    s = EagleInterface.inspect(o, undefined, { depth, path: false });
    depth * 4;
  } else
    s = inspect(o, {
      depth,
      newline: '',
      colors: !isBrowser(),
      breakLength
    });
  return s;
};

export const parseArgs = args => {
  let ret = { path: [] };

  while(args.length > 0) {
    if(args[0] instanceof ImmutablePath) {
      ret.path = args.shift();
    } else if(args[0] instanceof RegExp) {
      let re = args.shift();
      ret.predicate = it => re.test(it.tagName);
    } else if(args[0] instanceof Array) {
      ret.path = new ImmutablePath(args.shift());
    } else if(typeof args[0] == 'function') {
      if(ret.predicate === undefined) ret.predicate = args.shift();
      else ret.transform = args.shift();
    } else if(typeof args[0] == 'string') {
      if(ret.element === undefined) ret.element = args.shift();
      else ret.name = args.shift();
    } else if(typeof args[0] == 'object') {
      const { predicate, transform, element, name } = args.shift();
      Object.assign(ret, { predicate, transform, element, name });
    } else {
      throw new Error('unhandled: ' + typeof args[0] + dump(args[0]));
    }
  }
  if(typeof ret.predicate != 'function' && (ret.element || ret.name)) {
    if(ret.name) ret.predicate = v => v.tagName == ret.element && v.attributes.name == ret.name;
    else ret.predicate = v => v.tagName == ret.element;
  }
  return ret;
};

export const traverse = function* (obj, path = [], doc) {
  if(!(path instanceof ImmutablePath)) path = new ImmutablePath(path);
  yield [obj, path, doc];
  if(typeof obj == 'object') {
    if(Array.isArray(obj)) {
      for(let i = 0; i < obj.length; i++) yield* traverse(obj[i], path.concat([i]), doc);
    } else if('children' in obj && Array.isArray(obj.children)) {
      for(let i = 0; i < obj.children.length; i++) yield* traverse(obj.children[i], path.concat(['children', i]), doc);
    }
  }
};