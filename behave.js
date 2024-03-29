/*(function(undefined) {
  "use strict";
*/
export const BehaveHooks = (function () {
  let hooks = {};

  return {
    add(hookName, fn) {
      if(typeof hookName == 'object') {
        let i;
        for(i = 0; i < hookName.length; i++) {
          let theHook = hookName[i];
          if(!hooks[theHook]) {
            hooks[theHook] = [];
          }
          hooks[theHook].push(fn);
        }
      } else {
        if(!hooks[hookName]) {
          hooks[hookName] = [];
        }
        hooks[hookName].push(fn);
      }
    },
    get(hookName) {
      if(hooks[hookName]) {
        return hooks[hookName];
      }
    }
  };
})();

export const Behave = function(userOpts) {
  if(typeof String.prototype.repeat !== 'function') {
    String.prototype.repeat = function(times) {
      if(times < 1) {
        return '';
      }
      if(times % 2) {
        return this.repeat(times - 1) + this;
      }
      let half = this.repeat(times / 2);
      return half + half;
    };
  }

  if(typeof Array.prototype.filter !== 'function') {
    Array.prototype.filter = function(func /*, thisp */) {
      if(this === null) {
        throw new TypeError();
      }

      let t = Object(this),
        len = t.length >>> 0;
      if(typeof func != 'function') {
        throw new TypeError();
      }
      let res = [],
        thisp = arguments[1];
      for(let i = 0; i < len; i++) {
        if(i in t) {
          let val = t[i];
          if(func.call(thisp, val, i, t)) {
            res.push(val);
          }
        }
      }
      return res;
    };
  }

  var defaults = {
      textarea: null,
      replaceTab: true,
      softTabs: true,
      tabSize: 4,
      autoOpen: true,
      overwrite: true,
      autoStrip: true,
      autoIndent: true,
      fence: false
    },
    tab,
    newLine,
    charSettings = {
      keyMap: [
        { open: '"', close: '"', canBreak: false },
        { open: "'", close: "'", canBreak: false },
        { open: '(', close: ')', canBreak: false },
        { open: '[', close: ']', canBreak: true },
        { open: '{', close: '}', canBreak: true }
      ]
    },
    utils = {
      _callHook(hookName, passData) {
        let hooks = BehaveHooks.get(hookName);
        passData = !(typeof passData == 'boolean' && passData === false);

        if(hooks) {
          if(passData) {
            var theEditor = defaults.textarea,
              textVal = theEditor.value,
              caretPos = utils.cursor.get(),
              i;

            for(i = 0; i < hooks.length; i++) {
              hooks[i].call(undefined, {
                editor: {
                  element: theEditor,
                  text: textVal,
                  levelsDeep: utils.levelsDeep()
                },
                caret: {
                  pos: caretPos
                },
                lines: {
                  current: utils.cursor.getLine(textVal, caretPos),
                  total: utils.editor.getLines(textVal)
                }
              });
            }
          } else {
            for(i = 0; i < hooks.length; i++) {
              hooks[i].call(undefined);
            }
          }
        }
      },
      defineNewLine() {
        let ta = document.createElement('textarea');
        ta.value = '\n';

        if(ta.value.length == 2) {
          newLine = '\r\n';
        } else {
          newLine = '\n';
        }
      },
      defineTabSize(tabSize) {
        if(typeof defaults.textarea.style.OTabSize != 'undefined') {
          defaults.textarea.style.OTabSize = tabSize;
          return;
        }
        if(typeof defaults.textarea.style.MozTabSize != 'undefined') {
          defaults.textarea.style.MozTabSize = tabSize;
          return;
        }
        if(typeof defaults.textarea.style.tabSize != 'undefined') {
          defaults.textarea.style.tabSize = tabSize;
          return;
        }
      },
      cursor: {
        getLine(textVal, pos) {
          return textVal.substring(0, pos).split('\n').length;
        },
        get() {
          if(typeof document.createElement('textarea').selectionStart === 'number') {
            return defaults.textarea.selectionStart;
          } else if(document.selection) {
            let caretPos = 0,
              range = defaults.textarea.createTextRange(),
              rangeDupe = document.selection.createRange().duplicate(),
              rangeDupeBookmark = rangeDupe.getBookmark();
            range.moveToBookmark(rangeDupeBookmark);

            while(range.moveStart('character', -1) !== 0) {
              caretPos++;
            }
            return caretPos;
          }
        },
        set(start, end) {
          if(!end) {
            end = start;
          }
          if(defaults.textarea.setSelectionRange) {
            defaults.textarea.focus();
            defaults.textarea.setSelectionRange(start, end);
          } else if(defaults.textarea.createTextRange) {
            let range = defaults.textarea.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
          }
        },
        selection() {
          let textAreaElement = defaults.textarea,
            start = 0,
            end = 0,
            normalizedValue,
            range,
            textInputRange,
            len,
            endRange;

          if(typeof textAreaElement.selectionStart == 'number' && typeof textAreaElement.selectionEnd == 'number') {
            start = textAreaElement.selectionStart;
            end = textAreaElement.selectionEnd;
          } else {
            range = document.selection.createRange();

            if(range && range.parentElement() == textAreaElement) {
              normalizedValue = utils.editor.get();
              len = normalizedValue.length;

              textInputRange = textAreaElement.createTextRange();
              textInputRange.moveToBookmark(range.getBookmark());

              endRange = textAreaElement.createTextRange();
              endRange.collapse(false);

              if(textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                start = end = len;
              } else {
                start = -textInputRange.moveStart('character', -len);
                start += normalizedValue.slice(0, start).split(newLine).length - 1;

                if(textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
                  end = len;
                } else {
                  end = -textInputRange.moveEnd('character', -len);
                  end += normalizedValue.slice(0, end).split(newLine).length - 1;
                }
              }
            }
          }

          return start == end
            ? false
            : {
                start,
                end
              };
        }
      },
      editor: {
        getLines(textVal) {
          return textVal.split('\n').length;
        },
        get() {
          return defaults.textarea.value.replace(/\r/g, '');
        },
        set(data) {
          defaults.textarea.value = data;
        }
      },
      fenceRange() {
        if(typeof defaults.fence == 'string') {
          let data = utils.editor.get(),
            pos = utils.cursor.get(),
            hacked = 0,
            matchedFence = data.indexOf(defaults.fence),
            matchCase = 0;

          while(matchedFence >= 0) {
            matchCase++;
            if(pos < matchedFence + hacked) {
              break;
            }

            hacked += matchedFence + defaults.fence.length;
            data = data.substring(matchedFence + defaults.fence.length);
            matchedFence = data.indexOf(defaults.fence);
          }

          if(hacked < pos && matchedFence + hacked > pos && matchCase % 2 === 0) {
            return true;
          }
          return false;
        }
        return true;
      },
      isEven(_this, i) {
        return i % 2;
      },
      levelsDeep() {
        let pos = utils.cursor.get(),
          val = utils.editor.get();

        let left = val.substring(0, pos),
          levels = 0,
          i,
          j;

        for(i = 0; i < left.length; i++) {
          for(j = 0; j < charSettings.keyMap.length; j++) {
            if(charSettings.keyMap[j].canBreak) {
              if(charSettings.keyMap[j].open == left.charAt(i)) {
                levels++;
              }

              if(charSettings.keyMap[j].close == left.charAt(i)) {
                levels--;
              }
            }
          }
        }

        let toDecrement = 0,
          quoteMap = ["'", '"'];
        for(i = 0; i < charSettings.keyMap.length; i++) {
          if(charSettings.keyMap[i].canBreak) {
            for(j in quoteMap) {
              toDecrement += left.split(quoteMap[j]).filter(utils.isEven).join('').split(charSettings.keyMap[i].open).length - 1;
            }
          }
        }

        let finalLevels = levels - toDecrement;

        return finalLevels >= 0 ? finalLevels : 0;
      },
      deepExtend(destination, source) {
        for(let property in source) {
          if(source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            utils.deepExtend(destination[property], source[property]);
          } else {
            destination[property] = source[property];
          }
        }
        return destination;
      },
      addEvent: function addEvent(element, eventName, func) {
        if(element.addEventListener) {
          element.addEventListener(eventName, func, false);
        } else if(element.attachEvent) {
          element.attachEvent('on' + eventName, func);
        }
      },
      removeEvent: function addEvent(element, eventName, func) {
        if(element.addEventListener) {
          element.removeEventListener(eventName, func, false);
        } else if(element.attachEvent) {
          element.detachEvent('on' + eventName, func);
        }
      },
      preventDefaultEvent(e) {
        if(e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
      }
    },
    intercept = {
      tabKey(e) {
        if(!utils.fenceRange()) {
          return;
        }

        if(e.keyCode == 9) {
          utils.preventDefaultEvent(e);

          var toReturn = true;
          utils._callHook('tab:before');

          let selection = utils.cursor.selection(),
            pos = utils.cursor.get(),
            val = utils.editor.get();

          if(selection) {
            let tempStart = selection.start;
            while(tempStart--) {
              if(val.charAt(tempStart) == '\n') {
                selection.start = tempStart + 1;
                break;
              }
            }

            let toIndent = val.substring(selection.start, selection.end),
              lines = toIndent.split('\n'),
              i;

            if(e.shiftKey) {
              for(i = 0; i < lines.length; i++) {
                if(lines[i].substring(0, tab.length) == tab) {
                  lines[i] = lines[i].substring(tab.length);
                }
              }
              toIndent = lines.join('\n');

              utils.editor.set(val.substring(0, selection.start) + toIndent + val.substring(selection.end));
              utils.cursor.set(selection.start, selection.start + toIndent.length);
            } else {
              for(i in lines) {
                lines[i] = tab + lines[i];
              }
              toIndent = lines.join('\n');

              utils.editor.set(val.substring(0, selection.start) + toIndent + val.substring(selection.end));
              utils.cursor.set(selection.start, selection.start + toIndent.length);
            }
          } else {
            let left = val.substring(0, pos),
              right = val.substring(pos),
              edited = left + tab + right;

            if(e.shiftKey) {
              if(val.substring(pos - tab.length, pos) == tab) {
                edited = val.substring(0, pos - tab.length) + right;
                utils.editor.set(edited);
                utils.cursor.set(pos - tab.length);
              }
            } else {
              utils.editor.set(edited);
              utils.cursor.set(pos + tab.length);
              toReturn = false;
            }
          }
          utils._callHook('tab:after');
        }
        return toReturn;
      },
      enterKey(e) {
        if(!utils.fenceRange()) {
          return;
        }

        if(e.keyCode == 13) {
          utils.preventDefaultEvent(e);
          utils._callHook('enter:before');

          let pos = utils.cursor.get(),
            val = utils.editor.get(),
            left = val.substring(0, pos),
            right = val.substring(pos),
            leftChar = left.charAt(left.length - 1),
            rightChar = right.charAt(0),
            numTabs = utils.levelsDeep(),
            ourIndent = '',
            closingBreak = '',
            finalCursorPos,
            i;
          if(!numTabs) {
            finalCursorPos = 1;
          } else {
            while(numTabs--) {
              ourIndent += tab;
            }
            ourIndent = ourIndent;
            finalCursorPos = ourIndent.length + 1;

            for(i = 0; i < charSettings.keyMap.length; i++) {
              if(charSettings.keyMap[i].open == leftChar && charSettings.keyMap[i].close == rightChar) {
                closingBreak = newLine;
              }
            }
          }

          let edited = left + newLine + ourIndent + closingBreak + ourIndent.substring(0, ourIndent.length - tab.length) + right;
          utils.editor.set(edited);
          utils.cursor.set(pos + finalCursorPos);
          utils._callHook('enter:after');
        }
      },
      deleteKey(e) {
        if(!utils.fenceRange()) {
          return;
        }

        if(e.keyCode == 8) {
          utils.preventDefaultEvent(e);

          utils._callHook('delete:before');

          let pos = utils.cursor.get(),
            val = utils.editor.get(),
            left = val.substring(0, pos),
            right = val.substring(pos),
            leftChar = left.charAt(left.length - 1),
            rightChar = right.charAt(0),
            i;

          if(utils.cursor.selection() === false) {
            for(i = 0; i < charSettings.keyMap.length; i++) {
              if(charSettings.keyMap[i].open == leftChar && charSettings.keyMap[i].close == rightChar) {
                var edited = val.substring(0, pos - 1) + val.substring(pos + 1);
                utils.editor.set(edited);
                utils.cursor.set(pos - 1);
                return;
              }
            }
            var edited = val.substring(0, pos - 1) + val.substring(pos);
            utils.editor.set(edited);
            utils.cursor.set(pos - 1);
          } else {
            var sel = utils.cursor.selection(),
              edited = val.substring(0, sel.start) + val.substring(sel.end);
            utils.editor.set(edited);
            utils.cursor.set(pos);
          }

          utils._callHook('delete:after');
        }
      }
    },
    charFuncs = {
      openedChar(_char, e) {
        utils.preventDefaultEvent(e);
        utils._callHook('openChar:before');
        let pos = utils.cursor.get(),
          val = utils.editor.get(),
          left = val.substring(0, pos),
          right = val.substring(pos),
          edited = left + _char.open + _char.close + right;

        defaults.textarea.value = edited;
        utils.cursor.set(pos + 1);
        utils._callHook('openChar:after');
      },
      closedChar(_char, e) {
        let pos = utils.cursor.get(),
          val = utils.editor.get(),
          toOverwrite = val.substring(pos, pos + 1);
        if(toOverwrite == _char.close) {
          utils.preventDefaultEvent(e);
          utils._callHook('closeChar:before');
          utils.cursor.set(utils.cursor.get() + 1);
          utils._callHook('closeChar:after');
          return true;
        }
        return false;
      }
    },
    action = {
      filter(e) {
        if(!utils.fenceRange()) {
          return;
        }

        let theCode = e.which || e.keyCode;

        if(theCode == 39 || (theCode == 40 && e.which === 0)) {
          return;
        }

        let _char = String.fromCharCode(theCode),
          i;

        for(i = 0; i < charSettings.keyMap.length; i++) {
          if(charSettings.keyMap[i].close == _char) {
            let didClose = defaults.overwrite && charFuncs.closedChar(charSettings.keyMap[i], e);

            if(!didClose && charSettings.keyMap[i].open == _char && defaults.autoOpen) {
              charFuncs.openedChar(charSettings.keyMap[i], e);
            }
          } else if(charSettings.keyMap[i].open == _char && defaults.autoOpen) {
            charFuncs.openedChar(charSettings.keyMap[i], e);
          }
        }
      },
      listen() {
        if(defaults.replaceTab) {
          utils.addEvent(defaults.textarea, 'keydown', intercept.tabKey);
        }
        if(defaults.autoIndent) {
          utils.addEvent(defaults.textarea, 'keydown', intercept.enterKey);
        }
        if(defaults.autoStrip) {
          utils.addEvent(defaults.textarea, 'keydown', intercept.deleteKey);
        }

        utils.addEvent(defaults.textarea, 'keypress', action.filter);

        utils.addEvent(defaults.textarea, 'keydown', () => {
          utils._callHook('keydown');
        });
        utils.addEvent(defaults.textarea, 'keyup', () => {
          utils._callHook('keyup');
        });
      }
    },
    init = function(opts) {
      if(opts.textarea) {
        utils._callHook('init:before', false);
        utils.deepExtend(defaults, opts);
        utils.defineNewLine();

        if(defaults.softTabs) {
          tab = ' '.repeat(defaults.tabSize);
        } else {
          tab = '\t';

          utils.defineTabSize(defaults.tabSize);
        }

        action.listen();
        utils._callHook('init:after', false);
      }
    };

  this.destroy = function() {
    utils.removeEvent(defaults.textarea, 'keydown', intercept.tabKey);
    utils.removeEvent(defaults.textarea, 'keydown', intercept.enterKey);
    utils.removeEvent(defaults.textarea, 'keydown', intercept.deleteKey);
    utils.removeEvent(defaults.textarea, 'keypress', action.filter);
  };

  init(userOpts);
};

if(typeof module !== 'undefined' && module.exports) {
  module.exports = { Behave, BehaveHooks };
}

/*
if(typeof ender === "undefined") {
  this.Behave = Behave;
  this.BehaveHooks = BehaveHooks;
}

if(typeof define === "function" && define.amd) {
  define("behave", [], function() {
    return Behave;
  });
}

*/
export default Behave;
