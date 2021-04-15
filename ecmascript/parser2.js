import Util from '../util.js';

/*import { Lexer, SyntaxError, Location, Token } from './lexer.js';
export { Lexer, SyntaxError, Location, Token } from './lexer.js';*/

import { Lexer, SyntaxError, Location, Token } from '../../quickjs/modules/tests/jslexer.js';
export { Lexer, SyntaxError, Location, Token } from '../../quickjs/modules/tests/jslexer.js';

import deep from '../deep.js';
//import util from 'util';
import { TokenList } from './token.js';
import { Printer } from './printer.js';
import { ESNode, Program, Expression, FunctionLiteral, RegExpLiteral, FunctionBody, Identifier, Super, Literal, TemplateLiteral, TaggedTemplateExpression, TemplateElement, ThisExpression, UnaryExpression, UpdateExpression, BinaryExpression, AssignmentExpression, LogicalExpression, MemberExpression, ConditionalExpression, CallExpression, DecoratorExpression, NewExpression, SequenceExpression, Statement, BlockStatement, StatementList, EmptyStatement, LabeledStatement, ExpressionStatement, ReturnStatement, ContinueStatement, BreakStatement, IfStatement, SwitchStatement, SwitchCase, WhileStatement, DoWhileStatement, ForStatement, ForInStatement, ForOfStatement, WithStatement, TryStatement, CatchClause, ThrowStatement, YieldExpression, ImportDeclaration, ImportSpecifier, ImportNamespaceSpecifier, ExportNamedDeclaration, ExportSpecifier, AnonymousDefaultExportedFunctionDeclaration, AnonymousDefaultExportedClassDeclaration, ExportDefaultDeclaration, Declaration, ClassDeclaration, ClassBody, MetaProperty, FunctionArgument, FunctionDeclaration, ArrowFunctionExpression, VariableDeclaration, VariableDeclarator, ObjectExpression, Property, MethodDefinition, ArrayExpression, JSXLiteral, Pattern, ArrayPattern, ObjectPattern, AssignmentProperty, AssignmentPattern, AwaitExpression, RestElement, SpreadElement, CTORS, Factory } from './estree.js';
import MultiMap from '../container/multiMap.js';

const add = (arr, ...items) => [...(arr || []), ...items];

export class Parser {
  lastPos = new Location(1, 1);
  lastTok = 0;
  nodeTokenMap = new WeakMap();

  constructor(sourceText, fileName, debug) {
    this.tokens = [];
    this.processed = [];
    this.lexer = new Lexer(sourceText, fileName, (c, s, e) => this.handleComment(c, s, e));
    this.stack = [];
    this.prefix = fileName ? ` ${fileName}: ` : '';
    // if(debug) this.debug = debug;

    this.comments = [];
    this.factory = new Factory();
    let classes = this.factory.classes;
    let parser = this;
    this.estree = Util.propertyLookup(classes,
      key =>
        function(...args) {
          let node = /*new.target ||*/ classes[key](...args);

          parser.onNewNode(node);

          return node;
        }
    );

    //

    this.factory.callback = (...args) => this.handleConstruct(...args);

    //console.log("Identifier", Identifier);
    //console.log("parser: ", this.parser);
    //console.log('lexer: ', this.lexer);
    //
    if(debug) {
      let prevStack;
      this.locStack = [];
      let { locStack, lexer, token } = this;
      for(let key of Util.getMethodNames(this, 3, 0)) {
        if(/^(parse)/.test(key)) {
          this[key] = Util.trace(ECMAScriptParser.prototype[key],
            () => {},
            () => {},
            (what, name, arg) => {
              if(what == 'leave') {
                let ret = arg;
                let last = locStack[locStack.length - 1];
                if(last[0] == name) locStack.pop();
                console.log(`LEAVE[${locStack.length}]`,
                  (token ?? lexer).loc + '',
                  inspect({ name, ret }, { depth: 2, breakLength: Infinity, compact: 10 })
                );
              }
              if(what == 'enter') {
                locStack.push([name, this.lexer.loc]);
                let { loc } = this.lexer;
                if(loc.line == 38 && loc.column == 25) {
                  let st = Util.getCallerStack(0).filter(fr => /^(match|parse|expect)/.test(fr));
                  if(!prevStack ||
                    prevStack.length != st.length ||
                    (prevStack[0] + '').replace(/:.*/g, '') != (st[0] + '').replace(/:.*/g, '')
                  ) {
                    console.log('STACK:', st);
                    prevStack = st;
                  }
                }
                console.log(`ENTER[${locStack.length}]`,
                  (token ?? lexer).loc + '',
                  inspect({ name, arg }, { compact: 10 })
                );
              }
            }
          );
        }
      }
    } //console.log(`this[${key}]`,this[key]);
  }
  // ECMAScriptParser.instrumentate();

  error(errorMessage, astNode) {
    const pos = this.position();

    console.log('ERROR', { errorMessage, pos });

    return new /*Syntax*/ Error(`${pos}: ${errorMessage}`);
  }

  handleComment(comment, start, end) {
    //console.log('handleComment:', { comment, start, end });
    if(comment.startsWith('//')) comment += '\n';
    let token = new Token('comment',
      comment,
      start /*new Range(start, comment.length)*/,
      start.valueOf()
    );
    this.comments = add(this.comments, token);
  }

  handleConstruct = (() => {
    return function(ctor, args, instance) {
      let assoc = ESNode.assoc(instance, {});
      let pos = assoc && assoc.position;
      /* || this.position()*/ let position;
      if(this && this.stack && this.stack[0]) {
        assoc.position = this.stack[0].position;
        this.lastPos = this.stack[0].position;
      }
      //this.lastTok = this.processed.length;
      this.nodes = add(this.nodes, instance);
      let index = this.nodes.indexOf(instance);
    };
  })();

  onNewNode(node) {
    const range = [this.lastTok, this.processed.length];
    this.nodeTokenMap[node] = range;
  }

