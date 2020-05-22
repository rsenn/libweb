// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/CMake.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by CMakeParser.

function CMakeVisitor() {
  antlr4.tree.ParseTreeVisitor.call(this);
  return this;
}

CMakeVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
CMakeVisitor.prototype.constructor = CMakeVisitor;

// Visit a parse tree produced by CMakeParser#file.
CMakeVisitor.prototype.visitFile = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by CMakeParser#command_invocation.
CMakeVisitor.prototype.visitCommand_invocation = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by CMakeParser#single_argument.
CMakeVisitor.prototype.visitSingle_argument = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by CMakeParser#compound_argument.
CMakeVisitor.prototype.visitCompound_argument = function(ctx) {
  return this.visitChildren(ctx);
};

exports.CMakeVisitor = CMakeVisitor;
