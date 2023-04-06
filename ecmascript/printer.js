import { ESNode, Literal, FunctionLiteral, TemplateLiteral, Property, MethodDefinition, FunctionDeclaration, ArrowFunctionExpression, Identifier, ClassDeclaration, ObjectPattern, SpreadElement, MemberExpression, Statement, ImportDeclaration, ImportSpecifier, BlockStatement, IfStatement } from './estree.js';
import Util from '../util.js';
import * as deep from '../deep.js';
//import util from 'util';
//import util from 'util';
const linebreak = new RegExp('\\r?\\n', 'g');

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
    const { indent = 2, colors = false, format = 1 } = options;
    this.indent = indent || 2;
    this.comments = comments || [];

    let color = Util.coloring(colors);

    Util.define(this, {
      color,
      colorText: Object.entries(Printer.colors).reduce(
        (acc, [key, codes]) => ({
          ...acc,
          [key]: text => color.text(text, ...codes)
        }),
        {}
      ),
      colorCode: Object.entries(Printer.colors).reduce(
        (acc, [key, codes]) => ({
          ...acc,
          [key]: output => {
            if(typeof output == 'string') {
              if(Util.equals(Util.decodeAnsi(output).slice(0, -1), codes)) return '';
            }
            return color.code(...codes);
          }
        }),
        {}
      )
    });
    this.format = format;
  }

  printNode(node) {
    let name, fn, className;
    try {
      name = (Util.isObject(node) && node instanceof ESNode && Util.className(node)) || node.type;

      fn =
        this['print' + name] ||
        //(() => '') ||
        function(...args) {
          args = args.map(a => Util.className(a));
          let err = new Error(`Non-existent print${name}(${args}): ` + Util.inspect(node));
          err.node = node;
          throw err;
        };
    } catch(err) {
      //console.log('err:', err);
      throw err;
      process.exit(0);
    }
    let ret = '';
    //    console.log("node:",node);
    if(node instanceof ESNode) {
      const assoc = ESNode.assoc(node);
      const comments = assoc.comments || [];
      const position = +assoc.position;
      if(comments && comments.length) {
        for(let comment of comments) {
          //console.log('comment:', Util.escape(comment.value));
          ret += comment.value;
        }
      }
    }
    let code = fn.call(this, node);
    if((node instanceof Statement || node instanceof ImportDeclaration) && !(node instanceof FunctionDeclaration || node instanceof BlockStatement))
      if(!code.trimEnd().endsWith(';') && !code.trimEnd().endsWith('}')) code += this.colorCode.punctuators(code) + ';';
    //if(ret.length) console.log('code:', Util.escape(code));
    ret += code;

    if(ret.indexOf('\x1b[') != -1) {
      let ansi = Util.decodeAnsi(ret);
      if(!Util.equals(ansi, [0, 'm'])) ret += '\x1b[0m';
    }
    return ret;
  }

  print(tree) {
    let it = deep.iterate(tree, node => Util.isObject(node) && 'position' in node, deep.RETURN_VALUE_PATH);
    this.nodes = [...it].map(([node, path]) => [node.position, path.join('.'), node]);
    this.adjacent = this.comments.map(({ text, pos, len }) => ({
      start: pos,
      end: pos + len,
      text,
      nodes: this.nodes.slice(this.nodes.findIndex(([position, path]) => position > pos + len) - 1).slice(0, 2)
    }));
    let output = this.printNode(tree);
    return output;
  }

  printProgram(program) {
    let output = '';
    for(let statement of program.body) {
      let line = this.printNode(statement);
      //  if(line == '') continue;
      if(output.length /*&& output.endsWith(';')*/) {
        if(!/^\s*\/[\/*]/.test(line)) {
          output += '\n';
          if(line.indexOf('\n') != -1 && !output.endsWith('\n')) output += '\n';
        }
      }
      output += line;
    }
    //   if(output != '') output += this.colorCode.punctuators(output) + ';';
    return output;
  }

  printString(str) {
    return this.colorText.stringLiterals(`"${str}"`);
  }

  /*
  printExpression(expression) {
  }*/

  printFunctionArgument(function_argument) {
    const { arg, defaultValue } = function_argument;

    let output = '';
    output += this.printNode(arg);

    if(defaultValue) {
      output += ' = ';
      output += this.printNode(defaultValue);
    }
    return output;
  }

  printIdentifier(identifier) {
    return this.colorText.identifiers(identifier.name);
  }

  printSuper(node) {
    return this.colorText.keywords('super');
  }

  /*printComputedPropertyName(computed_property_name) {
    const { expr } = computed_property_name;
    let output = '[';
    output += this.printNode(expr);
    output += ']';
    return output;
  }*/

  /*printBindingProperty(binding_property) {
    const { property, id, initializer } = binding_property;

    let output = '';
    output += this.printNode(property);

    //console.log('printBindingProperty:', value.value, id.value);

    if([property, id].every(Util.isObject) && property.value != id.value)
      output += ': ' + this.printNode(id);
    if(initializer) output += ' = ' + this.printNode(initializer);
    return output;
  }*/

  printLiteral(literal) {
    let { value, raw } = literal;

    if(typeof value == 'string') value = value.replace(linebreak, '\\n');

    let s = raw ?? value;

    return this.colorText.numberLiterals(s);
  }

  printRegExpLiteral(regexp_literal) {
    //console.log('printRegExpLiteral', regexp_literal);
    let { pattern, flags } = regexp_literal.regex;

    return this.colorText.regexpLiterals(`/${pattern}/${flags || ''}`);
  }

  printTemplateLiteral(template_literal) {
    const { quasis, expressions } = template_literal;
    let s = '`';
    //console.log('template_literal:', template_literal);

    for(let i = 0; i < quasis.length; i++) {
      const { value } = quasis[i];
      s += value.raw; //.replace(/\\n/g, '\n');

      if(expressions[i]) s += '${' + this.printNode(expressions[i]) + '}';
    }
    s += '`';
    return this.colorText.templates(s);
  }

  printThisExpression(this_expression) {
    return 'this';
  }

  printSpreadElement(spread_element) {
    const { argument } = spread_element;
    return '...' + this.printNode(argument);
  }

  printUnaryExpression(unary_expression) {
    const { operator, argument, prefix } = unary_expression;
    let isAlpha = /[a-z]$/.test(operator);
    let output = '';
    let arg = this.printNode(argument);
    //arg = '(' + arg + ')';
    if(prefix && isAlpha) arg = ' ' + arg;
    if(!prefix) output += arg;
    output += this.colorCode[isAlpha ? 'keywords' : 'punctuators']() + operator;
    if(prefix) output += arg;
    return output;
  }

  printUpdateExpression(update_expression) {
    return this.printUnaryExpression(update_expression);
  }

  printBinaryExpression(binary_expression) {
    const { operator, left, right } = binary_expression;

    let lhs = this.printNode(left).replace(/[\s\;]*$/g, '');
    let rhs = this.printNode(right);
    let output = lhs + ' ';
    output += this.colorCode[/^[a-z]/.test(operator) ? 'keywords' : 'punctuators'](output) + operator;
    output += ' ' + rhs;

    return output;
  }

  printAssignmentExpression(assignment_expression) {
    const { operator, left, right } = assignment_expression;
    let output = this.printNode(left) + ' ';
    output += this.colorCode.punctuators(output) + operator;
    output += ' ' + this.printNode(right);
    return output;
  }

  printLogicalExpression(logical_expression) {
    const { operator, left, right } = logical_expression;
    //console.log('logical_expression', logical_expression);
    let output = '';
    output += this.printNode(left) + ' ';
    output += this.colorCode[/^[a-z]/.test(operator) ? 'keywords' : 'punctuators'](output) + operator;
    output += ' ' + this.printNode(right);
    return output;
  }

  printChainExpression(chain_expression) {
    const { expression } = chain_expression;

    return this.printNode(expression);
  }

  printMemberExpression(member_expression) {
    const { object, property, computed, optional } = member_expression;
    const { colorText, colorCode } = this;
    let left, right;
    //console.log("member_expression:", member_expression);
    left = this.printNode(object);
    right = this.printNode(property);

    //console.log('printMemberExpression', { object, property });
    if(!(object instanceof Identifier) && !(object instanceof Literal) && !(object instanceof MemberExpression)) left = '(' + left + ')';

    ///null.*{/.test(left) && console.log("object:", object);
    const punctuator = optional ? '?.' : '.';

    if(!computed) return left + colorText.punctuators(punctuator) + colorCode.identifiers() + right;
    return left + colorCode.punctuators(left) + (optional ? '?.' : '') + '[' + right + colorCode.punctuators() + ']';
  }

  printConditionalExpression(conditional_expression) {
    const { test, consequent, alternate } = conditional_expression;
    //console.log('conditional_expression:', conditional_expression);

    if(!test) throw new Error('');

    let condition = this.printNode(test);
    let if_true = this.printNode(consequent);
    let if_false = this.printNode(alternate);
    return condition + ' ? ' + if_true + ' : ' + if_false;
  }

  printCallExpression(call_expression) {
    const { arguments: args, callee, optional = false } = call_expression;
    //console.log("args:", util.inspect(args, { depth: Infinity, breakLength: 1000 }));

    if(args instanceof TemplateLiteral) return this.printNode(callee) + this.colorCode.punctuators() + this.printNode(args);
    let fn = this.printNode(callee);
    if(callee instanceof ArrowFunctionExpression) fn = `(${fn})`;

    return fn + this.colorCode.punctuators(fn) + (optional ? '?.' : '') + '(' + args.map(arg => this.printNode(arg)).join(this.colorCode.punctuators() + ', ') + this.colorCode.punctuators() + ')';
  }

  printNewExpression(new_expression) {
    return this.colorCode.keywords() + 'new ' + this.printCallExpression(new_expression);
  }

  printSequenceExpression(sequence_expression) {
    const { expressions } = sequence_expression;

    let output = this.colorCode.punctuators() + '(';
    //console.log('expressions: ', expressions);

    output += expressions
      .flat()
      .map(expr => {
        let node = this.printNode(expr);
        return node;
      })
      .join(', ');
    output += this.colorCode.punctuators(output) + ')';
    return output;
  }

  printLabelledStatement(labelledStatement) {
    const { label, body } = labelledStatement;

    let output = '';

    output += this.printNode(label);
    output += this.colorCode.punctuators(output) + ':';
    output += '\n';
    output += this.printNode(body);
    return output;
  }

  printBlockStatement(block_statement) {
    const { body } = block_statement;
    let s = '';
    /*if(!body) {
      //console.log("block_statement:", block_statement);
      process.exit();
    }*/
    if('length' in body) {
      if(body.length == 0) return this.colorText.punctuators('{}');
      for(let statement of body) {
        if(statement == null) {
          //console.log("printBlockStatement: ", body);
          throw new Error();
        }
        let line = this.printNode(statement);

        let multiline = /\n/.test(line);
        s += multiline && s.length ? (line.endsWith('\n') ? '\n' : '\n\n') : line.endsWith('\n') ? '' : '\n';

        if(s.endsWith('\n')) s += '  ';
        let eol = (/(;|\n|})$/.test(line.trimEnd()) ? '' : this.colorCode.punctuators() + ';') + (multiline ? '\n' : '');
        //console.log("line:", { line, eol });

        if(line != '') s += line.replace(linebreak, '\n  ') + eol;
      }
    } else {
      s += this.printNode(body).replace(linebreak, '\n  ');
    }
    s = s.trimEnd();

    return this.colorCode.punctuators() + '{' + s + this.colorCode.punctuators() + (new RegExp('[};\\n ]$').test(s.trimEnd()) ? '\n}' : ';\n}');
  }

  printStatementList(statement_list) {
    const { body } = statement_list;
    let s = '';
    for(let statement of body) {
      let line = this.printNode(statement);
      let multiline = /\n/.test(line);
      s += multiline && s.length ? '\n\n' : '\n';
      if(line != '') s += line;

      s += (new RegExp('(;|\\n|}|\\s)$').test(line.trimEnd()) ? '' : this.colorCode.punctuators(s) + ';') + (multiline ? '\n' : '');
    }
    return s;
  }

  printEmptyStatement(empty_statement) {
    return '';
  }

  printExpressionStatement(expression_statement) {
    const { expression } = expression_statement;
    return this.printNode(expression);
  }

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
    const { label } = continue_statement;

    let s = this.colorText.keywords('continue');

    if(label) {
      s += ' ';
      s += this.printNode(label);
    }
    return s;
  }

  printBreakStatement(break_statement) {
    const { label } = break_statement;
    let s = this.colorText.keywords('break');

    if(label) {
      s += ' ';
      s += this.printNode(label);
    }
    return s;
  }

  printIfStatement(if_statement) {
    const { test, consequent, alternate } = if_statement;
    let condition = this.printNode(test);
    let if_true = this.printNode(consequent);
    let newline = (s, space = '  ') => (s.startsWith('{') ? ' ' : '\n' + space);
    let output = this.colorCode.keywords() + 'if' + this.colorCode.punctuators() + `(${condition})${newline(if_true)}${if_true}`;
    if(alternate) {
      let if_false = this.printNode(alternate);
      output +=
        (new RegExp('[;}\\n]$').test(output) ? '' : this.colorCode.punctuators(output) + ';') +
        this.colorCode.keywords() +
        `${newline(if_true, '')}else${alternate instanceof IfStatement ? ' ' : newline(if_false)}${if_false}`;
    }
    return output;
  }

  printSwitchStatement(switch_statement) {
    const { discriminant, cases } = switch_statement;
    let condition = this.printNode(discriminant);
    let output = this.colorCode.keywords() + `switch` + this.colorCode.punctuators() + `(${condition}) {\n`;
    for(let case_clause of cases) {
      const { test, consequent } = case_clause;
      //console.log('printSwitchStatement', { test });

      if(test == null) output += '  default:';
      else if(test.type == 'Literal') {
        const { raw, value } = test;
        output += '  case ' + (raw ?? value) + ':';
      } else output += '  case ' + this.printNode(test) + ':';
      let case_body = this.printNode(consequent).trim();

      case_body = (/^[^{].*\n/.test(case_body) ? '\n' : ' ') + case_body;
      case_body = case_body.replace(linebreak, '\n    ');
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

  printDoWhileStatement(do_statement) {
    const { body, test } = do_statement;
    let output = `do `;
    output += this.printNode(body);
    output += ' ' + this.colorCode.keywords() + 'while' + this.colorCode.punctuators() + `(` + this.printNode(test) + this.colorCode.punctuators() + ')';
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

  printForInStatement(for_in_statement, operator = 'in') {
    const { left, right, body } = for_in_statement;

    let key = this.printNode(left).replace(/;$/, '');
    let object = this.printNode(right);
    const { colorText, colorCode } = this;

    let output = colorText.keywords(`for${for_in_statement.await ? ' await' : ''}`);

    output += colorText.punctuators('(') + `${key} ${colorText.keywords(operator)} ${object}` + colorText.punctuators(')');

    let code = this.printNode(body);
    if(code[0] != '{') output += '\n  ';
    else if(!/\n./.test(code)) output += ' ';
    else output += '\n';

    output += code;
    return output;
  }

  printForOfStatement(for_of_statement) {
    return this.printForInStatement(for_of_statement, 'of');
  }

  printWithStatement(with_statement) {
    const { object, body } = with_statement;

    let output = this.colorCode.keywords() + 'with' + this.colorCode.punctuators() + '(' + this.printNode(object) + this.colorCode.punctuators() + ') ';
    output += this.printNode(body);
    return output;
  }

  printTryStatement(try_statement) {
    const { block, handler, finalizer } = try_statement;
    //console.log('printTryStatement', { block, handler, finalizer });
    let output = 'try ';
    output += this.printNode(block);
    if(handler) {
      const { param, body } = handler;
      if(param) output += ` catch(` + this.printNode(param) + ') ';
      else output += ' catch ';
      output += this.printNode(body);
    }
    if(finalizer) {
      output += ` finally `;
      output += this.printNode(finalizer);
    }
    return output;
  }

  printImportSpecifier(import_specifier) {
    const { local, imported } = import_specifier;

    let decl = this.printNode(local);
    let exportName = this.printNode(imported);

    let s = exportName;

    if(decl != exportName) s += ' as ' + decl;
    return s;
  }

  printImportDefaultSpecifier(import_default_specifier) {
    const { local } = import_default_specifier;

    let decl = this.printNode(local);

    return decl;
  }

  printImportNamespaceSpecifier(import_namespace_specifier) {
    const { local } = import_namespace_specifier;
    let decl = this.printNode(local);
    let s = '*';
    s += ' as ' + decl;
    return s;
  }

  printImportDeclaration(import_statement) {
    const { specifiers, source } = import_statement;
    //console.log('printImportDeclaration', console.config({ compact: 1, depth: Infinity }), { specifiers, source });
    let output = this.colorCode.keywords() + 'import ';

    const isImportSpecifier = node => Util.isObject(node) && node instanceof ImportSpecifier;

    let list = specifiers.reduce(
      (acc, spec, i) => [
        ...acc,
        (isImportSpecifier(specifiers[i - 1]) ^ isImportSpecifier(spec) ? '{ ' : '') + this.printNode(spec) + (isImportSpecifier(specifiers[i + 1]) ^ isImportSpecifier(spec) ? ' }' : '')
      ],
      []
    );

    output += list.join(', ');
    output += ' from ';
    output += this.printNode(source);
    return output;
  }

  printExportSpecifier(export_specifier) {
    const { local, exported } = export_specifier;

    let id = this.printNode(local);
    let name = this.printNode(exported);

    let s = id;
    if(id != name) s += this.colorText.keywords(' as ') + name;

    return s;
  }

  printExportNamedDeclaration(export_named_declaration) {
    const { declaration, specifiers, source } = export_named_declaration;

    //console.log('printExportNamedDeclaration', { declaration, specifiers, source });

    let output = this.colorCode.keywords() + 'export ';

    if(declaration) {
      output += this.printNode(declaration);
    } else {
      output += '{ ' + specifiers.map(spec => this.printNode(spec)).join(this.colorCode.punctuators() + ', ') + ' }';

      //.replace(/:\ /g, ' as ');
      if(source) {
        output += ' from ';
        output += this.printNode(source);
      }
    }

    return output; //.replace(/[\;\n ]*$/, '');
  }

  printExportDefaultDeclaration(export_default_declaration) {
    const { declaration } = export_default_declaration;
    //console.log('printExportDefaultDeclaration', { declaration });
    let output = this.colorText.keywords('export default ');

    output += this.printNode(declaration);
    return output;
  }

  printThrowStatement(throw_statement) {
    let { argument } = throw_statement;

    return 'throw ' + this.printNode(argument);
  }

  printYieldExpression(yield_expression) {
    let { argument, delegate } = yield_expression;
    let output = 'yield';

    if(delegate) output += '*';
    output += ' ' + this.printNode(argument);
    return output;
  }

  printClassDeclaration(class_declaration) {
    const { id, superClass, body } = class_declaration;
    const members = body.body;
    //console.log('printClassDeclaration', { id, superClass, members });
    let output = 'class';
    output = this.colorText.keywords(output);

    let name = id ? this.printNode(id) : '';
    if(name != '') output += ' ' + this.colorText.identifiers(name);
    if(superClass) {
      output += this.colorText.keywords(' extends ') + this.printNode(superClass);
    }
    output += ' {';
    for(let member of members) {
      let s = this.printNode(member);
      if(member instanceof FunctionDeclaration) s = s.replace(/function\s/, '');
      s = s.replace(linebreak, '\n  ');
      if(!s.endsWith('}')) s += this.colorCode.punctuators(s) + ';';
      if(output.endsWith('}') || member instanceof FunctionDeclaration) output += '\n';
      output += '\n  ' + s;
    }
    output += '\n}';
    return output;
  }

  printFunctionBody(function_body) {
    return this.printBlockStatement(function_body);
  }

  printFunctionDeclaration(function_declaration) {
    const { id, params, body, /*exported,*/ generator, async: is_async } = function_declaration;
    let output = this.colorCode.keywords();
    // output += exported ? 'export ' : '';
    output += is_async ? 'async ' : '';
    output += `function `;
    if(generator) output += '*';
    let name;
    if(id) {
      name = this.printNode(id);
      if(id.type != 'Identifier') name = '[' + name + ']';
    }
    if(name != undefined) output += name;
    output = output.replace(/ $/, '');
    output += this.colorCode.punctuators(output) + '(' + (params.length !== undefined ? [...params].map(param => this.printNode(param)).join(', ') : this.printNode(params));
    output += this.colorCode.punctuators(output) + ') ';
    output += this.printBlockStatement(body) + '\n';

    return output;
  }

  printArrowFunctionExpression(arrow_function) {
    const { is_async, params, body } = arrow_function;
    let output = is_async ? 'async ' : '';
    output +=
      this.colorCode.punctuators() +
      '(' +
      (params.length !== undefined
        ? Array.from(params)
            .map(param => this.printNode(param))
            .join(', ')
        : this.printNode(params)) +
      this.colorCode.punctuators() +
      ')';
    output += ' => ';
    let code;
    {
      code = this.printNode(body);
      if(Util.className(body).startsWith('Object')) code = '(' + code + ')';
    }
    output += code;
    return output;
  }

  printVariableDeclaration(variable_declaration) {
    const { kind, exported, declarations } = variable_declaration;
    let output = exported ? 'export ' : '';

    output += kind != '' ? this.colorText.keywords(kind) + ' ' : '';
    output += declarations.map(decl => this.printNode(decl)).join(', ');
    output += this.colorCode.punctuators(output) + ';';
    return output;
  }

  printVariableDeclarator(variable_declarator) {
    const { id, init } = variable_declarator;
    let output = this.printNode(id);
    if(init) {
      output += ' ' + this.colorText.punctuators('=') + ` ${this.printNode(init)}`;
    }
    return output;
  }

  printObjectExpression(object_literal) {
    const { properties } = object_literal;
    let output = '';
    let a = [];
    let is_multiline = false,
      is_prototype = true;
    if(properties.length == 0) return this.colorText.punctuators('{}');
    for(let property of properties) {
      let line = '';

      let name, value;
      let isFunction = false;

      if(property instanceof FunctionDeclaration) {
        //name =  this.printNode(property.id);
        value = this.printNode(property).replace(/function /, '');
        isFunction = true;
      } else if(property instanceof Property || !property.key) {
        value = this.printNode(property);
        //console.debug('printObjectLiteral:', { value });
        a.push(value);
        continue;
      } else {
        name = this.printNode(property.key);
        value = this.printNode(property.value);
      }

      if(property.value instanceof FunctionDeclaration) {
        //console.log("function.id:", property.value.id);
        let functionName = property.value.id ? this.printNode(property.value.id) : '';
        if(functionName != '') {
          name = functionName;
          // delete property.key;
        } else if(functionName) {
          name = '';
        }
        value = this.printNode(property.value);
        if(/function\s/.test(value)) {
          value = value.replace(/function\s/, '');
          isFunction = true;
        }
      }

      line += value.replace(linebreak, '\n  ');

      if(property.flags && !(property instanceof BindingProperty) && !(object_literal instanceof ObjectPattern)) {
        line = name + ' = ' + line;
      } else if(name && name != line) {
        line = name + ': ' + line;
        if(!property.flags) is_prototype = false;
      }
      if(property.flags & Property.STATIC) line = 'static ' + line;
      line += property.flags ? this.colorCode.punctuators() + ';' : '';
      if(/\n/.test(line)) line = '\n  ' + line;
      a.push(line);
      if(!is_multiline && /\n/.test(line)) is_multiline |= true;
    }

    if(is_multiline) return `{\n  ${a.join(is_prototype ? '\n  ' : ',\n  ')}\n}`;

    output += this.colorCode.punctuators() + '{ ';
    output += a.join(this.colorCode.punctuators() + ', ');
    output += this.colorCode.punctuators(output) + ' }';
    return output;
  }

  printProperty(property_definition) {
    //console.debug('printProperty', property_definition, ESNode.assoc(property_definition));
    const { key, value, kind, shorthand } = property_definition;
    let comments = property_definition.comments || (key && key.comments);
    let prefix = '';
    let s = ['init', 'method'].indexOf(kind) != -1 ? '' : this.colorText.keywords(kind) + ' ';
    if(comments) s = this.printComments(comments) + s;
    let name = key ? this.printNode(key) : '';
    let prop,
      isFunction = false;
    prop = value ? this.printNode(value) : '';
    if(kind == 'get') console.log('printProperty', { value, name, prop, shorthand, s });
    if(value instanceof FunctionDeclaration)
      if(/function[\s\(]/.test(prop)) {
        prop = prop.replace(/function\s*/, '');
        isFunction = true;
      }
    if(prop.startsWith('*')) {
      prefix = '*';
      prop = prop.substring(1);
    }
    // console.log('printProperty', { key, prop, isFunction, shorthand });
    if(key && (!(key instanceof Identifier) || key?.type != 'Identifier')) name = '[' + name + ']';

    if(!isFunction) s += name;

    if(value.type == 'AssignmentPattern') {
      prop = prop.replace(name, '');
      s += prop;
    } else if(!(shorthand || name == prop)) {
      if(name != '' && s != '' && !isFunction) s += this.colorText.punctuators(': ');
      s += prop;
    }
    if(prefix) s = prefix + s;
    //console.log('printProperty', {s});
    return s;
  }

  printAssignmentProperty(assignment_property) {
    return this.printProperty(assignment_property);
  }

  printAssignmentPattern(assignment_pattern) {
    const { left, right } = assignment_pattern;

    return this.printNode(left) + this.colorText.punctuators(' = ') + this.printNode(right);
  }

  printMethodDefinition(method_definition) {
    const { key, value, kind, computed } = method_definition;
    let comments = method_definition.comments || (key && key.comments);
    let s = '';

    if(method_definition.static) s = 'static ' + s;
    if(kind != 'method' && kind != 'constructor') s += kind + ' ';
    if(s != '') s = this.colorText.keywords(s);
    if(comments) {
      s = this.printComments(comments) + s;
    }
    s += kind == 'constructor' ? kind : this.printNode(key);
    let fn = this.printNode(value);

    if(value instanceof FunctionLiteral) s += fn.substring(fn.indexOf('('));
    else s += ' = ' + fn;
    return s;
  }

  printArrayExpression(array_literal) {
    const { elements } = array_literal;
    let output = this.colorCode.punctuators() + '[ ';

    output += elements.map(elem => (elem === null ? '' : this.printNode(elem))).join(', ');
    output += this.colorCode.punctuators(output) + ' ]';

    return output;
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
      } else output += `\n    ` + children.map(child => this.printNode(child).replace(linebreak, '\n    ')).join(this.format ? ',\n    ' : '\n    ') + `\n  `;

      if(!this.format) output += `</${tag}>`;
    }

    if(this.format) output += `])`;

    return output;
  }

  printArrayPattern(array_binding_pattern) {
    const { elements } = array_binding_pattern;
    const { colorText, colorCode } = this;

    //console.log('printArrayPattern', { elements });
    let output = elements.map(element => (element ? this.printNode(element) : '')).join(colorCode.punctuators() + ', ');

    / blah /;

    return colorCode.punctuators() + `[ ${output} ${colorCode.punctuators()}]`;
  }

  printObjectPattern(object_binding_pattern) {
    const { value, properties } = object_binding_pattern;
    //console.log('printObjectPattern:', { value, properties });

    let output = '';
    for(let binding_property of properties) {
      if(output != '') output += ', ';
      output += this.printNode(binding_property);
      //console.log('printObjectPattern:', { binding_property, output});
    }
    if(/\n/.test(output)) return this.colorText.punctuators('{') + `\n  ${output.replace(linebreak, '\n  ')}\n` + this.colorText.punctuators('}');
    return this.colorText.punctuators('{') + ` ${output} ` + this.colorText.punctuators('}');
  }

  printComments(comments) {
    let output = '';
    for(let comment of comments) {
      output += this.colorCode.comments(output) + comment.value;
    }
    return output;
  }

  printAwaitExpression(await_expression) {
    const { argument } = await_expression;
    return this.colorText.keywords('await') + ` ${this.printNode(argument)}`;
  }

  printRestElement(rest_element) {
    const { argument } = rest_element;
    return `...${this.printNode(argument)}`;
  }

  printMetaProperty(meta_property) {
    const { meta, identifier } = meta_property;

    return this.printNode(meta) + '.' + this.printNode(identifier);
  }
}

export default Printer;
