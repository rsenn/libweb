// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/JSXParser.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by JSXParser.
function JSXParserListener() {
  antlr4.tree.ParseTreeListener.call(this);
  return this;
}

JSXParserListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
JSXParserListener.prototype.constructor = JSXParserListener;

// Enter a parse tree produced by JSXParser#program.
JSXParserListener.prototype.enterProgram = function(ctx) {};

// Exit a parse tree produced by JSXParser#program.
JSXParserListener.prototype.exitProgram = function(ctx) {};

// Enter a parse tree produced by JSXParser#sourceElement.
JSXParserListener.prototype.enterSourceElement = function(ctx) {};

// Exit a parse tree produced by JSXParser#sourceElement.
JSXParserListener.prototype.exitSourceElement = function(ctx) {};

// Enter a parse tree produced by JSXParser#statement.
JSXParserListener.prototype.enterStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#statement.
JSXParserListener.prototype.exitStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#block.
JSXParserListener.prototype.enterBlock = function(ctx) {};

// Exit a parse tree produced by JSXParser#block.
JSXParserListener.prototype.exitBlock = function(ctx) {};

// Enter a parse tree produced by JSXParser#statementList.
JSXParserListener.prototype.enterStatementList = function(ctx) {};

// Exit a parse tree produced by JSXParser#statementList.
JSXParserListener.prototype.exitStatementList = function(ctx) {};

// Enter a parse tree produced by JSXParser#importStatement.
JSXParserListener.prototype.enterImportStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#importStatement.
JSXParserListener.prototype.exitImportStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#importFromBlock.
JSXParserListener.prototype.enterImportFromBlock = function(ctx) {};

// Exit a parse tree produced by JSXParser#importFromBlock.
JSXParserListener.prototype.exitImportFromBlock = function(ctx) {};

// Enter a parse tree produced by JSXParser#moduleItems.
JSXParserListener.prototype.enterModuleItems = function(ctx) {};

// Exit a parse tree produced by JSXParser#moduleItems.
JSXParserListener.prototype.exitModuleItems = function(ctx) {};

// Enter a parse tree produced by JSXParser#importDefault.
JSXParserListener.prototype.enterImportDefault = function(ctx) {};

// Exit a parse tree produced by JSXParser#importDefault.
JSXParserListener.prototype.exitImportDefault = function(ctx) {};

// Enter a parse tree produced by JSXParser#importNamespace.
JSXParserListener.prototype.enterImportNamespace = function(ctx) {};

// Exit a parse tree produced by JSXParser#importNamespace.
JSXParserListener.prototype.exitImportNamespace = function(ctx) {};

// Enter a parse tree produced by JSXParser#importFrom.
JSXParserListener.prototype.enterImportFrom = function(ctx) {};

// Exit a parse tree produced by JSXParser#importFrom.
JSXParserListener.prototype.exitImportFrom = function(ctx) {};

// Enter a parse tree produced by JSXParser#aliasName.
JSXParserListener.prototype.enterAliasName = function(ctx) {};

// Exit a parse tree produced by JSXParser#aliasName.
JSXParserListener.prototype.exitAliasName = function(ctx) {};

// Enter a parse tree produced by JSXParser#ExportDeclaration.
JSXParserListener.prototype.enterExportDeclaration = function(ctx) {};

// Exit a parse tree produced by JSXParser#ExportDeclaration.
JSXParserListener.prototype.exitExportDeclaration = function(ctx) {};

// Enter a parse tree produced by JSXParser#ExportDefaultDeclaration.
JSXParserListener.prototype.enterExportDefaultDeclaration = function(ctx) {};

// Exit a parse tree produced by JSXParser#ExportDefaultDeclaration.
JSXParserListener.prototype.exitExportDefaultDeclaration = function(ctx) {};

// Enter a parse tree produced by JSXParser#exportFromBlock.
JSXParserListener.prototype.enterExportFromBlock = function(ctx) {};

