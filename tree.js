const trees = new WeakMap();

function* walk(node, parent = null) {
  yield [node, parent];

  for(let key in node) {
    if(typeof node[key] == 'object' && node[key] !== null) yield* walk(node[key], node);
  }
}

export function tree(root) {
  let self;

  if((self = trees.get(root))) return self;

  let map = new WeakMap();

  for(let [node, parent] of walk(root)) {
    map.set(node, { parent });
  }

  self = function(node) {
    return map.get(node);
  };

  Object.setPrototypeOf(self, tree.prototype);
  return self;
}

Object.setPrototypeOf(tree.prototype,
  Object.getPrototypeOf(function () {})
);

export default tree;
