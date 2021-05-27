import Util from '../util.js';
import inspect from '../objectInspect.js';

import { Lexer, SyntaxError, Location, Token } from './lexer.js';
export { Lexer, SyntaxError, Location, Token } from './lexer.js';

/*import { Lexer, SyntaxError, Location, Token } from '../../quickjs/modules/lib/jslexer.js';
export { Lexer, SyntaxError, Location, Token } from '../../quickjs/modules/lib/jslexer.js';*/

import * as deep from '../deep.js';
import { Stack, StackFrame } from '../../stack.js';
//import util from 'util';
import { TokenList } from './token.js';
import { Printer } from './printer.js';
import { ESNode, Program, Expression, ChainExpression, FunctionLiteral, RegExpLiteral, FunctionBody, Identifier, Super, Literal, TemplateLiteral, TaggedTemplateExpression, TemplateElement, ThisExpression, UnaryExpression, UpdateExpression, BinaryExpression, AssignmentExpression, LogicalExpression, MemberExpression, ConditionalExpression, CallExpression, DecoratorExpression, NewExpression, SequenceExpression, Statement, BlockStatement, StatementList, EmptyStatement, LabeledStatement, ExpressionStatement, ReturnStatement, ContinueStatement, BreakStatement, IfStatement, SwitchStatement, SwitchCase, WhileStatement, DoWhileStatement, ForStatement, ForInStatement, ForOfStatement, WithStatement, TryStatement, CatchClause, ThrowStatement, YieldExpression, ImportDeclaration, ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier, ExportNamedDeclaration, ExportSpecifier, AnonymousDefaultExportedFunctionDeclaration, AnonymousDefaultExportedClassDeclaration, ExportDefaultDeclaration, Declaration, ClassDeclaration, ClassBody, MetaProperty, FunctionDeclaration, ArrowFunctionExpression, VariableDeclaration, VariableDeclarator, ObjectExpression, Property, MethodDefinition, ArrayExpression, JSXLiteral, Pattern, ArrayPattern, ObjectPattern, AssignmentProperty, AssignmentPattern, AwaitExpression, RestElement, SpreadElement, CTORS, Factory } from './estree.js';
import MultiMap from '../container/multiMap.js';
const symbols = {
  enter: '⬊',
  leave: '⬁'
};
const add = (arr, ...items) => [...(arr || []), ...items];
const linebreak = new RegExp('\\r?\\n', 'g');

function GetStack(stack, cond, max = Infinity) {
  stack ??= new Error().stack;
  let st = (stack + '').split(/\n/g);
  let index;
  cond ??= frame => /\s(expect|parse|match)/.test(frame);
  if(cond) {
    if((index = st.findIndex(cond)) != -1) st = st.slice(index);
    else st = st.filter(cond);
  }
  st = st.map(frame => frame.replace(/^\s*at\s+([^ ]+)\s\(([^:]+):([^\)]*)\).*/, '$1 $2:$3'));
  if(Number.isFinite(max)) st = st.slice(0, max);
  return st;
}

globalThis.GetStack = GetStack;

export class Parser {
  lastPos = new Location(null, 1, 1);
  lastTok = 0;
  nodeTokenMap = new WeakMap();
  debug = () => {};

  constructor(sourceText, fileName, debug) {
    this.tokens = [];
    this.processed = [];
    this.lexer = new Lexer(sourceText, fileName, (c, s, e) => this.handleComment(c, s, e));
    this.stack = [];
    this.prefix = fileName ? ` ${fileName}: ` : '';
    //if(debug) this.trace = debug;

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

    this.debug = debug;

    if(0 && debug >= 1)
      this.trace = function debug(...args) {
        if(!/^match/.test(args[0])) return;
        let err = new Error();
        let stack = err.stack.split(/\n/g);
        let frame = [...[...stack[4].matchAll(/\s+at\s+([^ \()]*)\s*\(([^:]*):([0-9]*)/g)][0]]
          .slice(1)
          .map(p => (!isNaN(+p) ? +p : p));
        let [fn, file, line] = frame;
        console.log(`TRACE[${stack.length / 3}]`, // `${fn} @ ${file.replace(/.*\//g, '')}:${line}`.padEnd(50),
          this.lexer.loc + '',
          ...args,
          this.tokens.map(tok => tok + '')
        );
      };

    if(debug > 2) {
      //      this.trace = function debug(...args) {};

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
                console.log(`${symbols.leave}[${locStack.length}]`,
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
                    prevStack = st;
                  }
                }
                console.log(`${symbols.enter}[${locStack.length}]`,
                  (token ?? lexer).loc + '',
                  inspect({ name, arg }, { compact: 10 })
                );
              }
            }
          );
        }
      }
    }
    this.trace ??= function debug(...args) {};
  }

  error(errorMessage, astNode) {
    const pos = this.position();

    return new /*Syntax*/ Error(`${pos}: ${errorMessage}`);
  }

  handleComment(comment, start, end) {
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
      let position;
      if(this && this.stack && this.stack[0]) {
        assoc.position = this.stack[0].position;
        this.lastPos = this.stack[0].position;
      }
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

    if(!this.assoc) this.assoc = Util.weakMapper(() => ({}), new WeakMap());

    let obj = this.assoc(node /*, {}*/);

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
    Object.assign(obj, {
      range: positions,
      tokenRange: range /*, tokens*/,
      comments
    });

    if(tokens[0]?.loc) {
      const { loc } = tokens[0];
      obj.loc = loc;
      Object.defineProperty(node, 'loc', {
        value: loc,
        enumerable: false,
        configurable: true
      });
    }
  }

  addCommentsToNodes(root) {
    if(this.comments.length == 0) return;
    let nodes = new Map();
    for(let [node, path] of deep.r(root, n => n instanceof ESNode)) {
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
        throw new Error(`Comment ${comment.position} '${comment.value.replace(linebreak, "\\n")}' length (${comment.value.length}) > ${maxLen}: ${trail.replace(linebreak, "\\n")}\nNext token: ${tokens[0]}\nLast token: ${tokens[tokens.length-1]}`);
      }*/

        assoc.comments = add(assoc.comments, comment);
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

  lex() {
    let { done, value } = this.lexer.next();

    if(done) return null;
    /*if(1) {
      const { id, type, lexeme, start, end, length, loc } = value;
    }*/
    return value;
  }

  /*
   * Lexer Interactions
   */
  //Returns the next token
  next() {
    let token;

    if(!(token = this.tokens[0] ?? this.gettok()))
      return (this.token = {
        type: 'eof',
        id: -1,
        value: null,
        loc: this.lexer.loc
      });

    this.pos = token.loc;
    this.token = this.tokens[0];
    //console.debug("token:", this.token, "pos:", this.pos);
    return token;
  }

  revert() {
    const { lexer, tokens } = this;
    let to;
    if((to = tokens[0])) {
      lexer.back(to.loc);

      tokens.splice(0, tokens.length);
    }
  }
  gettok(state) {
    let token;

    for(;;) {
      token = this.lex(state);
      if(token) {
        // this.trace('token:', token);
        if(token.type == 'whitespace') continue;
        if(token.type == 'comment') continue;
        Object.defineProperty(token, 'stack', {
          value: new Stack(null, (fr, i) => !/esfactory/.test(fr) && i > 2),
          enumerable: false
        });
      }
      break;
    }
    if(!token) return token;
    this.tokens.push(token);
    return token;
  }

  lookahead(offset = 0) {
    let token;
    while(this.tokens.length <= offset) {
      if(!this.gettok()) break;
    }
    let ret = this.tokens[offset] ?? { type: 'eof', value: null, id: -1 };
    return ret;
  }

  consume() {
    //console.log(`consume(1)`);
    const { tokens, processed } = this;
    if(tokens.length === 0) this.next();
    const token = tokens.shift();
    processed.push(token);
    if(typeof Parser.onToken == 'function') Parser.onToken(token);
    if(tokens.length == 0) this.next();
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
        .replace(linebreak, '\\n')
        .substring(0, 6);
    }
    if(token) return `"${buf}"${Util.pad(buf, 6)} ${pos}${Util.pad(pos, 10)}`;
    return '';
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
      this.printtoks()
    ]);
  }

  position(tok = null) {
    let pos = tok ? tok.pos : this.pos;
    return this.lexer.position(pos || this.lexer.pos);
  }

  get tokenIndex() {
    return this.processed.length+this.tokens.length;
  }

  addNode(ctor, ...args) {
    let node = new ctor(...args);

    /*let { processedIndex = 0 } = this;
    console.log('node:',
      Util.className(node).padEnd(30),
      'processed:',
      this.processed.slice(processedIndex).map(tok => tok.lexeme)
    );

    this.processedIndex = this.processed.length;*/

    return node;
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
    type === 'booleanLiteral' /* ||
    type === 'templateLiteral'*/
  );
}

