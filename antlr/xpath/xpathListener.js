// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/xpath.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by xpathParser.
function xpathListener() {
  antlr4.tree.ParseTreeListener.call(this);
  return this;
}

xpathListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
xpathListener.prototype.constructor = xpathListener;

// Enter a parse tree produced by xpathParser#main.
xpathListener.prototype.enterMain = function(ctx) {};

// Exit a parse tree produced by xpathParser#main.
xpathListener.prototype.exitMain = function(ctx) {};

// Enter a parse tree produced by xpathParser#locationPath.
xpathListener.prototype.enterLocationPath = function(ctx) {};

// Exit a parse tree produced by xpathParser#locationPath.
xpathListener.prototype.exitLocationPath = function(ctx) {};

// Enter a parse tree produced by xpathParser#absoluteLocationPathNoroot.
xpathListener.prototype.enterAbsoluteLocationPathNoroot = function(ctx) {};

// Exit a parse tree produced by xpathParser#absoluteLocationPathNoroot.
xpathListener.prototype.exitAbsoluteLocationPathNoroot = function(ctx) {};

// Enter a parse tree produced by xpathParser#relativeLocationPath.
xpathListener.prototype.enterRelativeLocationPath = function(ctx) {};

// Exit a parse tree produced by xpathParser#relativeLocationPath.
xpathListener.prototype.exitRelativeLocationPath = function(ctx) {};

// Enter a parse tree produced by xpathParser#step.
xpathListener.prototype.enterStep = function(ctx) {};

// Exit a parse tree produced by xpathParser#step.
xpathListener.prototype.exitStep = function(ctx) {};

// Enter a parse tree produced by xpathParser#axisSpecifier.
xpathListener.prototype.enterAxisSpecifier = function(ctx) {};

// Exit a parse tree produced by xpathParser#axisSpecifier.
xpathListener.prototype.exitAxisSpecifier = function(ctx) {};

// Enter a parse tree produced by xpathParser#nodeTest.
xpathListener.prototype.enterNodeTest = function(ctx) {};

// Exit a parse tree produced by xpathParser#nodeTest.
xpathListener.prototype.exitNodeTest = function(ctx) {};

// Enter a parse tree produced by xpathParser#predicate.
xpathListener.prototype.enterPredicate = function(ctx) {};

// Exit a parse tree produced by xpathParser#predicate.
xpathListener.prototype.exitPredicate = function(ctx) {};

// Enter a parse tree produced by xpathParser#abbreviatedStep.
xpathListener.prototype.enterAbbreviatedStep = function(ctx) {};

// Exit a parse tree produced by xpathParser#abbreviatedStep.
xpathListener.prototype.exitAbbreviatedStep = function(ctx) {};

// Enter a parse tree produced by xpathParser#expr.
xpathListener.prototype.enterExpr = function(ctx) {};

// Exit a parse tree produced by xpathParser#expr.
xpathListener.prototype.exitExpr = function(ctx) {};

// Enter a parse tree produced by xpathParser#primaryExpr.
xpathListener.prototype.enterPrimaryExpr = function(ctx) {};

// Exit a parse tree produced by xpathParser#primaryExpr.
xpathListener.prototype.exitPrimaryExpr = function(ctx) {};

// Enter a parse tree produced by xpathParser#functionCall.
xpathListener.prototype.enterFunctionCall = function(ctx) {};

// Exit a parse tree produced by xpathParser#functionCall.
xpathListener.prototype.exitFunctionCall = function(ctx) {};

// Enter a parse tree produced by xpathParser#unionExprNoRoot.
xpathListener.prototype.enterUnionExprNoRoot = function(ctx) {};

// Exit a parse tree produced by xpathParser#unionExprNoRoot.
xpathListener.prototype.exitUnionExprNoRoot = function(ctx) {};

// Enter a parse tree produced by xpathParser#pathExprNoRoot.
xpathListener.prototype.enterPathExprNoRoot = function(ctx) {};

// Exit a parse tree produced by xpathParser#pathExprNoRoot.
xpathListener.prototype.exitPathExprNoRoot = function(ctx) {};

// Enter a parse tree produced by xpathParser#filterExpr.
xpathListener.prototype.enterFilterExpr = function(ctx) {};

// Exit a parse tree produced by xpathParser#filterExpr.
xpathListener.prototype.exitFilterExpr = function(ctx) {};

// Enter a parse tree produced by xpathParser#orExpr.
xpathListener.prototype.enterOrExpr = function(ctx) {};

// Exit a parse tree produced by xpathParser#orExpr.
xpathListener.prototype.exitOrExpr = function(ctx) {};

// Enter a parse tree produced by xpathParser#andExpr.
xpathListener.prototype.enterAndExpr = function(ctx) {};

// Exit a parse tree produced by xpathParser#andExpr.
xpathListener.prototype.exitAndExpr = function(ctx) {};

// Enter a parse tree produced by xpathParser#equalityExpr.
xpathListener.prototype.enterEqualityExpr = function(ctx) {};

// Exit a parse tree produced by xpathParser#equalityExpr.
xpathListener.prototype.exitEqualityExpr = function(ctx) {};

// Enter a parse tree produced by xpathParser#relationalExpr.
xpathListener.prototype.enterRelationalExpr = function(ctx) {};

// Exit a parse tree produced by xpathParser#relationalExpr.
xpathListener.prototype.exitRelationalExpr = function(ctx) {};

// Enter a parse tree produced by xpathParser#additiveExpr.
xpathListener.prototype.enterAdditiveExpr = function(ctx) {};

// Exit a parse tree produced by xpathParser#additiveExpr.
xpathListener.prototype.exitAdditiveExpr = function(ctx) {};

// Enter a parse tree produced by xpathParser#multiplicativeExpr.
xpathListener.prototype.enterMultiplicativeExpr = function(ctx) {};

// Exit a parse tree produced by xpathParser#multiplicativeExpr.
xpathListener.prototype.exitMultiplicativeExpr = function(ctx) {};

// Enter a parse tree produced by xpathParser#unaryExprNoRoot.
xpathListener.prototype.enterUnaryExprNoRoot = function(ctx) {};

// Exit a parse tree produced by xpathParser#unaryExprNoRoot.
xpathListener.prototype.exitUnaryExprNoRoot = function(ctx) {};

// Enter a parse tree produced by xpathParser#qName.
xpathListener.prototype.enterQName = function(ctx) {};

// Exit a parse tree produced by xpathParser#qName.
xpathListener.prototype.exitQName = function(ctx) {};

// Enter a parse tree produced by xpathParser#functionName.
xpathListener.prototype.enterFunctionName = function(ctx) {};

// Exit a parse tree produced by xpathParser#functionName.
xpathListener.prototype.exitFunctionName = function(ctx) {};

// Enter a parse tree produced by xpathParser#variableReference.
xpathListener.prototype.enterVariableReference = function(ctx) {};

// Exit a parse tree produced by xpathParser#variableReference.
xpathListener.prototype.exitVariableReference = function(ctx) {};

// Enter a parse tree produced by xpathParser#nameTest.
xpathListener.prototype.enterNameTest = function(ctx) {};

// Exit a parse tree produced by xpathParser#nameTest.
xpathListener.prototype.exitNameTest = function(ctx) {};

// Enter a parse tree produced by xpathParser#nCName.
xpathListener.prototype.enterNCName = function(ctx) {};

// Exit a parse tree produced by xpathParser#nCName.
xpathListener.prototype.exitNCName = function(ctx) {};

exports.xpathListener = xpathListener;
