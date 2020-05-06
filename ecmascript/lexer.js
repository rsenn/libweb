import { Token } from "./token.js";
import { tokenTypes } from "./token.js";
import Util from "../util.js";

export function Stack() {
  let stack = Util.getCallers(2, 30);

  return stack.map(({ fileName = '', columnNumber, lineNumber, functionName = '', methodName = '' }) => `  ${functionName}${Util.pad(functionName, 20)} ${(fileName+'').replace(/.*file:\/\//g, "")}:${lineNumber}:${columnNumber}`);
  /*
  stack = stack.filter(({ functionName }) => !/Parser.parser.</.test(functionName));
  stack = stack.filter(({ typeName }) => typeName == "Parser");
  stack = stack.map(({ functionName, methodName, position }) => ({
    method: functionName || methodName,
    position: position 
  }));*/
}

export function Error(msg) {
  this.msg = msg;
  this.stack = Stack();
}

export function SyntaxError(msg, ast, pos) {
  this.msg = msg;
  this.ast = ast;
  this.pos = pos;
  this.stack = Stack();
}

SyntaxError.prototype.toString = function() {
  const { msg, pos } = this;
  const { line, column } = pos || {};
  return (pos ? ` line=${line},column=${column} ` : "") + ` : ${msg} `;
};
  SyntaxError.prototype[Symbol.toStringTag] = function() { return this.toString(); };

function Lexer(sourceText) {
  this.setInput(sourceText);
}

const l = Lexer.prototype;

/*
 * Lexer States and Helper Functions
 */
l.reset = function(sourceText) {
  this.tokens = [];
  this.stateFn = this.lexText;
  this.source = sourceText;
  this.start = 0;
  this.pos = 0;
  this.line = 1;
  this.column = 1;
  this.tokenIndex = 0;
  this.noRegex = false;
};

// Skips over the pending input before this point
l.ignore = function() {
  this.start = this.pos;
};

// Returns the next character in the source code
l.peek = function(offset = 0) {
  if(this.pos + offset >= this.source.length) {
    // null represents EOF
    return null;
  }

  const c = this.source[this.pos + offset];
  this.c = c;
  return c;
};

// Returns the next character in the source code and advance position
l.next = function() {
  const c = this.peek();
  if(c !== null) {
    if(c == "\n") {
      this.line++;
      this.column = 1;
    }
    this.column++;
    this.pos++;
    // const { pos, line, column } = this;
    // console.log("Lexer.next { ", { pos, line, column }, " }");
  }
  this.c = c;
  return c;
};

l.backup = function() {
  this.pos--;
  this.column--;
};

l.position = function() {
  const { line, column } = this;
  return {
    line,
    column,
          [Symbol.toStringTag]() { return this.toString(); },
    toString() {
      const { line, column } = this;
      return `line=${line}:col=${column} `;
    }
  };
};

l.positionString = function() {
  const { line, column } = this;
       return `${line}:${column}`;
};

l.accept = function(validator) {
  const c = this.peek();
  if(c !== null && validator(c)) {
    this.pos++;
    if(c != "\n") {
      this.column++;
    } else {
      this.column = 0;
      this.line++;
    }
    return true;
  }

  return false;
};

l.acceptRun = function(validator) {
  let c;
  let startedAt = this.pos;
  do {
    c = this.peek();
    if(c === null) {
      break;
    }
  } while(validator(c) && ++this.pos);

  return this.pos > startedAt;
};

function not(fn) {
  return c => {
    const result = fn(c);
    return !result;
  };
}

function or(fn1, fn2) {
  return c => {
    return fn1(c) || fn2(c);
  };
}

function oneOf(str) {
  return c => {
    return str.indexOf(c) >= 0;
  };
}

l.addToken = function(type) {
  const { start, pos, column, line, source } = this;
  const token = new Token(type, source.substring(start, pos), start, pos, {
    line,
    column
  });
  this.tokens.push(token);
  this.ignore();
};

