/* jshint esversion: 6 */
/* jshint noyield: true */

//TODO: //- LabeledStatement -> including use in break/continue
//- nicer error handling?
//-> TESTS
//-> BENCHMARKS

//var parse = require('acorn').parse;
//import util from 'util';
import EventEmitter from '../eventEmitter.js';
import Util from '../util.js';
import { ESNode, BinaryExpression, Identifier, ImportStatement, Literal, MemberExpression, FunctionDeclaration, ArrowFunction, SequenceExpression } from './estree.js';

class NotImplemented extends Error {
  constructor(type, node) {
    super(`Not implemented yet: ${type || Util.className(node)}`);
    this.type = type;
    this.node = node;
  }
}
function consume(iter) {
  let yields = [];
  let retval;
  let it;
  do {
    it = iter.next();
    if(it.done) retval = it.value;
    else yields.push(it.value);
  } while(!it.done);
  return [yields, retval];
}
function log(...args) {
  let callers = Util.getCallers(2);

  if(!callers[0].functionName) callers.shift();

  while(callers[0].fileName == '<anonymous>' || callers[0].methodName == '<anonymous>' || callers[0].methodName == '') callers.shift();

  //console.debug('callers\n', ...callers.map((c) => c.functionName || c.methodName || c.toString()).map((n) => `  ${n}\n`));

  console.debug('callers[0]', callers[0]);

  let node = args[0] instanceof ESNode && args[0];

  let pos = node && ESNode.assoc(node).position;
  if(pos) args.unshift(pos);

  console.log(Util.ansi.text(callers[0].methodName, 1, 34), ...args);
}
function noop() {}

function execute(func) {
  let result = func();
  if('' + result === 'null') {
    return result;
  }
  // FIXME: Convert to yield*
  if(result !== undefined) {
    if(result.next) {
      let iter = result;
      let res = iter.next();
      while(!res.done) {
        res = iter.next();
      }
      if('' + res.value === 'null') {
        return res.value;
      }
      if('' + res.value === 'undefined') {
        return res.value;
      }
      return res.value;
    }
  }
  return result;
}

function Arguments() {
  //TODO: add es3 'arguments.callee'?
}

Arguments.prototype.toString = function() {
  return '[object Arguments]';
};

function Return(val) {
  this.value = val;
}

// need something unique to compare a against.
let Break = {};
let Continue = {};

function createVariableStore(parent, vars) {
  vars = vars || {};
  return {
    parent,
    vars
  };
}

function addDeclarationsToStore(declarations, varStore) {
  for(let key in declarations) {
    if(declarations.hasOwnProperty(key) && !varStore.vars.hasOwnProperty(key)) {
      varStore.vars[key] = declarations[key]();
    }
  }
}

function startLine(node) {
  let assoc = ESNode.assoc(node);
  let { position: { line } = {} } = assoc;
  return line;
}

export class Environment extends EventEmitter {
  constructor(globalObjects = {}) {
    super();
    //  EventEmitter.call(this);
    if(!Array.isArray(globalObjects)) {
      globalObjects = [globalObjects];
    }
    let parent;
    globalObjects.forEach(vars => {
      parent = createVariableStore(parent, vars);
    });

    log({ parent, globalObjects });
    // the topmost store is our current store
    this.currentVariableStore = parent;
    this.currentDeclarations = {};
    this.globalObj = globalObjects[0];
    this.currentThis = this.globalObj;
    this.boundGen = this.generateClosure.bind(this);
    this.DEBUG = false;
    this.DELAY = 0;
    this.STATE = 'running';
  }

  //util.inherits(Environment, EventEmitter);

  generate(node) {
    let opts = {
      locations: true
    };

    /*   if(typeof node === 'string')
      node = parse(node, opts);
 */
    log('generate', { node });
    let resp = this.generateClosure(node);
    addDeclarationsToStore(this.currentDeclarations, this.currentVariableStore);
    this.currentDeclarations = {};
    return resp;
  }