function isTemplateLiteral({ type }) {
  return type === 'templateLiteral';
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
    //this.log('' + name + '(' + args.map(a => toStr(a)).join(', ') + ')');
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

  expectIdentifier(no_keyword = false, private_id = false) {
    //this.log(`expectIdentifier(no_keyword=${no_keyword})`);
    const token = this.consume();

    if(token.type != 'nullLiteral')
      if(!(
          token.type === 'identifier' ||
          (private_id && token.type === 'privateIdentifier') ||
          (no_keyword && token.type == 'keyword')
        )
      ) {
        throw new Error(`Expecting <Identifier> but got <${token.type}> with value '${token.value}'`
        );
      }
    //this.log(`expectIdentifier2(no_keyword=${no_keyword})`);

    return new Identifier(token.value);
  }

  expectKeywords(keywords) {
    const token = this.consume();
    this.trace('expectKeywords', { keywords, token });
    //console.log('expectKeywords', {keywords, tokens: [...this.processed, ...this.tokens].slice(-4).map(t => t + '') });

    if(token.type !== 'keyword' &&
      token.type !== 'identifier' &&
      (!Array.isArray(keywords) || keywords.length == 0)
    )
      throw new SyntaxError(` Expecting Keyword(${keywords}), but got ${token.type} with value '${token.value}'`
      );

    if(keywords.indexOf(token.value) < 0) {
      throw new Error(`Expected: ${keywords.join(' ')}    Actual: ${token.value || token.type}`);
      return false;
    }

    return token;
  }

  expectPunctuators(punctuators, ast) {
    //console.log(`expectPunctuators(1)`, { punctuators });
    const token = this.consume();
    //console.log(`expectPunctuators(2)`, { token });
    if(token.type !== 'punctuator') {
      throw new Error(`Expecting Punctuator([ ${punctuators.map(p => `'${p}'`).join(', ')} ]), but got ${
          token.type
        } with value '${token.value}'`,
        ast
      );
    }
    if(Array.isArray(punctuators)) {
      if(punctuators.indexOf(token.value) < 0) {
        throw new Error(`Expected: ${punctuators.join(' ')}    Actual: ${token.value}`, ast);
      }
    } else if(punctuators !== token.lexeme) {
      throw new Error(`Expected: ${punctuators} Actual: ${token.lexeme}`, ast);
    }
    //console.log(`expectPunctuators(3)`, { token, punctuators });
    return token;
  }

  expectLiteral() {
    //this.log('expectLiteral() ');
    // if(this.matchTemplateLiteral()) return this.parseTemplateLiteral();

    let token = this.consume();
    if(!isLiteral(token)) {
      throw new Error(`Expecting Literal, but got ${token.type} with value '${token.value}'`);
    }

    let value = token.lexeme;
    if(token.type == 'regexpLiteral') {
      const value = token.lexeme;
      const [start, end] = [value.indexOf('/'), value.lastIndexOf('/')];
      const pattern = value.substring(start + 1, end);
      const flags = value.substring(end + 1);
      return new RegExpLiteral(pattern, flags);
    }
    let str = this.lexer.source.slice(token.loc.pos, token.loc.pos + token.length);
    //console.log('expectLiteral', { type: token.type });
    let val = {
      stringLiteral: String,
      templateLiteral: String,
      numericLiteral: Number,
      booleanLiteral: Boolean,
      nullLiteral: () => null,
      regexpLiteral: RegExp
    }[token.type](value);
    let ret = new Literal(str ?? value, val);
    //console.log('expectLiteral', { str, val, ret });
    return ret;
  }

  parseTemplateLiteral() {
    this.trace('parseTemplateLiteral');
    let i = 0,
      expressions = [],
      quasis = [];
    let loc = (this.tokens[0] || this.lexer).loc;

    let seed = Util.randInt(0, 0xffffffff);

    //console.log(`parseTemplateLiteral[${i}] ${seed}`, this.lexer.stateStack, (`\n` + [...Util.getCallerStack()] .filter(frame => !/^(call|esfactory)/.test(frame + '')) .join('\n') ).replace(/\n/g, '\n  '));

    this.templateLevel = this.templateLevel || 0;
    this.templateLevel++;

    while(true) {
      let token = this.consume();
      //console.log(`parseTemplateLiteral[${i}] ${seed}`, { token });
      const tail = (i > 0 || token.lexeme.length > 1) && token.lexeme.endsWith('`');

      const do_expression = token.lexeme.endsWith('${');

      let raw = do_expression ? token.lexeme.slice(0, -2) : token.lexeme;
      raw = raw.slice(raw.startsWith('`') ? 1 : 0, raw.endsWith('`') ? -1 : raw.length);

      const cooked = raw.replace(/\\n/g, '\n');

      quasis.push(this.addNode(TemplateElement, tail, raw, cooked));

      //console.log(`parseTemplateLiteral[${i}] ${seed}`, { tail, quasis });

      if(tail) break;

      if(do_expression) {
        //console.log(`parseTemplateLiteral[${i}] ${seed}`, {token: this.next() });
        let node = this.parseAssignmentExpression();
        //console.log(`parseTemplateLiteral[${i}] ${seed}`, { node });
        expressions.push(node);
        const { lexer } = this;
        //console.log(`lexer.loc`, lexer.loc + '');
        const { start, pos, stateDepth } = lexer;
        if(lexer.stateDepth >= 2 && lexer.topState() == 'INITIAL') lexer.popState();
        if(this.tokens[0].lexeme == '}') {
          this.tokens.shift();
          this.next();
        }
      }

      i++;
    }
    //console.log(`parseTemplateLiteral[${i}] ${seed}`, 'break');
    //console.log(`parseTemplateLiteral[${i}] ${seed}`, {quasis, expressions, loc: loc + ''});
    this.templateLevel--;

    let node = this.addNode(TemplateLiteral, quasis, expressions);
    return node;
  }

  matchKeywords(keywords) {
    this.trace('matchKeywords', keywords);
    const token = this.next();
    let ret;

    // if(keywords == 'switch' || keywords[0] == 'switch') console.log('matchKeywords', { keywords, token });

    if(token.type != 'keyword' && token.type != 'identifier') ret = false;
    else {
      if(Array.isArray(keywords)) ret = keywords.indexOf(token.lexeme) >= 0;
      else ret = keywords === token.value || keywords === token.lexeme;
    }

    return ret;
  }

  matchPunctuators(punctuators) {
    this.trace('matchPunctuators');
    const token = this.next();
    let ret;
    if(token.type !== 'punctuator') ret = false;
    else if(Array.isArray(punctuators)) ret = punctuators.indexOf(token.lexeme) >= 0;
    else ret = punctuators === token.value;
    return ret;
  }

  matchIdentifier(no_keyword = false, private_id = false) {
    this.trace('matchIdentifier', { no_keyword });
    const token = this.next();
    return (token.type === 'identifier' ||
      (private_id && token.type == 'privateIdentifier') ||
      (no_keyword && token.type === 'keyword')
    );
  }

  matchLiteral() {
    const token = this.next();
    this.trace('matchLiteral', token.type);
    return isLiteral(token);
  }

  matchTemplateLiteral() {
    this.trace('matchTemplateLiteral');
    const token = this.next();
    return isTemplateLiteral(token) && token.lexeme.startsWith('`');
  }

  matchStatement() {
    this.trace('matchStatement');
    return (this.matchPunctuators([';']) ||
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
    this.trace('matchPrimaryExpression');
    return (this.matchKeywords(['this', 'async', 'super']) ||
      this.matchPunctuators(['(', '[', '{', '<', '...']) ||
      this.matchLiteral() ||
      this.matchTemplateLiteral() ||
      this.matchIdentifier()
    );
  }

  matchUnaryExpression() {
    this.trace('matchUnaryExpression');
    return (this.matchKeywords(['delete', 'void', 'typeof', 'await' /*, 'yield'*/]) ||
      this.matchPunctuators(['++', '--', '+', '-', '~', '!'])
    );
  }

  matchAssignmentExpression() {
    this.trace('matchAssignmentExpression');
    return (this.matchUnaryExpression() ||
      this.matchLeftHandSideExpression() ||
      this.matchFunctionExpression() ||
      this.matchKeywords(['class'])
    );
  }

  matchFunctionExpression() {
    this.trace('matchFunctionExpression',
      this.tokens,
      this.processed.map(tok => tok + '')
    );
    let token = this.lookahead(0);
    const is_async = token.value == 'async';
    token = this.lookahead(is_async ? 1 : 0);
    // Util.exit(1);
    return this.matchKeywords('function') || (token && token.value == 'get');
  }

  matchMemberExpression() {
    this.trace('matchMemberExpression');

    return this.matchPrimaryExpression() || this.matchKeywords('new') || this.matchKeywords('this');
  }

  matchLeftHandSideExpression() {
    this.trace('matchLeftHandSideExpression');
    return this.matchMemberExpression(...arguments);
  }

  /*
   * Actual recursive descent part of things
   */

  parsePrimaryExpression() {
    this.trace('parsePrimaryExpression');
    let is_async = false,
      rest_of = false;
    let expr = null;
    if(this.matchKeywords('async')) {
      is_async = true;
      this.expectKeywords('async');
    } else if(this.matchIdentifier() && this.token.value == 'async') {
      is_async = true;
      this.expectIdentifier();
    } else if(this.matchPunctuators(['...'])) {
      rest_of = true;
      this.expectPunctuators(['...']);
    }

    if(!is_async && this.matchKeywords('this')) {
      this.expectKeywords('this');
      expr = this.addNode(ThisExpression);
    } else if(this.matchKeywords('class')) {
      expr = this.parseClass();
    } else if(/*is_async && */ this.matchKeywords('function')) {
      expr = this.parseFunction(false, is_async);
    } else if(this.matchPunctuators(['{'])) {
      expr = this.parseObject();
    } else if(this.matchPunctuators(['['])) {
      expr = this.parseArray();
    } else if(!is_async && this.matchPunctuators(['<'])) {
      expr = this.parseJSX();
    } else if(!is_async && (this.matchLiteral() || this.matchTemplateLiteral())) {
      if(this.matchTemplateLiteral()) expr = this.parseTemplateLiteral();
      else expr = this.expectLiteral();
    } else if(this.matchKeywords('super')) {
      this.expectKeywords('super');
      expr = this.addNode(Super);
    } else if(this.matchKeywords('import')) {
      expr = this.parseImportDeclaration(false);
    } else if(this.matchPunctuators(['('])) {
      this.expectPunctuators(['(']);

      let expression = [];
      let parentheses = this.matchPunctuators(['(']);

      if(!this.matchPunctuators([')'])) expression = this.parseExpression(false, true);
      console.log('expression:', expression);
      console.log('this.next():', this.next());

      this.expectPunctuators([')']);

      if(this.matchPunctuators(['=>'])) {
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
        //expression = this.addNode(SequenceExpression, [expression]);
      } else if(!(expression instanceof SequenceExpression))
        expression = this.addNode(SequenceExpression, [expression]);

      //    if(parentheses) this.expectPunctuators([')']);

      // if( expression instanceof ArrowFunctionExpression  || parentheses)
      expr = expression;
    } else if(this.matchIdentifier(true)) {
      let id = this.expectIdentifier(true);

      if(this.matchPunctuators(['=>'])) {
        id = this.parseArrowFunction([id], is_async);
        id = this.addNode(SequenceExpression, [id]);
      }

      expr = id;
    } else if(is_async) {
      expr = new Identifier('async');
    } else {
      //console.log('parsePrimaryExpression', this.tokens.map(tok => tok + ''));

      throw new Error(`${this.token.position}: Unexpected token '${this.token}'`);
    }
    if(rest_of) {
      expr = this.addNode(RestElement, expr);
    }
    return expr;
  }

  parseArguments() {
    this.trace('parseArguments');
    const args = [],
      parser = this;
    let rest_of = false;
    function checkRestOf() {
      //console.log('parseArguments', { tokens: parser.tokens.map(t => t + '') });
      if(parser.matchPunctuators(['...'])) {
        parser.expectPunctuators(['...']);
        rest_of = true;
      } else {
        rest_of = false;
      }
    }
    this.expectPunctuators(['(']);
    while(true) {
      checkRestOf();

      //console.log('parseArguments(2)', {args, tokens: this.tokens.map(t => t + '') });
      if(!this.matchAssignmentExpression()) break;
      let arg = this.parseAssignmentExpression();
      if(rest_of) arg = this.addNode(RestElement, arg);
      args.push(arg);
      //if(rest_of) break;
      if(this.matchPunctuators([','])) {
        this.expectPunctuators([',']);
        continue;
      }
      break;
    }
    this.expectPunctuators([')']);
    //console.log('parseArguments', args[0], {args, tokens: this.tokens.map(t => t + ''), loc: this.tokens[0].loc + ''});
    return args;
  }

  parseRemainingMemberExpression(object) {
    this.trace('parseRemainingMemberExpression(1)', { object });
    while(this.matchPunctuators(['.', '[', '?.'])) {
      let optional;
      optional = this.matchPunctuators(['?.']);
      if(optional) this.expectPunctuators(['?.']);
      if(this.matchPunctuators(['['])) {
        this.expectPunctuators(['[']);
        const expression = this.parseExpression(true);
        this.expectPunctuators([']']);
        object = this.addNode(MemberExpression, object, expression, true, optional);
      } else if(optional && this.matchPunctuators(['('])) {
        object = this.parseRemainingCallExpression(object, false, true);
      } else if(optional || this.matchPunctuators(['.'])) {
        if(!optional) this.expectPunctuators(['.']);
        const identifier = this.expectIdentifier(true, object instanceof ThisExpression);
        if(object === null) throw new Error('Object ' + object);
        if(object instanceof Identifier && (object.name == 'new' || object.name == 'import'))
          object = this.addNode(MetaProperty, object, identifier);
        else object = this.addNode(MemberExpression, object, identifier, false, optional);
      }

      if(object.optional === true) object = new ChainExpression(object);
    }
    return object;
  }

  parseArrowFunction(args, is_async = false) {
    this.trace('parseArrowFunction');
    this.expectPunctuators(['=>']);
    let body;

    if(this.matchPunctuators(['{'])) body = this.parseBlock(false, true);
    else body = this.parseAssignmentExpression();

    //&', args);

    //parseArrow
    if(args instanceof SequenceExpression) args = args.expressions;

    if(!Util.isArray(args)) args = [args];

    args = args.map(arg => {
      if(arg instanceof ObjectPattern) {
      }
      return arg;
    });

    return this.addNode(ArrowFunctionExpression, args, body, is_async);
  }

  parseRemainingCallExpression(object, is_async = false, optional = false) {
    this.trace('parseRemainingCallExpression');
    /* let args = this.parseArguments();

*/
    while(this.matchTemplateLiteral() || this.matchPunctuators(['.', '[', '('])) {
      if(this.matchPunctuators(['.', '?.'])) {
        this.expectPunctuators(['.', '?.']);
        const identifier = this.expectIdentifier(true);
        const optional = this.matchPunctuators(['?.']);
        object = this.addNode(MemberExpression,
          object,
          new Literal(identifier.toString()),
          false,
          optional
        );
      } else if(this.matchPunctuators(['['])) {
        this.expectPunctuators(['[']);
        const expression = this.parseExpression();
        this.expectPunctuators([']']);
        object = this.addNode(MemberExpression, object, expression, true);
      } else if(this.matchPunctuators(['('])) {
        let args = this.parseArguments();
        if(this.matchPunctuators(['=>'])) object = this.parseArrowFunction(args, is_async);
        else object = this.addNode(CallExpression, object, args, optional);
      } else if(this.matchTemplateLiteral()) {
        let arg = this.parseTemplateLiteral();

        object = this.addNode(CallExpression, object, arg);
      }
    }
    return object;
  }

  parseNewOrCallOrMemberExpression(couldBeNewExpression, couldBeCallExpression) {
    this.trace('parseNewOrCallOrMemberExpression');
    let do_await = false,
      is_async = false;
    if(this.matchKeywords('await')) {
      do_await = true;
      this.expectKeywords('await');
    }
    //this.log(`parseNewOrCallOrMemberExpression(${couldBeNewExpression}, ${couldBeCallExpression})`);
    let object = null;
    if(!is_async && this.matchKeywords('new') && couldBeNewExpression) {
      this.expectKeywords('new');
      if(this.matchPunctuators(['.'])) {
        object = new Identifier('new');
      } else {
        const result = this.parseNewOrCallOrMemberExpression(true, false);
        couldBeNewExpression = result.couldBeNewExpression;
        let args = [];
        if(!couldBeNewExpression || this.matchPunctuators(['('])) {
          args = this.parseArguments();
          couldBeNewExpression = false;
        }
        object = this.addNode(NewExpression, result.object, args);
      }
    } else {
      //  console.log('parseNewOrCallOrMemberExpression', { token: this.next() });
      this.lexer.pushState('NOREGEX');

      object = this.parsePrimaryExpression();
      this.lexer.popState('NOREGEX');

      //console.log('parseNewOrCallOrMemberExpression', { object });
    }
    object = this.parseRemainingMemberExpression(object);
    let id = object;
    if((this.matchPunctuators(['(']) || this.matchTemplateLiteral()) && couldBeCallExpression) {
      couldBeNewExpression = false;
      object = this.parseRemainingCallExpression(object, is_async);
    }
    if(do_await) {
      object = this.addNode(AwaitExpression, object);
    }
    return { object, couldBeNewExpression };
  }

  parseLeftHandSideExpression() {
    this.trace('parseLeftHandSideExpression');
    //this.log(`parseLeftHandSideExpression()`);
    let { object, couldBeNewExpression } = this.parseNewOrCallOrMemberExpression(true, true);

    return object;
  }

  parsePostfixExpression() {
    this.trace('parsePostfixExpression');
    //this.log(`parsePostfixExpression()`);
    let lhs = true;
    let expression = this.parseLeftHandSideExpression();

    //TODO: Deny line terminator here
    if(this.matchPunctuators(['++', '--'])) {
      lhs = false;
      let operator = this.expectPunctuators(['++', '--']);
      expression = this.addNode(UpdateExpression, operator.value, expression, false);
    }
    return { ast: expression, lhs };
  }

  parseUnaryExpression() {
    this.trace('parseUnaryExpression');
    //this.log(`parseUnaryExpression()`);
    const unaryKeywords = ['delete', 'void', 'typeof', 'await'];
    const unaryPunctuators = ['++', '--', '+', '-', '~', '!'];

    if(this.matchKeywords(unaryKeywords)) {
      const operatorToken = this.expectKeywords(unaryKeywords);
      const argument = this.parseUnaryExpression();
      return {
        ast: this.addNode(UnaryExpression, operatorToken.value, argument.ast, true),
        lhs: false
      };
    } else if(this.matchPunctuators(unaryPunctuators)) {
      const operatorToken = this.expectPunctuators(unaryPunctuators);
      const argument = this.parseUnaryExpression();
      let ast;
      /*if(operatorToken.value === "++" || operatorToken.value === "--") {
        ast = this.addNode(UpdateExpression, operatorToken.value, argument.ast, true);
      } else*/ {
        ast = this.addNode(UnaryExpression, operatorToken.value, argument.ast, true);
      }
      return { ast, lhs: false };
    }
    return this.parsePostfixExpression();
  }

  //Uses precedence climbing to deal with binary expressions, all of which have
  //left-to-right associtivity in this case.
  parseBinaryExpression(minPrecedence) {
    this.trace('parseBinaryExpression');
    //console.log(`parseBinaryExpression`, this.lexer.stateStack);

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
      '**',
      '??'
    ];
    const result = this.parseUnaryExpression();

    if(result.ast == null) {
      if(!this.matchPunctuators(['}'])) return result;
      throw new Error(`${this.position()} ${this.token}`);
    }
    let { ast, lhs } = result;

    this.lexer.pushState('NOREGEX');
    this.matchPunctuators(punctuators);
    this.lexer.popState('NOREGEX');

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

      if(right.ast == null) right.ast = this.parseFunction();

      if(right.ast == null) return { ast, lhs };

      if(operatorToken.value === '||' || operatorToken.value === '&&') {
        ast = this.addNode(LogicalExpression, operatorToken.value, ast, right.ast);
      } else {
        ast = this.addNode(BinaryExpression, operatorToken.value, ast, right.ast);
      }
    }
    let ret = { ast, lhs };
    //console.log(`parseBinaryExpression`, { ret });

    return ret;
  }
  grep;

  parseConditionalExpression() {
    //console.log(`parseConditionalExpression`);
    let result = this.parseBinaryExpression(0);
    //console.log('parseConditionalExpression result:', result); //  if(result.ast == undefined) result = { ast: result, lhs: false };
    let ast = result.ast;
    let lhs = result.lhs;
    if(!ast) {
      ast = new Identifier('undefined');
      //throw new Error(`ConditionalExpression no ast`);
    }

    if(this.matchPunctuators(['?'])) {
      this.expectPunctuators(['?']);
      const consequent = this.parseAssignmentExpression();
      //this.log('consequent: ', consequent);
      this.expectPunctuators([':']);
      const alternate = this.parseAssignmentExpression();
      ast = this.addNode(ConditionalExpression, ast, consequent, alternate);
      lhs = false;
    }
    let ret = { ast, lhs };
    //console.log(`parseConditionalExpression`, { ret });
    return ret;
  }

  parseAssignmentExpression() {
    this.trace('parseAssignmentExpression');
    //console.log(`parseAssignmentExpression`, {tokens: this.tokens.map(t => t + '') });

    if(this.matchPunctuators(['{'])) {
      return this.parseObject();
    }
    //Won't know immediately whether to parse as ConditionalExpression or
    //LeftHandSideExpression. We'll only know later on during parsing if we
    //come across things that cannot be in LeftHandSideExpression.
    const result = this.parseConditionalExpression();

    if(!this.matchPunctuators(['}'])) {
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
          '|=',
          '??=',
          '||=',
          '&&='
        ];
        if(this.matchPunctuators(assignmentOperators) ||
          assignmentOperators.indexOf(this.token.value) != -1
        ) {
          const left = result.ast;
          const operatorToken = this.expectPunctuators(assignmentOperators);
          const right = this.parseExpression();
          result.ast = this.addNode(AssignmentExpression, operatorToken.value, left, right);
        }
      }
    }
    //console.log(`parseAssignmentExpression`, { result });
    return result.ast;
  }

  parseExpression(optional, sequence = true) {
    //console.log(`parseExpression`);
    const expressions = [];
    let ret,
      expression = this.parseAssignmentExpression();

    //this.trace('parseExpression', { expression });

    if(expression !== null) {
      expressions.push(expression);
    } else if(!optional) {
      const token = this.next();
      throw new Error(`Expecting AssignmentExpression, but got ${token.type} with value '${token.value}'`
      );
    }
    let i = 0;

    if(sequence)
      while(this.matchPunctuators([','])) {
        this.expectPunctuators([',']);
        expression = this.parseAssignmentExpression();
        if(expression !== null) {
          expressions.push(expression);
        } else if(!optional) {
          const token = this.next();
          throw new Error(`Expecting AssignmentExpression, but got ${token.type} with value '${token.value}'`
          );
        }
      }
    if(/*sequence || */ expressions.length > 1) {
      ret = this.addNode(SequenceExpression, expressions);
    } else if(expressions.length === 1) {
      ret = expressions[0];
    } else if(optional) {
      ret = null;
    }

    return ret;

    //  throw new Error(`Shouldn't ever be here`, this.position());
  }

  parseBindingPattern() {
    this.trace('parseBindingPattern');
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
        if((rest = this.matchPunctuators(['...']))) this.expectPunctuators(['...']);

        if(!is_array && this.matchPunctuators(['['])) {
          this.expectPunctuators(['[']);
          property = element = this.parseAssignmentExpression();
          computed = true;

          this.expectPunctuators([']']);
        } else {
          if(this.matchIdentifier(true)) property = element = this.expectIdentifier(true);
        }

        if(rest) {
          property = this.addNode(RestElement, property);
        } else {
          if(this.matchPunctuators([':'])) {
            this.expectPunctuators([':']);

            if(this.matchPunctuators(['{', '['])) element = this.parseBindingPattern();
            else element = this.expectIdentifier();
          } else if(this.matchKeywords('as')) {
            this.expectKeywords('as');
            element = this.expectIdentifier();
          }

          if(this.matchPunctuators(['='])) {
            this.expectPunctuators(['=']);
            element = this.addNode(AssignmentPattern, element, this.parseAssignmentExpression());
          }

          if(element)
            if(property.name == (element instanceof AssignmentPattern ? element.left : element).name
            )
              shorthand = true;

          property = this.addNode(AssignmentProperty, property, element, shorthand, computed);
        }
      }

      props.push(property);

      if(this.expectPunctuators(['}', ']', ',']).value != ',') break;
    }
    if(ctor == ArrayPattern) {
      props = props.map(element =>
        element.type == 'Property' && element.key === undefined && element.value === undefined
          ? null
          : element
      );
    }
    return new ctor(props);
  }

  /*
   * VariableDeclaration
   *    | BindingIdentifier[?Yield]Initializer[?In, ?Yield]opt
   *    | BindingPattern[?Yield]Initializer[?In, ?Yield]
   */
  parseVariableDeclaration() {
    this.trace('parseVariableDeclaration');
    let identifier = null;

    //this.log(`parseVariableDeclaration()`);

    if(this.matchPunctuators(['{', '['])) identifier = this.parseBindingPattern();
    else identifier = this.expectIdentifier(true);

    let assignment = null;

    if(this.matchPunctuators(['='])) {
      this.expectPunctuators(['=']);
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
    this.trace('parseVariableDeclarationList');
    //this.log(`parseVariableDeclarationList()`);
    const declarations = []; //Destructuring not yet on by default in nodejs
    let declarator = this.parseVariableDeclaration();
    let identifier = declarator.identifier;
    let assignment = declarator.assignment;
    declarations.push(this.addNode(VariableDeclarator, identifier, assignment));
    while(this.matchPunctuators([','])) {
      this.expectPunctuators([',']);
      declarator = this.parseVariableDeclaration();
      identifier = declarator.identifier;
      assignment = declarator.assignment;
      declarations.push(this.addNode(VariableDeclarator, identifier, assignment));
    }
    let decl = this.addNode(VariableDeclaration, declarations, kind, exported);

    return decl;
  }

  parseBlock(insideIteration, insideFunction, ctor = BlockStatement) {
    this.trace(`parseBlock`, { insideIteration, insideFunction, ctor });
    const statements = [];
    this.expectPunctuators(['{']);
    do {
      this.trace(`parseBlock`, { token: this.token.lexeme });
      if(this.matchStatement()) {
        let stmt;

        stmt = this.parseStatement(insideIteration, insideFunction);
        statements.push(stmt);
        this.trace(`parseBlock`, { stmt });
      }
    } while(!this.matchPunctuators(['}']));
    this.expectPunctuators(['}']);

    return new ctor(statements);
  }

  parseList(insideIteration = false, insideFunction = false, check = p => false) {
    this.trace('parseList');
    //this.log(`parseList()`);

    const statements = [];
    while(this.matchStatement()) {
      if(check(this)) break;
      statements.push(this.parseStatement(insideIteration, insideFunction));
      if(check(this)) break;
    }
    return this.addNode(StatementList, statements);
  }

  parseObject(isClass = false, args = []) {
    //let ctor = ObjectExpression;
    let ctor = isClass ? ClassDeclaration : ObjectExpression;
    const parser = this;
    this.trace('parseObject', ctor, isClass);
    //this.log(`parseObject()`);
    let properties = [];
    this.expectPunctuators(['{']);
    while(!this.matchPunctuators(['}'])) {
      let kind = 'init';
      let _static = false;
      let spread = false;
      let member = null,
        value = null;
      let is_async = false,
        is_generator = false,
        computed = false;
      //let isGenerator = false;
      if(this.matchPunctuators(['...'])) {
        this.expectPunctuators(['...']);
        spread = true;
      }
      if(spread) {
        value = this.parseAssignmentExpression();
        value = this.addNode(SpreadElement, value);
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
          if(!this.matchPunctuators(['('])) {
            member = null;
            kind = getOrSet;
          }
        }
        if(this.matchPunctuators(['*'])) {
          this.expectPunctuators(['*']);
          is_generator = true;
        }
        if(!member) {
          if(this.matchIdentifier(true, isClass)) {
            member = this.expectIdentifier(true, isClass);
          } else if(this.matchPunctuators(['['])) {
            this.expectPunctuators(['[']);
            member = this.parseAssignmentExpression();
            computed = true;
            this.expectPunctuators([']']);
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
        } else if(this.matchPunctuators(['('])) {
          value = this.parseFunctionParametersAndBody(member, is_async, is_generator);
          if(value.id) member = value.id;
        } else if(this.matchPunctuators(['='])) {
          this.expectPunctuators(['=']);
          value = this.parseAssignmentExpression();
          if(this.matchPunctuators([';'])) this.expectPunctuators([';']);
          if(!isClass) ctor = ObjectPattern;
        } else if(this.matchPunctuators([':'])) {
          this.expectPunctuators([':']);
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
          this.addNode(Property,
            id,
            value,
            kind,
            value instanceof FunctionLiteral,
            id.name && value.name && id.name === value.name,
            !(id instanceof Identifier)
          );
        if(ctor === ObjectPattern)
          memberCtor = (id, value, element) => new BindingProperty(id, element, value);
        else if(/*!(value instanceof FunctionDeclaration) && */ isClass)
          memberCtor = (id, value, _, kind) =>
            this.addNode(MethodDefinition, id, value, kind, false, _static);
        if(spread) member = this.addNode(SpreadElement, value);
        else if((value !== null && member != null && member.id === undefined) || kind != 'method')
          member = memberCtor(member, value, null, kind);
        properties.push(member);
      }
      if(this.matchPunctuators(['}'])) break;
      if(this.matchPunctuators([','])) this.expectPunctuators([',']);
    }
    this.expectPunctuators(['}']);
    if(ctor === ObjectPattern) {
      if(!(properties instanceof Array))
        properties = Object.entries(properties).map(([key, value]) =>
            new BindingProperty(new Identifier(key),
              value ? new Identifier(value) : new Identifier(key)
            )
        );
    }
    let ret = new ctor(...[...args, ctor === ClassDeclaration ? this.addNode(ClassBody, properties) : properties]
    );
    if(this.matchPunctuators(['?.', '.'])) ret = this.parseRemainingMemberExpression(ret);

    function BindingProperty(property, id, initializer) {
      let shorthand = (id ?? property) === property;
      console.log('BindingProperty', { id, initializer, property, shorthand });
      if(initializer &&
        !(initializer instanceof Identifier &&
          property instanceof Identifier &&
          Identifier.string(initializer) == Identifier.string(property)
        )
      ) {
        id = parser.addNode(AssignmentPattern, id ?? property, initializer);
      }
      return parser.addNode(AssignmentProperty, property, id ?? property, shorthand);
    }
    return ret;
  }

  parseArray() {
    this.trace('parseArray');
    //this.log(`parseArray()`);
    let object,
      members = [];
    this.expectPunctuators(['[']);

    while(!this.matchPunctuators([']'])) {
      let spread = false,
        element;

      if(this.matchPunctuators([','])) {
        this.expectPunctuators([',']);
        members.push(null);
        continue;
      }

      if(this.matchPunctuators(['...'])) {
        this.expectPunctuators(['...']);
        spread = true;
      }

      //if(this.matchAssignmentExpression()) {
      element = this.parseAssignmentExpression();
      //}

      if(spread) {
        element = this.addNode(SpreadElement, element);
      }

      members.push(element);

      if(this.matchPunctuators([','])) this.expectPunctuators([',']);
    }
    this.expectPunctuators([']']);
    object = this.addNode(ArrayExpression, members);

    /*
    if(this.matchPunctuators(".")) {
      object = this.parseRemainingMemberExpression(object);
    }*/
    return object;
  }

  parseJSXTag() {
    this.trace('parseJSXTag');
    let closed = false,
      selfClosing = false,
      name,
      value,
      tag,
      attrs = {},
      spread = null;
    this.lexer.noRegex = true;

    this.expectPunctuators(['<']);

    if(this.matchPunctuators(['/'])) {
      this.expectPunctuators(['/']);
      closed = true;
    }
    if(this.matchIdentifier()) {
      tag = this.expectIdentifier();

      if(this.matchPunctuators(['.', '['])) tag = this.parseRemainingMemberExpression(tag);
    }
    for(;;) {
      if(this.matchPunctuators(['{'])) {
        this.expectPunctuators(['{']);
        this.expectPunctuators(['...']);

        spread = this.parseAssignmentExpression();

        this.expectPunctuators(['}']);
        continue;
      } else if(this.matchIdentifier()) name = this.expectIdentifier().value;
      else break;

      if(this.matchPunctuators(['='])) {
        this.expectPunctuators(['=']);
        if(this.matchPunctuators(['{'])) {
          this.expectPunctuators(['{']);
          value = this.parseExpression();
          this.expectPunctuators(['}']);
        } else {
          value = this.expectLiteral();
        }
      } else {
        value = new Literal('true', true);
      }
      attrs[name] = value;
    }
    if(this.matchPunctuators(['/'])) {
      this.expectPunctuators(['/']);
      selfClosing = true;
    }
    this.expectPunctuators(['>']);
    this.lexer.noRegex = false;

    let attributeStr = Object.entries(attrs)
      .map(([name, value]) => ` ${name}="${value.value}"`)
      .join('')
      .substring(0, 100);

    return this.addNode(JSXLiteral, tag.value, attrs, closed, selfClosing, spread);
  }

  parseJSX(depth = 0) {
    this.trace('parseJSX');
    let tok2, tok3;
    //this.log(`parseJSX(${depth})`);
    let members = [];
    for(;;) {
      this.lexer.noRegex = true;
      if(!this.matchPunctuators(['<'])) break;
      tok2 = this.lookahead(1);
      if(tok2.value == '/') break;
      let tag = this.parseJSXTag();
      members.push(tag);
      let jsx = members[members.length - 1];
      jsx.children = [];
      if(jsx.selfClosing && depth == 0) break;
      if(this.matchPunctuators(['{'])) {
        this.expectPunctuators(['{']);
        let obj;
        if(this.matchLiteral()) obj = this.expectLiteral();
        else obj = this.parseAssignmentExpression();
        jsx.children.push(obj);
        this.expectPunctuators(['}']);
      }
      if(!tag.closing && !tag.selfClosing) {
        let toks = [];
        while(!this.matchPunctuators(['<'])) {
          let tok = this.consume();
          toks.push(tok.value);
        }
        let text = toks.join(' ');
        if(text != '') jsx.children.push(new Literal(text));
      }
      if(jsx.selfClosing) continue;
      this.lexer.noRegex = true;

      if(this.matchPunctuators(['<'])) {
        tok2 = this.lookahead(1);
        if(tok2.value != '/' && !jsx.closing && !jsx.selfClosing) {
          jsx.children = jsx.children.concat(this.parseJSX(depth + 1));
        }
      }

      if(this.matchPunctuators(['<'])) {
        tok2 = this.lookahead(1);
        tok3 = this.lookahead(2);
        if(tok2.value == '/' && tok3.value == tag.tag) {
          this.tokens = [];
          this.expectPunctuators(['>']);
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
    this.trace('parseVariableStatement');
    let keyw = this.expectKeywords(['var', 'let', 'const']);
    let decl = this.parseVariableDeclarationList(keyw.value, exported);
    if(this.matchPunctuators([';'])) this.expectPunctuators([';']);

    if(exported) {
      decl = this.addNode(ExportNamedDeclaration, decl, null);
    }

    return decl;
  }

  parseImportDeclaration(toplevel = false) {
    this.trace('parseImportDeclaration', {
      toplevel,
      token: this.token.lexeme
    });
    this.expectKeywords('import');
    let items = [];

    if(toplevel) {
      let item;
      if(this.matchLiteral()) {
        return this.addNode(ImportDeclaration, null, this.expectLiteral());
      }
      while(true) {
        if(this.matchPunctuators(['{'])) {
          items = items.concat(this.parseModuleItems());
        } else if(this.matchIdentifier() || this.matchPunctuators(['*'])) {
          item = this.parseImportSpecifier(this.matchIdentifier());
          items.push(item);
        }
        if(this.matchPunctuators([','])) {
          this.expectPunctuators([',']);
          continue;
        }
        break;
      }
      this.expectIdentifier('from');
      const sourceFile = this.parseExpression(false, false);
      this.expectPunctuators([';']);
      return this.addNode(ImportDeclaration, items, sourceFile);
    }
    let object = new Identifier('import');
    return this.parseRemainingCallExpression(object);
  }

  parseImportSpecifier(default_specifier = false) {
    this.trace('parseImportSpecifier', { default_specifier });
    let name;
    let decl;
    if(this.matchPunctuators(['*'])) {
      this.expectPunctuators(['*']);
      this.expectKeywords('as');
      name = this.expectIdentifier();

      return this.addNode(ImportNamespaceSpecifier, name);
    }
    name = this.expectIdentifier();

    if(this.matchKeywords('as')) {
      this.expectKeywords('as');
      decl = this.expectIdentifier();
      default_specifier = false;
    } else {
      decl = name;
    }
    return default_specifier
      ? this.addNode(ImportDefaultSpecifier, decl)
      : this.addNode(ImportSpecifier, name, decl);
  }

  parseModuleItems(method = 'parseImportSpecifier') {
    this.trace('parseModuleItems', { method });
    this.expectPunctuators(['{']);
    let items = [];
    1;
    while(!this.matchPunctuators(['}'])) {
      let item;
      item = this[method]();
      items.push(item);
      if(this.matchPunctuators([','])) {
        this.expectPunctuators([',']);
        continue;
      }
      break;
    }
    this.expectPunctuators(['}']);
    return items;
  }

  parseExportSpecifier() {
    this.trace('parseExportSpecifier');
    let name;
    let decl;

    name = this.expectIdentifier(true);

    if(this.matchKeywords('as')) {
      this.expectKeywords('as');
      decl = this.expectIdentifier();
    } else {
      decl = name;
    }
    return this.addNode(ExportSpecifier, name, decl);
  }

  parseExportDeclaration() {
    this.trace('parseExportDeclaration');
    let stmt,
      is_async = false;
    //this.log('parseExportDeclaration()');
    if(this.matchKeywords('export')) this.expectKeywords('export');
    if(this.matchKeywords('async')) {
      this.expectKeywords('async');
      is_async = true;
    }

    if(this.matchKeywords('default')) {
      this.expectKeywords('default');
      stmt = this.parseAssignmentExpression();

      stmt = this.addNode(ExportDefaultDeclaration, stmt);
    } else if(this.matchKeywords('class')) {
      stmt = this.parseClass(true);
    } else if(this.matchKeywords('function')) {
      stmt = this.parseFunction(true, is_async);
    } else if(this.matchKeywords(['var', 'let', 'const'])) {
      stmt = this.parseVariableStatement(true);
    } else if(this.matchIdentifier(true)) {
      const id = this.expectIdentifier();

      stmt = this.addNode(ExportNamedDeclaration, this.parseAssignmentExpression(), null);
    } else if(this.matchPunctuators(['{'])) {
      let items = this.parseModuleItems('parseExportSpecifier');

      let source;

      if(this.matchKeywords('from')) {
        this.expectKeywords('from');
        source = this.expectLiteral();
      } else if(this.matchIdentifier('from')) {
        this.expectIdentifier('from');
        source = this.expectLiteral();
      }
      stmt = this.addNode(ExportNamedDeclaration, null, items, source);

      //this.expectPunctuators(['}']);
    }

    if(this.matchPunctuators([';'])) this.expectPunctuators([';']);

    this.trace('parseExportDeclaration', { stmt, token: this.token.value });

    return stmt;
    //return this.parseVariableStatement(true);
  }

  parseDecoratorStatement() {
    this.trace('parseDecoratorStatement');
    //this.log('parseDecoratorStatement()');
    let st = null;

    while(true) {
      this.expectPunctuators(['@']);
      let id = this;
      let call = this.parseNewOrCallOrMemberExpression(false, true);
      let identifier = this.expectIdentifier();

      st = this.parseRemainingCallExpression(identifier);

      break;
    }

    return st;
  }

  parseExpressionStatement() {
    this.trace('parseExpressionStatement');
    //this.log(`parseExpressionStatement()`);

    const expression = this.parseExpression();

    if(this.matchPunctuators([';'])) this.expectPunctuators([';']);
    return this.addNode(ExpressionStatement, expression);
  }

  parseIfStatement(insideIteration, insideFunction) {
    this.trace('parseIfStatement');
    this.expectKeywords('if');
    this.expectPunctuators(['(']);
    const test = this.parseExpression();
    this.expectPunctuators([')']);
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
    return this.addNode(IfStatement, test, consequent, alternate);
  }

  parseWhileStatement(insideFunction) {
    this.trace('parseWhileStatement');
    this.expectKeywords('while');
    this.expectPunctuators(['(']);
    const test = this.parseExpression();
    this.expectPunctuators([')']);
    const statement = this.parseStatement(true, insideFunction);
    if(statement === null) {
      throw new Error('Expecting statement for while-statement', this.position());
    }
    return this.addNode(WhileStatement, test, statement);
  }

  parseDoWhileStatement(insideFunction) {
    this.trace('parseDoWhileStatement');
    this.expectKeywords('do');
    const statement = this.parseStatement(true, insideFunction, false);
    if(statement === null) {
      throw new Error('Expecting statement for do-while-statement', this.position());
    }
    this.expectKeywords('while');
    this.expectPunctuators(['(']);
    const test = this.parseExpression();
    this.expectPunctuators([')']);
    return this.addNode(DoWhileStatement, test, statement);
  }

  parseForStatement(insideFunction) {
    this.trace('parseForStatement');
    let async = false;
    this.expectKeywords('for');
    if(this.matchKeywords('await')) {
      this.expectKeywords('await');
      async = true;
    }
    this.expectPunctuators(['(']);
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
        this.expectPunctuators([';']);
        test = this.parseExpression(true);
        this.expectPunctuators([';']);
        update = this.parseExpression(true);
      }
    } else {
      //Can be either of the following forms:
      //for( Expression(opt) ; Expression(opt) ; Expression(opt) ) Statement
      //for( LeftHandSideExpression in Expression ) Statement
      init = left = this.matchPunctuators([';']) ? null : this.parseExpression(true);

      if(this.matchPunctuators([';'])) {
        this.expectPunctuators([';']);
        test = this.matchPunctuators([';']) ? null : this.parseExpression(true);
        this.expectPunctuators([';']);
        update = this.matchPunctuators([')']) ? null : this.parseExpression(true);
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
    this.expectPunctuators([')']);
    const statement = this.parseStatement(true, insideFunction);
    if(statement === null) {
      throw new Error('Expecting statement for for-statement', this.position());
    }

    if(isForInStatement)
      return new (operator == 'in' ? ForInStatement : ForOfStatement)(left,
        right,
        statement,
        async
      );
    return this.addNode(ForStatement, init, test, update, statement);
  }

  parseIterationStatement(insideFunction) {
    this.trace('parseIterationStatement');
    //this.log(`parseIterationStatement()`);
    if(this.matchKeywords('while')) {
      return this.parseWhileStatement(insideFunction);
    } else if(this.matchKeywords('do')) {
      return this.parseDoWhileStatement(insideFunction);
    }
    return this.parseForStatement(insideFunction);
  }

  parseSwitchStatement(insideFunction) {
    this.trace('parseSwitchStatement');
    let kw, sv, cv, stmt;
    this.expectKeywords('switch');
    this.expectPunctuators(['(']);
    sv = this.parseExpression();
    this.expectPunctuators([')']);
    this.expectPunctuators(['{']);
    let cases = [];
    while(true) {
      kw = this.expectKeywords(['case', 'default']);
      cv = kw.value == 'default' ? null : this.parseExpression();

      this.expectPunctuators([':']);

      stmt = this.parseList(true, insideFunction, p => p.matchKeywords(['case', 'default']));

      cases.push(this.addNode(SwitchCase, cv, stmt));

      if(this.matchPunctuators(['}'])) break;
    }
    this.expectPunctuators(['}']);
    return this.addNode(SwitchStatement, sv, cases);
  }

  parseTryStatement(insideIteration, insideFunction) {
    this.trace('parseTryStatement');
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

      if(this.matchPunctuators(['('])) {
        this.expectPunctuators(['(']);
        //Parse optional parameter list
        if(this.matchIdentifier()) parameter = this.expectIdentifier();
        this.expectPunctuators([')']);
      }

      //Parse function body
      catch_block = this.parseStatement(insideIteration, insideFunction);
    }
    if(this.matchKeywords('finally')) {
      this.expectKeywords('finally');

      finally_block = this.parseStatement(insideIteration, insideFunction);
    }

    let object = this.addNode(TryStatement,
      body,
      this.addNode(CatchClause, parameter, catch_block),
      finally_block
    );

    if(this.matchPunctuators(['('])) {
      return this.parseRemainingCallExpression(object);
    }

    return object;
  }

  parseWithStatement(insideIteration, insideFunction) {
    this.trace('parseWithStatement');
    this.expectKeywords('with');
    this.expectPunctuators(['(']);
    const test = this.parseExpression();
    this.expectPunctuators([')']);
    const statement = this.parseStatement(insideIteration, insideFunction);
    if(statement === null) {
      throw new Error('Expecting statement for with-statement', this.position());
    }
    return this.addNode(WithStatement, test, statement);
  }

  parseThrowStatement() {
    this.trace('parseThrowStatement');
    this.expectKeywords('throw');
    const expression = this.parseExpression();
    return this.addNode(ThrowStatement, expression);
  }
  parseYieldStatement() {
    this.trace('parseYieldStatement');
    let yield_generator = false;

    this.expectKeywords('yield');

    if(this.matchPunctuators(['*'])) {
      this.expectPunctuators(['*']);
      yield_generator = true;
    }

    const expression = this.parseExpression();
    return this.addNode(YieldExpression, expression, yield_generator);
  }

  parseContinueStatement() {
    this.trace('parseContinueStatement');
    this.expectKeywords('continue');
    let id;
    if(this.matchIdentifier()) id = this.expectIdentifier();

    this.expectPunctuators([';']);
    return this.addNode(ContinueStatement, id);
  }

  parseBreakStatement() {
    this.trace('parseBreakStatement');
    this.expectKeywords('break');
    let id;
    if(this.matchIdentifier()) id = this.expectIdentifier();

    this.expectPunctuators([';']);
    return this.addNode(BreakStatement, id);
  }

  parseReturnStatement() {
    this.trace('parseReturnStatement');
    //this.log(`parseReturnStatement()`);
    this.expectKeywords('return');
    let expression = null;

    if(!this.matchPunctuators([';'])) expression = this.parseAssignmentExpression();
    if(this.matchPunctuators([';'])) this.expectPunctuators([';']);
    return this.addNode(ReturnStatement, expression);
  }

  parseStatement(insideIteration, insideFunction, exported) {
    this.trace('parseStatement', { insideIteration, insideFunction, exported });
    //Parse Block
    let t = this.token || this.lexer.tokens[this.lexer.tokenIndex];
    let defaultExport = false;
    let stmt;

    if(exported) {
      if(this.matchKeywords('default')) defaultExport = this.expectKeywords('default');
    }

    if(this.matchPunctuators(['{'])) {
      stmt = this.parseBlock(insideIteration, insideFunction);
    } else if(this.matchPunctuators(['@'])) {
      stmt = this.parseDecorator();

      //Parse constructor() super[.method](calls)
      /* } else if(insideFunction && (this.matchKeywords("super") || this.matchIdentifier("super"))) {
      return this.parseNewOrCallOrMemberExpression(false, true);
*/
      //Parse Variable Statement
    } else if(this.matchKeywords(['var', 'let', 'const'])) {
      stmt = this.parseVariableStatement();

      if(exported) stmt = this.addNode(ExportNamedDeclaration, stmt, null);
    } else if(this.matchKeywords('import')) {
      stmt = this.parseImportDeclaration(!insideIteration && !insideFunction);
      //Parse Empty Statement
    } else if(this.matchKeywords('class')) {
      stmt = this.parseClass();
    } else if(this.matchPunctuators([';'])) {
      this.expectPunctuators([';']);
      stmt = this.addNode(EmptyStatement);
    }

    //Parse If Statement
    else if(this.matchKeywords('if')) {
      stmt = this.parseIfStatement(insideIteration, insideFunction);

      //Parse Iteration Statement
    } else if(this.matchKeywords(['while', 'for', 'do'])) {
      stmt = this.parseIterationStatement(insideFunction);

      //Parse Switch Statement
    } else if(this.matchKeywords(['switch'])) {
      stmt = this.parseSwitchStatement(insideFunction);
    } else if(this.matchKeywords(['try'])) {
      stmt = this.parseTryStatement(insideIteration, insideFunction);

      //Parse With Statement
    } else if(this.matchKeywords('throw')) {
      stmt = this.parseThrowStatement();
    } else if(this.matchKeywords('yield')) {
      stmt = this.parseYieldStatement();
    } else if(this.matchKeywords('with')) {
      stmt = this.parseWithStatement(insideIteration, insideFunction);
    } else if(this.matchKeywords('continue')) {
      if(insideIteration) stmt = this.parseContinueStatement();
      else throw new Error(`continue; statement can only be inside an iteration`);
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
      if(stmt instanceof Identifier && this.matchPunctuators([':'])) {
        this.expectPunctuators([':']);
        stmt = this.addNode(LabeledStatement,
          stmt,
          this.parseStatement(insideIteration, insideFunction, exported)
        );

        //console.debug('ExpressionStatement:', stmt);
      }
      if(!stmt) throw new Error('No expression statement');

      if(defaultExport) {
        if(stmt instanceof ClassDeclaration)
          stmt = this.addNode(AnonymousDefaultExportedClassDeclaration,
            stmt.id,
            stmt.superClass,
            stmt.body
          );
        else if(stmt instanceof FunctionLiteral)
          stmt = this.addNode(AnonymousDefaultExportedFunctionDeclaration,
            stmt.id,
            stmt.params,
            stmt.body,
            stmt.async,
            stmt.generator
          );
        else stmt = this.addNode(ExportDefaultDeclaration, stmt);
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
    //  console.log('parseStatement', { stmt });

    // this.trace('parseStatement', { stmt });
    return stmt;
  }

  parseClass(exported = false) {
    this.trace('parseClass', {
      token: this.token,
      numTokens: this.tokens.length,
      tokens: this.tokens
    });
    this.expectKeywords('class');
    this.trace('parseClass', {
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

    if(this.matchPunctuators([';'])) this.expectPunctuators([';']);
    //let decl = this.addNode(ClassDeclaration, identifier, extending, members);

    if(exported) decl = this.addNode(ExportNamedDeclaration, decl);

    return decl;
  }

  parseParameters() {
    this.trace('parseParameters');
    const params = [];
    let rest_of = false,
      parens = false;
    const checkRestOf = (parser, match) => {
      parser.matchIdentifier(true);
      if(parser.matchPunctuators(['...'])) {
        parser.expectPunctuators(['...']);
        rest_of = true;
      }
      parser.matchIdentifier(true);
      return parser.matchAssignmentExpression();
    };
    if(this.matchPunctuators(['('])) {
      this.expectPunctuators(['(']);
      parens = true;
    }
    while(checkRestOf(this)) {
      let param, defaultValue;

      if(!rest_of && this.matchPunctuators(['{', '['])) param = this.parseBindingPattern();
      else param = this.expectIdentifier();

      if(!rest_of && this.matchPunctuators(['='])) {
        this.expectPunctuators(['=']);
        defaultValue = this.parseExpression(false, false);
      }

      if(rest_of) param = this.addNode(RestElement, param);
      else if(defaultValue) param = this.addNode(AssignmentPattern, param, defaultValue);

      params.push(param);
      if(rest_of) break;
      if(rest_of || !this.matchPunctuators([','])) break;
      this.expectPunctuators([',']);
    }
    if(parens) this.expectPunctuators(')', params);
    return params;
  }

  parseFunction(exported = false, isAsync = false) {
    this.trace('parseFunction');
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

    if(this.matchPunctuators(['*'])) {
      this.expectPunctuators(['*']);
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

    if(exported) func = this.addNode(ExportNamedDeclaration, func);

    return func;
  }

  parseFunctionParametersAndBody(identifier, isAsync = false, isGenerator = false) {
    this.trace('parseFunctionParametersAndBody');
    let parameters = this.parseParameters();

    //Parse function body
    const body = this.parseBlock(false, true, FunctionBody);

    let func = this.addNode(FunctionDeclaration,
      identifier,
      parameters,
      body,
      isAsync,
      isGenerator
    );

    if(this.matchPunctuators(['('])) return this.parseRemainingCallExpression(func);

    return func;
  }

  parseSourceElement() {
    let node;
    let exported = false;
    this.trace('parseSourceElement');
    if(this.matchKeywords('export')) {
      /*      this.expectKeywords('export');
      exported = true;

      if(this.matchKeywords('default')) */ node = this.parseExportDeclaration();
    } else if(this.matchKeywords('class')) {
      node = this.parseClass(exported);
    } else if(this.matchKeywords('function')) {
      node = this.parseFunction(exported);
    } else {
      node = this.parseStatement(false, false, exported);
    }
    //console.log('parseSourceElement', node);

    return node;
  }

  parseProgram() {
    let sourceElement;
    const body = [];

    this.trace('parseProgram');
    sourceElement = this.parseSourceElement();

    body.push(sourceElement);

    //Check to see if there are more SourceElement
    while(this.matchStatement() || this.matchKeywords('function')) {
      sourceElement = this.parseSourceElement();
      body.push(sourceElement);
    }

    const { tokens } = this;

    if(tokens[0] && tokens[0].type !== 'eof') {
      throw new Error(`Didn't consume all tokens: ${Util.inspect(tokens[0])}`);
    }

    return this.addNode(Program, 'module', body);
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
let frameMap = new WeakMap();
let stackMap = new WeakMap();

Object.assign(Parser, { frameMap, stackMap });

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
const quoteStr = s => s.replace(linebreak, '\\n');

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
  this.stack[i].tokens.push(str);
};
const instrumentate = (methodName, fn = methods[methodName]) => {
  const { loc } = Factory;
  const printer = new Printer();
  let esfactory = function(...args) {
    let { lexer, stack, tokenIndex } = this;
    let parser = this;
    let positionObj = this.tokens[0] ?? lexer;
    let position = positionObj.loc;
    let depth = this.stack.length;
    let entry = {
      methodName,
      start: tokenIndex - this.tokens.length,
      position,
      depth
    };
    this.callStack = Stack.update(this.callStack,
      new Stack(null, fr => fr.functionName != 'esfactory')
    );

    if(this.stack.length) {
      //      this.stack[0].frame = this.callStack[0];

      frameMap.set(this.callStack[0], this.stack[0]);
      stackMap.set(this.stack[0], this.callStack[0]);
    }

    this.stack.unshift(entry);

    let { tokens } = this.stack[depth];
    let ret;
    if(this.debug > 1) Debug((parser.next() ?? lexer).loc);
    ret = methods[methodName].call(this, ...args);
    let { token, consumed = 0, numToks = 0 } = this;
    let lastTok = this.tokenIndex - this.tokens.length;
    entry.end = lastTok;
    if(ret instanceof ESNode) this.onReturnNode(ret, entry, this.stack);
    let tmp = this.stack[0].tokens || [];
    while(this.stack.length > depth) this.stack.shift();
    if(this.debug > 1) {
      let end = (token && token.pos) || lexer.pos;
      Debug(position, end);
    }
    function Debug(position, end) {
      let msg = ('' + position.toString(false)).padEnd((position.file || '').length + 8);

      let argstr =
        args.length > 0
          ? `(${args
              .map(arg =>
                inspect(arg, {
                  colors: false,
                  compact: 10,
                  breakLength: Infinity
                })
              )
              .join(', ')})`
          : '';
      msg += ` ${(depth + '').padStart(4)} ${
        (end == undefined ? symbols.enter : symbols.leave) + ' ' + (methodName + argstr).padEnd(40)
      }`;

      //    msg += ` ${quoteList(tokens || [])}`

      //msg += `  ${quoteArg(args)}`;
      let annotate = [];
      let objectStr = ret ? Object2Str(ret) : '';

      function Object2Str(obj) {
        if('ast' in obj) obj = { ...obj, ast: Object2Str(obj.ast) };
        if('object' in obj) obj = { ...obj, object: Object2Str(obj.object) };

        let s = typeof obj == 'object' ? Util.className(obj) : obj;
        if(s == 'Object' || !(obj instanceof ESNode)) s = inspect(obj, { depth: 0, compact: 100 });

        if(obj instanceof Literal) s += ` ${obj.value}`;
        if(obj instanceof Identifier) s += ` ${obj.name}`;
        return s;
      }

      if(end) {
        let parsed = lexer.source.substring(parser.numToks ?? 0, end);
        parser.consumed = end;
        if(parsed.length) parsed = parsed.replace(linebreak, '\\n');
        let lexed = parser.processed.slice(parser.consumed ?? 0);
        parser.numToks = parser.tokenIndex - parser.tokens.length;

        if(lexed.length)
          annotate.push(`lexed[${lexed.map(t => Util.abbreviate(quoteStr(t.value), 40)).join(', ')}]`
          );

        annotate.push(`returned: ${objectStr}`);
      }

      /*
      if(nodes.length) annotate.push(`yielded: ` + quoteArray(newNodes));
    nodes.splice(0, nodes.length);*/
      if(annotate.length) {
        msg = msg + '    ' + annotate.join(', ');
      }
      if(ret || !/match/.test(methodName)) console.log(msg);
    }
    depth--;
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
//ECMAScriptParser.instrumentate();

export default Parser;
