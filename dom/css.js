

export class CSS {
  static list(doc) {
    if(!doc) doc = window.document;

    const getStyleMap = (obj, key) => {
      let rule = Util.find(obj, item => item["selectorText"] == key);
      return Util.adapter(
        rule,
        obj => (obj && obj.styleMap && obj.styleMap.size !== undefined ? obj.styleMap.size : 0),
        (obj, i) => [...obj.styleMap.keys()][i],
        (obj, key) =>
          obj.styleMap
            .getAll(key)
            .map(v => String(v))
            .join(" ")
      );
    };
    const getStyleSheet = (obj, key) => {
      let sheet = Util.find(obj, entry => entry.href == key || entry.ownerNode.id == key) || obj[key];

      return Util.adapter(
        sheet.rules,
        obj => (obj && obj.length !== undefined ? obj.length : 0),
        (obj, i) => obj[i].selectorText,
        getStyleMap
      );
    };
    return Util.adapter(
      [...doc.styleSheets],
      obj => obj.length,
      (obj, i) => obj[i].href || obj[i].ownerNode.id || i,
      getStyleSheet
    );
  }
  static styles(stylesheet) {
    const list = stylesheet && stylesheet.cssRules ? [stylesheet] : CSS.list(stylesheet);
    let ret = Util.array();

    list.forEach(s => {
      let rules = [...s.cssRules];

      rules.forEach(rule => {
        ret.push(rule.cssText);
      });
    });
    return ret;
  }
  static classes(selector = "*") {
    return Element.findAll(selector)
      .filter(e => e.classList.length)
      .map(e => [...e.classList])
      .flat()
      .unique();
  }
}