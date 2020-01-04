var Util = require("./util.js");

function Stack() {
  let stack = Util.getCallerStack(1, 100).map(Util.stackFrame);

  stack = stack.filter(s => !/Parser.parser.</.test(s.functionName));
  stack = stack.filter(s => s.typeName == "Parser");
  stack = stack.map(s => ({
    method: s.functionName || s.methodName,
    position: s.position /*, type: s.typeName*/
  }));
  return stack;
}
function Error(msg) {
  this.msg = msg;
  this.stack = Stack();
}
function SyntaxError(msg) {
  this.msg = msg;
  this.stack = Stack();
}

class Node {
  type = null;

  constructor(obj) {
    this.type = obj.type;
    Object.assign(this, obj);
  }
  toString(depth = 0) {
    var str = "";
    const indent = Util.repeat(depth, "  ");
    var node = this;

    str += node.type;
    str += indent + "{\n";

    for(let prop in node) {
      if(prop == "type") continue;
      var value = node[prop];
      if(value instanceof Array || (value && value.map !== undefined)) value = value.map(v => indent + "  " + (v.toString ? v.toString() : "" + v)).join("\n");
      else value = node[prop] && node[prop].toString ? node[prop].toString() : node[prop];
      str += indent + `  ${prop}:${value}\n`;
    }

    str += indent + "}\n";

    return str;
  }
  inspect() {
    return this.toString();
  }
}

class AST {
  constructor(visitor) {
    this.visitor = node => {
      node = new Node(node);
      if(visitor) {
        visitor(node);
      }
      return node;
    };
  }

  program = body => this.visitor({ body, type: "Program" });

  chunk = body => this.visitor({ body, type: "Chunk" });

  do_stat = body => this.visitor({ body, type: "DoStatement" });

  break_stat = () => this.visitor({ type: "BreakStatement" });

  return_stat = params => this.visitor({ params, type: "ReturnStatement" });

  expr_stat = expression => this.visitor({ expression, type: "ExpressionStatement" });

  func_stat = (id, params, body) => this.visitor({ id, params, body, type: "FunctionDeclaration" });

  local_stat = (variables, init) => this.visitor({ init, variables, type: "LocalStatement" });

  if_stat = (cond, body, elseif, _else) => this.visitor({ cond, body, elseif, else: _else, type: "IfStatement" });

  fornum_stat = (id, begin, end, step, body) => this.visitor({ id, begin, end, step, body, type: "FornumStatement" });

  forlist_stat = (id, left, right, body) => this.visitor({ id, left, right, body, type: "ForlistStatement" });

  while_stat = (cond, body) => this.visitor({ cond, body, type: "WhileStatement" });

  repeat_stat = (cond, body) => this.visitor({ cond, body, type: "RepeatStatement" });

  identifier = name => this.visitor({ name, type: "Identifier" });

  literal = (value, raw, quote = "") => this.visitor({ value, raw, quote, type: "Literal" });

  unary_expr = (op, argument) => this.visitor({ op, argument, type: "UnaryExpression" });

  binary_expr = (op, left, right) => this.visitor({ op, left, right, type: "BinaryExpression" });

  call_expr = (callee, params) => this.visitor({ callee, params, type: "CallExpression" });

  member_expr = (object, sep, property) => this.visitor({ object, sep, property, type: "MemberExpression" });

  index_expr = (object, index) => this.visitor({ object, index, type: "IndexExpression" });

  assign_expr = (op, left, right) => this.visitor({ op, left, right, type: "AssignExpression" });

  table_expr = (fields, multiline = true) => this.visitor({ fields, multiline, type: "TableExpression" });

  recfield = (key, value) => this.visitor({ key, value, type: "Recfield" });

  listfield = value => this.visitor({ value, type: "Listfield" });

  comment = text => this.visitor({ text, type: "Comment" });

  undef = () => this.visitor({ type: "Undefined", value: "" });
}

class Env {
  constructor(parent) {
    this.vars = {};
    this.parent = parent;

    this.def("require", "function: internal");
  }

  extend() {
    return new Env(this);
  }

  lookup(name) {
    let scope = this;
    while(scope) {
      if(scope.vars.hasOwnProperty(name)) {
        return scope;
      }
      scope = scope.parent;
    }
    return null;
  }

  get(name) {
    let scope = this.lookup(name);
    if(scope) {
      return scope.vars[name];
    }

    throw new Error(`Undefined variable ${name}`);
  }

  set(name, value) {
    let scope = this.lookup(name);
    if(!scope) {
      throw new Error("Undefined variable " + name);
    }

    scope.vars[name] = value;
  }

  def(name, value) {
    return (this.vars[name] = value);
  }
}

class JSGenerator {
  constructor(ast) {
    this.ast = ast;
  }

  to_js() {
    return js(this.ast);

    function js_polyfill() {
      return `

const print = ////console.error
const ipairs =(table) => {
  let i = 0;
  const keys = Object.keys(table).filter((key) => {
    if(/\\d+/.test(key))
      return true;
    return false;
  });

  return() => {
    if(i++ < keys.length)
      return [keys[i-1], table[keys[i-1]]];
    else
      return [undefined, undefined];
  };
}
const pairs =(table) => {
  let i = 0;
  const keys = Object.keys(table).filter((key) => {
    if(/\\d+/.test(key))
      return false;
    return true;
  });

  return() => {
    if(i++ < keys.length)
      return [keys[i-1], table[keys[i-1]]];
    else
      return [undefined, undefined];
  };
}
`;
    }

    function js_program(node) {
      return js_polyfill() + js(node.body);
    }

    function js_chunk(node) {
      return node.body.map(js).join("\n");
    }

    function js_local_statement(node) {
      return node.variables.map((variable, i) => `${variable.name} = ${js(node.init[i])}`).join("\n");
    }

    function js_do_statement(node) {
      return `
{

${js(node.body)}

}
`;
    }

    function js_literal(node) {
      /*
                cheating :)
             */

      return JSON.stringify(node.value);
    }

    function js_identifier(node) {
      return node.name;
    }

    function js_call_expression(node) {
      const callee = js(node.callee);
      const params = node.params
        .map(param => {
          return js(param);
        })
        .join(", ");
      return `${callee}(${params})`;
    }

    function js_expression_statement(node) {
      return js(node.expression);
    }

    function js_binary_expression(node) {
      return `(${js(node.left)} ${node.op} ${js(node.right)})`;
    }

    function js_unary_map(value) {
      switch (value) {
        case "#-":
          return "-";
        default:
          return value;
      }
    }

    function js_unary_expression(node) {
      return `${js_unary_map(node.op)}${js(node.argument)}`;
    }

    function js_break_statement(node) {
      return "break";
    }

    function js_table_expression(node) {
      let list = 0;
      const fields = node.fields.map(field => (field.type == "Recfield" ? `"${js(field.key)}": ${js(field.value)}` : `"${list++}": ${js(field.value)}`)).join(", ");
      return `{${fields}}`;
    }

    function js_member_expression(node) {
      return `${js(node.object)}.${js(node.property)}`;
    }

    function js_index_expression(node) {
      return `${js(node.object)}[${js(node.index)}]`;
    }

    function js_assign_expression(node) {
      return node.left.map((variable, i) => `${js(variable)}${node.op}${js(node.right[i])}`).join("\n");
    }

    function js_fornum_statement(node) {
      return `for ${js(node.id)} = ${js(node.begin)}, ${js(node.end)}; ${js(node.id)} += ${js(node.step)}) {
                ${js(node.body)}
            }
`;
    }

    function js_forlist_statement(node) {
      const left = node.left
        .map((variable, i) => {
          return `${js(variable)} = value[${i}]`;
        })
        .join("\n");

      return `
            for(const iterator = ${js(node.right)};;) {
                let value = iterator();
                if(value[0] == undefined) break

                ${left}
                ${js(node.body)}
            }`;
    }

    function js_while_statement(node) {
      return `while(${js(node.cond)}) {
  ${js(node.body)}
}`;
    }

    function js_repeat_statement(node) {
      let body = js(node.body).replace(/\n/g, ";\n  ");
      return `
for(;;) {
  ${body};
  if(${js(node.cond)})
     break;
}
            `;
    }

    function js_function_declaration(node) {
      const params = node.params
        .map(param => {
          return js(param);
        })
        .join(", ");

      return `function ${js(node.id)}(${params}) {
                ${js(node.body)}
            }`;
    }

    function js_return_statement(node) {
      const params = node.params
        .map(param => {
          return js(param);
        })
        .join(", ");
      return `return ${params}`;
    }

    function js_if_statement(node) {
      const elseif = node.elseif
        .map(e => {
          return `else if(${js(e.cond)}) {
                    ${js(e.body)}
                }`;
        })
        .join("\n");

      let other = "";
      if(node.else) {
        other = `else {
                    ${js(node.else)}
                }`;
      }

      return `
if(${js(node.cond)}) {
    ${js(node.body)}
}
${elseif}
${other}`;
    }

    function js(node) {
      switch (node.type) {
        case "Program":
          return js_program(node);
        case "Chunk":
          return js_chunk(node);
        case "LocalStatement":
          return js_local_statement(node);
        case "Literal":
          return js_literal(node);
        case "Identifier":
          return js_identifier(node);
        case "ExpressionStatement":
          return js_expression_statement(node);
        case "CallExpression":
          return js_call_expression(node);
        case "BinaryExpression":
          return js_binary_expression(node);
        case "UnaryExpression":
          return js_unary_expression(node);
        case "DoStatement":
          return js_do_statement(node);
        case "BreakStatement":
          return js_break_statement(node);
        case "TableExpression":
          return js_table_expression(node);
        case "MemberExpression":
          return js_member_expression(node);
        case "IndexExpression":
          return js_index_expression(node);
        case "AssignExpression":
          return js_assign_expression(node);
        case "IfStatement":
          return js_if_statement(node);
        case "FornumStatement":
          return js_fornum_statement(node);
        case "ForlistStatement":
          return js_forlist_statement(node);
        case "WhileStatement":
          return js_while_statement(node);
        case "RepeatStatement":
          return js_repeat_statement(node);
        case "FunctionDeclaration":
          return js_function_declaration(node);
        case "ReturnStatement":
          return js_return_statement(node);
        default:
          throw new Error("Dunno how to generate for " + Util.inspect(node, { newline: " " }));
      }
    }
  }
}

