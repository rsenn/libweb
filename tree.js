const trees = new WeakMap();

export function Tree(root) {
  let tree;

  if ((tree = trees.get(root))) return tree;

  let parents = new WeakMap();

  tree = function (arg) {
    let path, node;

    if (
      (typeof arg == 'string' || Array.isArray(arg)) &&
      (node = tree.at(arg))
    ) {
    } else if (isObject(arg) && parents.has(arg)) {
      node = arg;
    } else if (Array.isArray(arg) && arg.length == 2) {
      if (isObject(arg[1]) && parents.has(arg[1])) [path, node] = arg;
      else if (isObject(arg[0]) && parents.has(arg[0])) [node, path] = arg;
    }
    path = tree.pathOf(node);

    return [path + '' /*.join(Tree.PATH_SEPARATOR)*/, node];
  };

  for (let [node, parent] of walk(root)) {
    if (isObject(node)) parents.set(node, parent);
  }

  Object.defineProperties(tree, {
    parents: { value: parents, enumerable: false },
    root: { value: root, enumerable: false }
  });

  Object.setPrototypeOf(tree, Tree.prototype);
  return tree;
}

Object.setPrototypeOf(
  Tree.prototype,
  Object.getPrototypeOf(function Tree() {})
);

Tree.PATH_SEPARATOR = '.';

Tree.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
  const { parents, root } = this;
  return Object.setPrototypeOf({ parents /*,root*/ }, { constructor: Tree });
};

Tree.prototype.at = function (path) {
  try {
    let node = this.root;
    if (typeof path == 'string') path = path.split(Tree.PATH_SEPARATOR);
    for (let key of path) node = node[key];
    return node;
  } finally {
  }
};

Tree.prototype.pathOf = function (obj) {
  const { parents } = this;
  let parent = parents.get(obj),
    p = [];
  while (parent) {
    p.unshift(keyOf(parent, obj));
    [obj, parent] = [parent, parents.get(parent)];
  }
  p.toString = function () {
    return Array.prototype.join.call(this, Tree.PATH_SEPARATOR);
  };
  return parent === null ? p : undefined;
};

Tree.prototype.depth = function (obj) {
  const { parents } = this;
  let d = 0;
  for (let parent = parents.get(obj); parent; d++) {
    [obj, parent] = [parent, parents.get(parent)];
  }
  return d;
};

Tree.prototype.parentNode = function (obj) {
  const { parents } = this;
  return parents.get(obj);
};

Tree.prototype.anchestors = function* (obj, t = (node) => node) {
  const { parents } = this;
  while ((obj = parents.get(obj))) yield t(obj);
};

Tree.prototype.keyOf = function (obj, prop) {
  if (prop === undefined) {
    prop = obj;
    obj = this.parentNode(prop);
  }
  return keyOf(obj, prop);
};

Tree.prototype.indexOf = function (obj, prop) {
  if (prop === undefined) {
    prop = obj;
    obj = this.parentNode(prop);
  }
  return indexOf(obj, prop);
};

Tree.prototype.splice = function (node, start, deleteCount, ...add) {
  const { parents } = this;
  let removed = splice(node, start, deleteCount, ...add);
  mapRecurse((child) => parents.delete(child), node, ...removed);
  mapRecurse((child, parent) => parents.set(child, parent), node, ...add);
  return removed;
};

Tree.prototype.shift = function (node) {
  let [removed] = splice(node, 0, 1);
  mapRecurse((child) => this.parents.delete(child), node, removed);
  return removed;
};

Tree.prototype.unshift = function (node, ...add) {
  mapRecurse((child, parent) => this.parents.set(child, parent), node, ...add);
  splice(node, 0, 0, ...children);
  return sizeOf(node);
};

Tree.prototype.pop = function (node) {
  let [removed] = splice(node, sizeOf(node) - 1, 1);
  mapRecurse((child) => this.parents.delete(child), node, removed);
  return removed;
};

Tree.prototype.push = function (node, ...children) {
  mapRecurse(
    (child, parent) => this.parents.set(child, parent),
    node,
    ...children
  );
  splice(node, sizeOf(node), 0, ...children);
  return sizeOf(node);
};

