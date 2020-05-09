import Util from "../util.js";

export class Node {
  constructor(type) {
    //this.type = type;
    //this.loc = null; // TODO: For now avoid dealing with location information.
    // Fix it later.
  }
}

export class Program extends Node {
  constructor(body) {
    super("Program");
    this.body = body;
  }
}

export class Expression extends Node {
  constructor(type = "Expression") {
    super(type);
  }
}

export class FunctionLiteral extends Node {
  constructor(type, id, params, body, exported, async, generator) {
    super(type);
    this.id = id;
    this.params = params;
    this.body = body;
    this.exported = exported;
    this.async = async;
    this.generator = generator;
  }
}

export class Identifier extends Expression {
  constructor(value) {
    super("Identifier");
    this.value = value;
  }
}

export class BindingProperty extends Expression {
  constructor(property, element, initializer) {
    super("BindingProperty");
    this.property = property;
    this.element = element;

    if(initializer) this.initializer = initializer;
  }
}

export class Literal extends Expression {
  constructor(value) {
    super("Literal");
    this.value = value;
  }
}

export class ThisExpression extends Expression {
  constructor() {
    super("ThisExpression");
  }
}

export class UnaryExpression extends Expression {
  constructor(operator, argument, prefix) {
    super("UnaryExpression");
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
  }
}

export class UpdateExpression extends Expression {
  constructor(operator, argument, prefix) {
    super("UpdateExpression");
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
  }
}

