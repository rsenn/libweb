import Util from "../util.js";
import Lexer, { SyntaxError } from "./lexer.js";
import { tokenTypes } from "./token.js";
import estree from "./estree.js";

export function Parser(sourceText, prefix) {
  this.tokens = [];
  this.lexer = new Lexer(sourceText);
  this.stack = [];
  this.prefix = prefix ? `${prefix}:` : "";
}

function getFn(name) {
  let fn;
  try {
    fn = eval(name);
  } catch(err) {}
  return fn;
}

function isLiteral({ type }) {
  return type === tokenTypes.stringLiteral || type === tokenTypes.numericLiteral || type === tokenTypes.regexpLiteral || type === tokenTypes.nullLiteral || type === tokenTypes.booleanLiteral;
}

function backTrace() {
  const stack = new Error().stack;
  const str = stack.toString().replace(/\n\s*at /g, "\n");
  let arr = str.split(/\n/g);

  arr = arr
    .map(line => {
      let matches = /^(.*)\s\((.*):([0-9]*):([0-9]*)\)$/.exec(line);
      if(matches) {
        let name = matches[1].replace(/Parser\./, "Parser.prototype.");
        let r = {
          name: name.replace(/.*\.prototype\./, ""),
          file: matches[2].replace(new RegExp("/.*lotto//"), ""),
          line: parseInt(matches[3]),
          column: parseInt(matches[4])
        };
        let fn = getFn(name);
        let caller = fn ? (fn ? Util.fnName(fn, Parser.prototype) : fn) : undefined;
        // this.log("name: '" +name+"'");
        if(typeof fn === "function") {
          // this.log("fn: ", Util.fnName(fn, Parser.prototype, Parser));
          // this.log("fn: ", caller);
        }
        return r;
      }
      return null;
    })
    .filter(e => e != null)
    .map(e => `${e.file}:${e.line}:${e.column} ${e.name}`);

  console.log("STACK: ", arr.join("\n"));

  /*
  let bt = [];
  let fn = backTrace;

  while(fn) {
    const name = Util.fnName(fn);

    bt.push(fn);

    fn = fn;
  }
  consnole.log("bt: ", bt);*/
}

function toStr(a) {
  if(a && a.toString !== undefined) return a.toString();
  return typeof a === "object" ? JSON.stringify(a).substring(0, 20) : String(a);
}

/*const stackFunc = (name, fn) =>
  function() {
    const args = [...arguments];
    const len = this.stack.length;
    this.stack.push(name);
    this.log('' + name + '(' + args.map(a => toStr(a)).join(', ') + ')');
    let ret = fn.apply(this, args);
    while(this.stack.length > len) this.stack.pop();
    return ret;
  };
*/
const stackFunc = (name, fn) => fn;

const operatorPrecedence = {
  "||": 0,
  "&&": 1,
  "|": 2,
  "^": 3,
  "&": 4,
  "==": 5,
  "===": 5,
  "!=": 5,
  "!==": 5,
  "<": 6,
  ">": 6,
  "<=": 6,
  ">=": 6,
  instanceof: 6,
  "<<": 7,
  ">>": 7,
  "-->>": 7,
  "+": 8,
  "-": 8,
  "*": 9,
  "/": 9,
  "%": 9
};

