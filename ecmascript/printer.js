import { ESNode, Literal, TemplateLiteral, PropertyDefinition, MemberVariable, FunctionDeclaration, Identifier, ClassDeclaration, BindingProperty, ObjectBindingPattern, SpreadElement, MemberExpression } from './estree.js';
import Util from '../util.js';
import deep from '../deep.js';
//import util from 'util';
import util from 'util';

export class Printer {
  static colors = {
    keywords: [1, 31],
    identifiers: [1, 33],
    punctuators: [1, 36],
    stringLiterals: [1, 36],
    numberLiterals: [1, 36],
    regexpLiterals: [1, 35],
    comments: [1, 32],
    templates: [1, 35]
  };
  constructor(options = {}, comments) {
    const { indent = 2, color = false, format = 1 } = options;
    this.indent = indent || 2;
    this.comments = comments || [];

    this.color = Util.coloring(color);

    this.colorText = Object.entries(Printer.colors).reduce((acc, [key, codes]) => ({ ...acc, [key]: (text) => this.color.text(text, ...codes) }), {});
    this.colorCode = Object.entries(Printer.colors).reduce((acc, [key, codes]) => ({ ...acc, [key]: () => this.color.code(...codes) }), {});
    this.format = format;
  }

  printNode(node) {
    let name, fn, className;
    try {
      className = Util.className(node);
      name = Util.isObject(node) ? className : null;

      fn =
        this['print' + name] ||
        (() => '') ||
        function (...args) {
          args = args.map((a) => Util.className(a));
          throw new Error(`Non-existent print${name}(${args})`);
        };
    } catch(err) {
      process.exit(0);
    }
    let ret = '';
    //    console.log("node:",node);
    if(node instanceof ESNode) {
      let comments = (node && ESNode.assoc(node).comments) || [];
      if(comments && comments.length) {
        for(let comment of comments) ret += comment.value;
      }
    }
    ret += fn.call(this, node);
    return ret;
  }

  print(tree) {
    this.nodes = [...deep.iterate(tree, (node) => Util.isObject(node) && 'position' in node)].map(([node, path]) => [node.position, path.join('.'), node]);

    //console.log("comments: ", this.comments);

    //console.log("nodes: ", this.nodes);
    this.adjacent = this.comments.map(({ text, pos, len }) => ({
      start: pos,
      end: pos + len,
      text,
      nodes: this.nodes.slice(this.nodes.findIndex(([position, path]) => position > pos + len) - 1).slice(0, 2)
    }));

    //console.log("adjacent: ", this.adjacent);

    return this.printNode(tree);
  }

  printProgram(program) {
    let output = '';
    for(let statement of program.body) {
      let line = this.printNode(statement);
      if(line == '') continue;
      if(/\n/.test(line) && output != '') output += '\n';
      //console.log(`line:'${line.replace(/\n/g, "\\n")}'`);
      output += line + (line.trim().endsWith(';') ? '\n' : ';\n');
    }
    output = output.replace(/[;\n ]*$/, '');
    return output != '' ? output + ';' : output;
  }

  printString(str) {
    return this.colorText.stringLiterals(`"${str}"`);
  }

  /*
  printExpression(expression) {
  }

  printFunction(function) {
  }
*/
  printIdentifier(identifier) {
    return this.colorText.identifiers(identifier.value);
  }
  printComputedPropertyName(computed_property_name) {
    const { expr } = computed_property_name;
    let output = '[';
    output += this.printNode(expr);
    output += ']';
    return output;
  }

  printBindingProperty(binding_property) {
    const { id, value } = binding_property;

    let output = '';
    output += this.printNode(id);

    //console.log('printBindingProperty:', value.value, id.value);

    if([value, id].every(Util.isObject) && value.value != id.value) output += ': ' + this.printNode(value);

    return output;
  }

  printLiteral(literal) {
    let { value } = literal;
    return this.colorText.numberLiterals(value);
  }

  printTemplateLiteral(template_literal) {
    let s = '';
    //console.log("template_literal:", template_literal);

    for(let part of template_literal.parts) {
      if(part instanceof Literal) s += part.value;
      else s += '${' + this.printNode(part) + '}';
    }
    return this.colorText.templates(s);
  }

