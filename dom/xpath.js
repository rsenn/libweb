export class XPath {
  static evaluate(xpath, context = document, resultType) {
    let expression = document.createExpression(xpath, ns => {
      switch (ns) {
        case 'svg':
          return 'http://www.w3.org/2000/svg';
        case 'xhtml':
          return 'http://www.w3.org/1999/xhtml';
        default: return 'http://www.w3.org/1999/xhtml';
      }
    });

    let result = expression.evaluate(context, resultType || XPathResult.ORDERED_NODE_SNAPSHOT_TYPE || XPathResult.ORDERED_NODE_ITERATOR_TYPE);
    let ret;
    switch (result.resultType) {
      case XPathResult.NUMBER_TYPE:
        ret = result.numberValue;
        break;
      case XPathResult.STRING_TYPE:
        ret = result.stringValue;
        break;
      case XPathResult.BOOLEAN_TYPE:
        ret = result.booleanValue;
        break;
      case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
      case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
        let it = {
          next() {
            let value = result.iterateNext();
            return { value, done: value === null };
          }
        };
        ret = {
          [Symbol.iterator]() {
            return it;
          }
        };
        break;

      case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
      case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
        let gen = function* () {
          for(let i = 0; i < result.snapshotLength; i++) yield result.snapshotItem(i);
        };
        ret = gen();
        break;
    }
    return ret;
  }
}