  onReturnNode(node, stackEntry, stack) {
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
      get() {
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
    let tokens = /*new TokenList*/ [...this.processed, ...this.tokens].slice(...range);
    if(!tokens || tokens.length == 0 || tokens[0] === undefined) return;
    let last = Util.tail(tokens);
    let positions = [tokens[0].offset, last.end];
    let comments = [];
    //let assoc = ESNode.assoc(node, { range: positions, tokenRange: range, tokens, comments });
    Object.assign(obj, { range: positions, tokenRange: range, tokens, comments });

    /*    console.log("tokens:", tokens);
    //console.log("lexer.position:", this.lexer.position);*/

    if(tokens[0].position) {
      obj.position = tokens[0].position;
    }
  }

  addCommentsToNodes(root) {
    if(this.comments.length == 0) return;
    let nodes = new Map();
    for(let [node, path] of deep.iterate(root, n => n instanceof ESNode)) {
      let assoc = ESNode.assoc(node);
      let { tokenRange, tokens, source } = assoc;
      if(tokens) nodes.set(tokens, assoc);
    }
    for(let [tokens, assoc] of nodes) {
      let { position } = tokens[0];
      while(this.comments.length > 0 && +position >= +this.comments[0].offset) {
        let maxLen = position - this.comments[0].position;

        let comment = this.comments.shift();

        /*if(comment.value.length > maxLen) {
        let trail = comment.value.substring(maxLen, comment.value.length);
        throw new Error(`Comment ${comment.position} '${comment.value.replace(/\n/g, "\\n")}' length (${comment.value.length}) > ${maxLen}: ${trail.replace(/\n/g, "\\n")}\nNext token: ${tokens[0]}\nLast token: ${tokens[tokens.length-1]}`);
      }*/

        assoc.comments = add(assoc.comments, comment);
        //console.log('addCommentsToNodes', comment.position.toString(), comment.value.replace(/\n/g, '\\n'));
      }
    }
  }

  tokensForNode(root) {
    let tokens = [];
    for(let [node, path] of deep.iterate(root, n => n instanceof ESNode)) {
      const token = this.nodeTokenMap[node];
      tokens.push({ token, path });
    }
    tokens.sort((a, b) => a.token[1] - b.token[1]);
    let range = [tokens[0], Util.tail(tokens)].map(range => range.token[1]);
    return [...this.processed, ...this.tokens].slice(...range);
  }

  /*
   * Lexer Interactions
   */
  //Returns the next token
  next() {
    let token;
    if(this.tokens.length > 0) {
      token = this.tokens[0];
    } else {
      for(;;) {
        token = this.lexer.lex();
        if(token) {
          // this.debug('token:', token);
          if(token.type == 'whitespace') continue;
          if(token.type == 'comment') continue;
        }
        break;
      }
      if(token) this.tokens.push(token);
    }
    if(!token) return { type: 'eof', id: -1, value: null };

    this.pos = token.loc;
    this.token = this.tokens[0];
    //console.debug("token:", this.token, "pos:", this.pos);
    return token;
  }

  lookahead(offset = 0) {
    let token;
    while(this.tokens.length <= offset) {
      this.tokens.push(this.lexer.lex());
    }
    return this.tokens[offset] ?? { type: 'eof', value: null, id: -1 };
  }

  consume() {
    const { tokens, processed } = this;
    if(tokens.length === 0) this.next();
    const token = tokens.shift();
    if(tokens.length == 0) this.next();

    processed.push(token);

    if(typeof Parser.onToken == 'function') Parser.onToken(token);
    //console.log("consume", { tokens,processed,token});

    return token;
  }

  state() {
    let n = this.processed.length;
    let parser = this;
    return function() {
      parser.tokens.unshift(...parser.processed.splice(n, parser.processed.length));
    };
  }

  printtoks() {
    let token = this.token;
    let pos = token && token.pos ? token.pos.toString() : '';
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

  debug(...args) {
    console.log(`${this.lexer.loc}`, ...args);
  }

  log() {
    return;
    const width = 72;
    let args = [...arguments].map(a =>
      (typeof a === 'string' ? `"${a}"` : toStr(a)).replace(new RegExp('[\n\r\t ]+', 'g'), '')
    );
    let name = Util.abbreviate(Util.trim(args.join(''), '\'"'), width);
    let stack = Util.getCallerStack().map(st => st.getFunctionName());

    /*this.stack.map((name, i) => `${i}:${name}`).join(", ");*/

    const posstr = this.prefix + String(this.pos);
    console.log.apply(console, [
      posstr + Util.pad(posstr, this.prefix.length + 8),
      name + Util.pad(name, width),
      this.printtoks(),
      'stack: ' + stack.indexOf('parseProgram')
    ]);
  }

  position(tok = null) {
    let pos = tok ? tok.pos : this.pos;
    return this.lexer.position(pos || this.lexer.pos);
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
  return (type === 'stringLiteral' ||
    type === 'numericLiteral' ||
    type === 'regexpLiteral' ||
    type === 'nullLiteral' ||
    type === 'booleanLiteral' ||
    type === 'templateLiteral'
  );
}

function isTemplateLiteral({ type }) {
  return type === 'templateLiteral';
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
        //this.log("name: '" +name+"'");
        if(typeof fn === 'function') {
          //this.log("fn: ", Util.fnName(fn, Parser.prototype, Parser));
          //this.log("fn: ", caller);
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
  '??': 0,
  '||': 1,
  '&&': 2,
  '|': 3,
  '^': 4,
  '&': 5,
  '==': 6,
  '!=': 6,
  '===': 6,
  '!==': 6,
  '<': 7,
  '>': 7,
  '<=': 7,
  '>=': 7,
  in: 7,
  instanceof: 7,
  '<<': 8,
  '>>': 8,
  '>>>': 8,
  '+': 9,
  '-': 9,
  '*': 10,
  '%': 10,
  '/': 10,
  '**': 11
};

export class ECMAScriptParser extends Parser {
  /*
   * Helper Functions
   */

  expectIdentifier(no_keyword = false) {
    this.log(`expectIdentifier(no_keyword=${no_keyword})`);
    const token = this.consume();

    if(token.type != 'nullLiteral')
      if(!(token.type === 'identifier' || (no_keyword && token.type == 'keyword'))) {
        throw new Error(`Expecting <Identifier> but got <${token.type}> with value '${token.value}'`
        );
      }
    this.log(`expectIdentifier2(no_keyword=${no_keyword})`);

    //backTrace(p.expectIdentifier);

    return new Identifier(token.value);
  }

  expectKeywords(keywords) {
    const token = this.consume();
    this.debug('expectKeywords', keywords);
    if(token.type !== 'keyword')
      throw new Error(` Expecting Keyword(${keywords}), but got ${token.type} with value '${token.value}'`
      );

    /*if(Array.isArray(keywords)) {*/
    if(keywords.indexOf(token.value) < 0) {
      throw new Error(`Expected: ${keywords.join(' ')}    Actual: ${token.value || token.type}`);
      return false;
    }
    /* } else if(keywords !== token.value) {
      throw new Error(` Expected: ${keywords}    Actual: ${token.value || token.type}`);
    }*/
    return true;
  }

  expectPunctuators(punctuators, ast) {
    this.log(`expectPunctuators(${punctuators}) `);
    const token = this.consume();
    if(token.type !== 'punctuator') {
      throw new Error(`Expecting Punctuator(${punctuators}), but got ${token.type} with value '${token.value}'`,
        ast
      );
    }
    if(Array.isArray(punctuators)) {
      if(punctuators.indexOf(token.value) < 0) {
        throw new Error(`Expected: ${punctuators.join(' ')}    Actual: ${token.value}`, ast);
      }
    } else if(punctuators !== token.value) {
      throw new Error(`Expected: ${punctuators} Actual: ${token.value}`, ast);
    }
    return token;
  }

  expectLiteral() {
    this.log('expectLiteral() ');
    if(this.matchTemplateLiteral()) return this.parseTemplateLiteral();

    let token = this.consume();
    if(!isLiteral(token)) {
      throw new Error(`Expecting Literal, but got ${token.type} with value '${token.value}'`);
    }

    let value = token.value;
    if(token.type == 'regexpLiteral') {
      const [match, pattern, flags] = /^\/(.*)\/([a-z]*)$/.exec(token.value);
      return new RegExpLiteral(pattern, flags);
    }

    return new Literal(value,
      {
        stringLiteral: 'string',
        templateLiteral: 'string',
        numericLiteral: 'number',
        booleanLiteral: 'boolean',
        nullLiteral: 'object',
        regexpLiteral: 'regexp'
      }[token.type]
    );
  }

  parseTemplateLiteral() {
    this.debug('parseTemplateLiteral');
    let i = 0,
      expressions = [],
      quasis = [];

    this.templateLevel = this.templateLevel || 0;
    this.templateLevel++;
    while(true) {
      let token = this.consume();
      //console.log('token:', token);
      //const head = i == 0 && token.value.startsWith('`');
      const tail = (i > 0 || token.value.length > 1) && token.value.endsWith('`');
      quasis.push(new TemplateElement(tail, token.value));
      if(tail) break;
      expressions.push(this.parseAssignmentExpression());
      const { lexer } = this;
      let { stateFn, inSubst } = lexer;
      lexer.stateFn = this.lexer.lexTemplate(true);
      let literal = (this.matchLiteral() ? this.expectLiteral() : this.expectPunctuators('}'))
        .value;
      i++;
    }
    this.templateLevel--;

    let node = new TemplateLiteral(quasis, expressions);
    //console.log('node:', node);
    return node;
  }

  matchKeywords(keywords) {
    //this.debug('matchKeywords');
    const token = this.next();
    let ret;

    if(token.type != 'keyword') ret = false;
    else if(Array.isArray(keywords)) ret = keywords.indexOf(token.value) >= 0;
    else ret = keywords === token.value;

    // console.log('matchKeywords', { keywords, ret });

    return ret;
  }

  matchPunctuators(punctuators) {
    const token = this.next();
    let ret;
    if(token.type !== 'punctuator') ret = false;
    else if(Array.isArray(punctuators)) ret = punctuators.indexOf(token.lexeme) >= 0;
    else ret = punctuators === token.value;
    //this.debug('matchPunctuators', { punctuators, ret, token: token.lexeme });
    return ret;
  }

  matchIdentifier(no_keyword = false) {
    //this.debug('matchIdentifier');
    const token = this.next();

    //this.log('matchIdentifier() ');
    return token.type === 'identifier' || (no_keyword && token.type === 'keyword');
  }

  matchLiteral() {
    const token = this.next();
    //this.debug('matchLiteral', token.type);
    return isLiteral(token);
  }

  matchTemplateLiteral() {
    //this.debug('matchTemplateLiteral');
    //if(this.templateLevel > 0) return false;
    const token = this.next();
    return isTemplateLiteral(token);
  }

  matchStatement() {
    //this.debug('matchStatement');
    return (this.matchPunctuators(';') ||
      this.matchKeywords([
        'if',
        'var',
        'let',
        'const',
        'with',
        'while',
        'do',
        'for',
        'continue',
        'break',
        'return',
        'switch',
        'import',
        'export',
        'try',
        'throw',
        'class',
        'yield'
      ]) ||
      this.matchAssignmentExpression()
    );
  }

  matchPrimaryExpression() {
    //this.debug('matchPrimaryExpression');
    return (this.matchKeywords(['this', 'async', 'super']) ||
      this.matchPunctuators(['(', '[', '{', '<', '...']) ||
      this.matchLiteral() ||
      this.matchIdentifier()
    );
  }

  matchUnaryExpression() {
    //this.debug('matchUnaryExpression');
    return (this.matchKeywords(['delete', 'void', 'typeof', 'await' /*, 'yield'*/]) ||
      this.matchPunctuators(['++', '--', '+', '-', '~', '!'])
    );
  }

  matchAssignmentExpression() {
    //this.debug('matchAssignmentExpression');
    return (this.matchUnaryExpression() ||
      this.matchLeftHandSideExpression() ||
      this.matchFunctionExpression() ||
      this.matchKeywords(['class'])
    );
  }

  matchFunctionExpression() {
    //this.debug('matchFunctionExpression');
    const is_async = this.lookahead(0).value == 'async';
    const token = this.lookahead(is_async ? 1 : 0);
    return this.matchKeywords('function') || (token && token.value == 'get');
  }

  matchMemberExpression() {
    //this.debug('matchMemberExpression');

    return this.matchPrimaryExpression() || this.matchKeywords('new') || this.matchKeywords('this');
  }

  matchLeftHandSideExpression() {
    //this.debug('matchLeftHandSideExpression');
    return this.matchMemberExpression(...arguments);
  }

  /*
   * Actual recursive descent part of things
   */

  parsePrimaryExpression() {
    this.debug('parsePrimaryExpression');
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
      expr = new ThisExpression();
    } else if(this.matchKeywords('class')) {
      expr = this.parseClass();
    } else if(/*is_async && */ this.matchKeywords('function')) {
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
      expr = new Identifier("super");*/
    } else if(this.matchKeywords('super')) {
      this.expectKeywords('super');
      expr = new Super();
    } else if(this.matchKeywords('import')) {
      expr = this.parseImportDeclaration(false);
    } else if(this.matchPunctuators('(')) {
      this.expectPunctuators('(');

      let expression = [];
      let parentheses = this.matchPunctuators('(');
      // if(parentheses) this.expectPunctuators('(');

      if(!this.matchPunctuators(')')) expression = this.parseExpression(false, true);

      this.expectPunctuators(')');

      if(this.matchPunctuators('=>')) {
        //console.debug('expression args:', expression);
        let args = expression.expressions || expression || [];
        for(let i = 0; i < args.length; i++) {
          let e = args[i];
          if(e instanceof AssignmentExpression) {
            if(e.right instanceof SequenceExpression) {
              let seq = e.right.expressions;
              e.right = seq.shift();
              args.splice(i + 1, 0, ...seq);
            }
          }
        }

        //console.debug(`${this.position()} args:`, expression);
        expression = this.parseArrowFunction(args, is_async);
        //expression = new SequenceExpression([expression]);
      } else if(!(expression instanceof SequenceExpression))
        expression = new SequenceExpression([expression]);

      //    if(parentheses) this.expectPunctuators(')');

      // if( expression instanceof ArrowFunctionExpression  || parentheses)
      expr = expression;
    } else if(this.matchIdentifier(true)) {
      let id = this.expectIdentifier(true);

      if(this.matchPunctuators('=>')) {
        id = this.parseArrowFunction([id], is_async);
        id = new SequenceExpression([id]);
      }

      expr = id;
    } else if(is_async) {
      expr = new Identifier('async');
    } else {
      this.error(`${this.token.position}: Unexpected token '${this.token}'`);
    }
    if(rest_of) {
      expr = new RestElement(expr);
    }
    return expr;
  }

  parseArguments() {
    this.debug('parseArguments');
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
      if(rest_of) arg = new RestElement(arg);
      args.push(arg);
      //if(rest_of) break;
      if(this.matchPunctuators(',')) {
        this.expectPunctuators(',');
        continue;
      }
      break;
    }
    //console.log("this.processed:", this.processed);
    this.expectPunctuators(')', args);
    return args;
  }

  parseRemainingMemberExpression(object) {
    this.debug('parseRemainingMemberExpression', { object });
    while(this.matchPunctuators(['.', '[', '?.'])) {
      if(this.matchPunctuators(['.', '?.'])) {
        const optional = this.matchPunctuators('?.');

        this.expectPunctuators(['.', '?.']);
        const identifier = this.expectIdentifier(true);

        /* console.log('object:', object);
        //console.log('identifier:', identifier);*/

        if(object === null) throw new Error('Object ' + object);

        if(object instanceof Identifier && (object.name == 'new' || object.name == 'import'))
          object = new MetaProperty(object, identifier);
        else object = new MemberExpression(object, identifier, false, optional);

        //this.log('parseRemainingMemberExpression2(', object.toString(), ')', Util.fnName(this.parseRemainingMemberExpression));
      } else if(this.matchPunctuators('[')) {
        this.expectPunctuators('[');
        const expression = this.parseExpression(true);
        this.expectPunctuators(']');
        object = new MemberExpression(object, expression, true);
      }
    }
    this.debug('parseRemainingMemberExpression', { object });
    return object;
  }

  parseArrowFunction(args, is_async = false) {
    this.debug('parseArrowFunction');
    this.expectPunctuators('=>');
    let body;

    if(this.matchPunctuators('{')) body = this.parseBlock(false, true);
    else body = this.parseAssignmentExpression();

    //console.log("body:",body);
    //&', args);

    //parseArrow
    if(args instanceof SequenceExpression) args = args.expressions;

    if(!Util.isArray(args)) args = [args];

    args = args.map(arg => {
      if(arg instanceof ObjectPattern) {
      }
      return arg;
    });

    return new ArrowFunctionExpression(args, body, is_async);
  }

  parseRemainingCallExpression(object, is_async = false) {
    this.debug('parseRemainingCallExpression');
    /* let args = this.parseArguments();

*/
    while(this.matchTemplateLiteral() || this.matchPunctuators(['.', '[', '('])) {
      if(this.matchPunctuators(['.', '?.'])) {
        this.expectPunctuators(['.', '?.']);
        const identifier = this.expectIdentifier(true);
        const optional = this.matchPunctuators('?.');
        object = new MemberExpression(object, new Literal(identifier.toString()), false, optional);
      } else if(this.matchPunctuators('[')) {
        this.expectPunctuators('[');
        const expression = this.parseExpression();
        this.expectPunctuators(']');
        object = new MemberExpression(object, expression, true);
      } else if(this.matchPunctuators('(')) {
        let args = this.parseArguments();
        if(this.matchPunctuators('=>')) object = this.parseArrowFunction(args, is_async);
        else object = new CallExpression(object, args);
      } else if(this.matchTemplateLiteral()) {
        //console.log("Template call", this.token);
        let arg = this.parseTemplateLiteral();

        //console.log("Template call", arg);
        object = new CallExpression(object, arg);
      }
    }
    return object;
  }

  parseNewOrCallOrMemberExpression(couldBeNewExpression, couldBeCallExpression) {
    this.debug('parseNewOrCallOrMemberExpression');
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
      if(this.matchPunctuators('.')) {
        object = new Identifier('new');
      } else {
        const result = this.parseNewOrCallOrMemberExpression(true, false);
        //console.log('result:', result);
        couldBeNewExpression = result.couldBeNewExpression;
        let args = [];
        if(!couldBeNewExpression || this.matchPunctuators('(')) {
          args = this.parseArguments();
          couldBeNewExpression = false;
        }
        object = new NewExpression(result.object, args);
      }
    } else {
      object = this.parsePrimaryExpression();
    }
    //console.debug("\x1b[1;31mobject:",object, "\x1b[0m");
    object = this.parseRemainingMemberExpression(object);
    let id = object;
    if((this.matchPunctuators('(') || this.matchTemplateLiteral()) && couldBeCallExpression) {
      couldBeNewExpression = false;
      object = this.parseRemainingCallExpression(object, is_async);
    }
    if(do_await) {
      object = new AwaitExpression(object);
    }
    return { object, couldBeNewExpression };
  }

  parseLeftHandSideExpression() {
    this.debug('parseLeftHandSideExpression');
    this.log(`parseLeftHandSideExpression()`);
    let { object, couldBeNewExpression } = this.parseNewOrCallOrMemberExpression(true, true);

    return object;
  }

  parsePostfixExpression() {
    this.debug('parsePostfixExpression');
    this.log(`parsePostfixExpression()`);
    let lhs = true;
    let expression = this.parseLeftHandSideExpression();

    //TODO: Deny line terminator here
    if(this.matchPunctuators(['++', '--'])) {
      lhs = false;
      let operator = this.expectPunctuators(['++', '--']);
      expression = new UpdateExpression(operator.value, expression, false);
    }
    return { ast: expression, lhs };
  }

  parseUnaryExpression() {
    this.debug('parseUnaryExpression');
    this.log(`parseUnaryExpression()`);
    const unaryKeywords = ['delete', 'void', 'typeof', 'await'];
    const unaryPunctuators = ['++', '--', '+', '-', '~', '!'];
    /*   if(this.matchKeywords('await')) {
      this.expectKeywords('await');
      const argument = this.parseAssignmentExpression();

      return new AwaitExpression((argument.ast && argument.ast) || argument);
    } else*/ if(this.matchKeywords(unaryKeywords)
    ) {
      const operatorToken = this.expectKeywords(unaryKeywords);
      const argument = this.parseUnaryExpression();
      return {
        ast: new UnaryExpression(operatorToken.value, argument.ast, true),
        lhs: false
      };
    } else if(this.matchPunctuators(unaryPunctuators)) {
      const operatorToken = this.expectPunctuators(unaryPunctuators);
      const argument = this.parseUnaryExpression();
      let ast;
      /*if(operatorToken.value === "++" || operatorToken.value === "--") {
        ast = new UpdateExpression(operatorToken.value, argument.ast, true);
      } else*/ {
        ast = new UnaryExpression(operatorToken.value, argument.ast, true);
      }
      return { ast, lhs: false };
    }
    return this.parsePostfixExpression();
  }

  //Uses precedence climbing to deal with binary expressions, all of which have
  //left-to-right associtivity in this case.
  parseBinaryExpression(minPrecedence) {
    this.debug('parseBinaryExpression');
    this.log(`parseBinaryExpression()`);

    const punctuators = [
      '||',
      '&&',
      '|',
      '^',
      '&',
      '===',
      '==',
      '!==',
      '!=',
      '<',
      '>',
      '<=',
      '>=',
      '<<',
      '>>',
      '>>>',
      '-->>',
      '+',
      '-',
      '*',
      '/',
      '%',
      '??'
    ];
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
    //if(tok.value == 'instanceof')
    //this.log('TOKEN: ', tok);
    while((this.matchKeywords(['instanceof', 'in']) ||
        this.matchPunctuators(punctuators) ||
        ['instanceof', 'in'].includes(tok.value)) &&
      operatorPrecedence[(tok = this.next()).value] >= minPrecedence
    ) {
      //this.log('VALUE: ', value);
      //If any operator is encountered, then the result cannot be
      //LeftHandSideExpression anymore
      lhs = false;
      const precedenceLevel = operatorPrecedence[this.next().value];
      const operatorToken = ['instanceof', 'in'].includes(tok.value)
        ? this.expectKeywords(['instanceof', 'in'])
        : this.expectPunctuators(punctuators);

      const right = this.parseBinaryExpression(precedenceLevel + 1);

      //console.log(`parseBinaryExpression(${precedenceLevel})`, {operator: operatorToken.value, ast, right });

      if(right.ast == null) right.ast = this.parseFunction();

      if(right.ast == null) return { ast, lhs };

      if(operatorToken.value === '||' || operatorToken.value === '&&') {
        /*if(operatorToken.value === '||')
          //console.log('LogicalExpression', {
            operator: operatorToken.value,
            right,
            ast,
            token: this.token.value
          });*/

        ast = new LogicalExpression(operatorToken.value, ast, right.ast);
      } else {
        ast = new BinaryExpression(operatorToken.value, ast, right.ast);
      }
    }
    return { ast, lhs };
  }
  grep;

  parseConditionalExpression() {
    this.log(`parseConditionalExpression()`);
    let result = this.parseBinaryExpression(0);
    //console.log('parseConditionalExpression result:', result); //  if(result.ast == undefined) result = { ast: result, lhs: false };
    let ast = result.ast;
    let lhs = result.lhs;
    if(!ast) {
      //console.log('ast lhs:', { result, token: this.token.value, pos: [...this.position()].join(':') });
      //console.log("lhs:", Util.className(lhs));
      //console.log("line:", this.lexer.currentLine());
      ast = new Identifier('undefined');
      //throw new Error(`ConditionalExpression no ast`);
    }

    if(this.matchPunctuators('?')) {
      this.expectPunctuators('?');
      const consequent = this.parseAssignmentExpression();
      //this.log('consequent: ', consequent);
      this.expectPunctuators(':');
      const alternate = this.parseAssignmentExpression();
      ast = new ConditionalExpression(ast, consequent, alternate);
      lhs = false;
    }
    return { ast, lhs };
  }

  parseAssignmentExpression() {
    this.debug('parseAssignmentExpression');
    this.log(`parseAssignmentExpression()`);

    /*   if(this.matchKeywords(['function', 'get'])) {
      let get = false;
      if(this.matchKeywords('get')) {
        this.expectKeywords('get');
        get = true;
      }
      return this.parseFunction();
    } else*/ if(this.matchPunctuators('{')
    ) {
      return this.parseObject();
    } /*else if(this.matchPunctuators("[")) {
          //return this.parseNewOrCallOrMemberExpression();
      let object = this.parseArray();
      if(this.matchPunctuators(".")) {
        object = this.parseRemainingMemberExpression(object);
      }
      if(this.matchPunctuators("(")) {
        object = this.parseRemainingCallExpression(object);
      }
      return object;
    }*/

    //Won't know immediately whether to parse as ConditionalExpression or
    //LeftHandSideExpression. We'll only know later on during parsing if we
    //come across things that cannot be in LeftHandSideExpression.
    const result = this.parseConditionalExpression();

    //console.log('parseAssignmentExpression:', { result, token: this.token.value });

    if(this.matchPunctuators('}')) {
      return result.ast;
      //throw new Error(`${this.position()}`);
    }

    if(result.lhs) {
      //Once it is determined that the parse result yielded
      //LeftHandSideExpression though, then we can parse the remaining
      //AssignmentExpression with that knowledge
      const assignmentOperators = [
        '=',
        '*=',
        '/=',
        '%=',
        '+=',
        '-=',
        '<<=',
        '>>=',
        '>>>=',
        '-->>=',
        '&=',
        '^=',
        '|='
      ];
      if(this.matchPunctuators(assignmentOperators) ||
        assignmentOperators.indexOf(this.token.value) != -1
      ) {
        const left = result.ast;
        const operatorToken = this.expectPunctuators(assignmentOperators);
        const right = this.parseExpression();
        return new AssignmentExpression(operatorToken.value, left, right);
      }
      //console.log('result.ast', result.ast, { token: this.token });
      return result.ast;
    }
    return result.ast;
  }

  parseExpression(optional, sequence = true) {
    const expressions = [];
    let ret,
      expression = this.parseAssignmentExpression();

    this.debug('parseExpression', { expression });

    if(expression !== null) {
      expressions.push(expression);
    } else if(!optional) {
      const token = this.next();
      throw new Error(`Expecting AssignmentExpression, but got ${token.type} with value '${token.value}'`
      );
    }
    // console.log("expression: ", expression);
    let i = 0;
    // console.log(`expression ${i} ${Util.getCallerStack().length}`, expression);

    if(sequence)
      while(this.matchPunctuators(',')) {
        this.expectPunctuators(',');
        expression = this.parseAssignmentExpression();
        //  console.log(`expression ${++i} ${Util.getCallerStack().length}`, expression);
        if(expression !== null) {
          expressions.push(expression);
        } else if(!optional) {
          const token = this.next();
          throw new Error(`Expecting AssignmentExpression, but got ${token.type} with value '${token.value}'`
          );
        }
      }
    if(/*sequence || */ expressions.length > 1) {
      ret = new SequenceExpression(expressions);
    } else if(expressions.length === 1) {
      ret = expressions[0];
    } else if(optional) {
      ret = null;
    }

    return ret;

    //  throw new Error(`Shouldn't ever be here`, this.position());
  }

  parseBindingPattern() {
    this.debug('parseBindingPattern');
    let tok = this.expectPunctuators(['{', '[']);
    let is_array = tok.value == '[';
    let ctor = is_array ? ArrayPattern : ObjectPattern;
    let props = [];

    while(true) {
      let rest,
        property,
        element,
        initializer,
        computed = false,
        shorthand = false;
      if(this.matchPunctuators(['{', '['])) {
        property = this.parseBindingPattern();
      } else {
        if((rest = this.matchPunctuators('...'))) this.expectPunctuators('...');

        if(!is_array && this.matchPunctuators('[')) {
          this.expectPunctuators('[');
          property = element = this.parseAssignmentExpression();
          computed = true;

          this.expectPunctuators(']');
        } else {
          if(this.matchIdentifier(true)) property = element = this.expectIdentifier(true);
        }

        if(rest) {
          property = new RestElement(property);
        } else {
          if(this.matchPunctuators(':')) {
            this.expectPunctuators(':');

            if(this.matchPunctuators(['{', '['])) element = this.parseBindingPattern();
            else element = this.expectIdentifier();
          } else if(this.matchKeywords('as')) {
            this.expectKeywords('as');
            element = this.expectIdentifier();
          }

          if(this.matchPunctuators('=')) {
            this.expectPunctuators('=');
            element = new AssignmentPattern(element, this.parseAssignmentExpression());
          }

          //console.log("element:", element, this.token.position);

          if(element)
            if(property.name == (element instanceof AssignmentPattern ? element.left : element).name
            )
              shorthand = true;

          // console.log('parseBindingPattern', { property, element, initializer });
          property = new AssignmentProperty(property, element, shorthand, computed);
        }
      }

      props.push(property);
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
    this.debug('parseVariableDeclaration');
    let identifier = null;

    this.log(`parseVariableDeclaration()`);

    if(this.matchPunctuators(['{', '['])) identifier = this.parseBindingPattern();
    else identifier = this.expectIdentifier(true);

    let assignment = null;

    if(this.matchPunctuators('=')) {
      this.expectPunctuators('=');
      assignment = this.parseAssignmentExpression();
      if(assignment === null) {
        const token = this.next();
        throw new Error(`Expecting AssignmentExpression, but got ${token.type} with value '${token.value}'`
        );
      }
    }
    return { identifier, assignment };
  }

  parseVariableDeclarationList(kind = 'var', exported = false) {
    this.debug('parseVariableDeclarationList');
    this.log(`parseVariableDeclarationList()`);
    const declarations = []; //Destructuring not yet on by default in nodejs
    let declarator = this.parseVariableDeclaration();
    let identifier = declarator.identifier;
    let assignment = declarator.assignment;
    declarations.push(new VariableDeclarator(identifier, assignment));
    while(this.matchPunctuators(',')) {
      this.expectPunctuators(',');
      declarator = this.parseVariableDeclaration();
      identifier = declarator.identifier;
      assignment = declarator.assignment;
      declarations.push(new VariableDeclarator(identifier, assignment));
    }
    let decl = new VariableDeclaration(declarations, kind, exported);

    return decl;
  }

  parseBlock(insideIteration, insideFunction, ctor = BlockStatement) {
    this.debug(`parseBlock`, { insideIteration, insideFunction, ctor });
    const statements = [];
    this.expectPunctuators('{');
    do {
      this.debug(`parseBlock`, { token: this.token.lexeme });
      if(this.matchStatement()) {
        let stmt;

        stmt = this.parseStatement(insideIteration, insideFunction);
        statements.push(stmt);
        this.debug(`parseBlock`, { stmt });
      }
    } while(!this.matchPunctuators('}'));
    this.expectPunctuators('}');
    //console.log("statements:", statements);

    return new ctor(statements);
  }

  parseList(insideIteration = false, insideFunction = false, check = p => false) {
    this.debug('parseList');
    this.log(`parseList()`);

    const statements = [];
    while(this.matchStatement()) {
      statements.push(this.parseStatement(insideIteration, insideFunction));
      if(check(this)) break;
    }
    return new StatementList(statements);
  }

  parseObject(isClass = false, args = []) {
    //let ctor = ObjectExpression;
    let ctor = isClass ? ClassDeclaration : ObjectExpression;
    this.debug('parseObject', ctor, isClass);
    this.log(`parseObject()`);
    let properties = [];
    this.expectPunctuators('{');
    while(!this.matchPunctuators('}')) {
      let kind = 'method';
      let _static = false;
      let spread = false;
      let member = null,
        value = null;
      let is_async = false,
        is_generator = false,
        computed = false;
      //let isGenerator = false;
      if(this.matchPunctuators('...')) {
        this.expectPunctuators('...');
        spread = true;
      }
      if(spread) {
        value = this.parseAssignmentExpression();
        value = new SpreadElement(value);
        //console.log('value:', value);
        properties.push(value);
      } else {
        if(this.matchKeywords('async')) {
          this.expectKeywords('async');
          is_async = true;
        }
        if(isClass && this.matchKeywords('static')) {
          this.expectKeywords('static');
          _static = true;
        }
        if(this.matchIdentifier() && ['get', 'set'].indexOf(this.token.value) != -1) {
          let getOrSet = this.token.value;
          member = this.expectIdentifier();
          if(!this.matchPunctuators('(')) {
            member = null;
            kind = getOrSet;
          }
        }
        if(this.matchPunctuators('*')) {
          this.expectPunctuators('*');
          is_generator = true;
        }
        if(!member) {
          if(this.matchIdentifier(true)) {
            member = this.expectIdentifier(true);
          } else if(this.matchPunctuators('[')) {
            this.expectPunctuators('[');
            member = this.parseAssignmentExpression();
            computed = true;
            this.expectPunctuators(']');
          } else if(this.matchPunctuators([':'])) {
            if(kind == 'get') {
              member = new Identifier('get');
              kind = 'method';
            }
          } else if(this.matchLiteral()) {
            member = this.expectLiteral();
          }
        }
        if(this.matchPunctuators([',', '}'])) {
          value = member;
        } else if(this.matchPunctuators('(')) {
          value = this.parseFunctionParametersAndBody(member, is_async, is_generator);
          if(value.id) member = value.id;
        } else if(this.matchPunctuators('=')) {
          this.expectPunctuators('=');
          value = this.parseAssignmentExpression();
          if(this.matchPunctuators(';')) this.expectPunctuators(';');
          if(!isClass) ctor = ObjectPattern;
        } else if(this.matchPunctuators(':')) {
          this.expectPunctuators(':');
          if(!this.matchAssignmentExpression()) break;
          value = this.parseAssignmentExpression();
          if(!isClass) ctor = ObjectExpression;
        } else if(typeof member == 'object' && member !== null && 'value' in member) {
          //ctor = ObjectPattern;
        }
        if(member == null && (kind == 'get' || kind == 'set')) {
          member = new Identifier(kind);
          kind = 'method';
        }
        if(member instanceof Identifier && member.name == 'constructor') {
          kind = member.name;
          member = null;
        }
        let memberCtor = (id, value, _, kind) =>
          new Property(id,
            value,
            kind,
            value instanceof FunctionLiteral,
            id === value,
            !(id instanceof Identifier)
          );
        if(ctor === ObjectPattern)
          memberCtor = (id, value, element) => new BindingProperty(id, element, value);
        else if(/*!(value instanceof FunctionDeclaration) && */ isClass)
          memberCtor = (id, value, _, kind) =>
            new MethodDefinition(id, value, kind, false, _static);
        if(spread) member = new SpreadElement(value);
        else if((value !== null && member != null && member.id === undefined) || kind != 'method')
          member = memberCtor(member, value, null, kind);
        properties.push(member);
      }
      if(this.matchPunctuators('}')) break;
      if(this.matchPunctuators(',')) this.expectPunctuators(',');
    }
    this.expectPunctuators('}');
    if(ctor === ObjectPattern) {
      if(!(properties instanceof Array))
        properties = Object.entries(properties).map(([key, value]) =>
            new BindingProperty(new Identifier(key),
              value ? new Identifier(value) : new Identifier(key)
            )
        );
    }
    let ret = new ctor(...[...args, ctor === ClassDeclaration ? new ClassBody(properties) : properties]
    );
    if(this.matchPunctuators(['?.', '.'])) ret = this.parseRemainingMemberExpression(ret);

    function BindingProperty(property, id, initializer) {
      let shorthand = id === property;
      if(initializer) id = new AssignmentPattern(id, initializer);
      return new AssignmentProperty(property, id, shorthand);
    }
    return ret;
  }

  parseArray() {
    this.debug('parseArray');
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

      //if(this.matchAssignmentExpression()) {
      element = this.parseAssignmentExpression();
      //}
      //console.log("array element:", element);

      if(spread) {
        element = new SpreadElement(element);
      }

      members.push(element);

      if(this.matchPunctuators(',')) this.expectPunctuators(',');
    }
    this.expectPunctuators(']');
    object = new ArrayExpression(members);

    /*
    if(this.matchPunctuators(".")) {
      object = this.parseRemainingMemberExpression(object);
    }*/
    return object;
  }

  parseJSXTag() {
    this.debug('parseJSXTag');
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
      //console.log('token:', this.token);
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
        value = new Literal(true);
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

    return new JSXLiteral(tag.value, attrs, closed, selfClosing, spread);
  }

  parseJSX(depth = 0) {
    this.debug('parseJSX');
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
        //console.log('obj', obj);
        jsx.children.push(obj);
        this.expectPunctuators('}');
      }
      if(!tag.closing && !tag.selfClosing) {
        let toks = [];
        while(!this.matchPunctuators('<')) {
          let tok = this.consume();
          toks.push(tok.value);
          //console.log('tok:', tok);
        }
        let text = toks.join(' ');
        if(text != '') jsx.children.push(new Literal(text));
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
          //console.log('end tok:', { depth });
          depth--;
          //break;
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
    this.debug('parseVariableStatement');
    this.log(`parseVariableStatement()`);
    let keyw = this.expectKeywords(['var', 'let', 'const']);
    let decl = this.parseVariableDeclarationList(keyw.value, exported);
    if(this.matchPunctuators(';')) this.expectPunctuators(';');
    //console.log("ast:",ast);

    if(exported) {
      decl = new ExportNamedDeclaration(decl, null);
    }

    //
    return decl;
  }

  parseImportDeclaration(toplevel = false) {
    this.debug('parseImportDeclaration', { toplevel, token: this.token.lexeme });
    this.expectKeywords('import');
    let items = [];

    if(toplevel) {
      let item;
      if(this.matchLiteral()) {
        return new ImportDeclaration(null, this.expectLiteral());
      }
      while(true) {
        if(this.matchPunctuators('{')) {
          items = items.concat(this.parseModuleItems());
        } else if(this.matchIdentifier() || this.matchPunctuators('*')) {
          item = this.parseImportSpecifier();
          items.push(item);
        }
        if(this.matchPunctuators(',')) {
          this.expectPunctuators(',');
          continue;
        }
        break;
      }
      this.expectIdentifier('from');
      const sourceFile = this.parseExpression(false, false);
      this.expectPunctuators(';');
      return new ImportDeclaration(items, sourceFile);
    }
    let object = new Identifier('import');
    return this.parseRemainingCallExpression(object);
  }

  parseImportSpecifier() {
    this.debug('parseImportSpecifier');
    let name;
    let decl;
    if(this.matchPunctuators('*')) {
      this.expectPunctuators('*');
      this.expectKeywords('as');
      name = this.expectIdentifier();

      return new ImportNamespaceSpecifier(name);
    }
    name = this.expectIdentifier();

    if(this.matchKeywords('as')) {
      this.expectKeywords('as');
      decl = this.expectIdentifier();
    } else {
      decl = name;
    }
    return new ImportSpecifier(name, decl);
  }

  parseModuleItems(method = 'parseImportSpecifier') {
    this.debug('parseModuleItems', { method });
    this.expectPunctuators('{');
    let items = [];
    1;
    while(!this.matchPunctuators('}')) {
      let item;
      item = this[method]();
      items.push(item);
      if(this.matchPunctuators(',')) {
        this.expectPunctuators(',');
        continue;
      }
      break;
    }
    this.expectPunctuators('}');
    return items;
  }

  parseExportSpecifier() {
    this.debug('parseExportSpecifier');
    let name;
    let decl;

    name = this.expectIdentifier(true);

    if(this.matchKeywords('as')) {
      this.expectKeywords('as');
      decl = this.expectIdentifier();
    } else {
      decl = name;
    }
    return new ExportSpecifier(name, decl);
  }

  parseExportDeclaration() {
    this.debug('parseExportDeclaration');
    let stmt,
      is_async = false;
    this.log('parseExportDeclaration()');
    if(this.matchKeywords('export')) this.expectKeywords('export');
    if(this.matchKeywords('async')) {
      this.expectKeywords('async');
      is_async = true;
    }

    if(this.matchKeywords('default')) {
      this.expectKeywords('default');
      stmt = this.parseAssignmentExpression();
      //console.log("default export:", stmt);

      stmt = new ExportDefaultDeclaration(stmt);
    } else if(this.matchKeywords('class')) {
      stmt = this.parseClass(true);
    } else if(this.matchKeywords('function')) {
      stmt = this.parseFunction(true, is_async);
    } else if(this.matchKeywords(['var', 'let', 'const'])) {
      stmt = this.parseVariableStatement(true);
    } else if(this.matchIdentifier(true)) {
      const id = this.expectIdentifier();

      stmt = new ExportNamedDeclaration(this.parseAssignmentExpression(), null);
    } else if(this.matchPunctuators('{')) {
      let items = this.parseModuleItems('parseExportSpecifier');

      let source;

      if(this.matchKeywords('from')) {
        this.expectKeywords('from');
        //console.log('export from!');
        source = this.expectLiteral();
      } else if(this.matchIdentifier('from')) {
        this.expectIdentifier('from');
        //console.log('export from!');
        source = this.expectLiteral();
      }
      stmt = new ExportNamedDeclaration(null, items, source);

      //this.expectPunctuators('}');
    }

    if(this.matchPunctuators(';')) this.expectPunctuators(';');

    this.debug('parseExportDeclaration', { stmt, token: this.token.value });

    return stmt;
    //return this.parseVariableStatement(true);
  }

  parseDecoratorStatement() {
    this.debug('parseDecoratorStatement');
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
    this.debug('parseExpressionStatement');
    this.log(`parseExpressionStatement()`);

    const expression = this.parseExpression();

    if(this.matchPunctuators(';')) this.expectPunctuators(';');
    return new ExpressionStatement(expression);
  }

  parseIfStatement(insideIteration, insideFunction) {
    this.debug('parseIfStatement');
    this.expectKeywords('if');
    this.expectPunctuators('(');
    const test = this.parseExpression();
    this.expectPunctuators(')');
    const consequent = this.parseStatement(insideIteration, insideFunction);
    if(consequent === null) {
      throw new Error('Expecting statement for if-statement', this.position());
    }
    let alternate = null;
    if(this.matchKeywords('else')) {
      this.expectKeywords('else');
      alternate = this.parseStatement(insideIteration, insideFunction);
      if(alternate === null) {
        throw new Error('Expecting statement for else block in if-statement');
      }
    }
    return new IfStatement(test, consequent, alternate);
  }

  parseWhileStatement(insideFunction) {
    this.debug('parseWhileStatement');
    this.expectKeywords('while');
    this.expectPunctuators('(');
    const test = this.parseExpression();
    this.expectPunctuators(')');
    const statement = this.parseStatement(true, insideFunction);
    if(statement === null) {
      throw new Error('Expecting statement for while-statement', this.position());
    }
    return new WhileStatement(test, statement);
  }

  parseDoWhileStatement(insideFunction) {
    this.debug('parseDoWhileStatement');
    this.expectKeywords('do');
    const statement = this.parseStatement(true, insideFunction, false);
    if(statement === null) {
      throw new Error('Expecting statement for do-while-statement', this.position());
    }
    this.expectKeywords('while');
    this.expectPunctuators('(');
    const test = this.parseExpression();
    this.expectPunctuators(')');
    return new DoWhileStatement(test, statement);
  }

  parseForStatement(insideFunction) {
    this.debug('parseForStatement');
    let async = false;
    this.expectKeywords('for');
    if(this.matchKeywords('await')) {
      this.expectKeywords('await');
      async = true;
    }
    this.expectPunctuators('(');
    let isForInStatement = false;
    let operator = null;
    let left = null;
    let right = null;
    let init = null;
    let test = null;
    let update = null;
    if(this.matchKeywords(['var', 'let', 'const'])) {
      //Can be either of the following forms:
      //for( var VariableDeclarationList ; Expression(opt) ; Expression(opt) )
      //Statement for( var Identifier Initializer(opt) in Expression ) Statement
      let keyw = this.expectKeywords(['var', 'let', 'const']);
      const ast = this.parseVariableDeclarationList(keyw.value, false);
      if((keyw = this.matchKeywords(['in', 'of']))) {
        isForInStatement = true;
        left = ast;
        //Make sure the ast contains only one identifier and at most one
        //initializer
        if(ast.declarations.length !== 1) {
          throw new Error(`Expecting only one Identifier and at most one Initializer in a ForIn statement`
          );
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
      //Can be either of the following forms:
      //for( Expression(opt) ; Expression(opt) ; Expression(opt) ) Statement
      //for( LeftHandSideExpression in Expression ) Statement
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
      throw new Error('Expecting statement for for-statement', this.position());
    }
    //console.log("for..in operator:", operator);

    if(isForInStatement)
      return new (operator == 'in' ? ForInStatement : ForOfStatement)(left,
        right,
        statement,
        async
      );
    return new ForStatement(init, test, update, statement);
  }

  parseIterationStatement(insideFunction) {
    this.debug('parseIterationStatement');
    this.log(`parseIterationStatement()`);
    if(this.matchKeywords('while')) {
      return this.parseWhileStatement(insideFunction);
    } else if(this.matchKeywords('do')) {
      return this.parseDoWhileStatement(insideFunction);
    }
    return this.parseForStatement(insideFunction);
  }

  parseSwitchStatement(insideFunction) {
    this.debug('parseSwitchStatement');
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

      cases.push(new SwitchCase(cv, stmt));

      if(this.matchPunctuators('}')) break;
    }
    this.expectPunctuators('}');
    return new SwitchStatement(sv, cases);
  }

  parseTryStatement(insideIteration, insideFunction) {
    this.debug('parseTryStatement');
    let body,
      parameter = null,
      catch_block,
      finally_block;
    this.expectKeywords('try');
    //this.expectPunctuators("{");
    body = this.parseBlock(insideIteration, insideFunction);

    if(this.matchKeywords('catch')) {
      this.expectKeywords('catch');
      parameter = [];

      if(this.matchPunctuators('(')) {
        this.expectPunctuators('(');
        //Parse optional parameter list
        if(this.matchIdentifier()) parameter = this.expectIdentifier();
        this.expectPunctuators(')');
      }

      //Parse function body
      catch_block = this.parseStatement(insideIteration, insideFunction);
    }
    if(this.matchKeywords('finally')) {
      this.expectKeywords('finally');

      finally_block = this.parseStatement(insideIteration, insideFunction);
    }

    let object = new TryStatement(body, new CatchClause(parameter, catch_block), finally_block);

    if(this.matchPunctuators('(')) {
      return this.parseRemainingCallExpression(object);
    }

    return object;
  }

  parseWithStatement(insideIteration, insideFunction) {
    this.debug('parseWithStatement');
    this.expectKeywords('with');
    this.expectPunctuators('(');
    const test = this.parseExpression();
    this.expectPunctuators(')');
    const statement = this.parseStatement(insideIteration, insideFunction);
    if(statement === null) {
      throw new Error('Expecting statement for with-statement', this.position());
    }
    return new WithStatement(test, statement);
  }

  parseThrowStatement() {
    this.debug('parseThrowStatement');
    this.expectKeywords('throw');
    const expression = this.parseExpression();
    return new ThrowStatement(expression);
  }
  parseYieldStatement() {
    this.debug('parseYieldStatement');
    let yield_generator = false;

    this.expectKeywords('yield');

    if(this.matchPunctuators('*')) {
      this.expectPunctuators('*');
      yield_generator = true;
    }

    const expression = this.parseExpression();
    return new YieldExpression(expression, yield_generator);
  }

  parseContinueStatement() {
    this.debug('parseContinueStatement');
    this.expectKeywords('continue');
    let id;
    if(this.matchIdentifier()) id = this.expectIdentifier();

    this.expectPunctuators(';');
    return new ContinueStatement(id);
  }

  parseBreakStatement() {
    this.debug('parseBreakStatement');
    this.expectKeywords('break');
    let id;
    if(this.matchIdentifier()) id = this.expectIdentifier();

    this.expectPunctuators(';');
    return new BreakStatement(id);
  }

  parseReturnStatement() {
    this.debug('parseReturnStatement');
    this.log(`parseReturnStatement()`);
    this.expectKeywords('return');
    let expression = null;

    if(!this.matchPunctuators(';')) expression = this.parseAssignmentExpression();
    // console.log('expression:', expression);
    if(this.matchPunctuators(';')) this.expectPunctuators(';');
    return new ReturnStatement(expression);
  }

  parseStatement(insideIteration, insideFunction, exported) {
    this.debug('parseStatement', { insideIteration, insideFunction, exported });
    //Parse Block
    let t = this.token || this.lexer.tokens[this.lexer.tokenIndex];
    let defaultExport = false;
    let stmt;
    //console.log('parseStatement', {  defaultExport});

    if(exported) {
      if(this.matchKeywords('default')) defaultExport = this.expectKeywords('default');
    }

    if(this.matchPunctuators('{')) {
      stmt = this.parseBlock(insideIteration, insideFunction);
    } else if(this.matchPunctuators('@')) {
      stmt = this.parseDecorator();

      //Parse constructor() super[.method](calls)
      /* } else if(insideFunction && (this.matchKeywords("super") || this.matchIdentifier("super"))) {
      return this.parseNewOrCallOrMemberExpression(false, true);
*/
      //Parse Variable Statement
    } else if(this.matchKeywords(['var', 'let', 'const'])) {
      stmt = this.parseVariableStatement();

      if(exported) stmt = new ExportNamedDeclaration(stmt, null);
    } else if(this.matchKeywords('import')) {
      stmt = this.parseImportDeclaration(!insideIteration && !insideFunction);
      //console.log('parseStatement import');
      //Parse Empty Statement
    } else if(this.matchKeywords('class')) {
      stmt = this.parseClass();
    } else if(this.matchPunctuators(';')) {
      this.expectPunctuators(';');
      stmt = new EmptyStatement();
    }

    //Parse If Statement
    else if(this.matchKeywords('if')) {
      stmt = this.parseIfStatement(insideIteration, insideFunction);

      //Parse Iteration Statement
    } else if(this.matchKeywords(['while', 'for', 'do'])) {
      stmt = this.parseIterationStatement(insideFunction);

      //Parse Switch Statement
    } else if(this.matchKeywords('switch')) {
      stmt = this.parseSwitchStatement(insideFunction);
    } else if(this.matchKeywords('try')) {
      stmt = this.parseTryStatement(insideIteration, insideFunction);

      //Parse With Statement
    } else if(this.matchKeywords('throw')) {
      stmt = this.parseThrowStatement();
    } else if(this.matchKeywords('yield')) {
      stmt = this.parseYieldStatement();
    } else if(this.matchKeywords('with')) {
      stmt = this.parseWithStatement(insideIteration, insideFunction);
    } else if(this.matchKeywords('continue')) {
      if(insideIteration) {
        stmt = this.parseContinueStatement();
      }
      throw new Error(`continue; statement can only be inside an iteration`);
    } else if(this.matchKeywords('break')) {
      let brk = this.parseBreakStatement();
      if(!insideIteration && brk.label === undefined)
        throw new Error(`break; statement can only be inside an iteration or with a label`,
          this.position()
        );
      stmt = brk;
    } else if(this.matchKeywords('return')) {
      if(insideFunction) stmt = this.parseReturnStatement();
      else throw new Error(`${this.token.loc} return statement can only be inside a function`);
    } /*if(this.matchAssignmentExpression())*/ //Parse Expression Statement
    else {
      stmt = this.parseExpressionStatement();
      if(stmt instanceof Identifier && this.matchPunctuators(':')) {
        this.expectPunctuators(':');
        stmt = new LabeledStatement(stmt,
          this.parseStatement(insideIteration, insideFunction, exported)
        );

        //console.debug('ExpressionStatement:', stmt);
      }
      if(!stmt) throw new Error('No expression statement');

      if(defaultExport) {
        if(stmt instanceof ClassDeclaration)
          stmt = new AnonymousDefaultExportedClassDeclaration(stmt.id, stmt.superClass, stmt.body);
        else if(stmt instanceof FunctionLiteral)
          stmt = new AnonymousDefaultExportedFunctionDeclaration(stmt.id,
            stmt.params,
            stmt.body,
            stmt.async,
            stmt.generator
          );
        else stmt = new ExportDefaultDeclaration(stmt);
      }
    }

    /* else {
      const { column, line } = this.lexer;
      const tok = t;  //this.token;
      let m = this.matchKeywords('super');
      const { type, value } = tok; //lexer.tokens[0];
    }}
*/
    if(!stmt) {
      const { type, value, lexeme, loc } = this.token;
      throw new Error(`${loc}: Unexpected ${type}-token '${value}'`);
    }

    this.debug('parseStatement', { stmt });
    return stmt;
  }

  parseClass(exported = false) {
    this.debug('parseClass', {
      token: this.token,
      numTokens: this.tokens.length,
      tokens: this.tokens
    });
    this.expectKeywords('class');
    this.debug('parseClass', {
      token: this.token,
      numTokens: this.tokens.length,
      tokens: this.tokens
    });
    //Parse name of the function
    let identifier = null;
    let extending = null;

    if(this.matchIdentifier()) identifier = this.expectIdentifier();

    if(this.matchKeywords('extends')) {
      this.expectKeywords('extends');
      extending = this.parseExpression();
    }

    //Parse class body
    let decl = this.parseObject(true, [identifier, extending]);

    //console.log("parseClass decl=", decl);
    if(this.matchPunctuators(';')) this.expectPunctuators(';');
    //let decl = new ClassDeclaration(identifier, extending, members);

    if(exported) decl = new ExportNamedDeclaration(decl);

    return decl;
  }

  parseParameters() {
    this.debug('parseParameters');
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
      let param, defaultValue;

      if(!rest_of && this.matchPunctuators(['{', '['])) param = this.parseBindingPattern();
      else param = this.expectIdentifier();

      if(!rest_of && this.matchPunctuators('=')) {
        this.expectPunctuators('=');
        defaultValue = this.parseExpression(false, false);
      }

      if(rest_of) param = new RestElement(param);
      else if(defaultValue) param = new FunctionArgument(param, defaultValue);

      params.push(param);
      if(rest_of) break;
      if(rest_of || !this.matchPunctuators(',')) break;
      this.expectPunctuators(',');
    }
    // console.log('parseParameters', params);
    if(parens) this.expectPunctuators(')', params);
    return params;
  }

  parseFunction(exported = false, isAsync = false) {
    this.debug('parseFunction');
    let isGenerator = false;
    let hasKeyword = false,
      hasIdentifier = false;

    if(this.matchKeywords('async')) {
      this.expectKeywords('async');
      isAsync = true;
    }

    if(this.matchKeywords('function')) {
      hasKeyword = true;
      this.expectKeywords('function');
    }

    if(this.matchPunctuators('*')) {
      this.expectPunctuators('*');
      isGenerator = true;
    }

    //Parse name of the function
    let identifier = null;
    if(this.matchIdentifier(true)) {
      hasIdentifier = true;
      identifier = this.expectIdentifier(true);
    }

    if(isAsync && !hasKeyword && !hasIdentifier) {
      //  if(this.matchPunctuators())
      return new Identifier('async');
    }

    let func = this.parseFunctionParametersAndBody(identifier, isAsync, isGenerator);

    if(exported) func = new ExportNamedDeclaration(func);

    return func;
  }

  parseFunctionParametersAndBody(identifier, isAsync = false, isGenerator = false) {
    this.debug('parseFunctionParametersAndBody');
    let parameters = this.parseParameters();

    //Parse function body
    const body = this.parseBlock(false, true, FunctionBody);

    let func = new FunctionDeclaration(identifier, parameters, body, isAsync, isGenerator);

    if(this.matchPunctuators('(')) return this.parseRemainingCallExpression(func);

    return func;
  }

  parseSourceElement() {
    let exported = false;
    this.debug('parseSourceElement');
    if(this.matchKeywords('export')) {
      /*      this.expectKeywords('export');
      exported = true;

      if(this.matchKeywords('default')) */ return this.parseExportDeclaration();
    } else if(this.matchKeywords('class')) {
      return this.parseClass(exported);
    } else if(this.matchKeywords('function')) {
      return this.parseFunction(exported);
    }
    return this.parseStatement(false, false, exported);
  }

  parseProgram() {
    const body = [];

    this.debug('parseProgram');
    body.push(this.parseSourceElement());

    //Check to see if there are more SourceElement
    while(this.matchStatement() || this.matchKeywords('function')) {
      let sourceElement = this.parseSourceElement();

      //console.log("Source element: ", sourceElement);
      body.push(sourceElement);
    }

    const { tokens } = this;
    console.log('this.tokens: ', tokens);
    console.log('this.tokens.length: ', tokens.length);

    if(tokens[0] && tokens[0].type !== 'eof') {
      throw new Error(`Didn't consume all tokens: ${Util.inspect(tokens[0])}`);
    }

    return new Program('module', body);
  }

  static instrumentate = Util.once(instrumentateParser);
}

let depth = 0;
let newNodes = [];
let nodes = [];
let diff = [];
let fns = [];
//var stack = [{methodName: 'parse', tokens:[]}];

const methodNames = [...Util.getMethodNames(ECMAScriptParser.prototype)];
let methods = {};

const quoteArray = arr => (arr.length < 5 ? `[${arr.join(', ')}]` : `[${arr.length}]`);

const quoteList = (l, delim = ' ') =>
  '' + l.map(t => id(typeof t == 'string' ? `'${t}'` : '' + t)).join(delim) + '';
const quoteToks = l => quoteList(l.map(t => t.value));
const quoteObj = i =>
  i instanceof Array
    ? quoteArg(i)
    : Util.className(i) == 'Object'
    ? Object.keys(i)
    : typeof i == 'object'
    ? Util.className(i)
    : `'${i}'`;

const quoteArg = a =>
  a.map(i => (Util.isObject(i) && i.value !== undefined ? i.value : quoteObj(i)));
const quoteStr = s => s.replace(/\n/g, '\\n');

Parser.prototype.trace = function() {
  return this.stack
    .map(frame =>
        `${(frame.tokenIndex + '').padStart(5)} ${frame.position.toString().padStart(6)} ${(frame.methodName +
          '(' +
          quoteList(frame.args || [], ',') +
          ')'
        ).padEnd(50)} ${(frame.tokens || []).join(' ')}`
    )
    .join('\n');
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

  let esfactory = function(...args) {
    let { lexer, stack } = this;
    let { tokenIndex } = lexer;

    //console.log("esfactory instrumentate tokens.length=",this.tokens.length);

    ///parse/.test(methodName) &&
    let position = this.position() || this.lexer.position();
    let depth = this.stack.length;
    let entry = { methodName, start: tokenIndex - this.tokens.length, /*args,*/ position, depth };
    this.stack.unshift(entry);

    let s =
      ('' + position.toString(false)).padEnd((position.file || '').length + 6) +
      ` ${(depth + '').padStart(4)} ${this.stack[0].methodName}`;
    let msg = s + ` ${quoteList(this.stack[depth].tokens || [])}` + `  ${quoteArg(args)}`;

    //if(!/match/.test(methodName)) console.log(msg);
    //console.log('methodName:', methodName);

    let ret = methods[methodName].call(this, ...args);
    let { token } = this;
    let start = this.consumed || 0;
    let firstTok = this.numToks || 0;
    let end = (token && token.pos) || lexer.pos;
    let lastTok = lexer.tokenIndex - this.tokens.length;

    //msg = s + ` ${quoteList(this.stack[depth].tokens)}`;
    entry.end = lastTok;

    if(ret instanceof ESNode) this.onReturnNode(ret, entry, this.stack);

    let tmp = this.stack[0].tokens || [];
    while(this.stack.length > depth) this.stack.shift();
    //if(this.stack[0]) this.stack[0].tokens = this.stack[0].tokens || tmp;

    //if(token) lastTok--;
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

    const objectStr =
      typeof ret == 'object' ? Util.className(ret) /* + `{ ${printer.print(ret)} }`*/ : ret;

    annotate.push(`returned: ${objectStr}`);

    if(lexed.length)
      annotate.push(`lexed[${lexed.map(t => Util.abbreviate(quoteStr(t.value), 40)).join(', ')}]`);
    if(nodes.length) annotate.push(`yielded: ` + quoteArray(newNodes));
    nodes.splice(0, nodes.length);
    depth--;

    if(annotate.length) {
      msg = msg + '    ' + annotate.join(', ');
    }

    if(this.debug) if (ret || !/match/.test(methodName)) console.log(msg);

    return ret;
  };
  return esfactory;
};

function instrumentateParser() {
  let instrumentatedProto = Util.getMethodNames(new ECMAScriptParser(), 2)
    .filter(name => /^(expect|parse)/.test(name))
    .reduce((acc, methodName) => {
      let fn = ECMAScriptParser.prototype[methodName];
      methods[methodName] = fn;

      return { ...acc, [methodName]: instrumentate(methodName, fn) };
    }, {});
  Object.assign(ECMAScriptParser.prototype, instrumentatedProto);
  //  console.log("instrumentateParser", Object.keys(instrumentatedProto), instrumentatedProto.expectLiteral);
}
const timeout = ms =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });

Parser.parse = function parse(sourceText, prefix) {
  const parser = new ECMAScriptParser(sourceText, prefix);
  //Parser.instance = parser;
  //await timeout(1000).catch(e => console.log("timeout error:",e));
  return parser.parseProgram();
};
//console.log("methods:", methodNames);
//console.log("fn:" + ECMAScriptParser.prototype.parseProgram);

export default Parser;