  printThisExpression(this_expression) {
    return 'this';
  }

  printSpreadElement(spread_element) {
    const { expr } = spread_element;
    return '...' + this.printNode(expr);
  }

  printUnaryExpression(unary_expression) {
    const { operator, argument, prefix } = unary_expression;
    let arg = this.printNode(argument);

    //arg = '(' + arg + ')';

    if(prefix && /[a-z]$/.test(operator)) arg = ' ' + arg;

    return prefix ? operator + arg : arg + operator;
  }

  printUpdateExpression(update_expression) {
    return this.printUnaryExpression(update_expression);
  }

  printBinaryExpression(binary_expression) {
    const { operator, left, right } = binary_expression;

    let lhs = this.printNode(left).replace(/[\s\;]*$/g, '');
    let rhs = this.printNode(right);

    return `${lhs} ${operator} ${rhs}`;
  }
  printAssignmentExpression(assignment_expression) {
    const { operator, left, right } = assignment_expression;
    let output = `${this.printNode(left)} ${operator} ${this.printNode(right)}`;
    return output;
  }

  printLogicalExpression(logical_expression) {
    const { operator, left, right } = logical_expression;

    //console.log('logical_expression', logical_expression);

    return `${this.printNode(left)} ${operator} ${this.printNode(right)}`;
  }

