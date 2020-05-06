import { Element } from "./element.js";

export class Select {
  static create(entries, factory = Element.create) {
    let elem = factory("select", {});

    for(let [value, text] of entries) {
      let o = factory("option", { value, innerHTML: text }, elem);
    }
    return elem;
  }
}