Tree.prototype.remove = function (node) {
  let parent = Tree.prototype.parentNode.call(this, node);
  let index = Tree.prototype.indexOf.call(this, parent, node);

  let [removed] = splice(parent, index, 1);
  mapRecurse((child) => this.parents.delete(child), node, removed);
  return removed;
};

Tree.prototype.entries = function* (node = this.root) {
  yield* recurse(Tree.prototype.pathOf.call(this, node), node);
};

Tree.prototype.keys = function* (node = this.root) {
  for (let iter of Tree.prototype.entries.call(this, node)) yield iter[0];
};

Tree.prototype.values = function* (node = this.root) {
  for (let iter of Tree.prototype.entries.call(this, node)) yield iter[1];
};

Tree.prototype.flat = function (transform, pred) {
  let iter = Tree.prototype.entries.call(this);
  if (!transform) transform = ([path, node]) => [path.join('.'), node];
  if (transform) iter = map(iter, transform);

  if (pred) iter = filter(iter, pred);
  return new Map(iter);
};

Tree.prototype[Symbol.iterator] = function () {
  return map(Tree.prototype.entries.call(this), ([path, node]) => [
    path.join('.'),
    node
  ]);
};

Tree.prototype.filter = function (pred) {
  return filter(Tree.prototype.entries.call(this), ([path, node]) =>
    pred(node, path, this)
  );
};

function isObject(o) {
  return typeof o == 'object' && o != null;
}

function keyOf(obj, prop) {
  if (obj instanceof Array) {
    let key = obj.findIndex((item) => item === prop);
    if (key != -1) return key;
  } else {
    for (let key in obj) if (obj[key] === prop) return key;
  }
}

function sizeOf(obj) {
  if (!(obj instanceof Array)) obj = Object.getOwnPropertyNames(obj);
  return obj.length;
}

function keyAt(obj, index) {
  return obj instanceof Array ? index : Object.getOwnPropertyNames(obj)[index];
}

function entries(obj) {
  return obj instanceof Array
    ? Array.prototype.entries.call(obj)
    : Object.getOwnPropertyNames(obj).map((prop) => [prop, obj[prop]]);
}

function keys(obj) {
  if (typeof obj == 'object' && obj != null)
    return obj instanceof Array
      ? Array.prototype.keys.call(obj)
      : Object.getOwnPropertyNames(obj);
  return [];
}

function indexOf(obj, prop) {
  let props = keys(obj);
  let i = 0;

  for (let key of props) {
    if (obj[key] === prop) return i;
    ++i;
  }
  return -1;
}

function splice(obj, start, deleteCount, ...addItems) {
  if (obj instanceof Array)
    return Array.prototype.splice.call(obj, start, deleteCount, ...addItems);
  //console.log('splice', { obj, start, deleteCount, addItems });
  let remove = [...entries(obj)].slice(start, start + deleteCount);
  //console.log('splice', { remove });
  let removed = [];
  for (let [name, value] of remove) {
    delete obj[name];
    removed.push(value);
  }
  let add = addItems.reduce(
    (a, i) => (i instanceof Array ? [...a, i] : [...a, ...entries(i)]),
    []
  );
  for (let [name, value] of add) {
    obj[name] = value;
  }
  return removed;
}

function* walk(node, parent = null) {
  yield [node, parent];
  for (let key in node) {
    if (typeof node[key] == 'object' && node[key] !== null)
      yield* walk(node[key], node);
  }
}

function* recurse(path = [], node) {
  yield [path, node];
  for (let key of keys(node)) yield* recurse(path.concat([key]), node[key]);
}

function* map(iter, fn) {
  for (let item of iter) yield fn(item);
}

function* filter(iter, pred) {
  for (let item of iter) if (pred(item)) yield item;
}

function mapRecurse(callback, node, ...children) {
  for (let child of children) {
    if (typeof item == 'object' && item !== null)
      for (let args of walk(item, node)) callback(...args);
  }
  return children;
}

export default Tree;