// Whitespace characters as specified by ES1
function isWhitespace(c) {
  if(c === "\u0009" || c === "\u000B" || c === "\u000C" || c === "\u0020") {
    return true;
  }
  return false;
}

function isLineTerminator(c) {
  if(c === "\n" || c === "\r") {
    return true;
  }
  return false;
}

function isQuoteChar(c) {
  return c === '"' || c === "'" || c === "`";
}

function isRegExpChar(c) {
  return c === "/";
}

function isPunctuatorChar(c) {
  const chars = ["=", ".", "-", "%", "}", ">", ",", "*", "[", "<", "!", "/", "]", "~", "&", "(", ";", "?", "|", ")", ":", "+", "^", "{", "@"];

  return chars.indexOf(c) >= 0;
}

function isPunctuator(word) {
  switch (word.length) {
    case 1:
      return ["=", ".", "-", "%", "}", ">", ",", "*", "[", "<", "!", "/", "]", "~", "&", "(", ";", "?", "|", ")", ":", "+", "^", "{", "@"].indexOf(word) >= 0;

    case 2:
      return ["!=", "*=", "&&", "<<", "/=", "||", ">>", "&=", "==", "++", "|=", "<=", "--", "+=", "^=", ">=", "-=", "%=", "=>"].indexOf(word) >= 0;

    case 3:
      return ["!==", "===", ">>=", "-->>", "<<=", "..."].indexOf(word) >= 0;

    case 4:
      return word === "-->>=";

    default:
      return false;
  }
}

function isAlphaChar(c) {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
}

function isDecimalDigit(c) {
  return c >= "0" && c <= "9";
}

function isOctalDigit(c) {
  return c >= "0" && c <= "7";
}

function isHexDigit(c) {
  return (c >= "0" && c <= "9") || (c >= "a" && c <= "f") || (c >= "A" && c <= "F");
}

function isIdentifierChar(c) {
  return isAlphaChar(c) || c === "$" || c === "_" || isDecimalDigit(c);
}

function isKeyword(word) {
  switch (word.length) {
    case 2:
      switch (word) {
        case "if":
        case "in":
        case "do":
        case "of":
          return true;
      }
      return false;

    case 3:
      switch (word) {
        case "for":
        case "new":
        case "var":
        case "try":
        case "let":
          return true;
      }
      return false;

    case 4:
      switch (word) {
        case "else":
        case "this":
        case "void":
        case "with":
        case "case":
        case "enum":
        case "from":
          return true;
      }
      return false;

    case 5:
      switch (word) {
        case "break":
        case "while":
        case "catch":
        case "class":
        case "const":
        case "super":
        case "throw":
        case "await":
          return true;
      }
      return false;

    case 6:
      switch (word) {
        case "delete":
        case "return":
        case "typeof":
        case "import":
        case "switch":
        case "export":
          return true;
      }
      return false;

    case 7:
      switch (word) {
        case "default":
        case "extends":
        case "finally":
          return true;
      }
      return false;

    case 8:
      switch (word) {
        case "continue":
        case "function":
        case "debugger":
          return true;
      }
      return false;

    case 10:
      switch (word) {
        case "instanceof":
          return true;
      }
      return false;

    default:
      return false;
  }
}

/*
 * Various State Functions
 */
l.lexIdentifier = function() {
  // Keywords and reserved keywords will be a subset of the words that
  // can be formed by identifier chars.
  // Keep accumulating chars and check for keyword later.
  this.acceptRun(isIdentifierChar);

  // Make sure identifier didn't start with a decimal digit
  const firstChar = this.source[this.start];
  if(isDecimalDigit(firstChar)) {
    throw new SyntaxError(`Invalid identifier: ${this.source.substring(this.start, this.pos)}`, this.position());
  }

  const c = this.peek();
  if(isQuoteChar(c)) {
    throw new SyntaxError(`Invalid identifier: ${this.source.substring(this.start, this.pos + 1)}`, this.position());
  }

  const word = this.source.substring(this.start, this.pos);
  if(word === "true" || word === "false") {
    this.addToken(tokenTypes.booleanLiteral);
  } else if(word === "null") {
    this.addToken(tokenTypes.nullLiteral);
  } else if(isKeyword(word)) {
    this.addToken(tokenTypes.keyword);
  } else {
    this.addToken(tokenTypes.identifier);
  }
  return this.lexText;
};

