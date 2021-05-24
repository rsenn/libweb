import Util from '../util.js';
import inspect from '../objectInspect.js';

const inspectSymbol = Symbol.for(Util.getPlatform() == 'quickjs' ? 'quickjs.inspect.custom' : 'nodejs.util.inspect.custom'
);
const linebreak = /\r?\n/g;

export class ESNode {
  //position = null;

  static lastNode = null;

  constructor(type = 'Node') {
    //Util.define(this, { type });
    this.type = type;

    ESNode.lastNode = this;
  }

  /*static get assocMap() {
    return this.assoc.map;
  }*/

  [inspectSymbol](depth, opts = {}) {
    const color = Util.coloring(opts.colors);
    const { type, ...props } = Util.getMembers(this);

    //  console.log(`ESNode `, text+'');
    return Object.getOwnPropertyNames(this).reduce((acc, name) => ({ ...acc, [name]: this[name] }),
      {}
    );

    return ((type ? color.text(type, 1, 31) : color.text(Util.className(this), 1, 35)) +
      ' ' +
      inspect(props, { ...opts, customInspect: false })
    );
  }

  /* toJSON() {
    let members = Util.getMembers();
    for(let prop in members) {
      let value = members[prop];
      if(Util.isObject(value) && value instanceof ESNode)
        members[prop] = value.toJSON();
    }
    return members;
  }*/
}

Object.defineProperty(ESNode.prototype, 'position', {
  value: undefined,
  enumerable: false,
  writable: true
});
ESNode.assoc = Util.weakMapper(() => ({}), (ESNode.assocMap = new Map())); // Util.weakAssoc();

export class Program extends ESNode {
  constructor(sourceType, body = []) {
    super('Program');
    this.sourceType = sourceType;
    this.body = body;
  }
}

/** A module `import` or `export` declaration. */
export class ModuleDeclaration extends ESNode {
  constructor(type = 'ModuleDeclaration') {
    super(type);
  }
}

/** A specifier in an import or export declaration. */
export class ModuleSpecifier extends ESNode {
  constructor(type = 'ModuleSpecifier', local) {
    super(type);
    this.local = local;
  }
}

/** An import declaration, e.g., `import foo from "mod";`. */
export class ImportDeclaration extends ModuleDeclaration {
  constructor(specifiers, source) {
    super('ImportDeclaration');
    this.specifiers = specifiers;
    this.source = source;
  }
}

/**
 * An imported variable binding, e.g., `{foo}` in `import {foo} from "mod"` or
 * `{foo as bar}` in `import {foo as bar} from "mod"`. The `imported` field refers
 * to the name of the export imported from the module. The `local` field refers to
 * the binding imported into the local module scope. If it is a basic named import,
 * such as in `import {foo} from "mod"`, both `imported` and `local` are equivalent
 * `Identifier` nodes; in this case an `Identifier` node representing `foo`. If it
 * is an aliased import, such as in `import {foo as bar} from "mod"`, the
 * `imported` field is an `Identifier` node representing `foo`, and the `local`
 * field is an `Identifier` node representing `bar`.
 */
export class ImportSpecifier extends ModuleSpecifier {
  constructor(imported, local) {
    super('ImportSpecifier', local);
    this.imported = imported;
  }
}

/** A default import specifier, e.g., `foo` in `import foo from "mod.js"`. */
export class ImportDefaultSpecifier extends ModuleSpecifier {
  constructor(local) {
    super('ImportDefaultSpecifier', local);
  }
}

/** A namespace import specifier, e.g., `* as foo` in `import * as foo from "mod.js"`. */
export class ImportNamespaceSpecifier extends ModuleSpecifier {
  constructor(local) {
    super('ImportNamespaceSpecifier', local);
  }
}

export class Super extends ESNode {
  constructor() {
    super('Super');
  }
}

export class Expression extends ESNode {
  constructor(type = 'Expression') {
    super(type);
  }
}

export class FunctionLiteral extends ESNode {
  constructor(id, params, body, _async = false, generator = false) {
    super('Function');
    this.id = id;
    this.params = params;
    this.body = body;
    this.generator = generator;
    this.async = _async;
  }
}

export class Pattern extends ESNode {
  constructor(type = 'Pattern') {
    super(type);
  }
}

export class Identifier extends Pattern {
  constructor(name) {
    super('Identifier');
    this.name = name;
  }

