import {
  Node,
  Program,
  Expression,
  Function,
  Identifier,
  BindingProperty,
  Literal,
  ThisExpression,
  UnaryExpression,
  UpdateExpression,
  BinaryExpression,
  AssignmentExpression,
  LogicalExpression,
  MemberExpression,
  ConditionalExpression,
  CallExpression,
  DecoratorExpression,
  NewExpression,
  SequenceExpression,
  Statement,
  BlockStatement,
  StatementList,
  EmptyStatement,
  ExpressionStatement,
  ReturnStatement,
  ContinueStatement,
  BreakStatement,
  IfStatement,
  WhileStatement,
  DoStatement,
  ForStatement,
  ForInStatement,
  WithStatement,
  TryStatement,
  ImportStatement,
  Declaration,
  ClassDeclaration,
  FunctionDeclaration,
  ArrowFunction,
  VariableDeclaration,
  VariableDeclarator,
  ObjectLiteral,
  ArrayLiteral,
  JSXLiteral,
  BindingPattern,
  ArrayBinding,
  ObjectBinding,
  AwaitExpression,
  RestOfExpression
} from './estree.js';
import Util from '../util.js';

export class Printer {
  constructor(options = {}) {
    this.indent = options.indent || 2;
  }

  printNode(node) {
    let name, fn;
    try {
      name = Util.isObject(node) ? Util.className(node) : null;
      fn = this['print' + name] || (arg => '' + arg);
    } catch(err) {
      console.log('printNode error: ', err);
      console.log('node:', node);
      process.exit(0);
    }
    if(!fn) {
      throw new Error(`No print function ${name}`);
    }
    let ret = fn.call(this, node);
    // console.log("printNode: " + ret);
    return ret;
  }

  print(tree) {
    return this.printNode(tree);
  }

  printProgram(program) {
    return program.body.map(line => this.printNode(line) + ';').join('\n');
  }

  printString(str) {
    return `"${str}"`;
  }

  /*
  printExpression(expression) {
  }

  printFunction(function) {
  }
*/
  printIdentifier(identifier) {
    return identifier.value;
  }
  /*
  printBindingProperty(binding_property) {
  }*/
  printLiteral(literal) {
    return literal.value;
  }
  /*  printThisExpression(this_expression) {
  }
  printUnaryExpression(unary_expression) {
  }
  printUpdateExpression(update_expression) {
  }*/
  printBinaryExpression(binary_expression) {
    const { operator, left, right } = binary_expression;
    return `${this.printNode(left)} ${operator} ${this.printNode(right)}`;
  }
  printAssignmentExpression(assignment_expression) {
    const { operator, left, right } = assignment_expression;
    let output = `${this.printNode(left)} ${operator} ${this.printNode(right)}`;
    return output;
  }

  printLogicalExpression(logical_expression) {
    const { operator, left, right } = logical_expression;
    return `${this.printNode(left)} ${operator} ${this.printNode(right)}`;
  }
  printMemberExpression(member_expression) {
    const { object, property } = member_expression;
    let output;

    output = this.printNode(object) + '.' + this.printNode(property);
    return output;
  }
  /*
  printConditionalExpression(conditional_expression) {
  }*/

  printCallExpression(call_expression) {
    const { arguments: args, callee } = call_expression;
    return (
      this.printNode(callee) +
      '(' +
      args.map(arg => this.printNode(arg)).join(', ') +
      ')'
    );
  }
  /*
  printDecoratorExpression(decorator_expression) {
  }*/

  printNewExpression(new_expression) {
    return 'new ' + this.printCallExpression(new_expression);
  }
  printSequenceExpression(sequence_expression) {
    const { expressions } = sequence_expression;

    let output = expressions.map(expr => this.printNode(expr)).join(', ');
    return output;
  }
  /*  printStatement(statement) {
  }*/

  printBlockStatement(block_statement) {
    const { body } = block_statement;
    let output = '{\n  ';
    if(typeof body.map == 'function')
      output += body
        .map(line => this.printNode(line).replace(/\n/g, '\n  '))
        .join(';\n  ');
    else output += this.printNode(body).replace(/\n/g, '\n  ');
    return output + ';\n}';
  }
  /*
  printStatementList(statement_list) {
  }*/

  printEmptyStatement(empty_statement) {
    return '';
  }
  /*  printExpressionStatement(expression_statement) {
  }*/

  printReturnStatement(return_statement) {
    const { argument } = return_statement;
    let output = 'return';
    if(argument) {
      output += ' ';
      output += this.printNode(argument);
    }
    return output;
  }
  printContinueStatement(continue_statement) {
    return 'continue';
  }
  printBreakStatement(break_statement) {
    return 'break';
  }
  /*
  printIfStatement(if_statement) {
  }*/