l.lexNumber = function() {
  let validator = isDecimalDigit;

  // If the first digit is 0, then need to first determine whether it's an
  // octal number, or a hex number, or a decimal number.
  if(this.accept(oneOf("0"))) {
    // If number started with 0x or 0X, then it's a hex number.
    if(this.accept(oneOf("xX"))) {
      validator = isHexDigit;

      // The hex number needs to at least be followed by some digit.
      if(!this.accept(validator)) {
        throw new SyntaxError(`Invalid number: ${this.source.substring(this.start, this.pos + 1)}`, this.position());
      }
    }
    // If number starts with 0 followed by an octal digit, then it's an
    // octal number.
    else if(this.accept(isOctalDigit)) {
      validator = isOctalDigit;
    }
    // If a 0 isn't a hex nor an octal number, then it's invalid.
    else if(this.accept(isDecimalDigit)) {
      throw new SyntaxError(`Invalid number: ${this.source.substring(this.start, this.pos)}`, this.position());
    }
  }

  // Keep on consuming valid digits until it runs out
  this.acceptRun(validator);

  if(validator == isDecimalDigit) {
    // A number could have a decimal in it, followed by a sequence of valid
    // digits again.
    if(this.accept(oneOf("."))) {
      this.acceptRun(validator);
    }

    if(this.accept(oneOf("eE"))) {
      this.accept(oneOf("+-"));
      if(!this.accept(validator)) {
        throw new SyntaxError(`Invalid number: ${this.source.substring(this.start, this.pos + 1)}`, this.position());
      }
      this.acceptRun(validator);
    }
  }

  // A number cannot be immediately followed by characters that could be used
  // for identifiers or keywords. It also cannot be immediately followed by
  // a string.
  const c = this.peek();
  if(isIdentifierChar(c) || isQuoteChar(c) || oneOf(".eE")(c)) {
    throw new SyntaxError(`Invalid number: ${this.source.substring(this.start, this.pos + 1)}`, this.position());
  }

  this.addToken(tokenTypes.numericLiteral);

  return this.lexText;
};

l.lexRegExp = function() {
  let i = 0;
  let word = "";
  let slashes = 1;
  let validator = c => {
    let last = word.substring(word.length - 1);
    if(c == "/") {
      slashes++;
    } else if(slashes == 2) {
      return c == "g" || c == "i";
    }
    if(last == ";") return false;
    // console.log('last: ' + last + " slashes: "+slashes);
    return true;
  };
  const print = () => {
    word = this.source.substring(this.start, this.pos);
    // console.log('word: ' + word + " lexText:
    // "+this.source.substring(this.start, this.pos));
  };

  // if(this.accept(oneOf('/')))

  while(this.accept(validator)) {
    print();
  }
  //    this.backup();
  this.addToken(tokenTypes.regexpLiteral);
  return this.lexText;
};

l.lexPunctuator = function() {
  // This loop will handle the situation when valid punctuators are next
  // to each other. E.g. ![x];
  while(this.accept(isPunctuatorChar)) {
    let word = this.source.substring(this.start, this.pos);

    // Keep accumulating punctuator chars, and as soon as the accumulated
    // word isn't a valid punctuator, we stop and backup to take the
    // longest valid punctuator before continuing.
    if(word != ".." && !isPunctuator(word)) {
      this.backup();
      this.addToken(tokenTypes.punctuator);
      return this.lexText;
    }
  }

  // Handle the case when punctuator is by itself and not next to
  // other punctuators.
  const word = this.source.substring(this.start, this.pos);
  if(isPunctuator(word)) {
    this.addToken(tokenTypes.punctuator);
    return this.lexText;
  } else {
    // This shouldn't ever happen, but throw an exception to make sure we
    // catch it if it does.
    throw new SyntaxError(`Invalid punctuator: ${word}`, this.position());
  }
};