// Exit a parse tree produced by JSXParser#exportFromBlock.
JSXParserListener.prototype.exitExportFromBlock = function(ctx) {};

// Enter a parse tree produced by JSXParser#declaration.
JSXParserListener.prototype.enterDeclaration = function(ctx) {};

// Exit a parse tree produced by JSXParser#declaration.
JSXParserListener.prototype.exitDeclaration = function(ctx) {};

// Enter a parse tree produced by JSXParser#variableStatement.
JSXParserListener.prototype.enterVariableStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#variableStatement.
JSXParserListener.prototype.exitVariableStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#variableDeclarationList.
JSXParserListener.prototype.enterVariableDeclarationList = function(ctx) {};

// Exit a parse tree produced by JSXParser#variableDeclarationList.
JSXParserListener.prototype.exitVariableDeclarationList = function(ctx) {};

// Enter a parse tree produced by JSXParser#variableDeclaration.
JSXParserListener.prototype.enterVariableDeclaration = function(ctx) {};

// Exit a parse tree produced by JSXParser#variableDeclaration.
JSXParserListener.prototype.exitVariableDeclaration = function(ctx) {};

// Enter a parse tree produced by JSXParser#emptyStatement.
JSXParserListener.prototype.enterEmptyStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#emptyStatement.
JSXParserListener.prototype.exitEmptyStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#expressionStatement.
JSXParserListener.prototype.enterExpressionStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#expressionStatement.
JSXParserListener.prototype.exitExpressionStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#ifStatement.
JSXParserListener.prototype.enterIfStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#ifStatement.
JSXParserListener.prototype.exitIfStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#DoStatement.
JSXParserListener.prototype.enterDoStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#DoStatement.
JSXParserListener.prototype.exitDoStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#WhileStatement.
JSXParserListener.prototype.enterWhileStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#WhileStatement.
JSXParserListener.prototype.exitWhileStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#ForStatement.
JSXParserListener.prototype.enterForStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#ForStatement.
JSXParserListener.prototype.exitForStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#ForInStatement.
JSXParserListener.prototype.enterForInStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#ForInStatement.
JSXParserListener.prototype.exitForInStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#ForOfStatement.
JSXParserListener.prototype.enterForOfStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#ForOfStatement.
JSXParserListener.prototype.exitForOfStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#varModifier.
JSXParserListener.prototype.enterVarModifier = function(ctx) {};

// Exit a parse tree produced by JSXParser#varModifier.
JSXParserListener.prototype.exitVarModifier = function(ctx) {};

// Enter a parse tree produced by JSXParser#continueStatement.
JSXParserListener.prototype.enterContinueStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#continueStatement.
JSXParserListener.prototype.exitContinueStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#breakStatement.
JSXParserListener.prototype.enterBreakStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#breakStatement.
JSXParserListener.prototype.exitBreakStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#returnStatement.
JSXParserListener.prototype.enterReturnStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#returnStatement.
JSXParserListener.prototype.exitReturnStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#yieldStatement.
JSXParserListener.prototype.enterYieldStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#yieldStatement.
JSXParserListener.prototype.exitYieldStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#withStatement.
JSXParserListener.prototype.enterWithStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#withStatement.
JSXParserListener.prototype.exitWithStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#switchStatement.
JSXParserListener.prototype.enterSwitchStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#switchStatement.
JSXParserListener.prototype.exitSwitchStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#caseBlock.
JSXParserListener.prototype.enterCaseBlock = function(ctx) {};

// Exit a parse tree produced by JSXParser#caseBlock.
JSXParserListener.prototype.exitCaseBlock = function(ctx) {};

// Enter a parse tree produced by JSXParser#caseClauses.
JSXParserListener.prototype.enterCaseClauses = function(ctx) {};

// Exit a parse tree produced by JSXParser#caseClauses.
JSXParserListener.prototype.exitCaseClauses = function(ctx) {};

