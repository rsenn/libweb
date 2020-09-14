export class Node {
  static parents(node) {
    return (function* () {
      let n = node;
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
      ? Array.from(node.attributes).reduce((acc, attr) => ({
            ...acc,
            [attr.name]: isNaN(parseFloat(attr.value)) ? attr.value : parseFloat(attr.value)
          }),
          {}
        )
      : {};
  }

  static *map(map, propFn) {
    if(!propFn && 'getPropertyValue' in map) propFn = k => [k, map.getPropertyValue(k)];

    if(!propFn && typeof map.item == 'function')
      propFn = (k, i) => {
        let { name, value } = map.item(i);
        return [name, value];
      };

    for(let i = 0; i < map.length; i++) yield propFn(map[i], i, map);
  }
}

export default Node;