  static string(node) {
    return node.name;
  }

  toString(n, opts = {}) {
    return this.name;
  }

  [Symbol.toStringTag](...args) {
    return this[inspectSymbol](...args);
  }

  [inspectSymbol](n, opts = {}) {
    const { colors } = opts;
    let c = Util.coloring(colors);
    return c.text(`Identifier `, 1, 31) + c.text(this.name, 1, 33);
  }
}

export class Literal extends Expression {
  constructor(raw, value) {
    super('Literal');

    this.raw = raw;
    this.value = value;
  }

  toString() {
    return this.value;
  }

  static string(node) {
    return Util.isObject(node) && typeof node.value == 'string'
      ? node.value.replace(/^['"`](.*)['"`]$/, '$1').replace(/\\n/g, '\n')
      : undefined;
  }

  /*[inspectSymbol](n, opts = {}) {
    const { type, value } = this;
    let c = Util.coloring(opts.colors);
    let q = !Util.isNumeric(value) && !value.startsWith('/') ? "'" : '';
    return (c.text(type, 1, 31) +
      ' ' +
      c.text(q + value + q, 1, value.startsWith('/') ? 35 : 36)
    );
  }*/
}

export class RegExpLiteral extends Literal {
  constructor(pattern, flags) {
    super();
    this.type = 'RegExpLiteral';
    //this.value = {}; //new RegExp(pattern,flags);
    this.raw = `/${pattern}/${flags}`;
    this.regex = {
      pattern,
      flags
    };
  }
}

export class TemplateLiteral extends Expression {
  constructor(quasis, expressions) {
    super('TemplateLiteral');
    this.quasis = quasis;
    this.expressions = expressions;
  }
}

export class BigIntLiteral extends Literal {
  constructor(value) {
    super(value, undefined, 'BigIntLiteral');
  }
}

export class TaggedTemplateExpression extends Expression {
  constructor(tag, quasi) {
    super('TaggedTemplateExpression');
    this.tag = tag;
    this.quasi = quasi;
  }
}

export class TemplateElement extends ESNode {
  constructor(tail, raw, cooked) {
    super('TemplateElement');
    this.tail = tail;
    this.value = {
      raw,
      cooked
    };
  }
}

export class ThisExpression extends Expression {
  constructor() {
    super('ThisExpression');
  }
}

export class UnaryExpression extends Expression {
  constructor(operator, argument, prefix) {
    super('UnaryExpression');
    this.operator = operator;
    this.prefix = prefix;
    this.argument = argument;
  }
}

export class UpdateExpression extends Expression {
  constructor(operator, argument, prefix) {
    super('UpdateExpression');
    this.operator = operator;
    this.prefix = prefix;
    this.argument = argument;
  }
}

export class BinaryExpression extends Expression {
  constructor(operator, left, right) {
    super('BinaryExpression');
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

export class AssignmentExpression extends Expression {
  constructor(operator, left, right) {
    super('AssignmentExpression');
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

export class LogicalExpression extends Expression {
  constructor(operator, left, right) {
    super('LogicalExpression');
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

export class MemberExpression extends Expression {
  constructor(object, property, computed = false, optional = false) {
    super('MemberExpression');
    this.object = object;
    this.property = property;
    this.computed = computed;

    if(optional) this.optional = optional;
  }
}

export class ChainExpression extends Expression {
  constructor(expression) {
    super('ChainExpression');
    this.expression = expression;
  }
}

export class ConditionalExpression extends Expression {
  constructor(test, consequent, alternate) {
    super('ConditionalExpression');
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

export class CallExpression extends Expression {
  constructor(callee, args, optional = false) {
    super('CallExpression');
    this.callee = callee;
    this.arguments = args;

    if(optional) this.optional = true;
  }
}

export class DecoratorExpression extends CallExpression {
  constructor(callee, args, _class) {
    super('DecoratorExpression');
    this.callee = callee;
    this.arguments = args;
    this.class = _class;
  }
}

export class NewExpression extends Expression {
  constructor(callee, args) {
    super('NewExpression');
    this.callee = callee;
    this.arguments = args;
  }
}

export class SequenceExpression extends Expression {
  constructor(expressions) {
    super('SequenceExpression');
    this.expressions = expressions;
  }
}

export class Statement extends ESNode {
  constructor(type = 'Statement') {
    super(type);
  }
}

export class EmptyStatement extends Statement {
  constructor() {
    super('EmptyStatement');
  }
}

export class DebuggerStatement extends Statement {
  constructor() {
    super('DebuggerStatement');
  }
}

export class LabeledStatement extends Statement {
  constructor(label, body) {
    super('LabeledStatement');
    this.label = label;
    this.body = body;
  }
}

export class BlockStatement extends Statement {
  constructor(body) {
    super('BlockStatement');
    this.body = body;
  }
}
export class FunctionBody extends BlockStatement {
  constructor(body) {
    super(body);
    this.type = 'BlockStatement';
  }
}

export class StatementList extends Statement {
  constructor(statements) {
    super('StatementList');
    this.body = statements;
  }
}

export class ExpressionStatement extends Statement {
  constructor(expression) {
    super('ExpressionStatement');
    this.expression = expression;
  }
}

export class Directive extends ExpressionStatement {
  constructor(expression) {
    super(expression);
    this.type = 'Directive';
    this.directive = Literal.string(this.expression);
  }
}

export class ReturnStatement extends Statement {
  constructor(argument) {
    super('ReturnStatement');
    this.argument = argument;
  }
}

export class ContinueStatement extends Statement {
  constructor(label = null) {
    super('ContinueStatement');
    this.label = label;
  }
}

export class BreakStatement extends Statement {
  constructor(label = null) {
    super('BreakStatement');
    this.label = label;
  }
}

export class IfStatement extends Statement {
  constructor(test, consequent, alternate) {
    super('IfStatement');
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

export class SwitchStatement extends Statement {
  constructor(discriminant, cases) {
    super('SwitchStatement');
    this.discriminant = discriminant;
    this.cases = cases;
  }
}

export class SwitchCase extends ESNode {
  constructor(test, consequent) {
    super('SwitchCase');
    this.test = test;
    this.consequent = consequent;
  }
}

export class WhileStatement extends Statement {
  constructor(test, body) {
    super('WhileStatement');
    this.test = test;
    this.body = body;
  }
}

export class DoWhileStatement extends Statement {
  constructor(test, body) {
    super('DoWhileStatement');
    this.body = body;
    this.test = test;
  }
}

export class ForStatement extends Statement {
  constructor(init, test, update, body) {
    super('ForStatement');
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }
}

export class ForInStatement extends Statement {
  constructor(left, right, body) {
    super('ForInStatement');
    this.left = left;
    this.right = right;
    this.body = body;
  }
}

export class ForOfStatement extends ForInStatement {
  constructor(left, right, body, _await = false) {
    super(left, right, body);
    this.type = 'ForOfStatement';
    this.await = _await;
  }
}

export class WithStatement extends Statement {
  constructor(object, body) {
    super('WithStatement');
    this.object = object;
    this.body = body;
  }
}

/** A `try` statement. If `handler` is `null` then `finalizer` must be a `BlockStatement`. */
export class TryStatement extends Statement {
  constructor(block, handler, finally_bock) {
    super('TryStatement');
    this.block = block;
    this.handler = handler;
    this.finally_bock = finally_bock;
  }
}

export class CatchClause extends ESNode {
  constructor(param, body) {
    super('CatchClause');
    this.param = param;
    this.body = body;
  }
}

export class ThrowStatement extends Statement {
  constructor(argument) {
    super('ThrowStatement');
    this.argument = argument;
  }
}

export class Declaration extends Statement {
  constructor(type = 'Declaration') {
    super(type);
  }
}

export class ClassDeclaration extends Declaration {
  constructor(id, superClass, body) {
    super('Class');
    this.id = id;
    this.superClass = superClass;
    this.body = body;
  }
}

export class ClassBody extends ESNode {
  constructor(body) {
    super('ClassBody');

    this.body = body;
  }
}

export class MethodDefinition extends ESNode {
  constructor(key, value, kind = 'method', computed = false, _static = false) {
    super('MethodDefinition');
    this.key = key;
    this.value = value;
    this.kind = kind;
    this.computed = computed;
    this.static = _static;
  }
}

export class MetaProperty extends Expression {
  constructor(meta, identifier) {
    super('MetaProperty');
    this.meta = meta;
    this.identifier = identifier;
  }
}

export class YieldExpression extends Expression {
  constructor(argument, delegate = false) {
    super('YieldExpression');
    this.argument = argument;
    this.delegate = delegate;
  }
}

export class FunctionArgument extends ESNode {
  constructor(arg, defaultValue) {
    super('FunctionArgument');
    this.arg = arg;
    if(defaultValue) this.defaultValue = defaultValue;
  }
}

export class FunctionDeclaration extends FunctionLiteral {
  constructor(id, params, body, is_async = false, generator = false) {
    super(id, params, body, is_async, generator);
    this.type = 'FunctionDeclaration';
  }
}

export class ArrowFunctionExpression extends ESNode {
  constructor(params, body, is_async) {
    super('ArrowFunctionExpression');
    if(is_async) this.is_async = is_async;
    this.params = params;
    this.body = body;
    //console.log('New FunctionDeclaration: ', JSON.toString({ id, params, // exported }));
  }
}

export class VariableDeclaration extends Declaration {
  constructor(declarations, kind = 'var') {
    super('VariableDeclaration');
    this.declarations = declarations;
    this.kind = kind;
  }
}

export class VariableDeclarator extends ESNode {
  constructor(id, init) {
    super('VariableDeclarator');
    this.id = id;
    this.init = init;
  }
}

export class ObjectExpression extends ESNode {
  constructor(properties) {
    super('ObjectExpression');
    this.properties = properties;
  }
}

export class Property extends ESNode {
  constructor(key, value, kind = 'init', method = false, shorthand = false, computed = false) {
    super('Property');
    this.key = key;
    this.value = value;
    this.kind = kind;
    if(method) this.method = method;
    if(shorthand) this.shorthand = shorthand;
    if(computed) this.computed = computed;
  }
}
/*export class MemberVariable extends ESNode {
  static STATIC = 4;

  constructor(id, value, flags) {
    super('MemberVariable');
    this.id = id;
    this.value = value;
    this.flags = flags;
  }
}*/

export class ArrayExpression extends ESNode {
  constructor(elements) {
    super('ArrayExpression');
    this.elements = elements;
  }
}

export class JSXLiteral extends ESNode {
  constructor(tag, attributes, closing = false, selfClosing = false, children = [], spread) {
    super('JSXLiteral');
    this.tag = tag;
    this.attributes = attributes;
    this.closing = closing;
    this.selfClosing = selfClosing;
    this.children = children;
    this.spread = spread;
    //console.log('New JSXLiteral: ', tag, JSX.keys(attributes));
  }
}

export class AssignmentProperty extends Property {
  constructor(key, value, shorthand = false, computed = false) {
    super(key, value, 'init', false, shorthand, computed);
    this.type = 'Property';
  }
}

export class ObjectPattern extends Pattern {
  constructor(properties) {
    super('ObjectPattern');
    this.properties = properties;
  }
}

export class ArrayPattern extends Pattern {
  constructor(elements) {
    super('ArrayPattern');
    this.elements = elements;
  }
}

export class RestElement extends Pattern {
  constructor(argument) {
    super('RestElement');
    this.argument = argument;
  }
}

export class AssignmentPattern extends Pattern {
  constructor(left, right) {
    super('AssignmentPattern');
    this.left = left;
    this.right = right;
  }
}

export class AwaitExpression extends Expression {
  constructor(argument) {
    super('AwaitExpression');
    this.argument = argument;
  }
}

export class SpreadElement extends ESNode {
  constructor(argument) {
    super('SpreadElement');
    this.argument = argument;
  }
}

export class ExportNamedDeclaration extends ModuleDeclaration {
  constructor(declaration, specifiers, source) {
    super('ExportNamedDeclaration');
    this.declaration = declaration;
    this.specifiers = specifiers;
    this.source = source;
  }
}

export class ExportSpecifier extends ModuleSpecifier {
  constructor(exported, local) {
    super('ExportSpecifier', local);
    this.exported = exported;
  }
}

export class AnonymousDefaultExportedFunctionDeclaration extends FunctionLiteral {
  constructor(id, params, body, _async = false, generator = false) {
    super(id, params, body, _async, generator);
    this.type = 'FunctionDeclaration';
  }
}

export class AnonymousDefaultExportedClassDeclaration extends ClassDeclaration {
  constructor(id, superClass, body) {
    super(id, superClass, body);
    this.type = 'ClassDeclaration';
  }
}

export class ExportDefaultDeclaration extends ModuleDeclaration {
  constructor(declaration) {
    super('ExportDefaultDeclaration');
    this.declaration = declaration;
  }
}

export class ExportAllDeclaration extends ModuleDeclaration {
  constructor(source) {
    super('ExportAllDeclaration');
    this.source = source;
  }
}

ESNode.prototype.type = null;

/*
ESNode.prototype.toString = function() {
  let s = '';
  ['alternate', 'argument', 'arguments', 'body', 'callee', 'computed', 'consequent', 'declarations', 'exported', 'expression', 'expressions', 'id', 'identifiers', 'init', 'kind', 'left', 'loc', 'members', 'object', 'operator', 'params', 'prefix', 'property', 'right', 'source', 'test', 'update', 'value'].forEach((field) => {
    if(this[field]) {
      let value = this[field];
      if(value.value !== undefined) {
        value = `"${value.value}"`;
      } else if(value instanceof Array) {
        value = `[\n  ${this[field].filter(child => child !== undefined).map((child) => child.toString().replace(linebreak, '\n  ')).join(',\n  ')}\n]`;
        value = value.replace(linebreak, '\n  ');
      } else if(typeof value === 'object' && !(value instanceof Array)) {
        value = Util.className(value);
      }
      if(s.length) s += ',\n  ';
      s += `${field} = ${value}`;
    }
  });
  return `${this.type} {\n  ${s}\n}`;
};
*/
export const CTORS = {
  ESNode,
  Program,
  ModuleDeclaration,
  ModuleSpecifier,
  ImportDeclaration,
  ImportSpecifier,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  Super,
  Expression,
  FunctionLiteral,
  Pattern,
  Identifier,
  Literal,
  RegExpLiteral,
  TemplateLiteral,
  BigIntLiteral,
  TaggedTemplateExpression,
  TemplateElement,
  ThisExpression,
  UnaryExpression,
  UpdateExpression,
  BinaryExpression,
  AssignmentExpression,
  LogicalExpression,
  MemberExpression,
  ChainExpression,
  ConditionalExpression,
  CallExpression,
  DecoratorExpression,
  NewExpression,
  SequenceExpression,
  Statement,
  EmptyStatement,
  DebuggerStatement,
  LabeledStatement,
  BlockStatement,
  FunctionBody,
  StatementList,
  ExpressionStatement,
  Directive,
  ReturnStatement,
  ContinueStatement,
  BreakStatement,
  IfStatement,
  SwitchStatement,
  SwitchCase,
  WhileStatement,
  DoWhileStatement,
  ForStatement,
  ForInStatement,
  ForOfStatement,
  WithStatement,
  TryStatement,
  CatchClause,
  ThrowStatement,
  Declaration,
  ClassDeclaration,
  ClassBody,
  MethodDefinition,
  MetaProperty,
  YieldExpression,
  FunctionArgument,
  FunctionDeclaration,
  ArrowFunctionExpression,
  VariableDeclaration,
  VariableDeclarator,
  ObjectExpression,
  Property,
  ArrayExpression,
  JSXLiteral,
  AssignmentProperty,
  ObjectPattern,
  ArrayPattern,
  RestElement,
  AssignmentPattern,
  AwaitExpression,
  SpreadElement,
  ExportNamedDeclaration,
  ExportSpecifier,
  AnonymousDefaultExportedFunctionDeclaration,
  AnonymousDefaultExportedClassDeclaration,
  ExportDefaultDeclaration,
  ExportAllDeclaration
};

export function Factory() {
  const nodeList = [];
  var self = function estree(ctor, ...args) {
    ctor = typeof ctor == 'string' ? CTORS[ctor] : ctor;
    let instance = new ctor(...args);
    self.callback(ctor, args, instance);

    /*console.log("factory ret:",instance);*/
    return instance;
  };
  self.nodes = nodeList;
  self.stack = [];
  self.loc = { pos: -1, column: -1, line: -1 };
  self.callback = node => self.nodes.push(node);
  self.classes = Object.keys(CTORS).reduce((acc, nodeName) => ({
      ...acc,
      [nodeName](...args) {
        return self(nodeName, ...args);
      }
    }),
    {}
  );

  return self;
}

export const estree = (function () {
  const factory = Factory();
  return factory.classes;
})();

export default estree;
