// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/CMake.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by CMakeParser.
function CMakeListener() {
  antlr4.tree.ParseTreeListener.call(this);
  return this;
}

CMakeListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
CMakeListener.prototype.constructor = CMakeListener;

// Enter a parse tree produced by CMakeParser#file.
CMakeListener.prototype.enterFile = function(ctx) {};

// Exit a parse tree produced by CMakeParser#file.
CMakeListener.prototype.exitFile = function(ctx) {};

// Enter a parse tree produced by CMakeParser#command_invocation.
CMakeListener.prototype.enterCommand_invocation = function(ctx) {};

// Exit a parse tree produced by CMakeParser#command_invocation.
CMakeListener.prototype.exitCommand_invocation = function(ctx) {};

// Enter a parse tree produced by CMakeParser#single_argument.
CMakeListener.prototype.enterSingle_argument = function(ctx) {};

// Exit a parse tree produced by CMakeParser#single_argument.
CMakeListener.prototype.exitSingle_argument = function(ctx) {};

// Enter a parse tree produced by CMakeParser#compound_argument.
CMakeListener.prototype.enterCompound_argument = function(ctx) {};

// Exit a parse tree produced by CMakeParser#compound_argument.
CMakeListener.prototype.exitCompound_argument = function(ctx) {};

exports.CMakeListener = CMakeListener;
