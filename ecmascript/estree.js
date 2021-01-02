import Util from '../util.js';
const inspectSymbol = Symbol.for('nodejs.util.inspect.custom');

export class ESNode {
  //position = null;

  static lastNode = null;
  static assoc = Util.weakAssoc();

  constructor(type = 'Node') {
    Util.define(this, { type });

    ESNode.lastNode = this;
  }

  static get assocMap() {
    return this.assoc.mapper.map;
  }
}

Object.defineProperty(ESNode.prototype, 'position', {
  value: undefined,
  enumerable: false,
  writable: true
});

export class Program extends ESNode {
  constructor(body = []) {
    super('Program');
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
    super('ModuleSpecifier');
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
    super('ImportDefaultSpecifier', local);
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
  constructor( id, params, body,  _async = false, generator = false) {
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

export class ComputedPropertyName extends ESNode {
  constructor(expr) {
    super('ComputedPropertyName');
    this.expr = expr;
  }
}

export class BindingProperty extends Expression {
  constructor(property, id, initializer) {
    super('BindingProperty');
    this.property = property;
    this.id = id;

    if(initializer) this.initializer = initializer;
  }
}

export class Literal extends Expression {
  constructor(value, species) {
    super('Literal');
    this.value = value;
    Util.define(this, { species });
  }

  toString() {
    return this.value;
  }

  static string(node) {
    return Util.isObject(node) && typeof node.value == 'string'
      ? node.value.replace(/^['"`](.*)['"`]$/, '$1').replace(/\\n/g, '\n')
      : undefined;
  }

  /* [inspectSymbol](n, opts = {}) {
  console.log("Literal.inspect", this.value);
  const { colors } = opts;
    const { value } = this;
    let c = Util.coloring(colors);
    return c.text(`Literal `, 1, 31) + c.text(value, 1, value.startsWith('/') ? 35 : 36);
  }*/
}

export class TemplateLiteral extends Expression {
  constructor(quasis, expressions) {
    super('TemplateLiteral');
    this.quasis = quasis;
    this.expressions = expressions;
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
  constructor(tail, value) {
    super('TemplateElement');
    this.tail = tail;
    this.value = value;
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
    this.argument = argument;
    this.prefix = prefix;
  }
}

export class UpdateExpression extends Expression {
  constructor(operator, argument, prefix) {
    super('UpdateExpression');
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
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
  constructor(obj, prop, optional) {
    super('MemberExpression');
    this.object = obj;
    this.property = prop;
    this.optional = optional;
  }
}

export class InExpression extends Expression {
  constructor(obj, prop) {
    super('InExpression');
    this.object = obj;
    this.property = prop;
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
  constructor(callee, args) {
    super('CallExpression');
    this.callee = callee;
    this.arguments = args;
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

export class LabelledStatement extends Statement {
  constructor(label, statement) {
    super('LabelledStatement');
    this.label = label;
    this.statement = statement;
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
    this.type = 'FunctionBody';
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
  constructor(label) {
    super('ContinueStatement');
    if(label) this.label = label;
  }
}

export class BreakStatement extends Statement {
  constructor(label) {
    super('BreakStatement');
    if(label) this.label = label;
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
  constructor(test, cases) {
    super('SwitchStatement');
    this.test = test;
    this.cases = cases;
  }
}
export class CaseClause extends Statement {
  constructor(value, body) {
    super('CaseClause');
    this.value = value;
    this.body = body;
  }
}

export class WhileStatement extends Statement {
  constructor(test, body) {
    super('WhileStatement');
    this.test = test;
    this.body = body;
  }
}

export class DoStatement extends Statement {
  constructor(test, body) {
    super('DoStatement');
    this.test = test;
    this.body = body;
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
  constructor(left, right, body, operator = 'in', isAsync = false) {
    super('ForInStatement');
    this.left = left;
    this.right = right;
    this.body = body;
    this.operator = operator;
    this['async'] = isAsync;
  }
}

export class WithStatement extends Statement {
  constructor(test, body) {
    super('WithStatement');
    this.test = test;
    this.body = body;
  }
}

/** A `try` statement. If `handler` is `null` then `finalizer` must be a `BlockStatement`. */
export class TryStatement extends Statement {
  constructor(block, parameters, handler, finally_bock) {
    super('TryStatement');
    this.block = block;
    this.parameters = parameters;
    this.handler = handler;
    this.finally_bock = finally_bock;
  }
}

export class ThrowStatement extends Statement {
  constructor(expression) {
    super('ThrowStatement');
    this.expression = expression;
  }
}

export class YieldStatement extends Statement {
  constructor(expression, generator = false) {
    super('YieldStatement');
    this.expression = expression;
    this.generator = generator;
  }
}

export class ExportStatement extends Statement {
  constructor(what, declarations, sourceFile) {
    super('ExportStatement');
    this.what = what;
    this.declarations = declarations;
    if(sourceFile) this.source = sourceFile;
  }
}

export class Declaration extends Statement {
  constructor(type = 'Declaration') {
    super(type);
  }
}

export class ClassDeclaration extends ESNode {
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

export class FunctionArgument extends ESNode {
  constructor(arg, defaultValue) {
    super('FunctionArgument');
    this.arg = arg;
    if(defaultValue) this.defaultValue = defaultValue;
  }
}

export class FunctionDeclaration extends FunctionLiteral {
  constructor(id, params, body,   is_async = false, generator = false) {
    super(id, params, body, is_async, generator);
    this.type = 'FunctionDeclaration';
   }
}

export class ArrowFunction extends ESNode {
  constructor(params, body, is_async) {
    super('ArrowFunction');
    if(is_async) this.is_async = is_async;
    this.params = params;
    this.body = body;
    //console.log('New FunctionDeclaration: ', JSON.toString({ id, params, // exported }));
  }
}

export class VariableDeclaration extends Declaration {
  constructor(declarations, kind = 'var' /*, exported = false*/) {
    super('VariableDeclaration');
    this.kind = kind;
    //this.exported = exported;
    this.declarations = declarations;
    //console.log('New VariableDeclaration: ', JSON.toString({ kind, exported
    //}));
  }
}

export class VariableDeclarator extends ESNode {
  constructor(identifier, initialValue) {
    super('VariableDeclarator');
    this.id = identifier;
    this.init = initialValue;
    //console.log('New VariableDeclarator: ', JSON.toString({ identifier:
    //identifier.value }));
  }
}
/*
export class ImportSpecifier extends ESNode {
  constructor(name, as) {
    super('ImportSpecifier');
    this.name = name;
    this.as = as;
  }
}
*/

export class ObjectExpression extends ESNode {
  constructor(members) {
    super('ObjectExpression');
    this.members = members;
    //console.log('New ObjectExpression: ', Object.keys(members));
  }
}

export class PropertyDefinition extends ESNode {
  constructor(key, value, kind = 'init', method = false, shorthand = false, computed = false) {
    super('Property');
    this.key = key;
    this.value = value;
    this.kind = kind;
    this.method = method;
    this.shorthand = shorthand;
    this.computed = computed;
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
    //console.log('New ArrayExpression: ', Object.keys(members));
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

export class BindingPattern extends Expression {
  constructor(properties) {
    super('BindingPattern');
    this.properties = properties;
  }
}

export class ArrayBindingPattern extends Expression {
  constructor(elements) {
    super('ArrayBindingPattern');
    this.elements = elements;
  }
}

export class ObjectBindingPattern extends Expression {
  constructor(properties) {
    super('ObjectBindingPattern');
    this.properties = properties;
  }
}

export class AwaitExpression extends Expression {
  constructor(value) {
    super('AwaitExpression');
    this.value = value;
  }
}

export class RestOfExpression extends ESNode {
  constructor(value) {
    super('RestOfExpression');
    this.value = value;
  }
}
export class SpreadElement extends ESNode {
  constructor(argument) {
    super('SpreadElement');
    this.argument = argument;
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
        value = `[\n  ${this[field].filter(child => child !== undefined).map((child) => child.toString().replace(/\n/g, '\n  ')).join(',\n  ')}\n]`;
        value = value.replace(/\n/g, '\n  ');
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
  ArrayBindingPattern,
  ArrayExpression,
  ArrowFunction,
  AssignmentExpression,
  AwaitExpression,
  BinaryExpression,
  BindingPattern,
  BindingProperty,
  LabelledStatement,
  BlockStatement,
  BreakStatement,
  CallExpression,
  ClassDeclaration,
  ConditionalExpression,
  ContinueStatement,
  Declaration,
  DecoratorExpression,
  DoStatement,
  EmptyStatement,
  Expression,
  ExpressionStatement,
  ForInStatement,
  ForStatement,
  FunctionLiteral,
  FunctionArgument,
  FunctionDeclaration,
  Identifier,
  ComputedPropertyName,
  IfStatement,
  SwitchStatement,
  CaseClause,
  ImportDeclaration,
  ExportStatement,
  JSXLiteral,
  Literal,
  TemplateLiteral,
  TaggedTemplateExpression,
  TemplateElement,
  LogicalExpression,
  MemberExpression,
  InExpression,
  NewExpression,
  ESNode,
  ObjectBindingPattern,
  ImportSpecifier,
  ObjectExpression,
  PropertyDefinition,
  MethodDefinition,
  Program,
  RestOfExpression,
  ReturnStatement,
  SequenceExpression,
  SpreadElement,
  Statement,
  StatementList,
  ThisExpression,
  ThrowStatement,
  YieldStatement,
  TryStatement,
  UnaryExpression,
  UpdateExpression,
  VariableDeclaration,
  VariableDeclarator,
  WhileStatement,
  WithStatement
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
