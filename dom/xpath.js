export class XPath {
	static evaluate(xpath, context = document) {
    let expression =   document.createExpression(xpath, ns => {
      switch(ns) {
        case 'svg': return "http://www.w3.org/2000/svg";
        case 'xhtml': return "http://www.w3.org/1999/xhtml";
        default: return "http://www.w3.org/1999/xhtml";
      }
    });

    let result = expression.evaluate(context);

switch(result.resultType) {
  case XPathResult.NUMBER_TYPE: return result.numberValue;
  case XPathResult.STRING_TYPE: return result.stringValue;
  case XPathResult.BOOLEAN_TYPE: return result.booleanValue;
}
let it = {
  next() {
    let value = result.iterateNext();
    return { value, done: value === null };
  },
  [Symbol.iterator]() {
    return this;
  }
};
let a = [...it];
    return a.length == 1 ? a[0] : a.length == 0 ? null : a;
	}
}