class MoonScriptGenerator {
  stack = [];
  multiline = true;
  indent = "";

  constructor(ast, multiline = true, indent = "") {
    if(ast !== undefined) {
      this.ast = ast;
      if(multiline !== undefined) this.multiline = multiline;
      if(indent !== undefined) this.indent = indent;
    }
  }

  clone(multiline, ast) {
    if(multiline === undefined) multiline = this.multiline;
    if(ast === undefined) ast = this.ast;
    return new MoonScriptGenerator(ast, multiline, this.indent);
  }

  static create(node, multiline = true, indent = "") {
    return new MoonScriptGenerator(node, multiline, indent);
  }

  static str(node, multiline = false, indent = "") {
    var gen = MoonScriptGenerator.create(node, multiline, indent);
    return gen.str();
  }

  str(node) {
    if(node === undefined) node = this.ast;
    return this.to_moonscript(node);
  }

  subtree(node, multiline = false) {
    var subtree = node && node.length !== undefined ? new Node({ type: "Chunk", body: node }) : node; //new Node({ type: 'Program', body: node });
    var gen = MoonScriptGenerator.create(subtree, multiline);
    return gen.to_moonscript(node);
  }

  to_moonscript(tree) {
    if(tree === undefined) tree = this.ast;
    return MoonScriptGenerator.to_moonscript(tree, this);
  }

