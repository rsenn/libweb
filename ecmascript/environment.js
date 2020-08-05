/* jshint esversion: 6 */
/* jshint noyield: true */

'use strict';

//TODO:
//- LabeledStatement -> including use in break/continue
//- nicer error handling?
//-> TESTS
//-> BENCHMARKS

//var parse = require('acorn').parse;
//import util from 'util';
import EventEmitter from '../eventEmitter.js';
import Util from '../util.js';
import { estree, ESNode, Factory, PropertyDefinition, BinaryExpression, Identifier, TemplateLiteral, ImportStatement, Literal, MemberExpression, FunctionDeclaration, ArrowFunction, SequenceExpression, ObjectBindingPattern } from './estree.js';

function noop() {}

function execute(func) {
  var result = func();
  if('' + result === 'null') {
    return result;
  }
  // FIXME: Convert to yield*
  if(result !== undefined) {
    if(result.next) {
      var iter = result;
      var res = iter.next();
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
var Break = {};
var Continue = {};

function createVariableStore(parent, vars) {
  vars = vars || {};
  return {
    parent: parent,
    vars: vars
  };
}

function addDeclarationsToStore(declarations, varStore) {
  for(var key in declarations) {
    if(declarations.hasOwnProperty(key) && !varStore.vars.hasOwnProperty(key)) {
      varStore.vars[key] = declarations[key]();
    }
  }
}

function startLine(node) {
  let assoc = ESNode.assoc(node);
  let { position } = assoc;
  const line = position.line;
  return line;
}

export class Environment extends EventEmitter {
  constructor(globalObjects = {}) {
    super();
    //  EventEmitter.call(this);
    if(!Array.isArray(globalObjects)) {
      globalObjects = [globalObjects];
    }
    var parent;
    globalObjects.forEach(function(vars) {
      parent = createVariableStore(parent, vars);
    });
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
    var opts = {
      locations: true
    };
    /*   if(typeof node === 'string')
      node = parse(node, opts);
 */
    var resp = this.generateClosure(node);
    addDeclarationsToStore(this.currentDeclarations, this.currentVariableStore);
    this.currentDeclarations = {};
    return resp;
  }

  generateClosure(node) {
    let type = node.type || Util.className(node);
    var closure = (
      {
        BinaryExpression: this.generateBinaryExpression,
        ImportStatement: this.generateImportStatement,
        LogicalExpression: this.generateBinaryExpression,
        UnaryExpression: this.generateUnaryExpression,
        UpdateExpression: this.generateUpdateExpression,
        ObjectExpression: this.generateObjectExpression,
        ArrayExpression: this.generateArrayExpression,
        CallExpression: this.generateCallExpression,
        NewExpression: this.generateNewExpression,
        MemberExpression: this.generateMemberExpression,
        ThisExpression: this.generateThisExpression,
        SequenceExpression: this.generateSequenceExpression,
        Literal: this.generateLiteral,
        Identifier: this.generateIdentifier,
        AssignmentExpression: this.generateAssignExpression,
        FunctionDeclaration: this.generateFunctionDeclaration,
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
        DoWhileStatement: this.generateDoWhileStatement,
        ForInStatement: this.generateForInStatement,
        WithStatement: this.generateWithStatement,
        ThrowStatement: this.generateThrowStatement,
        TryStatement: this.generateTryStatement,
        ContinueStatement: this.generateContinueStatement,
        BreakStatement: this.generateBreakStatement,
        SwitchStatement: this.generateSwitchStatement
      }[type] ||
      function() {
        console.warn('Not implemented yet: ' + type);
        return noop;
      }
    ).call(this, node);

    if(this.DEBUG) {
      return function() {
        var info = 'closure for ' + type + ' called';
        var line = ((node.loc || {}).start || {}).line;
        if(line) {
          info += ' while processing line ' + line;
        }
        var resp = closure();
        info += '. Result:';
        console.log(ESNode.assoc(node).position.toString(), info, resp);
        return resp;
      };
    }
    return closure;
  }

  generateBinaryExpression(node) {
    var a = this.generateClosure(node.left);
    var b = this.generateClosure(node.right);

    function* callExpression(expr) {
      var result;
      if(expr.constructor.name == 'GeneratorFunction') {
        result = yield* expr();
      } else {
        result = expr();
      }
      return result;
    }

    // prettier-ignore
    var cmp = {
      '==': function*() {return (yield* callExpression(a)) == (yield* callExpression(b)); },
      '!=': function*() {return (yield* callExpression(a)) != (yield* callExpression(b)); },
      '===': function*() {return (yield* callExpression(a)) === (yield* callExpression(b)); },
      '!==': function*() {return (yield* callExpression(a)) !== (yield* callExpression(b)); },
      '<': function*() { return (yield* callExpression(a)) < (yield* callExpression(b)); },
      '<=': function*() { return (yield* callExpression(a)) <= (yield* callExpression(b)); },
      '>': function*() { return (yield* callExpression(a)) > (yield* callExpression(b)); },
      '>=': function*() { return (yield* callExpression(a)) >= (yield* callExpression(b)); },
      '<<': function*() { return (yield* callExpression(a)) << (yield* callExpression(b)); },
      '>>': function*() { return (yield* callExpression(a)) >> (yield* callExpression(b)); },
      '>>>': function*() { return (yield* callExpression(a)) >>> (yield* callExpression(b)); },
      '+': function*() { return (yield* callExpression(a)) + (yield* callExpression(b)); },
      '-': function*() { return (yield* callExpression(a)) - (yield* callExpression(b)); },
      '*': function*() { return (yield* callExpression(a)) * (yield* callExpression(b)); },
      '/': function*() { return (yield* callExpression(a)) / (yield* callExpression(b)); },
      '%': function*() { return (yield* callExpression(a)) % (yield* callExpression(b)); },
      '|': function*() { return (yield* callExpression(a)) | (yield* callExpression(b)); },
      '^': function*() { return (yield* callExpression(a)) ^ (yield* callExpression(b)); },
      '&': function*() { return (yield* callExpression(a)) & (yield* callExpression(b)); },
      in: function*() { return (yield* callExpression(a)) in (yield* callExpression(b)); },
      instanceof: function*() { return (yield* callExpression(a)) instanceof (yield* callExpression(b)); },
      // logic expressions
      '||': function*() { return (yield* callExpression(a)) || (yield* callExpression(b)); },
      '&&': function*() { return (yield* callExpression(a)) && (yield* callExpression(b)); }
    }[node.operator];

    return function() {
      // FIXME: Convert to yield*
      var iter = cmp();
      var res = iter.next();
      while(!res.done) {
        res = iter.next();
      }
      return res.value;
    };
  }

  generateImportStatement(node) {
    const { identifiers, source } = node;
    console.log(ESNode.assoc(node).position.toString(), 'ImportStatement:', node);
    let importFile = source.value;
    return function() {
      import(importFile).then(handle => {
        console.log(ESNode.assoc(node).position.toString(), 'handle:', handle);
      });
    };
  }

  generateUnaryExpression(node) {
    if(node.operator === 'delete') {
      return this.generateDelete(node);
    }
    var a = this.generateClosure(node.argument);
    // prettier-ignore
    var op = {
      '-': function() { return -a(); },
      '+': function() { return +a(); },
      '!': function() { return !a(); },
      '~': function() { return ~a(); },
      typeof: function() { return typeof a(); },
      void: function() { return void a(); }
    }[node.operator];

    return function() {
      return op();
    };
  }

  generateDelete(node) {
    var obj = this.generateObject(node.argument);
    var attr = this.generateName(node.argument);

    return function() {
      return delete obj()[attr()];
    };
  }

  generateObjectExpression(node) {
    //TODO property.kind: don't assume init when it can also be set/get
    var self = this;
    var items = [];
    node.properties.forEach(function(property) {
      // object expression keys are static so can be calculated
      // immediately
      var key = self.objKey(property.key)();
      items.push({
        key: key,
        getVal: self.generateClosure(property.value)
      });
    });

    return function() {
      var result = {};
      items.forEach(function(item) {
        result[item.key] = item.getVal();
      });
      return result;
    };
  }

  generateArrayExpression(node) {
    var items = node.elements.map(this.boundGen);

    return function() {
      return items.map(execute);
    };
  }

  objKey(node) {
    let type = node.type || Util.className(node);

    var key;
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
    var self = this;
    var callee;
    if(node.callee.type === 'MemberExpression') {
      var obj = self.generateObject(node.callee);
      var name = self.generateName(node.callee);
      callee = function() {
        var theObj = obj();
        return theObj[name()].bind(theObj);
      };
    } else {
      callee = self.generateClosure(node.callee);
    }
    var args = node.arguments.map(self.generateClosure.bind(self));

    return function*() {
      self.emit('line', startLine(node));
      var c = callee();

      if(c === undefined) {
        return c;
      }

      var result;
      var res;

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
    var callee = this.generateClosure(node.callee);
    var args = node.arguments.map(this.boundGen);
    var self = this;

    return function*() {
      self.emit('line', startLine(node));
      var cl = callee();
      var ar = args.map(execute);
      var newObject = Object.create(cl.prototype);
      var constructor = cl.apply(newObject, ar);
      yield* constructor;
      return newObject;
    };
  }

  generateMemberExpression(node) {
    var self = this;
    let { object, property } = node;
    let memberExpression = { object: object.value, property: property.value };
    console.log(ESNode.assoc(node).position.toString(), 'MemberExpression ', memberExpression);
    var obj = this.generateClosure(object);
    let member = this.memberExpressionProperty(node);
    var str = (s, v = 'node.value') => (s + '').replace(/\s+/g, ' ').replace(/(node\.value|key)/g, v);
    //  console.log(ESNode.assoc(node).position.toString(), 'MemberExpression\n  obj()      = ', obj() || str(obj,`'${node.object.value}'`), '\n  property() = ', property());
    return function() {
      self.emit('line', startLine(node));
      return obj()[member()];
    };
  }

  memberExpressionProperty(node) {
    return node.computed ? this.generateClosure(node.property) : this.objKey(node.property);
  }

  generateThisExpression() {
    var self = this;
    return function() {
      return self.currentThis;
    };
  }

  generateSequenceExpression(node) {
    var exprs = node.expressions.map(this.boundGen);
    return function() {
      var result;
      exprs.forEach(function(expr) {
        result = expr();
      });
      return result;
    };
  }

  generateUpdateExpression(node) {
    var self = this;
    // prettier-ignore
    var update = {
      '--true': function(obj, name) { return --obj[name]; },
      '--false': function(obj, name) { return obj[name]--; },
      '++true': function(obj, name) { return ++obj[name]; },
      '++false': function(obj, name) { return obj[name]++; } }[node.operator + node.prefix];
    var obj = this.generateObject(node.argument);
    var name = this.generateName(node.argument);
    return function*() {
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
    } else {
      console.warn('Unknown generateObject() type: ' + type);
      return noop;
    }
  }

  generateName(node) {
    let type = node.type || Util.className(node);

    if(type === 'Identifier') {
      return function() {
        return node.value;
      };
    } else if(type === 'MemberExpression') {
      return this.memberExpressionProperty(node);
    } else {
      console.warn('Unknown generateName() type: ' + type);
      return noop;
    }
  }

  generateLiteral(node) {
    return function() {
      return node.value;
    };
  }

  generateIdentifier(node) {
    var self = this;
    console.log(ESNode.assoc(node).position.toString(), node);

    return function() {
      return self.getVariableStore(node.value)[node.value];
    };
  }

  getVariableStore(name) {
    var store = this.currentVariableStore;

    do {
      if(store.vars.hasOwnProperty(name)) {
        console.log(`getVariableStore(${name}) =`, store.vars);
        return store.vars;
      }
    } while((store = store.parent));

    // global object as fallback
    return this.globalObj;
  }

  generateAssignExpression(node) {
    var self = this;
    // prettier-ignore
    var setter = {
      '=': function(obj, name, val) { return (obj[name] = val); },
      '+=': function(obj, name, val) { return (obj[name] += val); },
      '-=': function(obj, name, val) { return (obj[name] -= val); },
      '*=': function(obj, name, val) { return (obj[name] *= val); },
      '/=': function(obj, name, val) { return (obj[name] /= val); },
      '%=': function(obj, name, val) { return (obj[name] %= val); },
      '<<=': function(obj, name, val) { return (obj[name] <<= val); },
      '>>=': function(obj, name, val) { return (obj[name] >>= val); },
      '>>>=': function(obj, name, val) { return (obj[name] >>>= val); },
      '|=': function(obj, name, val) { return (obj[name] |= val); },
      '^=': function(obj, name, val) { return (obj[name] ^= val); },
      '&=': function(obj, name, val) { return (obj[name] &= val); }
    }[node.operator];
    var obj = this.generateObject(node.left);
    var name = this.generateName(node.left);
    var val = this.generateClosure(node.right);
    return function*() {
      self.emit('line', node.left.loc.start.line);
      var v = val();
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
    console.log(ESNode.assoc(node).position.toString(), 'FunctionDeclaration:', { id, node });
    this.currentDeclarations[id.value] = this.generateFunctionExpression(node);
    return function*() {
      return noop;
    };
  }

  generateVariableDeclaration(node) {
    var assignments = [];
    for(var i = 0; i < node.declarations.length; i++) {
      var decl = node.declarations[i];
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
    var self = this;

    var oldDeclarations = self.currentDeclarations;
    self.currentDeclarations = {};
    var body = self.generateClosure(node.body);
    var declarations = self.currentDeclarations;
    self.currentDeclarations = oldDeclarations;

    // reset var store
    return function() {
      var parent = self.currentVariableStore;
      return function*() {
        // build arguments object var args = new Arguments();
        args.length = arguments.length;
        for(var i = 0; i < arguments.length; i++) {
          args[i] = arguments[i];
        }

        // switch interpreter 'stack'
        var oldStore = self.currentVariableStore;
        var oldThis = self.currentThis;
        self.currentVariableStore = createVariableStore(parent);
        self.currentThis = this;

        addDeclarationsToStore(declarations, self.currentVariableStore);
        self.currentVariableStore.vars.arguments = args;

        // add function args to var store
        node.params.forEach(function(param, i) {
          self.currentVariableStore.vars[param.name] = args[i];
        });

        // run function body
        var result = yield* body();

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
    var self = this;
    var stmtClosures = node.body.map(function(stmt) {
      return self.generateClosure(stmt);
    });

    return function*() {
      var result;
      for(var i = 0; i < stmtClosures.length; i++) {
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
    var self = this;
    var arg = node.argument ? this.generateClosure(node.argument) : noop;

    let assoc = ESNode.assoc(node);
    let { position } = assoc;
    const line = position.line;
    console.log(ESNode.assoc(node).position.toString(), node);
    return function() {
      self.emit('line', line);
      return new Return(arg());
    };
  }

  generateIfStatement(node) {
    var self = this;
    var test = function() {
      self.emit('line', startLine(node));
      return self.generateClosure(node.test)();
    };
    var consequent = this.generateClosure(node.consequent);
    var alternate = node.alternate
      ? this.generateClosure(node.alternate)
      : function*() {
          return noop;
        };

    return function*() {
      var result = test() ? yield* consequent() : yield* alternate();
      return result;
    };
  }

  generateConditionalStatement(node) {
    var self = this;
    var test = function() {
      self.emit('line', startLine(node));
      return self.generateClosure(node.test)();
    };
    var consequent = this.generateClosure(node.consequent);
    var alternate = node.alternate ? this.generateClosure(node.alternate) : noop;

    return function() {
      return test() ? consequent() : alternate();
    };
  }

  generateLoopStatement(node, body) {
    var self = this;
    /* prettier-ignore */ var init = node.init ? this.generateClosure(node.init) : function*() {return noop; };
    /* prettier-ignore */ var test = node.test ? function*() {self.emit('line', startLine(node)); return self.generateClosure(node.test)(); } : function*() { return true; };
    /* prettier-ignore */ var update = node.update ? this.generateClosure(node.update) : function*() {return noop; };
    body = body || this.generateClosure(node.body);

    return function*() {
      self.emit('line', startLine(node));
      var resp;
      for(yield* init(); yield* test(); yield* update()) {
        var newResp = yield* body();

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
    var body = this.generateClosure(node.body);
    var loop = this.generateLoopStatement(node, body);

    return function*() {
      yield* body();
      yield* loop();
    };
  }

  generateForInStatement(node) {
    var self = this;
    var right = self.generateClosure(node.right);
    var body = self.generateClosure(node.body);

    var left = node.left;
    if(left.type === 'VariableDeclaration') {
      self.currentDeclarations[left.declarations[0].id.name] = noop;
      left = left.declarations[0].id;
    }
    return function*() {
      self.emit('line', startLine(node));
      var resp;
      for(var x in right()) {
        self.emit('line', startLine(node));
        yield* self.generateAssignExpression({
          operator: '=',
          left: left,
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
    var self = this;
    var obj = self.generateClosure(node.object);
    var body = self.generateClosure(node.body);
    return function*() {
      self.currentVariableStore = createVariableStore(self.currentVariableStore, obj());
      var result = yield* body();
      self.currentVariableStore = self.currentVariableStore.parent;
      return result;
    };
  }

  generateThrowStatement(node) {
    var arg = this.generateClosure(node.argument);
    return function() {
      throw arg();
    };
  }

  generateTryStatement(node) {
    var block = this.generateClosure(node.block);
    var handler = this.generateCatchHandler(node.handler);
    var finalizer = node.finalizer
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
    var self = this;
    var body = self.generateClosure(node.body);
    return function(err) {
      var old = self.currentVariableStore.vars[node.param.name];
      self.currentVariableStore.vars[node.param.name] = err;
      var resp = body();
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
    var self = this;

    var discriminant = self.generateClosure(node.discriminant);
    var cases = node.cases.map(function(currentCase) {
      return {
        test: currentCase.test ? self.generateClosure(currentCase.test) : null,
        code: self.generateProgram({ body: currentCase.consequent })
      };
    });

    return function*() {
      var foundMatch = false;
      var discriminantVal = discriminant();
      var resp, defaultCase;

      for(var i = 0; i < cases.length; i++) {
        var currentCase = cases[i];
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
        var newResp = yield* currentCase.code();
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
  var env = new Environment(global);
  var iterator = env.generate(code)();
  var result = iterator.next();
  while(!result.done) {
    result = iterator.next();
  }
  return result.value;
}

//console.log(ESNode.assoc(node).position.toString(), exports.evaluate("1 + 1"));
