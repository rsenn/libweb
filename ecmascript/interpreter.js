import { ESNode, Literal, PropertyDefinition, MemberVariable, FunctionDeclaration, Identifier, ClassDeclaration, BindingProperty, ObjectBindingPattern, SpreadElement, MemberExpression } from './estree.js';
import Util from '../util.js';
//import { inspect } from 'util';
import deep from '../deep.js';

//import util from 'util';
export class ECMAScriptValue {
  static types = {
    string: 0,
    number: 1,
    boolean: 2,
    regexp: 3,
    object: 4,
    function: 5,
    symbol: 6
  };

  constructor(type, init) {
    if (typeof type == 'string') type = ECMAScriptValue.types[type];
    //if(type === undefined) type = 0;

    this.type = type;
    if (init !== undefined) {
      if (type == 1) this.data = parseFloat(init);
      else this.data = init;
    }

    if (!(this instanceof ECMAScriptObject) && type == ECMAScriptValue.types.object) {
      Object.setPrototypeOf(this, ECMAScriptObject);
      return this;
    }
    if (!(this instanceof ECMAScriptFunction) && type == ECMAScriptValue.types.function) {
      Object.setPrototypeOf(this, ECMAScriptFunction);
      return this;
    }
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let obj = Util.filterOutKeys({ ...this }, [Symbol.for('nodejs.util.inspect.custom'), 'types']);
    let t = Object.entries(ECMAScriptValue.types).find(([name, number], i) => number == this.type);
    if (obj.type === undefined || this.constructor.prototype !== ECMAScriptValue.prototype) delete obj.type;
    else if (t) obj.type = t[0];
    Object.setPrototypeOf(obj, { constructor: this.constructor });
    return ECMAScriptValue.util.inspect(obj, { colors: true, depth: 1 });
  }
}

export class ECMAScriptObject extends ECMAScriptValue {
  constructor(init, proto) {
    super(ECMAScriptValue.types.object, init);

    if (proto !== undefined) this.proto = proto;
  }
}
export class ECMAScriptFunction extends ECMAScriptValue {
  constructor(params, body, flags) {
    super(ECMAScriptValue.types.function);

    if (params !== undefined) this.params = params;
    if (body !== undefined) this.body = body;
    if (flags !== undefined) this.flags = flags;
  }
}

class Scope {
  declarations = new Map();
  constructor(parent = null) {
    this.parent = parent;
  }

  newValue(name, ...args) {
    let r = new ECMAScriptValue(...args);
    this.setValue(name, r);
    return r;
  }
  setValue(name, value) {
    if (name.value) name = name.value;
    this.declarations.set(name, value);
    return this;
  }

  getOrCreateValue(name, ...args) {
    if (name.value) name = name.value;
    if (this.declarations.has(name)) return this.declarations.get(name);
    return this.newValue(name, ...args);
  }

  get empty() {
    return this.declarations.size == 0;
  }

  static find(scope, name) {
    if (Util.isObject(name) && name.value) name = name.value;

    do {
      if (scope.declarations.has(name)) return scope;
    } while ((scope = scope.parent));
    return null;
  }

  static depth(scope) {
    let i = -1;
    do {
      i++;
    } while ((scope = scope.parent));
    return i;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    if (this.empty) return '';
    return inspect(this.declarations, { colors: true, depth: 2 });

    return { depth: Scope.depth(this), declarations: Object.fromEntries([...this.declarations.entries()].map(([name, value]) => [name, Util.className(value)])) };
  }
}

export class ECMAScriptInterpreter {
  scope = null;

  constructor(util) {
    this.globalThis = new Scope();
    this.scope = this.globalThis;
    this.util = util;
    ECMAScriptValue.util = util;
  }

  pushScope() {
    this.scope = new Scope(this.scope);
    console.log(`pushScope(${Scope.depth(this.scope)})`);
  }

  popScope() {
    console.log(`popScope (${Scope.depth(this.scope)})`);
    this.scope = this.scope.parent;
  }

  findInScope(path) {
    if (!(path instanceof Array)) path = [path];

    let top = path.shift();

    let scope;
    if (top == 'global') scope = this.globalThis;
    else scope = Scope.find(this.scope, top);
    let name = path.shift();
    let obj = scope.getOrCreateValue(name);

    return [scope, name, obj];
  }