  static to_moonscript(tree, generator) {
    if(generator === undefined) generator = new MoonScriptGenerator();

    return moonscript(tree);

    function moonscript_polyfill() {
      return ``;
    }

    function moonscript_body(code, indent = "  ") {
      return moonscript(code)
        .trimEnd()
        .replace(/\n/g, "\n  ");
    }

    function moonscript_program(node) {
      return moonscript_polyfill() + moonscript(node.body);
    }

    function moonscript_chunk(node) {
      return node.body.map(moonscript).join("\n");
    }

    function moonscript_local_statement(node) {
      let vars = node.variables.map((variable, i) => ({
        name: variable.name,
        init: moonscript(node.init[i])
      }));

      vars = vars.filter(v => v.init != "");
      return vars.map(v => `${v.name} = ${v.init}`).join("\n");
    }

    function moonscript_do_statement(node) {
      return `
  ${moonscript_body(node.body)}
`;
    }

    function moonscript_literal(node) {
      // if(/^[-+]?[0-9.]*[0-9]$/.test(node.value)) return node.value;

      var value = node.value === null ? "nil" : String(node.value);
      return `${node.quote || ""}${value}${node.quote || ""}`;
    }

    function moonscript_identifier(node) {
      return node.name;
    }

    function moonscript_call_expression(node) {
      let paren = false;
      if(generator.stack[1].type == "MemberExpression") paren = true;

      ////console.error('node: ', generator.stack[1].type);
      const callee = moonscript(node.callee);
      const params = node.params.map(param => moonscript(param)).join(", ");
      return paren ? `${callee}(${params})` : `${callee} ${params}`;
    }

    function moonscript_expression_statement(node) {
      return moonscript(node.expression);
    }

    function moonscript_binary_expression(node) {
      let exp = `${moonscript(node.left)} ${node.op} ${moonscript(node.right)}`;
      return `${exp}`;
    }

    function moonscript_unary_map(value) {
      switch (value) {
        case "#-":
          return "-";
        case "!":
          return "not";
        default:
          return value;
      }
    }

    function moonscript_unary_expression(node) {
      return `${moonscript_unary_map(node.op)}${moonscript(node.argument)}`;
    }

    function moonscript_break_statement(node) {
      return "break";
    }

    function moonscript_table_expression(node) {
      let list = 0;
      const types = Util.histogram(node.fields.map(f => f.type));
      var indent = generator.indent + "  ";
      console.error("TYPES: ", types);
      const fields = node.fields.map(field => {
        let key = generator.subtree(field.key, false);
        let num = parseInt(key);
        if(!isNaN(num)) key = num;
        if(field.type == "Recfield") return `['${key}']: ` + generator.subtree(field.value, false, indent + "  ").replace(/\n/g, "\n" + indent);
        return generator.str(field.value, node.multiline, indent);
      });
      return "{" + (generator.multiline ? "\n" + indent : " ") + fields.join(generator.multiline ? "\n" + indent : ", ") + (generator.multiline ? "\n" + generator.indent : " ") + "}";
    }

    function moonscript_member_expression(node) {
      return moonscript(node.object) + moonscript(node.property);
    }

    function moonscript_index_expression(node) {
      return moonscript(node.object) + moonscript(node.index);
    }

    function moonscript_assign_expression(node) {
      console.error("ASSIGN_EXPRESSION ", node);

      if(node.left && node.left.length >= 2) return `${moonscript(node.left)} = ${moonscript(node.right)}`;

      return node.left
        .map((variable, i) => {
          let r = node.right[i];
          console.error("variable.name=" + variable.name + ", r=", r);
          if(r.left && variable.name == r.left.name && ["*", "%", "/", "+", "-"].indexOf(r.op) != -1) {
            return `${moonscript(variable)} ${r.op}${node.op} ${moonscript(node.right[i].right)}`;
          }

          return `${moonscript(variable)} ${node.op} ${moonscript(r)}`;
        })
        .join("\n");
    }

    function moonscript_fornum_statement(node) {
      return `for ${moonscript(node.id)} = ${moonscript(node.begin)}, ${moonscript(node.end)}, ${moonscript(node.step)}
  ${moonscript_body(node.body)}`;
    }

    function moonscript_forlist_statement(node) {
      const left = node.left.map((variable, i) => moonscript(variable)).join(", ");
      return `for ${left} in ${moonscript(node.right)}
  ${moonscript_body(node.body)}`;
    }

    function moonscript_while_statement(node) {
      return `while ${moonscript(node.cond)}
  ${moonscript_body(node.body)}`;
    }

    function moonscript_repeat_statement(node) {
      return `repeat
  ${moonscript_body(node.body)}
until ${moonscript(node.cond)}`;
    }

    function moonscript_function_declaration(node) {
      const params = node.params.map(param => moonscript(param)).join(", ");
      const name = moonscript(node.id);
      const assignment = name == "" ? "" : `${name} = `;

      return `${assignment}(${params}) ->
  ${moonscript_body(node.body)}
`;
    }

    function moonscript_return_statement(node) {
      const params = node.params.map(param => moonscript(param)).join(", ");
      return `return ${params}`;
    }
    function moonscript_comment(node) {
      const text = node.text;
      return `--${text}`;
    }

    function moonscript_if_statement(node) {
      const elseif = node.elseif
        .map(
          e => `elseif ${moonscript(e.cond)}
  ${moonscript_body(e.body)}`
        )
        .join("\n");

      let other = "";
      let thenBody = moonscript_body(node.body);
      let elseBody = node.else ? moonscript_body(node.else) : "";
      if(elseBody != "") {
        other = `else
  ${moonscript_body(node.else)}`;
      }
      /* else if(thenBody == '') return '';*/
      return `if ${moonscript(node.cond)}
  ${thenBody}
${elseif}
${other}`;
    }

    function moonscript(node) {
      let ret = "";
      if(node === undefined) return "";

      generator.stack.unshift(node);

      if(node.length !== undefined && node.type === undefined && node.map) return node.map(moonscript);

      if(node.type == undefined) {
        console.error("node = ", node);
        // throw { message: "node.type == undefined",  node };
        return "";
      }

      switch (node.type) {
        case "Program":
          ret = moonscript_program(node);
          break;
        case "Chunk":
          ret = moonscript_chunk(node);
          break;
        case "LocalStatement":
          ret = moonscript_local_statement(node);
          break;
        case "Literal":
          ret = moonscript_literal(node);
          break;
        case "Identifier":
          ret = moonscript_identifier(node);
          break;
        case "ExpressionStatement":
          ret = moonscript_expression_statement(node);
          break;
        case "CallExpression":
          ret = moonscript_call_expression(node);
          break;
        case "BinaryExpression":
          ret = moonscript_binary_expression(node);
          break;
        case "UnaryExpression":
          ret = moonscript_unary_expression(node);
          break;
        case "DoStatement":
          ret = moonscript_do_statement(node);
          break;
        case "BreakStatement":
          ret = moonscript_break_statement(node);
          break;
        case "TableExpression":
          ret = moonscript_table_expression(node);
          break;
        case "MemberExpression":
          ret = moonscript_member_expression(node);
          break;
        case "IndexExpression":
          ret = moonscript_index_expression(node);
          break;
        case "AssignExpression":
          ret = moonscript_assign_expression(node);
          break;
        case "IfStatement":
          ret = moonscript_if_statement(node);
          break;
        case "FornumStatement":
          ret = moonscript_fornum_statement(node);
          break;
        case "ForlistStatement":
          ret = moonscript_forlist_statement(node);
          break;
        case "WhileStatement":
          ret = moonscript_while_statement(node);
          break;
        case "RepeatStatement":
          ret = moonscript_repeat_statement(node);
          break;
        case "FunctionDeclaration":
          ret = moonscript_function_declaration(node);
          break;
        case "ReturnStatement":
          ret = moonscript_return_statement(node);
          break;
        case "Comment":
          ret = moonscript_comment(node);
          break;
        case "Undefined":
          ret = "";
          break;
        default:
          throw { message: "Dunno how to generate for " + node.type }; //Util.inspect(node, { newline: ' ' }));
          break;
      }
      //ret = typeof(ret) == 'string' ? ret.trim() : ret;
      /*     if(/Statement$/.test(node.type)) {
       if(ret.length > 0 && ret[ret.length - 1] != "\n")
       ret += '\n';
     } */

      generator.stack.shift();

      return ret;
    }
  }
}

class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
  get position() {
    return `${this.line}:${this.column}`;
  }
  toString() {
    return `Token { ${this.type}, value:'${this.value}', line:${this.line}, column:${this.column} }`;
  }
}

Token.EOS = "EOS";
Token.DOT = "DOT";
Token.COLON = "COLON";
Token.GT = "GT";
Token.GE = "GE";
Token.LE = "LE";
Token.LT = "LT";
Token.ASSIGN = "ASSIGN";
Token.EQ = "EQ";
Token.ELLIPSES = "ELLIPSES";
Token.CONCAT = "CONCAT";
Token.NUMBER = "NUMBER";
Token.KEYWORD = "KEYWORD";
Token.IDENTIFIER = "IDENTIFIER";
Token.STRING = "STRING";
Token.SEMICOLON = "SEMICOLON";
Token.PLUS = "PLUS";
Token.MINUS = "MINUS";
Token.MUL = "MUL";
Token.DIV = "DIV";
Token.MOD = "MOD";
Token.MOD = "POW";
Token.COMMA = "COMMA";
Token.LPAREN = "LEFT PAREN";
Token.RPAREN = "RIGHT PAREN";
Token.LBRACKET = "LEFT BRACKET";
Token.RBRACKET = "RIGHT BRACKET";
Token.LBRACE = "LEFT BRACE";
Token.RBRACE = "RIGHT BRACE";
Token.COMMENT = "COMMENT";
Token.HASH = "#";

class Lexer {
  index = 0;
  pos = 0;
  line = 1;
  column = 1;

  constructor(source) {
    this.source = source;
    this.size = source.length;

    this.keywords = {
      and: 1,
      break: 1,
      do: 1,
      else: 1,
      elseif: 1,
      end: 1,
      false: 1,
      for: 1,
      function: 1,
      if: 1,
      in: 1,
      local: 1,
      nil: 1,
      not: 1,
      or: 1,
      repeat: 1,
      return: 1,
      then: 1,
      true: 1,
      until: 1,
      while: 1
    };
  }

  get current_line() {
    let pos = this.pos > 0 ? this.pos - 1 : this.pos;
    let str = this.source.substring(this.pos - this.column);

    return str.substring(0, str.indexOf("\n"));
  }

  get xy() {
    return [this.column, this.line];
  }

  is_digit_or_letter(c) {
    return this.is_digit(c) || this.is_letter(c);
  }

  is_digit(c) {
    return !![1, 1, 1, 1, 1, 1, 1, 1, 1, 1][c];
  }

  is_hex(c) {
    return /^[0-9a-fA-F]$/.test(c);
  }

  is_letter(c) {
    return /^[a-zA-Z_]$/.test(c);
  }

  lookahead(n, eat = false) {
    if(eat) {
      this.eat(n);
      return this.source[this.pos];
    }

    return this.source[this.pos + n];
  }

