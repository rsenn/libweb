export class Node {
  static parents(node) {
    return (function*() {
      var n = node;
      do {
        if(n) yield n;
      } while(n && (n = n.parentNode));
    })();
  }

  static depth(node) {
    let r = 0;
    while(node && node.parentNode) {
      r++;
      node = node.parentNode;
    }
    return r;
  }

  static attrs(node) {
    return node.attributes && node.attributes.length > 0
      ? Array.from(node.attributes).reduce(
          (acc, attr) => ({
            ...acc,
            [attr.name]: isNaN(parseFloat(attr.value))
              ? attr.value
              : parseFloat(attr.value)
          }),
          {}
        )
      : {};
  }
}

export default Node;
