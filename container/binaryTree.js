import { toSource } from '../misc.js';
import Util from '../util.js';

function Node(value, left = null, right = null) {
  let node = this instanceof Node ? this : Object.create(Node.prototype);

  node.value = value;
  node.left = left; // instanceof Node ? left : new Node(left);
  node.right = right; // instanceof Node ? right : new Node(right);

  return node;
}

Node.fromArray = function(a) {
  const n = a.length;
  if(n == 0) return null;

  const i = Math.floor(n / 2);
  return new Node(a[i], Node.fromArray(a.slice(0, i)), Node.fromArray(a.slice(i + 1)));
};

Node.prototype.isLeaf = function() {
  return this.left == null && this.right == null;
};

Node.prototype.toSource = function() {
  const { value, left, right } = this;
  if(this.isLeaf()) return `new BinaryTree.Node(${Util.toSource(value)})`;
  return `new BinaryTree.Node(${Util.toSource(value)}, ${left && left.toSource()}, ${right && right.toSource()})`;
};

export class BinaryTree {
  static Node = Node;

  constructor(...args) {
    if(args.length == 0) {
      this.root = null;
    } else if(args.length == 1) {
      this.root = args[0];
    } else {
      this.root = new Node(...args);
    }
  }

  static fromArray(a) {
    return new BinaryTree(Node.fromArray(a));
  }

  get inOrder() {
    return inOrder(this.root);
  }
  get preOrder() {
    return preOrder(this.root);
  }
  get postOrder() {
    return postOrder(this.root);
  }
}

function* inOrder(node) {
  if(node) {
    yield* inOrder(node.left);
    yield node.value;
    yield* inOrder(node.right);
  }
}

function* preOrder(node) {
  if(node) {
    yield node.value;
    yield* preOrder(node.left);
    yield* preOrder(node.right);
  }
}

function* postOrder(node) {
  if(node) {
    yield* postOrder(node.left);
    yield* postOrder(node.right);
    yield node.value;
  }
}