  printWhileStatement(while_statement) {
    const { body, test } = do_statement;
    let output = `while(` + this.printNode(test) + ') ';
    output += this.printBlockStatement(body);
    return output;
  }

  printDoStatement(do_statement) {
    const { body, test } = do_statement;

    let output = `do `;
    output += this.printBlockStatement(body);
    output += ` while(` + this.printNode(test) + ')';
    return output;

    console.log(arguments[0]);
    console.log(Object.keys(arguments[0]).join(', '));
    throw new Error(arguments[0]);
  }
  /*
  printForStatement(for_statement) {
  }
  printForInStatement(for_in_statement) {
  }
  printWithStatement(with_statement) {
  }*/
  printTryStatement(try_statement) {
    const { body, parameters, trap } = try_statement;
    let output = 'try ';
    output += this.printBlockStatement(body);
    output +=
      ` catch(` +
      parameters.map(param => this.printNode(param)).join(', ') +
      ') ';
    output += this.printBlockStatement(trap);
    return output;
  }
  printImportStatement(import_statement) {
    const { identifiers } = import_statement;
    let output = identifiers.exported ? 'export ' : 'import ';
    console.log(identifiers);

    output += identifiers.declarations
      .map(decl => this.printNode(decl))
      .join(', ');
    output += ' from ';
    output += this.printNode(import_statement.source);
    return output;
  }
  /*
  printDeclaration(declaration) {
  }
  printClassDeclaration(class_declaration) {
  }*/
  printFunctionDeclaration(function_declaration) {
    const { id, params, body, exported, async } = function_declaration;
    let output = exported ? 'export ' : '';
    output += async ? 'async ' : '';
    output += `function`;
    if(id) output += ` ${this.printNode(id)}`;
    output +=
      '(' +
      (params.length !== undefined
        ? Array.from(params)
            .map(param => this.printNode(param))
            .join(', ')
        : this.printNode(params)) +
      ')';
    output += this.printBlockStatement(body);
    return output;
  }
  printArrowFunction(arrow_function) {
    const { async, params, body } = arrow_function;
    let output = async ? 'async ' : '';
    output +=
      '(' +
      (params.length !== undefined
        ? Array.from(params)
            .map(param => this.printNode(param))
            .join(', ')
        : this.printNode(params)) +
      ')';
    output += ' => ';
    if(typeof body.map == 'function')
      output += body.map(line => this.printNode(line)).join('\n  ');
    else output += this.printNode(body);
    return output;
  }

  printVariableDeclaration(variable_declaration) {
    const { kind, exported, declarations } = variable_declaration;
    let output = kind != '' ? `${kind} ` : '';
    output += declarations.map(decl => this.printNode(decl)).join(', ');
    return output;
  }

  printVariableDeclarator(variable_declarator) {
    const { id, init } = variable_declarator;
    let output = this.printNode(id);
    if(init) {
      output += ` = ${this.printNode(init)}`;
    }
    return output;
  }

  printObjectLiteral(object_literal) {
    const { members } = object_literal;
    let output = '';
    for(let key in members) {
      if(output.length) output += ', ';
      output += `${key}: ${this.printNode(members[key])}`;
    }
    return `{ ${output} }`;
  }

  printArrayLiteral(array_literal) {
    const { elements } = array_literal;
    let output = elements.map(elem => this.printNode(elem)).join(', ');
    return `[ ${output} ]`;
  }

  printJSXLiteral(jsx_literal) {
    const { tag, attributes, closing, selfClosing, children } = jsx_literal;
    let output = ``;
    for(let attr in attributes) {
      const value = attributes[attr];
      output += ` ${attr}=`;
      // console.log("value:",value);
      if(value instanceof Literal) output += this.printNode(value);
      else output += `{${this.printNode(value)}}`;
    }

    if(children instanceof Array && children.length > 0) {
      return `<${tag}${output}>
  ${children
    .map(child => this.printNode(child).replace(/\n/g, '\n  '))
    .join('\n  ')}
</${tag}>`;
    }

    return `<${closing ? '/' : ''}${tag}${output}${selfClosing ? ' /' : ''}>`;
  }

  /*
  printBindingPattern(binding_pattern) {
  }*/
  printArrayBinding(array_binding) {
    const { elements } = array_binding;
    let output = elements.map(({ element }) => element.value).join(', ');
    return `[ ${output} ]`;
  }

  printObjectBinding(object_binding) {
    const { value, properties } = object_binding;
    let output = properties
      .map(({ property, element }) => {
        if(property.value == element.value) return property.value;
        return `${property.value}: ${element.value}`;
      })
      .join(', ');
    return `{ ${output} }`;
  }

  printAwaitExpression(await_expression) {
    const { value } = await_expression;
    return `await ${this.printNode(value)}`;
  }

  printRestOfExpression(rest_of_expression) {
    const { value } = rest_of_expression;
    return `...${this.printNode(value)}`;
  }
}

export default Printer;
