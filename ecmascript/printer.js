import { ESNode, Literal, TemplateLiteral, PropertyDefinition, MemberVariable, FunctionDeclaration, ArrowFunction, Identifier, ClassDeclaration, BindingProperty, ObjectBindingPattern, SpreadElement, MemberExpression } from './estree.js';
import Util from '../util.js';
import deep from '../deep.js';
//import util from 'util';
//import util from 'util';

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
      colorText: Object.entries(Printer.colors).reduce((acc, [key, codes]) => ({ ...acc, [key]: text => color.text(text, ...codes) }),
        {}
      ),
      colorCode: Object.entries(Printer.colors).reduce((acc, [key, codes]) => ({
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
      className = Util.className(node);
      name = Util.isObject(node) ? className : null;

      fn =
        this['print' + name] ||
        (() => '') ||
        function(...args) {
          args = args.map(a => Util.className(a));
          throw new Error(`Non-existent print${name}(${args})`);
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
          /*     console.log("comment position-offset:",position-comment.offset);
              //console.log("comment length:",comment.value.length);*/

          ret += comment.value;
        }
      }
    }
    ret += fn.call(this, node);

    if(ret.indexOf('\x1b[') != -1) {
      let ansi = Util.decodeAnsi(ret);
      if(!Util.equals(ansi, [0, 'm'])) ret += '\x1b[0m';
    }
    return ret;
  }

  print(tree) {
    this.nodes = [...deep.iterate(tree, node => Util.isObject(node) && 'position' in node)].map(([node, path]) => [
      node.position,
      path.join('.'),
      node
    ]);

    //console.log("comments: ", this.comments);

    //console.log("nodes: ", this.nodes);
    this.adjacent = this.comments.map(({ text, pos, len }) => ({
      start: pos,
      end: pos + len,
      text,
      nodes: this.nodes.slice(this.nodes.findIndex(([position, path]) => position > pos + len) - 1).slice(0, 2)
    }));

    //console.log("adjacent: ", this.adjacent);

    let output = this.printNode(tree);

    return output;
  }

  printProgram(program) {
    let output = '';
    for(let statement of program.body) {
      let line = this.printNode(statement);
      if(line == '') continue;
      if(/\n/.test(line) && output != '') output += '\n';
      //console.log(`line:'${line.replace(/\n/g, "\\n")}'`);
      output += line;

      output += line.trim().endsWith(';') ? '\n' : this.colorCode.punctuators(output) + ';\n';
    }
    output = output.replace(/[;\n ]*$/, '');
    if(output != '') output += this.colorCode.punctuators(output) + ';';
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
    const { property, id, initializer } = binding_property;

    let output = '';
    output += this.printNode(property);

    //console.log('printBindingProperty:', value.value, id.value);

    if([property, id].every(Util.isObject) && property.value != id.value) output += ': ' + this.printNode(id);
    if(initializer) output += ' = ' + this.printNode(initializer);
    return output;
  }

  printLiteral(literal) {
    let { value, species } = literal;
    // if(species != 'regexp') value = value.replace(/\\n/g, '\n');

    return this.colorText.numberLiterals(value);
  }

  printTemplateLiteral(template_literal) {
    let s = '';
    //console.log("template_literal:", template_literal);

    for(let part of template_literal.parts) {
      if(part instanceof Literal) s += part.value.replace(/\\n/g, '\n');
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

  printMemberExpression(member_expression) {
    const { object, property } = member_expression;
    const { colorText, colorCode } = this;
    let left, right;
    //console.log("member_expression:", member_expression);
    left = this.printNode(object);
    right = this.printNode(property);

    //console.log('printMemberExpression', { object, property });
    if(!(object instanceof Identifier) && !(object instanceof Literal) && !(object instanceof MemberExpression))
      left = '(' + left + ')';

    ///null.*{/.test(left) && console.log("object:", object);

    if(!/^[0-9]+$/.test(right) && !/[\.\']/.test(right) && property instanceof Literal)
      return left + colorText.punctuators('.') + right;
    return left + colorCode.punctuators(left) + '[' + right + colorCode.punctuators() + ']';
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

    if(args instanceof TemplateLiteral)
      return this.printNode(callee) + this.colorCode.punctuators() + this.printNode(args);
    let fn = this.printNode(callee);
    if(callee instanceof ArrowFunction) fn = `(${fn})`;

    return (fn +
      this.colorCode.punctuators(fn) +
      '(' +
      args.map(arg => this.printNode(arg)).join(this.colorCode.punctuators() + ', ') +
      this.colorCode.punctuators() +
      ')'
    );
  }

  /*
  /*
  printDecoratorExpression(decorator_expression) {
  }*/

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
    const { label, statement } = labelledStatement;

    let output = '';

    output += this.printNode(label);
    output += this.colorCode.punctuators(output) + ':';
    output += '\n';
    output += this.printNode(statement);
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
        let eol =
          (new RegExp('(;|\n|})$').test(line.trimEnd()) ? '' : this.colorCode.punctuators() + ';') +
          (multiline ? '\n' : '');
        //console.log("line:", { line, eol });

        if(line != '') s += line.replace(/\n/g, '\n  ') + eol;
      }
    } else {
      s += this.printNode(body).replace(/\n/g, '\n  ');
    }
    s = s.trimEnd();

    return (this.colorCode.punctuators() +
      '{' +
      s +
      this.colorCode.punctuators() +
      (new RegExp('[};\\n ]$').test(s) ? '\n}' : ';\n}')
    );
  }

  printStatementList(statement_list) {
    const { body } = statement_list;
    let s = '';
    for(let statement of body) {
      let line = this.printNode(statement);
      let multiline = /\n/.test(line);
      s += multiline && s.length ? '\n\n' : '\n';
      if(line != '') s += line;

      s +=
        (new RegExp('(;|\\n|}|\\s)$').test(line.trimEnd()) ? '' : this.colorCode.punctuators(s) + ';') +
        (multiline ? '\n' : '');
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
    let output = this.colorCode.keywords() + 'if' + this.colorCode.punctuators() + `(${condition}) ${if_true}`;
    if(alternate) {
      let if_false = this.printNode(alternate);
      output +=
        (new RegExp('[;}\\n]$').test(output) ? '' : this.colorCode.punctuators(output) + ';') +
        this.colorCode.keywords() +
        ` else ${if_false}`;
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
    let output =
      this.colorCode.keywords() +
      'while' +
      this.colorCode.punctuators() +
      `(` +
      this.printNode(test) +
      this.colorCode.punctuators() +
      ') ';
    output += this.printNode(body);
    return output;
  }

  printDoStatement(do_statement) {
    const { body, test } = do_statement;
    let output = `do `;
    output += this.printNode(body);
    output +=
      this.colorCode.keywords() +
      'while' +
      this.colorCode.punctuators() +
      `(` +
      this.printNode(test) +
      this.colorCode.punctuators() +
      ')';
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
    const { colorText, colorCode } = this;

    let output = colorText.keywords(`for${async ? ' await' : ''}`);

    output +=
      colorText.punctuators('(') + `${key} ${colorText.keywords(operator)} ${object}` + colorText.punctuators(')');

    let code = this.printNode(body);
    if(code[0] != '{') output += '\n  ';
    else if(!/\n./.test(code)) output += ' ';
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
      output += ` catch(` + parameters.map(param => this.printNode(param)).join(', ') + ') ';
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
    //console.log('printImportStatement', { doExport, identifiers });
    let output = this.colorCode.keywords() + doExport ? 'export ' : 'import ';
    //console.log(identifiers);

    if(identifiers && identifiers.declarations)
      output += identifiers.declarations.map(decl => this.printNode(decl)).join(', ');
    else output += this.printNode(identifiers);

    output += ' from ';

    //console.log('import_statement.source:', import_statement.source);
    output += this.printNode(import_statement.source);
    return output;
  }

  printExportStatement(export_statement) {
    const { what, declarations } = export_statement;

    //console.log('printExportStatement', { what, declarations });

    let output = this.colorCode.keywords() + 'export ';

    if(declarations instanceof ObjectBindingPattern) {
      let decl = '';
      for(let property of declarations.properties) {
        if(decl != '') decl += ', ';

        decl += this.printNode(property.id);

        const { id, property: value } = property;
        //console.log('printExportStatement', { id, value });

        if(id && value && id.toString() != value.toString()) {
          decl = this.printNode(value) + ' as ' + decl;
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

      if(!s.endsWith('}')) s += this.colorCode.punctuators(s) + ';';

      if(output.endsWith('}') || member instanceof FunctionDeclaration) output += '\n';

      output += '\n  ' + s;
    }

    output += '\n}';

    return output;
  }

  printFunctionDeclaration(function_declaration) {
    const { id, params, body, exported, generator, is_async } = function_declaration;
    let output = this.colorCode.keywords();
    output += exported ? 'export ' : '';
    output += is_async ? 'async ' : '';
    output += `function `;
    if(generator) output += '*';

    if(id) output += `${this.printNode(id)}`;

    output = output.replace(/ $/, '');
    output +=
      this.colorCode.punctuators(output) +
      '(' +
      (params.length !== undefined
        ? [...params].map(param => this.printNode(param)).join(', ')
        : this.printNode(params));

    output += this.colorCode.punctuators(output) + ') ';
    /*
 //console.log("body: ",body);
 //console.log("params: ",params);
 //console.log("output: ",output);*/

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

  printObjectLiteral(object_literal) {
    const { members } = object_literal;
    let output = '';
    let a = [];
    let is_multiline = false,
      is_prototype = true;
    if(members.length == 0) return this.colorText.punctuators('{}');
    for(let property of members) {
      let line = '';

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
        if(/function\s/.test(value)) {
          value = value.replace(/function\s/, '');
          isFunction = true;
        }
      }

      line += value.replace(/\n/g, '\n  ');

      if(property.flags &&
        !(property instanceof BindingProperty) &&
        !(object_literal instanceof ObjectBindingPattern)
      ) {
        line = name + ' = ' + line;
      } else if(name && name != line) {
        line = name + ': ' + line;
        if(!property.flags) is_prototype = false;
      }
      if(property.flags & PropertyDefinition.STATIC) line = 'static ' + line;
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

  printPropertyDefinition(property_definition) {
    const { id, value, flags } = property_definition;
    let comments = property_definition.comments || id.comments;
    let s = flags & PropertyDefinition.GETTER ? 'get ' : flags & PropertyDefinition.SETTER ? 'set ' : '';
    if(flags & PropertyDefinition.STATIC) s = 'static ' + s;
    s = this.colorText.keywords(s);
    if(comments) {
      s = this.printComments(comments) + s;
    }
    let name = this.printNode(id); //Util.filterOutKeys(id, ['comments']));
    let prop,
      isFunction = false;

    prop = this.printNode(value);
    if(value instanceof FunctionDeclaration)
      if(/function[\s\(]/.test(prop)) {
        prop = prop.replace(/function\s*/, '');
        isFunction = true;
      }
    if(prop.startsWith('*')) {
      s += '*';
      prop = prop.substring(1);
    }
    if(!(id instanceof Identifier)) name = '[' + name + ']';
    if(!isFunction) s += name;

    //console.log('printPropertyDefinition:', { s, name, id, value, prop });

    if(!(id instanceof Identifier) || (value && value.value != id.value)) {
      if(!isFunction) s += this.colorText.punctuators(': ');

      s += prop;
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
    let output = this.colorCode.punctuators() + '[ ';

    output += elements.map(elem => this.printNode(elem)).join(', ');
    output += this.colorCode.punctuators(output) + ' ]';

    return output;
  }

  printJSXLiteral(jsx_literal) {
    const { tag, attributes, closing, selfClosing, children } = jsx_literal;
    let output = this.format
      ? `h(${tag[0].toUpperCase() == tag[0] ? tag : "'" + tag + "'"}, {`
      : `<${closing ? '/' : ''}${tag}`;
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
      } else
        output +=
          `\n    ` +
          children
            .map(child => this.printNode(child).replace(/\n/g, '\n    '))
            .join(this.format ? ',\n    ' : '\n    ') +
          `\n  `;

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
    const { colorText, colorCode } = this;

    //console.log('printArrayBindingPattern', { elements });
    let output = '';

    for(let element of elements) {
      if(output != '') output += colorCode.punctuators() + ', ';

      output += this.printNode(element);
    }

    /*    let output = elements
      .map(({ element }) => element.value)
      .join(this.colorCode.punctuators() + ', ');*/
    return colorCode.punctuators() + `[ ${output} ${colorCode.punctuators()}]`;
  }

  printObjectBindingPattern(object_binding_pattern) {
    const { value, properties } = object_binding_pattern;
    //console.log('properties:', util.inspect(properties, { depth: 2, colors: true }));
    let output = '';
    for(let binding_property of properties) {
      if(output != '') output += ', ';

      // console.log('binding_property:', binding_property);

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

    if(/\n/.test(output))
      return (this.colorText.punctuators('{') + `\n  ${output.replace(/\n/g, '\n  ')}\n` + this.colorText.punctuators('}')
      );

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
    const { value } = await_expression;
    return this.colorText.keywords('await') + ` ${this.printNode(value)}`;
  }

  printRestOfExpression(rest_of_expression) {
    const { value } = rest_of_expression;
    return `...${this.printNode(value)}`;
  }
}

export default Printer;