  generateClosure(node) {
    let type = node.type || Util.className(node);
    let closure = ({
        BinaryExpression: this.generateBinaryExpression,
        ImportStatement: this.generateImportStatement,
        LogicalExpression: this.generateBinaryExpression,
        UnaryExpression: this.generateUnaryExpression,
        UpdateExpression: this.generateUpdateExpression,
        ObjectLiteral: this.generateObjectExpression,
        ArrayLiteral: this.generateArrayLiteral,
        CallExpression: this.generateCallExpression,
        NewExpression: this.generateNewExpression,
        MemberExpression: this.generateMemberExpression,
        ThisExpression: this.generateThisExpression,
        SequenceExpression: this.generateSequenceExpression,
        Literal: this.generateLiteral,
        Identifier: this.generateIdentifier,
        AssignmentExpression: this.generateAssignExpression,
        FunctionDeclaration: this.generateFunctionDeclaration,
        ArrowFunction: this.generateFunctionDeclaration,
        VariableDeclaration: this.generateVariableDeclaration,
        BlockStatement: this.generateProgram,
        Program: this.generateProgram,
        ExpressionStatement: this.generateExpressionStatement,
        EmptyStatement: this.generateEmptyStatement,
        ReturnStatement: this.generateReturnStatement,
        FunctionExpression: this.generateFunctionExpression,
        IfStatement: this.generateIfStatement,
        ConditionalExpression: this.generateConditionalStatement,
        ForStatement: this.generateLoopStatement,
        WhileStatement: this.generateLoopStatement,
        DoStatement: this.generateDoWhileStatement,
        ForInStatement: this.generateForInStatement,
        WithStatement: this.generateWithStatement,
        ThrowStatement: this.generateThrowStatement,
        TryStatement: this.generateTryStatement,
        ContinueStatement: this.generateContinueStatement,
        BreakStatement: this.generateBreakStatement,
        SwitchStatement: this.generateSwitchStatement
      }[type] ||
      function() {
        console.debug('node:', node);

        throw new NotImplemented(type, node);
        console.warn('Not implemented yet: ' + type);
        return noop;
      }
    ).call(this, node);

    if(this.DEBUG) {
      return function() {
        let info = 'closure for ' + type + ' called';
        let line = ((node.loc || {}).start || {}).line;
        if(line) {
          info += ' while processing line ' + line;
        }
        let resp = closure();
        info += '. Result:';
        log(info, resp);
        return resp;
      };
    }
    return closure;
  }

  generateBinaryExpression(node) {
    let a = this.generateClosure(node.left);
    let b = this.generateClosure(node.right);

    function* callExpression(expr) {
      let result;
      if(expr.constructor.name == 'GeneratorFunction') {
        result = yield* expr();
      } else {
        result = expr();
      }
      console.debug('expr:', expr + '');
      console.debug('expr():', expr());
      console.debug('result:', result);
      return result;
    }

    // prettier-ignore
    let cmp = {
      *'=='() {return (yield* callExpression(a)) == (yield* callExpression(b)); },
      *'!='() {return (yield* callExpression(a)) != (yield* callExpression(b)); },
      *'==='() {return (yield* callExpression(a)) === (yield* callExpression(b)); },
      *'!=='() {return (yield* callExpression(a)) !== (yield* callExpression(b)); },
      *'<'() { return (yield* callExpression(a)) < (yield* callExpression(b)); },
      *'<='() { return (yield* callExpression(a)) <= (yield* callExpression(b)); },
      *'>'() { return (yield* callExpression(a)) > (yield* callExpression(b)); },
      *'>='() { return (yield* callExpression(a)) >= (yield* callExpression(b)); },
      *'<<'() { return (yield* callExpression(a)) << (yield* callExpression(b)); },
      *'>>'() { return (yield* callExpression(a)) >> (yield* callExpression(b)); },
      *'>>>'() { return (yield* callExpression(a)) >>> (yield* callExpression(b)); },
      *'+'() { 
        const x =  callExpression(a);
        const y =  callExpression(b);  
        const u =  yield *x;
        const v =  yield *y;
console.debug("generateBinaryExpression", {a:a+'',b:b+''});
console.debug("generateBinaryExpression", {x,y})
console.debug("generateBinaryExpression", {u,v})
        return u+v;


         },
      *'-'() { return (yield* callExpression(a)) - (yield* callExpression(b)); },
      *'*'() { return (yield* callExpression(a)) * (yield* callExpression(b)); },
      *'/'() { return (yield* callExpression(a)) / (yield* callExpression(b)); },
      *'%'() { return (yield* callExpression(a)) % (yield* callExpression(b)); },
      *'|'() { return (yield* callExpression(a)) | (yield* callExpression(b)); },
      *'^'() { return (yield* callExpression(a)) ^ (yield* callExpression(b)); },
      *'&'() { return (yield* callExpression(a)) & (yield* callExpression(b)); },
      *in() { return (yield* callExpression(a)) in (yield* callExpression(b)); },
      *instanceof() { return (yield* callExpression(a)) instanceof (yield* callExpression(b)); },
      // logic expressions
      *'||'() { return (yield* callExpression(a)) || (yield* callExpression(b)); },
      *'&&'() { return (yield* callExpression(a)) && (yield* callExpression(b)); }
    }[node.operator];
    //  let it = /*function*() {  yield 'test'; return 'blah'; }() ||*/ cmp();
    // console.debug("iter cmp():",  consume(function*() {  return yield *it; }()));

    return function() {
      // FIXME: Convert to yield*
      let iter = cmp();
      let res = iter.next();
      while(!res.done) res = iter.next();

      return res.value;
    };
  }

