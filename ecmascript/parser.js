import Util from '../util.js';
import Lexer, { SyntaxError, Position, Range } from './lexer.js';
import deep from '../deep.js';
//import util from 'util';
import { Token, TokenList } from './token.js';
import { Printer } from './printer.js';
import { estree, ESNode, Factory, PropertyDefinition, BinaryExpression, Identifier, TemplateLiteral, ImportStatement, Literal, MemberExpression, FunctionDeclaration, ArrowFunction, SequenceExpression, ObjectBindingPattern } from './estree.js';
import MultiMap from '../container/multiMap.js';

const add = (arr, ...items) => [...(arr || []), ...items];

export class Parser {
  lastPos = new Position(1, 1);
  lastTok = 0;
  nodeTokenMap = new WeakMap();

  static printToks = tokens => tokens.map(tok => (/(literal|identifier)/i.test(tok.type) && /^[^'"]/.test(tok.value) ? '‹' + tok.value + '›' : tok.value)).join(' ');
  static tokArray = tokens => tokens.map(tok => tok.value);

  constructor(sourceText, fileName) {
    this.tokens = [];
    this.processed = [];
    this.lexer = new Lexer(sourceText, fileName, this.handleComment);
    this.stack = [];
    this.prefix = fileName ? ` ${fileName}: ` : '';

    this.comments = [];
    this.factory = new Factory();
    var classes = this.factory.classes;
    var parser = this;
    this.estree = Util.propertyLookup(
      classes,
      key =>
        function(...args) {
          let node = /*new.target ||*/ classes[key](...args);

          parser.onNewNode(node);

          return node;
        }
    );

    //

    this.factory.callback = this.handleConstruct;

    //console.log("this.estree.Identifier", this.estree.Identifier);
    //  console.log("parser: ", this.parser);
    //console.log("lexer: ", this.lexer.fileName);
  }

  error(errorMessage, astNode) {
    const pos = this.lexer.position();

    return new SyntaxError('parse', pos.toString() + ': ' + errorMessage, astNode, pos);
  }

  handleComment = (comment, start, end) => {
    if(comment.startsWith('//')) comment += '\n';
    let token = new Token('comment', comment, new Range(start, comment.length), start.valueOf());
    // console.log('commentToken: ', util.inspect(token, { depth: 0, colors: true }));
    this.comments = add(this.comments, token);
  };

  handleConstruct = (ctor, args, instance) => {
    let assoc = ESNode.assoc(instance, {});
    let pos = assoc.position || this.position();
    let position;
    if(this.stack[0]) {
      assoc.position = this.stack[0].position;
      this.lastPos = this.stack[0].position;
    }
    // this.lastTok = this.processed.length;
    this.nodes = add(this.nodes, instance);
    let index = this.nodes.indexOf(instance);
  };

  onNewNode = node => {
    const range = [this.lastTok, this.processed.length];
    this.nodeTokenMap[node] = range;
  };

  onReturnNode = (node, stackEntry, stack) => {
    const { tokenIndex } = this.lexer;
    const { methodName } = stackEntry;
    const range = [stackEntry.start, stackEntry.end];
    let obj = ESNode.assoc(node, {});

    if(obj.object !== undefined) {
      do {
        if(obj.tokenRange && obj.tokenRange[0] < range[0]) range[0] = obj.tokenRange[0];
      } while((obj = obj.object));
    }
    Object.defineProperty(range, 'size', {
      get: function() {
        return this[1] - this[0];
      },
      enumerable: false,
      writeable: false
    });
    if(range[0] == range[1]) return;
    if(this.nodeTokenMap[node] === undefined) {
      this.nodeTokenMap[node] = range;
      this.lastTok = range[1];
    }
    let tokens = new TokenList([...this.processed, ...this.tokens].slice(...range));
    if(!tokens || tokens.length == 0 || tokens[0] === undefined) return;
    let last = Util.tail(tokens);
    let positions = [tokens[0].offset, last.end];
    let comments = [];
    //  let assoc = ESNode.assoc(node, { range: positions, tokenRange: range, tokens, comments });
    Object.assign(obj, { range: positions, tokenRange: range, tokens, comments });
  };

  addCommentsToNodes = root => {
    let nodes = new MultiMap();
    for(let [node, path] of deep.iterate(root, n => n instanceof ESNode)) {
      let { tokenRange, tokens, source } = node;
      let range = tokenRange;
      if(tokens) nodes.set(tokens[0].offset, node);
    }
    for(let key of nodes.keys()) {
      const node = nodes.get(key)[0];
      let assoc = ESNode.assoc(node);
      console.log('assoc:', assoc);
      while(this.comments.length > 0 && +key >= this.comments[0].offset) {
        assoc.comments = add(assoc.comments, this.comments.shift());
      }
      // if(node.comments) console.log('addCommentsToNodes', util.inspect(node, { depth: 2, colors: true }));
    }
  };

  tokensForNode = root => {
    let tokens = [];
    for(let [node, path] of deep.iterate(root, n => n instanceof ESNode)) {
      const token = this.nodeTokenMap[node];
      tokens.push({ token, path });
    }
    tokens.sort((a, b) => a.token[1] - b.token[1]);
    let range = [tokens[0], Util.tail(tokens)].map(range => range.token[1]);
    return [...this.processed, ...this.tokens].slice(...range);
  };

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
  }

  lookahead(offset = 0) {
    let token;
    while(this.tokens.length <= offset) {
      this.tokens.push(this.lexer.lex());
    }
    return this.tokens[offset];
  }

  consume() {
    if(this.tokens.length === 0) this.next();
    const token = this.tokens.shift();
    if(this.tokens.length == 0) this.next();

    this.processed.push(token);

    if(typeof Parser.onToken == 'function') Parser.onToken(token);

    return token;
    //parseRemainingMemberExpression2;
  }

  state = () => {
    var n = this.processed.length;
    var parser = this;
    return function() {
      parser.tokens.unshift(...parser.processed.splice(n, parser.processed.length));
    };
  };

  printtoks() {
    let token = this.token;
    let pos = token ? token.pos.toString() : '';
    let buf = '';

    if(token) {
      buf = this.lexer.source
        .substring(token.from, Math.min(token.to, token.from + 6))
        .replace(/\n/g, '\\n')
        .substring(0, 6);
    }
    if(token) return `"${buf}"${Util.pad(buf, 6)} ${pos}${Util.pad(pos, 10)}`;
    return '';
  }

  log() {
    return;
    const width = 72;
    let args = [...arguments].map(a => (typeof a === 'string' ? `"${a}"` : toStr(a)).replace(/[\n\r\t ]+/g, ''));
    let name = Util.abbreviate(Util.trim(args.join(''), '\'"'), width);
    let stack = Util.getCallerStack().map(st => st.getFunctionName());
    /*this.stack.map((name, i) => `${i}:${name}`).join(", ");*/

    const posstr = this.prefix + String(this.pos);
    //console.log.apply(console, [posstr + Util.pad(posstr, this.prefix.length + 8), name + Util.pad(name, width), this.printtoks(), "stack: " + stack.indexOf("parseProgram")]);
  }

  position(tok = null) {
    let obj = tok ? tok.pos : this.lexer;
    return this.lexer.position.call(obj || this);
  }
}

function getFn(name) {
  let fn;
  try {
    fn = eval(name);
  } catch(err) {}
  return fn;
}

function isLiteral({ type }) {
  return type === Token.types.stringLiteral || type === Token.types.numericLiteral || type === Token.types.regexpLiteral || type === Token.types.nullLiteral || type === Token.types.booleanLiteral || type === Token.types.templateLiteral;
}

function isTemplateLiteral({ type }) {
  return type === Token.types.templateLiteral;
}

function backTrace() {
  const stack = new Error().stack;
  const str = stack.toString().replace(/\n\s*at /g, '\n');
  let arr = str.split(/\n/g);

  arr = arr
    .map(line => {
      let matches = /^(.*)\s\((.*):([0-9]*):([0-9]*)\)$/.exec(line);
      if(matches && !/estree/.test(line)) {
        let name = matches[1].replace(/Parser\./, 'Parser.prototype.');
        let r = {
          name: name.replace(/.*\.prototype\./, ''),
          file: matches[2].replace(new RegExp('/.*lotto//'), ''),
          line: parseInt(matches[3]),
          column: parseInt(matches[4])
        };
        let fn = getFn(name);
        let caller = fn ? (fn ? Util.fnName(fn, Parser.prototype) : fn) : undefined;
        // this.log("name: '" +name+"'");
        if(typeof fn === 'function') {
          // this.log("fn: ", Util.fnName(fn, Parser.prototype, Parser));
          // this.log("fn: ", caller);
        }
        return r;
      }
      return null;
    })
    .filter(e => e != null)
    .map(e => ` ${e.file}:${e.line}:${e.column} ${e.name} `);

  //console.log("STACK: ", arr.join("\n"));

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
  return typeof a === 'object' ? JSON.toString(a).substring(0, 20) : String(a);
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
  instanceof: 6,
  in: 6,
  '<<': 7,
  '>>': 7,
  '>>>': 7,
  '-->>': 7,
  '+': 8,
  '-': 8,
  '*': 9,
  '/': 9,
  '%': 9
};

export class ECMAScriptParser extends Parser {
  /*
   * Helper Functions
   */

  expectIdentifier(no_keyword = false) {
    this.log(`expectIdentifier(no_keyword=${no_keyword})`);
    const token = this.consume();

    if(token.type != Token.types.nullLiteral)
      if(!(token.type === Token.types.identifier || (no_keyword && token.type == Token.types.keyword))) {
        throw this.error(`Expecting <Identifier> but got <${token.type}> with value '${token.value}'`);
      }
    this.log(`expectIdentifier2(no_keyword=${no_keyword})`);

    // backTrace(p.expectIdentifier);

    return new this.estree.Identifier(token.value);
  }

  expectKeywords(keywords) {
    this.log(`expectKeywords(${keywords}) `);
    const token = this.consume();
    if(token.type !== Token.types.keyword) {
      throw this.error(` Expecting Keyword(${keywords}), but got ${token.type} with value '${token.value}'`);
    }
    if(Array.isArray(keywords)) {
      if(keywords.indexOf(token.value) < 0) {
        throw this.error(`Expected: ${keywords.join(' ')}    Actual: ${token.value || token.type}`);
      }
    } else if(keywords !== token.value) {
      throw this.error(` Expected: ${keywords}    Actual: ${token.value || token.type}`);
    }
    return token;
  }

  expectPunctuators(punctuators, ast) {
    this.log(`expectPunctuators(${punctuators}) `);
    const token = this.consume();
    if(token.type !== Token.types.punctuator) {
      throw this.error(`Expecting Punctuator(${punctuators}), but got ${token.type} with value '${token.value}'`, ast);
    }
    if(Array.isArray(punctuators)) {
      if(punctuators.indexOf(token.value) < 0) {
        throw this.error(`Expected: ${punctuators.join(' ')}    Actual: ${token.value}`, ast);
      }
    } else if(punctuators !== token.value) {
      throw this.error(`Expected: ${punctuators} Actual: ${token.value}`, ast);
    }
    return token;
  }

  expectLiteral() {
    this.log('expectLiteral() ');
    let token = this.consume();
    if(!isLiteral(token)) {
      throw this.error(`Expecting Literal, but got ${token.type} with value '${token.value}'`);
    }
    // console.log("New literal: ", token);
    return new this.estree.Literal(token.value.replace(/\n/g, '\\n'));
  }

  parseTemplateLiteral() {
    let i = 0,
      token,
      part,
      parts = [];

    this.templateLevel = this.templateLevel || 0;
    this.templateLevel++;

    //    let punct = this.matchLiteral();

    while(true) {
      //console.log('token:', this.token.toString());

      if(!this.matchLiteral()) break;
      part = this.expectLiteral();

      /* if(i == 0)
        part.value = part.value.substring(1);*/
      //console.log('part:', part);

      parts.push(part);

      if((i > 0 || part.value.length > 1) && /*this.token.value.endsWith('`') ||*/ part.value.endsWith('`')) break;

      /*  if(this.matchPunctuators("${")) {
        this.expectPunctuators("${");
*/
      part = this.parseAssignmentExpression();
      parts.push(part);
      //console.log('assignment expression', part);

      //this.matchLiteral();
      // console.log('parseTemplateLiteral', this.token.toString());

      /* if(this.matchPunctuators("}"))*/ {
        const { lexer } = this;
        let { stateFn } = lexer;
        let { inSubst } = stateFn;

        this.lexer.stateFn = this.lexer.lexTemplate(true);
        this.lexer.stateFn.inSubst = false;

        let literal = (this.matchLiteral() ? this.expectLiteral() : this.expectPunctuators('}')).value;
        //console.log('parseTemplateLiteral', { inSubst, literal });

        //console.log('token:', this.token.toString());
      }
      i++;
    }
    this.templateLevel--;

    let node = new this.estree.TemplateLiteral(parts);
    //console.log('node:', node);
    return node;
  }

  matchKeywords(keywords) {
    const token = this.next();
    let ret;

    if(token.type !== Token.types.keyword) {
      ret = false;
    } else if(Array.isArray(keywords)) {
      ret = keywords.indexOf(token.value) >= 0;
    } else {
      ret = keywords === token.value;
    }
    //if(ret)
    this.log(`matchKeywords(${keywords}) = ${ret}`);
    return ret;
  }

  matchPunctuators(punctuators) {
    const token = this.next();
    // this.log('matchPunctuators(' +punctuators +') ');
    if(token.type !== Token.types.punctuator) {
      return false;
    }
    if(Array.isArray(punctuators)) {
      return punctuators.indexOf(token.value) >= 0;
    } else {
      return punctuators === token.value;
    }
  }

  matchIdentifier(no_keyword = false) {
    const token = this.next();
    // this.log('matchIdentifier() ');
    return token.type === Token.types.identifier || (no_keyword && token.type === Token.types.keyword);
  }

  matchLiteral() {
    const token = this.next();
    //console.log(`matchLiteral() token='${token.value}'`);
    return isLiteral(token);
  }
  matchTemplateLiteral() {
    if(this.templateLevel > 0) return false;
    const token = this.next();
    return isTemplateLiteral(token);
  }

  matchStatement() {
    return this.matchPunctuators(';') || this.matchKeywords(['if', 'var', 'let', 'const', 'with', 'while', 'do', 'for', 'continue', 'break', 'return', 'switch', 'import', 'export', 'try', 'throw', 'class', 'yield']) || this.matchAssignmentExpression();
  }

  matchPrimaryExpression() {
    return this.matchKeywords(['this', 'async', 'super']) || this.matchPunctuators(['(', '[', '{', '<', '...']) || this.matchLiteral() || this.matchIdentifier();
  }

  matchUnaryExpression() {
    return this.matchKeywords(['delete', 'void', 'typeof', 'await']) || this.matchPunctuators(['++', '--', '+', '-', '~', '!']);
  }

  matchAssignmentExpression() {
    return this.matchUnaryExpression() || this.matchLeftHandSideExpression() || this.matchFunctionExpression() || this.matchKeywords(['class']);
  }

  matchFunctionExpression() {
    const is_async = this.lookahead(0).value == 'async';
    const token = this.lookahead(is_async ? 1 : 0);
    return this.matchKeywords('function') || (token && token.value == 'get');
  }

  matchMemberExpression() {
    return this.matchPrimaryExpression() || this.matchKeywords('new') || this.matchKeywords('this');
  }

  matchLeftHandSideExpression() {
    return this.matchMemberExpression(...arguments);
  }
  /*
   * Actual recursive descent part of things
   */

  parsePrimaryExpression() {
    let is_async = false,
      rest_of = false;
    let expr = null;
    if(this.matchKeywords('async')) {
      is_async = true;
      this.expectKeywords('async');
    } else if(this.matchIdentifier() && this.token.value == 'async') {
      is_async = true;
      this.expectIdentifier();
    } else if(this.matchPunctuators('...')) {
      rest_of = true;
      this.expectPunctuators('...');
    }

    if(!is_async && this.matchKeywords('this')) {
      this.expectKeywords('this');
      expr = new estree.ThisExpression();
    } else if(this.matchKeywords('class')) {
      expr = this.parseClass();
    } else if(is_async && this.matchKeywords('function')) {
      expr = this.parseFunction(false, is_async);
    } else if(this.matchPunctuators('{')) {
      expr = this.parseObject();
    } else if(this.matchPunctuators('[')) {
      expr = this.parseArray();
    } else if(!is_async && this.matchPunctuators('<')) {
      expr = this.parseJSX();
    } else if(!is_async && this.matchLiteral()) {
      if(this.matchTemplateLiteral()) expr = this.parseTemplateLiteral();
      else expr = this.expectLiteral();
      /*   } else if(this.matchIdentifier("super") && this.token.value == "super") {
      this.expectIdentifier("super");
      expr = new estree.Identifier("super");*/
    } else if(this.matchKeywords('super')) {
      this.expectKeywords('super');
      expr = new estree.Identifier('super');
    } else if(this.matchIdentifier()) {
      let id = this.expectIdentifier();

      if(this.matchPunctuators('=>')) id = this.parseArrowFunction([id], is_async);

      expr = id;
    } else if(this.matchPunctuators('(')) {
      this.expectPunctuators('(');

      let expression = [];
      let parentheses = this.matchPunctuators('(');
      //console.log('expression:', { expression, parentheses, token: this.token.value });

      if(!this.matchPunctuators(')')) expression = this.parseExpression();
      this.expectPunctuators(')');

      if(this.matchPunctuators('=>')) expression = this.parseArrowFunction(expression, is_async);
      //else
      if(!(expression instanceof ArrowFunction) || parentheses) expression = new this.estree.SequenceExpression([expression]);

      expr = expression;
    }
    if(rest_of) {
      expr = new estree.RestOfExpression(expr);
    }
    return expr;
  }

  parseArguments() {
    const args = [];
    let rest_of = false;
    const checkRestOf = parser => {
      if(parser.matchPunctuators('...')) {
        parser.expectPunctuators('...');
        rest_of = true;
      }
    };
    this.expectPunctuators('(');
    while(true) {
      checkRestOf(this);
      if(!this.matchAssignmentExpression()) break;
      let arg = this.parseAssignmentExpression();
      if(rest_of) arg = new this.estree.RestOfExpression(arg);
      args.push(arg);
      //if(rest_of) break;
      if(this.matchPunctuators(',')) {
        this.expectPunctuators(',');
        continue;
      }
      break;
    }
    // console.log("this.processed:", this.processed);
    this.expectPunctuators(')', args);
    return args;
  }

  parseRemainingMemberExpression(object) {
    while(this.matchPunctuators(['.', '['])) {
      if(this.matchPunctuators('.')) {
        this.expectPunctuators('.');
        const identifier = this.expectIdentifier(true);

        /* console.log('object:', object);
        console.log('identifier:', identifier);*/

        if(object === null) throw this.error('Object ' + object);

        object = new this.estree.MemberExpression(object, identifier, false);

        //this.log('parseRemainingMemberExpression2(', object.toString(), ')', Util.fnName(this.parseRemainingMemberExpression));
      } else if(this.matchPunctuators('[')) {
        this.expectPunctuators('[');
        const expression = this.parseExpression(true);
        this.expectPunctuators(']');
        object = new this.estree.MemberExpression(object, expression, true);
      }
    }
    return object;
  }

  parseArrowFunction(args, is_async = false) {
    this.expectPunctuators('=>');
    let body;

    if(this.matchPunctuators('{')) body = this.parseBlock(false, true);
    else body = this.parseAssignmentExpression();

    //console.log("body:",body);
    //&', args);

    // parseArrow
    if(args instanceof SequenceExpression) args = args.expressions;

    if(!Util.isArray(args)) args = [args];

    args = args.map(arg => {
      if(arg instanceof ObjectBindingPattern) {
      }
      return arg;
    });

    return new this.estree.ArrowFunction(args, body, is_async);
  }

  parseRemainingCallExpression(object, is_async = false) {
    /* let args = this.parseArguments();

*/
    while(this.matchTemplateLiteral() || this.matchPunctuators(['.', '[', '('])) {
      if(this.matchPunctuators('.')) {
        this.expectPunctuators('.');
        const identifier = this.expectIdentifier(true);
        object = new this.estree.MemberExpression(object, identifier, false);
      } else if(this.matchPunctuators('[')) {
        this.expectPunctuators('[');
        const expression = this.parseExpression();
        this.expectPunctuators(']');
        object = new this.estree.MemberExpression(object, expression, true);
      } else if(this.matchPunctuators('(')) {
        let args = this.parseArguments();
        if(this.matchPunctuators('=>')) object = this.parseArrowFunction(args, is_async);
        else object = new this.estree.CallExpression(object, args);
      } else if(this.matchTemplateLiteral()) {
        //console.log("Template call", this.token);
        let arg = this.parseTemplateLiteral();

        //console.log("Template call", arg);
        object = new this.estree.CallExpression(object, [arg]);
      }
    }
    return object;
  }

  parseNewOrCallOrMemberExpression(couldBeNewExpression, couldBeCallExpression) {
    let do_await = false,
      is_async = false;
    if(this.matchKeywords('await')) {
      do_await = true;
      this.expectKeywords('await');
    }
    this.log(`parseNewOrCallOrMemberExpression(${couldBeNewExpression}, ${couldBeCallExpression})`);
    let object = null;
    if(!is_async && this.matchKeywords('new') && couldBeNewExpression) {
      this.expectKeywords('new');
      {
        if(this.matchPunctuators('.')) {
          object = new this.estree.Identifier('new');
        } else {
          const result = this.parseNewOrCallOrMemberExpression(true, false);
          console.log('result:', result);
          couldBeNewExpression = result.couldBeNewExpression;
          let args = [];
          if(!couldBeNewExpression || this.matchPunctuators('(')) {
            args = this.parseArguments();
            couldBeNewExpression = false;
          }
          object = new this.estree.NewExpression(result.object, args);
        }
      }
    } else {
      object = this.parsePrimaryExpression();
    }
    object = this.parseRemainingMemberExpression(object);
    let id = object;
    if((this.matchPunctuators('(') || this.matchTemplateLiteral()) && couldBeCallExpression) {
      couldBeNewExpression = false;
      object = this.parseRemainingCallExpression(object, is_async);
    }
    if(do_await) {
      object = new this.estree.AwaitExpression(object);
    }
    return { object, couldBeNewExpression };
  }

  parseLeftHandSideExpression() {
    this.log(`parseLeftHandSideExpression()`);
    let { object, couldBeNewExpression } = this.parseNewOrCallOrMemberExpression(true, true);

    return object;
  }

  parsePostfixExpression() {
    this.log(`parsePostfixExpression()`);
    let lhs = true;
    let expression = this.parseLeftHandSideExpression();

    // TODO: Deny line terminator here
    if(this.matchPunctuators(['++', '--'])) {
      lhs = false;
      let operator = this.expectPunctuators(['++', '--']);
      expression = new this.estree.UpdateExpression(operator.value, expression, false);
    }
    return { ast: expression, lhs };
  }

  parseUnaryExpression() {
    this.log(`parseUnaryExpression()`);
    const unaryKeywords = ['delete', 'void', 'typeof', 'await'];
    const unaryPunctuators = ['++', '--', '+', '-', '~', '!'];
    /*   if(this.matchKeywords('await')) {
      this.expectKeywords('await');
      const argument = this.parseAssignmentExpression();

      return new this.estree.AwaitExpression((argument.ast && argument.ast) || argument);
    } else*/ if(this.matchKeywords(unaryKeywords)) {
      const operatorToken = this.expectKeywords(unaryKeywords);
      const argument = this.parseUnaryExpression();
      return {
        ast: new this.estree.UnaryExpression(operatorToken.value, argument.ast, true),
        lhs: false
      };
    } else if(this.matchPunctuators(unaryPunctuators)) {
      const operatorToken = this.expectPunctuators(unaryPunctuators);
      const argument = this.parseUnaryExpression();
      let ast;
      /*if(operatorToken.value === "++" || operatorToken.value === "--") {
        ast = new this.estree.UpdateExpression(operatorToken.value, argument.ast, true);
      } else*/ {
        ast = new this.estree.UnaryExpression(operatorToken.value, argument.ast, true);
      }
      return { ast, lhs: false };
    } else {
      return this.parsePostfixExpression();
    }
  }

  // Uses precedence climbing to deal with binary expressions, all of which have
  // left-to-right associtivity in this case.
  parseBinaryExpression(minPrecedence) {
    this.log(`parseBinaryExpression()`);

    const punctuators = ['||', '&&', '|', '^', '&', '===', '==', '!==', '!=', '<', '>', '<=', '>=', '<<', '>>', '>>>', '-->>', '+', '-', '*', '/', '%'];
    const result = this.parseUnaryExpression();
    //console.log('binary:', result);

    if(result.ast == null) {
      if(!this.matchPunctuators('}')) return result;
      throw new Error(`${this.position()} ${this.token}`);
    }
    let { ast, lhs } = result;

    this.matchPunctuators(punctuators);

    let tok = this.token;
    let value = tok.value;
    //  if(tok.value == 'instanceof')
    //  this.log('TOKEN: ', tok);
    while((this.matchKeywords(['instanceof', 'in']) || this.matchPunctuators(punctuators) || ['instanceof', 'in'].includes(tok.value)) && operatorPrecedence[(tok = this.next()).value] >= minPrecedence) {
      // this.log('VALUE: ', value);
      // If any operator is encountered, then the result cannot be
      // LeftHandSideExpression anymore
      lhs = false;
      const precedenceLevel = operatorPrecedence[this.next().value];
      const operatorToken = ['instanceof', 'in'].includes(tok.value) ? this.expectKeywords(['instanceof', 'in']) : this.expectPunctuators(punctuators);

      const right = this.parseBinaryExpression(precedenceLevel + 1);

      //console.log(`parseBinaryExpression(${precedenceLevel})`, {operator: operatorToken.value, ast, right });

      if(right.ast == null) right.ast = this.parseFunction();

      if(right.ast == null) return { ast, lhs };

      if(operatorToken.value === '||' || operatorToken.value === '&&') {
        /*if(operatorToken.value === '||')
          console.log('LogicalExpression', {
            operator: operatorToken.value,
            right,
            ast,
            token: this.token.value
          });*/

        ast = new this.estree.LogicalExpression(operatorToken.value, ast, right.ast);
      } else {
        ast = new this.estree.BinaryExpression(operatorToken.value, ast, right.ast);
      }
    }
    return { ast, lhs };
  }

  parseConditionalExpression() {
    this.log(`parseConditionalExpression()`);
    let result = this.parseBinaryExpression(0);
    //console.log('parseConditionalExpression result:', result); //  if(result.ast == undefined) result = { ast: result, lhs: false };
    let ast = result.ast;
    let lhs = result.lhs;
    if(!ast) {
      console.log('ast lhs:', { result, token: this.token.value });
      //console.log("lhs:", Util.className(lhs));
      //console.log("line:", this.lexer.currentLine());
      throw new SyntaxError(`ConditionalExpression no ast`);
    }

    if(this.matchPunctuators('?')) {
      this.expectPunctuators('?');
      const consequent = this.parseAssignmentExpression();
      // this.log('consequent: ', consequent);
      this.expectPunctuators(':');
      const alternate = this.parseAssignmentExpression();
      ast = new this.estree.ConditionalExpression(ast, consequent, alternate);
      lhs = false;
    }
    return { ast, lhs };
  }

  parseAssignmentExpression() {
    this.log(`parseAssignmentExpression()`);

    if(this.matchKeywords(['function', 'get'])) {
      let get = false;
      if(this.matchKeywords('get')) {
        this.expectKeywords('get');
        get = true;
      }
      return this.parseFunction();
    } else if(this.matchPunctuators('{')) {
      return this.parseObject();
    } /*else if(this.matchPunctuators("[")) {
      //    return this.parseNewOrCallOrMemberExpression();
      let object = this.parseArray();
      if(this.matchPunctuators(".")) {
        object = this.parseRemainingMemberExpression(object);
      }
      if(this.matchPunctuators("(")) {
        object = this.parseRemainingCallExpression(object);
      }
      return object;
    }*/

    // Won't know immediately whether to parse as ConditionalExpression or
    // LeftHandSideExpression. We'll only know later on during parsing if we
    // come across things that cannot be in LeftHandSideExpression.
    const result = this.parseConditionalExpression();

    //console.log('parseAssignmentExpression:', { result, token: this.token.value });

    if(this.matchPunctuators('}')) {
      return result.ast;
      //throw new Error(`${this.position()}`);
    }

    if(result.lhs) {
      // Once it is determined that the parse result yielded
      // LeftHandSideExpression though, then we can parse the remaining
      // AssignmentExpression with that knowledge
      const assignmentOperators = ['=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '>>>=', '-->>=', '&=', '^=', '|='];
      if(this.matchPunctuators(assignmentOperators) || assignmentOperators.indexOf(this.token.value) != -1) {
        const left = result.ast;
        const operatorToken = this.expectPunctuators(assignmentOperators);
        const right = this.parseExpression();
        return new this.estree.AssignmentExpression(operatorToken.value, left, right);
      } else {
        //console.log('result.ast', result.ast, { token: this.token });
        return result.ast;
      }
    } else {
      return result.ast;
    }
  }

  parseExpression(optional) {
    //this.log(`parseExpression()`);

    const expressions = [];
    let expression = this.parseAssignmentExpression();

    //console.log('parseExpression', { expression });

    if(expression !== null) {
      expressions.push(expression);
    } else if(!optional) {
      const token = this.next();
      throw this.error(`Expecting AssignmentExpression, but got ${token.type} with value '${token.value}'`);
    }
    //console.log("expression: ", expression);

    while(this.matchPunctuators(',')) {
      this.expectPunctuators(',');
      expression = this.parseAssignmentExpression();
      if(expression !== null) {
        expressions.push(expression);
      } else if(!optional) {
        const token = this.next();
        throw this.error(`Expecting AssignmentExpression, but got ${token.type} with value '${token.value}'`);
      }
    }
    if(expressions.length > 1) {
      return new this.estree.SequenceExpression(expressions);
    } else if(expressions.length === 1) {
      return expressions[0];
    } else if(optional) {
      return null;
    } else {
      throw new Error(`Shouldn't ever be here`, this.position());
    }
  }

  parseBindingPattern() {
    let tok = this.expectPunctuators(['{', '[']);
    let is_array = tok.value == '[';
    let ctor = is_array ? this.estree.ArrayBindingPattern : this.estree.ObjectBindingPattern;
    let props = [];

    while(true) {
      let rest, property, element, initializer;
      rest = this.matchPunctuators('...');
      if(rest) this.expectPunctuators('...');

      if(!is_array && this.matchPunctuators('[')) {
        this.expectPunctuators('[');
        property = element = new this.estree.ComputedPropertyName(this.parseAssignmentExpression());

        this.expectPunctuators(']');
      } else {
        property = element = this.expectIdentifier();
      }

      if(rest) {
        props.push(new this.estree.RestOfExpression(property));
      } else {
        if(this.matchPunctuators(':')) {
          this.expectPunctuators(':');
          element = this.expectIdentifier();
        } else if(this.matchKeywords('as')) {
          this.expectKeywords('as');
          element = this.expectIdentifier();
        }

        if(this.matchPunctuators('=')) {
          this.expectPunctuators('=');
          initializer = this.parseAssignmentExpression();
        }

        props.push(new this.estree.BindingProperty(property, element, initializer));
      }

      //console.log("this.token", this.token);

      if(this.expectPunctuators(['}', ']', ',']).value != ',') break;
    }

    return new ctor(props);
  }

  /*
   * VariableDeclaration
   *    | BindingIdentifier[?Yield]Initializer[?In, ?Yield]opt
   *    | BindingPattern[?Yield]Initializer[?In, ?Yield]
   */
  parseVariableDeclaration() {
    let identifier = null;

    this.log(`parseVariableDeclaration()`);

    if(this.matchPunctuators(['{', '['])) identifier = this.parseBindingPattern();
    else identifier = this.expectIdentifier();

    let assignment = null;

    if(this.matchPunctuators('=')) {
      this.expectPunctuators('=');
      assignment = this.parseAssignmentExpression();
      if(assignment === null) {
        const token = this.next();
        throw this.error(`Expecting AssignmentExpression, but got ${token.type} with value '${token.value}'`);
      }
    }
    return { identifier, assignment };
  }

  parseVariableDeclarationList(kind = 'var', exported = false) {
    this.log(`parseVariableDeclarationList()`);
    const declarations = []; // Destructuring not yet on by default in nodejs
    let declarator = this.parseVariableDeclaration();
    let identifier = declarator.identifier;
    let assignment = declarator.assignment;
    declarations.push(new this.estree.VariableDeclarator(identifier, assignment));
    while(this.matchPunctuators(',')) {
      this.expectPunctuators(',');
      declarator = this.parseVariableDeclaration();
      identifier = declarator.identifier;
      assignment = declarator.assignment;
      declarations.push(new this.estree.VariableDeclarator(identifier, assignment));
    }
    let decl = new this.estree.VariableDeclaration(declarations, kind, exported);

    if(exported) {
      decl = new this.estree.ExportStatement(decl.id, decl);
    }

    return decl;
  }

  parseBlock(insideIteration, insideFunction) {
    this.log(`parseBlock()`);
    const statements = [];
    this.expectPunctuators('{');
    do {
      if(this.matchStatement()) {
        let stmt;

        stmt = this.parseStatement(insideIteration, insideFunction);
        statements.push(stmt);
      }
    } while(!this.matchPunctuators('}'));
    this.expectPunctuators('}');
    //console.log("statements:", statements);

    return new this.estree.BlockStatement(statements);
  }

  parseList(insideIteration = false, insideFunction = false, check = p => false) {
    this.log(`parseList()`);

    const statements = [];
    while(this.matchStatement()) {
      statements.push(this.parseStatement(insideIteration, insideFunction));
      if(check(this)) break;
    }
    return new this.estree.StatementList(statements);
  }

  parseObject(isClass = false, args = []) {
    // let ctor = this.estree.ObjectLiteral;
    let ctor = isClass ? this.estree.ClassDeclaration : this.estree.ObjectLiteral;

    //console.log('parseObject', ctor, isClass);

    this.log(`parseObject()`);
    let properties = [];
    this.expectPunctuators('{');

    while(!this.matchPunctuators('}')) {
      let flags = 0;
      let spread = false;
      let member = null,
        value = null;
      //let isGenerator = false;

      if(this.matchPunctuators('...')) {
        this.expectPunctuators('...');
        spread = true;
      }

      if(spread) {
        value = this.parseAssignmentExpression();

        value = new this.estree.SpreadElement(value);
        console.log('value:', value);

        properties.push(value);
      } else {
        if(isClass && this.matchKeywords('static')) {
          this.expectKeywords('static');
          flags |= PropertyDefinition.STATIC;
        }

        if(this.matchIdentifier() && this.token.value == 'get') {
          member = this.expectIdentifier();

          if(!this.matchPunctuators('(')) {
            member = null;
            flags |= PropertyDefinition.GETTER;
          }
        }

        if(this.matchPunctuators('*')) {
          this.expectPunctuators('*');
          if(this.matchPunctuators('[')) {
            this.expectPunctuators('[');
            member = new this.estree.ComputedPropertyName(this.parseAssignmentExpression());
            this.expectPunctuators(']');
          } else {
            member = this.expectIdentifier(true);
          }

          value = this.parseFunction();
          value.generator = true;
          //         member = value.id;
        }

        if(!member) {
          if(this.matchIdentifier(true)) {
            member = this.expectIdentifier(true);
          } else if(this.matchPunctuators('[')) {
            this.expectPunctuators('[');
            member = new this.estree.ComputedPropertyName(this.parseAssignmentExpression());
            this.expectPunctuators(']');
          } else if(this.matchPunctuators(':')) {
            if(flags & PropertyDefinition.GETTER) {
              member = new estree.Identifier('get');
              flags &= ~PropertyDefinition.GETTER;
            }
          } else if(this.matchLiteral()) {
            member = this.expectLiteral();
          }

          // console.log('member:', member);
        }

        if(this.matchPunctuators([',', '}'])) {
          value = member;
        } else if(this.matchPunctuators('(')) {
          value = this.parseFunction();
          /*        console.log("member:",member, getter);
        members[member.value] = fn;

        if(!fn.id) fn.id = member;
*/
          if(value.id) member = value.id;
        } else if(this.matchPunctuators('=')) {
          //console.log('parseObject =');
          this.expectPunctuators('=');
          value = this.parseAssignmentExpression();

          if(this.matchPunctuators(';')) this.expectPunctuators(';');

          if(!isClass) ctor = this.estree.ObjectBindingPattern;
        } else if(this.matchPunctuators(':')) {
          this.expectPunctuators(':');
          if(!this.matchAssignmentExpression()) break;
          value = this.parseAssignmentExpression();
          if(!isClass) ctor = this.estree.ObjectLiteral;
        } else if(typeof member == 'object' && member !== null && 'value' in member) {
          //       console.log("member:", member);
          // ctor = this.estree.ObjectBindingPattern;
        }
        //console.log('member:', util.inspect(member, { depth: 2, colors: true }));

        if(member == null) {
          console.log('Property:', { member, value, token: this.token });
          throw this.error(`No member ${token}`);
          throw new Error(`${this.position()}`);
        }
        /*
        if(value instanceof FunctionDeclaration && flags == 0) {
          if(member.value) value.id = member;
          member = value;
          value = null;
        }*/
        let memberCtor = this.estree.PropertyDefinition;

        if(ctor === this.estree.ObjectBindingPattern) memberCtor = this.estree.BindingProperty;
        else if(!(value instanceof FunctionDeclaration) && isClass) memberCtor = this.estree.MemberVariable;

        if(spread) member = new this.estree.SpreadElement(value);
        else if((value !== null && member.id === undefined) || flags) member = new memberCtor(member, value, flags);

        properties.push(member);
      }
      if(this.matchPunctuators('}')) break;

      if(this.matchPunctuators(',')) this.expectPunctuators(',');
    }

    this.expectPunctuators('}');

    if(ctor === this.estree.ObjectBindingPattern) {
      properties = Object.entries(properties).map(([key, value]) => new this.estree.BindingProperty(new this.estree.Identifier(key), value ? new this.estree.Identifier(value) : new this.estree.Identifier(key)));
    }
    let ret = new ctor(...[...args, properties]);
    //console.log('ret:', util.inspect(ret, { depth: 3, colors: true }));
    return ret;
  }

  parseArray() {
    this.log(`parseArray()`);
    let object,
      members = [];
    this.expectPunctuators('[');

    while(!this.matchPunctuators(']')) {
      let spread = false,
        element;

      if(this.matchPunctuators('...')) {
        this.expectPunctuators('...');
        spread = true;
      }

      // if(this.matchAssignmentExpression()) {
      element = this.parseAssignmentExpression();
      //}
      //console.log("array element:", element);

      if(spread) {
        element = new this.estree.SpreadElement(element);
      }

      members.push(element);

      if(this.matchPunctuators(',')) this.expectPunctuators(',');
    }
    this.expectPunctuators(']');
    object = new this.estree.ArrayLiteral(members);
    /*
    if(this.matchPunctuators(".")) {
      object = this.parseRemainingMemberExpression(object);
    }*/
    return object;
  }

  parseJSXTag() {
    let closed = false,
      selfClosing = false,
      name,
      value,
      tag,
      attrs = {},
      spread = null;
    this.lexer.noRegex = true;

    this.expectPunctuators('<');

    if(this.matchPunctuators('/')) {
      this.expectPunctuators('/');
      closed = true;
    }
    if(this.matchIdentifier()) {
      tag = this.expectIdentifier();
      //console.log('tag:', tag);

      if(this.matchPunctuators(['.', '['])) tag = this.parseRemainingMemberExpression(tag);
      //  console.log('token:', this.token);
    }
    for(;;) {
      if(this.matchPunctuators('{')) {
        this.expectPunctuators('{');
        this.expectPunctuators('...');

        spread = this.parseAssignmentExpression();

        this.expectPunctuators('}');
        continue;
      } else if(this.matchIdentifier()) name = this.expectIdentifier().value;
      else break;

      if(this.matchPunctuators('=')) {
        this.expectPunctuators('=');
        if(this.matchPunctuators('{')) {
          this.expectPunctuators('{');
          value = this.parseExpression();
          this.expectPunctuators('}');
        } else {
          value = this.expectLiteral();
        }
      } else {
        value = new this.estree.Literal(true);
      }
      attrs[name] = value;
    }
    if(this.matchPunctuators('/')) {
      this.expectPunctuators('/');
      selfClosing = true;
    }
    this.expectPunctuators('>');
    this.lexer.noRegex = false;

    let attributeStr = Object.entries(attrs)
      .map(([name, value]) => ` ${name}="${value.value}"`)
      .join('')
      .substring(0, 100);

    //console.log(`JSX <${closed ? "/" : ""}${tag.value}${attributeStr}... ${selfClosing ? "/" : ""}>`);

    return new this.estree.JSXLiteral(tag.value, attrs, closed, selfClosing, spread);
  }

  parseJSX(depth = 0) {
    let tok2, tok3;
    this.log(`parseJSX(${depth})`);
    let members = [];
    for(;;) {
      this.lexer.noRegex = true;
      if(!this.matchPunctuators('<')) break;
      tok2 = this.lookahead(1);
      if(tok2.value == '/') break;
      let tag = this.parseJSXTag();
      members.push(tag);
      let jsx = members[members.length - 1];
      jsx.children = [];
      if(jsx.selfClosing && depth == 0) break;
      if(this.matchPunctuators('{')) {
        this.expectPunctuators('{');
        let obj;
        if(this.matchLiteral()) obj = this.expectLiteral();
        else obj = this.parseAssignmentExpression();
        console.log('obj', obj);
        jsx.children.push(obj);
        this.expectPunctuators('}');
      }
      if(!tag.closing && !tag.selfClosing) {
        let toks = [];
        while(!this.matchPunctuators('<')) {
          let tok = this.consume();
          toks.push(tok.value);
          console.log('tok:', tok);
        }
        let text = toks.join(' ');
        if(text != '') jsx.children.push(new this.estree.Literal(text));
      }
      if(jsx.selfClosing) continue;
      this.lexer.noRegex = true;

      if(this.matchPunctuators('<')) {
        tok2 = this.lookahead(1);
        if(tok2.value != '/' && !jsx.closing && !jsx.selfClosing) {
          jsx.children = jsx.children.concat(this.parseJSX(depth + 1));
        }
      }

      if(this.matchPunctuators('<')) {
        tok2 = this.lookahead(1);
        tok3 = this.lookahead(2);
        if(tok2.value == '/' && tok3.value == tag.tag) {
          this.tokens = [];
          this.expectPunctuators('>');
          console.log('end tok:', { depth });
          depth--;
          //           break;
        }
      }
    }
    if(depth == 0) {
      this.lexer.noRegex = false;
      return members[0];
    }
    return members;
  }

  parseVariableStatement(exported = false) {
    this.log(`parseVariableStatement()`);
    let keyw = this.expectKeywords(['var', 'let', 'const']);
    const ast = this.parseVariableDeclarationList(keyw.value, exported);
    if(this.matchPunctuators(';')) this.expectPunctuators(';');
    //console.log("ast:",ast);
    return ast;
  }

  parseImportStatement() {
    this.log('parseImportStatement()');
    this.expectKeywords('import');
    const identifiers = this.parseVariableDeclarationList('');
    this.expectKeywords('from');
    const sourceFile = this.parseExpression();
    this.expectPunctuators(';');
    return new this.estree.ImportStatement(identifiers, sourceFile);
  }

  parseExportStatement() {
    let stmt;
    this.log('parseExportStatement()');
    if(this.matchKeywords('export')) this.expectKeywords('export');

    if(this.matchKeywords('default')) {
      this.expectKeywords('default');
      stmt = this.parseAssignmentExpression();
      //console.log("default export:", stmt);

      stmt = new this.estree.ExportStatement('default', stmt);
    } else if(this.matchKeywords('class')) {
      stmt = this.parseClass(true);
    } else if(this.matchKeywords('function')) {
      stmt = this.parseFunction(true);
    } else if(this.matchKeywords(['var', 'let', 'const'])) {
      stmt = this.parseVariableStatement();
    } else if(this.matchIdentifier(true)) {
      const id = this.expectIdentifier();

      stmt = new this.estree.ExportStatement(id, this.parseAssignmentExpression());
    } else if(this.matchPunctuators('{')) {
      // this.expectPunctuators('{');
      let bindingPattern = this.parseBindingPattern();

      if(this.matchKeywords('from')) {
        this.expectKeywords('from');
        console.log('export from!');

        stmt = new this.estree.ImportStatement(bindingPattern, this.expectLiteral(), true);
      } else {
        stmt = new this.estree.ExportStatement(null, bindingPattern);
      }

      //  this.expectPunctuators('}');
    }

    if(this.matchPunctuators(';')) this.expectPunctuators(';');

    //console.log('parseExportStatement', { stmt, token: this.token.value });

    return stmt;
    //    return this.parseVariableStatement(true);
  }

  parseDecoratorStatement() {
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
  }

  parseExpressionStatement() {
    this.log(`parseExpressionStatement()`);

    const expression = this.parseExpression();

    if(this.matchPunctuators(';')) this.expectPunctuators(';');
    return /*new this.estree.ExpressionStatement*/ expression;
  }

  parseIfStatement(insideIteration, insideFunction) {
    this.expectKeywords('if');
    this.expectPunctuators('(');
    const test = this.parseExpression();
    this.expectPunctuators(')');
    const consequent = this.parseStatement(insideIteration, insideFunction);
    if(consequent === null) {
      throw this.error('Expecting statement for if-statement', this.position());
    }
    let alternate = null;
    if(this.matchKeywords('else')) {
      this.expectKeywords('else');
      alternate = this.parseStatement(insideIteration, insideFunction);
      if(alternate === null) {
        throw this.error('Expecting statement for else block in if-statement');
      }
    }
    return new this.estree.IfStatement(test, consequent, alternate);
  }

  parseWhileStatement(insideFunction) {
    this.expectKeywords('while');
    this.expectPunctuators('(');
    const test = this.parseExpression();
    this.expectPunctuators(')');
    const statement = this.parseStatement(true, insideFunction);
    if(statement === null) {
      throw this.error('Expecting statement for while-statement', this.position());
    }
    return new this.estree.WhileStatement(test, statement);
  }

  parseDoStatement(insideFunction) {
    this.expectKeywords('do');
    const statement = this.parseStatement(true, insideFunction, false);
    if(statement === null) {
      throw this.error('Expecting statement for do-while-statement', this.position());
    }
    this.expectKeywords('while');
    this.expectPunctuators('(');
    const test = this.parseExpression();
    this.expectPunctuators(')');
    return new this.estree.DoStatement(test, statement);
  }

  parseForStatement(insideFunction) {
    this.expectKeywords('for');
    this.expectPunctuators('(');
    let isForInStatement = false;
    let operator = null;
    let left = null;
    let right = null;
    let init = null;
    let test = null;
    let update = null;
    if(this.matchKeywords(['var', 'let', 'const'])) {
      // Can be either of the following forms:
      // for( var VariableDeclarationList ; Expression(opt) ; Expression(opt) )
      // Statement for( var Identifier Initializer(opt) in Expression ) Statement
      let keyw = this.expectKeywords(['var', 'let', 'const']);
      const ast = this.parseVariableDeclarationList(keyw.value, false);
      if((keyw = this.matchKeywords(['in', 'of']))) {
        isForInStatement = true;
        left = ast;
        // Make sure the ast contains only one identifier and at most one
        // initializer
        if(ast.declarations.length !== 1) {
          throw this.error(`Expecting only one Identifier and at most one Initializer in a ForIn statement`);
        }
        operator = this.expectKeywords(['in', 'of']).value;
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
      init = left = this.matchPunctuators(';') ? null : this.parseExpression(true);

      if(this.matchPunctuators(';')) {
        this.expectPunctuators(';');
        test = this.matchPunctuators(';') ? null : this.parseExpression(true);
        this.expectPunctuators(';');
        update = this.matchPunctuators(')') ? null : this.parseExpression(true);
      } else {
        isForInStatement = true;

        if(left instanceof BinaryExpression && left.operator == 'in') {
          right = left.right;
          left = left.left;
          operator = left.operator;
        } else {
          operator = this.expectKeywords(['in', 'of']).value;
          right = this.parseExpression();
        }
      }
    }
    this.expectPunctuators(')');
    const statement = this.parseStatement(true, insideFunction);
    if(statement === null) {
      throw this.error('Expecting statement for for-statement', this.position());
    }
    //   console.log("for..in operator:", operator);

    if(isForInStatement) return new this.estree.ForInStatement(left, right, statement, operator);
    else return new this.estree.ForStatement(init, test, update, statement);
  }

  parseIterationStatement(insideFunction) {
    this.log(`parseIterationStatement()`);
    if(this.matchKeywords('while')) {
      return this.parseWhileStatement(insideFunction);
    } else if(this.matchKeywords('do')) {
      return this.parseDoStatement(insideFunction);
    } else {
      return this.parseForStatement(insideFunction);
    }
  }

  parseSwitchStatement(insideFunction) {
    let kw, sv, cv, stmt;
    this.expectKeywords('switch');
    this.expectPunctuators('(');
    sv = this.parseExpression();
    this.expectPunctuators(')');
    this.expectPunctuators('{');
    let cases = [];
    while(true) {
      kw = this.expectKeywords(['case', 'default']);
      cv = kw.value == 'default' ? null : this.parseExpression();
      this.expectPunctuators(':');

      stmt = this.parseList(true, insideFunction, p => p.matchKeywords(['case', 'default']));

      cases.push(new this.estree.CaseClause(cv, stmt));

      if(this.matchPunctuators('}')) break;
    }
    this.expectPunctuators('}');
    return new this.estree.SwitchStatement(sv, cases);
  }

  parseTryStatement(insideIteration, insideFunction) {
    let body,
      parameters = [],
      catch_block,
      finally_block;
    this.expectKeywords('try');
    //this.expectPunctuators("{");
    body = this.parseBlock(insideIteration, insideFunction);

    if(this.matchKeywords('catch')) {
      this.expectKeywords('catch');
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
      catch_block = this.parseStatement(insideIteration, insideFunction);
    }
    if(this.matchKeywords('finally')) {
      this.expectKeywords('finally');

      finally_block = this.parseStatement(insideIteration, insideFunction);
    }

    let object = new this.estree.TryStatement(body, parameters, catch_block, finally_block);

    if(this.matchPunctuators('(')) {
      return this.parseRemainingCallExpression(object);
    }

    return object;
  }

  parseWithStatement(insideIteration, insideFunction) {
    this.expectKeywords('with');
    this.expectPunctuators('(');
    const test = this.parseExpression();
    this.expectPunctuators(')');
    const statement = this.parseStatement(insideIteration, insideFunction);
    if(statement === null) {
      throw this.error('Expecting statement for with-statement', this.position());
    }
    return new this.estree.WithStatement(test, statement);
  }

  parseThrowStatement() {
    this.expectKeywords('throw');
    const expression = this.parseExpression();
    return new this.estree.ThrowStatement(expression);
  }
  parseYieldStatement() {
    let yield_generator = false;

    this.expectKeywords('yield');

    if(this.matchPunctuators('*')) {
      this.expectPunctuators('*');
      yield_generator = true;
    }

    const expression = this.parseExpression();
    return new this.estree.YieldStatement(expression, yield_generator);
  }

  parseContinueStatement() {
    this.expectKeywords('continue');
    this.expectPunctuators(';');
    return new this.estree.ContinueStatement();
  }

  parseBreakStatement() {
    this.expectKeywords('break');
    this.expectPunctuators(';');
    return new this.estree.BreakStatement();
  }

  parseReturnStatement() {
    this.log(`parseReturnStatement()`);
    this.expectKeywords('return');
    let expression = null;

    if(!this.matchPunctuators(';')) expression = this.parseAssignmentExpression();

    this.expectPunctuators(';');
    return new this.estree.ReturnStatement(expression);
  }

  parseStatement(insideIteration, insideFunction, exported) {
    this.log(`parseStatement()`, Util.inspect(this.token));
    // Parse Block
    let t = this.token || this.lexer.tokens[this.lexer.tokenIndex];
    let defaultExport = false;

    if(exported) {
      if(this.matchKeywords('default')) defaultExport = this.expectKeywords('default');
    }

    if(this.matchPunctuators('{')) {
      return this.parseBlock(insideIteration, insideFunction);
    } else if(this.matchPunctuators('@')) {
      return this.parseDecorator();

      // Parse constructor() super[.method](calls)
      /* } else if(insideFunction && (this.matchKeywords("super") || this.matchIdentifier("super"))) {
      return this.parseNewOrCallOrMemberExpression(false, true);
*/
      // Parse Variable Statement
    } else if(this.matchKeywords(['var', 'let', 'const'])) {
      let stmt = this.parseVariableStatement();

      if(exported) {
        stmt = new estree.ExportStatement(defaultExport || stmt.id, stmt);
      }
      return stmt;
    } else if(this.matchKeywords('import')) {
      //   this.log(`parseStatement()`, Util.inspect(this.token));
      return this.parseImportStatement();
      // Parse Empty Statement
    } else if(this.matchKeywords('class')) {
      return this.parseClass();
    } else if(this.matchPunctuators(';')) {
      this.expectPunctuators(';');
      return new this.estree.EmptyStatement();
    }

    // Parse If Statement
    else if(this.matchKeywords('if')) {
      return this.parseIfStatement(insideIteration, insideFunction);

      // Parse Iteration Statement
    } else if(this.matchKeywords(['while', 'for', 'do'])) {
      return this.parseIterationStatement(insideFunction);

      // Parse Switch Statement
    } else if(this.matchKeywords('switch')) {
      return this.parseSwitchStatement(insideFunction);
    } else if(this.matchKeywords('try')) {
      return this.parseTryStatement(insideIteration, insideFunction);

      // Parse With Statement
    } else if(this.matchKeywords('throw')) {
      return this.parseThrowStatement();
    } else if(this.matchKeywords('yield')) {
      return this.parseYieldStatement();
    } else if(this.matchKeywords('with')) {
      return this.parseWithStatement(insideIteration, insideFunction);
    } else if(this.matchKeywords('continue')) {
      if(insideIteration) {
        return this.parseContinueStatement();
      } else {
        throw this.error(`continue; statement can only be inside an iteration`);
      }
    } else if(this.matchKeywords('break')) {
      if(insideIteration) {
        return this.parseBreakStatement();
      } else {
        throw this.error(`break; statement can only be inside an iteration`, this.position());
      }
    } else if(this.matchKeywords('return')) {
      if(insideFunction) {
        return this.parseReturnStatement();
      } else {
        throw this.error(`return statement can only be inside a function`, this.position());
      }
    } /*if(this.matchAssignmentExpression())*/ // Parse Expression Statement
    else {
      let stmt = this.parseExpressionStatement();

      if(defaultExport) {
        stmt = new estree.ExportStatement('default', stmt);
      }
      return stmt;
    }
    /* else {
      const { column, line } = this.lexer;
      const tok = t; // this.token;
      let m = this.matchKeywords('super');
      const { type, value } = tok; //lexer.tokens[0];
      throw this.error(`Unexpected ${type}-token "${value}" ${m} `, this.position());
    }*/
  }

  parseClass(exported = false) {
    this.expectKeywords('class');
    // Parse name of the function
    let identifier = null;
    let extending = null;

    if(this.matchIdentifier()) identifier = this.expectIdentifier();

    if(this.matchKeywords('extends')) {
      this.expectKeywords('extends');
      extending = this.expectIdentifier();
    }

    // Parse function body
    let decl = this.parseObject(true, [identifier, extending]);

    //console.log("parseClass decl=", decl);
    if(this.matchPunctuators(';')) this.expectPunctuators(';');
    // let decl = new this.estree.ClassDeclaration(identifier, extending, members);

    if(exported) decl = new this.estree.ExportStatement(decl.id, decl);

    return decl;
  }

  parseParameters() {
    const params = [];
    let rest_of = false,
      parens = false;
    const checkRestOf = (parser, match) => {
      if(parser.matchPunctuators('...')) {
        parser.expectPunctuators('...');
        rest_of = true;
      }
      parser.matchIdentifier(true);
      return parser.matchAssignmentExpression();
    };
    if(this.matchPunctuators('(')) {
      this.expectPunctuators('(');
      parens = true;
    }
    while(checkRestOf(this)) {
      let param;
      if(this.matchPunctuators(['{', '['])) {
        param = this.parseBindingPattern();
      } else {
        param = this.parseAssignmentExpression();
      }
      if(rest_of) param = new this.estree.RestOfExpression(param);
      params.push(param);
      if(rest_of) break;
      if(rest_of || !this.matchPunctuators(',')) break;
      this.expectPunctuators(',');
    }
    if(parens) this.expectPunctuators(')', params);
    return params;
  }

  parseFunction(exported = false, isAsync = false) {
    let isGenerator = false;
    if(this.matchKeywords('function')) this.expectKeywords('function');

    if(this.matchPunctuators('*')) {
      this.expectPunctuators('*');
      isGenerator = true;
    }

    if(this.matchKeywords('async')) {
      this.expectKeywords('async');
      isAsync = true;
    }

    // Parse name of the function
    let identifier = null;
    if(this.matchIdentifier(true)) {
      identifier = this.expectIdentifier(true);
    }
    let parameters = this.parseParameters();
    /*
    this.expectPunctuators("(");

    // Parse optional parameter list
    while(//this.matchPunctuators(["{", "["]) ||
     this.matchIdentifier()) {
      let param, defaultValue;

      //  param = this.parseVariableDeclaration();

      if(this.matchPunctuators(["{", "["])) {
        param = this.parseArguments();
      } else if(this.matchIdentifier(true)) {
        param = this.expectIdentifier();

        if(this.matchPunctuators("=")) {
          //  this.expectPunctuators("=");

          defaultValue = this.parseAssignmentExpression();

          param = new this.estree.AssignmentExpression("=", param, defaultValue);
        }
      } else {
        break;
      }

      parameters.push(param);

      if(this.matchPunctuators(",")) this.expectPunctuators(",");
    }

    this.matchPunctuators(")");
    this.expectPunctuators(")");
*/
    // Parse function body
    const body = this.parseBlock(false, true, identifier);

    let object = new this.estree.FunctionDeclaration(identifier, parameters, body, false, isAsync, isGenerator);

    if(this.matchPunctuators('(')) {
      return this.parseRemainingCallExpression(object);
    }

    if(exported) {
      object = new this.estree.ExportStatement(object.id, object);
    }

    return object;
  }

  parseSourceElement() {
    let exported = false;
    if(this.matchKeywords('export')) {
      /*      this.expectKeywords('export');
      exported = true;

      if(this.matchKeywords('default')) */ return this.parseExportStatement();
    } else if(this.matchKeywords('class')) {
      return this.parseClass(exported);
    } else if(this.matchKeywords('function')) {
      return this.parseFunction(exported);
    } else {
      return this.parseStatement(false, false, exported);
    }
  }

  parseProgram() {
    const body = [];

    body.push(this.parseSourceElement());

    // Check to see if there are more SourceElement
    while(this.matchStatement() || this.matchKeywords('function')) {
      let sourceElement = this.parseSourceElement();

      //console.log("Source element: ", sourceElement);
      body.push(sourceElement);
    }

    if(this.tokens.length >= 1 && this.tokens[0].type !== Token.types.eof) {
      throw this.error(`Didn't consume all tokens: ${Util.inspect(this.tokens[0])}`);
    }

    return new this.estree.Program(body);
  }
}

var depth = 0;
var newNodes = [];
var nodes = [];
var diff = [];
var fns = [];
//var stack = [{methodName: 'parse', tokens:[]}];

const methodNames = [...Util.getMethodNames(ECMAScriptParser.prototype)];
var methods = {};

const quoteArray = arr => (arr.length < 5 ? `[${arr.join(', ')}]` : `[${arr.length}]`);

const quoteList = (l, delim = ' ') => '' + l.map(t => (typeof t == 'string' ? `'${t}'` : '' + t)).join(delim) + '';
const quoteToks = l => quoteList(l.map(t => t.value));
const quoteObj = i => (i instanceof Array ? quoteArg(i) : Util.className(i) == 'Object' ? Object.keys(i) : typeof i == 'object' ? Util.className(i) : `'${i}'`);

const quoteArg = a => a.map(i => (Util.isObject(i) && i.value !== undefined ? i.value : quoteObj(i)));
const quoteStr = s => s.replace(/\n/g, '\\n');

Parser.prototype.trace = function() {
  return this.stack.map(frame => `${(frame.tokenIndex + '').padStart(5)} ${frame.position.toString().padStart(6)} ${(frame.methodName + '(' + quoteList(frame.args || [], ',') + ')').padEnd(50)} ${(frame.tokens || []).join(' ')}`).join('\n');
};

Parser.prototype.onToken = function(tok) {
  let i = 0;
  while(i < this.stack.length && !/parse/.test(this.stack[i].methodName)) i++;
  let frame = this.stack[0];
  let str = tok.value.trim();
  //console.log(`${frame.methodName} consumed '${str}'`);
  this.stack[i].tokens.push(str);
};

const instrumentate = (methodName, fn = methods[methodName]) => {
  const { loc } = Factory;

  const printer = new Printer();

  var esfactory = function(...args) {
    let { lexer, stack } = this;
    let { tokenIndex } = lexer;

    // console.log("esfactory instrumentate tokens.length=",this.tokens.length);

    // /parse/.test(methodName) &&
    let position = this.position();
    let depth = this.stack.length;
    let entry = { methodName, start: tokenIndex - this.tokens.length, /*args,*/ position, depth };
    this.stack.unshift(entry);

    let s = ('' + this.lexer.position().toString(false)).padStart(5) + ` ${(position + '').padEnd(10)} ${(depth + '').padStart(4)} ${this.stack[0].methodName}`;
    let msg = s + ` ${quoteList(this.stack[depth].tokens || [])}` + `  ${quoteArg(args)}`;

    //   if(!/match/.test(methodName)) console.log(msg);

    let ret = methods[methodName].call(this, ...args);
    let { token } = this;
    let start = this.consumed || 0;
    let firstTok = this.numToks || 0;
    let end = (token && token.pos) || lexer.pos;
    let lastTok = lexer.tokenIndex - this.tokens.length;

    // msg = s + ` ${quoteList(this.stack[depth].tokens)}`;
    entry.end = lastTok;

    if(ret instanceof ESNode) this.onReturnNode(ret, entry, this.stack);

    let tmp = this.stack[0].tokens || [];
    while(this.stack.length > depth) this.stack.shift();
    //    if(this.stack[0]) this.stack[0].tokens = this.stack[0].tokens || tmp;

    // if(token) lastTok--;
    newNodes = [];
    for(let [node, path] of deep.iterate(nodes, n => n instanceof ESNode)) {
      const name = Util.className(node);
      newNodes.push(name);
    }

    let parsed = lexer.source.substring(start, end);
    this.consumed = end;

    if(parsed.length) parsed = parsed.replace(/\n/g, '\\n');

    let lexed = lexer.tokens.slice(firstTok /*, lastTok*/);
    this.numToks = lastTok;
    let annotate = [];

    const objectStr = typeof ret == 'object' ? Util.className(ret) /* + `{ ${printer.print(ret)} }`*/ : ret;

    annotate.push(`returned: ${objectStr}`);

    if(lexed.length) annotate.push(`lexed[${lexed.map(t => Util.abbreviate(quoteStr(t.value), 20)).join(', ')}]`);
    if(nodes.length) annotate.push(`yielded: ` + quoteArray(newNodes));
    nodes.splice(0, nodes.length);
    depth--;

    if(annotate.length) {
      msg = msg + '    ' + annotate.join(', ');
    }

    //if(ret || !/match/.test(methodName))
    //  console.log(msg);

    return ret;
  };
  return esfactory;
};

Object.assign(
  ECMAScriptParser.prototype,
  Util.getMethodNames(new ECMAScriptParser(), 2)
    .filter(name => /^(expect|match|parse)/.test(name))
    .reduce(function(acc, methodName) {
      var fn = ECMAScriptParser.prototype[methodName];
      methods[methodName] = fn;

      return { ...acc, [methodName]: instrumentate(methodName, fn) };
    }, {})
);

const timeout = ms =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });

Parser.parse = function parse(sourceText, prefix) {
  const parser = new ECMAScriptParser(sourceText, prefix);
  // Parser.instance = parser;
  //await timeout(1000).catch(e => console.log("timeout error:",e));
  return parser.parseProgram();
};
//console.log("methods:", methodNames);
//console.log("fn:" + ECMAScriptParser.prototype.parseProgram);

export default Parser;