// Enter a parse tree produced by JSXParser#caseClause.
JSXParserListener.prototype.enterCaseClause = function(ctx) {};

// Exit a parse tree produced by JSXParser#caseClause.
JSXParserListener.prototype.exitCaseClause = function(ctx) {};

// Enter a parse tree produced by JSXParser#defaultClause.
JSXParserListener.prototype.enterDefaultClause = function(ctx) {};

// Exit a parse tree produced by JSXParser#defaultClause.
JSXParserListener.prototype.exitDefaultClause = function(ctx) {};

// Enter a parse tree produced by JSXParser#labelledStatement.
JSXParserListener.prototype.enterLabelledStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#labelledStatement.
JSXParserListener.prototype.exitLabelledStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#throwStatement.
JSXParserListener.prototype.enterThrowStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#throwStatement.
JSXParserListener.prototype.exitThrowStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#tryStatement.
JSXParserListener.prototype.enterTryStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#tryStatement.
JSXParserListener.prototype.exitTryStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#catchProduction.
JSXParserListener.prototype.enterCatchProduction = function(ctx) {};

// Exit a parse tree produced by JSXParser#catchProduction.
JSXParserListener.prototype.exitCatchProduction = function(ctx) {};

// Enter a parse tree produced by JSXParser#finallyProduction.
JSXParserListener.prototype.enterFinallyProduction = function(ctx) {};

// Exit a parse tree produced by JSXParser#finallyProduction.
JSXParserListener.prototype.exitFinallyProduction = function(ctx) {};

// Enter a parse tree produced by JSXParser#debuggerStatement.
JSXParserListener.prototype.enterDebuggerStatement = function(ctx) {};

// Exit a parse tree produced by JSXParser#debuggerStatement.
JSXParserListener.prototype.exitDebuggerStatement = function(ctx) {};

// Enter a parse tree produced by JSXParser#functionDeclaration.
JSXParserListener.prototype.enterFunctionDeclaration = function(ctx) {};

// Exit a parse tree produced by JSXParser#functionDeclaration.
JSXParserListener.prototype.exitFunctionDeclaration = function(ctx) {};

// Enter a parse tree produced by JSXParser#classDeclaration.
JSXParserListener.prototype.enterClassDeclaration = function(ctx) {};

// Exit a parse tree produced by JSXParser#classDeclaration.
JSXParserListener.prototype.exitClassDeclaration = function(ctx) {};

// Enter a parse tree produced by JSXParser#classTail.
JSXParserListener.prototype.enterClassTail = function(ctx) {};

// Exit a parse tree produced by JSXParser#classTail.
JSXParserListener.prototype.exitClassTail = function(ctx) {};

// Enter a parse tree produced by JSXParser#classElement.
JSXParserListener.prototype.enterClassElement = function(ctx) {};

// Exit a parse tree produced by JSXParser#classElement.
JSXParserListener.prototype.exitClassElement = function(ctx) {};

// Enter a parse tree produced by JSXParser#methodDefinition.
JSXParserListener.prototype.enterMethodDefinition = function(ctx) {};

// Exit a parse tree produced by JSXParser#methodDefinition.
JSXParserListener.prototype.exitMethodDefinition = function(ctx) {};

// Enter a parse tree produced by JSXParser#formalParameterList.
JSXParserListener.prototype.enterFormalParameterList = function(ctx) {};

// Exit a parse tree produced by JSXParser#formalParameterList.
JSXParserListener.prototype.exitFormalParameterList = function(ctx) {};

// Enter a parse tree produced by JSXParser#formalParameterArg.
JSXParserListener.prototype.enterFormalParameterArg = function(ctx) {};

// Exit a parse tree produced by JSXParser#formalParameterArg.
JSXParserListener.prototype.exitFormalParameterArg = function(ctx) {};

// Enter a parse tree produced by JSXParser#lastFormalParameterArg.
JSXParserListener.prototype.enterLastFormalParameterArg = function(ctx) {};

