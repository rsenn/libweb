const trees = new WeakMap();

function keyOf(obj, prop) {
  if(obj instanceof Array) {
    let key = obj.findIndex(item => item === prop);
    if(key != -1) return key;
  } else {
    for(let key in obj) if(obj[key] === prop) return key;
  }
}

function* walk(node, parent = null) {
  yield [node, parent];

  for(let key in node) {
    if(typeof node[key] == 'object' && node[key] !== null) yield* walk(node[key], node);
  }
}

/*function Node(node, parent, tree) {
  if(!(this instanceof Node)) return new Node(node, parent);

  this.parent = parent;

  Object.defineProperties(this, {
    node: { value: node, enumerable: false },
    tree: { value: tree, enumerable: false }
  });
  return this;
}

Object.defineProperties(Node.prototype, {
  path: {
    get() {
      let { node, parent, tree } = this;
      let p = [];
      do {
        p.unshift(keyOf(parent, node));

        [node, parent] = [parent, tree(parent).parent];
      } while(parent);
      return p;
    }
  }
});*/

export function Tree(root) {
  let tree;

  if((tree = trees.get(root))) return tree;

  let map = new WeakMap();

  tree = function(node) {
    return map.get(node);
  };

  for(let [node, parent] of walk(root)) {
    map.set(node, parent);
  }
  Object.defineProperties(tree, {
    map: { value: map, enumerable: false },
    root: { value: root, enumerable: false }
  });

  Object.setPrototypeOf(tree, Tree.prototype);
  return tree;
}

Object.setPrototypeOf(Tree.prototype,
  Object.getPrototypeOf(function Tree() {})
);

Tree.prototype.at = function(path) {
  let node = this.root;

  for(let key of path) node = node[key];
  return node;
};
Tree.prototype.pathOf = function(obj) {
  const { map } = this;
  let parent,
    p = [];
  do {
    parent = map.get(obj);

    p.unshift(keyOf(parent, obj));

    [obj, parent] = [parent, map.get(parent)];
  } while(parent);
  return p;
};
Tree.prototype.parentNode = function(obj) {
  const { map } = this;
  return map.get(obj);
};

Tree.prototype.splice = function(node, start, deleteCount, ...add) {
  const { map } = this;
  let removed = node.splice(start, deleteCount, ...add);

  for(let item of removed) for (let [child, parent] of walk(item, node)) map.delete(child);

  for(let item of add)
    for(let [child, parent] of walk(item, node)) map.set(child, new Node(child, parent, this));

  return removed;
};

export default Tree;