Parser.prototype = {
  constructor: Parser,

  /*
   * Lexer Interactions
   */
  // Returns the next token
  next() {
    let token;
    if(this.tokens.length > 0) {
      token = this.tokens[0];
    } else {
      token = this.lexer.lex();
      this.tokens.push(token);
    }
    this.pos = this.position(token);
    this.token = this.tokens[0];
    return token;
  },
  lookahead(offset = 0) {
    let token;
    while(this.tokens.length <= offset) {
      this.tokens.push(this.lexer.lex());
    }
    return this.tokens[offset];
  },
  consume() {
    if(this.tokens.length === 0) this.next();
    const token = this.tokens.shift();
    if(this.tokens.length == 0) this.next();
    return token;
    //parseRemainingMemberExpression2;
  },
  printtoks() {
    let token = this.token;
    let pos = token ? token.pos.toString() : "";
    let buf = "";

    if(token) {
      buf = this.lexer.source
        .substring(token.from, Math.min(token.to, token.from + 6))
        .replace(/\n/g, "\\n")
        .substring(0, 6);
    }
    if(token) return `"${buf}"${Util.pad(buf, 6)} ${pos}${Util.pad(pos, 10)}`;
    return "";
  },
  log() {
    const width = 72;
    let args = [...arguments].map(a => (typeof a === "string" ? `"${a}"` : toStr(a)).replace(/[\n\r\t ]+/g, ""));
    let name = Util.abbreviate(Util.trim(args.join(""), "'\""), width);
    let stack = Util.getCallerStack().map(st => st.getFunctionName());
    /*this.stack.map((name, i) => `${i}:${name}`).join(", ");*/

    const posstr = this.prefix + String(this.pos);
    console.log.apply(console, [posstr + Util.pad(posstr, this.prefix.length + 8), name + Util.pad(name, width), this.printtoks(), "stack: " + stack.indexOf("parseProgram")]);
  },
  position(tok = null) {
    let obj = tok ? tok.pos : this.lexer;
    if(obj) {
      const { line, column } = obj;
      return `${line}:${column} `;
    }
    return "";
  },
  /*
   * Helper Functions
   */ expectIdentifier(no_keyword = false) {
    this.log(`expectIdentifier(no_keyword=${no_keyword})`);
    const token = this.consume();
    if(!(token.type === tokenTypes.identifier || (no_keyword && token.type == tokenTypes.keyword))) {
      throw new SyntaxError(`${this.position()} Expecting Identifier, but got ${token.type} with value: ${token.value}`);
    }
    this.log(`expectIdentifier2(no_keyword=${no_keyword})`);

    // backTrace(p.expectIdentifier);

    return new estree.Identifier(token.value);
  },
  expectKeywords(keywords) {
    this.log(`expectKeywords(${keywords}) `);
    const token = this.consume();
    if(token.type !== tokenTypes.keyword) {
      throw new SyntaxError(`${this.position()} ${this.position()} Expecting Keyword, but got ${token.type} with value: ${token.value}`);
    }
    if(Array.isArray(keywords)) {
      if(keywords.indexOf(token.value) < 0) {
        throw new SyntaxError(`${this.position()} Expected: ${keywords}    Actual: ${token.value || token.type}`);
      }
    } else if(keywords !== token.value) {
      throw new SyntaxError(`${this.position()} Expected: ${keywords}    Actual: ${token.value || token.type}`);
    }
    return token;
  },
  expectPunctuators(punctuators, ast) {
    this.log(`expectPunctuators(${punctuators}) `);
    const token = this.consume();
    if(token.type !== tokenTypes.punctuator) {
      throw new SyntaxError(`${this.position()} Expecting Punctuator, but got ${token.type} with value: ${token.value}`, ast);
    }
    if(Array.isArray(punctuators)) {
      if(punctuators.indexOf(token.value) < 0) {
        throw new SyntaxError(`${this.position()} Expected: ${punctuators}    Actual: ${token.value}`, ast);
      }
    } else if(punctuators !== token.value) {
      throw new SyntaxError(`${this.position()} Expected: ${punctuators} Actual: ${token.VALUE}`, ast);
    }
    return token;
  },
  expectLiteral() {
    this.log("expectLiteral() ");
    const token = this.consume();
    if(!isLiteral(token)) {
      throw new SyntaxError(`${this.position()} Expecting Literal, but got ${token.type} with value: ${token.value}`);
    }
    this.log("New literal: ", token);
    return new estree.Literal(token.value);
  },
  matchKeywords(keywords) {
    const token = this.next();
    if(token.type !== tokenTypes.keyword) {
      return false;
    }
    if(Array.isArray(keywords)) {
      return keywords.indexOf(token.value) >= 0;
    } else {
      return keywords === token.value;
    }
  },
  matchPunctuators(punctuators) {
    const token = this.next();
    // this.log('matchPunctuators(' +punctuators +') ');
    if(token.type !== tokenTypes.punctuator) {
      return false;
    }
    if(Array.isArray(punctuators)) {
      return punctuators.indexOf(token.value) >= 0;
    } else {
      return punctuators === token.value;
    }
  },
  matchIdentifier(no_keyword = false) {
    const token = this.next();
    // this.log('matchIdentifier() ');
    return token.type === tokenTypes.identifier || (no_keyword && token.type === tokenTypes.keyword);
  },
  matchLiteral() {
    const token = this.next();
    this.log(`matchLiteral() token=${token.value}`);
    return isLiteral(token);
  },
  matchStatement() {
    return this.matchPunctuators(";") || this.matchKeywords(["if", "var", "let", "const", "with", "while", "do", "for", "continue", "break", "return", "switch", "import", "export", "try"]) || this.matchAssignmentExpression();
  },
  matchPrimaryExpression() {
    return this.matchKeywords(["this", "async"]) || this.matchPunctuators(["(", "[", "{", "<", "..."]) || this.matchLiteral() || this.matchIdentifier();
  },
  matchUnaryExpression() {
    return this.matchKeywords(["delete", "void", "typeof", "await"]) || this.matchPunctuators(["++", "--", "+", "-", "~", "!"]);
  },
  matchAssignmentExpression() {
    return this.matchUnaryExpression() || this.matchLeftHandSideExpression() || this.matchFunctionExpression();
  },
  matchFunctionExpression() {
    const async = this.lookahead(0).value == "async";
    const token = this.lookahead(async ? 1 : 0);
    return this.matchKeywords("function") || (token && token.value == "get");
  },
  matchMemberExpression() {
    return this.matchPrimaryExpression() || this.matchKeywords("new");
  },
  matchLeftHandSideExpression() {
    return this.matchMemberExpression(...arguments);
  },
  /*
   * Actual recursive descent part of things
   */ parsePrimaryExpression() {
    let is_async = false,
      rest_of = false;
    let ret = null;
    if(this.matchIdentifier() && this.token.value == "async") {
      is_async = true;
      this.expectIdentifier();
    } else if(this.matchPunctuators("...")) {
      rest_of = true;
      this.expectPunctuators("...");
    }

    if(!is_async && this.matchKeywords("this")) {
      this.expectKeywords("this");
      ret = new estree.ThisExpression();
    } else if(!is_async && this.matchPunctuators("<")) {
      ret = this.parseJSX();
    } else if(!is_async && this.matchLiteral()) {
      ret = this.expectLiteral();
    } else if(this.matchIdentifier() /* || this.matchKeywords(["async"])*/) {
      let id = this.expectIdentifier();

      if(this.matchPunctuators("=>")) id = this.parseArrowFunction([id], is_async);

      ret = id;
    } else if(this.matchPunctuators("(")) {
      this.expectPunctuators("(");
      let expression = [];
      if(!this.matchPunctuators(")")) expression = this.parseExpression();
      //console.log("expression:", expression);
      this.expectPunctuators(")");
      if(this.matchPunctuators("=>")) expression = this.parseArrowFunction(expression, is_async);

      ret = expression;
    }
    if(rest_of) {
      ret = new estree.RestOfExpression(ret);
    }
    return ret;
  },
  parseArguments() {
    const args = [];
    let rest_of = false;
    const checkRestOf = parser => {
      if(parser.matchPunctuators("...")) {
        parser.expectPunctuators("...");
        rest_of = true;
      }
    };
    this.expectPunctuators("(");
    checkRestOf(this);
    if(this.matchAssignmentExpression()) {
      while(true) {
        checkRestOf(this);
        let arg = this.parseAssignmentExpression();
        if(rest_of) arg = new estree.RestOfExpression(arg);
        args.push(arg);
        if(rest_of) break;
        if(this.matchPunctuators(",")) {
          this.expectPunctuators(",");
          continue;
        }
        break;
      }
    }
    this.expectPunctuators(")", args);
    return args;
  },
  parseRemainingMemberExpression(object) {
    while(this.matchPunctuators([".", "["])) {
      // this.log('parseRemainingMemberExpression(', object, ')');
      if(this.matchPunctuators(".")) {
        this.expectPunctuators(".");
        const identifier = this.expectIdentifier(true);
        // this.log('parseRemainingMemberExpression2(', object.value, ') ', // identifier.value);

        object = new estree.MemberExpression(object, identifier, false);

        this.log("parseRemainingMemberExpression2(", object.toString(), ")", Util.fnName(this.parseRemainingMemberExpression));
      } else if(this.matchPunctuators("[")) {
        this.expectPunctuators("[");
        const expression = this.parseExpression(true);
        this.expectPunctuators("]");
        object = new estree.MemberExpression(object, expression, true);
      }
    }
    return object;
  },
  parseArrowFunction(args, is_async = false) {
    this.expectPunctuators("=>");
    let body;
    if(this.matchPunctuators("{")) body = this.parseBlock(false, true);
    else body = this.parseExpression();
    return new estree.ArrowFunction(args, body, is_async);
  },
  parseRemainingCallExpression(object, is_async = false) {
    /* let args = this.parseArguments();

*/
    while(this.matchPunctuators([".", "[", "("])) {
      if(this.matchPunctuators(".")) {
        this.expectPunctuators(".");
        const identifier = this.expectIdentifier(true);
        object = new estree.MemberExpression(object, identifier, false);
      } else if(this.matchPunctuators("[")) {
        this.expectPunctuators("[");
        const expression = this.parseExpression();
        this.expectPunctuators("]");
        object = new estree.MemberExpression(object, expression, true);
      } else if(this.matchPunctuators("(")) {
        let args = this.parseArguments();
        if(this.matchPunctuators("=>")) object = this.parseArrowFunction(args, is_async);
        else object = new estree.CallExpression(object, args);
      }
    }
    return object;
  },
  parseNewOrCallOrMemberExpression(couldBeNewExpression, couldBeCallExpression) {
    let do_await = false,
      is_async = false;
    if(this.matchKeywords("await")) {
      do_await = true;
      this.expectKeywords("await");
    }
    /* if(this.matchLiteral() && this.token.value == "async") {
    is_async = true;
    this.expectLiteral("async");
  }
*/
    this.log(`parseNewOrCallOrMemberExpression(${couldBeNewExpression}, ${couldBeCallExpression})`);
    let object = null;
    if(!is_async && this.matchKeywords("new")) {
      this.expectKeywords("new");
      const result = this.parseNewOrCallOrMemberExpression(couldBeNewExpression, false);
      couldBeNewExpression = result.couldBeNewExpression;
      let args = [];
      if(!couldBeNewExpression || this.matchPunctuators("(")) {
        args = this.parseArguments();
        // As soon as ( Arguments ) is encountered, then we're no longer
        // parsing at the NewExpression level.
        // Also, if couldBeNewExpression is false, then always try to
        // parse Arguments it has to be there.
        couldBeNewExpression = false;
      }
      object = new estree.NewExpression(result.object, args);
    } else {
      object = this.parsePrimaryExpression();
      //console.log("Object:", object, this.token);
    }

    object = this.parseRemainingMemberExpression(object);

    // If at the end of trying to parse MemberExpression we see Arguments
    // again, then that means this is a CallExpression instead.
    if(this.matchPunctuators("(") && couldBeCallExpression) {
      couldBeNewExpression = false;

      object = this.parseRemainingCallExpression(object, is_async);
    }

    if(do_await) {
      object = new estree.AwaitExpression(object);
    }

    return { object, couldBeNewExpression };
  },
  parseLeftHandSideExpression() {
    this.log(`parseLeftHandSideExpression()`);
    let object = this.parseNewOrCallOrMemberExpression(true, true).object;
    this.log(`parseLeftHandSideExpression()`);
    return object;
  },
  parsePostfixExpression() {
    this.log(`parsePostfixExpression()`);
    let lhs = true;
    let expression = this.parseLeftHandSideExpression();
    // TODO: Deny line terminator here
    if(this.matchPunctuators("++")) {
      lhs = false;
      this.expectPunctuators("++");
      expression = new estree.UpdateExpression("++", expression, false);
    } else if(this.matchPunctuators("--")) {
      lhs = false;
      this.expectPunctuators("--");
      expression = new estree.UpdateExpression("--", expression, false);
    }
    return { ast: expression, lhs };
  },
  parseUnaryExpression() {
    this.log(`parseUnaryExpression()`);
    const unaryKeywords = ["delete", "void", "typeof"];
    const unaryPunctuators = ["++", "--", "+", "-", "~", "!"];
    if(this.matchKeywords("await")) {
      this.expectKeywords("await");
      const argument = this.parseUnaryExpression();
      return new estree.AwaitExpression(argument);
    } else if(this.matchKeywords(unaryKeywords)) {
      const operatorToken = this.expectKeywords(unaryKeywords);
      const argument = this.parseUnaryExpression();
      return {
        ast: new estree.UnaryExpression(operatorToken.value, argument.ast, true),
        lhs: false
      };
    } else if(this.matchPunctuators(unaryPunctuators)) {
      const operatorToken = this.expectPunctuators(unaryPunctuators);
      const argument = this.parseUnaryExpression();
      let ast;
      if(operatorToken.value === "++" || operatorToken.value === "--") {
        ast = new estree.UpdateExpression(operatorToken.value, argument.ast, true);
      } else {
        ast = new estree.UnaryExpression(operatorToken.value, argument.ast, true);
      }
      return { ast, lhs: false };
    } else {
      return this.parsePostfixExpression();
    }
  }, // Uses precedence climbing to deal with binary expressions, all of which have
  // left-to-right associtivity in this case.
  parseBinaryExpression(minPrecedence) {
    this.log(`parseBinaryExpression()`);

    const punctuators = ["||", "&&", "|", "^", "&", "===", "==", "!==", "!=", "<", ">", "<=", ">=", "<<", ">>", "-->>", "+", "-", "*", "/", "%"];
    const result = this.parseUnaryExpression();
    let ast = result.ast;
    let lhs = result.lhs;
    this.matchPunctuators(punctuators);
    let tok = this.token;
    let value = tok.value;
    //  if(tok.value == 'instanceof')
    //  this.log('TOKEN: ', tok);
    while((this.matchKeywords("instanceof") || this.matchPunctuators(punctuators) || tok.value == "instanceof") && operatorPrecedence[(tok = this.next()).value] >= minPrecedence) {
      // this.log('VALUE: ', value);
      // If any operator is encountered, then the result cannot be
      // LeftHandSideExpression anymore
      lhs = false;
      const precedenceLevel = operatorPrecedence[this.next().value];
      const operatorToken = value == "instanceof" ? this.expectKeywords("instanceof") : this.expectPunctuators(punctuators);
      const right = this.parseBinaryExpression(precedenceLevel + 1);
      if(operatorToken.value === "||" || operatorToken.value === "&&") {
        ast = new estree.LogicalExpression(operatorToken.value, ast, right.ast);
      } else {
        ast = new estree.BinaryExpression(operatorToken.value, ast, right.ast);
      }
    }
    return { ast, lhs };
  },
  parseConditionalExpression() {
    this.log(`parseConditionalExpression()`);
    const result = this.parseBinaryExpression(0);
    let ast = result.ast;
    let lhs = result.lhs;
    if(this.matchPunctuators("?")) {
      this.expectPunctuators("?");
      const consequent = this.parseAssignmentExpression();
      // this.log('consequent: ', consequent);
      this.expectPunctuators(":");
      const alternate = this.parseAssignmentExpression();
      ast = new estree.ConditionalExpression(ast, consequent, alternate);
      lhs = false;
    }
    return { ast, lhs };
  },
  parseAssignmentExpression() {
    this.log(`parseAssignmentExpression()`);
    if(this.matchKeywords(["function", "get"])) {
      let get = false;
      if(this.matchKeywords("get")) {
        this.expectKeywords("get");
        get = true;
      }
      return this.parseFunction();
    } else if(this.matchPunctuators("{")) {
      return this.parseObject();
    } else if(this.matchPunctuators("[")) {
      //     return this.parseNewOrCallOrMemberExpression();
      let object = this.parseArray();
      if(this.matchPunctuators(".")) {
        object = this.parseRemainingMemberExpression(object);
      }
      return object;
    }

    // Won't know immediately whether to parse as ConditionalExpression or
    // LeftHandSideExpression. We'll only know later on during parsing if we
    // come across things that cannot be in LeftHandSideExpression.
    const result = this.parseConditionalExpression();
    if(result.lhs) {
      // Once it is determined that the parse result yielded
      // LeftHandSideExpression though, then we can parse the remaining
      // AssignmentExpression with that knowledge
      const assignmentOperators = ["=", "*=", "/=", "%=", "+=", "-=", "<<=", ">>=", "-->>=", "&=", "^=", "|="];
      if(this.matchPunctuators(assignmentOperators)) {
        const left = result.ast;
        const operatorToken = this.expectPunctuators(assignmentOperators);
        const right = this.parseAssignmentExpression();
        return new estree.AssignmentExpression(operatorToken.value, left, right);
      } else {
        return result.ast;
      }
    } else {
      return result.ast;
    }
  },
  parseExpression(optional) {
    this.log(`parseExpression()`);
    const expressions = [];
    let expression = this.parseAssignmentExpression();
    if(expression !== null) {
      expressions.push(expression);
    } else if(!optional) {
      const token = this.next();
      throw new SyntaxError(`${this.position()} Expecting AssignmentExpression, but got ${token.type} with value: ${token.value}`);
    }
    //console.log("expression: ", expression);

    while(this.matchPunctuators(",")) {
      this.expectPunctuators(",");
      expression = this.parseAssignmentExpression();
      if(expression !== null) {
        expressions.push(expression);
      } else if(!optional) {
        const token = this.next();
        throw new SyntaxError(`${this.position()} Expecting AssignmentExpression, but got ${token.type} with value: ${token.value}`);
      }
    }
    if(expressions.length > 1) {
      return new estree.SequenceExpression(expressions);
    } else if(expressions.length === 1) {
      return expressions[0];
    } else if(optional) {
      return null;
    } else {
      throw new Error(`${this.position()} Shouldn't ever be here`);
    }
  },
  parseBindingPattern() {
    let tok = this.expectPunctuators(["{", "["]);
    let props = [];

    while(true) {
      let property, element, rest;
      rest = this.matchPunctuators("...");
      if(rest) this.expectPunctuators("...");

      property = element = this.expectIdentifier();

      if(rest) {
        props.push(new estree.RestOfExpression(property));
      } else {
        if(this.matchPunctuators(":")) {
          this.expectPunctuators(":");
          element = this.expectIdentifier();
        }

        props.push(new estree.BindingProperty(property, element));
      }

      if(this.expectPunctuators(["}", "]", ","]).value != ",") break;
    }

    return tok.value == "{" ? new estree.ObjectBinding(props) : new estree.ArrayBinding(props);
  },
  parseVariableDeclaration() {
    let identifier = null;

    this.log(`parseVariableDeclaration()`);

    if(this.matchPunctuators(["{", "["])) identifier = this.parseBindingPattern();
    else identifier = this.expectIdentifier();

    let assignment = null;
    if(this.matchPunctuators("=")) {
      this.expectPunctuators("=");
      assignment = this.parseAssignmentExpression();
      if(assignment === null) {
        const token = this.next();
        throw new SyntaxError(`${this.position()} Expecting AssignmentExpression, but got ${token.type} with value: ${token.value}`);
      }
    }
    return { identifier, assignment };
  },
  parseVariableDeclarationList(kind = "var", exported = false) {
    this.log(`parseVariableDeclarationList()`);
    const declarations = []; // Destructuring not yet on by default in nodejs
    let declarator = this.parseVariableDeclaration();
    let identifier = declarator.identifier;
    let assignment = declarator.assignment;
    declarations.push(new estree.VariableDeclarator(identifier, assignment));
    while(this.matchPunctuators(",")) {
      this.expectPunctuators(",");
      declarator = this.parseVariableDeclaration();
      identifier = declarator.identifier;
      assignment = declarator.assignment;
      declarations.push(new estree.VariableDeclarator(identifier, assignment));
    }
    return new estree.VariableDeclaration(declarations, kind, exported);
  },
  parseBlock(insideIteration, insideFunction) {
    this.log(`parseBlock()`);
    const statements = [];
    this.expectPunctuators("{");
    while(this.matchStatement()) {
      statements.push(this.parseStatement(insideIteration, insideFunction));
    }
    //ccononsole.log("statements:", statements);

    this.expectPunctuators("}");
    return new estree.BlockStatement(statements);
  },
  parseList(insideIteration = false, insideFunction = false, check = p => false) {
    this.log(`parseList()`);
    const statements = [];
    while(this.matchStatement()) {
      statements.push(this.parseStatement(insideIteration, insideFunction));
      if(check(this)) break;
    }
    return new estree.StatementList(statements);
  },
  parseObject() {
    let ctor = estree.ObjectLiteral;
    this.log(`parseObject()`);
    let members = {};
    this.expectPunctuators("{");
    while(true) {
      let getter = false;
      let member = null;
      if(this.matchKeywords("get")) {
        this.expectKeywords("get");
        getter = true;
      }

      if(this.matchIdentifier()) {
        member = this.expectIdentifier();
      } else if(this.matchPunctuators("[")) {
        this.expectPunctuators("[");
        member = this.expectLiteral();
        this.expectPunctuators("]");
      } else if(this.matchPunctuators(":")) {
        if(getter) {
          member = { value: "get" };
          getter = false;
        }
      }
      if(this.matchPunctuators("(")) {
        members[member.value] = this.parseFunction();
      } else if(this.matchPunctuators(":")) {
        this.expectPunctuators(":");
        if(!this.matchAssignmentExpression()) break;
        members[member.value] = this.parseAssignmentExpression();
      } else if(typeof member == "object" && member !== null && "value" in member) {
        ctor = estree.ObjectBinding;
        members[member.value] = null;
      }
      if(this.matchPunctuators(",")) this.expectPunctuators(",");
      else if(this.matchPunctuators("}")) break;
    }
    this.expectPunctuators("}");

    if(ctor == estree.ObjectBinding) {
      members = Object.entries(members).map(([key, value]) => new estree.BindingProperty(new estree.Identifier(key), value ? new estree.Identifier(value) : new estree.Identifier(key)));
    }
    return new ctor(members);
  },
  parseArray() {
    this.log(`parseArray()`);
    let members = [];
    let object;
    this.expectPunctuators("[");
    while(true) {
      if(this.matchPunctuators("]")) break;
      if(this.matchAssignmentExpression()) {
        members.push(this.parseAssignmentExpression());
      }
      if(this.matchPunctuators(",")) this.expectPunctuators(",");
    }
    this.expectPunctuators("]");
    object = new estree.ArrayLiteral(members);

    if(this.matchPunctuators(".")) {
      object = this.parseRemainingMemberExpression(object);
    }
    return object;
  },
  parseJSXTag() {
    let closed = false,
      selfClosing = false,
      name,
      value,
      tag,
      attrs = {};
    this.lexer.noRegex = true;
    this.expectPunctuators("<");

    if(this.matchPunctuators("/")) {
      this.expectPunctuators("/");
      closed = true;
    }
    if(this.matchIdentifier()) {
      tag = this.expectIdentifier();
    }
    while(this.matchIdentifier()) {
      name = this.expectIdentifier().value;
      if(this.matchPunctuators("=")) {
        this.expectPunctuators("=");
        if(this.matchPunctuators("{")) {
          this.expectPunctuators("{");
          value = this.parseExpression();
          this.expectPunctuators("}");
        } else {
          value = this.expectLiteral();
        }
      } else {
        value = new estree.Literal("true");
      }
      attrs[name] = value;
    }
    if(this.matchPunctuators("/")) {
      this.expectPunctuators("/");
      selfClosing = true;
    }
    this.expectPunctuators(">");
    this.lexer.noRegex = false;

    console.log(
      `JSX <${closed ? "/" : ""}${tag.value}${Object.entries(attrs)
        .map(([name, value]) => ` ${name}="${value.value}"`)
        .join("")
        .substring(0, 100)}... ${selfClosing ? "/" : ""}>`
    );

    return new estree.JSXLiteral(tag.value, attrs, closed, selfClosing);
  },
  parseJSX(depth = 0) {
    let tok2, tok3;
    this.log(`parseJSX(${depth})`);
    let members = [];

    for(;;) {
      this.lexer.noRegex = true;

      if(!this.matchPunctuators("<")) break;

      tok2 = this.lookahead(1);
      if(tok2.value == "/") break;
      // tok3 = this.lookahead(2);

      let tag = this.parseJSXTag();

      members.push(tag);
      let jsx = members[members.length - 1];

      jsx.children = [];
      console.log("JSX:", jsx);

      if(jsx.selfClosing && depth == 0) break;

      if(!tag.closing && !tag.selfClosing) {
        let toks = [];
        while(!this.matchPunctuators("<")) {
          let tok = this.consume();
          toks.push(tok.value);
        }
        let text = toks.join(" ");
        if(text != "") jsx.children.push(new estree.Literal(text));
        console.log("toks:", toks);
      }
      if(jsx.selfClosing) continue;

      this.lexer.noRegex = true;

      if(this.matchPunctuators("<")) {
        tok2 = this.lookahead(1);
        console.log("tok2:", tok2);

        if(tok2.value != "/" && !jsx.closing && !jsx.selfClosing) {
          jsx.children = jsx.children.concat(this.parseJSX(depth + 1));
        }
      }

      if(this.matchPunctuators("<")) {
        tok2 = this.lookahead(1);
        tok3 = this.lookahead(2);
        if(tok2.value == "/" && tok3.value == tag.tag) {
          this.tokens = [];
          this.expectPunctuators(">");
          /*          this.consume();
          this.consume();
*/ break;
        }
      }
    }
    console.log(`parseJSX(${depth}) end`);
    if(depth == 0) {
      this.lexer.noRegex = false;
      return members[0];
    }

    return members;
  },
  parseVariableStatement(exported = false) {
    this.log(`parseVariableStatement()`);
    let keyw = this.expectKeywords(["var", "let", "const"]);
    const ast = this.parseVariableDeclarationList(keyw.value, exported);
    this.matchPunctuators(";");
    this.expectPunctuators(";");
    //console.log("ast:",ast);
    return ast;
  },
  parseImportStatement() {
    this.log("parseImportStatement()");
    this.expectKeywords("import");
    const identifiers = this.parseVariableDeclarationList("");
    this.expectKeywords("from");
    const sourceFile = this.parseExpression();
    this.expectPunctuators(";");
    return new estree.ImportStatement(identifiers, sourceFile);
  },
  parseExportStatement() {
    this.log("parseExportStatement()");
    this.expectKeywords("export");
    if(this.matchKeywords("class")) {
      return this.parseClass(true);
    } else if(this.matchKeywords("function")) {
      return this.parseFunction(true);
    }
    return this.parseVariableStatement(true);
  },
  parseDecoratorStatement() {
    this.log("parseDecoratorStatement()");
    let st = null;

    while(true) {
      this.expectPunctuators("@");
      let id = this;
      let call = this.parseNewOrCallOrMemberExpression(false, true);
      let identifier = this.expectIdentifier();

      st = this.parseRemainingCallExpression(identifier);

      break;
    }

    return st;
  },
  parseExpressionStatement() {
    this.log(`parseExpressionStatement()`);

    const expression = this.parseExpression();
    if(this.matchPunctuators(";")) this.expectPunctuators(";");
    return /*new estree.ExpressionStatement*/ expression;
  },
  parseIfStatement(insideIteration, insideFunction) {
    this.expectKeywords("if");
    this.expectPunctuators("(");
    const test = this.parseExpression();
    this.expectPunctuators(")");
    const consequent = this.parseStatement(insideIteration, insideFunction);
    if(consequent === null) {
      throw new SyntaxError("Expecting statement for if-statement");
    }
    let alternate = null;
    if(this.matchKeywords("else")) {
      this.expectKeywords("else");
      alternate = this.parseStatement(insideIteration, insideFunction);
      if(alternate === null) {
        throw new SyntaxError("Expecting statement for else block in if-statement");
      }
    }
    return new estree.IfStatement(test, consequent, alternate);
  },
  parseWhileStatement(insideFunction) {
    this.expectKeywords("while");
    this.expectPunctuators("(");
    const test = this.parseExpression();
    this.expectPunctuators(")");
    const statement = this.parseStatement(true, insideFunction);
    if(statement === null) {
      throw new SyntaxError("Expecting statement for while-statement");
    }
    return new estree.WhileStatement(test, statement);
  },
  parseDoStatement() {
    this.expectKeywords("do");
    const statement = this.parseStatement(true);
    if(statement === null) {
      throw new SyntaxError("Expecting statement for do-while-statement");
    }
    this.expectKeywords("while");
    this.expectPunctuators("(");
    const test = this.parseExpression();
    this.expectPunctuators(")");
    return new estree.DoStatement(test, statement);
  },
  parseForStatement(insideFunction) {
    this.expectKeywords("for");
    this.expectPunctuators("(");
    let isForInStatement = false;
    let left = null;
    let right = null;
    let init = null;
    let test = null;
    let update = null;
    if(this.matchKeywords(["var", "let", "const"])) {
      // Can be either of the following forms:
      // for( var VariableDeclarationList ; Expression(opt) ; Expression(opt) )
      // Statement for( var Identifier Initializer(opt) in Expression ) Statement
      let keyw = this.expectKeywords(["var", "let", "const"]);
      const ast = this.parseVariableDeclarationList(keyw.value, false);
      if((keyw = this.matchKeywords(["in", "of"]))) {
        isForInStatement = true;
        left = ast;
        // Make sure the ast contains only one identifier and at most one
        // initializer
        if(ast.declarations.length !== 1) {
          throw new SyntaxError(`${this.position()} Expecting only one Identifier and at most one Initializer in a ForIn statement`);
        }
        this.expectKeywords(["in", "of"]);
        right = this.parseExpression();
      } else {
        init = ast;
        this.expectPunctuators(";");
        test = this.parseExpression(true);
        this.expectPunctuators(";");
        update = this.parseExpression(true);
      }
    } else {
      // Can be either of the following forms:
      // for( Expression(opt) ; Expression(opt) ; Expression(opt) ) Statement
      // for( LeftHandSideExpression in Expression ) Statement
      init = left = this.parseExpression(true);
      if(this.matchPunctuators(";")) {
        this.expectPunctuators(";");
        test = this.parseExpression(true);
        this.expectPunctuators(";");
        update = this.parseExpression(true);
      } else {
        isForInStatement = true;
        this.expectKeywords("in");
        right = this.parseExpression();
      }
    }
    this.expectPunctuators(")");
    const statement = this.parseStatement(true, insideFunction);
    if(statement === null) {
      throw new SyntaxError("Expecting statement for for-statement");
    }
    if(isForInStatement) {
      return new estree.ForInStatement(left, right, statement);
    } else {
      return new estree.ForStatement(init, test, update, statement);
    }
  },
  parseIterationStatement(insideFunction) {
    this.log(`parseIterationStatement()`);
    if(this.matchKeywords("while")) {
      return this.parseWhileStatement(insideFunction);
    } else if(this.matchKeywords("do")) {
      return this.parseDoStatement(insideFunction);
    } else {
      return this.parseForStatement(insideFunction);
    }
  },
  parseSwitchStatement(insideFunction) {
    let kw, sv, cv, stmt;
    this.expectKeywords("switch");
    this.expectPunctuators("(");
    sv = this.parseExpression();
    this.expectPunctuators(")");
    this.expectPunctuators("{");
    while(true) {
      kw = this.expectKeywords(["case", "default"]);
      if(kw.value == "default") cv = null;
      else cv = this.parseExpression();
      this.expectPunctuators(":");

      stmt = this.parseList(true, insideFunction, p => p.matchKeywords(["case", "default"]));

      if(this.matchPunctuators("}")) break;
    }
    this.expectPunctuators("}");
  },
  parseTryStatement() {
    this.expectKeywords("try");
    //this.expectPunctuators("{");
    const body = this.parseBlock(false, false);
    this.expectKeywords("catch");
    let parameters = [];
    this.expectPunctuators("(");
    // Parse optional parameter list
    if(this.matchIdentifier()) {
      parameters.push(this.expectIdentifier());
      while(this.matchPunctuators(",")) {
        this.expectPunctuators(",");
        parameters.push(this.expectIdentifier());
      }
    }
    this.expectPunctuators(")");

    // Parse function body
    const trap = this.parseBlock(false, false);

    let object = new estree.TryStatement(body, parameters, trap);

    if(this.matchPunctuators("(")) {
      return this.parseRemainingCallExpression(object);
    }

    return object;
  },
  parseWithStatement(insideIteration, insideFunction) {
    this.expectKeywords("with");
    this.expectPunctuators("(");
    const test = this.parseExpression();
    this.expectPunctuators(")");
    const statement = this.parseStatement(insideIteration, insideFunction);
    if(statement === null) {
      throw new SyntaxError("Expecting statement for with-statement");
    }
    return new estree.WithStatement(test, statement);
  },
  parseContinueStatement() {
    this.expectKeywords("continue");
    this.expectPunctuators(";");
    return new estree.ContinueStatement();
  },
  parseBreakStatement() {
    this.expectKeywords("break");
    this.expectPunctuators(";");
    return new estree.BreakStatement();
  },
  parseReturnStatement() {
    this.log(`parseReturnStatement()`);
    this.expectKeywords("return");
    let expression = null;
    if(this.matchAssignmentExpression()) {
      expression = this.parseAssignmentExpression();
    }
    this.expectPunctuators(";");
    return new estree.ReturnStatement(expression);
  },
  parseStatement(insideIteration, insideFunction) {
    this.log(`parseStatement()`);
    // Parse Block
    if(this.matchPunctuators("{")) {
      return this.parseBlock(insideIteration, insideFunction);
    } else if(this.matchPunctuators("@")) {
      return this.parseDecorator();
    }

    //console.log(this.token);
    // Parse Variable Statement
    if(this.matchKeywords(["var", "let", "const"])) {
      return this.parseVariableStatement();
    }
    // Parse import Statement
    else if(this.matchKeywords("import")) {
      return this.parseImportStatement();
    }
    // Parse Empty Statement
    else if(this.matchPunctuators(";")) {
      this.expectPunctuators(";");
      return new estree.EmptyStatement();
    }
    // Parse Expression Statement
    else if(this.matchAssignmentExpression()) {
      return this.parseExpressionStatement();
    }
    // Parse If Statement
    else if(this.matchKeywords("if")) {
      return this.parseIfStatement(insideIteration, insideFunction);
    }
    // Parse Iteration Statement
    else if(this.matchKeywords(["while", "for", "do"])) {
      return this.parseIterationStatement(insideFunction);
    }
    // Parse Switch Statement
    else if(this.matchKeywords("switch")) {
      return this.parseSwitchStatement(insideFunction);
    } else if(this.matchKeywords("try")) {
      return this.parseTryStatement();
    }
    // Parse With Statement
    else if(this.matchKeywords("with")) {
      return this.parseWithStatement(insideIteration, insideFunction);
    } else if(this.matchKeywords("continue")) {
      if(insideIteration) {
        return this.parseContinueStatement();
      } else {
        throw new SyntaxError(`${this.position()} continue; statement can only be inside an iteration`);
      }
    } else if(this.matchKeywords("break")) {
      if(insideIteration) {
        return this.parseBreakStatement();
      } else {
        throw new SyntaxError(`${this.position()} break; statement can only be inside an iteration`);
      }
    } else if(this.matchKeywords("return")) {
      if(insideFunction) {
        return this.parseReturnStatement();
      } else {
        throw new SyntaxError(`${this.position()} return statement can only be inside a function`);
      }
    } else {
      const { column, line } = this.lexer;
      const tok = this.lexer.tokens[0];
      throw new SyntaxError(`${this.position()} Unexpected token: `, JSON.stringify(tok));
    }
  },
  parseClass(exported = false) {
    this.expectKeywords("class");
    f;
    // Parse name of the function
    const identifier = this.expectIdentifier();
    let extending = null;

    if(this.matchKeywords("extends")) {
      this.expectKeywords("extends");
      extending = this.expectIdentifier();
    }
    // Parse function body
    const body = this.parseBlock(false, false);

    this.expectPunctuators(";");

    return new estree.ClassDeclaration(identifier, extending, body, exported);
  },
  parseFunction(exported = false) {
    if(this.matchKeywords("function")) this.expectKeywords("function");
    // Parse name of the function
    let identifier = "";
    if(this.matchIdentifier(true)) {
      identifier = this.expectIdentifier(true);
    }
    let parameters = [];
    this.expectPunctuators("(");
    // Parse optional parameter list
    if(this.matchIdentifier()) {
      parameters.push(this.expectIdentifier());
      while(this.matchPunctuators(",")) {
        this.expectPunctuators(",");
        parameters.push(this.expectIdentifier());
      }
    }
    this.expectPunctuators(")");

    // Parse function body
    const body = this.parseBlock(false, true);

    let object = new estree.FunctionDeclaration(identifier, parameters, body, exported);

    if(this.matchPunctuators("(")) {
      return this.parseRemainingCallExpression(object);
    }

    return object;
  },
  parseSourceElement() {
    //  let exported = false;
    //  if(this.matchKeywords('export')) {
    //    this.expectKeywords('export');
    //    exported = true;
    //  }
    let exported = false;

    if(this.matchKeywords("export")) {
      return this.parseExportStatement();
    } else if(this.matchKeywords("class")) {
      return this.parseClass(exported);
    } else if(this.matchKeywords("function")) {
      return this.parseFunction(exported);
    } else {
      return this.parseStatement(false, false, exported);
    }
  },
  parseProgram() {
    const body = [];

    body.push(this.parseSourceElement());

    // Check to see if there are more SourceElement
    while(this.matchStatement() || this.matchKeywords("function")) {
      let sourceElement = this.parseSourceElement();

      //console.log("Source element: ", sourceElement);
      body.push(sourceElement);
    }

    if(this.tokens.length >= 1 && this.tokens[0].type !== tokenTypes.eof) {
      throw new SyntaxError(`Didn't consume all tokens: ${Util.inspect(this.tokens[0])}`);
    }

    return new estree.Program(body);
  }
};

Parser.parse = async function parse(sourceText, prefix) {
  const parser = new Parser(sourceText, prefix);
  function timeout(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("timeout done");
      }, ms);
    });
  }

  return new Promise((resolve, reject) => {
    timeout(1000).then(() => resolve("timeout"));

    resolve(parser.parseProgram());
  });
};

export default Parser;
