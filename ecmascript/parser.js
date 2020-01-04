const util = require('util');
const Util = require('../util.es5.js');
const Lexer = require('./lexer.js');
const tokenTypes = require('./token.js').tokenTypes;
const estree = require('./estree.js');

function Parser(sourceText, prefix) {
  this.tokens = [];
  this.lexer = new Lexer(sourceText);
  this.stack = [];
  this.prefix = prefix ? prefix + ':' : '';
}

function getFn(name) {
  let fn;
  try {
    fn = eval(name);
  } catch(err) {}
  return fn;
}

function backTrace() {
  var stack = new Error().stack;
  var str = stack.toString().replace(/\n\s*at /g, '\n');
  var arr = str.split(/\n/g);

  arr = arr
    .map(line => {
      let matches = /^(.*)\s\((.*):([0-9]*):([0-9]*)\)$/.exec(line);
      if(matches) {
        let name = matches[1].replace(/Parser\./, 'Parser.prototype.');
        let r = {
          name: name.replace(/.*\.prototype\./, ''),
          file: matches[2].replace(/.*lotto\//, ''),
          line: parseInt(matches[3]),
          column: parseInt(matches[4])
        };
        let fn = getFn(name);
        let caller = fn ? (fn.caller ? Util.fnName(fn.caller, Parser.prototype) : fn.caller) : undefined;
        //this.log("name: '" +name+"'");
        if(typeof (fn) === 'function') {
          //this.log("fn: ", Util.fnName(fn, Parser.prototype, Parser));
          //this.log("fn.caller: ", caller);
        }
        return r;
      }
      return null;
    })
    .filter(e => e != null)
    .map(e => `${e.file}:${e.line}:${e.column} ${e.name}`);

  console.log('STACK: ', arr.join('\n'));

  /*
  let bt = [];
  let fn = backTrace;

  while(fn) {
    const name = Util.fnName(fn);

    bt.push(fn);

    fn = fn.caller;
  }
  consnole.log("bt: ", bt);*/
}

function toStr(a) {
  if(a && a.toString !== undefined) return a.toString();
  return typeof (a) === 'object' ? JSON.stringify(a).substring(0, 20) : String(a);
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
*/ const stackFunc = (
  name,
  fn
) => fn;

const e = exports;

const operatorPrecedence = {
  '||': 0,
  '&&': 1,
  '|': 2,
  '^': 3,
  '&': 4,
  '==': 5,
  '===': 5,
  '!=': 5,
  '!==': 5,
  '<': 6,
  '>': 6,
  '<=': 6,
  '>=': 6,
  "instanceof": 6,
  '<<': 7,
  '>>': 7,
  '-->>': 7,
  '+': 8,
  '-': 8,
  '*': 9,
  '/': 9,
  '%': 9
};

const p = Parser.prototype;

/*
 * Lexer Interactions
 */
// Returns the next token
p.next = function() {
  let token;
  if(this.tokens.length > 0) {
    token = this.tokens[0];
  } else {
    token = this.lexer.nextToken();
    this.tokens.push(token);
    this.pos = this.position(token);
  }
  this.token = this.tokens[0];
  return token;
};

p.consume = function consume() {
  if(this.tokens.length === 0) this.next();
  const token = this.tokens.shift();
  if(this.tokens.length == 0) this.next();
  return token;
  parseRemainingMemberExpression2;
};

p.printtoks = function printtoks() {
  let token = this.token;
  let pos = token ? token.pos.toString() : '';
  let buf = '';

  if(token) {
    buf = this.lexer.source
      .substring(token.from, Math.min(token.to, token.from + 6))
      .replace(/\n/g, '\\n')
      .substring(0, 6);
  }
  if(token) return '"' + buf + '"' + Util.pad(buf, 6) + ' ' + pos + Util.pad(pos, 10);
  return '';
};

p.log = function log() {
  const width = 72;
  let args = [...arguments].map(a => (typeof (a) === 'string' ? '"' + a + '"' : toStr(a)).replace(/[\n\r\t ]+/g, ''));
  let name = Util.abbreviate(Util.trim(args.join(''), '\'"'), width);
  let stack = this.stack.map((name, i) => `${i}:${name}`).join(', ');
  const posstr = this.prefix + String(this.pos);
  //console.log.apply(console, [posstr + Util.pad(posstr, this.prefix.length + 8), name + Util.pad(name, width), this.printtoks(), 'stack: ' + this.stack.length]);
};

p.position = function position(tok = null) {
  let obj = tok ? tok.pos : this.lexer;
  if(obj) {
    const { line, column } = obj;
    return line + ':' + column + ' ';
  }
  return '';
};

/*
 * Helper Functions
 */
p.expectIdentifier = function expectIdentifier(no_keyword = false) {
  this.log('expectIdentifier(', no_keyword, ') ');
  const token = this.consume();
  if(!(token.type === tokenTypes.identifier || (no_keyword && token.type == tokenTypes.keyword))) {
    throw new SyntaxError(`${this.position()} Expecting Identifier, but got ${token.type} with value: ${token.value}`);
  }
  this.log('expectIdentifier2(', no_keyword, ') ', token.value);

  //backTrace(p.expectIdentifier);

  return new estree.Identifier(token.value);
};

p.expectKeywords = function expectKeywords(keywords) {
  this.log('expectKeywords(' + keywords + ') ');
  const token = this.consume();
  if(token.type !== tokenTypes.keyword) {
    throw new SyntaxError(`${this.position()} ${this.position()} Expecting Keyword, but got ${token.type} with value: ${token.value}`);
  }
  if(Array.isArray(keywords)) {
    if(keywords.indexOf(token.value) < 0) {
      throw new SyntaxError(`${this.position()} Expected: ${keywords}    Actual: ${token.value}`);
    }
  } else if(keywords !== token.value) {
    throw new SyntaxError(`${this.position()} Expected: ${keywords}    Actual: ${token.value}`);
  }
  return token;
};

p.expectPunctuators = function expectPunctuators(punctuators) {
  this.log('expectPunctuators(' + punctuators + ') ');
  const token = this.consume();
  if(token.type !== tokenTypes.punctuator) {
    throw new SyntaxError(`${this.position()} Expecting Punctuator, but got ${token.type} with value: ${token.value}`);
  }
  if(Array.isArray(punctuators)) {
    if(punctuators.indexOf(token.value) < 0) {
      throw new SyntaxError(`${this.position()} Expected: ${punctuators}    Actual: ${token.value}`);
    }
  } else if(punctuators !== token.value) {
    throw new SyntaxError(this.position() + ' Expected: ' + punctuators + ' Actual: ' + token.VALUE);
  }
  return token;
};

p.expectLiteral = stackFunc('expectLiteral', function expectLiteral() {
  this.log('expectLiteral() ');
  const token = this.consume();
  if(!isLiteral(token)) {
    throw new SyntaxError(`${this.position()} Expecting Literal, but got ${token.type} with value: ${token.value}`);
  }
  this.log('New literal: ', token);
  return new estree.Literal(token.value);
});

p.matchKeywords = function matchKeywords(keywords) {
  const token = this.next();
  if(token.type !== tokenTypes.keyword) {
    return false;
  }
  if(Array.isArray(keywords)) {
    return keywords.indexOf(token.value) >= 0;
  } else {
    return keywords === token.value;
  }
};

p.matchPunctuators = function matchPunctuators(punctuators) {
  const token = this.next();
  //this.log('matchPunctuators(' +punctuators +') ');
  if(token.type !== tokenTypes.punctuator) {
    return false;
  }
  if(Array.isArray(punctuators)) {
    return punctuators.indexOf(token.value) >= 0;
  } else {
    return punctuators === token.value;
  }
};

p.matchIdentifier = function matchIdentifier(no_keyword = false) {
  const token = this.next();
  //this.log('matchIdentifier() ');
  return token.type === tokenTypes.identifier || (no_keyword && token.type === tokenTypes.keyword);
};

function isLiteral(token) {
  return token.type === tokenTypes.stringLiteral || token.type === tokenTypes.numericLiteral || token.type === tokenTypes.regexpLiteral || token.type === tokenTypes.nullLiteral || token.type === tokenTypes.booleanLiteral;
}

p.matchLiteral = function matchLiteral() {
  const token = this.next();
  this.log('matchLiteral() token=' + token.value);
  return isLiteral(token);
};

p.matchStatement = function() {
  return this.matchPunctuators(';') || this.matchKeywords(['if', 'var', 'let', 'const', 'with', 'while', 'do', 'for', 'continue', 'break', 'return', 'switch', 'import', 'export']) || this.matchAssignmentExpression();
};

p.matchPrimaryExpression = function matchPrimaryExpression() {
  return this.matchKeywords('this') || this.matchLiteral() || this.matchIdentifier() || this.matchPunctuators(['(', '[', '{', '<']);
};

p.matchUnaryExpression = function matchUnaryExpression() {
  return this.matchKeywords(['delete', 'void', 'typeof']) || this.matchPunctuators(['++', '--', '+', '-', '~', '!']);
};

p.matchAssignmentExpression = function matchAssignmentExpression() {
  return this.matchUnaryExpression() || this.matchLeftHandSideExpression() || this.matchFunctionExpression();
};

p.matchFunctionExpression = function matchFunctionExpression() {
  return this.matchKeywords('function') || this.matchKeywords('get');
};

p.matchMemberExpression = function() {
  return this.matchPrimaryExpression() || this.matchKeywords('new');
};

p.matchLeftHandSideExpression = p.matchMemberExpression;

/*
 * Actual recursive descent part of things
 */
p.parsePrimaryExpression = function parsePrimaryExpression() {
  if(this.matchKeywords('this')) {
    this.expectKeywords('this');
    return new estree.ThisExpression();
  } else if(this.matchPunctuators('<')) {
    return this.parseJSX();
  } else if(this.matchLiteral()) {
    return this.expectLiteral();
  } else if(this.matchIdentifier()) {
    return this.expectIdentifier();
  } else if(this.matchPunctuators('(')) {
    this.expectPunctuators('(');
    const expression = this.parseExpression();
    this.expectPunctuators(')');
    return expression;
  }
  return null;
};

p.parseArguments = function parseArguments() {
  const args = [];
  this.expectPunctuators('(');
  if(this.matchAssignmentExpression()) {
    args.push(this.parseAssignmentExpression());
    while(this.matchPunctuators(',')) {
      this.expectPunctuators(',');
      args.push(this.parseAssignmentExpression());
    }
  }
  this.expectPunctuators(')');
  return args;
};

p.parseRemainingMemberExpression = function parseRemainingMemberExpression(object) {
  while(this.matchPunctuators(['.', '['])) {
    //this.log('parseRemainingMemberExpression(', object, ')');
    if(this.matchPunctuators('.')) {
      this.expectPunctuators('.');
      const identifier = this.expectIdentifier(true);
      // this.log('parseRemainingMemberExpression2(', object.value, ') ', identifier.value);

      object = new estree.MemberExpression(object, identifier, false);

      this.log('parseRemainingMemberExpression2(', object.toString(), ')', Util.fnName(p.parseRemainingMemberExpression.caller));
    } else if(this.matchPunctuators('[')) {
      this.expectPunctuators('[');
      const expression = this.parseExpression(true);
      this.expectPunctuators(']');
      object = new estree.MemberExpression(object, expression, true);
    }
  }
  return object;
};

p.parseRemainingCallExpression = stackFunc('parseRemainingCallExpression', function parseRemainingCallExpression(object) {
  let args = this.parseArguments();
  object = new estree.CallExpression(object, args);
  while(this.matchPunctuators(['.', '[', '('])) {
    if(this.matchPunctuators('.')) {
      this.expectPunctuators('.');
      const identifier = this.expectIdentifier(true);
      object = new estree.MemberExpression(object, identifier, false);
    } else if(this.matchPunctuators('[')) {
      this.expectPunctuators('[');
      const expression = this.parseExpression();
      this.expectPunctuators(']');
      object = new estree.MemberExpression(object, expression, true);
    } else if(this.matchPunctuators('(')) {
      args = this.parseArguments();
      object = new estree.CallExpression(object, args);
    }
  }
  return object;
});

p.parseNewOrCallOrMemberExpression = function parseNewOrCallOrMemberExpression(couldBeNewExpression, couldBeCallExpression) {
  this.log('parseNewOrCallOrMemberExpression(', couldBeNewExpression, couldBeCallExpression, ')');
  let object = null;
  if(this.matchKeywords('new')) {
    this.expectKeywords('new');
    const result = this.parseNewOrCallOrMemberExpression(couldBeNewExpression, false);
    couldBeNewExpression = result.couldBeNewExpression;
    let args = [];
    if(!couldBeNewExpression || this.matchPunctuators('(')) {
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
  }
  //  this.log('Object:', object);
  object = this.parseRemainingMemberExpression(object);
  this.log('parseNewOrCallOrMemberExpression(', couldBeNewExpression, couldBeCallExpression, ') ' + Util.fnName(p.parseNewOrCallOrMemberExpression.caller));
  // If at the end of trying to parse MemberExpression we see Arguments
  // again, then that means this is a CallExpression instead.
  if(this.matchPunctuators('(') && couldBeCallExpression) {
    couldBeNewExpression = false;
    object = this.parseRemainingCallExpression(object);
  }
  return {
    object: object,
    couldBeNewExpression: couldBeNewExpression
  };
};

p.parseLeftHandSideExpression = stackFunc('parseLeftHandSideExpression', function parseLeftHandSideExpression() {
  this.log('parseLeftHandSideExpression() ' + Util.fnName(p.parseLeftHandSideExpression.caller));
  let object = this.parseNewOrCallOrMemberExpression(true, true).object;
  this.log('parseLeftHandSideExpression() ' + Util.fnName(p.parseLeftHandSideExpression.caller));
  return object;
});

p.parsePostfixExpression = stackFunc('parsePostfixExpression', function parsePostfixExpression() {
  this.log('parsePostfixExpression() ' + Util.fnName(p.parsePostfixExpression.caller));
  let lhs = true;
  let expression = this.parseLeftHandSideExpression();
  // TODO: Deny line terminator here
  if(this.matchPunctuators('++')) {
    lhs = false;
    this.expectPunctuators('++');
    expression = new estree.UpdateExpression('++', expression, false);
  } else if(this.matchPunctuators('--')) {
    lhs = false;
    this.expectPunctuators('--');
    expression = new estree.UpdateExpression('--', expression, false);
  }
  return {
    ast: expression,
    lhs: lhs
  };
});

p.parseUnaryExpression = stackFunc('parseUnaryExpression', function parseUnaryExpression() {
  this.log('parseUnaryExpression() ' + Util.fnName(p.parseUnaryExpression.caller));
  const unaryKeywords = ['delete', 'void', 'typeof'];
  const unaryPunctuators = ['++', '--', '+', '-', '~', '!'];
  if(this.matchKeywords(unaryKeywords)) {
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
    if(operatorToken.value === '++' || operatorToken.value === '--') {
      ast = new estree.UpdateExpression(operatorToken.value, argument.ast, true);
    } else {
      ast = new estree.UnaryExpression(operatorToken.value, argument.ast, true);
    }
    return {
      ast: ast,
      lhs: false
    };
  } else {
    return this.parsePostfixExpression();
  }
});

// Uses precedence climbing to deal with binary expressions, all of which have
// left-to-right associtivity in this case.
p.parseBinaryExpression = stackFunc('parseBinaryExpression', function parseBinaryExpression(minPrecedence) {
  this.log('parseBinaryExpression() ' + Util.fnName(p.parseBinaryExpression.caller));

  const punctuators = ['||', '&&', '|', '^', '&', '===', '==', '!==', '!=', '<', '>', '<=', '>=', '<<', '>>', '-->>', '+', '-', '*', '/', '%'];
  const result = this.parseUnaryExpression();
  let ast = result.ast;
  let lhs = result.lhs;
  this.matchPunctuators(punctuators);
  let tok = this.token;
  let value = tok.value;
  //  if(tok.value == 'instanceof')
  //  this.log('TOKEN: ', tok);
  while((this.matchKeywords('instanceof') || this.matchPunctuators(punctuators) || tok.value == 'instanceof') && operatorPrecedence[(tok = this.next()).value] >= minPrecedence) {
    //this.log('VALUE: ', value);
    // If any operator is encountered, then the result cannot be
    // LeftHandSideExpression anymore
    lhs = false;
    const precedenceLevel = operatorPrecedence[this.next().value];
    const operatorToken = value == 'instanceof' ? this.expectKeywords('instanceof') : this.expectPunctuators(punctuators);
    const right = this.parseBinaryExpression(precedenceLevel + 1);
    if(operatorToken.value === '||' || operatorToken.value === '&&') {
      ast = new estree.LogicalExpression(operatorToken.value, ast, right.ast);
    } else {
      ast = new estree.BinaryExpression(operatorToken.value, ast, right.ast);
    }
  }
  return {
    ast: ast,
    lhs: lhs
  };
});

p.parseConditionalExpression = function parseConditionalExpression() {
  this.log('parseConditionalExpression() ' + Util.fnName(p.parseConditionalExpression.caller));
  const result = this.parseBinaryExpression(0);
  let ast = result.ast;
  let lhs = result.lhs;
  if(this.matchPunctuators('?')) {
    this.expectPunctuators('?');
    const consequent = this.parseAssignmentExpression();
    //this.log('consequent: ', consequent);
    this.expectPunctuators(':');
    const alternate = this.parseAssignmentExpression();
    ast = new estree.ConditionalExpression(ast, consequent, alternate);
    lhs = false;
  }
  return {
    ast: ast,
    lhs: lhs
  };
};

p.parseAssignmentExpression = function parseAssignmentExpression() {
  this.log('parseAssignmentExpression() ' + Util.fnName(p.parseAssignmentExpression.caller));
  if(this.matchKeywords(['function', 'get'])) {
    let get = false;
    if(this.matchKeywords('get')) {
      this.expectKeywords('get');
      get = true;
    }
    return this.parseFunction();
  } else if(this.matchPunctuators('{')) {
    return this.parseObject();
  } else if(this.matchPunctuators('[')) {
    //     return this.parseNewOrCallOrMemberExpression();
    let object = this.parseArray();
    if(this.matchPunctuators('.')) {
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
    const assignmentOperators = ['=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '-->>=', '&=', '^=', '|='];
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
};

p.parseExpression = function parseExpression(optional) {
  this.log('parseExpression() ' + Util.fnName(p.parseExpression.caller));
  const expressions = [];
  let expression = this.parseAssignmentExpression();
  if(expression !== null) {
    expressions.push(expression);
  } else if(!optional) {
    const token = this.next();
    throw new SyntaxError(`${this.position()} Expecting AssignmentExpression, but got ${token.type} with value: ${token.value}`);
  }
  while(this.matchPunctuators(',')) {
    this.expectPunctuators(',');
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
};
p.parseBindingPattern = function parseBindingPattern() {
  let tok = this.expectPunctuators(['{', '[']);
  let props = [];

  while(true) {
    let property, element;
    property = element = this.expectIdentifier();
    if(this.matchPunctuators(':')) {
      this.expectPunctuators(':');
      element = this.expectIdentifier();
    }

    props.push(new estree.BindingProperty(property, element));

    if(this.expectPunctuators(['}', ']', ',']).value != ',') break;
  }

  return tok.value == '{' ? new estree.ObjectBinding(props) : new estree.ArrayBinding(props);
};

p.parseVariableDeclaration = function parseVariableDeclaration() {
  let identifier = null;

  this.log('parseVariableDeclaration() ' + Util.fnName(p.parseVariableDeclaration.caller));

  if(this.matchPunctuators(['{', '['])) identifier = this.parseBindingPattern();
  else identifier = this.expectIdentifier();

  let assignment = null;
  if(this.matchPunctuators('=')) {
    this.expectPunctuators('=');
    assignment = this.parseAssignmentExpression();
    if(assignment === null) {
      const token = this.next();
      throw new SyntaxError(`${this.position()} Expecting AssignmentExpression, but got ${token.type} with value: ${token.value}`);
    }
  }
  return {
    identifier: identifier,
    assignment: assignment
  };
};

p.parseVariableDeclarationList = stackFunc('parseVariableDeclarationList', function parseVariableDeclarationList(kind = 'var', exported = false) {
  this.log('parseVariableDeclarationList() ' + Util.fnName(p.parseVariableDeclarationList.caller));
  const declarations = []; // Destructuring not yet on by default in nodejs
  let declarator = this.parseVariableDeclaration();
  let identifier = declarator.identifier;
  let assignment = declarator.assignment;
  declarations.push(new estree.VariableDeclarator(identifier, assignment));
  while(this.matchPunctuators(',')) {
    this.expectPunctuators(',');
    declarator = this.parseVariableDeclaration();
    identifier = declarator.identifier;
    assignment = declarator.assignment;
    declarations.push(new estree.VariableDeclarator(identifier, assignment));
  }
  return new estree.VariableDeclaration(declarations, kind, exported);
});

p.parseBlock = stackFunc('parseBlock', function parseBlock(insideIteration, insideFunction) {
  this.log('parseBlock() ' + Util.fnName(p.parseBlock.caller));
  const statements = [];
  this.expectPunctuators('{');
  while(this.matchStatement()) {
    statements.push(this.parseStatement(insideIteration, insideFunction));
  }
  this.expectPunctuators('}');
  return new estree.BlockStatement(statements);
});

p.parseList = stackFunc('parseList', function parseList(insideIteration = false, insideFunction = false, check = p => false) {
  this.log('parseList() ' + Util.fnName(p.parseList.caller));
  const statements = [];
  while(this.matchStatement()) {
    statements.push(this.parseStatement(insideIteration, insideFunction));
    if(check(this)) break;
  }
  return new estree.StatementList(statements);
});

p.parseObject = function parseObject() {
  this.log('parseObject() ' + Util.fnName(p.parseObject.caller));
  let members = {};
  this.expectPunctuators('{');
  while(true) {
    let getter = false;
    let member = null;
    if(this.matchKeywords('get')) {
      this.expectKeywords('get');
      getter = true;
    } else if(this.matchIdentifier()) {
      member = this.expectIdentifier();
    }
    if(this.matchPunctuators(':')) {
      if(getter) {
        member = { value: 'get' };
        getter = false;
      }
    }
    if(this.matchPunctuators('(')) {
      members[member.value] = this.parseFunction();
    } else if(this.matchPunctuators(':')) {
      this.expectPunctuators(':');
      if(!this.matchAssignmentExpression()) break;
      members[member.value] = this.parseAssignmentExpression();
    }
    if(this.matchPunctuators(',')) this.expectPunctuators(',');
    else if(this.matchPunctuators('}')) break;
  }
  this.expectPunctuators('}');
  return new estree.ObjectLiteral(members);
};

p.parseArray = function parseArray() {
  this.log('parseArray() ' + Util.fnName(p.parseArray.caller));
  let members = [];
  let object;
  this.expectPunctuators('[');
  while(true) {
    if(this.matchPunctuators(']')) break;
    if(this.matchAssignmentExpression()) {
      members.push(this.parseAssignmentExpression());
    }
    if(this.matchPunctuators(',')) this.expectPunctuators(',');
  }
  this.expectPunctuators(']');
  object = new estree.ArrayLiteral(members);

  if(this.matchPunctuators('.')) {
    object = this.parseRemainingMemberExpression(object);
  }
  return object;
};

p.parseJSX = function parseJSX() {
  this.log('parseJSX() ' + Util.fnName(p.parseJSX.caller));
  let members = {};
  this.expectPunctuators('<');

  while(true) {
    let name = null;
    let value = null;
    let tag = null;
    let attrs = {};

    if(this.matchIdentifier()) {
      tag = this.expectIdentifier();
    }

    while(this.matchIdentifier()) {
      attr = this.expectIdentifier();

      if(this.matchPunctuation('=')) {
        this.expectPunctuation('=');
      }
    }

    this.expectPunctuation('>');
  }

  return new estree.JSXLiteral(tag, attrs);
};
p.parseVariableStatement = stackFunc('parseVariableStatement', function parseVariableStatement(exported = false) {
  this.log('parseVariableStatement() ' + Util.fnName(p.parseVariableStatement.caller));
  let keyw = this.expectKeywords(['var', 'let', 'const']);
  const ast = this.parseVariableDeclarationList(keyw.value, exported);
  this.matchPunctuators(';');
  this.expectPunctuators(';');
  return ast;
});

p.parseImportStatement = stackFunc('parseImportStatement', function parseImportStatement() {
  this.log('parseImportStatement()');
  this.expectKeywords('import');
  const identifiers = this.parseVariableDeclarationList();
  this.expectKeywords('from');
  const sourceFile = this.parseExpression();
  this.expectPunctuators(';');
  return new estree.ImportStatement(identifiers, sourceFile);
});

p.parseExportStatement = stackFunc('parseExportStatement', function() {
  this.log('parseExportStatement()');
  this.expectKeywords('export');
  if(this.matchKeywords('class')) {
    return this.parseClass(true);
  } else if(this.matchKeywords('function')) {
    return this.parseFunction(true);
  }
  return this.parseVariableStatement(true);
});

p.parseDecoratorStatement = stackFunc('parseDecoratorStatement', function() {
  this.log('parseDecoratorStatement()');
  let st = null;

  while(true) {
    this.expectPunctuators('@');
    let id = this;
    let call = this.parseNewOrCallOrMemberExpression(false, true);
    let identifier = this.expectIdentifier();

    st = this.parseRemainingCallExpression(identifier);

    break;
  }

  return st;
});

p.parseExpressionStatement = stackFunc('parseExpressionStatement', function parseExpressionStatement() {
  this.log('parseExpressionStatement() ' + Util.fnName(p.parseExpressionStatement.caller));

  const expression = this.parseExpression();
  if(this.matchPunctuators(';')) this.expectPunctuators(';');
  return new estree.ExpressionStatement(expression);
});

p.parseIfStatement = stackFunc('parseIfStatement', function(insideIteration, insideFunction) {
  this.expectKeywords('if');
  this.expectPunctuators('(');
  const test = this.parseExpression();
  this.expectPunctuators(')');
  const consequent = this.parseStatement(insideIteration, insideFunction);
  if(consequent === null) {
    throw new SyntaxError('Expecting statement for if-statement');
  }
  let alternate = null;
  if(this.matchKeywords('else')) {
    this.expectKeywords('else');
    alternate = this.parseStatement(insideIteration, insideFunction);
    if(alternate === null) {
      throw new SyntaxError('Expecting statement for else block in if-statement');
    }
  }
  return new estree.IfStatement(test, consequent, alternate);
});

p.parseWhileStatement = stackFunc('parseWhileStatement', function(insideFunction) {
  this.expectKeywords('while');
  this.expectPunctuators('(');
  const test = this.parseExpression();
  this.expectPunctuators(')');
  const statement = this.parseStatement(true, insideFunction);
  if(statement === null) {
    throw new SyntaxError('Expecting statement for while-statement');
  }
  return new estree.WhileStatement(test, statement);
});

p.parseDoStatement = stackFunc('parseDoStatement', function() {
  this.expectKeywords('do');
  const statement = this.parseStatement(true);
  if(statement === null) {
    throw new SyntaxError('Expecting statement for do-while-statement');
  }
  this.expectKeywords('while');
  this.expectPunctuators('(');
  const test = this.parseExpression();
  this.expectPunctuators(')');
  return new estree.DoStatement(test, statement);
});

p.parseForStatement = stackFunc('parseForStatement', function(insideFunction) {
  this.expectKeywords('for');
  this.expectPunctuators('(');
  let isForInStatement = false;
  let left = null;
  let right = null;
  let init = null;
  let test = null;
  let update = null;
  if(this.matchKeywords(['var', 'let', 'const'])) {
    // Can be either of the following forms:
    // for( var VariableDeclarationList ; Expression(opt) ; Expression(opt) ) Statement
    // for( var Identifier Initializer(opt) in Expression ) Statement
    let keyw = this.expectKeywords(['var', 'let', 'const']);
    const ast = this.parseVariableDeclarationList(keyw.value, false);
    if((keyw = this.matchKeywords(['in', 'of']))) {
      isForInStatement = true;
      left = ast;
      // Make sure the ast contains only one identifier and at most one initializer
      if(ast.declarations.length !== 1) {
        throw new SyntaxError(`${this.position()} Expecting only one Identifier and at most one Initializer in a ForIn statement`);
      }
      this.expectKeywords(['in', 'of']);
      right = this.parseExpression();
    } else {
      init = ast;
      this.expectPunctuators(';');
      test = this.parseExpression(true);
      this.expectPunctuators(';');
      update = this.parseExpression(true);
    }
  } else {
    // Can be either of the following forms:
    // for( Expression(opt) ; Expression(opt) ; Expression(opt) ) Statement
    // for( LeftHandSideExpression in Expression ) Statement
    init = left = this.parseExpression(true);
    if(this.matchPunctuators(';')) {
      this.expectPunctuators(';');
      test = this.parseExpression(true);
      this.expectPunctuators(';');
      update = this.parseExpression(true);
    } else {
      isForInStatement = true;
      this.expectKeywords('in');
      right = this.parseExpression();
    }
  }
  this.expectPunctuators(')');
  const statement = this.parseStatement(true, insideFunction);
  if(statement === null) {
    throw new SyntaxError('Expecting statement for for-statement');
  }
  if(isForInStatement) {
    return new estree.ForInStatement(left, right, statement);
  } else {
    return new estree.ForStatement(init, test, update, statement);
  }
});

p.parseIterationStatement = stackFunc('parseIterationStatement', function parseIterationStatement(insideFunction) {
  this.log('parseIterationStatement() ' + Util.fnName(p.parseIterationStatement.caller));
  if(this.matchKeywords('while')) {
    return this.parseWhileStatement(insideFunction);
  } else if(this.matchKeywords('do')) {
    return this.parseDoStatement(insideFunction);
  } else {
    return this.parseForStatement(insideFunction);
  }
});

p.parseSwitchStatement = stackFunc('parseSwitchStatement', function(insideFunction) {
  let kw, sv, cv, stmt;
  this.expectKeywords('switch');
  this.expectPunctuators('(');
  sv = this.parseExpression();
  this.expectPunctuators(')');
  this.expectPunctuators('{');
  while(true) {
    kw = this.expectKeywords(['case', 'default']);
    if(kw.value == 'default') cv = null;
    else cv = this.parseExpression();
    this.expectPunctuators(':');

    stmt = this.parseList(true, insideFunction, p => p.matchKeywords(['case', 'default']));

    if(this.matchPunctuators('}')) break;
  }
  this.expectPunctuators('}');
});

p.parseWithStatement = stackFunc('parseWithStatement', function(insideIteration, insideFunction) {
  this.expectKeywords('with');
  this.expectPunctuators('(');
  const test = this.parseExpression();
  this.expectPunctuators(')');
  const statement = this.parseStatement(insideIteration, insideFunction);
  if(statement === null) {
    throw new SyntaxError('Expecting statement for with-statement');
  }
  return new estree.WithStatement(test, statement);
});

p.parseContinueStatement = stackFunc('parseContinueStatement', function() {
  this.expectKeywords('continue');
  this.expectPunctuators(';');
  return new estree.ContinueStatement();
});

p.parseBreakStatement = stackFunc('parseBreakStatement', function() {
  this.expectKeywords('break');
  this.expectPunctuators(';');
  return new estree.BreakStatement();
});

p.parseReturnStatement = function parseReturnStatement() {
  this.log('parseReturnStatement() ' + Util.fnName(p.parseReturnStatement.caller));
  this.expectKeywords('return');
  let expression = null;
  if(this.matchAssignmentExpression()) {
    expression = this.parseAssignmentExpression();
  }
  this.expectPunctuators(';');
  return new estree.ReturnStatement(expression);
};

p.parseStatement = stackFunc('parseStatement', function parseStatement(insideIteration, insideFunction) {
  this.log('parseStatement() ' + Util.fnName(p.parseStatement.caller));
  // Parse Block
  if(this.matchPunctuators('{')) {
    return this.parseBlock(insideIteration, insideFunction);
  } else if(this.matchPunctuators('@')) {
    return this.parseDecorator();
  }
  // Parse Variable Statement
  else if(this.matchKeywords(['var', 'let', 'const'])) {
    return this.parseVariableStatement(exported);
  }
  // Parse import Statement
  else if(this.matchKeywords('import')) {
    return this.parseImportStatement();
  }
  // Parse Empty Statement
  else if(this.matchPunctuators(';')) {
    this.expectPunctuators(';');
    return new estree.EmptyStatement();
  }
  // Parse Expression Statement
  else if(this.matchAssignmentExpression()) {
    return this.parseExpressionStatement();
  }
  // Parse If Statement
  else if(this.matchKeywords('if')) {
    return this.parseIfStatement(insideIteration, insideFunction);
  }
  // Parse Iteration Statement
  else if(this.matchKeywords(['while', 'for', 'do'])) {
    return this.parseIterationStatement(insideFunction);
  }
  // Parse Switch Statement
  else if(this.matchKeywords('switch')) {
    return this.parseSwitchStatement(insideFunction);
  }
  // Parse With Statement
  else if(this.matchKeywords('with')) {
    return this.parseWithStatement(insideIteration, insideFunction);
  } else if(this.matchKeywords('continue')) {
    if(insideIteration) {
      return this.parseContinueStatement();
    } else {
      throw new SyntaxError(`${this.position()} continue; statement can only be inside an iteration`);
    }
  } else if(this.matchKeywords('break')) {
    if(insideIteration) {
      return this.parseBreakStatement();
    } else {
      throw new SyntaxError(`${this.position()} break; statement can only be inside an iteration`);
    }
  } else if(this.matchKeywords('return')) {
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
});

p.parseClass = stackFunc('parseClass', function(exported = false) {
  this.expectKeywords('class');
  f;
  // Parse name of the function
  const identifier = this.expectIdentifier();
  let extending = null;

  if(this.matchKeywords('extends')) {
    this.expectKeywords('extends');
    extending = this.expectIdentifier();
  }
  // Parse function body
  const body = this.parseBlock(false, false);

  this.expectPunctuators(';');

  return new estree.ClassDeclaration(identifier, extending, body, exported);
});

p.parseFunction = stackFunc('parseFunction', function(exported = false) {
  if(this.matchKeywords('function')) this.expectKeywords('function');
  // Parse name of the function
  let identifier = '';
  if(this.matchIdentifier(true)) {
    identifier = this.expectIdentifier(true);
  }
  let parameters = [];
  this.expectPunctuators('(');
  // Parse optional parameter list
  if(this.matchIdentifier()) {
    parameters.push(this.expectIdentifier());
    while(this.matchPunctuators(',')) {
      this.expectPunctuators(',');
      parameters.push(this.expectIdentifier());
    }
  }
  this.expectPunctuators(')');

  // Parse function body
  const body = this.parseBlock(false, true);

  let object = new estree.FunctionDeclaration(identifier, parameters, body, exported);

  if(this.matchPunctuators('(')) {
    return this.parseRemainingCallExpression(object);
  }

  return object;
});

p.parseSourceElement = stackFunc('parseSourceElement', function parseSourceElement() {
  //  let exported = false;
  //  if(this.matchKeywords('export')) {
  //    this.expectKeywords('export');
  //    exported = true;
  //  }
  let exported = false;

  if(this.matchKeywords('export')) {
    return this.parseExportStatement();
  } else if(this.matchKeywords('class')) {
    return this.parseClass(exported);
  } else if(this.matchKeywords('function')) {
    return this.parseFunction(exported);
  } else {
    return this.parseStatement(false, false, exported);
  }
});

p.parseProgram = function parseProgram() {
  const body = [];

  body.push(this.parseSourceElement());

  // Check to see if there are more SourceElement
  while(this.matchStatement() || this.matchKeywords('function')) {
    let sourceElement = this.parseSourceElement();

    console.log('Source element: ', sourceElement);
    body.push(sourceElement);
  }

  if(this.tokens.length >= 1 && this.tokens[0].type !== tokenTypes.eof) {
    throw new SyntaxError("Didn't consume all tokens: " + util.inspect(this.tokens[0]));
  }

  return new estree.Program(body);
};

Parser.parse = async function parse(sourceText, prefix) {
  const parser = new Parser(sourceText, prefix);
  function timeout(ms) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve('timeout done');
      }, ms);
    });
  }

  return new Promise((resolve, reject) => {
    timeout(1000).then(() => resolve('timeout'));

    resolve(parser.parseProgram());
  });
};

module.exports = Parser;
