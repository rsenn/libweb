import {
  Node,
  Program,
  Expression,
  FunctionLiteral,
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
  PropertyDefinition,
  ArrayLiteral,
  JSXLiteral,
  BindingPattern,
  ArrayBindingPattern,
  ObjectBindingPattern,
  AwaitExpression,
  RestOfExpression
} from "./estree.js";
import Util from "../util.js";

export class Printer {
  constructor(options = {}) {
    this.indent = options.indent || 2;
  }

  printNode(node) {
    let name, fn, className;
    try {
      className = Util.className(node);
      name = Util.isObject(node) ? className : null;

      fn =
        this["print" + name] ||
        function(...args) {
          //console.log(`Non-existent print${name}(`, args, `)`);
          args = args.map(a => Util.className(a));
          throw new Error(`Non-existent print${name}(${args})`);
        };
    } catch(err) {
      //console.log("printNode error: ", err);
      //console.log("node:", node);
      process.exit(0);
    }
    /* if(!fn) {
      throw new Error(`No print function ${className}`);
    }*/
    let ret = fn.call(this, node);
    // console.log("printNode: " + ret);
    return ret;
  }

  print(tree) {
    return this.printNode(tree);
  }

  printProgram(program) {
    let output = "";

    for(let statement of program.body) {
      let line = this.printNode(statement);

      if(/\n/.test(line) && output != "") output += "\n";

      output += line + (line.endsWith("}") ? "\n" : ";\n");
    }
    return output;
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

  printThisExpression(this_expression) {
    return "this";
  }
  printSpreadElement(spread_element) {
    const { expr } = spread_element;

    return "..." + this.printNode(expr);
  }
  printUnaryExpression(unary_expression) {
    const { operator, argument, prefix } = unary_expression;

    let arg = this.printNode(argument);

    return prefix ? operator + arg : arg + operator;
  }

  printUpdateExpression(update_expression) {
    return this.printUnaryExpression(update_expression);
  }

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
    let left, right;

    left = this.printNode(object);
    right = this.printNode(property);

    /null.*{/.test(left) && console.log("object:", object);
    return left + "." + right;
  }

  printConditionalExpression(conditional_expression) {
    const { test, consequent, alternate } = conditional_expression;

    if(!test) {
      //console.log("conditional_expression:", conditional_expression);
      throw new Error("");
    }
    let condition = this.printNode(test);
    let if_true = this.printNode(consequent);
    let if_false = this.printNode(alternate);

    return condition + " ? " + if_true + " : " + if_false;
  }

  printCallExpression(call_expression) {
    const { arguments: args, callee } = call_expression;
    return this.printNode(callee) + "(" + args.map(arg => this.printNode(arg)).join(", ") + ")";
  }
  /*
  printDecoratorExpression(decorator_expression) {
  }*/

  printNewExpression(new_expression) {
    return "new " + this.printCallExpression(new_expression);
  }
  printSequenceExpression(sequence_expression) {
    const { expressions } = sequence_expression;

    let output = expressions.map(expr => this.printNode(expr)).join(", ");
    return output;
  }

  //printStatement(statement) {}
  printBlockStatement(block_statement) {
    const { body } = block_statement;
    let s = "";
    if(!body) {
      console.log("block_statement:", block_statement);
      process.exit();
    }
    if("length" in body) {
      if(body.length == 0) return "{}";
      for(let statement of body) {
        if(statement == null) {
          console.log("printBlockStatement: ", body);
          throw new Error();
        }
        let line = this.printNode(statement);
        let multiline = /\n/.test(line);
        s += multiline && s.length ? "\n\n  " : "\n  ";
        if(line != "") s += line.replace(/\n/g, "\n  ") + (/(;|\n|})$/.test(line.trimEnd()) ? "" : ";") + (multiline ? "\n" : "");
      }
    } else {
      s += this.printNode(body).replace(/\n/g, "\n  ");
    }
    s = s.trimEnd();
    s += /[};n ]$/.test(s) ? "\n}" : ";\n}";
    return "{" + s;
  }

  printStatementList(statement_list) {
    const { body } = statement_list;
    let s = "";

    for(let statement of body) {
      let line = this.printNode(statement);
      let multiline = /\n/.test(line);
      s += multiline && s.length ? "\n\n" : "\n";
      if(line != "") s += line + (/(;|\n|})$/.test(line.trimEnd()) ? "" : ";") + (multiline ? "\n" : "");
    }

    return s;
  }

  printEmptyStatement(empty_statement) {
    return "";
  }
  /*  printExpressionStatement(expression_statement) {
  }*/

  printReturnStatement(return_statement) {
    const { argument } = return_statement;
    let output = "return";
    if(argument) {
      output += " ";
      output += this.printNode(argument);
    }
    return output;
  }

  printContinueStatement(continue_statement) {
    return "continue";
  }
  printBreakStatement(break_statement) {
    return "break";
  }

  printIfStatement(if_statement) {
    const { test, consequent, alternate } = if_statement;

    let condition = this.printNode(test);
    let if_true = this.printNode(consequent);

    let output = `if(${condition}) ${if_true}`;

    if(alternate) {
      let if_false = this.printNode(alternate);
      output += (/[;}\n]$/.test(output) ? "" : ";") + ` else ${if_false}`;
    }
    return output;
  }

  printSwitchStatement(switch_statement) {
    const { test, cases } = switch_statement;
    let condition = this.printNode(test);
    let output = `switch(${condition}) {\n`;
    for(let case_clause of cases) {
      const { value, body } = case_clause;
      if(value == null)
        output += "  default:";
     else
        output += "  case " + this.printNode(value) + ":";
      let case_body = this.printNode(body)
        .trim()
        .replace(/\n/g, "\n  ");
      output += /^[^{].*\n/.test(case_body) ? "\n  " : " ";
      output += case_body + (/\n/.test(case_body) ? "\n\n"  : "\n");
    }
    return output + `}`;
  }

  printWhileStatement(while_statement) {
    const { body, test } = while_statement;
    let output = `while(` + this.printNode(test) + ") ";
    output += this.printNode(body);
    return output;
  }

  printDoStatement(do_statement) {
    const { body, test } = do_statement;

    let output = `do `;
    output += this.printNode(body);
    output += ` while(` + this.printNode(test) + ")";
    return output;

    //console.log(arguments[0]);
    //console.log(Object.keys(arguments[0]).join(", "));
    throw new Error(arguments[0]);
  }

  printForStatement(for_statement) {
    const { init, test, update, body } = for_statement;

    let assign = init ? this.printNode(init) : "";
    let condition = test ? ' '+this.printNode(test) : "";
    let iterate = update ? ' '+this.printNode(update) : "";

    let output = `for(${assign};${condition};${iterate})`;
    output += this.printNode(body);
    return output;
  }

  printForInStatement(for_in_statement) {
    const { left, right, body } = for_in_statement;

    let key = this.printNode(left);
    let object = this.printNode(right);

    let output = `for(${key} in ${object})`;
    output += this.printNode(body);
    return output;
  }
  /*printWithStatement(with_statement) {
  }*/
  printTryStatement(try_statement) {
    const { body, parameters, trap } = try_statement;
    let output = "try ";
    output += this.printNode(body);
    output += ` catch(` + parameters.map(param => this.printNode(param)).join(", ") + ") ";
    output += this.printNode(trap);
    return output;
  }

  printImportStatement(import_statement) {
    const { identifiers } = import_statement;
    let output = identifiers.exported ? "export " : "import ";
    //console.log(identifiers);

    output += identifiers.declarations.map(decl => this.printNode(decl)).join(", ");
    output += " from ";
    output += this.printNode(import_statement.source);
    return output;
  }

  printExportStatement(export_statement) {
    const { what, declarations } = export_statement;
    //console.log(identifiers);

    let output = "export ";
    output += this.printNode(what);
    output += " ";
    output += this.printNode(declarations);
    return output;
  }

  printThrowStatement(throw_statement) {
    let { expression } = throw_statement;

    return "throw " + this.printNode(expression);
  }
  /*
  printDeclaration(declaration) {
  }*/

  printClassDeclaration(class_declaration) {
    const { id, extending, members, exported } = class_declaration;

    let output = "class";

    if(exported) output = "export " + output;
    let name = id ? this.printNode(id) : "";
    if(name != "") output += " " + name;
    if(extending) output += " extends " + this.printNode(extending);

    //console.log("members:", members);
    output += " " + this.printNode(members);

    return output;
  }

  printFunctionDeclaration(function_declaration) {
    const { id, params, body, exported, async } = function_declaration;
    let output = exported ? "export " : "";
    output += async ? "async " : "";
    output += `function`;
    if(id) output += ` ${this.printNode(id)}`;
    output +=
      "(" +
      (params.length !== undefined
        ? Array.from(params)
            .map(param => this.printNode(param))
            .join(", ")
        : this.printNode(params)) +
      ") ";

    //console.log("body: ",function_declaration);

    output += this.printNode(body);

    return output;
  }

  printArrowFunction(arrow_function) {
    const { async, params, body } = arrow_function;
    let output = async ? "async " : "";
    output +=
      "(" +
      (params.length !== undefined
        ? Array.from(params)
            .map(param => this.printNode(param))
            .join(", ")
        : this.printNode(params)) +
      ")";
    output += " => ";
    if(typeof body.map == "function") output += body.map(line => this.printNode(line)).join("\n  ");
    else output += this.printNode(body);
    return output;
  }

  printVariableDeclaration(variable_declaration) {
    const { kind, exported, declarations } = variable_declaration;
    let output = kind != "" ? `${kind} ` : "";
    output += declarations.map(decl => this.printNode(decl)).join(", ");
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
    let output = "";
    let a = [];
    let is_multiline = false,
      is_prototype = true;

    for(let property of members) {
      let member = this.printNode(property.value);
      let name = property.id;
      let line = '';

      if("id" in property.value) {
        let functionName = property.value.id;
        if(!functionName || functionName.value == name.value) {
          if(!functionName)
            line += name.value;

          name = '';
        }
      }
      if(!is_multiline && /\n/.test(member)) is_multiline |= true;
      line += member.replace(/\n/g, "\n  ");

      if(!name /*&& name.value === key*/) {
        line = line.replace(/function\s?/, "");
      } else {
        line = name.value + ": " + line;
        is_prototype = false;
      }

      a.push(line);
    }

    if(is_multiline) return `{\n  ${a.join(is_prototype ? "\n\n  " : ",\n  ")}\n}`;

    return `{ ${a.join(", ")} }`;
  }

    printPropertyDefinition(property_definition) {
      const {id, property, getter_or_setter } = property_definition;

 let s = getter_or_setter & PropertyDefinition.GETTER ? "get " : getter_or_setter & PropertyDefinition.SETTER ? "set " : "";

 s += id.value;
 console.log("property:",property);

s += this.printNode(property);
return s;
    }


  printArrayLiteral(array_literal) {
    const { elements } = array_literal;
    let output = elements.map(elem => this.printNode(elem)).join(", ");
    return output.length ? `[ ${output} ]` : "[]";
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
  ${children.map(child => this.printNode(child).replace(/\n/g, "\n  ")).join("\n  ")}
</${tag}>`;
    }

    return `<${closing ? "/" : ""}${tag}${output}${selfClosing ? " /" : ""}>`;
  }

  /*
  printBindingPattern(binding_pattern) {
  }*/
  printArrayBindingPattern(array_binding_pattern) {
    const { elements } = array_binding_pattern;
    let output = elements.map(({ element }) => element.value).join(", ");
    return `[ ${output} ]`;
  }

  printObjectBindingPattern(object_binding_pattern) {
    const { value, properties } = object_binding_pattern;
    let output = properties
      .map(({ property, element }) => {
        if(property.value == element.value) return property.value;
        return `${property.value}: ${element.value}`;
      })
      .join(", ");
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
