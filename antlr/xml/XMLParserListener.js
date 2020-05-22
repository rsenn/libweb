// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/XMLParser.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by XMLParser.
function XMLParserListener() {
  antlr4.tree.ParseTreeListener.call(this);
  return this;
}

XMLParserListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
XMLParserListener.prototype.constructor = XMLParserListener;

// Enter a parse tree produced by XMLParser#document.
XMLParserListener.prototype.enterDocument = function(ctx) {};

// Exit a parse tree produced by XMLParser#document.
XMLParserListener.prototype.exitDocument = function(ctx) {};

// Enter a parse tree produced by XMLParser#prolog.
XMLParserListener.prototype.enterProlog = function(ctx) {};

// Exit a parse tree produced by XMLParser#prolog.
XMLParserListener.prototype.exitProlog = function(ctx) {};

// Enter a parse tree produced by XMLParser#content.
XMLParserListener.prototype.enterContent = function(ctx) {};

// Exit a parse tree produced by XMLParser#content.
XMLParserListener.prototype.exitContent = function(ctx) {};

// Enter a parse tree produced by XMLParser#element.
XMLParserListener.prototype.enterElement = function(ctx) {};

// Exit a parse tree produced by XMLParser#element.
XMLParserListener.prototype.exitElement = function(ctx) {};

// Enter a parse tree produced by XMLParser#reference.
XMLParserListener.prototype.enterReference = function(ctx) {};

// Exit a parse tree produced by XMLParser#reference.
XMLParserListener.prototype.exitReference = function(ctx) {};

// Enter a parse tree produced by XMLParser#attribute.
XMLParserListener.prototype.enterAttribute = function(ctx) {};

// Exit a parse tree produced by XMLParser#attribute.
XMLParserListener.prototype.exitAttribute = function(ctx) {};

// Enter a parse tree produced by XMLParser#chardata.
XMLParserListener.prototype.enterChardata = function(ctx) {};

// Exit a parse tree produced by XMLParser#chardata.
XMLParserListener.prototype.exitChardata = function(ctx) {};

// Enter a parse tree produced by XMLParser#misc.
XMLParserListener.prototype.enterMisc = function(ctx) {};

// Exit a parse tree produced by XMLParser#misc.
XMLParserListener.prototype.exitMisc = function(ctx) {};

exports.XMLParserListener = XMLParserListener;