  evalNode(node) {
    let name, fn, className;
    className = Util.className(node);
    name = Util.isObject(node) ? className : null;
    fn =
      this['eval' + name] ||
      //(() => '') ||
      function (...args) {
        args = args.map((a) => Util.className(a));
        if (node instanceof ESNode) {
          console.log('node:', ESNode.assoc(node).position.toString());
        }
        throw new Error(`Non-existent eval${name}(${args})`);
      };
    let ret;
    let a = ['node:', this.util.inspect(node, { colors: true, depth: 0 })];

    if (!this.scope.empty) a = a.concat(['\nscope:', this.scope]);
    ret = fn.call(this, node);

    a = a.concat(['\nret:', ret]);
    a = a.concat(['\n']);
    console.log(...a);
    return ret;
  }

  evalProgram(node) {
    this.pushScope();
    for (let statement of node.body) this.evalNode(statement);
    this.popScope();
  }

  evalAssignmentExpression(assignment_expression) {
    const { operator } = assignment_expression;
    let left = this.evalNode(assignment_expression.left);
    let right = this.evalNode(assignment_expression.right);

    let [scope, name, obj] = this.findInScope(left);

    obj.data = right || assignment_expression.right;

    console.log('eval: AssignmentExpression:', assignment_expression, { left, operator, right, scope, name, obj });
    //return obj;
  }

  evalClassDeclaration(class_declaration) {
    const { id, extending, members } = class_declaration;
    console.log('class_declaration:', { id, extending, members });
    let fn = this.scope.newValue(id, ECMAScriptValue.types.function);
    let obj = this.scope.newValue(id, ECMAScriptValue.types.object);

    for (let member of members) {
      let prop = this.evalNode(member);
      console.log('member:', prop);
    }
    fn.data = class_declaration;
    //console.log('fn: ', fn);
  }

  evalExportStatement(export_statement) {
    let { what, declarations } = export_statement;
    //console.log('eval: ExportStatement', { what, declarations });

    let decls;

    if (declarations instanceof Array) decls = declarations.map(({ id, init }) => [id.value, this.evalNode(init)]);
    else decls = this.evalNode(declarations);

    if (what.value) what = what.value;

    //console.log('eval: ExportStatement', { what, export_statement });
    return [what.value ? what.value : what, decls];
  }

  evalFunctionDeclaration(function_declaration) {
    const { id, params, body, is_async, generator, exported } = function_declaration;
    let fl = [];
    if (is_async) fl.push('async');
    if (generator) fl.push('*');
    if (exported) fl.push('export');

    let fn = new ECMAScriptFunction(params, body, fl);

    //fn.data = function_declaration;
    //console.log('fn: ', fn);

    if (id) {
      this.scope.setValue(id, fn);
      console.log('scope:', this.scope);
    }

    return [id, fn, fl];
  }
  evalArrowFunction(arrow_function) {
    const { id, params, body, is_async, generator, exported } = arrow_function;
    let fl = [];
    if (is_async) fl.push('async');
    fl.push('=>');

    let fn = new ECMAScriptFunction(params, body, fl);

    if (id) {
      this.scope.setValue(id, fn);
      console.log('scope:', this.scope);
    }

    return [id, fn, fl];
  }

  evalImportStatement(import_statement) {
    console.log('import_statement:', import_statement);
  }

  evalLiteral(literal) {
    return new ECMAScriptValue(Util.isNumeric(literal.value) ? 'number' : 'string', literal.value);
  }

  evalMemberExpression(member_expression) {
    const { object, property } = member_expression;
    let path = [];
    path.unshift(property.value ? property.value : property);
    for (let o = object; o instanceof MemberExpression; o = o.object) {
      let p = o;
      if (p.value) p = p.value;
      path.unshift(p);
    }
    path.unshift(object.value ? object.value : object);
    //console.log('eval: MemberExpression', { path, object });

    return path;
  }

  evalPropertyDefinition(property_definition) {
    const { id, value, flags } = property_definition;
    let fl = [];
    if (flags & PropertyDefinition.STATIC) fl.push('static');
    if (flags & PropertyDefinition.GET) fl.push('get');
    if (flags & PropertyDefinition.SET) fl.push('set');
    let member = this.evalNode(value);
    if (member instanceof Array && !member[0]) {
      fl = fl.concat(member[2]);
      member = member[1];
    }
    return id || fl.length ? [id.value, member || value, fl] : member;
  }
  evalVariableDeclaration(variable_declaration) {
    const { kind, declarations } = variable_declaration;
    //    console.log('eval: VariableDeclaration', {declarations});

    let decls = declarations.map((node) => this.evalNode(node));

    console.log('eval: VariableDeclaration', decls);
    return decls;
  }

