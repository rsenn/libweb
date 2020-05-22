// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/JSXParser.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by JSXParser.

function JSXParserVisitor() {
  antlr4.tree.ParseTreeVisitor.call(this);
  return this;
}

JSXParserVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
JSXParserVisitor.prototype.constructor = JSXParserVisitor;

// Visit a parse tree produced by JSXParser#program.
JSXParserVisitor.prototype.visitProgram = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#sourceElement.
JSXParserVisitor.prototype.visitSourceElement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#statement.
JSXParserVisitor.prototype.visitStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#block.
JSXParserVisitor.prototype.visitBlock = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#statementList.
JSXParserVisitor.prototype.visitStatementList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#importStatement.
JSXParserVisitor.prototype.visitImportStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#importFromBlock.
JSXParserVisitor.prototype.visitImportFromBlock = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#moduleItems.
JSXParserVisitor.prototype.visitModuleItems = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#importDefault.
JSXParserVisitor.prototype.visitImportDefault = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#importNamespace.
JSXParserVisitor.prototype.visitImportNamespace = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#importFrom.
JSXParserVisitor.prototype.visitImportFrom = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#aliasName.
JSXParserVisitor.prototype.visitAliasName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ExportDeclaration.
JSXParserVisitor.prototype.visitExportDeclaration = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ExportDefaultDeclaration.
JSXParserVisitor.prototype.visitExportDefaultDeclaration = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#exportFromBlock.
JSXParserVisitor.prototype.visitExportFromBlock = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#declaration.
JSXParserVisitor.prototype.visitDeclaration = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#variableStatement.
JSXParserVisitor.prototype.visitVariableStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#variableDeclarationList.
JSXParserVisitor.prototype.visitVariableDeclarationList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#variableDeclaration.
JSXParserVisitor.prototype.visitVariableDeclaration = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#emptyStatement.
JSXParserVisitor.prototype.visitEmptyStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#expressionStatement.
JSXParserVisitor.prototype.visitExpressionStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ifStatement.
JSXParserVisitor.prototype.visitIfStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#DoStatement.
JSXParserVisitor.prototype.visitDoStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#WhileStatement.
JSXParserVisitor.prototype.visitWhileStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ForStatement.
JSXParserVisitor.prototype.visitForStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ForInStatement.
JSXParserVisitor.prototype.visitForInStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ForOfStatement.
JSXParserVisitor.prototype.visitForOfStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#varModifier.
JSXParserVisitor.prototype.visitVarModifier = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#continueStatement.
JSXParserVisitor.prototype.visitContinueStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#breakStatement.
JSXParserVisitor.prototype.visitBreakStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#returnStatement.
JSXParserVisitor.prototype.visitReturnStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#yieldStatement.
JSXParserVisitor.prototype.visitYieldStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#withStatement.
JSXParserVisitor.prototype.visitWithStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#switchStatement.
JSXParserVisitor.prototype.visitSwitchStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#caseBlock.
JSXParserVisitor.prototype.visitCaseBlock = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#caseClauses.
JSXParserVisitor.prototype.visitCaseClauses = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#caseClause.
JSXParserVisitor.prototype.visitCaseClause = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#defaultClause.
JSXParserVisitor.prototype.visitDefaultClause = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#labelledStatement.
JSXParserVisitor.prototype.visitLabelledStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#throwStatement.
JSXParserVisitor.prototype.visitThrowStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#tryStatement.
JSXParserVisitor.prototype.visitTryStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#catchProduction.
JSXParserVisitor.prototype.visitCatchProduction = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#finallyProduction.
JSXParserVisitor.prototype.visitFinallyProduction = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#debuggerStatement.
JSXParserVisitor.prototype.visitDebuggerStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#functionDeclaration.
JSXParserVisitor.prototype.visitFunctionDeclaration = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#classDeclaration.
JSXParserVisitor.prototype.visitClassDeclaration = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#classTail.
JSXParserVisitor.prototype.visitClassTail = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#classElement.
JSXParserVisitor.prototype.visitClassElement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#methodDefinition.
JSXParserVisitor.prototype.visitMethodDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#formalParameterList.
JSXParserVisitor.prototype.visitFormalParameterList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#formalParameterArg.
JSXParserVisitor.prototype.visitFormalParameterArg = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#lastFormalParameterArg.
JSXParserVisitor.prototype.visitLastFormalParameterArg = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#functionBody.
JSXParserVisitor.prototype.visitFunctionBody = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#sourceElements.
JSXParserVisitor.prototype.visitSourceElements = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#arrayLiteral.
JSXParserVisitor.prototype.visitArrayLiteral = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#elementList.
JSXParserVisitor.prototype.visitElementList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#arrayElement.
JSXParserVisitor.prototype.visitArrayElement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#PropertyExpressionAssignment.
JSXParserVisitor.prototype.visitPropertyExpressionAssignment = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ComputedPropertyExpressionAssignment.
JSXParserVisitor.prototype.visitComputedPropertyExpressionAssignment = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#FunctionProperty.
JSXParserVisitor.prototype.visitFunctionProperty = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#PropertyGetter.
JSXParserVisitor.prototype.visitPropertyGetter = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#PropertySetter.
JSXParserVisitor.prototype.visitPropertySetter = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#PropertyShorthand.
JSXParserVisitor.prototype.visitPropertyShorthand = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#propertyName.
JSXParserVisitor.prototype.visitPropertyName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#arguments.
JSXParserVisitor.prototype.visitArguments = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#argument.
JSXParserVisitor.prototype.visitArgument = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#expressionSequence.
JSXParserVisitor.prototype.visitExpressionSequence = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#TemplateStringExpression.
JSXParserVisitor.prototype.visitTemplateStringExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#TernaryExpression.
JSXParserVisitor.prototype.visitTernaryExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#LogicalAndExpression.
JSXParserVisitor.prototype.visitLogicalAndExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#PowerExpression.
JSXParserVisitor.prototype.visitPowerExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#PreIncrementExpression.
JSXParserVisitor.prototype.visitPreIncrementExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ObjectLiteralExpression.
JSXParserVisitor.prototype.visitObjectLiteralExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#MetaExpression.
JSXParserVisitor.prototype.visitMetaExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#InExpression.
JSXParserVisitor.prototype.visitInExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#LogicalOrExpression.
JSXParserVisitor.prototype.visitLogicalOrExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#NotExpression.
JSXParserVisitor.prototype.visitNotExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#PreDecreaseExpression.
JSXParserVisitor.prototype.visitPreDecreaseExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ArgumentsExpression.
JSXParserVisitor.prototype.visitArgumentsExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#AwaitExpression.
JSXParserVisitor.prototype.visitAwaitExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ThisExpression.
JSXParserVisitor.prototype.visitThisExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#FunctionExpression.
JSXParserVisitor.prototype.visitFunctionExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#UnaryMinusExpression.
JSXParserVisitor.prototype.visitUnaryMinusExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#AssignmentExpression.
JSXParserVisitor.prototype.visitAssignmentExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#PostDecreaseExpression.
JSXParserVisitor.prototype.visitPostDecreaseExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#TypeofExpression.
JSXParserVisitor.prototype.visitTypeofExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#InstanceofExpression.
JSXParserVisitor.prototype.visitInstanceofExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#UnaryPlusExpression.
JSXParserVisitor.prototype.visitUnaryPlusExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#DeleteExpression.
JSXParserVisitor.prototype.visitDeleteExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ImportExpression.
JSXParserVisitor.prototype.visitImportExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#EqualityExpression.
JSXParserVisitor.prototype.visitEqualityExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#BitXOrExpression.
JSXParserVisitor.prototype.visitBitXOrExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#SuperExpression.
JSXParserVisitor.prototype.visitSuperExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#MultiplicativeExpression.
JSXParserVisitor.prototype.visitMultiplicativeExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlElementExpression.
JSXParserVisitor.prototype.visitHtmlElementExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#BitShiftExpression.
JSXParserVisitor.prototype.visitBitShiftExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ParenthesizedExpression.
JSXParserVisitor.prototype.visitParenthesizedExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#AdditiveExpression.
JSXParserVisitor.prototype.visitAdditiveExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#RelationalExpression.
JSXParserVisitor.prototype.visitRelationalExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#PostIncrementExpression.
JSXParserVisitor.prototype.visitPostIncrementExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#YieldExpression.
JSXParserVisitor.prototype.visitYieldExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#BitNotExpression.
JSXParserVisitor.prototype.visitBitNotExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#NewExpression.
JSXParserVisitor.prototype.visitNewExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#LiteralExpression.
JSXParserVisitor.prototype.visitLiteralExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ArrayLiteralExpression.
JSXParserVisitor.prototype.visitArrayLiteralExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#MemberDotExpression.
JSXParserVisitor.prototype.visitMemberDotExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ClassExpression.
JSXParserVisitor.prototype.visitClassExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#MemberIndexExpression.
JSXParserVisitor.prototype.visitMemberIndexExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#IdentifierExpression.
JSXParserVisitor.prototype.visitIdentifierExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#BitAndExpression.
JSXParserVisitor.prototype.visitBitAndExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#BitOrExpression.
JSXParserVisitor.prototype.visitBitOrExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#AssignmentOperatorExpression.
JSXParserVisitor.prototype.visitAssignmentOperatorExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#VoidExpression.
JSXParserVisitor.prototype.visitVoidExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#CoalesceExpression.
JSXParserVisitor.prototype.visitCoalesceExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlElements.
JSXParserVisitor.prototype.visitHtmlElements = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlElement.
JSXParserVisitor.prototype.visitHtmlElement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlContent.
JSXParserVisitor.prototype.visitHtmlContent = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlTagStartName.
JSXParserVisitor.prototype.visitHtmlTagStartName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlTagClosingName.
JSXParserVisitor.prototype.visitHtmlTagClosingName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlTagName.
JSXParserVisitor.prototype.visitHtmlTagName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlAttribute.
JSXParserVisitor.prototype.visitHtmlAttribute = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlAttributeName.
JSXParserVisitor.prototype.visitHtmlAttributeName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlChardata.
JSXParserVisitor.prototype.visitHtmlChardata = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#htmlAttributeValue.
JSXParserVisitor.prototype.visitHtmlAttributeValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#assignable.
JSXParserVisitor.prototype.visitAssignable = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#objectLiteral.
JSXParserVisitor.prototype.visitObjectLiteral = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#objectExpressionSequence.
JSXParserVisitor.prototype.visitObjectExpressionSequence = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#FunctionDecl.
JSXParserVisitor.prototype.visitFunctionDecl = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#AnoymousFunctionDecl.
JSXParserVisitor.prototype.visitAnoymousFunctionDecl = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#ArrowFunction.
JSXParserVisitor.prototype.visitArrowFunction = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#arrowFunctionParameters.
JSXParserVisitor.prototype.visitArrowFunctionParameters = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#arrowFunctionBody.
JSXParserVisitor.prototype.visitArrowFunctionBody = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#assignmentOperator.
JSXParserVisitor.prototype.visitAssignmentOperator = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#literal.
JSXParserVisitor.prototype.visitLiteral = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#numericLiteral.
JSXParserVisitor.prototype.visitNumericLiteral = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#bigintLiteral.
JSXParserVisitor.prototype.visitBigintLiteral = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#getter.
JSXParserVisitor.prototype.visitGetter = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#setter.
JSXParserVisitor.prototype.visitSetter = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#identifierName.
JSXParserVisitor.prototype.visitIdentifierName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#identifier.
JSXParserVisitor.prototype.visitIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#reservedWord.
JSXParserVisitor.prototype.visitReservedWord = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#keyword.
JSXParserVisitor.prototype.visitKeyword = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#let.
JSXParserVisitor.prototype.visitLet = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by JSXParser#eos.
JSXParserVisitor.prototype.visitEos = function(ctx) {
  return this.visitChildren(ctx);
};

exports.JSXParserVisitor = JSXParserVisitor;
