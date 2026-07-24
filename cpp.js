/* @license

cpp.js - Simple implementation of the C Preprocessor in Javascript

Copyright (c) 2011, Alexander Christoph Gessler
All rights reserved.

Redistribution and use of this software in source and binary forms, 
with or without modification, are permitted provided that the 
following conditions are met:

* Redistributions of source code must retain the above
  copyright notice, this list of conditions and the
  following disclaimer.

* Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the
  following disclaimer in the documentation and/or other
  materials provided with the distribution.

* Neither the name of the cpp.js team, nor the names of its
  contributors may be used to endorse or promote products
  derived from this software without specific prior
  written permission of the cpp.js Development Team.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT 
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY 
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

function cppJs(settings) {
  //'use strict';
  let trim = function(str) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    str = str.replace(/^\s+/, '');
    for(let i = str.length - 1; i >= 0; i--) {
      if(/\S/.test(str.charAt(i))) {
        str = str.substring(0, i + 1);
        break;
      }
    }
    return str;
  };

  let stripCppComments = function(str) {
    // very loosely based on http://james.padolsey.com/javascript/removing-comments-in-javascript/,
    // but removed JS-specific stuff and added handling of line continuations. Also, newlines
    // are generally preserved to keep line numbers intact.
    str = ('__' + str.replace(/\r\n/g, '\n') + '__').split('');
    let blockComment = false,
      lineComment = false,
      quote = false,
      linesLost = 0;
    for(let i = 0, l = str.length; i < l; i++) {
      if(quote) {
        if((str[i] === "'" || str[i] === '"') && str[i - 1] !== '\\') {
          quote = false;
        }
        continue;
      }

      if(blockComment) {
        if(str[i] === '*' && str[i + 1] === '/') {
          str[i + 1] = '';
          blockComment = false;
        }
        str[i] = '';

        if(str[i] === '\n') {
          ++linesLost;
        }
        continue;
      }

      if(lineComment) {
        if(str[i + 1] === '\n') {
          lineComment = false;
        }
        str[i] = '';
        continue;
      }

      if(str[i] === '\n') {
        if(str[i - 1] == '\\') {
          // line continuation, replace by whitespace
          str[i - 1] = '';
          str[i] = '';
          ++linesLost;
        } else {
          while(linesLost > 0) {
            str[i] += '\n';
            --linesLost;
          }
        }
      }

      quote = str[i] === "'" || str[i] === '"';
      if(str[i] === '/') {
        if(str[i + 1] === '*') {
          str[i] = '';
          blockComment = true;
          continue;
        }
        if(str[i + 1] === '/') {
          str[i] = '';
          lineComment = true;
          continue;
        }
      }
    }
    return str.join('').slice(2, -2);
  };

  let isStringBoundary = function(text, idx) {
    return (text[idx] == '"' || text[idx] == "'") && (!idx || text[idx - 1] != '\\' || (idx > 1 && text[idx - 2] == '\\'));
  };

  // dictionary of default settings, including default error handlers
  let defaultSettings = {
    signalChar: '#',

    warnFunc(s) {
      console.log(s);
    },

    errorFunc(s) {
      console.log(s);
      throw s;
    },

    commentStripper: stripCppComments,

    includeFunc: null,
    completionFunc: null,

    pragmaFunc(pragma) {
      return null;
    },
  };

  // apply default settings
  if(settings) {
    for(let k in defaultSettings) {
      if(!(k in settings)) {
        settings[k] = defaultSettings[k];
      }
    }
  } else {
    settings = defaultSettings;
  }

  //console.log('settings',settings);

  if(settings.includeFunc && !settings.completionFunc) {
    settings.errorFunc('includeFunc but not completionFunc specified');
  }

  // make sure that execution never continues when an error occurs.
  let userErr = settings.errorFunc || (() => {});
  settings.errorFunc = function(e) {
    userErr(e);
    throw e;
  };

  // generate a 3 tuple (command, arguments, codeBlock)
  let blockRe = new RegExp('^' + settings.signalChar + '(\\w+)[ \t]*(.*?)[ \t]*$', 'm');

  // match identifiers according to 6.4.2.1, do not match 'defined',
  // do not match quote strings either
  let isIdentifierRe = /\b(d(?!efined)|[a-ce-zA-Z_])\w*(?![\w"])/g;

  // same, but checks if the entire string is an identifier
  let isIdentifierOnlyRe = /^(d(?!efined)|[a-ce-zA-Z_])\w*$/g;

  // same, but checks if the entire string is a macro
  let isMacroOnlyRe = /^((?:d(?!efined)|[a-ce-zA-Z_])\w*)\s*\((.*)\)$/g;

  // defined <identifier>
  let definedNoParensRe = /defined\s+([a-zA-Z_]\w*)/g;

  // defined (<identifier>)
  let definedRe = /defined\s*\((\s*[a-zA-Z_]\w*\s*)\)/g;

  // __defined_magic_<identifier>_ (a special sentinel value used to
  // temporarily exclude operands to defined from macro substitution.
  let definedMagicSentinelRe = /__defined_magic_([a-zA-Z_]\w*)_/;

  // Match hexadecimal, octal and decimal integer literals with or
  // without L,l,U,u suffix and separate all components.
  let isIntegerRe = /\b(\+|-|)(0|0x|)([1-9a-f][0-9a-f]*|0)([ul]*)\b/gi;

  // Grab doubly quoted strings
  let isStringRe = /"(.*?)"/g;

  // Grab compound assignments. Extra fix for !=, ==, <=, >= needed
  let isAssignmentRe = /[+\-*%\/&^|]?=/g;

  // Grab instances of the increment/decrement operators
  let isIncrementRe = /--|\+\+/g;

  // Grav <includedFile> or "includedFile"
  let includeRe = /(?:(<)(.*)>|"(.*)")(.*)/;

  // Magic token to signify the '##' token (to keep it from being
  // treated as the operator of the same signature).
  let pseudoTokenDoublesharp = '__doublesharp_magic__';
  let isPseudoTokenDoublesharp = new RegExp(pseudoTokenDoublesharp, 'g');

  // Magic token to signify the ' ' token (to keep it from being
  // treated as token boundary).
  let pseudoTokenSpace = '__whitespace_magic__';
  let isPseudoTokenSpace = new RegExp(pseudoTokenSpace, 'g');

  let pseudoTokenEmpty = '__empty_magic__';
  let isPseudoTokenEmpty = new RegExp(pseudoTokenEmpty, 'g');

  let pseudoTokenNosubs = '__nosubs__';
  let isPseudoTokenNosubs = new RegExp(pseudoTokenNosubs, 'g');

  // List of preprocessing tokens.
  let ppSpecialTokenList = {
    '==': 1,
    '!=': 1,
    '+': 1,
    '-': 1,
    '*': 1,
    '/': 1,
    '%': 1,
    '<=': 1,
    '>=': 1,
    '<': 1,
    '>': 1,
    '=': 1,
    '+=': 1,
    '*=': 1,
    '/=': 1,
    '&=': 1,
    '|=': 1,
    '^=': 1,
    '#': 1,
    '##': 1,
    '->': 1,
  };

  let state = {};
  let macroCache = {};

  let evalMask = null;

  let maxMacroLength = 0;
  let macroCountsByLength = {};

  return {
    // ----------------------
    // (public) Clear the current status code. i.e. reset all defines.
    clear() {
      state = {};
      macroCountsByLength = {};
      F;
      macroCache = {};
      maxMacroLength = 0;
    },

    get definitions() {
      return state;
    },
    get macros() {
      return macroCache;
    },

    // ----------------------
    // (public) Check if macro `k` is defined.
    defined(k) {
      return k in state;
    },

    // ----------------------
    // (public) Define macro `k` with replacement value `v`. To define macros with
    // parameters, include the parameter list in the macro name, i.e.
    // k <= "foo(a,b)", v <= "a ## b". The function invokes the error
    // callback if the macro contains syntax errors.
    define(k, v) {
      let macro = this._getMacroInfo(k);
      if(!this._isIdentifier(k) && !macro) {
        settings.errorFunc("not a valid preprocessor identifier: '" + k + "'");
      }

      if(typeof v === 'number') {
        v = v.toString(10);
      }

      if(macro) {
        k = macro.name;
        this.undefine(k);

        // This inserts the macro into the macro cache, which
        // holds pre-parsed data to simplify substitution.
        macroCache[k] = macro;
      } else {
        this.undefine(k);
      }

      state[k] = v || '';

      // macro length table housekeeping
      macroCountsByLength[k.length] = (macroCountsByLength[k.length] || 0) + 1;
      if(k.length > maxMacroLength) {
        maxMacroLength = k.length;
      }
    },

    // ----------------------
    // (public) Undefine `k`. A no-op if `k` is not defined.
    undefine(k) {
      if(k in state) {
        delete state[k];

        // update macro length table
        let nl = macroCountsByLength[k.length] - 1;
        if(k.length === maxMacroLength && !nl) {
          maxMacroLength = 0;
          for(let i = k.length - 1; i >= 0; --i) {
            if(macroCountsByLength[i]) {
              maxMacroLength = i;
              break;
            }
          }
        }

        macroCountsByLength[k.length] = nl;
        delete macroCache[k];
      } else {
        // this happens if the user includes the parameter list
        // in the name. This is not part of the specification,
        // but implemented for reasons of API symmetry.
        let macro = this._getMacroInfo(k);
        if(macro) {
          this.undefine(macro.name);
        }
      }
    },

    // ----------------------
    // (public) Given a dictionary of macroName, replacement pairs, invoke
    // `define` on all of them.
    defineMultiple(dict) {
      for(let k in dict) {
        this.define(k, dict[k]);
      }
    },

    // ----------------------
    // (public) Preprocess `text` and return the preprocessed text (or receive
    // a completion callback if asynchronous processing is enabled). `name` is
    // an optional string that is used in error messages as file name.
    run(text, name) {
      let ifsNested = 0,
        ifsFailed = 0,
        ifDone = false,
        line = 1,
        command;
      let ifStack = [];

      let skip = false;
      let self = this;

      name = name || '<unnamed>';

      // wrapped error function, augments line number and file
      let error = function(text, ...rest) {
        settings.errorFunc('(cpp) error # ' + name + ':' + line + ': ' + text, ...rest);
      };

      // wrapped warning function, augments line number and file
      let warn = function(text) {
        settings.warnFunc('(cpp) warning # ' + name + ':' + line + ': ' + text);
      };

      if(!text) {
        error('input empty or null');
      }

      text = settings.commentStripper(text);
      let blocks = text.split(blockRe);

      let out = new Array(Math.floor(blocks.length / 3) + 2),
        outi = 0;
      for(let i = 0; i < out.length; ++i) {
        out[i] = '';
      }

      let processDirective = function(command, elem, i) {
        switch (command) {
          case 'define':
            let head, tail;

            elem = trim(elem);

            let parCount = undefined;
            for(let j = 0; j < elem.length; ++j) {
              if(elem[j] == '(') {
                parCount = (parCount || 0) + 1;
              } else if((elem[j] == ')' && --parCount === 0) || (elem[j].match(/\s/) && parCount === undefined)) {
                if(elem[j] == ')') {
                  ++j;
                }
                head = elem.slice(0, j);
                tail = trim(elem.slice(j));
                break;
              }
            }

            if(parCount) {
              error('unbalanced parentheses in define: ' + elem);
            }

            if(head === undefined) {
              head = elem;
            }

            if(self.defined(head)) {
              warn(head + ' redefined');
            }

            if(!self._isIdentifier(head) && !self._isMacro(head)) {
              error("not a valid preprocessor identifier: '" + head + "'");
            }

            self.define(head, tail);
            break;

          case 'undef':
            self.undefine(elem);
            break;

          case 'include':
            elem = self.subs(elem, {}, error, warn);
            let parts = elem.match(includeRe);
            if(parts[4]) {
              error('unrecognized characters in include: ' + elem);
            }
            let file = (parts[2] || '') + (parts[3] || '');

            if(!settings.includeFunc) {
              error('include directive not supported, ' + 'no handler specified');
            }

            settings.includeFunc(file, parts[1] === '<', function(contents) {
              if(contents === null) {
                error('failed to access include file: ' + file);
              }
              let s = {};
              for(let k in settings) {
                s[k] = settings[k];
              }

              let processor;

              s.completionFunc = function(data, lines, newState) {
                out.length = outi;

                outi += lines.length;
                out = out.concat(lines);

                // grab any state changes
                self._setState(processor);

                for(++i; i < blocks.length; ++i) {
                  if(!processBlock(i, blocks[i])) {
                    return false;
                  }
                }
                self._result(out, state);
              };

              // construct a child preprocessor and let it share our
              // state.
              processor = cppJs(s);
              processor._setState(self);
              processor.run(contents, file);
            });
            return false;

          case 'error':
            error('#error: ' + elem);
            break;

          case 'pragma':
            if(!settings.pragmaFunc(elem)) {
              warn('ignoring unrecognized #pragma: ' + elem);
            }
            break;

          default:
            warn('unrecognized preprocessor command: ' + command);
            break;
        }
        return true;
      };

      let processBlock = function(i, elem) {
        //let elem = blocks[i];
        switch (i % 3) {
          // code line, apply macro substitutions and copy to output.
          case 0:
            line += elem.split('\n').length - 1;
            if(!ifsFailed && trim(elem).length) {
              out[outi++] = self.subs(elem, error, warn);
            }
            break;
          // preprocessor statement, such as ifdef, endif, ..
          case 1:
            //++line;
            command = elem;
            break;
          // the rest of the preprocessor line, this is where expression
          // evaluation happens
          case 2:
            let done = true;
            switch (command) {
              case 'ifdef':
              case 'ifndef':
                if(!elem) {
                  error('expected identifier after ' + command);
                }
                // translate ifdef/ifndef to regular if by using defined()
                elem = '(defined ' + elem + ')';
                if(command == 'ifndef') {
                  elem = '!' + elem;
                }
              // fallthrough

              case 'if':
                ifStack.push(false);
                if(!elem.length) {
                  error('expected identifier after if');
                }
              // fallthrough

              case 'else':
              case 'elif':
                let notReached = false;
                if(command == 'elif' || command == 'else') {
                  notReached = ifStack[ifStack.length - 1];
                  if(ifsFailed > 0) {
                    --ifsFailed;
                  }

                  if(command == 'else' && elem.length) {
                    warn('ignoring tokens after else');
                  }
                }

                if(ifsFailed > 0 || notReached || (command != 'else' && !self._eval(elem, error, warn))) {
                  ++ifsFailed;
                } else {
                  // we run self branch, so skip any further else/
                  // elsif branches
                  ifStack[ifStack.length - 1] = true;
                }
                break;

              case 'endif':
                if(!ifStack.length) {
                  error('endif with no matching if');
                }
                if(ifsFailed > 0) {
                  --ifsFailed;
                }
                ifStack.pop();
                // ignore trailing junk on endifs
                break;

              default:
                done = ifsFailed > 0;
            }

            // not done yet, so this is a plain directive (i.e. include)
            if(!done) {
              if(!processDirective(command, elem, i)) {
                return false;
              }
            }
            break;
        }
        return true;
      };

      for(let i = 0; i < blocks.length; ++i) {
        if(!processBlock(i, blocks[i])) {
          return null;
        }
      }

      if(ifStack.length > 0) {
        error('unexpected EOF, expected endif');
      }

      return this._result(out, state);
    },

    // ----------------------
    // (public) Given a `text`, substitute macros until no further substitutions
    // are possible. `blacklist` is an optional set of macro names to be ignored,
    // these are not substituted and remain as is.
    // `error` and `warn` are optional callbacks, by default the corresponding
    // callbacks from settings are used. Users should never assign a value to
    // `nestSub`, which is used to keep track of recursive invocations internally.
    subs(text, blacklistIn, error, warn, nestSub) {
      error = error || settings.errorFunc;
      warn = warn || settings.warnFunc;

      let TOTALLY_BLACK = 1e10;

      // create a copy of the blacklist and make sure that all incoming
      // macros are totally blacked out.
      let blacklist = {};
      if(blacklistIn) {
        for(let k in blacklistIn) {
          blacklist[k] = TOTALLY_BLACK;
        }
      }

      nestSub = nestSub || 0;

      let newText = text;
      let rex = /\b.|["']/g,
        mBoundary;

      // XXX This scales terribly. Possible optimization:
      //   use KMP for substring searches
      let pieces = [],
        last = 0,
        inString = false;

      while((mBoundary = rex.exec(newText))) {
        let idx = mBoundary.index;
        if(isStringBoundary(newText, idx)) {
          inString = !inString;
        }

        if(inString) {
          continue;
        }

        for(let i = Math.min(newText.length - idx, maxMacroLength); i >= 1; --i) {
          if(!macroCountsByLength[i]) {
            continue;
          }
          let k = newText.slice(idx, idx + i);
          if(k in state) {
            // if this would be a match, but the macro is blacklisted,
            // we need to skip it alltogether or parts of it might be
            // interpreted as macros on their own.
            if(blacklist[k] > idx) {
              pieces.push(newText.slice(0, idx));
              pieces.push(pseudoTokenNosubs + k);
              newText = newText.slice(idx + k.length);
              rex.lastIndex = 0;

              // adjust blacklist indices
              for(let kk in blacklist) {
                if(blacklist[kk] != TOTALLY_BLACK) {
                  if(blacklist[kk] > idx) {
                    blacklist[kk] -= idx + k.length;
                  } else delete blacklist[kk];
                }
              }
              break;
            } else {
              delete blacklist[k];
            }

            let sub;
            if(this._isMacro(k)) {
              sub = this._subsMacro(newText, k, {}, error, warn, nestSub, idx);
            } else {
              sub = this._subsSimple(newText, k, {}, error, warn, nestSub, idx);
            }
            if(sub === null) {
              continue;
            }

            // handle # and ## operator
            sub[0] = this._handleOps(sub[0], error, warn);

            // handle _Pragma()
            sub[0] = this._handlePragma(sub[0], error, warn);

            // XXX a bit too expensive ... but not too easy to avoid.
            pieces.push(newText.slice(0, idx));
            newText = sub[0] + newText.slice(idx + sub[1]);
            rex.lastIndex = 0;

            // adjust blacklist indices
            for(let kk in blacklist) {
              if(blacklist[kk] != TOTALLY_BLACK) {
                if(blacklist[kk] > idx) {
                  blacklist[kk] = sub[0].length - sub[1] + (blacklist[kk] - idx);
                } else delete blacklist[kk];
              }
            }

            // rescan this string, but keep the macro that we just replaced
            // blacklisted until we're beyond the replacement. This
            // prevents infinite recursion and is also mandated by the
            // standard and crucial for proper evaluation of several of
            // its more ... evil ehm elaborate samples.
            blacklist[k] = sub[0].length;
            break;
          }
        }
      }

      pieces.push(newText);
      newText = pieces.join('');

      // if macro substitution is complete, re-introduce any
      // '##' tokens previously substituted in order to keep them
      // from being treated as operators. Same for spaces and empty
      // tokens.
      if(!nestSub) {
        newText = this._removeSentinels(newText);
      }

      return newText;
    },

    // ----------------------
    // Transfer the state from another cpp.js instance to us.
    _setState(other) {
      other = other._getState();

      state = other.state;
      macroCountsByLength = other.macroCountsByLength;
      macroCache = other.macroCache;
      maxMacroLength = other.maxMacroLength;
    },

    // ----------------------
    // Get a dictionary containing the full processing state of us
    _getState(other) {
      return {
        state: state,
        macroCountsByLength: macroCountsByLength,
        macroCache: macroCache,
        maxMacroLength: maxMacroLength,
      };
    },

    // ----------------------
    // Given an array of single lines, produce the result text by merging lines
    // and trimming the result. The function also invokes the user-defined
    // completion callback, but it also returns the preprocessed text to the caller.
    _result(arr, state) {
      // drop empty lines at the end
      for(let i = arr.length - 1; i >= 0; --i) {
        if(!arr[i]) {
          arr.pop();
        } else {
          break;
        }
      }

      let text = arr.join('\n');
      if(settings.completionFunc) {
        settings.completionFunc(text, arr, state);
      }

      return text;
    },

    // ----------------------
    // Check if `identifier` is a well-formed identifier according to C rules.
    _isIdentifier(identifier) {
      // Note: important to use match() because test() would update
      // the 'lastIndex' property on the regex.
      return !!identifier.match(isIdentifierOnlyRe);
    },

    // ----------------------
    // Check if `macro` is a well-formed macro name.
    _isMacro(macro) {
      return this._getMacroInfo(macro) != null;
    },

    // ----------------------
    // Check if `tok` is a special preprocessor token (such as ==, <=, >=).
    // These tokens are handled differently when participating on either side
    // of the ## operator.
    _isPpSpecialToken(tok) {
      return trim(tok) in ppSpecialTokenList;
    },

    // ----------------------
    // Get the description dictionary for a macro named `k` or null if the macro
    // is malformed (i.e. syntax wrong). Does not add new macros to the macro
    // cache but uses the cache to speed-up looking up known macros.
    _getMacroInfo(k) {
      if(macroCache[k]) {
        return macroCache[k];
      }

      let m = isMacroOnlyRe.exec(k);
      if(!m) {
        return null;
      }
      isMacroOnlyRe.lastIndex = 0;

      let params = m[2].split(',');
      if(params.length === 1 && !trim(params[0])) {
        // parameterless macro (i.e. #define p () )
        params = [];
      } else {
        for(let i = 0; i < params.length; ++i) {
          let t = (params[i] = trim(params[i]));
          if(!this._isIdentifier(t) && !this._isMacro(t)) {
            return null;
          }
        }
      }

      // ES 1.8's sticky flag would be useful, but sadly it is not
      // universally supported yet.
      let pat = new RegExp(m[1] + '\\s*\\(', 'g');

      return {
        params: params,
        pat: pat,
        name: m[1],
        full: k,
      };
    },

    // ----------------------
    // Remove all sentinel strings (i.e. placeholders for spaces
    // or empty tokens to indicate placeholder tokens) from the
    // given string.
    _removeSentinels(newText) {
      newText = newText.replace(isPseudoTokenDoublesharp, '##');
      newText = newText.replace(isPseudoTokenSpace, ' ');
      newText = newText.replace(isPseudoTokenEmpty, '');
      newText = newText.replace(isPseudoTokenNosubs, '');
      return newText;
    },

    // ----------------------
    // Evaluate the _Pragma(string) preprocessor operator in the given
    // (partially substituted) sequence of preprocessor tokens.
    _handlePragma(text, error, warn) {
      let self = this;
      // XXX obviously RE aren't sufficient here either, do proper parse.
      return text.replace(/_Pragma\s*\(\s*"(.*?([^\\]|\\\\))"\s*\)/g, function(match, pragma) {
        // destringize
        pragma = pragma.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        pragma = self._removeSentinels(pragma);
        pragma = self._concatenateStrings(pragma);

        if(!settings.pragmaFunc(pragma)) {
          warn('unrecognized _Pragma(): ' + pragma);
        }

        // always substitute an empty string so processing
        // can continue.
        return '';
      });
    },

    // ----------------------
    // Concatenate neighbouring string literals such as " hello "
    // "world " and return the result.
    _concatenateStrings(text) {
      let inString = false,
        last = null,
        lastTaken = 0;
      let textOut = [];
      for(let i = 0; i < text.length; ++i) {
        if(isStringBoundary(text, i)) {
          if(inString) {
            last = i;
          } else if(last !== null) {
            textOut.push(text.slice(lastTaken, last));
            lastTaken = i + 1;
          }
          inString = !inString;
        } else if(!text[i].match(/\s/)) {
          textOut.push(text.slice(lastTaken, i));
          lastTaken = i;
          last = null;
        }
      }
      textOut.push(text.slice(lastTaken));
      return textOut.join('');
    },

    // ----------------------
    // Evaluate the '##' and '#' preprocessor operator in the given (partially
    // substituted) sequence of preprocessor tokens.
    _handleOps(text, error, warn) {
      // XXX The code below is not only extremely slow, it also doesn't
      // take into account that the # operator can only be applied to
      // macro parameter, an information that is no longer available
      // at this point.

      // 6.10.3.2: "The order of evaluation of # and ## operators
      // is unspecified.". We pick '##' first.
      let op,
        pieces = [],
        inString = false;
      for(let op = 0; op < text.length - 1; ++op) {
        if(isStringBoundary(text, op)) {
          inString = !inString;
          continue;
        }

        if(text[op] !== '#' || inString) {
          continue;
        }

        let isConcat = text[op + 1] === '#';
        let left = null,
          right = null;

        // identify the tokens on either side of the ## operator or
        // only on the right side of the # operator.
        let i,
          inInnerString = false,
          nest = 0;
        if(isConcat) {
          for(i = op - 1; i >= 0; --i) {
            if(!text[i].match(/\s/)) {
              if(isStringBoundary(text, i)) {
                inInnerString = !inInnerString;
              } else if(text[i] === '(') {
                ++nest;
              } else if(text[i] === ')') {
                --nest;
              }
              left = text[i] + (left || '');
            } else if(left !== null) {
              if(!inInnerString && !nest) {
                break;
              }
              left = ' ' + left;
            }
          }
          ++i;
        } else {
          i = op;
        }

        inInnerString = false;
        nest = 0;

        let j,
          firstSpace = true;
        for(j = op + (isConcat ? 2 : 1); j < text.length; ++j) {
          if(!text[j].match(/\s/)) {
            firstSpace = true;
            if(isStringBoundary(text, j)) {
              inInnerString = !inInnerString;
            } else if(text[j] === '(') {
              ++nest;
            } else if(text[j] === ')') {
              --nest;
            }
            right = (right || '') + text[j];
          } else if(right !== null && !inInnerString && !nest) {
            break;
          } else {
            // 6.10.3.2 (#): each occurrence of white space between the
            // argument's preprocessing tokens becomes a single space
            // character in the character string literal
            if((isConcat || firstSpace || inInnerString) && right !== null) {
              right = right + ' ';
              firstSpace = false;
            }
          }
        }

        right = trim(right || '');

        let concat;
        if(isConcat) {
          left = trim(left || '');
          if(!right || !left) {
            error('## cannot appear at either end of a macro expansion');
          }

          // To my reading of the standard, it works like this:
          // if both sides are *not* preprocessing special tokens,
          // the concatenation is always ok. Otherwise the result
          // must be a valid preprocessing special token as well.
          if((this._isPpSpecialToken(left) || this._isPpSpecialToken(right)) && !this._isPpSpecialToken(left + right)) {
            error('pasting "' + left + '" and "' + right + '" does not give a valid preprocessing token');
          }

          // the result of the concatenation is another token, but
          // we must take care that the '##' token is not treated
          // as concatenation operator in further replacements.
          concat = left + right;
          if(concat == '##') {
            concat = pseudoTokenDoublesharp;
          } else {
            // tokens that we marked as no longer available for
            // substitution become available again when they're
            // concatenated with other tokens.
            concat = concat.replace(isPseudoTokenNosubs, '');
          }
        } else {
          if(!right) {
            error('# cannot appear at the end of a macro expansion');
          }

          concat = '"' + right.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        }

        pieces.push(text.slice(0, i));
        pieces.push(concat);

        if(j < text.length) {
          pieces.push(text.slice(j));
        }

        text = pieces.join('');
        pieces.length = 0;

        op = 0;
      }

      return text;
    },

    // ----------------------
    // Substitute an occurences of `macroName` in `text` that begins at offset
    // `startIdx`. `macroName` must be a simple macro with no parameter list.
    // Return a 2-tuple with the substitution string and the substituted length
    // in the original string.
    _subsSimple(text, macroName, blacklistIn, error, warn, nestSub, startIdx) {
      // no macro but just a parameterless substitution
      let rex = new RegExp(macroName + '(\\b|' + pseudoTokenSpace + '|' + pseudoTokenEmpty + ')', 'g');

      rex.lastIndex = startIdx || 0;
      let mFound = rex.exec(text);
      if(!mFound || mFound.index != startIdx) {
        return null;
      }

      return [state[macroName], mFound[0].length];
    },

    // ----------------------
    // Substitute an occurences of `macroName` in `text` that begins at offset
    // `startIdx`. `macroName` must be a simple macro with parameters.
    // Return a 2-tuple with the substitution string and the substituted length
    // in the original string.
    _subsMacro(text, macroName, blacklist, error, warn, nestSub, startIdx) {
      let info = this._getMacroInfo(macroName);
      let oldText = text;

      info.pat.lastIndex = startIdx || 0;
      let mFound = info.pat.exec(text);
      if(!mFound || mFound.index != startIdx) {
        return null;
      }

      let paramsFound = [],
        last,
        nest = -1,
        inString = false;

      // here macro invocations may be nested, so a regex is not
      // sufficient to "parse" this.
      for(let i = mFound.index; i < text.length; ++i) {
        if(text[i] == ',' && !nest) {
          paramsFound.push(trim(text.slice(last, i)));
          last = i + 1;
        }

        if(text[i] == '(') {
          if(++nest === 0) {
            last = i + 1;
          }
        } else if((text[i] == '"' || text[i] == "'") && (!i || text[i - 1] != '\\')) {
          if(inString) {
            --nest;
          } else {
            ++nest;
          }
          inString = !inString;
        } else if(text[i] == ')') {
          if(--nest === -1) {
            paramsFound.push(trim(text.slice(last, i)));
            last = i + 1;
            break;
          }
        }
      }

      if(nest !== -1) {
        error('unbalanced parentheses, expected )');
      }

      if(paramsFound.length != info.params.length) {
        // special case: if no arguments are expected and none passed either,
        // we will still get one empty argument from the previous logic.
        if(info.params.length || paramsFound.length > 1 || paramsFound[0]) {
          error('illegal invocation of macro ' + macroName + ', expected ' + info.params.length + ' parameters but got ' + paramsFound.length);
        } else {
          paramsFound = [];
        }
      }

      // macro parameters may potentially be empty, but this would lead
      // to trouble in subsequent substitutions. So substitute a sentinel
      // string.
      for(let i = 0; i < paramsFound.length; ++i) {
        if(!paramsFound[i]) {
          paramsFound[i] = pseudoTokenEmpty;
        }
      }

      // insert arguments into replacement list, but evaluate them
      // PRIOR to doing this (6.10.3.1). We need, however, to
      // exclude all arguments directly preceeded or succeeded by
      // either the stringization or the token concatenation operator
      let repl = state[macroName];

      for(let i = 0; i < info.params.length; ++i) {
        // what applies to empty parameter applies to whitespace in the
        // parameter text as well (only whitespace that concates two
        // otherwise distinct tokens). Substitute by a magic sentinel.
        // This must be done PRIOR to evaluating the parameters -
        // a parameter might evaluate to something like '2, 4'
        // which should obviously not be escaped.
        let paramSubs = paramsFound[i].replace(/(\w)\s+(\w)/g, '$1' + pseudoTokenSpace + '$2');
        paramSubs = this.subs(paramSubs, blacklist, error, warn, nestSub + 1);

        let rex = new RegExp('^' + info.params[i] + '\\b');
        let ignore = false,
          pieces = [],
          m,
          bound = true;
        for(let j = 0; j < repl.length; ++j) {
          if(repl[j] == '#') {
            ignore = true;
          } else if(bound && (m = rex.exec(repl.slice(j)))) {
            if(!ignore) {
              for(let k = j + m[0].length; k < repl.length; ++k) {
                if(repl[k] == '#') {
                  ignore = true;
                } else if(!repl[k].match(/\s/)) {
                  break;
                }
              }
            }

            pieces.push(repl.slice(0, j));
            pieces.push(ignore ? paramsFound[i] : paramSubs);
            repl = repl.slice(j + m[0].length);

            j = -1;
            continue;
          } else if(!repl[j].match(/\s/)) {
            ignore = false;
          }
          bound = repl[j].match(/\W/);
        }

        pieces.push(repl);
        repl = pieces.join('');
      }
      return [repl, last - startIdx];
    },

    // ----------------------
    // Execute a sanitized arithmetic expression given by `scr` and return
    // the result. This is not intended to be for 'security'. We do trust any
    // code that we preprocess. However, it would not be desirable if the
    // JS environment could be accidentially altered from within
    // #if's, so let's try to hide eval()'s power as good as we can.
    _maskedEval(scr) {
      // based on http://stackoverflow.com/questions/543533/restricting-eval-to-a-narrow-scope
      if(!evalMask) {
        // set up an object to serve as the context for the code
        // being evaluated.
        evalMask = {};

        // mask global properties
        let glob = [];
        try {
          // browser environment, window object present
          glob = [
            window,
            {
              window: 1,
            },
          ];
        } catch(e) {
          try {
            // node.js top-level objects present
            glob = [
              global,
              {
                global: 1,
                process: 1,
                require: 1,
                module: 1,
                __filename: 1,
                __dirname: 1,
              },
            ];
          } catch(e) {}
        }

        for(let i = 0; i < glob.length; ++i) {
          for(let p in glob[i]) {
            evalMask[p] = undefined;
          }
        }

        // bring defined() function into scope
        evalMask.defined = this.defined;
      }

      evalMask.__result__ = false;

      // execute script in private context
      const tmpfn = new Function('with(this) { __result__ = (' + scr + '); }');
      try {
        tmpfn.call(evalMask);
      } catch(e) {
        console.log('tmpfn', tmpfn + '');
        console.log('tmpfn.call', tmpfn.call);
      }

      return evalMask.__result__;
    },

    // ----------------------
    // Evaluate a raw and not yet preprocessed expression from a
    // #if/#ifdef clause and return the result.
    _eval(val, error, warn) {
      let oldVal = val;
      // see 6.10.1.2-3

      // string literals are not allowed
      if(val.match(isStringRe)) {
        error('string literal not allowed in if expression');
      }

      // neither are assignment or compound assignment ops
      if(val.replace(/[=!<>]=/g, '').match(isAssignmentRe)) {
        error('assignment operator not allowed in if expression');
      }

      // same for increment/decrement - we need to catch these
      // cases because they might be used to exploit eval().
      if(val.match(isIncrementRe)) {
        error('--/++ operators not allowed in if expression');
      }

      // XXX handle character constants

      // drop the L,l,U,u suffixes for integer literals
      val = val.replace(isIntegerRe, '$1$2$3');

      // macro substitution - but do not touch unary operands to 'defined',
      // this is done by substituting a safe sentinel value (which starts
      // with two underscores and is thus reserved).
      val = val.replace(definedNoParensRe, 'defined($1)');
      val = val.replace(definedRe, ' __defined_magic_$1_ ');

      val = this.subs(val, {}, error, warn);

      // re-substitute defined() terms and quote the argument
      val = val.replace(definedMagicSentinelRe, 'defined("$1")');

      // replace all remaining identifiers with '0'
      val = val.replace(isIdentifierRe, ' 0 ');

      // what remains _should be safe to use with eval() since
      // it doesn't contain any identifiers and is thus not able
      // to invoke global functions. This version of eval is
      // even a bit safer and masks all global functions so
      // anything we missed should eventually get caught.
      // See _maskedEval() for the details.
      try {
        var res = !!this._maskedEval(val);
      } catch(e) {
        if(e instanceof TypeError) {
          console.log('TypeError', e.message, e.stack);
          throw e;
        } else error('error in expression: ' + oldVal + ' (' + e + ')', e.stack);
      }

      return res;
    },
  };
}

export default cppJs;
