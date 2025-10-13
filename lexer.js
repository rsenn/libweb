export { Location } from './location.js';

Lexer.defunct = function(chr) {
  const { loc, state } = this;

  console.log('defunct', { loc, state });
  console.log('this.input.length', this.input.length);
  console.log('this.input', this.input.slice(0, 100));
  console.log('this.loc.file', this.loc.file);

  let line = [this.index - (loc.column - 1)];

  line.push(this.input.indexOf('\n', line[0]));

  line = this.input.slice(...line);

  let rules = [...this.getRules()];
  throw new Error(
    'Unexpected character at index ' +
      (this.index - 1) +
      ': "' +
      chr +
      '"\nline: "' +
      line +
      '"\nloc: ' +
      loc.toString() +
      '\nstate=' +
      [...this.stateStack.map(n => this.states[n]), this.topState()] +
      '\nrules:\n' +
      rules.map(r => '  ' + (r.name + ': ').padEnd(20) + r.pattern.source).join('\n'),
  );
};

try {
  Lexer.engineHasStickySupport = typeof /(?:)/.sticky == 'boolean';
} catch(ignored) {
  Lexer.engineHasStickySupport = false;
}

try {
  Lexer.engineHasUnicodeSupport = typeof /(?:)/.unicode == 'boolean';
} catch(ignored) {
  Lexer.engineHasUnicodeSupport = false;
}

function Token(lexeme, index, type, id, loc) {
  Object.assign(this, { lexeme, id, type });
  if(loc) define(this, { loc, index });
}

Token.prototype.offset = -1;
Token.prototype.toString = function() {
  return this.lexeme;
};
Token.prototype.valueOf = function() {
  return this.id;
};

Lexer.prototype.addRule = function(name, pattern, callback, start) {
  const n = this.rules.length;
  if(typeof pattern == 'string') pattern = new RegExp(pattern, 's');
  let { global, source, sticky, multiline, ignoreCase, unicode, flags } = pattern;
  let offs = source[0] == '<' ? source.indexOf('>') + 1 : 0;
  let states = (offs > 0 ? source.slice(1, offs - 1) : '').split(',');
  let mask = 0;
  for(let state of states) {
    let stateIndex;
    if((stateIndex = this.states.indexOf(state)) == -1) {
      stateIndex = this.states.length;
      this.states.push(state);
    }
    mask |= 1 << stateIndex;
  }
  // console.log(`addRule ${name}(${n})`, { states, mask });
  source = source.slice(offs);
  while(/{[A-Za-z][A-Za-z0-9]*}/.test(source)) {
    let subst = source.replaceAll(/{([A-Za-z][A-Za-z0-9]*)}/g, (sub, def, pos) => {
      const r = this.defines[def];
      //console.log({ def,r});
      return r ?? `{!!!${def}!!!}`;
    });
    if(subst == source) throw new Error(`Substitution '${subst}' == '${source}'`);
    source = subst;
  }
  if(!global || (Lexer.engineHasStickySupport && !sticky)) {
    flags = Lexer.engineHasStickySupport ? 's' : '';
    flags += Lexer.engineHasStickySupport ? 'y' : '';
    //flags += 'g';
    if(multiline) flags += 'm';
    if(ignoreCase) flags += 'i';
    if(Lexer.engineHasUnicodeSupport && unicode) flags += 'u';
  }
  pattern = new RegExp(source, flags);

  if(Object.prototype.toString.call(start) !== '[object Array]') start = [0];

  if(typeof callback == 'number') {
    let mode = callback;
    callback = (lex, lexeme, index) => {
      //if(name != 'whitespace') console.log('callback', { lexeme, index, name });
      this.mode = mode;
    };
  }
  callback ||= (lex, lexeme, index) => {
    //if(name != 'whitespace') console.log('callback', { lexeme, index, name });
  };
  this.tokens.push(name);
  const id = n + 1;
  const lexer = this;
  this.rules.push({
    id,
    name,
    pattern,
    global,
    action: (result, length, offset) => {
      const lexeme = result[0];
      const { loc } = this;
      //lexeme??=this.input.slice(this.index, this.index + length);

      //assert(result[0], this.input.slice(this.index, this.index + length), 'lexeme corrupt');

      let tok = callback(this, result[0], offset);
      //tok= new Token(result[0], offset, name, id, null); console.log('tok', tok);
      return Object.create(Token.prototype, {
        line: { value: loc.line },
        id: { value: id, enumerable: true },
        lexeme: { value: lexeme, enumerable: true },
        offset: {
          get() {
            return offset;
          },
          enumerable: false,
        },
        type: {
          get() {
            return lexer.tokens[this.id - 1];
          },
          enumerable: false,
        },
      });
    },
    mask,
    start,
  });

  return this;
};
Lexer.prototype.define = function(name, pattern) {
  if(typeof pattern != 'string') pattern = pattern.source;
  this.defines[name] = pattern;

  return this;
};
Lexer.prototype.pushState = function(state) {
  let id = this.states.indexOf(state);
  if(id == -1) throw new Error('pushState');
  this.stateStack.push(this.state);
  this.state = id;
  return this;
};
Lexer.prototype.popState = function(state) {
  this.state = this.stateStack.pop();
  return this;
};

