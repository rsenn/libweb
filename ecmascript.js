export {
  CTORS,
  default as estree,
  Factory,
  ESNode,
  ArrayPattern,
  ArrayExpression,
  ArrowFunctionExpression,
  AssignmentExpression,
  AwaitExpression,
  BinaryExpression,
  Pattern,
  LabeledStatement,
  BlockStatement,
  BreakStatement,
  CallExpression,
  ClassDeclaration,
  ConditionalExpression,
  ContinueStatement,
  Declaration,
  DecoratorExpression,
  DoWhileStatement,
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
  SwitchCase,
  ImportDeclaration,
  ExportNamedDeclaration,
  ExportDefaultDeclaration,
  JSXLiteral,
  Literal,
  TemplateLiteral,
  LogicalExpression,
  MemberExpression,
  NewExpression,
  ObjectPattern,
  ObjectExpression,
  Property,
  MethodDefinition,
  Program,
  RestElement,
  ReturnStatement,
  SequenceExpression,
  SpreadElement,
  Statement,
  StatementList,
  ThisExpression,
  ThrowStatement,
  YieldExpression,
  TryStatement,
  UnaryExpression,
  UpdateExpression,
  VariableDeclaration,
  VariableDeclarator,
  WhileStatement,
  WithStatement
} from './ecmascript/estree.js';
export { Parser, ECMAScriptParser } from './ecmascript/parser.js';
export { Lexer, Token, SyntaxError, Location } from './ecmascript/lexer.js';
export { Printer } from './ecmascript/printer.js';
export { ECMAScriptInterpreter } from './ecmascript/interpreter.js';
export { Environment } from './ecmascript/environment.js';

export function PathReplacer() {
  let re;
  try {
    let pwd = process.cwd();
    re = new RegExp(`(file://)?${pwd}/`, 'g');
    t = s => s.replace(re, '');
  } catch(err) {}
  return (path, to = '') => (re ? path.replace(re, to) : path);
}
