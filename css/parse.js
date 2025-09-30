import { SelectorType, AttributeAction } from './types.js';
const reName = /^[^#\\]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\u00B0-\uFFFF-])+/;
const reEscape = /\\([\da-f]{1,6}\s?|(\s)|.)/gi;
const actionTypes = new Map([
  [126, AttributeAction.Element],
  [94, AttributeAction.Start],
  [36, AttributeAction.End],
  [42, AttributeAction.Any],
  [33, AttributeAction.Not],
  [124, AttributeAction.Hyphen]
]);
// Pseudos, whose data property is parsed as well.
const unpackPseudos = new Set(['has', 'not', 'matches', 'is', 'where', 'host', 'host-context']);
/**
 * Pseudo elements defined in CSS Level 1 and CSS Level 2 can be written with
 * a single colon; eg. :before will turn into ::before.
 *
 * @see {@link https://www.w3.org/TR/2018/WD-selectors-4-20181121/#pseudo-element-syntax}
 */
const pseudosToPseudoElements = new Set(['before', 'after', 'first-line', 'first-letter']);
/**
 * Checks whether a specific selector is a traversal.
 * This is useful eg. in swapping the order of elements that
 * are not traversals.
 *
 * @param selector Selector to check.
 */
export function isTraversal(selector) {
  switch (selector.type) {
    case SelectorType.Adjacent:
    case SelectorType.Child:
    case SelectorType.Descendant:
    case SelectorType.Parent:
    case SelectorType.Sibling:
    case SelectorType.ColumnCombinator: {
      return true;
    }
    default: {
      return false;
    }
  }
}
const stripQuotesFromPseudos = new Set(['contains', 'icontains']);
// Unescape function taken from https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L152
function funescape(_, escaped, escapedWhitespace) {
  const high = Number.parseInt(escaped, 16) - 0x1_00_00;
  // NaN means non-codepoint
  return high !== high || escapedWhitespace ? escaped : high < 0 ? String.fromCharCode(high + 0x1_00_00) : String.fromCharCode((high >> 10) | 0xd8_00, (high & 0x3_ff) | 0xdc_00);
}
function unescapeCSS(cssString) {
  return cssString.replace(reEscape, funescape);
}
function isQuote(c) {
  return c === 39 || c === 34;
}
function isWhitespace(c) {
  return c === 32 || c === 9 || c === 10 || c === 12 || c === 13;
}
/**
 * Parses `selector`.
 *
 * @param selector Selector to parse.
 * @returns Returns a two-dimensional array.
 * The first dimension represents selectors separated by commas (eg. `sub1, sub2`),
 * the second contains the relevant tokens for that selector.
 */
export function parse(selector) {
  const subselects = [];
  const endIndex = parseSelector(subselects, `${selector}`, 0);
  if (endIndex < selector.length) {
    throw new Error(`Unmatched selector: ${selector.slice(endIndex)}`);
  }
  return subselects;
}
function parseSelector(subselects, selector, selectorIndex) {
  let tokens = [];
  function getName(offset) {
    const match = selector.slice(selectorIndex + offset).match(reName);
    if (!match) {
      throw new Error(`Expected name, found ${selector.slice(selectorIndex)}`);
    }
    const [name] = match;
    selectorIndex += offset + name.length;
    return unescapeCSS(name);
  }
  function stripWhitespace(offset) {
    selectorIndex += offset;
    while (selectorIndex < selector.length && isWhitespace(selector.charCodeAt(selectorIndex))) {
      selectorIndex++;
    }
  }
  function readValueWithParenthesis() {
    selectorIndex += 1;
    const start = selectorIndex;
    for (let counter = 1; selectorIndex < selector.length; selectorIndex++) {
      switch (selector.charCodeAt(selectorIndex)) {
        case 92: {
          // Skip next character
          selectorIndex += 1;
          break;
        }
        case 40: {
          counter += 1;
          break;
        }
        case 41: {
          counter -= 1;
          if (counter === 0) {
            return unescapeCSS(selector.slice(start, selectorIndex++));
          }
          break;
        }
      }
    }
    throw new Error('Parenthesis not matched');
  }
  function ensureNotTraversal() {
    if (tokens.length > 0 && isTraversal(tokens[tokens.length - 1])) {
      throw new Error('Did not expect successive traversals.');
    }
  }
  function addTraversal(type) {
    if (tokens.length > 0 && tokens[tokens.length - 1].type === SelectorType.Descendant) {
      tokens[tokens.length - 1].type = type;
      return;
    }
    ensureNotTraversal();
    tokens.push({
      type
    });
  }
  function addSpecialAttribute(name, action) {
    tokens.push({
      type: SelectorType.Attribute,
      name,
      action,
      value: getName(1),
      namespace: null,
      ignoreCase: 'quirks'
    });
  }
  /**
   * We have finished parsing the current part of the selector.
   *
   * Remove descendant tokens at the end if they exist,
   * and return the last index, so that parsing can be
   * picked up from here.
   */ function finalizeSubselector() {
    if (tokens.length > 0 && tokens[tokens.length - 1].type === SelectorType.Descendant) {
      tokens.pop();
    }
    if (tokens.length === 0) {
      throw new Error('Empty sub-selector');
    }
    subselects.push(tokens);
  }
  stripWhitespace(0);
  if (selector.length === selectorIndex) {
    return selectorIndex;
  }
  loop: while (selectorIndex < selector.length) {
    const firstChar = selector.charCodeAt(selectorIndex);
    switch (firstChar) {
      // Whitespace
      case 32:
      case 9:
      case 10:
      case 12:
      case 13: {
        if (tokens.length === 0 || tokens[0].type !== SelectorType.Descendant) {
          ensureNotTraversal();
          tokens.push({
            type: SelectorType.Descendant
          });
        }
        stripWhitespace(1);
        break;
      }
      // Traversals
      case 62: {
        addTraversal(SelectorType.Child);
        stripWhitespace(1);
        break;
      }
      case 60: {
        addTraversal(SelectorType.Parent);
        stripWhitespace(1);
        break;
      }
      case 126: {
        addTraversal(SelectorType.Sibling);
        stripWhitespace(1);
        break;
      }
      case 43: {
        addTraversal(SelectorType.Adjacent);
        stripWhitespace(1);
        break;
      }
      // Special attribute selectors: .class, #id
      case 46: {
        addSpecialAttribute('class', AttributeAction.Element);
        break;
      }
      case 35: {
        addSpecialAttribute('id', AttributeAction.Equals);
        break;
      }
      case 91: {
        stripWhitespace(1);
        // Determine attribute name and namespace
        let name;
        let namespace = null;
        if (selector.charCodeAt(selectorIndex) === 124) {
          // Equivalent to no namespace
          name = getName(1);
        } else if (selector.startsWith('*|', selectorIndex)) {
          namespace = '*';
          name = getName(2);
        } else {
          name = getName(0);
          if (selector.charCodeAt(selectorIndex) === 124 && selector.charCodeAt(selectorIndex + 1) !== 61) {
            namespace = name;
            name = getName(1);
          }
        }
        stripWhitespace(0);
        // Determine comparison operation
        let action = AttributeAction.Exists;
        const possibleAction = actionTypes.get(selector.charCodeAt(selectorIndex));
        if (possibleAction) {
          action = possibleAction;
          if (selector.charCodeAt(selectorIndex + 1) !== 61) {
            throw new Error('Expected `=`');
          }
          stripWhitespace(2);
        } else if (selector.charCodeAt(selectorIndex) === 61) {
          action = AttributeAction.Equals;
          stripWhitespace(1);
        }
        // Determine value
        let value = '';
        let ignoreCase = null;
        if (action !== 'exists') {
          if (isQuote(selector.charCodeAt(selectorIndex))) {
            const quote = selector.charCodeAt(selectorIndex);
            selectorIndex += 1;
            const sectionStart = selectorIndex;
            while (selectorIndex < selector.length && selector.charCodeAt(selectorIndex) !== quote) {
              selectorIndex += selector.charCodeAt(selectorIndex) === 92 ? 2 : 1; // Skip next character if it is escaped
            }
            if (selector.charCodeAt(selectorIndex) !== quote) {
              throw new Error("Attribute value didn't end");
            }
            value = unescapeCSS(selector.slice(sectionStart, selectorIndex));
            selectorIndex += 1;
          } else {
            const valueStart = selectorIndex;
            while (selectorIndex < selector.length && !isWhitespace(selector.charCodeAt(selectorIndex)) && selector.charCodeAt(selectorIndex) !== 93) {
              selectorIndex += selector.charCodeAt(selectorIndex) === 92 ? 2 : 1; // Skip next character if it is escaped
            }
            value = unescapeCSS(selector.slice(valueStart, selectorIndex));
          }
          stripWhitespace(0);
          // See if we have a force ignore flag
          switch (selector.charCodeAt(selectorIndex) | 0x20) {
            // If the forceIgnore flag is set (either `i` or `s`), use that value
            case 105: {
              ignoreCase = true;
              stripWhitespace(1);
              break;
            }
            case 115: {
              ignoreCase = false;
              stripWhitespace(1);
              break;
            }
          }
        }
        if (selector.charCodeAt(selectorIndex) !== 93) {
          throw new Error("Attribute selector didn't terminate");
        }
        selectorIndex += 1;
        const attributeSelector = {
          type: SelectorType.Attribute,
          name,
          action,
          value,
          namespace,
          ignoreCase
        };
        tokens.push(attributeSelector);
        break;
      }
      case 58: {
        if (selector.charCodeAt(selectorIndex + 1) === 58) {
          tokens.push({
            type: SelectorType.PseudoElement,
            name: getName(2).toLowerCase(),
            data: selector.charCodeAt(selectorIndex) === 40 ? readValueWithParenthesis() : null
          });
          break;
        }
        const name = getName(1).toLowerCase();
        if (pseudosToPseudoElements.has(name)) {
          tokens.push({
            type: SelectorType.PseudoElement,
            name,
            data: null
          });
          break;
        }
        let data = null;
        if (selector.charCodeAt(selectorIndex) === 40) {
          if (unpackPseudos.has(name)) {
            if (isQuote(selector.charCodeAt(selectorIndex + 1))) {
              throw new Error(`Pseudo-selector ${name} cannot be quoted`);
            }
            data = [];
            selectorIndex = parseSelector(data, selector, selectorIndex + 1);
            if (selector.charCodeAt(selectorIndex) !== 41) {
              throw new Error(`Missing closing parenthesis in :${name} (${selector})`);
            }
            selectorIndex += 1;
          } else {
            data = readValueWithParenthesis();
            if (stripQuotesFromPseudos.has(name)) {
              const quot = data.charCodeAt(0);
              if (quot === data.charCodeAt(data.length - 1) && isQuote(quot)) {
                data = data.slice(1, -1);
              }
            }
            data = unescapeCSS(data);
          }
        }
        tokens.push({
          type: SelectorType.Pseudo,
          name,
          data
        });
        break;
      }
      case 44: {
        finalizeSubselector();
        tokens = [];
        stripWhitespace(1);
        break;
      }
      default: {
        if (selector.startsWith('/*', selectorIndex)) {
          const endIndex = selector.indexOf('*/', selectorIndex + 2);
          if (endIndex < 0) {
            throw new Error('Comment was not terminated');
          }
          selectorIndex = endIndex + 2;
          // Remove leading whitespace
          if (tokens.length === 0) {
            stripWhitespace(0);
          }
          break;
        }
        let namespace = null;
        let name;
        if (firstChar === 42) {
          selectorIndex += 1;
          name = '*';
        } else if (firstChar === 124) {
          name = '';
          if (selector.charCodeAt(selectorIndex + 1) === 124) {
            addTraversal(SelectorType.ColumnCombinator);
            stripWhitespace(2);
            break;
          }
        } else if (reName.test(selector.slice(selectorIndex))) {
          name = getName(0);
        } else {
          break loop;
        }
        if (selector.charCodeAt(selectorIndex) === 124 && selector.charCodeAt(selectorIndex + 1) !== 124) {
          namespace = name;
          if (selector.charCodeAt(selectorIndex + 1) === 42) {
            name = '*';
            selectorIndex += 2;
          } else {
            name = getName(1);
          }
        }
        tokens.push(
          name === '*'
            ? {
                type: SelectorType.Universal,
                namespace
              }
            : {
                type: SelectorType.Tag,
                name,
                namespace
              }
        );
      }
    }
  }
  finalizeSubselector();
  return selectorIndex;
}