  eat(n = 1) {
    var newpos = this.pos + n;
    while(this.pos < newpos) {
      /*    if(this.source[this.pos] == '\n') {
        this.line++;
        this.column = 0;
      } else this.column++;
*/
      this.pos++;
    }
  }

  croak(msg) {
    let ch = this.source[this.pos];

    throw new Error(`lexer error at ${this.line}:${this.column} ${ch}`);
  }

  token(lookahead, type, value) {
    this.pos += lookahead;
    this.column += lookahead;
    return new Token(type, value, this.line, this.column);
  }

  scan_integer() {
    let peek;

    peek = this.lookahead(0);
    if(!is_digit(peek)) {
      return this.croak("not digit");
    }

    let sum = 0;
    for(;;) {
      if(is_digit(peek)) {
        sum = sum * 10 + parseInt(peek, 10);
      } else {
        return sum;
      }

      peek = this.lookahead(1, true);
    }
  }

  scan_longstring() {
    let comment = [];
    if(this.lookahead(0) != "[") {
      this.croak("not [");
    }
    let peek = this.lookahead(1, true);
    let term = 0;
    if(peek == "=") {
      term++;
      for(;;) {
        peek = this.lookahead(1, true);
        if(peek == "=") {
          term++;
          continue;
        } else if((peek = "[")) {
          break;
        } else {
          return this.croak();
        }
      }
    } else if(peek != "[") {
      return this.croak();
    }
    for(;;) {
      peek = this.lookahead(1, true);
      /*
       * try to find ]=*]
       */
      if(peek == "]") {
        let i;
        this.eat(1);
        for(i = 0; i < term; i++) {
          peek = this.lookahead(i);
          if(peek == "=") {
            continue;
          } else if(peek == undefined) {
            return this.croak(peek);
          }
        }
        if(i == term) {
          peek = this.lookahead(term);
          if(peek == "]") {
            this.lookahead(2 + term, true);
            return comment.join("");
          } else if(peek == undefined) {
            return this.croak(peek);
          }
        }
      } else if(peek == undefined) {
        return this.croak(peek);
      }
      comment.push(peek);
    }
  }

  scan() {
    let identifier, base, string, comment, baes, c, peek, peekpeek;

    for(;;) {
      c = this.lookahead(0);
      peek = this.lookahead(1);
      peekpeek = this.lookahead(2);

      this.column++;
      this.quote = "";

      switch (c) {
        case undefined:
          return this.token(0, Token.EOS, Token.EOS);

        case "\f":
        case "\r":
        case " ":
        case "\t":
          this.lookahead(1, true);
          continue;
        case "\n":
          this.line++;
          this.column = 0;
          this.lookahead(1, true);
          continue;
        case ";":
          return this.token(1, Token.SEMICOLON, ";");
        case "+":
          return this.token(1, Token.PLUS, "+");
        case "-":
          if(peek == "-") {
            if(peekpeek != "[") {
              peek = this.lookahead(1, true);
              comment = [];
              for(;;) {
                peek = this.lookahead(1, true);
                if(peek == "\n" /*|| peek == undefined*/) {
                  return this.token(0, Token.COMMENT, comment.join(""));
                } else {
                  comment.push(peek);
                  continue;
                }
              }
            }

            this.lookahead(2, true);
            comment = this.scan_longstring();
            return this.token(0, Token.COMMENT, comment);
          }

          return this.token(1, Token.MINUS, "-");
        case "*":
          return this.token(1, Token.MUL, "*");
        case "/":
          return this.token(1, Token.DIV, "/");
        case "%":
          return this.token(1, Token.MOD, "%");
        case "^":
          return this.token(1, Token.POW, "^");
        case ",":
          return this.token(1, Token.COMMA, ",");
        case "(":
          return this.token(1, Token.LPAREN, "(");
        case ")":
          return this.token(1, Token.RPAREN, ")");
        case "[":
          if(peek == "[" || peek == "=") {
            string = this.scan_longstring();
            return this.token(0, Token.STRING, string);
          }

          return this.token(1, Token.LBRACKET, "[");
        case "]":
          return this.token(1, Token.RBRACKET, "]");
        case "{":
          return this.token(1, Token.LBRACE, "{");
        case "}":
          return this.token(1, Token.RBRACE, "}");
        case "=":
          if(peek == "=") return this.token(2, Token.EQ, "==");

          return this.token(1, Token.ASSIGN, "=");

        case ">":
          if(peek == "=") return this.token(2, Token.GE, ">=");

          return this.token(1, Token.GT, ">");

        case "<":
          if(peek == "=") return this.token(2, Token.LE, "<=");

          return this.token(1, Token.LT, "<");

        case "~":
          if(peek == "=") return this.token(2, Token.NE, "~=");

          return this.croak();

        case ":":
          return this.token(1, Token.COLON, ":");

        case ".":
          if(peek == ".") {
            if(peekpeek == ".") return this.token(3, Token.ELLIPSES, "...");
            return this.token(2, Token.CONCAT, "..");
          }

          return this.token(1, Token.DOT, ".");

        case "'":
          string = [];
          for(;;) {
            peek = this.lookahead(1, true);
            if(peek == c) {
              return this.token(1, Token.STRING, string.join(""));
            } else if(peek == undefined) {
              return this.croak();
            } else {
              string.push(peek);
            }
          }

        case "#":
          return this.token(1, Token.HASH, "#");

        case '"':
        case "'":
          this.quote = c;
          string = [];
          for(;;) {
            peek = this.lookahead(1, true);
            if(peek == c) {
              return this.token(1, Token.STRING, string.join(""));
            } else if(peek == undefined) {
              return this.croak();
            } else {
              string.push(peek);
            }
          }

        default:
          if(this.is_digit(c)) {
            let num = 0;
            if(peek == "x" || peek == "X") {
              this.eat(1);
              peek = this.lookahead(1);
              if(!this.is_hex(peek)) return this.croak();
              for(;;) {
                peek = this.lookahead(1, true);
                if(this.is_hex(peek)) num = 16 * num + parseInt(peek, 16);
                else return this.token(0, Token.NUMBER, num);
              }
            }
            for(peek = c; ; ) {
              num = 10 * num + parseInt(peek, 10);
              peek = this.lookahead(1, true);
              if(this.is_digit(peek)) continue;
              else break;
            }
            if(peek == ".") {
              base = 1;
              for(;;) {
                peek = this.lookahead(1, true);
                if(this.is_digit(peek)) {
                  base = base * 0.1;
                  num = base * parseInt(peek, 10) + num;
                } else {
                  break;
                }
              }
            }
            if(peek == "E" || peek == "e") {
              peek = this.lookahead(1, true);
              if(peek == "-") {
                this.eat(1);
                base = -1;
              } else if(peek == "+") {
                this.eat(1);
                base = +1;
              } else {
                base = +1;
              }
              let integer = base * this.scan_integer();
              num = num * Math.pow(10, integer);
            }
            return this.token(0, Token.NUMBER, num);
          }
          if(this.is_letter(c) || c == "_") {
            identifier = [c];
            for(;;) {
              peek = this.lookahead(1, true);
              if(!this.is_digit_or_letter(peek) && peek != "_") {
                identifier = identifier.join("");
                if(this.keywords[identifier]) return this.token(0, Token.KEYWORD, identifier);
                return this.token(0, Token.IDENTIFIER, identifier);
              } else if(peek == undefined) {
                return this.croak();
              } else {
                identifier.push(peek);
              }
            }
          }
          return this.croak();
      }
    }
  }
}

class Parser {
  depth = 0;