// Exit a parse tree produced by JSXParser#lastFormalParameterArg.
JSXParserListener.prototype.exitLastFormalParameterArg = function(ctx) {};

// Enter a parse tree produced by JSXParser#functionBody.
JSXParserListener.prototype.enterFunctionBody = function(ctx) {};

// Exit a parse tree produced by JSXParser#functionBody.
JSXParserListener.prototype.exitFunctionBody = function(ctx) {};

// Enter a parse tree produced by JSXParser#sourceElements.
JSXParserListener.prototype.enterSourceElements = function(ctx) {};

// Exit a parse tree produced by JSXParser#sourceElements.
JSXParserListener.prototype.exitSourceElements = function(ctx) {};

// Enter a parse tree produced by JSXParser#arrayLiteral.
JSXParserListener.prototype.enterArrayLiteral = function(ctx) {};

// Exit a parse tree produced by JSXParser#arrayLiteral.
JSXParserListener.prototype.exitArrayLiteral = function(ctx) {};

// Enter a parse tree produced by JSXParser#elementList.
JSXParserListener.prototype.enterElementList = function(ctx) {};

// Exit a parse tree produced by JSXParser#elementList.
JSXParserListener.prototype.exitElementList = function(ctx) {};

// Enter a parse tree produced by JSXParser#arrayElement.
JSXParserListener.prototype.enterArrayElement = function(ctx) {};

// Exit a parse tree produced by JSXParser#arrayElement.
JSXParserListener.prototype.exitArrayElement = function(ctx) {};

// Enter a parse tree produced by JSXParser#PropertyExpressionAssignment.
JSXParserListener.prototype.enterPropertyExpressionAssignment = function(ctx) {};

// Exit a parse tree produced by JSXParser#PropertyExpressionAssignment.
JSXParserListener.prototype.exitPropertyExpressionAssignment = function(ctx) {};

// Enter a parse tree produced by JSXParser#ComputedPropertyExpressionAssignment.
JSXParserListener.prototype.enterComputedPropertyExpressionAssignment = function(ctx) {};

// Exit a parse tree produced by JSXParser#ComputedPropertyExpressionAssignment.
JSXParserListener.prototype.exitComputedPropertyExpressionAssignment = function(ctx) {};

// Enter a parse tree produced by JSXParser#FunctionProperty.
JSXParserListener.prototype.enterFunctionProperty = function(ctx) {};

// Exit a parse tree produced by JSXParser#FunctionProperty.
JSXParserListener.prototype.exitFunctionProperty = function(ctx) {};

// Enter a parse tree produced by JSXParser#PropertyGetter.
JSXParserListener.prototype.enterPropertyGetter = function(ctx) {};

// Exit a parse tree produced by JSXParser#PropertyGetter.
JSXParserListener.prototype.exitPropertyGetter = function(ctx) {};

// Enter a parse tree produced by JSXParser#PropertySetter.
JSXParserListener.prototype.enterPropertySetter = function(ctx) {};

// Exit a parse tree produced by JSXParser#PropertySetter.
JSXParserListener.prototype.exitPropertySetter = function(ctx) {};

// Enter a parse tree produced by JSXParser#PropertyShorthand.
JSXParserListener.prototype.enterPropertyShorthand = function(ctx) {};

// Exit a parse tree produced by JSXParser#PropertyShorthand.
JSXParserListener.prototype.exitPropertyShorthand = function(ctx) {};

// Enter a parse tree produced by JSXParser#propertyName.
JSXParserListener.prototype.enterPropertyName = function(ctx) {};

// Exit a parse tree produced by JSXParser#propertyName.
JSXParserListener.prototype.exitPropertyName = function(ctx) {};

// Enter a parse tree produced by JSXParser#arguments.
JSXParserListener.prototype.enterArguments = function(ctx) {};

// Exit a parse tree produced by JSXParser#arguments.
JSXParserListener.prototype.exitArguments = function(ctx) {};

