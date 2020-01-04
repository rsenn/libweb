const Util = require('../util.es5.js');

const e = exports;

class Node {
  constructor(type) {
    this.type = type;
    this.loc = null; // TODO: For now avoid dealing with location information. Fix it later.
  }
}

class Program extends Node {
  constructor(body) {
    super('Program');
    this.body = body;
  }
}

class Expression extends Node {
  constructor(type = 'Expression') {
    super(type);
  }
}

class Function extends Node {
  constructor(type, id, params, body, exported) {
    super(type);
    this.id = id;
    this.params = params;
    this.body = body;
    this.exported = exported;
  }
}

class Identifier extends Expression {
  constructor(value) {
    super('Identifier');
    this.value = value;
  }
}

class BindingProperty extends Expression {
  constructor(property, element) {
    super('BindingProperty');
    this.property = property;
    this.element = element;
  }
}

class Literal extends Expression {
  constructor(value) {
    super('Literal');
    this.value = value;
  }
}

class ThisExpression extends Expression {
  constructor() {
    super('ThisExpression');
  }
}

class UnaryExpression extends Expression {
  constructor(operator, argument, prefix) {
    super('UnaryExpression');
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
  }
}

class UpdateExpression extends Expression {
  constructor(operator, argument, prefix) {
    super('UpdateExpression');
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
  }
}

