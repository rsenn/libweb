// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/xpath.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by xpathParser.

function xpathVisitor() {
  antlr4.tree.ParseTreeVisitor.call(this);
  return this;
}

xpathVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
xpathVisitor.prototype.constructor = xpathVisitor;

// Visit a parse tree produced by xpathParser#main.
xpathVisitor.prototype.visitMain = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#locationPath.
xpathVisitor.prototype.visitLocationPath = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#absoluteLocationPathNoroot.
xpathVisitor.prototype.visitAbsoluteLocationPathNoroot = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#relativeLocationPath.
xpathVisitor.prototype.visitRelativeLocationPath = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#step.
xpathVisitor.prototype.visitStep = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#axisSpecifier.
xpathVisitor.prototype.visitAxisSpecifier = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#nodeTest.
xpathVisitor.prototype.visitNodeTest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#predicate.
xpathVisitor.prototype.visitPredicate = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#abbreviatedStep.
xpathVisitor.prototype.visitAbbreviatedStep = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#expr.
xpathVisitor.prototype.visitExpr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#primaryExpr.
xpathVisitor.prototype.visitPrimaryExpr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#functionCall.
xpathVisitor.prototype.visitFunctionCall = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#unionExprNoRoot.
xpathVisitor.prototype.visitUnionExprNoRoot = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#pathExprNoRoot.
xpathVisitor.prototype.visitPathExprNoRoot = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#filterExpr.
xpathVisitor.prototype.visitFilterExpr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#orExpr.
xpathVisitor.prototype.visitOrExpr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#andExpr.
xpathVisitor.prototype.visitAndExpr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#equalityExpr.
xpathVisitor.prototype.visitEqualityExpr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#relationalExpr.
xpathVisitor.prototype.visitRelationalExpr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#additiveExpr.
xpathVisitor.prototype.visitAdditiveExpr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#multiplicativeExpr.
xpathVisitor.prototype.visitMultiplicativeExpr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#unaryExprNoRoot.
xpathVisitor.prototype.visitUnaryExprNoRoot = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#qName.
xpathVisitor.prototype.visitQName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#functionName.
xpathVisitor.prototype.visitFunctionName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#variableReference.
xpathVisitor.prototype.visitVariableReference = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#nameTest.
xpathVisitor.prototype.visitNameTest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by xpathParser#nCName.
xpathVisitor.prototype.visitNCName = function(ctx) {
  return this.visitChildren(ctx);
};

exports.xpathVisitor = xpathVisitor;
