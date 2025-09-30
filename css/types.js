export var SelectorType = /*#__PURE__*/ (function (SelectorType) {
  SelectorType["Attribute"] = "attribute";
  SelectorType["Pseudo"] = "pseudo";
  SelectorType["PseudoElement"] = "pseudo-element";
  SelectorType["Tag"] = "tag";
  SelectorType["Universal"] = "universal";
  // Traversals
  SelectorType["Adjacent"] = "adjacent";
  SelectorType["Child"] = "child";
  SelectorType["Descendant"] = "descendant";
  SelectorType["Parent"] = "parent";
  SelectorType["Sibling"] = "sibling";
  SelectorType["ColumnCombinator"] = "column-combinator";
  return SelectorType;
})({});
/**
 * Modes for ignore case.
 *
 * This could be updated to an enum, and the object is
 * the current stand-in that will allow code to be updated
 * without big changes.
 */ export const IgnoreCaseMode = {
  Unknown: null,
  QuirksMode: "quirks",
  IgnoreCase: true,
  CaseSensitive: false
};
export var AttributeAction = /*#__PURE__*/ (function (AttributeAction) {
  AttributeAction["Any"] = "any";
  AttributeAction["Element"] = "element";
  AttributeAction["End"] = "end";
  AttributeAction["Equals"] = "equals";
  AttributeAction["Exists"] = "exists";
  AttributeAction["Hyphen"] = "hyphen";
  AttributeAction["Not"] = "not";
  AttributeAction["Start"] = "start";
  return AttributeAction;
})({});