  generateImportStatement(node) {
    const { identifiers, source } = node;
    log('ImportStatement:', node);
    let importFile = source.value;
    return function() {
      import(importFile).then(handle => {
        log('handle:', handle);
      });
    };
  }

  generateUnaryExpression(node) {
    if(node.operator === 'delete') {
      return this.generateDelete(node);
    }
    log({ node, pos: ESNode.assoc(node).position });
    let a = this.generateClosure(node.argument);
    // prettier-ignore
    let op = {
      '-'() { return -a(); },
      '+'() { return +a(); },
      '!'() { return !a(); },
      '~'() { return ~a(); },
      typeof() { return typeof a(); },
      void() { return void a(); }
    }[node.operator];

    return function() {
      return op();
    };
  }

  generateDelete(node) {
    let obj = this.generateObject(node.argument);
    let attr = this.generateName(node.argument);

    return function() {
      return delete obj()[attr()];
    };
  }

  generateObjectExpression(node) {
    //TODO property.kind: don't assume init when it can also be set/get
    let self = this;
    let items = [];
    const { members } = node;
    log({ items, node });
    node.members.forEach(property => {
      // object expression keys are static so can be calculated
      // immediately
      log({ property });
      let key = self.objKey(property.id)();
      items.push({
        key,
        getVal: self.generateClosure(property.value)
      });
    });

    return function() {
      let result = {};
      items.forEach(item => {
        result[item.key] = item.getVal();
      });
      return result;
    };
  }

  generateArrayLiteral(node) {
    let items = node.elements.map(this.boundGen);

    return function() {
      return items.map(execute);
    };
  }

  objKey(node) {
    let type = node.type || Util.className(node);

    let key;
    if(type === 'Identifier') {
      key = node.value;
    } else {
      key = this.generateClosure(node)();
    }

    return function() {
      return key;
    };
  }

  generateCallExpression(node) {
    let self = this;
    let callee;
    if(node.callee.type === 'MemberExpression') {
      let obj = self.generateObject(node.callee);
      let name = self.generateName(node.callee);
      callee = function() {
        let theObj = obj();
        return theObj[name()].bind(theObj);
      };
    } else {
      callee = self.generateClosure(node.callee);
    }
    let args = node.arguments.map(self.generateClosure.bind(self));

    log({ callee: callee + '', args: args + '' });

    return function* () {
      self.emit('line', startLine(node));
      let c = callee();
      console.log('evalCallExpression', { callee: callee + '', c: c + '', args });

      if(c === undefined) {
        return c;
      }

      let result;
      let res;

      if(c.next) {
        res = yield* c;
        result = res.apply(self.globalObj, args.map(execute));
      } else {
        result = c.apply(self.globalObj, args.map(execute));
      }

      if(result !== undefined) {
        if(result.next) {
          res = yield* result;
          return res;
        }
      }
      return result;
    };
  }

  generateNewExpression(node) {
    let callee = this.generateClosure(node.callee);
    let args = node.arguments.map(this.boundGen);
    let self = this;

    return function* () {
      self.emit('line', startLine(node));
      let cl = callee();
      let ar = args.map(execute);
      let newObject = Object.create(cl.prototype);
      let constructor = cl.apply(newObject, ar);
      yield* constructor;
      return newObject;
    };
  }

  generateMemberExpression(node) {
    let self = this;
    let { object, property } = node;
    let memberExpression = { object: object.value, property: property.value };
    log({ ...memberExpression });
    let obj = this.generateClosure(object);
    let member = this.memberExpressionProperty(node);
    let str = (s, v = 'node.value') => (s + '').replace(/\s+/g, ' ').replace(/(node\.value|key)/g, v);

    //log({obj: obj+'', member: member+'' }); //obj()      = ', obj() || str(obj,`'${node.object.value}'`), '\n  property() = ', property());
    return function() {
      self.emit('line', startLine(node));
      let r = obj();
      log('evalMemberExpression', { r }, obj + '');
      return r[member()];
    };
  }