  constructor(lexer, visitor) {
    this.lexer = lexer;
    this.cur_token = null;
    this.ast = new AST(node => {
      if(visitor) {
        visitor(node);
      }
      return node;
    });
    this.location = [];
    let parser = this;

    for(let name of Util.getMethodNames(this)) {
      if(name.startsWith("parse_")) {
        let fn = this[name];
        parser[name] = function() {
          const args = [...arguments];
          this.depth += 1;
          let indent = "  ".repeat(this.depth);
          this.log("position: ", this.cur_token.position, " args: ", args);
          let ret = fn.apply(this, args);
          if(ret && ret !== null) {
            this.log("ret: ", ret.toString ? ret.toString().replace(/\n/g, "\n" + indent) : ret);
            this.node = ret;
          }

          this.depth -= 1;
          return ret;
        };
        //      console.error('Function: ', name, parser[name]);
      }
    }
  }

  log() {
    return;
    let args = [...arguments];
    let stack = Util.getCallers(0, 10);

    stack = stack.filter(s => (s.typeName == "Parser" || (s.methodName || s.functionName || "").indexOf("parse") != -1) && s.methodName != "log");
    const names = stack.filter(f => !f.functionName.startsWith("Parser.")).map(f => f.functionName);

    stack = stack.map(s => ({
      method: s.methodName || s.functionName,
      position: s.position,
      toString: () => `${this.method} ${this.position}`
    }));

    var name = stack[0].method;
    name = Util.repeat(this.depth, "  ").join("") + name;
    name = name + Util.pad(name, 80);
    args.unshift(name);

    //    process.stderr.write(util.inspect(args)+"\n");

    console.error.apply(console, args);
  }

  yield_error(fn, token) {
    let xy = this.lexer.xy;

    //const names = caller.map(c => c.methodName).join(',');
    throw new SyntaxError(`${fn} token=${this.cur_token.toString()}`);
  }

  next() {
    let token = this.cur_token;

    do {
      this.xy = this.lexer.xy;
      this.cur_token = this.lexer.scan();
      /*   let caller = Util.getCallers();

      while(!caller[0].methodName.startsWith('parse')) caller.shift();

      const names = caller.map(c => c.methodName);
*/
      ////console.error("cur_token: ", this.cur_token.toString(), "xy:", this.xy, "callers["+names.length+"]:", names.join(','));
    } while(0); //this.cur_token.type == 'COMMENT');

    return token;
  }

  match(t, v) {
    if(t) {
      if(v) {
        if(this.cur_token.type == t && this.cur_token.val == v) {
          let cur_token = this.cur_token;
          this.next();
          return cur_token;
        }
      }
      if(this.cur_token.type == t) {
        let cur_token = this.cur_token;
        this.next();
        return cur_token;
      }
    }
    this.yield_error(`match(${t}, ${v || this.cur_token.value}) ${this.cur_token.toString()}`, this.cur_token);
  }

  consume(t, v) {
    if(t) {
      if(v) {
        if(this.cur_token.type == t && this.cur_token.value == v) {
          let cur_token = this.cur_token;
          this.next();
          return cur_token;
        }
      }
      if(this.cur_token.type == t) {
        let cur_token = this.cur_token;
        this.next();
        return cur_token;
      }
    }
    return this.cur_token;
  }

  anchor() {
    this.location.push({
      line: this.cur_token.line,
      column: this.cur_token.column
    });
  }

  parse() {
    try {
      this.next();
      this.anchor();
      return this.ast.program(this.parse_chunk());
    } catch(err) {
      console.error("ERROR: ", err);
      console.log("ERROR: ", err);
      throw err;
    }
  }

  parse_chunk() {
    //   console.error('parse_chunk');
    /* chunk       ::=   {<stat> [`;`]} */
    let stats = [];
    while(!this.is_block_follow()) {
      if(this.cur_token.value == "return") {
        stats.push(this.parse_stat());
        this.consume(Token.SEMICOLON);
        break;
      }

      if(this.cur_token.type == "COMMENT") {
        stats.push(this.ast.comment(this.cur_token.value));
        this.next();
        continue;
      }
      let stat = this.parse_stat();
      this.consume(Token.SEMICOLON);
      stats.push(stat);
    }
    return this.ast.chunk(stats);
  }

  parse_block() {
    /* block ::= chunk */
    return this.parse_chunk();
  }

  parse_stat() {
    /*
        stat        ::=   <do_stat>
                      |   <break_stat>
                      |   <return_stat>
                      |   <expr_stat>
                      |   <func_stat>
                      |   <local_stat>
                      |   <if_stat>
                      |   <for_stat>
                      |   <while_stat>
                      |   <repeat_stat>
     */

    switch (this.cur_token.value) {
      case "do":
        return this.parse_do_stat();
      case "break":
        return this.parse_break_stat();
      case "return":
        return this.parse_return_stat();
      case "function":
        return this.parse_func_stat();
      case "local":
        return this.parse_local_stat();
      case "if":
        return this.parse_if_stat();
      case "for":
        return this.parse_for_stat();
      case "while":
        return this.parse_while_stat();
      case "repeat":
        return this.parse_repeat_stat();
      default:
        return this.parse_expr_stat();
    }
  }

  parse_do_stat() {
    /* do_stat     ::=  `do` <block> `end` */

    this.match(Token.KEYWORD, "do");
    let do_stat = this.ast.do_stat(this.parse_block());
    this.match(Token.KEYWORD, "end");

    return do_stat;
  }

  parse_break_stat() {
    /* break_stat  ::=  `break` */

    this.match(Token.KEYWORD, "break");

    return this.ast.break_stat();
  }

  parse_return_stat() {
    /* return_stat  ::=  `return` <explist> */

    this.next();
    const explist = this.parse_explist1();

    return this.ast.return_stat(explist);
  }

  parse_func_stat() {
    /* func_stat   ::= `function` <funcname> '(' <parlist> ')' <blcok> 'end'*/
    let id;
    this.match(Token.KEYWORD, "function");

    console.error("parse_func_stat ", this.cur_token);
    if(this.cur_token.type == "LPAREN") id = "";
    else id = this.parse_funcname();

    this.match(Token.LPAREN);
    let params = this.parse_parlist();
    this.match(Token.RPAREN);
    let body = this.parse_block();
    this.match(Token.KEYWORD, "end");

    return this.ast.func_stat(id, params, body);
  }

  parse_parlist() {
    /* parlist     ::= [<param> {',' <param>}] */

    let parlist = [];

    if(this.is_param()) {
      parlist.push(this.parse_param());

      while(this.cur_token.value == ",") {
        this.next();
        parlist.push(this.parse_param());
      }
    }

    return parlist;
  }

  parse_param() {
    /* param       ::= <NAME> */
    return this.parse_name();
  }

  parse_funcname(members = true) {
    /*fname    ::= <NAME> {'.' <NAME>} [':' <NAME>] */

    let funcname = this.parse_name();

    if(members) {
      while(this.cur_token.value == ".") {
        this.next();
        funcname = this.ast.member_expr(funcname, ".", this.parse_name());
      }
    }

    if(this.cur_token.value == ":") {
      this.next();
      funcname = this.ast.member_expr(funcname, ":", this.parse_name());
    }

    return funcname;
  }

  parse_local_stat() {
    /* local_stat  ::= `local` <NAME> {',' <NAME>} ['=' <explist1>]
                        | `local` `function` <NAME> '(' <parlist> ')' <blcok> 'end'
   */

    this.match(Token.KEYWORD, "local");

    if(this.cur_token.value == "function") {
      this.next();

      let id = "";
      if(this.cur_token.type != "LPAREN") id = this.parse_name();
      this.match(Token.LPAREN);
      let params = this.parse_parlist();
      this.match(Token.RPAREN);
      let block = this.parse_block();
      this.match(Token.KEYWORD, "end");

      return this.ast.func_stat(id, params, block);
    } else {
      let variables = [];
      let init = [];
      variables.push(this.parse_name());

      while(this.cur_token.value == ",") {
        this.next();
        variables.push(this.parse_name());
      }

      if(this.cur_token.value == "=") {
        this.next();
        init = this.parse_explist1();
      }

      return this.ast.local_stat(variables, init);
    }
  }

