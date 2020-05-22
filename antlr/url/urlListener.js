// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/url.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by urlParser.
function urlListener() {
  antlr4.tree.ParseTreeListener.call(this);
  return this;
}

urlListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
urlListener.prototype.constructor = urlListener;

// Enter a parse tree produced by urlParser#url.
urlListener.prototype.enterUrl = function(ctx) {};

// Exit a parse tree produced by urlParser#url.
urlListener.prototype.exitUrl = function(ctx) {};

// Enter a parse tree produced by urlParser#uri.
urlListener.prototype.enterUri = function(ctx) {};

// Exit a parse tree produced by urlParser#uri.
urlListener.prototype.exitUri = function(ctx) {};

// Enter a parse tree produced by urlParser#scheme.
urlListener.prototype.enterScheme = function(ctx) {};

// Exit a parse tree produced by urlParser#scheme.
urlListener.prototype.exitScheme = function(ctx) {};

// Enter a parse tree produced by urlParser#host.
urlListener.prototype.enterHost = function(ctx) {};

// Exit a parse tree produced by urlParser#host.
urlListener.prototype.exitHost = function(ctx) {};

// Enter a parse tree produced by urlParser#DomainNameOrIPv4Host.
urlListener.prototype.enterDomainNameOrIPv4Host = function(ctx) {};

// Exit a parse tree produced by urlParser#DomainNameOrIPv4Host.
urlListener.prototype.exitDomainNameOrIPv4Host = function(ctx) {};

// Enter a parse tree produced by urlParser#IPv6Host.
urlListener.prototype.enterIPv6Host = function(ctx) {};

// Exit a parse tree produced by urlParser#IPv6Host.
urlListener.prototype.exitIPv6Host = function(ctx) {};

// Enter a parse tree produced by urlParser#v6host.
urlListener.prototype.enterV6host = function(ctx) {};

// Exit a parse tree produced by urlParser#v6host.
urlListener.prototype.exitV6host = function(ctx) {};

// Enter a parse tree produced by urlParser#port.
urlListener.prototype.enterPort = function(ctx) {};

// Exit a parse tree produced by urlParser#port.
urlListener.prototype.exitPort = function(ctx) {};

// Enter a parse tree produced by urlParser#path.
urlListener.prototype.enterPath = function(ctx) {};

// Exit a parse tree produced by urlParser#path.
urlListener.prototype.exitPath = function(ctx) {};

// Enter a parse tree produced by urlParser#user.
urlListener.prototype.enterUser = function(ctx) {};

// Exit a parse tree produced by urlParser#user.
urlListener.prototype.exitUser = function(ctx) {};

// Enter a parse tree produced by urlParser#login.
urlListener.prototype.enterLogin = function(ctx) {};

// Exit a parse tree produced by urlParser#login.
urlListener.prototype.exitLogin = function(ctx) {};

// Enter a parse tree produced by urlParser#password.
urlListener.prototype.enterPassword = function(ctx) {};

// Exit a parse tree produced by urlParser#password.
urlListener.prototype.exitPassword = function(ctx) {};

// Enter a parse tree produced by urlParser#frag.
urlListener.prototype.enterFrag = function(ctx) {};

// Exit a parse tree produced by urlParser#frag.
urlListener.prototype.exitFrag = function(ctx) {};

// Enter a parse tree produced by urlParser#query.
urlListener.prototype.enterQuery = function(ctx) {};

// Exit a parse tree produced by urlParser#query.
urlListener.prototype.exitQuery = function(ctx) {};

// Enter a parse tree produced by urlParser#search.
urlListener.prototype.enterSearch = function(ctx) {};

// Exit a parse tree produced by urlParser#search.
urlListener.prototype.exitSearch = function(ctx) {};

// Enter a parse tree produced by urlParser#searchparameter.
urlListener.prototype.enterSearchparameter = function(ctx) {};

// Exit a parse tree produced by urlParser#searchparameter.
urlListener.prototype.exitSearchparameter = function(ctx) {};

// Enter a parse tree produced by urlParser#string.
urlListener.prototype.enterString = function(ctx) {};

// Exit a parse tree produced by urlParser#string.
urlListener.prototype.exitString = function(ctx) {};

exports.urlListener = urlListener;
