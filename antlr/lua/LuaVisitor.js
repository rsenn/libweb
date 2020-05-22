// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/Lua.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by LuaParser.

function LuaVisitor() {
  antlr4.tree.ParseTreeVisitor.call(this);
  return this;
}

LuaVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
LuaVisitor.prototype.constructor = LuaVisitor;

// Visit a parse tree produced by LuaParser#chunk.
LuaVisitor.prototype.visitChunk = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#block.
LuaVisitor.prototype.visitBlock = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#stat.
LuaVisitor.prototype.visitStat = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#retstat.
LuaVisitor.prototype.visitRetstat = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#label.
LuaVisitor.prototype.visitLabel = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#funcname.
LuaVisitor.prototype.visitFuncname = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#varlist.
LuaVisitor.prototype.visitVarlist = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#namelist.
LuaVisitor.prototype.visitNamelist = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#explist.
LuaVisitor.prototype.visitExplist = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#exp.
LuaVisitor.prototype.visitExp = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#prefixexp.
LuaVisitor.prototype.visitPrefixexp = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#functioncall.
LuaVisitor.prototype.visitFunctioncall = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#varOrExp.
LuaVisitor.prototype.visitVarOrExp = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#var.
LuaVisitor.prototype.visitVar = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#varSuffix.
LuaVisitor.prototype.visitVarSuffix = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#nameAndArgs.
LuaVisitor.prototype.visitNameAndArgs = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#args.
LuaVisitor.prototype.visitArgs = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#functiondef.
LuaVisitor.prototype.visitFunctiondef = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#funcbody.
LuaVisitor.prototype.visitFuncbody = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#parlist.
LuaVisitor.prototype.visitParlist = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#tableconstructor.
LuaVisitor.prototype.visitTableconstructor = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#fieldlist.
LuaVisitor.prototype.visitFieldlist = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#field.
LuaVisitor.prototype.visitField = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#fieldsep.
LuaVisitor.prototype.visitFieldsep = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#operatorOr.
LuaVisitor.prototype.visitOperatorOr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#operatorAnd.
LuaVisitor.prototype.visitOperatorAnd = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#operatorComparison.
LuaVisitor.prototype.visitOperatorComparison = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#operatorStrcat.
LuaVisitor.prototype.visitOperatorStrcat = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#operatorAddSub.
LuaVisitor.prototype.visitOperatorAddSub = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#operatorMulDivMod.
LuaVisitor.prototype.visitOperatorMulDivMod = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#operatorBitwise.
LuaVisitor.prototype.visitOperatorBitwise = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#operatorUnary.
LuaVisitor.prototype.visitOperatorUnary = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#operatorPower.
LuaVisitor.prototype.visitOperatorPower = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#number.
LuaVisitor.prototype.visitNumber = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by LuaParser#string.
LuaVisitor.prototype.visitString = function(ctx) {
  return this.visitChildren(ctx);
};

exports.LuaVisitor = LuaVisitor;