export class BinaryExpression extends Expression {
  constructor(operator, left, right) {
    super("BinaryExpression");
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

export class AssignmentExpression extends Expression {
  constructor(operator, left, right) {
    super("AssignmentExpression");
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

export class LogicalExpression extends Expression {
  constructor(operator, left, right) {
    super("LogicalExpression");
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

export class MemberExpression extends Expression {
  constructor(obj, prop /*, comp = false*/) {
    super("MemberExpression");
    this.object = obj;
    this.property = prop;
    //this.computed = comp;
  }
}

export class InExpression extends Expression {
  constructor(obj, prop) {
    super("InExpression");
    this.object = obj;
    this.property = prop;
  }
}

export class ConditionalExpression extends Expression {
  constructor(test, consequent, alternate) {
    super("ConditionalExpression");
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

export class CallExpression extends Expression {
  constructor(callee, args) {
    super("CallExpression");
    this.arguments = args;
    this.callee = callee;
  }
}

export class DecoratorExpression extends CallExpression {
  constructor(callee, args, _class) {
    super("DecoratorExpression");
    this.callee = callee;
    this.arguments = args;
    this.class = _class;
  }
}

export class NewExpression extends Expression {
  constructor(callee, args) {
    super("NewExpression");
    this.callee = callee;
    this.arguments = args;
  }
}

export class SequenceExpression extends Expression {
  constructor(expressions) {
    super("SequenceExpression");
    this.expressions = expressions;
  }
}

export class Statement extends Node {
  constructor(type) {
    super(type);
  }
}

export class BlockStatement extends Statement {
  constructor(statements) {
    super("BlockStatement");
    this.body = statements;
  }
}

export class StatementList extends Statement {
  constructor(statements) {
    super("StatementList");
    this.body = statements;
  }
}

export class EmptyStatement extends Statement {
  constructor() {
    super("EmptyStatement");
  }
}

export class ExpressionStatement extends Statement {
  constructor(expression) {
    super("ExpressionStatement");
    this.expression = expression;
  }
}

export class ReturnStatement extends Statement {
  constructor(argument) {
    super("ReturnStatement");
    this.argument = argument;
  }
}

export class ContinueStatement extends Statement {
  constructor() {
    super("ContinueStatement");
  }
}

export class BreakStatement extends Statement {
  constructor() {
    super("BreakStatement");
  }
}

export class IfStatement extends Statement {
  constructor(test, consequent, alternate) {
    super("IfStatement");
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

export class SwitchStatement extends Statement {
  constructor(test, cases) {
    super("SwitchStatement");
    this.test = test;
    this.cases = cases;
  }
}
export class CaseClause extends Statement {
  constructor(value, body) {
    super("CaseClause");
    this.value = value;
    this.body = body;
  }
}

export class WhileStatement extends Statement {
  constructor(test, body) {
    super("WhileStatement");
    this.test = test;
    this.body = body;
  }
}

export class DoStatement extends Statement {
  constructor(test, body) {
    super("DoStatement");
    this.test = test;
    this.body = body;
  }
}

export class ForStatement extends Statement {
  constructor(init, test, update, body) {
    super("ForStatement");
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }
}

export class ForInStatement extends Statement {
  constructor(left, right, body) {
    super("ForInStatement");
    this.left = left;
    this.right = right;
    this.body = body;
  }
}

export class WithStatement extends Statement {
  constructor(test, body) {
    super("WithStatement");
    this.test = test;
    this.body = body;
  }
}

export class TryStatement extends Statement {
  constructor(body, parameters, trap) {
    super("TryStatement");
    this.body = body;
    this.parameters = parameters;
    this.trap = trap;
  }
}

export class ThrowStatement extends Statement {
  constructor(expression) {
    super("ThrowStatement");
    this.expression = expression;
  }
}

export class ImportStatement extends Statement {
  constructor(identifiers, sourceFile) {
    super("ImportStatement");
    this.identifiers = identifiers;
    this.source = sourceFile;
  }
}

export class ExportStatement extends Statement {
  constructor(what, declarations) {
    super("ExportStatement");
    this.what = what;
    this.declarations = declarations;
  }
}

export class Declaration extends Statement {
  constructor(type = "Declaration") {
    super(type);
  }
}

export class ClassDeclaration extends Declaration {
  constructor(id, extending, members, exported = false) {
    super("ClassDeclaration");
    this.id = id;
    this.extending = extending;
    this.members = members;
    this.exported = exported;
    // console.log('New ClassDeclaration: ', JSON.stringify({ id, extending, // exported }));
  }
}

export class FunctionDeclaration extends FunctionLiteral {
  constructor(id, params, body, exported = false, async = false, generator = false) {
    super("FunctionDeclaration", id, params, body, exported, async, generator);
    // console.log('New FunctionDeclaration: ', JSON.stringify({ id, params, // exported }));
  }
}

export class ArrowFunction extends Node {
  constructor(params, body, is_async) {
    super("ArrowFunction");
    this.async = is_async;
    this.params = params;
    this.body = body;
    // console.log('New FunctionDeclaration: ', JSON.stringify({ id, params, // exported }));
  }
}

export class VariableDeclaration extends Declaration {
  constructor(declarations, kind = "var", exported = false) {
    super("VariableDeclaration");
    this.kind = kind;
    this.exported = exported;
    this.declarations = declarations;
    // console.log('New VariableDeclaration: ', JSON.stringify({ kind, exported
    // }));
  }
}

export class VariableDeclarator extends Node {
  constructor(identifier, initialValue) {
    super("VariableDeclarator");
    this.id = identifier;
    this.init = initialValue;
    // console.log('New VariableDeclarator: ', JSON.stringify({ identifier:
    // identifier.value }));
  }
}

export class ObjectLiteral extends Node {
  constructor(members) {
    super("ObjectLiteral");
    this.members = members;
    // console.log('New ObjectLiteral: ', Object.keys(members));
  }
}

export class PropertyDefinition extends Node {

  static GETTER = 1;
  static SETTER = 2;

  constructor(id, value, getter_or_setter) {
    super("PropertyDefinition");
    this.id = id;
    this.value = value;
    this.getter_or_setter = getter_or_setter;
  }
}

export class ArrayLiteral extends Node {
  constructor(elements) {
    super("ArrayLiteral");
    this.elements = elements;
    // console.log('New ArrayLiteral: ', Object.keys(members));
  }
}

export class JSXLiteral extends Node {
  constructor(tag, attributes, closing = false, selfClosing = false, children = []) {
    super("JSXLiteral");
    this.tag = tag;
    this.attributes = attributes;
    this.closing = closing;
    this.selfClosing = selfClosing;
    this.children = children;
    // console.log('New JSXLiteral: ', tag, JSX.keys(attributes));
  }
}

export class BindingPattern extends Identifier {
  constructor(properties) {
    super("BindingPattern");
    this.properties = properties;
  }
}

export class ArrayBindingPattern extends BindingPattern {
  constructor(elements) {
    super("ArrayBindingPattern");
    this.elements = elements;
  }
}

export class ObjectBindingPattern extends BindingPattern {
  constructor(properties) {
    super("ObjectBindingPattern");
    this.properties = properties;
  }
}

export class AwaitExpression extends Expression {
  constructor(value) {
    super("AwaitExpression");
    this.value = value;
  }
}

export class RestOfExpression extends Node {
  constructor(value) {
    super("RestOfExpression");
    this.value = value;
  }
}
export class SpreadElement extends Node {
  constructor(expr) {
    super("SpreadElement");
    this.expr = expr;
  }
}

Node.prototype.type = null;

Node.prototype.toString = function() {
  let s = "";
  ["alternate", "argument", "arguments", "body", "callee", "computed", "consequent", "declarations", "exported", "expression", "expressions", "id", "identifiers", "init", "kind", "left", "loc", "members", "object", "operator", "params", "prefix", "property", "right", "source", "test", "update", "value"].forEach(field => {
    if(this[field]) {
      let value = this[field];
      if(value.value !== undefined) {
        value = `"${value.value}"`;
      } else if(value instanceof Array) {
        value = `[\n  ${this[field].map(child => child.toString().replace(/\n/g, "\n  ")).join(",\n  ")}\n]`;
        value = value.replace(/\n/g, "\n  ");
      } else if(typeof value === "object" && !(value instanceof Array)) {
        value = Util.className(value);
      }
      if(s.length) s += ",\n  ";
      s += `${field} = ${value}`;
    }
  });
  return `${this.type} {\n  ${s}\n}`;
};

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
  IfStatement,
  SwitchStatement,
  CaseClause,
  ImportStatement,
  ExportStatement,
  JSXLiteral,
  Literal,
  LogicalExpression,
  MemberExpression,
  InExpression,
  NewExpression,
  Node,
  ObjectBindingPattern,
  ObjectLiteral,
PropertyDefinition,
  Program,
  RestOfExpression,
  ReturnStatement,
  SequenceExpression,
  SpreadElement,
  Statement,
  StatementList,
  ThisExpression,
  ThrowStatement,
  TryStatement,
  UnaryExpression,
  UpdateExpression,
  VariableDeclaration,
  VariableDeclarator,
  WhileStatement,
  WithStatement
};

export const Factory = (function() {
  const nodeList = [];
  var self = function estree(ctor, ...args) {
    ctor = typeof ctor == "string" ? CTORS[ctor] : ctor;
    let instance = new ctor(...args);
    self.nodes.push(instance);
    //console.log("factory ret:",instance);
    return instance;
  };
  self.nodes = nodeList;
  self.stack = [];
  self.loc = { pos: -1, column: -1, line: -1 };
  return self;
})();

export const estree = Object.assign(
  {},
  Object.keys(CTORS).reduce(
    (acc, nodeName) => ({
      ...acc,
      [nodeName]: function(...args) {
        return Factory(nodeName, ...args);
      }
    }),
    Factory
  )
);

//export default estree;