  parse_if_stat() {
    /*
        if_stat     ::= `if` <cond> `then` <block> {`elseif` <cond> `then` <block>} [`else` <block>] `end`
        <cond>      ::= <expr>
     */

    this.match(Token.KEYWORD, "if");
    let cond = this.parse_cond();
    this.match(Token.KEYWORD, "then");
    let block = this.parse_block();
    let elseif = [];
    let _else = null;

    while(this.cur_token.value == "elseif") {
      this.next();
      let elsecond = this.parse_cond();
      this.match(Token.KEYWORD, "then");
      let elseblock = this.parse_block();

      elseif.push(this.ast.if_stat(elsecond, elseblock, []));
    }

    if(this.cur_token.value == "else") {
      this.next();
      _else = this.parse_block();
    }

    this.match(Token.KEYWORD, "end");

    return this.ast.if_stat(cond, block, elseif, _else);
  }

  parse_cond() {
    /*
            cond ::= <expr>
         */

    return this.parse_expr();
  }

  parse_for_stat() {
    /*
            for_stat    ::= <fornum> | <forlist>
            fornum      ::= <NAME> {',' <NAME>} 'in' <explist1> <forbody> 'end'
            forlist     ::= <NAME> '=' <exp1>, <exp1> [',' <exp1>] <forbody> 'end'
         */

    this.match(Token.KEYWORD, "for");

    let name = this.parse_name();
    if(this.cur_token.value == "=") {
      this.next();
      let begin = this.parse_exp1();
      this.match(Token.COMMA, ",");
      let end = this.parse_exp1();
      let step = this.ast.literal(1);
      if(this.cur_token.value == ",") {
        this.next();
        step = this.parse_exp1();
      }

      let body = this.parse_forbody();
      this.match(Token.KEYWORD, "end");
      return this.ast.fornum_stat(name, begin, end, step, body);
    } else {
      let left = [name];
      while(this.cur_token.value == ",") {
        this.next();
        left.push(this.parse_name());
      }
      this.match(Token.KEYWORD, "in");
      let right = this.parse_exp1();
      let body = this.parse_forbody();
      this.match(Token.KEYWORD, "end");
      return this.ast.forlist_stat(name, left, right, body);
    }
  }

  parse_forbody() {
    /*
            forbody     ::= 'do' <block>
         */

    this.match(Token.KEYWORD, "do");
    let block = this.parse_block();

    return block;
  }

  parse_while_stat() {
    /*
            while_stat  ::= `while` <cond> `do` <block> `end`
         */

    this.match(Token.KEYWORD, "while");
    let cond = this.parse_cond();
    this.match(Token.KEYWORD, "do");
    let block = this.parse_block();
    this.match(Token.KEYWORD, "end");

    return this.ast.while_stat(cond, block);
  }

  parse_repeat_stat() {
    /*
            repeat_stat ::= `repeat` <chunk> `until` <cond>
         */

    this.match(Token.KEYWORD, "repeat");
    let body = this.parse_block();
    this.match(Token.KEYWORD, "until");
    let cond = this.parse_cond();

    return this.ast.repeat_stat(cond, body);
  }

  parse_expr_stat() {
    /*
            expr_stat   ::=  <primaryexp>(<func> | <assignment>)
            if LHS is VCALL then func, otherwise assignment
            for func, LHS is VCALL if funcargs in expression
         */

    let primaryexp = this.parse_primaryexp();

    //  console.error('EXPR_STAT ', this.cur_token);

    if(primaryexp.type == "CallExpression") {
      return this.ast.expr_stat(primaryexp);
    } else {
      let assignment = this.parse_assignment([primaryexp]);
      return this.ast.expr_stat(assignment);
    }
  }

  parse_assignment(primaryexp) {
    if(this.cur_token.value == ",") {
      if(!(primaryexp instanceof Array)) primaryexp = [primaryexp];

      do {
        this.match(Token.COMMA);

        var node = this.parse_primaryexp();
        primaryexp.push(node);
      } while(this.cur_token.value == ",");
    }

    /*
            assignment  ::= ',' <primaryexp> <assignment>
                          | '=' <explist1>
         */

    if(this.cur_token.value == "=") {
      this.next();
      let right = this.parse_explist1();
      return this.ast.assign_expr("=", primaryexp, right);
    }

    primaryexp.push(this.parse_primaryexp());
    this.parse_assignment(primaryexp);
  }

  parse_explist1() {
    /*
        explist1    ::= <expr> {',' <expr>}
     */

    let exps = [this.parse_expr()];

    while(this.cur_token.value == ",") {
      this.next();
      exps.push(this.parse_expr());
    }

    return exps;
  }

  parse_expr() {
    /*
            expr        ::= <subexpr>
         */

    return this.parse_subexpr();
  }

  parse_subexpr(min_prec) {
    /*
            subexpr     ::=(<unary> <subexpr> | <simpleexp>) {<binary> <subexpr>}
         */

    //  console.error('TOKEN: ', this.cur_token);

    min_prec = min_prec || 0;

    let expr;

    if(this.is_unary()) {
      let unary = this.parse_unary();
      let argument = this.parse_subexpr();
      expr = this.ast.unary_expr(unary, argument);
    } else {
      expr = this.parse_simpleexp();
    }

    while(this.is_binary() && Parser.OP[this.cur_token.value].prec >= min_prec) {
      let token = this.next();
      let op = Parser.OP[token.value];
      let next_prec;

      if(op.left) {
        next_prec = op.prec + 1;
      } else {
        next_prec = op.prec;
      }

      let right = this.parse_subexpr(next_prec);
      expr = this.ast.binary_expr(token.value, expr, right);
    }

    return expr;
  }

  parse_simpleexp() {
    /*
            simpleexp   ::= NUMBER
                          | STRING
                          | NIL
                          | TRUE
                          | FALSE
                          | ...
                          | <constructor>
                          | 'function' '(' <parlist> ')' <blcok> 'end'
                          | <primaryexp>
         */

    if(this.cur_token.type == Token.COMMENT) {
      let text = this.cur_token.value;
      this.next();
      return this.ast.comment(text);
    }
    if(this.cur_token.type == Token.NUMBER || this.cur_token.type == Token.STRING) {
      //   console.error("this.cur_token: ", this.lexer.quote, this.cur_token);
      let q = this.lexer.quote;
      let cur_token = this.next();
      return this.ast.literal(cur_token.value, false, q);
    } else if(this.cur_token.type == Token.KEYWORD) {
      switch (this.cur_token.value) {
        case "nil":
          this.next();
          return this.ast.literal(null);
        case "true":
          this.next();
          return this.ast.literal(true);
        case "false":
          this.next();
          return this.ast.literal(false);
        case "...":
          this.next();
          return this.ast.literal("...");
        case "function":
          const token = this.cur_token;
          const name = this.ast.undef();
          this.next();
          this.match(Token.LPAREN);
          let params = this.parse_parlist();
          this.match(Token.RPAREN);
          let block = this.parse_block();
          this.match(Token.KEYWORD, "end");

          return this.ast.func_stat(name, params, block);

        case "local":
          return this.parse_local_stat();
        default:
          this.yield_error("parse_simpleexp " + this.cur_token.value);
      }
    } else if(this.cur_token.value == "{") {
      return this.parse_constructor();
    } else {
      return this.parse_primaryexp();
    }
  }