  memberExpressionProperty(node) {
    return node.computed ? this.generateClosure(node.property) : this.objKey(node.property);
  }

  generateThisExpression() {
    let self = this;
    return function() {
      return self.currentThis;
    };
  }

  generateSequenceExpression(node) {
    let exprs = node.expressions.map(this.boundGen);
    return function() {
      let result;
      exprs.forEach(expr => {
        result = expr();
      });
      return result;
    };
  }

  generateUpdateExpression(node) {
    let self = this;
    // prettier-ignore
    let update = {
      '--true'(obj, name) { return --obj[name]; },
      '--false'(obj, name) { return obj[name]--; },
      '++true'(obj, name) { return ++obj[name]; },
      '++false'(obj, name) { return obj[name]++; } }[node.operator + node.prefix];
    let obj = this.generateObject(node.argument);
    let name = this.generateName(node.argument);
    return function* () {
      self.emit('line', startLine(node));
      yield;
      return update(obj(), name());
    };
  }

  generateObject(node) {
    let type = node.type || Util.className(node);

    if(type === 'Identifier') {
      return this.getVariableStore.bind(this, node.value);
    } else if(type === 'MemberExpression') {
      return this.generateClosure(node.object);
    }
    console.warn('Unknown generateObject() type: ' + type);
    return noop;
  }

  generateName(node) {
    let type = node.type || Util.className(node);

    if(type === 'Identifier') {
      return function() {
        return node.value;
      };
    } else if(type === 'MemberExpression') {
      return this.memberExpressionProperty(node);
    }
    console.warn('Unknown generateName() type: ' + type);
    return noop;
  }