// Enter a parse tree produced by JSXParser#argument.
JSXParserListener.prototype.enterArgument = function(ctx) {};

// Exit a parse tree produced by JSXParser#argument.
JSXParserListener.prototype.exitArgument = function(ctx) {};

// Enter a parse tree produced by JSXParser#expressionSequence.
JSXParserListener.prototype.enterExpressionSequence = function(ctx) {};

// Exit a parse tree produced by JSXParser#expressionSequence.
JSXParserListener.prototype.exitExpressionSequence = function(ctx) {};

// Enter a parse tree produced by JSXParser#TemplateStringExpression.
JSXParserListener.prototype.enterTemplateStringExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#TemplateStringExpression.
JSXParserListener.prototype.exitTemplateStringExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#TernaryExpression.
JSXParserListener.prototype.enterTernaryExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#TernaryExpression.
JSXParserListener.prototype.exitTernaryExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#LogicalAndExpression.
JSXParserListener.prototype.enterLogicalAndExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#LogicalAndExpression.
JSXParserListener.prototype.exitLogicalAndExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#PowerExpression.
JSXParserListener.prototype.enterPowerExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#PowerExpression.
JSXParserListener.prototype.exitPowerExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#PreIncrementExpression.
JSXParserListener.prototype.enterPreIncrementExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#PreIncrementExpression.
JSXParserListener.prototype.exitPreIncrementExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#ObjectLiteralExpression.
JSXParserListener.prototype.enterObjectLiteralExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#ObjectLiteralExpression.
JSXParserListener.prototype.exitObjectLiteralExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#MetaExpression.
JSXParserListener.prototype.enterMetaExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#MetaExpression.
JSXParserListener.prototype.exitMetaExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#InExpression.
JSXParserListener.prototype.enterInExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#InExpression.
JSXParserListener.prototype.exitInExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#LogicalOrExpression.
JSXParserListener.prototype.enterLogicalOrExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#LogicalOrExpression.
JSXParserListener.prototype.exitLogicalOrExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#NotExpression.
JSXParserListener.prototype.enterNotExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#NotExpression.
JSXParserListener.prototype.exitNotExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#PreDecreaseExpression.
JSXParserListener.prototype.enterPreDecreaseExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#PreDecreaseExpression.
JSXParserListener.prototype.exitPreDecreaseExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#ArgumentsExpression.
JSXParserListener.prototype.enterArgumentsExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#ArgumentsExpression.
JSXParserListener.prototype.exitArgumentsExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#AwaitExpression.
JSXParserListener.prototype.enterAwaitExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#AwaitExpression.
JSXParserListener.prototype.exitAwaitExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#ThisExpression.
JSXParserListener.prototype.enterThisExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#ThisExpression.
JSXParserListener.prototype.exitThisExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#FunctionExpression.
JSXParserListener.prototype.enterFunctionExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#FunctionExpression.
JSXParserListener.prototype.exitFunctionExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#UnaryMinusExpression.
JSXParserListener.prototype.enterUnaryMinusExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#UnaryMinusExpression.
JSXParserListener.prototype.exitUnaryMinusExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#AssignmentExpression.
JSXParserListener.prototype.enterAssignmentExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#AssignmentExpression.
JSXParserListener.prototype.exitAssignmentExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#PostDecreaseExpression.
JSXParserListener.prototype.enterPostDecreaseExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#PostDecreaseExpression.
JSXParserListener.prototype.exitPostDecreaseExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#TypeofExpression.
JSXParserListener.prototype.enterTypeofExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#TypeofExpression.
JSXParserListener.prototype.exitTypeofExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#InstanceofExpression.
JSXParserListener.prototype.enterInstanceofExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#InstanceofExpression.
JSXParserListener.prototype.exitInstanceofExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#UnaryPlusExpression.
JSXParserListener.prototype.enterUnaryPlusExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#UnaryPlusExpression.
JSXParserListener.prototype.exitUnaryPlusExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#DeleteExpression.
JSXParserListener.prototype.enterDeleteExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#DeleteExpression.
JSXParserListener.prototype.exitDeleteExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#ImportExpression.
JSXParserListener.prototype.enterImportExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#ImportExpression.
JSXParserListener.prototype.exitImportExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#EqualityExpression.
JSXParserListener.prototype.enterEqualityExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#EqualityExpression.
JSXParserListener.prototype.exitEqualityExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#BitXOrExpression.
JSXParserListener.prototype.enterBitXOrExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#BitXOrExpression.
JSXParserListener.prototype.exitBitXOrExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#SuperExpression.
JSXParserListener.prototype.enterSuperExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#SuperExpression.
JSXParserListener.prototype.exitSuperExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#MultiplicativeExpression.
JSXParserListener.prototype.enterMultiplicativeExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#MultiplicativeExpression.
JSXParserListener.prototype.exitMultiplicativeExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlElementExpression.
JSXParserListener.prototype.enterHtmlElementExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlElementExpression.
JSXParserListener.prototype.exitHtmlElementExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#BitShiftExpression.
JSXParserListener.prototype.enterBitShiftExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#BitShiftExpression.
JSXParserListener.prototype.exitBitShiftExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#ParenthesizedExpression.
JSXParserListener.prototype.enterParenthesizedExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#ParenthesizedExpression.
JSXParserListener.prototype.exitParenthesizedExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#AdditiveExpression.
JSXParserListener.prototype.enterAdditiveExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#AdditiveExpression.
JSXParserListener.prototype.exitAdditiveExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#RelationalExpression.
JSXParserListener.prototype.enterRelationalExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#RelationalExpression.
JSXParserListener.prototype.exitRelationalExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#PostIncrementExpression.
JSXParserListener.prototype.enterPostIncrementExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#PostIncrementExpression.
JSXParserListener.prototype.exitPostIncrementExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#YieldExpression.
JSXParserListener.prototype.enterYieldExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#YieldExpression.
JSXParserListener.prototype.exitYieldExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#BitNotExpression.
JSXParserListener.prototype.enterBitNotExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#BitNotExpression.
JSXParserListener.prototype.exitBitNotExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#NewExpression.
JSXParserListener.prototype.enterNewExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#NewExpression.
JSXParserListener.prototype.exitNewExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#LiteralExpression.
JSXParserListener.prototype.enterLiteralExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#LiteralExpression.
JSXParserListener.prototype.exitLiteralExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#ArrayLiteralExpression.
JSXParserListener.prototype.enterArrayLiteralExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#ArrayLiteralExpression.
JSXParserListener.prototype.exitArrayLiteralExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#MemberDotExpression.
JSXParserListener.prototype.enterMemberDotExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#MemberDotExpression.
JSXParserListener.prototype.exitMemberDotExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#ClassExpression.
JSXParserListener.prototype.enterClassExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#ClassExpression.
JSXParserListener.prototype.exitClassExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#MemberIndexExpression.
JSXParserListener.prototype.enterMemberIndexExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#MemberIndexExpression.
JSXParserListener.prototype.exitMemberIndexExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#IdentifierExpression.
JSXParserListener.prototype.enterIdentifierExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#IdentifierExpression.
JSXParserListener.prototype.exitIdentifierExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#BitAndExpression.
JSXParserListener.prototype.enterBitAndExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#BitAndExpression.
JSXParserListener.prototype.exitBitAndExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#BitOrExpression.
JSXParserListener.prototype.enterBitOrExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#BitOrExpression.
JSXParserListener.prototype.exitBitOrExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#AssignmentOperatorExpression.
JSXParserListener.prototype.enterAssignmentOperatorExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#AssignmentOperatorExpression.
JSXParserListener.prototype.exitAssignmentOperatorExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#VoidExpression.
JSXParserListener.prototype.enterVoidExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#VoidExpression.
JSXParserListener.prototype.exitVoidExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#CoalesceExpression.
JSXParserListener.prototype.enterCoalesceExpression = function(ctx) {};

