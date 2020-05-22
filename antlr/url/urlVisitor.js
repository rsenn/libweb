// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/url.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by urlParser.

function urlVisitor() {
  antlr4.tree.ParseTreeVisitor.call(this);
  return this;
}

urlVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
urlVisitor.prototype.constructor = urlVisitor;

// Visit a parse tree produced by urlParser#url.
urlVisitor.prototype.visitUrl = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#uri.
urlVisitor.prototype.visitUri = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#scheme.
urlVisitor.prototype.visitScheme = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#host.
urlVisitor.prototype.visitHost = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#DomainNameOrIPv4Host.
urlVisitor.prototype.visitDomainNameOrIPv4Host = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#IPv6Host.
urlVisitor.prototype.visitIPv6Host = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#v6host.
urlVisitor.prototype.visitV6host = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#port.
urlVisitor.prototype.visitPort = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#path.
urlVisitor.prototype.visitPath = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#user.
urlVisitor.prototype.visitUser = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#login.
urlVisitor.prototype.visitLogin = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#password.
urlVisitor.prototype.visitPassword = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#frag.
urlVisitor.prototype.visitFrag = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#query.
urlVisitor.prototype.visitQuery = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#search.
urlVisitor.prototype.visitSearch = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#searchparameter.
urlVisitor.prototype.visitSearchparameter = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by urlParser#string.
urlVisitor.prototype.visitString = function(ctx) {
  return this.visitChildren(ctx);
};

exports.urlVisitor = urlVisitor;