  parse_primaryexp() {
    /*
            primaryexp  ::= <prefixexp> {'.' <NAME> | '[' <expr> ']'  | ':' <NAME> <funcargs> | <funcargs> }
         */

    if(this.cur_token.line >= 138) {
      //console.error('\nTOKEN: ', this.cur_token, '\n');
    }

    var node = this.parse_prefixexp(true);
    let property;

    while(true) {
      switch (this.cur_token.value) {
        case ".":
          this.next();
          property = this.parse_name(true);
          node = this.ast.member_expr(node, ".", property);
          break;
        case "[":
          this.next();

          if(this.cur_token.line >= 138) {
            //console.error('\nTOKEN: ', this.cur_token, '\n');
            //console.error('\nNODE: ', node.toString(), '\n');
          }

          let index = this.parse_expr();
          node = this.ast.index_expr(node, index);
          this.match(Token.RBRACKET);

          break;
        case ":":
          this.next();
          property = this.parse_expr();
          node = this.ast.member_expr(node, ":", property);
          let params = this.parse_funcargs();
          node = this.ast.call_expr(node, params);
          break;
        default:
          break;
      }

      if(this.cur_token.value == ".") continue;
      if(this.cur_token.value == "[") continue;

      if(this.cur_token.value == "(" || this.cur_token.value == "{" || this.cur_token.type == Token.STRING) {
        let params = this.parse_funcargs();
        node = this.ast.call_expr(node, params);
        continue;
      }

      return node;
    }
  }

  parse_funcargs() {
    /*
        funcargs    ::= '(' [<explist1>] ')'
                      | constructor
                      | STRING
     */

    let params = [];

    if(this.cur_token.value == "(") {
      this.next();
      if(this.cur_token.value != ")") {
        params = this.parse_explist1();
      }
      this.match(Token.RPAREN);

      return params;
    } else if(this.cur_token.type == Token.STRING) {
      return this.ast.literal(this.cur_token.value);
    } else {
      return this.parse_constructor();
    }
  }

  parse_constructor() {
    /*
            constructor ::=  '{' [<field> {<fieldsep> <field>} [<fieldsep>] ] '}'
         */

    let fields = [];
    let lines = [];

    this.match(Token.LBRACE);

    while(true) {
      let node;

      while(this.cur_token.type == "COMMENT") this.next();

      if(this.cur_token.type == "RIGHT BRACE") break;

      lines.push(this.cur_token.line);

      node = this.parse_field();

      fields.push(node);

      if(this.is_fieldsep()) this.parse_fieldsep();
    }

    this.match(Token.RBRACE);

    lines = Util.unique(lines);
    console.error("LINES: ", lines.join(","));

    return this.ast.table_expr(fields, lines.length != 1);
  }

  parse_fieldsep() {
    /*
            fieldsep    ::= ','
                          | ';'
         */

    if(this.cur_token.value == "," || this.cur_token.value == ";") {
      let cur_token = this.next();
      return this.ast.literal(cur_token.value);
    }

    this.yield_error("parse_fieldsep");
  }

  parse_field() {
    this.log();
    /*
            field       ::= <recfield>
                          | <listfield>
         */

    if(this.cur_token.value == "[" /* || this.cur_token.type == Token.IDENTIFIER*/) {
      return this.parse_recfield();
    } else {
      return this.parse_listfield();
    }
  }

  parse_recfield() {
    /*
      recfield    ::=( <NAME> | '[' exp1 ']' ) = exp1
   */

    let key, value;

    if(this.cur_token.value == "[") {
      this.next();
      key = this.parse_exp1();
      this.match(Token.RBRACKET);
    } else {
      key = this.parse_name();
    }

    this.match(Token.ASSIGN);

    value = this.parse_exp1();

    return this.ast.recfield(key, value);
  }

  parse_listfield() {
    this.log();
    /*
            listfield   ::= <expr>
        */

    let index;

    console.error("TOKEN: ", this.cur_token);

    let node = this.parse_expr();

    // parse_assignment

    console.error("EXPR: ", node);

    if(this.cur_token.type == "ASSIGN") {
      this.next();
      console.error("TOKEN2: ", this.cur_token);
      index = node;
      node = this.parse_expr();

      return this.ast.recfield(index, node);
    }

    return this.ast.listfield(node);
  }

  parse_prefixexp(members = true) {
    /*
        prefixexp   ::= <NAME>
                     | '(' <expr> ')'
     */

    if(this.cur_token.value == "(") {
      this.match(Token.LPAREN);
      let expr = this.parse_expr();
      this.match(Token.RPAREN);
      return expr;
    } else {
      return this.parse_funcname(members);
    }
  }

  parse_exp1() {
    /*
        exp1        ::= <expr>
     */

    return this.parse_expr();
  }

  parse_unary() {
    /*
            unary ::= '#'
                    | 'not'
                    | '-'
         */

    const token = this.next();

    switch (token.value) {
      case "-":
        return "#-";
      default:
        return token.value;
    }
  }

  parse_name() {
    if(this.cur_token.line >= 138) {
      //console.error('\nTOKEN: ', this.cur_token, '\n');
    }

    if(this.cur_token.type == "ELLIPSES" || this.cur_token.value == "...") {
      const value = this.cur_token.value;
      this.next();
      return this.ast.literal(value);
    }

    let m = this.match(Token.IDENTIFIER);
    /*
            name ::= IDENTIFIER
         */
    return this.ast.identifier(m.value);
  }

  is_unary() {
    switch (this.cur_token.type) {
      case "HASH":
      case "MINUS":
        return true;
      default:
        if(this.cur_token.value == "not" || this.cur_token.value == "#") return true;
        return false;
    }
  }

  is_fieldsep() {
    switch (this.cur_token.value) {
      case ",":
      case ";":
        return true;
      default:
        return false;
    }
  }

  is_binary() {
    if(Parser.OP[this.cur_token.value] && Parser.OP[this.cur_token.value].binary) {
      return true;
    } else {
      return false;
    }
  }

  is_param() {
    if(this.cur_token.type == Token.IDENTIFIER) {
      return true;
    }

    return false;
  }

  is_block_follow() {
    switch (this.cur_token.value) {
      case "else":
      case "elseif":
      case "end":
      case "until":
      case "EOS":
        return true;
    }

    return false;
  }
}

Object.assign(Parser, {
  OP: {
    or: { prec: 1, left: 1, binary: 1 },
    and: { prec: 2, left: 1, binary: 1 },
    "<": { prec: 3, left: 1, binary: 1 },
    ">": { prec: 3, left: 1, binary: 1 },
    "<=": { prec: 3, left: 1, binary: 1 },
    ">=": { prec: 3, left: 1, binary: 1 },
    "==": { prec: 3, left: 1, binary: 1 },
    "~=": { prec: 3, left: 1, binary: 1 },
    "..": { prec: 4, left: 0, binary: 1 },
    "+": { prec: 5, left: 1, binary: 1 },
    "-": { prec: 5, left: 1, binary: 1 },
    "*": { prec: 6, left: 1, binary: 1 },
    "/": { prec: 6, left: 1, binary: 1 },
    "%": { prec: 4, left: 1, binary: 1 },
    not: { prec: 7, left: 1, binary: 0 },
    "#": { prec: 7, left: 1, binary: 0 },
    "u-": { prec: 7, left: 1, binary: 0 },
    "^": { prec: 8, left: 0, binary: 1 }
  }
});

class Interpreter {
  constructor(ast, env) {
    this.ast = ast;
    this.env = env;
  }

  interprete() {
    return this.evaluate(this.ast, this.env);
  }