// Exit a parse tree produced by JSXParser#CoalesceExpression.
JSXParserListener.prototype.exitCoalesceExpression = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlElements.
JSXParserListener.prototype.enterHtmlElements = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlElements.
JSXParserListener.prototype.exitHtmlElements = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlElement.
JSXParserListener.prototype.enterHtmlElement = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlElement.
JSXParserListener.prototype.exitHtmlElement = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlContent.
JSXParserListener.prototype.enterHtmlContent = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlContent.
JSXParserListener.prototype.exitHtmlContent = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlTagStartName.
JSXParserListener.prototype.enterHtmlTagStartName = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlTagStartName.
JSXParserListener.prototype.exitHtmlTagStartName = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlTagClosingName.
JSXParserListener.prototype.enterHtmlTagClosingName = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlTagClosingName.
JSXParserListener.prototype.exitHtmlTagClosingName = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlTagName.
JSXParserListener.prototype.enterHtmlTagName = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlTagName.
JSXParserListener.prototype.exitHtmlTagName = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlAttribute.
JSXParserListener.prototype.enterHtmlAttribute = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlAttribute.
JSXParserListener.prototype.exitHtmlAttribute = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlAttributeName.
JSXParserListener.prototype.enterHtmlAttributeName = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlAttributeName.
JSXParserListener.prototype.exitHtmlAttributeName = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlChardata.
JSXParserListener.prototype.enterHtmlChardata = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlChardata.
JSXParserListener.prototype.exitHtmlChardata = function(ctx) {};