  printMemberExpression(member_expression) {
    const { object, property } = member_expression;
    let left, right;
    //console.log("member_expression:", member_expression);
    left = this.printNode(object);
    right = this.printNode(property);

    if(!(object instanceof Identifier) && !(object instanceof MemberExpression)) left = '(' + left + ')';

    ///null.*{/.test(left) && console.log("object:", object);

    if(/^[0-9]+$/.test(right) || /[\.\']/.test(right) || !(property instanceof Identifier)) return left + '[' + right + ']';
    return left + '.' + right;
  }

  printConditionalExpression(conditional_expression) {
    const { test, consequent, alternate } = conditional_expression;
    //console.log('conditional_expression:', conditional_expression);

    if(!test) {
      throw new Error('');
    }

    let condition = this.printNode(test);
    let if_true = this.printNode(consequent);
    let if_false = this.printNode(alternate);
    return condition + ' ? ' + if_true + ' : ' + if_false;
  }

  printCallExpression(call_expression) {
    const { arguments: args, callee } = call_expression;
    //console.log("args:", util.inspect(args, { depth: Infinity, breakLength: 1000 }));

    if(args instanceof TemplateLiteral) return this.printNode(callee) + this.colorCode.punctuators() + this.printNode(args);

    return this.printNode(callee) + this.colorCode.punctuators() + '(' + args.map((arg) => this.printNode(arg)).join(this.colorCode.punctuators() + ', ') + this.colorCode.punctuators() + ')';
  }

  /*
  /*
  printDecoratorExpression(decorator_expression) {
  }*/

  printNewExpression(new_expression) {
    return 'new ' + this.printCallExpression(new_expression);
  }

  printSequenceExpression(sequence_expression) {
    const { expressions } = sequence_expression;

    let output = '(';
    //console.log('expressions: ', expressions);

    output += expressions
      .flat()
      .map((expr) => {
        let node = this.printNode(expr);
        return node;
      })
      .join(', ');
    output += ')';
    return output;
  }

  //printStatement(statement) {}
  printBlockStatement(block_statement) {
    const { body } = block_statement;
    let s = '';
    if(!body) {
      //console.log("block_statement:", block_statement);
      process.exit();
    }
    if('length' in body) {
      if(body.length == 0) return this.colorText.punctuators('{}');
      for(let statement of body) {
        if(statement == null) {
          //console.log("printBlockStatement: ", body);
          throw new Error();
        }
        let line = this.printNode(statement);

        let multiline = /\n/.test(line);
        s += multiline && s.length ? '\n\n  ' : '\n  ';
        let eol = (new RegExp('(;|\n|})$').test(line.trimEnd()) ? '' : this.colorCode.punctuators() + ';') + (multiline ? '\n' : '');
        //console.log("line:", { line, eol });

        if(line != '') s += line.replace(/\n/g, '\n  ') + eol;
      }
    } else {
      s += this.printNode(body).replace(/\n/g, '\n  ');
    }
    s = s.trimEnd();

    return this.colorCode.punctuators() + '{' + s + this.colorCode.punctuators() + (new RegExp('[};\\n ]$').test(s) ? '\n}' : ';\n}');
  }

  printStatementList(statement_list) {
    const { body } = statement_list;
    let s = '';
    for(let statement of body) {
      let line = this.printNode(statement);
      let multiline = /\n/.test(line);
      s += multiline && s.length ? '\n\n' : '\n';
      if(line != '') s += line + (new RegExp('(;|\\n|}|\\s)$').test(line.trimEnd()) ? '' : this.colorCode.punctuators() + ';') + (multiline ? '\n' : '');
    }
    return s;
  }

  printEmptyStatement(empty_statement) {
    return '';
  }

  /*  printExpressionStatement(expression_statement) {
  }*/

  printReturnStatement(return_statement) {
    const { argument } = return_statement;
    let output = this.colorText.keywords('return');
    if(argument) {
      output += ' ';
      output += this.printNode(argument);
    }
    return output;
  }

  printContinueStatement(continue_statement) {
    return this.colorText.keywords('continue');
  }
  printBreakStatement(break_statement) {
    return this.colorText.keywords('break');
  }

  printIfStatement(if_statement) {
    const { test, consequent, alternate } = if_statement;
    let condition = this.printNode(test);
    let if_true = this.printNode(consequent);
    let output = this.colorCode.keywords() + 'if' + this.colorCode.punctuators() + `(${condition}) ${if_true}`;
    if(alternate) {
      let if_false = this.printNode(alternate);
      output += (new RegExp('[;}\\n]$').test(output) ? '' : this.colorCode.punctuators() + ';') + this.colorCode.keywords() + ` else ${if_false}`;
    }
    return output;
  }

  printSwitchStatement(switch_statement) {
    const { test, cases } = switch_statement;
    let condition = this.printNode(test);
    let output = this.colorCode.keywords() + `switch` + this.colorCode.punctuators() + `(${condition}) {\n`;
    for(let case_clause of cases) {
      const { value, body } = case_clause;
      if(value == null) output += '  default:';
      else output += '  case ' + this.printNode(value) + ':';
      let case_body = this.printNode(body).trim().replace(/\n/g, '\n  ');
      output += /^[^{].*\n/.test(case_body) ? '\n  ' : ' ';
      output += case_body + (/\n/.test(case_body) ? '\n\n' : '\n');
    }
    return output + `}`;
  }

  printWhileStatement(while_statement) {
    const { body, test } = while_statement;
    let output = this.colorCode.keywords() + 'while' + this.colorCode.punctuators() + `(` + this.printNode(test) + this.colorCode.punctuators() + ') ';
    output += this.printNode(body);
    return output;
  }

  printDoStatement(do_statement) {
    const { body, test } = do_statement;
    let output = `do `;
    output += this.printNode(body);
    output += this.colorCode.keywords() + 'while' + this.colorCode.punctuators() + `(` + this.printNode(test) + this.colorCode.punctuators() + ')';
    return output;
    //console.log(arguments[0]);
    //console.log(Object.keys(arguments[0]).join(", "));
    throw new Error(arguments[0]);
  }

  printForStatement(for_statement) {
    const { init, test, update, body } = for_statement;
    let assign = init ? this.printNode(init).replace(/;$/, '') : '';
    let condition = test ? ' ' + this.printNode(test) : '';
    let iterate = update ? ' ' + this.printNode(update) : '';
    let output = `for(${assign};${condition};${iterate})`;
    let code = this.printNode(body);

    output += /\n/.test(code) ? ' ' : '\n  ';
    output += code;
    return output;
  }

  printForInStatement(for_in_statement) {
    const { left, right, body, operator = 'in', async } = for_in_statement;

    let key = this.printNode(left).replace(/;$/, '');
    let object = this.printNode(right);

    let output = `for${async ? ' await' : ''}(${key} ${operator} ${object})`;
    let code = this.printNode(body);
    if(code[0] == '{' || !/\n./.test(code)) output += ' ';
    else output += '\n';

    output += code;
    return output;
  }

  /*printWithStatement(with_statement) {
  }*/
  printTryStatement(try_statement) {
    const { body, parameters, catch_block, finally_block } = try_statement;
    let output = 'try ';
    output += this.printNode(body);
    if(catch_block) {
      output += ` catch(` + parameters.map((param) => this.printNode(param)).join(', ') + ') ';
      output += this.printNode(catch_block);
    }
    if(finally_block) {
      output += ` finally `;
      output += this.printNode(finally_block);
    }
    return output;
  }

  printImportStatement(import_statement) {
    const { identifiers, export: doExport } = import_statement;
    let output = doExport ? 'export ' : 'import ';
    //console.log(identifiers);

    if(identifiers.declarations) output += identifiers.declarations.map((decl) => this.printNode(decl)).join(', ');
    else output += this.printNode(identifiers);

    output += ' from ';

    //console.log('import_statement.source:', import_statement.source);
    output += this.printNode(import_statement.source);
    return output;
  }

  printExportStatement(export_statement) {
    const { what, declarations } = export_statement;

    //console.log('declarations:', declarations);

    let output = 'export ';

    if(declarations instanceof ObjectBindingPattern) {
      let decl = '';
      for(let property of declarations.properties) {
        if(decl != '') decl += ', ';

        decl += this.printNode(property.id);

        if(property.id.value != property.value.value) {
          decl += ' as ';
          decl += this.printNode(property.value);
        }
      }
      output += '{ ' + decl + ' }';
    } else {
      if(!(declarations instanceof ClassDeclaration) && !(declarations instanceof FunctionDeclaration)) {
        let id = what instanceof ESNode ? this.printNode(what) : what;
        if(id) output += id + ' ';
      }

      output += this.printNode(declarations);
    }
    //.replace(/:\ /g, ' as ');

    return output.replace(/[\;\n ]*$/, '');
  }

  printThrowStatement(throw_statement) {
    let { expression } = throw_statement;

    return 'throw ' + this.printNode(expression);
  }
  printYieldStatement(yield_statement) {
    let { expression, generator } = yield_statement;
    let output = 'yield';

    if(generator) output += '*';
    output += ' ' + this.printNode(expression);
    return output;
  }

  /*
  printDeclaration(declaration) {
  }*/

  printClassDeclaration(class_declaration) {
    const { id, extending, members, exported } = class_declaration;
    let output = 'class';
    if(exported) output = 'export ' + output;
    output = this.colorText.keywords(output);

    let name = id ? this.printNode(id) : '';
    if(name != '') output += ' ' + this.colorText.identifiers(name);
    if(extending) output += this.colorText.keywords(' extends ') + this.printNode(extending);
    //console.log('members:', util.inspect(members, { depth: 2, colors: true }));

    output += ' {';

    for(let member of members) {
      if(member.comments) {
        //console.log('member.comments', util.inspect(member, { depth: 0, colors: true }), member.comments);
      }

      let s = this.printNode(member);

      //console.log('member:', member);

      if(member instanceof FunctionDeclaration) s = s.replace(/function\s/, '');

      s = s.replace(/\n/g, '\n  ');

      if(!s.endsWith('}')) s += ';';

      if(output.endsWith('}') || member instanceof FunctionDeclaration) output += '\n';

      output += '\n  ' + s;
    }

    output += '\n}';

    return output;
  }

  printFunctionDeclaration(function_declaration) {
    const { id, params, body, exported, generator, is_async } = function_declaration;
    let output = exported ? 'export ' : '';
    output += is_async ? 'async ' : '';
    output += `function `;
    if(generator) output += '*';

    if(id) output += `${this.printNode(id)}`;

    output = output.replace(/ $/, '');
    output +=
      '(' +
      (params.length !== undefined
        ? Array.from(params)
            .map((param) => this.printNode(param))
            .join(', ')
        : this.printNode(params)) +
      ') ';

    //console.log("body: ",function_declaration);

    output += this.printNode(body);

    return output;
  }

  printArrowFunction(arrow_function) {
    const { is_async, params, body } = arrow_function;
    let output = is_async ? 'async ' : '';
    output +=
      this.colorCode.punctuators() +
      '(' +
      (params.length !== undefined
        ? Array.from(params)
            .map((param) => this.printNode(param))
            .join(', ')
        : this.printNode(params)) +
      this.colorCode.punctuators() +
      ')';
    output += ' => ';
    let code;
    /*if(typeof body.map == 'function') {
      code = body.map(line => this.printNode(line)).join('\n  ');
    } else */ {
      code = this.printNode(body);

      /*  console.log('body:', Util.className(body));
      //console.log('body:', body);*/

      if(Util.className(body).startsWith('Object')) code = '(' + code + ')';
    }
    output += code;
    return output;
  }

  printVariableDeclaration(variable_declaration) {
    const { kind, exported, declarations } = variable_declaration;
    let output = exported ? 'export ' : '';

    output += kind != '' ? this.colorText.keywords(kind) + ' ' : '';
    output += declarations.map((decl) => this.printNode(decl)).join(', ');
    return output + ';';
  }

  printVariableDeclarator(variable_declarator) {
    const { id, init } = variable_declarator;
    let output = this.printNode(id);
    if(init) {
      output += ' ' + this.colorText.punctuators('=') + ` ${this.printNode(init)}`;
    }
    return output;
  }

  printObjectLiteral(object_literal) {
    const { members } = object_literal;
    let output = '';
    let a = [];
    let is_multiline = false,
      is_prototype = true;
    if(members.length == 0) return '{}';
    for(let property of members) {
      let line = '';

      //console.debug('printObjectLiteral:', Util.className(property), { property });

      let name, value;
      let isFunction = false;

      if(property instanceof FunctionDeclaration) {
        //name =  this.printNode(property.id);
        value = this.printNode(property).replace(/function /, '');
        isFunction = true;
      } else if(property instanceof PropertyDefinition || property instanceof BindingProperty || !property.id) {
        value = this.printNode(property);
        //console.debug('printObjectLiteral:', { value });
        a.push(value);
        continue;
      } else {
        name = this.printNode(property.id);
        value = this.printNode(property.value);
      }

      if(property.value instanceof FunctionDeclaration) {
        //console.log("function.id:", property.value.id);
        let functionName = property.value.id ? this.printNode(property.value.id) : '';
        if(functionName != '') {
          name = functionName;
          delete property.id;
        } else if(functionName) {
          name = '';
        }
        value = this.printNode(property.value);
        value = value.replace(/^function\s/, '');
        isFunction = true;
      }

      line += value.replace(/\n/g, '\n  ');

      //console.log("printObjectLiteral.line:", { name,line});

      if(property.flags && !(property instanceof BindingProperty) && !(object_literal instanceof ObjectBindingPattern)) {
        line = name + ' = ' + line;
      } else if(name && name != line) {
        //console.log('printObjectLiteral ', { name, line });
        line = name + (isFunction ? '' : ': ') + line;
        if(!property.flags) is_prototype = false;
      }
      if(property.flags & PropertyDefinition.STATIC) line = 'static ' + line;
      line += property.flags ? this.colorCode.punctuators() + ';' : '';
      if(/\n/.test(line)) line = '\n  ' + line;
      a.push(line);
      if(!is_multiline && /\n/.test(line)) is_multiline |= true;
    }

    if(is_multiline) return `{\n  ${a.join(is_prototype ? '\n  ' : ',\n  ')}\n}`;

    return `{ ${a.join(', ')} }`;
  }

  printPropertyDefinition(property_definition) {
    const { id, value, flags } = property_definition;
    let comments = property_definition.comments || id.comments;
    let s = flags & PropertyDefinition.GETTER ? 'get ' : flags & PropertyDefinition.SETTER ? 'set ' : '';
    if(flags & PropertyDefinition.STATIC) s = 'static ' + s;
    s = this.colorText.keywords(s);
    if(comments) {
      s = this.printComments(comments) + s;
    }
    let prop = this.printNode(id); //Util.filterOutKeys(id, ['comments']));
    let fn = this.printNode(value).replace(/^function ?/, '');
    if(fn.startsWith('*')) {
      s += '*';
      fn = fn.substring(1);
    }
    if(!(id instanceof Identifier)) prop = '[' + prop + ']';
    s += prop;

    //console.log('printPropertyDefinition:', { s, prop, id, value, fn });

    if(!(id instanceof Identifier) || (value && value.value != id.value)) {
      if(!(value instanceof FunctionDeclaration)) s += this.colorText.punctuators(': ');

      s += fn;
    }
    return s;
  }

  printMemberVariable(member_variable) {
    const { id, value, flags } = member_variable;
    let comments = member_variable.comments || id.comments;
    let s = '';

    if(flags & MemberVariable.STATIC) s = 'static ' + s;

    s = this.colorText.keywords(s);
    if(comments) {
      s = this.printComments(comments) + s;
    }
    let prop = this.printNode(Util.filterOutKeys(id, ['comments']));

    s += prop;

    s += ' = ';

    s += this.printNode(value);
    return s;
  }

  printArrayLiteral(array_literal) {
    const { elements } = array_literal;
    let output = elements.map((elem) => this.printNode(elem)).join(', ');
    return output.length ? `[ ${output} ]` : '[]';
  }

  printJSXLiteral(jsx_literal) {
    const { tag, attributes, closing, selfClosing, children } = jsx_literal;
    let output = this.format ? `h(${tag[0].toUpperCase() == tag[0] ? tag : "'" + tag + "'"}, {` : `<${closing ? '/' : ''}${tag}`;
    let i = 0;

    for(let attr in attributes) {
      const value = attributes[attr];

      if(this.format) output += i > 0 ? ',\n   ' : '\n   ';

      output += ` ${attr}`;

      if(!(value instanceof Literal && value.value === true) && !(value.value == attr && this.format)) {
        //console.log('printJSXLiteral', attr, value.value);

        output += this.format ? `: ` : `=`;
        if(value instanceof Literal) output += this.printNode(value);
        else output += this.format ? this.printNode(value) : `{${this.printNode(value)}}`;
      }
      i++;
    }
    output += this.format ? `\n  }, [` : selfClosing ? ' />' : '>';

    if(children instanceof Array && children.length > 0) {
      if(children.length == 1) {
        if(children[0] instanceof Literal) output += children[0].value.replace(/\\n/g, '\n');
        else output += this.printNode(children[0]);
      } else output += `\n    ` + children.map((child) => this.printNode(child).replace(/\n/g, '\n    ')).join(this.format ? ',\n    ' : '\n    ') + `\n  `;

      if(!this.format) output += `</${tag}>`;
    }

    if(this.format) output += `])`;

    return output;
  }

  /*
  printBindingPattern(binding_pattern) {
  }*/
  printArrayBindingPattern(array_binding_pattern) {
    const { elements } = array_binding_pattern;

    //console.log('printArrayBindingPattern', { elements });
    let output = '';

    for(let element of elements) {
      if(output != '') output += ', ';

      output += this.printNode(element);
    }

    /*    let output = elements
      .map(({ element }) => element.value)
      .join(this.colorCode.punctuators() + ', ');*/
    return `[ ${output} ]`;
  }

  printObjectBindingPattern(object_binding_pattern) {
    const { value, properties } = object_binding_pattern;
    //console.log('properties:', util.inspect(properties, { depth: 2, colors: true }));
    let output = '';
    for(let binding_property of properties) {
      if(output != '') output += ', ';

      //console.log('binding_property:', binding_property);

      if(!(binding_property instanceof PropertyDefinition)) {
        output += this.printNode(binding_property);
        continue;
      }

      if(binding_property.comments) output += this.printComments(binding_property.comments);

      let id = this.printNode(binding_property.id);
      let value = binding_property.value ? this.printNode(binding_property.value) : id;

      if(id == value) output += id;
      else output += `${id} = ${value}`;
    }

    //let output = properties.map(property => this.printNode(property)).join(', ');

    if(/\n/.test(output)) return this.colorText.punctuators('{') + `\n  ${output.replace(/\n/g, '\n  ')}\n` + this.colorText.punctuators('}');

    return this.colorText.punctuators('{') + ` ${output} ` + this.colorText.punctuators('}');
  }

  printComments(comments) {
    let output = '';
    for(let comment of comments) {
      output += comment.value;
    }
    return output;
  }

  printAwaitExpression(await_expression) {
    const { value } = await_expression;
    return this.colorText.keywords('await') + ` ${this.printNode(value)}`;
  }

  printRestOfExpression(rest_of_expression) {
    const { value } = rest_of_expression;
    return `...${this.printNode(value)}`;
  }
}

export default Printer;