  generateLiteral(node) {
    let value;
    switch (node.species) {
      case 'string':
        value = node.value.replace(/^['"`](.*)['"`]$/, '$1');
        break;
      case 'number':
        value = +node.value;
        break;
      case 'boolean':
        value = Boolean(node.value);
        break;
      case 'object':
        value = node.value;
        break;
      default: throw new Error(`generateLiteral: no such species '${node.species}'`);
    }
    console.debug('generateLiteral', value);
    return function() {
      return value;
    };
  }

  generateIdentifier(node) {
    let self = this;
    log(node);
    let func = node.value == 'this' ? `function thisObj() { return env.currentThis; }` : `function identifier() { return env.getVariableStore('${node.value}')['${node.value}']; }`;
    console.debug('generateIdentifier', func);

    return new Function('env', `return ${func}`)(self);

    return function() {
      return self.getVariableStore(node.value)[node.value];
    };
  }

  getVariableStore(name) {
    let store = this.currentVariableStore;
    //log({name,store});

    do {
      if(store.vars.hasOwnProperty(name)) {
        //console.log(`getVariableStore(${name}) =`, store.vars);
        return store.vars;
      }
    } while((store = store.parent));

    // global object as fallback
    return this.globalObj;
  }

  generateAssignExpression(node) {
    let self = this;
    // prettier-ignore
    let setter = {
      '='(obj, name, val) { return (obj[name] = val); },
      '+='(obj, name, val) { return (obj[name] += val); },
      '-='(obj, name, val) { return (obj[name] -= val); },
      '*='(obj, name, val) { return (obj[name] *= val); },
      '/='(obj, name, val) { return (obj[name] /= val); },
      '%='(obj, name, val) { return (obj[name] %= val); },
      '<<='(obj, name, val) { return (obj[name] <<= val); },
      '>>='(obj, name, val) { return (obj[name] >>= val); },
      '>>>='(obj, name, val) { return (obj[name] >>>= val); },
      '|='(obj, name, val) { return (obj[name] |= val); },
      '^='(obj, name, val) { return (obj[name] ^= val); },
      '&='(obj, name, val) { return (obj[name] &= val); }
    }[node.operator];
    let obj = this.generateObject(node.left);
    let name = this.generateName(node.left);
    let val = this.generateClosure(node.right);
    return function* () {
      self.emit('line', (node.left.loc && node.left.loc.start.line) || ESNode.assoc(node.left).position.line);
      let v = val();
      if(v !== undefined) {
        if(v.next) {
          v = yield* v;
        }
      }
      return setter(obj(), name(), v);
    };
  }

  generateFunctionDeclaration(node) {
    const id = node.id || new Identifier('');
    log('generateFunctionDeclaration', { id, node, currentDeclarations: this.currentDeclarations });
    this.currentDeclarations[id.value] = this.generateFunctionExpression(node);
    log('generateFunctionDeclaration', { expr: this.currentDeclarations[id.value] });
    return function* () {
      return noop;
    };
  }

  generateVariableDeclaration(node) {
    let assignments = [];
    for(let i = 0; i < node.declarations.length; i++) {
      let decl = node.declarations[i];
      this.currentDeclarations[decl.id.name] = noop;
      if(decl.init) {
        assignments.push({
          type: 'AssignmentExpression',
          operator: '=',
          left: decl.id,
          right: decl.init
        });
      }
    }
    return this.generateClosure({
      type: 'BlockStatement',
      body: assignments
    });
  }

  getState() {
    return this.STATE;
  }

  setState(state) {
    this.STATE = state;
  }

  generateFunctionExpression(node) {
    let self = this;

    let oldDeclarations = self.currentDeclarations;
    self.currentDeclarations = {};
    log({ node, self });
    let body = self.generateClosure(node.body);
    let declarations = self.currentDeclarations;
    self.currentDeclarations = oldDeclarations;
    log({ body, declarations });

    // reset var store
    return function() {
      let parent = self.currentVariableStore;
      //log({ parent });
      return function* () {
        // build arguments object
        var args = new Arguments();
        args.length = arguments.length;
        for(let i = 0; i < arguments.length; i++) {
          args[i] = arguments[i];
        }

        // switch interpreter 'stack'
        let oldStore = self.currentVariableStore;
        let oldThis = self.currentThis;
        self.currentVariableStore = createVariableStore(parent);
        self.currentThis = this;

        addDeclarationsToStore(declarations, self.currentVariableStore);
        self.currentVariableStore.vars.arguments = args;

        // add function args to var store
        node.params.forEach((param, i) => {
          self.currentVariableStore.vars[param.name] = args[i];
        });

        console.log('generateFunctionExpression', { currentVariableStore: self.currentVariableStore, currentThis: self.currentThis });

        // run function body
        let result = yield* body();

        // switch 'stack' back
        self.currentThis = oldThis;
        self.currentVariableStore = oldStore;

        if(result instanceof Return) {
          return result.value;
        }
      };
    };
  }

  generateProgram(node) {
    let self = this;
    let stmtClosures = node.body.map(stmt => self.generateClosure(stmt));
    log({ stmtClosures });
    return function* () {
      let result;
      for(let i = 0; i < stmtClosures.length; i++) {
        if(stmtClosures[i].constructor.name === 'GeneratorFunction') {
          result = yield* stmtClosures[i]();
          yield;
        } else {
          result = stmtClosures[i]();
          yield;
        }
        if(result === Break || result === Continue || result instanceof Return) {
          break;
        }
      }
      //return last
      return result;
    };
  }

  generateExpressionStatement(node) {
    return this.generateClosure(node.expression);
  }

  generateEmptyStatement() {
    return noop;
  }

  generateReturnStatement(node) {
    let self = this;
    let arg = node.argument ? this.generateClosure(node.argument) : noop;

    let assoc = ESNode.assoc(node);
    let { position, tokens } = assoc;
    //console.debug("generateReturnStatement", { assoc,position,tokens});
    const line = position.line;
    log(node);
    return function() {
      self.emit('line', line);
      return new Return(arg());
    };
  }

  generateIfStatement(node) {
    let self = this;
    let test = function() {
      self.emit('line', startLine(node));
      return self.generateClosure(node.test)();
    };
    let consequent = this.generateClosure(node.consequent);
    let alternate = node.alternate
      ? this.generateClosure(node.alternate)
      : function* () {
          return noop;
        };

    return function* () {
      let result = test() ? yield* consequent() : yield* alternate();
      return result;
    };
  }

  generateConditionalStatement(node) {
    let self = this;
    let test = function() {
      self.emit('line', startLine(node));
      return self.generateClosure(node.test)();
    };
    let consequent = this.generateClosure(node.consequent);
    let alternate = node.alternate ? this.generateClosure(node.alternate) : noop;

    return function() {
      return test() ? consequent() : alternate();
    };
  }

  generateLoopStatement(node, body) {
    let self = this;
    /* prettier-ignore */ let init = node.init ? this.generateClosure(node.init) : function*() { return noop; };
    /* prettier-ignore */ let test = node.test ? function*() { self.emit('line', startLine(node)); return self.generateClosure(node.test)(); } : function*() { return true; };
    /* prettier-ignore */ let update = node.update ? this.generateClosure(node.update) : function*() { return noop; };
    body = body || this.generateClosure(node.body);

    return function* () {
      self.emit('line', startLine(node));
      let resp;
      for(yield* init(); yield* test(); yield* update()) {
        let newResp = yield* body();

        if(newResp === Break) {
          break;
        }
        if(newResp === Continue) {
          continue;
        }
        resp = newResp;
        if(newResp instanceof Return) {
          break;
        }
      }
      return resp;
    };
  }

  generateDoWhileStatement(node) {
    let body = this.generateClosure(node.body);
    let loop = this.generateLoopStatement(node, body);

    return function* () {
      yield* body();
      yield* loop();
    };
  }

  generateForInStatement(node) {
    let self = this;
    let right = self.generateClosure(node.right);
    let body = self.generateClosure(node.body);

    let left = node.left;
    if(left.type === 'VariableDeclaration') {
      self.currentDeclarations[left.declarations[0].id.name] = noop;
      left = left.declarations[0].id;
    }
    return function* () {
      self.emit('line', startLine(node));
      let resp;
      for(let x in right()) {
        self.emit('line', startLine(node));
        yield* self.generateAssignExpression({
          operator: '=',
          left,
          right: {
            type: 'Literal',
            value: x
          }
        })();
        resp = yield* body();
      }
      return resp;
    };
  }

  generateWithStatement(node) {
    let self = this;
    let obj = self.generateClosure(node.object);
    let body = self.generateClosure(node.body);
    return function* () {
      self.currentVariableStore = createVariableStore(self.currentVariableStore, obj());
      let result = yield* body();
      self.currentVariableStore = self.currentVariableStore.parent;
      return result;
    };
  }

  generateThrowStatement(node) {
    console.debug('generateThrowStatement:', node);
    let arg = this.generateClosure(node.expression);
    return function() {
      throw arg();
    };
  }

  generateTryStatement(node) {
    let block = this.generateClosure(node.block);
    let handler = this.generateCatchHandler(node.handler);
    let finalizer = node.finalizer
      ? this.generateClosure(node.finalizer)
      : function(x) {
          return x;
        };

    return function() {
      try {
        return finalizer(block());
      } catch(err) {
        return finalizer(handler(err));
      }
    };
  }

  generateCatchHandler(node) {
    if(!node) {
      return noop;
    }
    let self = this;
    let body = self.generateClosure(node.body);
    return function(err) {
      let old = self.currentVariableStore.vars[node.param.name];
      self.currentVariableStore.vars[node.param.name] = err;
      let resp = body();
      self.currentVariableStore.vars[node.param.name] = old;

      return resp;
    };
  }

  generateContinueStatement() {
    return function() {
      return Continue;
    };
  }

  generateBreakStatement() {
    return function() {
      return Break;
    };
  }

  generateSwitchStatement(node) {
    let self = this;

    let discriminant = self.generateClosure(node.discriminant);
    let cases = node.cases.map(currentCase => ({
      test: currentCase.test ? self.generateClosure(currentCase.test) : null,
      code: self.generateProgram({ body: currentCase.consequent })
    }));

    return function* () {
      let foundMatch = false;
      let discriminantVal = discriminant();
      let resp, defaultCase;

      for(let i = 0; i < cases.length; i++) {
        let currentCase = cases[i];
        if(!foundMatch) {
          if(!currentCase.test) {
            defaultCase = currentCase;
            continue;
          }
          if(discriminantVal !== currentCase.test()) {
            continue;
          }
          foundMatch = true;
        }
        // foundMatch is guaranteed to be true here
        let newResp = yield* currentCase.code();
        if(newResp === Break) {
          return resp;
        }
        resp = newResp;
        if(resp === Continue || resp instanceof Return) {
          return resp;
        }
      }
      if(!foundMatch && defaultCase) {
        return yield* defaultCase.code();
      }
    };
  }
}

export function evaluate(code) {
  let env = new Environment(global);
  let iterator = env.generate(code)();
  let result = iterator.next();
  while(!result.done) {
    result = iterator.next();
  }
  return result.value;
}

//log(exports.evaluate("1 + 1"));