// Enter a parse tree produced by JSXParser#htmlAttributeValue.
JSXParserListener.prototype.enterHtmlAttributeValue = function(ctx) {};

// Exit a parse tree produced by JSXParser#htmlAttributeValue.
JSXParserListener.prototype.exitHtmlAttributeValue = function(ctx) {};

// Enter a parse tree produced by JSXParser#assignable.
JSXParserListener.prototype.enterAssignable = function(ctx) {};

// Exit a parse tree produced by JSXParser#assignable.
JSXParserListener.prototype.exitAssignable = function(ctx) {};

// Enter a parse tree produced by JSXParser#objectLiteral.
JSXParserListener.prototype.enterObjectLiteral = function(ctx) {};

// Exit a parse tree produced by JSXParser#objectLiteral.
JSXParserListener.prototype.exitObjectLiteral = function(ctx) {};

// Enter a parse tree produced by JSXParser#objectExpressionSequence.
JSXParserListener.prototype.enterObjectExpressionSequence = function(ctx) {};

// Exit a parse tree produced by JSXParser#objectExpressionSequence.
JSXParserListener.prototype.exitObjectExpressionSequence = function(ctx) {};

// Enter a parse tree produced by JSXParser#FunctionDecl.
JSXParserListener.prototype.enterFunctionDecl = function(ctx) {};

// Exit a parse tree produced by JSXParser#FunctionDecl.
JSXParserListener.prototype.exitFunctionDecl = function(ctx) {};

// Enter a parse tree produced by JSXParser#AnoymousFunctionDecl.
JSXParserListener.prototype.enterAnoymousFunctionDecl = function(ctx) {};

// Exit a parse tree produced by JSXParser#AnoymousFunctionDecl.
JSXParserListener.prototype.exitAnoymousFunctionDecl = function(ctx) {};

// Enter a parse tree produced by JSXParser#ArrowFunction.
JSXParserListener.prototype.enterArrowFunction = function(ctx) {};