Lexer.prototype.getRules = function* (state) {
  state ??= this.state;
  for(let rule of this.rules) {
    if(state & rule.mask) yield rule;
  }
};
Lexer.prototype.topState = function() {
  /* const { stateStack } = this;
  return stateStack[stateStack.length - 1];*/
  return this.states[this.state];
};

Lexer.prototype[Symbol.iterator] = function* () {
  const { length } = this.input;
  while(this.index < length) {
    let tok = this.lex();
    //    console.log('tok', tok);
    if(!tok) break;
    yield tok;
  }
};

export function Lexer(defunct) {
  if(typeof defunct !== 'function') defunct = Lexer.defunct;

  var tokens = [];
  var rules = (this.rules = []);
  var defines = (this.defines = {});
  var remove = 0;
  this.state = 0;
  this.states = [];
  this.tokens = [];
  this.index = 0;
  this.input = '';
  this.stateStack = [];
  this.loc = new Location(1, 1, 0, null, false);

  this.setInput = function(input, filename) {
    remove = 0;
    this.state = 0;
    this.index = 0;
    tokens.length = 0;
    this.input = input;
    this.loc.file = filename;
    return this;
  };
  const { loc } = this;

  const incr = n => {
    for(let i = 0; i < n; i++) {
      if(this.input[this.index] == '\n') {
        loc.line++;
        loc.column = 1;
      } else {
        loc.column++;
      }
      this.index++;
    }
  };

  this.lex = function() {
    if(tokens.length) return tokens.shift();

    this.reject = true;

    while(this.index <= this.input.length) {
      var matches = scan.call(this).splice(remove);
      var index = this.index;
      // console.log('matches', matches);
      while(matches.length) {
        if(this.reject) {
          var match = matches.shift();
          const { action, result, rule, length } = match;
          const { state } = this;

          this.reject = false;
          remove++;
          //console.log('match', { state, action, lexeme: result[0], rule, length,  });

          var token = action.call(this, result, length, index);
          incr(length);

          if(this.reject) this.index = result.index;
          else if(typeof token !== 'undefined') {
            switch (Array.isArray(token)) {
              case '[object Array]':
                tokens = token.slice(1);
                token = token[0];
              default:
                if(length) remove = 0;
                return token;
            }
          }
        } else break;
      }

      var input = this.input;

      if(index < input.length) {
        if(this.reject) {
          remove = 0;
          var token = defunct.call(this, input.charAt(this.index++));
          if(typeof token !== 'undefined') {
            if(Object.prototype.toString.call(token) === '[object Array]') {
              tokens = token.slice(1);
              return token[0];
            } else return token;
          }
        } else {
          if(this.index !== index) remove = 0;
          this.reject = true;
        }
      } else if(matches.length) this.reject = true;
      else break;
    }
  };

  function scan() {
    var matches = [];
    var index = 0;
    let { state, input } = this;
    var lastIndex = this.index;
    // console.log('scan', { state});

    for(var i = 0, length = rules.length; i < length; i++) {
      var rule = rules[i];
      let { start } = rule;
      var states = start.length;

      if(((1 << state) & rule.mask) == 0) continue;

      // console.log('scan', { state,i, rule, start, states });

      /* if(!states || start.indexOf(state) >= 0 || (state % 2 && states === 1 && !start[0]))*/ {
        var pattern = rule.pattern;
        pattern.lastIndex = lastIndex;
        var result = pattern.exec(input);
        //  console.log('pattern.exec', rule.name, { lastIndex, pattern, result });

        if(result && result.index === lastIndex) {
          var j = matches.push({
            result: result,
            rule: rule.name,
            action: rule.action,
            length: result[0].length,
          });

          if(rule.global) index = j;

          while(--j > index) {
            var k = j - 1;

            if(matches[j].length > matches[k].length) {
              var temple = matches[j];
              matches[j] = matches[k];
              matches[k] = temple;
            }
          }
        }
      }
    }

    return matches;
  }
}

export default Lexer;
