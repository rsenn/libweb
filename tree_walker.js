export const SHOW_ALL = 0b11111111111111111111111111111111;
export const SHOW_ATTRIBUTE = 2;
export const SHOW_CDATA_SECTION = 8;
export const SHOW_COMMENT = 128;
export const SHOW_DOCUMENT = 256;
export const SHOW_DOCUMENT_FRAGMENT = 1024;
export const SHOW_DOCUMENT_TYPE = 512;
export const SHOW_ELEMENT = 1;
export const SHOW_ENTITY = 32;
export const SHOW_ENTITY_REFERENCE = 16;
export const SHOW_NOTATION = 2048;
export const SHOW_PROCESSING_INSTRUCTION = 64;
export const SHOW_TEXT = 4;

export const FILTER_ACCEPT = 1;
export const FILTER_REJECT = 2;
export const FILTER_SKIP = 3;

export class TreeWalker {
  root;
  whatToShow;
  filter;
  currentNode = null;

  #stack = [];

  constructor(root, mask, filter = () => true, transform = a => a) {
    this.root = root;
    this.whatToShow = mask ?? SHOW_ALL;
    this.filter = filter;
  }

  firstChild() {
    this.#stack.push(this.currentNode);
    return (this.currentNode = this.currentNode.children[0]);
  }

  lastChild() {
    this.#stack.push(this.currentNode);
    return (this.currentNode = this.currentNode.children[this.currentNode.children.length - 1]);
  }

  nextNode() {
    if(this.currentNode === null) return (this.currentNode = this.root);

    return (this.currentNode = this.currentNode.nextElementSibling);
  }

  nextSibling() {
    return (this.currentNode = this.currentNode.nextSibling);
  }

  parentNode() {
    return (this.currentNode = this.#stack.pop());
  }

  previousNode() {
    return (this.currentNode = this.currentNode.previousElementSibling);
  }

  previousSibling() {
    return (this.currentNode = this.currentNode.previousSibling);
  }
}

Object.assign(TreeWalker, { FILTER_ACCEPT,FILTER_REJECT,FILTER_SKIP, TYPE_ALL: SHOW_ALL});