  evaluate(node, env) {
    switch (node.type) {
      case "Program":
        return this.evaluate(node.body, env);
      case "Chunk":
        return this.evaluate_chunk(node, env);
      case "Identifier":
        return this.evaluate_identifier(node, env);
      case "Literal":
        return this.evaluate_literal(node, env);
      case "AssignExpression":
        return this.evaluate_assign_expression(node, env);
      case "LocalStatement":
        return this.evaluate_local_stat(node, env);
      case "ExpressionStatement":
        return this.evaluate_expression_stat(node, env);
      case "CallExpression":
        return this.evaluate_call_expression(node, env);
      case "UnaryExpression":
        return this.evaluate_unary_expression(node, env);
      case "BinaryExpression":
        return this.evaluate_binary_expression(node, env);
      case "DoStatement":
        return this.evaluate_do_statment(node, env);
      case "BreakStatement":
        return this.evaluate_break_statment(node, env);
      case "ReturnStatement":
        return this.evaluate_return_statment(node, env);
      case "FunctionDeclaration":
        return this.evaluate_function_declaration(node, env);
      case "TableExpression":
        return this.evaluate_table_expression(node, env);
      case "MemberExpression":
        return this.evaluate_member_expression(node, env);
      case "IfStatement":
        return this.evaluate_if_statement(node, env);
      case "FornumStatement":
        return this.evaluate_fornum_statement(node, env);
      case "ForlistStatement":
        return this.evaluate_forlist_statement(node, env);
      case "WhileStatement":
        return this.evaluate_while_statement(node, env);
      case "RepeatStatement":
        return this.evaluate_repeat_statement(node, env);
      default:
        throw new Error(`unknow ast node with ${node.type}`);
    }
  }

  evaluate_program(node, env) {
    return this.evaluate(node.body, env);
  }

  evaluate_chunk(node, env) {
    let rv;
    for(let i = 0; i < node.body.length; i++) {
      rv = this.evaluate(node.body[i], env);
    }

    return rv;
  }

  evaluate_table_expression(node, env) {
    let t = {};
    const self = this;
    let i = 1;

    node.fields.map(field => {
      if(field.type == "Recfield") {
        //identifier
        let key = field.key.name;
        let value = self.evaluate(field.value, env);
        t[key] = value;
      } else {
        let value = self.evaluate(field.value, env);
        t[i++] = value;
      }
    });

    return t;
  }

  evaluate_literal(node, env) {
    return node.value;
  }

  evaluate_assign_expression(node, env) {
    for(let i = 0; i < node.left.length; i++) {
      const n = node.left[i];
      if(n.type == "Identifier") {
        env.set(n.name, this.evaluate(node.right[i], env));
      } else if(n.type == "MemberExpression") {
        const obj = env.get(n.object.name);
        obj[n.property.name] = this.evaluate(node.right[i], env);
      }
    }
  }

  evaluate_do_statment(node, env) {
    return this.evaluate(node.body, env.extend());
  }

  evaluate_break_statment(node, env) {}

  evaluate_return_statment(node, env) {
    const self = this;
    let results = node.params.map(param => {
      return self.evaluate(param, env);
    });
    return results[results.length - 1];
  }

  evaluate_binary_expression(node, env) {
    const op = Interpreter.OP[node.op];
    const left = this.evaluate(node.left, env);
    const right = this.evaluate(node.right, env);

    return op(left, right);
  }

  evaluate_unary_expression(node, env) {
    const op = Interpreter.OP[node.op];

    return op(this.evaluate(node.argument, env));
  }

  evaluate_fornum_statement(node, env) {
    const scope = env.extend();
    const begin = this.evaluate(node.begin, scope);
    const end = this.evaluate(node.end, scope);
    const step = this.evaluate(node.step, scope);

    scope.def(node.id.name, begin);

    for(let i = begin; i < end; i += step) {
      scope.set(node.id.name, i);
      this.evaluate(node.body, scope);
    }
  }

  evaluate_forlist_statement(node, env) {
    const scope = env.extend();
    const left = node.left;
    const right = this.evaluate(node.right, scope);
    for(let i = 0; i < left.length; i++) {
      scope.def(left[i].name, null);
    }

    let j = 0;

    while(true) {
      const iterator = right();
      if(iterator.done) {
        break;
      } else {
        for(let i = 0; i < left.length; i++) {
          scope.set(left[i].name, iterator.value[i]);
        }
        this.evaluate(node.body, scope);
      }
    }
  }

  evaluate_while_statement(node, env) {
    const scope = env.extend();
    while(true) {
      const cond = this.evaluate(node.cond, scope);
      if(cond) {
        this.evaluate(node.body, scope);
      } else {
        break;
      }
    }
  }

  evaluate_repeat_statement(node, env) {
    const scope = env.extend();
    while(true) {
      this.evaluate(node.body, scope);
      const cond = this.evaluate(node.cond, scope);
      if(cond == true) {
        break;
      }
    }
  }

  evaluate_identifier(node, env) {
    return env.get(node.name);
  }

  evaluate_call_expression(node, env) {
    const callee = this.evaluate(node.callee, env);
    const self = this;

    return callee.apply(
      null,
      node.params.map(arg => {
        return self.evaluate(arg, env);
      })
    );
  }

  evaluate_if_statement(node, env) {
    let cond = this.evaluate(node.cond, env);
    if(cond) {
      this.evaluate(node.body, env);
      return true;
    } else {
      for(let i = 0; i < node.elseif.length; i++) {
        let elseif = node.elseif[i];
        if(this.evaluate(elseif, env)) {
          return true;
        }
      }
      if(node.else) {
        this.evaluate(node.else, env);
      }
      return false;
    }
  }

  evaluate_member_expression(node, env) {
    let table, value;
    if(node.sep == ".") {
      table = env.get(node.object.name);
      value = node.property.name;
    }

    return table[value];
  }

  evaluate_expression_stat(node, env) {
    return this.evaluate(node.expression, env);
  }

  evaluate_local_stat(node, env) {
    let variables = node.variables;
    let init = node.init;

    for(let i = 0; i < variables.length; i++) {
      let variable = variables[i];
      let value = init[i];

      env.def(variable.name, this.evaluate(value, env));
    }
  }

  evaluate_function_declaration(node, env) {
    const self = this;

    function lambda(...args) {
      let params = node.params;
      let scope = env.extend();
      for(var i = 0; i < params.length; ++i) {
        scope.def(params[i].name, args[i]);
      }

      return self.evaluate(node.body, scope);
    }

    let name;
    if(node.id.type == "Identifier") {
      name = node.id.name;
    }
    env.def(name, lambda);

    return lambda;
  }
}

Object.assign(Interpreter, {
  OP: {
    or: function(left, right) {
      return left || right;
    },

    and: function(left, right) {
      return left && right;
    },

    "<": function(left, right) {
      return left < right;
    },

    ">": function(left, right) {
      return left > right;
    },

    "<=": function(left, right) {
      return left <= right;
    },

    ">=": function(left, right) {
      return left >= right;
    },

    "==": function(left, right) {
      return left == right;
    },

    "~=": function(left, right) {
      return left != right;
    },

    "..": function(left, right) {
      return `${left}${right}`;
    },

    "+": function(left, right) {
      return left + right;
    },

    "-": function(left, right) {
      return left - right;
    },

    "*": function(left, right) {
      return left * right;
    },

    "/": function(left, right) {
      return left / right;
    },

    "^": function(left, rihgt) {
      return math.pow(left, right);
    },

    "#-": function(right) {
      return -right;
    },

    not: function(right) {
      return !right;
    },

    "#": function(right) {
      if(typeof right !== "string") {
        throw new Error("attempt to get length of a nonstring value");
      }

      return right.length;
    }
  }
});

module.exports = {
  AST,
  Env,
  JSGenerator,
  MoonScriptGenerator,
  Interpreter,
  Token,
  Lexer,
  Parser,
  Interpreter
};
