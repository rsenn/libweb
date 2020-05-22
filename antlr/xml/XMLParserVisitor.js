// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/XMLParser.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by XMLParser.

function XMLParserVisitor() {
  antlr4.tree.ParseTreeVisitor.call(this);
  return this;
}

XMLParserVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
XMLParserVisitor.prototype.constructor = XMLParserVisitor;

// Visit a parse tree produced by XMLParser#document.
XMLParserVisitor.prototype.visitDocument = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by XMLParser#prolog.
XMLParserVisitor.prototype.visitProlog = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by XMLParser#content.
XMLParserVisitor.prototype.visitContent = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by XMLParser#element.
XMLParserVisitor.prototype.visitElement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by XMLParser#reference.
XMLParserVisitor.prototype.visitReference = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by XMLParser#attribute.
XMLParserVisitor.prototype.visitAttribute = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by XMLParser#chardata.
XMLParserVisitor.prototype.visitChardata = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by XMLParser#misc.
XMLParserVisitor.prototype.visitMisc = function(ctx) {
  return this.visitChildren(ctx);
};

exports.XMLParserVisitor = XMLParserVisitor;