// Exit a parse tree produced by JSXParser#ArrowFunction.
JSXParserListener.prototype.exitArrowFunction = function(ctx) {};

// Enter a parse tree produced by JSXParser#arrowFunctionParameters.
JSXParserListener.prototype.enterArrowFunctionParameters = function(ctx) {};

// Exit a parse tree produced by JSXParser#arrowFunctionParameters.
JSXParserListener.prototype.exitArrowFunctionParameters = function(ctx) {};

// Enter a parse tree produced by JSXParser#arrowFunctionBody.
JSXParserListener.prototype.enterArrowFunctionBody = function(ctx) {};

// Exit a parse tree produced by JSXParser#arrowFunctionBody.
JSXParserListener.prototype.exitArrowFunctionBody = function(ctx) {};

// Enter a parse tree produced by JSXParser#assignmentOperator.
JSXParserListener.prototype.enterAssignmentOperator = function(ctx) {};

// Exit a parse tree produced by JSXParser#assignmentOperator.
JSXParserListener.prototype.exitAssignmentOperator = function(ctx) {};

// Enter a parse tree produced by JSXParser#literal.
JSXParserListener.prototype.enterLiteral = function(ctx) {};

// Exit a parse tree produced by JSXParser#literal.
JSXParserListener.prototype.exitLiteral = function(ctx) {};

// Enter a parse tree produced by JSXParser#numericLiteral.
JSXParserListener.prototype.enterNumericLiteral = function(ctx) {};

// Exit a parse tree produced by JSXParser#numericLiteral.
JSXParserListener.prototype.exitNumericLiteral = function(ctx) {};

// Enter a parse tree produced by JSXParser#bigintLiteral.
JSXParserListener.prototype.enterBigintLiteral = function(ctx) {};

// Exit a parse tree produced by JSXParser#bigintLiteral.
JSXParserListener.prototype.exitBigintLiteral = function(ctx) {};

// Enter a parse tree produced by JSXParser#getter.
JSXParserListener.prototype.enterGetter = function(ctx) {};

// Exit a parse tree produced by JSXParser#getter.
JSXParserListener.prototype.exitGetter = function(ctx) {};

// Enter a parse tree produced by JSXParser#setter.
JSXParserListener.prototype.enterSetter = function(ctx) {};

// Exit a parse tree produced by JSXParser#setter.
JSXParserListener.prototype.exitSetter = function(ctx) {};

// Enter a parse tree produced by JSXParser#identifierName.
JSXParserListener.prototype.enterIdentifierName = function(ctx) {};

// Exit a parse tree produced by JSXParser#identifierName.
JSXParserListener.prototype.exitIdentifierName = function(ctx) {};

// Enter a parse tree produced by JSXParser#identifier.
JSXParserListener.prototype.enterIdentifier = function(ctx) {};

// Exit a parse tree produced by JSXParser#identifier.
JSXParserListener.prototype.exitIdentifier = function(ctx) {};

// Enter a parse tree produced by JSXParser#reservedWord.
JSXParserListener.prototype.enterReservedWord = function(ctx) {};

// Exit a parse tree produced by JSXParser#reservedWord.
JSXParserListener.prototype.exitReservedWord = function(ctx) {};

// Enter a parse tree produced by JSXParser#keyword.
JSXParserListener.prototype.enterKeyword = function(ctx) {};

// Exit a parse tree produced by JSXParser#keyword.
JSXParserListener.prototype.exitKeyword = function(ctx) {};

// Enter a parse tree produced by JSXParser#let.
JSXParserListener.prototype.enterLet = function(ctx) {};

// Exit a parse tree produced by JSXParser#let.
JSXParserListener.prototype.exitLet = function(ctx) {};

// Enter a parse tree produced by JSXParser#eos.
JSXParserListener.prototype.enterEos = function(ctx) {};

// Exit a parse tree produced by JSXParser#eos.
JSXParserListener.prototype.exitEos = function(ctx) {};

exports.JSXParserListener = JSXParserListener;