l.lexQuote = quoteChar => {
  return function() {
    let prevChar = "";
    let c = "";
    let escapeEncountered = false;
    do {
      // Keep consuming characters unless we encounter line
      // terminator, \, or the quote char.
      if(this.acceptRun(not(or(isLineTerminator, oneOf(`\\${quoteChar}`))))) {
        escapeEncountered = false;
      }
      prevChar = c;
      c = this.next();
      if(c === null) {
        // If we reached EOF without the closing quote char, then this string is
        // incomplete.
        throw new SyntaxError(`Illegal token: ${this.source.substring(this.start, this.pos)}`, this.position());
      } else if(!escapeEncountered) {
        if(quoteChar === "`" && c == "{" && prevChar == "$") {
          while(c != "}") {
            prevChar = c;
            c = this.next();
          }
        } else if(isLineTerminator(c) && quoteChar !== "`") {
          // If we somehow reached EOL without encountering the
          // ending quote char then this string is incomplete.
          throw new SyntaxError(`Illegal token: ${this.source.substring(this.start, this.pos)}`, this.position());
        } else if(c === quoteChar) {
          this.addToken(tokenTypes.stringLiteral);
          return this.lexText;
        } else if(c === "\\") {
          escapeEncountered = true;
        }
      } else {
        escapeEncountered = false;
      }
    } while(true);
  };
};

l.lexSingleLineComment = function() {
  // Single line comment is only terminated by a line terminator
  // character and nothing else
  this.acceptRun(not(isLineTerminator));
  this.ignore();
  return this.lexText;
};

l.lexMultiLineComment = function() {
  do {
    // Multi-line comment is terminated if we see * followed by /
    const nextTwo = this.source.substring(this.pos, this.pos + 2);
    if(nextTwo === "*/") {
      this.pos += 2;
      this.ignore();
      return this.lexText;
    }

    this.next();
  } while(true);
};

l.lexText = function() {
  do {
    // Examine the next 2 characters to see if we're encountering code comments
    const nextTwo = this.source.substring(this.pos, this.pos + 2);
    if(nextTwo === "//") {
      this.pos += 2;
      return this.lexSingleLineComment;
    } else if(nextTwo === "/*") {
      this.pos += 2;
      return this.lexMultiLineComment;
    }

    // Consume the next character and decide what to do
    const c = this.next();
    if(c === null) {
      // EOF
      return null;
    } else if(!this.noRegex && isRegExpChar(c)) {
      return this.lexRegExp;
    } else if(isQuoteChar(c)) {
      return this.lexQuote(c);
    } else if(isDecimalDigit(c) || (c === "." && isDecimalDigit(this.peek()))) {
      this.backup();
      return this.lexNumber;
    } else if(isWhitespace(c)) {
      this.ignore();
    } else if(isPunctuatorChar(c)) {
      this.backup();
      return this.lexPunctuator;
    } else if(isIdentifierChar(c)) {
      this.backup();
      return this.lexIdentifier;
    } else if(isLineTerminator(c)) {
      this.ignore();
    } else {
      throw new SyntaxError(`Unexpected character: ${c}`, this.position());
    }
  } while(true);
};

l.nextToken = function() {
  if(this.tokenIndex >= this.tokens.length) {
    return new Token(tokenTypes.eof, null, this.source.length, this.source.length);
  }

  const token = this.tokens[this.tokenIndex];
  this.tokenIndex++;
  return token;
};

l.lex = function() {
  let idx = this.tokenIndex;
  do {
    this.stateFn = this.stateFn();
  } while(this.stateFn !== null && this.tokenIndex >= this.tokens.length);
  let tok = this.nextToken();
  //console.log("lex: ",this.tokenIndex , tok);
  return tok;
};

l.setInput = function(sourceText) {
  this.reset(sourceText);
  /*
  do {
    this.stateFn = this.stateFn();
  } while(this.stateFn !== null);*/
};

export default Lexer;