class BinaryExpression extends Expression {
  constructor(operator, left, right) {
    super('BinaryExpression');
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

class AssignmentExpression extends Expression {
  constructor(operator, left, right) {
    super('AssignmentExpression');
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

class LogicalExpression extends Expression {
  constructor(operator, left, right) {
    super('LogicalExpression');
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

class MemberExpression extends Expression {
  constructor(obj, prop, comp = false) {
    super('MemberExpression');
    this.object = obj;
    this.property = prop;
    this.computed = comp;
  }
}

class ConditionalExpression extends Expression {
  constructor(test, consequent, alternate) {
    super('ConditionalExpression');
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

class CallExpression extends Expression {
  constructor(callee, args) {
    super('CallExpression');
    this.callee = callee;
    this.arguments = args;
  }
}

class DecoratorExpression extends CallExpression {
  constructor(callee, args, _class) {
    super('DecoratorExpression');
    this.callee = callee;
    this.arguments = args;
    this.class = _class;
  }
}

class NewExpression extends Expression {
  constructor(callee, args) {
    super('NewExpression');
    this.callee = callee;
    this.arguments = args;
  }
}

class SequenceExpression extends Expression {
  constructor(expressions) {
    super('SequenceExpression');
    this.expressions = expressions;
  }
}

class Statement extends Node {
  constructor(type) {
    super(type);
  }
}

class BlockStatement extends Statement {
  constructor(statements) {
    super('BlockStatement');
    this.body = statements;
  }
}

class StatementList extends Statement {
  constructor(statements) {
    super('StatementList');
    this.body = statements;
  }
}

class EmptyStatement extends Statement {
  constructor() {
    super('EmptyStatement');
  }
}

class ExpressionStatement extends Statement {
  constructor(expression) {
    super('ExpressionStatement');
    this.expression = expression;
  }
}

class ReturnStatement extends Statement {
  constructor(argument) {
    super('ReturnStatement');
    this.argument = argument;
  }
}

class ContinueStatement extends Statement {
  constructor() {
    super('ContinueStatement');
  }
}

class BreakStatement extends Statement {
  constructor() {
    super('BreakStatement');
  }
}

class IfStatement extends Statement {
  constructor(test, consequent, alternate) {
    super('IfStatement');
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

class WhileStatement extends Statement {
  constructor(test, body) {
    super('WhileStatement');
    this.test = test;
    this.body = body;
  }
}

class DoStatement extends Statement {
  constructor(test, body) {
    super('DoStatement');
    this.test = test;
    this.body = body;
  }
}

class ForStatement extends Statement {
  constructor(init, test, update, body) {
    super('ForStatement');
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }
}

class ForInStatement extends Statement {
  constructor(left, right, body) {
    super('ForInStatement');
    this.left = left;
    this.right = right;
    this.body = body;
  }
}

class WithStatement extends Statement {
  constructor(test, body) {
    super('WithStatement');
    this.test = test;
    this.body = body;
  }
}

class ImportStatement extends Statement {
  constructor(identifiers, sourceFile) {
    super('ImportStatement');
    this.identifiers = identifiers;
    this.source = sourceFile;
  }
}

class Declaration extends Statement {
  constructor(type = 'Declaration') {
    super(type);
  }
}

class ClassDeclaration extends Declaration {
  constructor(id, extending, body, exported = false) {
    super('ClassDeclaration');
    this.id = id;
    this.extending = extending;
    this.body = body;
    this.exported = exported;
    //console.log('New ClassDeclaration: ', JSON.stringify({ id, extending, exported }));
  }
}

class FunctionDeclaration extends Function {
  constructor(id, params, body, exported = false) {
    super('FunctionDeclaration', id, params, body, exported);
    // console.log('New FunctionDeclaration: ', JSON.stringify({ id, params, exported }));
  }
}

class VariableDeclaration extends Declaration {
  constructor(declarations, kind = 'var', exported = false) {
    super('VariableDeclaration');
    this.declarations = declarations;
    this.kind = kind;
    this.exported = exported;
    //console.log('New VariableDeclaration: ', JSON.stringify({ kind, exported }));
  }
}

class VariableDeclarator extends Node {
  constructor(identifier, initialValue) {
    super('VariableDeclarator');
    this.id = identifier;
    this.init = initialValue;
    //console.log('New VariableDeclarator: ', JSON.stringify({ identifier: identifier.value }));
  }
}

class ObjectLiteral extends Node {
  constructor(members) {
    super('ObjectLiteral');
    this.members = members;
    //console.log('New ObjectLiteral: ', Object.keys(members));
  }
}

class ArrayLiteral extends Node {
  constructor(members) {
    super('ArrayLiteral');
    this.members = members;
    //console.log('New ArrayLiteral: ', Object.keys(members));
  }
}

class JSXLiteral extends Node {
  constructor(tag, attributes) {
    super('JSXLiteral');
    this.tag = tag;
    this.attributes = attributes;
    //console.log('New JSXLiteral: ', tag, JSX.keys(attributes));
  }
}

class BindingPattern extends Identifier {
  constructor(properties) {
    super('BindingPattern');
    this.properties = properties;
  }
}

class ArrayBinding extends BindingPattern {
  constructor(properties) {
    super('ArrayBinding');
    this.properties = properties;
  }
}

class ObjectBinding extends BindingPattern {
  constructor(properties) {
    super('ObjectBinding');
    this.properties = properties;
  }
}

e.Node = Node;
e.Program = Program;
e.Identifier = Identifier;
e.BindingProperty = BindingProperty;
e.Literal = Literal;
e.ThisExpression = ThisExpression;
e.UnaryExpression = UnaryExpression;
e.UpdateExpression = UpdateExpression;
e.BinaryExpression = BinaryExpression;
e.AssignmentExpression = AssignmentExpression;
e.LogicalExpression = LogicalExpression;
e.ConditionalExpression = ConditionalExpression;
e.CallExpression = CallExpression;
e.DecoratorExpression = DecoratorExpression;
e.NewExpression = NewExpression;
e.SequenceExpression = SequenceExpression;
e.BlockStatement = BlockStatement;
e.StatementList = StatementList;
e.EmptyStatement = EmptyStatement;
e.ExpressionStatement = ExpressionStatement;
e.ReturnStatement = ReturnStatement;
e.ContinueStatement = ContinueStatement;
e.BreakStatement = BreakStatement;
e.IfStatement = IfStatement;
e.WhileStatement = WhileStatement;
e.DoStatement = DoStatement;
e.ForStatement = ForStatement;
e.ForInStatement = ForInStatement;
e.WithStatement = WithStatement;
e.ImportStatement = ImportStatement;
e.FunctionDeclaration = FunctionDeclaration;
e.ClassDeclaration = ClassDeclaration;
e.VariableDeclaration = VariableDeclaration;
e.VariableDeclarator = VariableDeclarator;
e.ObjectLiteral = ObjectLiteral;
e.ArrayLiteral = ArrayLiteral;
e.MemberExpression = MemberExpression;
e.JSXLiteral = JSXLiteral;
e.ArrayBinding = ArrayBinding;
e.ObjectBinding = ObjectBinding;

Node.prototype.toString = function() {
  let s = '';
  [
    'alternate',
    'argument',
    'arguments',
    'body',
    'callee',
    'computed',
    'consequent',
    'declarations',
    'exported',
    'expression',
    'expressions',
    'id',
    'identifiers',
    'init',
    'kind',
    'left',
    'loc',
    'members',
    'object',
    'operator',
    'params',
    'prefix',
    'property',
    'right',
    'source',
    'test',
    'update',
    'value'
  ].forEach(field => {
    if(this[field]) {
      let value = this[field];
      if(value.value !== undefined) {
        value = '"' + value.value + '"';
      } else if(value instanceof Array) {
        value = '[\n  ' + this[field].map(child => child.toString().replace(/\n/g, '\n  ')).join(',\n  ') + '\n]';
        value = value.replace(/\n/g, '\n  ');
      } else if(typeof (value) === 'object' && !(value instanceof Array)) {
        value = Util.className(value);
      }
      if(s.length) s += ',\n  ';
      s += field + ' = ' + value + '';
    }
  });
  return this.type + ' {\n  ' + s + '\n}';
};