  evalVariableDeclarator(variable_declarator) {
    let { id, init } = variable_declarator;
    let name = id ? this.evalNode(id) : id;
    let value = init ? this.evalNode(init) : init;
    return [name, value];
  }

  run(ast) {
    console.log('ast:', ast);
    return this.evalNode(ast);
  }

  evalCallExpression(call_expression) {
    let { arguments: args, callee: fn } = call_expression;
    args = args.map((arg) => this.evalNode(arg));
    fn = this.evalNode(fn);
    let r = Scope.find(this.scope, fn);
    console.log('eval: CallExpression:', { args, fn, r });
  }

  evalBlockStatement(block_statement) {
    let { body } = block_statement;
    this.pushScope();
    let ret;
    for (let statement of body) {
      ret = this.evalNode(statement);
    }
    this.popScope();
    return ret;
  }

  evalIdentifier(identifier) {
    let value = Scope.find(this.scope, identifier.value) || identifier.value;

    return value;
  }

  evalNewExpression(new_expression) {
    let { arguments: args, callee: fn } = new_expression;
    args = args.map((arg) => this.evalNode(arg));
    fn = this.evalNode(fn);
    let r = Scope.find(this.scope, fn);
    console.log('eval: NewExpression:', { args, fn, r });
  }

  evalObjectLiteral(object_literal) {
    const { members } = object_literal;
    let obj = new ECMAScriptObject();
    for (let member of members) {
      let prop = this.evalNode(member);
      console.log('member:', prop);
    }
    return obj;
  }

  evalArrayLiteral(array_literal) {
    //console.log('eval: ArrayLiteral:', array_literal);
    const { elements } = array_literal;
    let arr = new ECMAScriptObject();
    let r = [];
    for (let element of elements) {
      let prop = this.evalNode(element);
      console.log('eval: ArrayLiteral:', { prop, arr, r });
      r.push(prop);
    }
    arr.data = r;
    return arr;
  }

  evalForInStatement(for_in_statement) {
    const { left, right, body, operator } = for_in_statement;
    console.log('eval: ForInStatement:', for_in_statement);
  }

  evalArrowFunction(arrow_function) {}

  //evalArrayBindingPattern(array_binding_pattern) {}

  //evalAwaitExpression(await_expression) {}
  //evalBinaryExpression(binary_expression) {}
  //evalBindingPattern(binding_pattern) {}
  //evalBindingProperty(binding_property) {}
  //evalBreakStatement(break_statement) {}
  //evalComputedPropertyName(computed_property_name) {}
  //evalConditionalExpression(conditional_expression) {}
  //evalContinueStatement(continue_statement) {}
  //evalDeclaration(declaration) {}
  //evalDecoratorExpression(decorator_expression) {}
  //evalDoStatement(do_statement) {}
  //evalEmptyStatement(empty_statement) {}
  //evalExpression(expression) {}
  //evalForStatement(for_statement) {}
  //evalFunction(function) {}

  //evalIfStatement(if_statement) {}
  //evalJSXLiteral(jsx_literal) {}
  //evalLogicalExpression(logical_expression) {}
  //evalMemberVariable(member_variable) {}

  //evalObjectBindingPattern(object_binding_pattern) {}
  //evalRestOfExpression(rest_of_expression) {}
  //evalReturnStatement(return_statement) {}
  //evalSequenceExpression(sequence_expression) {}
  //evalSpreadElement(spread_element) {}
  //evalStatementList(statement_list) {}
  //evalSwitchStatement(switch_statement) {}
  //evalTemplateLiteral(template_literal) {}
  //evalThisExpression(this_expression) {}
  //evalThrowStatement(throw_statement) {}
  //evalTryStatement(try_statement) {}
  //evalUnaryExpression(unary_expression) {}
  //evalUpdateExpression(update_expression) {}
  //evalWhileStatement(while_statement) {}
  //evalYieldStatement(yield_statement) {}
}
export default ECMAScriptInterpreter;
