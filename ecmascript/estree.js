import Util from '../util.js';

export class ESNode {
  //position = null;

  static lastNode = null;
  static assoc = Util.weakAssoc();

  constructor(type) {
    //this.type = type;
    //this.loc = null; // TODO: For now avoid dealing with location information.
    //Fix it later.
    //Object.defineProperty(this, 'position', { value: null, enumerable: false, writable: true });

    ESNode.lastNode = this;
  }
}

Object.defineProperty(ESNode.prototype, 'position', {
  value: undefined,
  enumerable: false,
  writable: true
});

export class Program extends ESNode {
  constructor(body) {
    super('Program');
    this.body = body;
  }
}

export class Expression extends ESNode {
  constructor(type = 'Expression') {
    super(type);
  }
}

export class FunctionLiteral extends ESNode {
  constructor(type, id, params, body, is_async, generator) {
    super(type);

    this.id = id;
    this.params = params;
    this.body = body;
    //this.exported = exported;
    if (is_async) this.is_async = is_async;
    if (generator) this.generator = generator;
  }
}

export class Identifier extends Expression {
  constructor(value) {
    super('Identifier');
    this.value = value;
  }
}
export class ComputedPropertyName extends ESNode {
  constructor(expr) {
    super('ComputedPropertyName');
    this.expr = expr;
  }
}

export class BindingProperty extends Expression {
  constructor(property, element, initializer) {
    super('BindingProperty');
    this.id = property;
    this.value = element;

    if (initializer) this.initializer = initializer;
  }
}

export class Literal extends Expression {
  constructor(value) {
    super('Literal');
    this.value = value;
  }
}

export class TemplateLiteral extends Expression {
  constructor(parts) {
    super('TemplateLiteral');
    this.parts = parts;
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
  constructor(obj, prop /*, comp = false*/) {
    super('MemberExpression');
    this.object = obj;
    this.property = prop;
    //this.computed = comp;
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
    this.arguments = args;
    this.callee = callee;
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
  constructor(type) {
    super(type);
  }
}

export class BlockStatement extends Statement {
  constructor(statements) {
    super('BlockStatement');
    this.body = statements;
  }
}

export class StatementList extends Statement {
  constructor(statements) {
    super('StatementList');
    this.body = statements;
  }
}

export class EmptyStatement extends Statement {
  constructor() {
    super('EmptyStatement');
  }
}

export class ExpressionStatement extends Statement {
  constructor(expression) {
    super('ExpressionStatement');
    this.expression = expression;
  }
}

export class ReturnStatement extends Statement {
  constructor(argument) {
    super('ReturnStatement');
    this.argument = argument;
  }
}

export class ContinueStatement extends Statement {
  constructor() {
    super('ContinueStatement');
  }
}

export class BreakStatement extends Statement {
  constructor() {
    super('BreakStatement');
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
  constructor(left, right, body, operator = 'in', async = false) {
    super('ForInStatement');
    this.left = left;
    this.right = right;
    this.body = body;
    this.operator = operator;
    if (async) this.async = true;
  }
}

export class WithStatement extends Statement {
  constructor(test, body) {
    super('WithStatement');
    this.test = test;
    this.body = body;
  }
}

export class TryStatement extends Statement {
  constructor(body, parameters, catch_block, finally_bock) {
    super('TryStatement');
    this.body = body;
    this.parameters = parameters;
    this.catch_block = catch_block;
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

export class ImportStatement extends Statement {
  constructor(identifiers, sourceFile, doExport = false) {
    super('ImportStatement');
    this.identifiers = identifiers;
    this.source = sourceFile;
    if (doExport) this.export = true;
  }
}

export class ExportStatement extends Statement {
  constructor(what, declarations) {
    super('ExportStatement');
    this.what = what;
    this.declarations = declarations;
  }
}

export class Declaration extends Statement {
  constructor(type = 'Declaration') {
    super(type);
  }
}

export class ClassDeclaration extends ESNode {
  constructor(id, extending, members) {
    super('ClassDeclaration');
    this.id = id;
    this.extending = extending;
    this.members = members;
    //this.exported = exported;
    //console.log('New ClassDeclaration: ', JSON.toString({ id, extending, // exported }));
  }
}

export class FunctionDeclaration extends FunctionLiteral {
  constructor(id, params, body, exported = false, is_async = false, generator = false) {
    super('FunctionDeclaration', id, params, body, is_async, generator);
    if (exported) this.exported = exported;
  }
}

export class ArrowFunction extends ESNode {
  constructor(params, body, is_async) {
    super('ArrowFunction');
    if (is_async) this.is_async = is_async;
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

export class ObjectLiteral extends ESNode {
  constructor(members) {
    super('ObjectLiteral');
    this.members = members;
    //console.log('New ObjectLiteral: ', Object.keys(members));
  }
}

export class PropertyDefinition extends ESNode {
  static GETTER = 1;
  static SETTER = 2;
  static STATIC = 4;

  constructor(id, value, flags) {
    super('PropertyDefinition');
    this.id = id;
    this.value = value;
    this.flags = flags;
  }
}

export class MemberVariable extends ESNode {
  static STATIC = 4;

  constructor(id, value, flags) {
    super('MemberVariable');
    this.id = id;
    this.value = value;
    this.flags = flags;
  }
}

export class ArrayLiteral extends ESNode {
  constructor(elements) {
    super('ArrayLiteral');
    this.elements = elements;
    //console.log('New ArrayLiteral: ', Object.keys(members));
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
  constructor(expr) {
    super('SpreadElement');
    this.expr = expr;
  }
}

ESNode.prototype.type = null;

/*
ESNode.prototype.toString = function () {
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
  ArrayLiteral,
  ArrowFunction,
  AssignmentExpression,
  AwaitExpression,
  BinaryExpression,
  BindingPattern,
  BindingProperty,
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
  FunctionDeclaration,
  Identifier,
  ComputedPropertyName,
  IfStatement,
  SwitchStatement,
  CaseClause,
  ImportStatement,
  ExportStatement,
  JSXLiteral,
  Literal,
  TemplateLiteral,
  LogicalExpression,
  MemberExpression,
  InExpression,
  NewExpression,
  ESNode,
  ObjectBindingPattern,
  ObjectLiteral,
  PropertyDefinition,
  MemberVariable,
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
  self.callback = (node) => self.nodes.push(node);
  self.classes = Object.keys(CTORS).reduce(
    (acc, nodeName) => ({
      ...acc,
      [nodeName] (...args) {
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
