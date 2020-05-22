// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/CMake.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');
var CMakeListener = require('./CMakeListener').CMakeListener;
var CMakeVisitor = require('./CMakeVisitor').CMakeVisitor;

var grammarFileName = 'CMake.g4';

var serializedATN = [
  '\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964',
  '\u0003\r*\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t\u0004',
  '\u0004\u0005\t\u0005\u0003\u0002\u0007\u0002\f\n\u0002\f\u0002\u000e',
  '\u0002\u000f\u000b\u0002\u0003\u0002\u0003\u0002\u0003\u0003\u0003\u0003',
  '\u0003\u0003\u0003\u0003\u0007\u0003\u0017\n\u0003\f\u0003\u000e\u0003',
  '\u001a\u000b\u0003\u0003\u0003\u0003\u0003\u0003\u0004\u0003\u0004\u0003',
  '\u0005\u0003\u0005\u0003\u0005\u0007\u0005#\n\u0005\f\u0005\u000e\u0005',
  '&\u000b\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0002\u0002\u0006',
  '\u0002\u0004\u0006\b\u0002\u0003\u0004\u0002\u0005\u0006\b\t\u0002*',
  '\u0002\r\u0003\u0002\u0002\u0002\u0004\u0012\u0003\u0002\u0002\u0002',
  '\u0006\u001d\u0003\u0002\u0002\u0002\b\u001f\u0003\u0002\u0002\u0002',
  '\n\f\u0005\u0004\u0003\u0002\u000b\n\u0003\u0002\u0002\u0002\f\u000f',
  '\u0003\u0002\u0002\u0002\r\u000b\u0003\u0002\u0002\u0002\r\u000e\u0003',
  '\u0002\u0002\u0002\u000e\u0010\u0003\u0002\u0002\u0002\u000f\r\u0003',
  '\u0002\u0002\u0002\u0010\u0011\u0007\u0002\u0002\u0003\u0011\u0003\u0003',
  '\u0002\u0002\u0002\u0012\u0013\u0007\u0005\u0002\u0002\u0013\u0018\u0007',
  '\u0003\u0002\u0002\u0014\u0017\u0005\u0006\u0004\u0002\u0015\u0017\u0005',
  '\b\u0005\u0002\u0016\u0014\u0003\u0002\u0002\u0002\u0016\u0015\u0003',
  '\u0002\u0002\u0002\u0017\u001a\u0003\u0002\u0002\u0002\u0018\u0016\u0003',
  '\u0002\u0002\u0002\u0018\u0019\u0003\u0002\u0002\u0002\u0019\u001b\u0003',
  '\u0002\u0002\u0002\u001a\u0018\u0003\u0002\u0002\u0002\u001b\u001c\u0007',
  '\u0004\u0002\u0002\u001c\u0005\u0003\u0002\u0002\u0002\u001d\u001e\t',
  '\u0002\u0002\u0002\u001e\u0007\u0003\u0002\u0002\u0002\u001f$\u0007',
  '\u0003\u0002\u0002 #\u0005\u0006\u0004\u0002!#\u0005\b\u0005\u0002"',
  ' \u0003\u0002\u0002\u0002"!\u0003\u0002\u0002\u0002#&\u0003\u0002\u0002',
  '\u0002$"\u0003\u0002\u0002\u0002$%\u0003\u0002\u0002\u0002%\'\u0003',
  "\u0002\u0002\u0002&$\u0003\u0002\u0002\u0002'(\u0007\u0004\u0002\u0002",
  '(\t\u0003\u0002\u0002\u0002\u0007\r\u0016\u0018"$'
].join('');

var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map(function(ds, index) {
  return new antlr4.dfa.DFA(ds, index);
});

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [null, "'('", "')'"];

var symbolicNames = [null, null, null, 'Identifier', 'Unquoted_argument', 'Escape_sequence', 'Quoted_argument', 'Bracket_argument', 'Bracket_comment', 'Line_comment', 'Newline', 'Space'];

var ruleNames = ['file', 'command_invocation', 'single_argument', 'compound_argument'];

function CMakeParser(input) {
  antlr4.Parser.call(this, input);
  this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
  this.ruleNames = ruleNames;
  this.literalNames = literalNames;
  this.symbolicNames = symbolicNames;
  return this;
}

CMakeParser.prototype = Object.create(antlr4.Parser.prototype);
CMakeParser.prototype.constructor = CMakeParser;

Object.defineProperty(CMakeParser.prototype, 'atn', {
  get: function() {
    return atn;
  }
});

CMakeParser.EOF = antlr4.Token.EOF;
CMakeParser.T__0 = 1;
CMakeParser.T__1 = 2;
CMakeParser.Identifier = 3;
CMakeParser.Unquoted_argument = 4;
CMakeParser.Escape_sequence = 5;
CMakeParser.Quoted_argument = 6;
CMakeParser.Bracket_argument = 7;
CMakeParser.Bracket_comment = 8;
CMakeParser.Line_comment = 9;
CMakeParser.Newline = 10;
CMakeParser.Space = 11;

CMakeParser.RULE_file = 0;
CMakeParser.RULE_command_invocation = 1;
CMakeParser.RULE_single_argument = 2;
CMakeParser.RULE_compound_argument = 3;

function FileContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = CMakeParser.RULE_file;
  return this;
}

FileContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FileContext.prototype.constructor = FileContext;

FileContext.prototype.EOF = function() {
  return this.getToken(CMakeParser.EOF, 0);
};

FileContext.prototype.command_invocation = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(Command_invocationContext);
  } else {
    return this.getTypedRuleContext(Command_invocationContext, i);
  }
};

FileContext.prototype.enterRule = function(listener) {
  if(listener instanceof CMakeListener) {
    listener.enterFile(this);
  }
};

FileContext.prototype.exitRule = function(listener) {
  if(listener instanceof CMakeListener) {
    listener.exitFile(this);
  }
};

FileContext.prototype.accept = function(visitor) {
  if(visitor instanceof CMakeVisitor) {
    return visitor.visitFile(this);
  } else {
    return visitor.visitChildren(this);
  }
};

CMakeParser.FileContext = FileContext;

CMakeParser.prototype.file = function() {
  var localctx = new FileContext(this, this._ctx, this.state);
  this.enterRule(localctx, 0, CMakeParser.RULE_file);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 11;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === CMakeParser.Identifier) {
      this.state = 8;
      this.command_invocation();
      this.state = 13;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
    }
    this.state = 14;
    this.match(CMakeParser.EOF);
  } catch(re) {
    if(re instanceof antlr4.error.RecognitionException) {
      localctx.exception = re;
      this._errHandler.reportError(this, re);
      this._errHandler.recover(this, re);
    } else {
      throw re;
    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function Command_invocationContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = CMakeParser.RULE_command_invocation;
  return this;
}

Command_invocationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Command_invocationContext.prototype.constructor = Command_invocationContext;

Command_invocationContext.prototype.Identifier = function() {
  return this.getToken(CMakeParser.Identifier, 0);
};

Command_invocationContext.prototype.single_argument = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(Single_argumentContext);
  } else {
    return this.getTypedRuleContext(Single_argumentContext, i);
  }
};

Command_invocationContext.prototype.compound_argument = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(Compound_argumentContext);
  } else {
    return this.getTypedRuleContext(Compound_argumentContext, i);
  }
};

Command_invocationContext.prototype.enterRule = function(listener) {
  if(listener instanceof CMakeListener) {
    listener.enterCommand_invocation(this);
  }
};

Command_invocationContext.prototype.exitRule = function(listener) {
  if(listener instanceof CMakeListener) {
    listener.exitCommand_invocation(this);
  }
};

Command_invocationContext.prototype.accept = function(visitor) {
  if(visitor instanceof CMakeVisitor) {
    return visitor.visitCommand_invocation(this);
  } else {
    return visitor.visitChildren(this);
  }
};

CMakeParser.Command_invocationContext = Command_invocationContext;

CMakeParser.prototype.command_invocation = function() {
  var localctx = new Command_invocationContext(this, this._ctx, this.state);
  this.enterRule(localctx, 2, CMakeParser.RULE_command_invocation);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 16;
    this.match(CMakeParser.Identifier);
    this.state = 17;
    this.match(CMakeParser.T__0);
    this.state = 22;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while((_la & ~0x1f) == 0 && ((1 << _la) & ((1 << CMakeParser.T__0) | (1 << CMakeParser.Identifier) | (1 << CMakeParser.Unquoted_argument) | (1 << CMakeParser.Quoted_argument) | (1 << CMakeParser.Bracket_argument))) !== 0) {
      this.state = 20;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case CMakeParser.Identifier:
        case CMakeParser.Unquoted_argument:
        case CMakeParser.Quoted_argument:
        case CMakeParser.Bracket_argument:
          this.state = 18;
          this.single_argument();
          break;
        case CMakeParser.T__0:
          this.state = 19;
          this.compound_argument();
          break;
        default:
          throw new antlr4.error.NoViableAltException(this);
      }
      this.state = 24;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
    }
    this.state = 25;
    this.match(CMakeParser.T__1);
  } catch(re) {
    if(re instanceof antlr4.error.RecognitionException) {
      localctx.exception = re;
      this._errHandler.reportError(this, re);
      this._errHandler.recover(this, re);
    } else {
      throw re;
    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function Single_argumentContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = CMakeParser.RULE_single_argument;
  return this;
}

Single_argumentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Single_argumentContext.prototype.constructor = Single_argumentContext;

Single_argumentContext.prototype.Identifier = function() {
  return this.getToken(CMakeParser.Identifier, 0);
};

Single_argumentContext.prototype.Unquoted_argument = function() {
  return this.getToken(CMakeParser.Unquoted_argument, 0);
};

Single_argumentContext.prototype.Bracket_argument = function() {
  return this.getToken(CMakeParser.Bracket_argument, 0);
};

Single_argumentContext.prototype.Quoted_argument = function() {
  return this.getToken(CMakeParser.Quoted_argument, 0);
};

Single_argumentContext.prototype.enterRule = function(listener) {
  if(listener instanceof CMakeListener) {
    listener.enterSingle_argument(this);
  }
};

Single_argumentContext.prototype.exitRule = function(listener) {
  if(listener instanceof CMakeListener) {
    listener.exitSingle_argument(this);
  }
};

Single_argumentContext.prototype.accept = function(visitor) {
  if(visitor instanceof CMakeVisitor) {
    return visitor.visitSingle_argument(this);
  } else {
    return visitor.visitChildren(this);
  }
};

CMakeParser.Single_argumentContext = Single_argumentContext;

CMakeParser.prototype.single_argument = function() {
  var localctx = new Single_argumentContext(this, this._ctx, this.state);
  this.enterRule(localctx, 4, CMakeParser.RULE_single_argument);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 27;
    _la = this._input.LA(1);
    if(!((_la & ~0x1f) == 0 && ((1 << _la) & ((1 << CMakeParser.Identifier) | (1 << CMakeParser.Unquoted_argument) | (1 << CMakeParser.Quoted_argument) | (1 << CMakeParser.Bracket_argument))) !== 0)) {
      this._errHandler.recoverInline(this);
    } else {
      this._errHandler.reportMatch(this);
      this.consume();
    }
  } catch(re) {
    if(re instanceof antlr4.error.RecognitionException) {
      localctx.exception = re;
      this._errHandler.reportError(this, re);
      this._errHandler.recover(this, re);
    } else {
      throw re;
    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function Compound_argumentContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = CMakeParser.RULE_compound_argument;
  return this;
}

Compound_argumentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Compound_argumentContext.prototype.constructor = Compound_argumentContext;

Compound_argumentContext.prototype.single_argument = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(Single_argumentContext);
  } else {
    return this.getTypedRuleContext(Single_argumentContext, i);
  }
};

Compound_argumentContext.prototype.compound_argument = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(Compound_argumentContext);
  } else {
    return this.getTypedRuleContext(Compound_argumentContext, i);
  }
};

Compound_argumentContext.prototype.enterRule = function(listener) {
  if(listener instanceof CMakeListener) {
    listener.enterCompound_argument(this);
  }
};

Compound_argumentContext.prototype.exitRule = function(listener) {
  if(listener instanceof CMakeListener) {
    listener.exitCompound_argument(this);
  }
};

Compound_argumentContext.prototype.accept = function(visitor) {
  if(visitor instanceof CMakeVisitor) {
    return visitor.visitCompound_argument(this);
  } else {
    return visitor.visitChildren(this);
  }
};

CMakeParser.Compound_argumentContext = Compound_argumentContext;

CMakeParser.prototype.compound_argument = function() {
  var localctx = new Compound_argumentContext(this, this._ctx, this.state);
  this.enterRule(localctx, 6, CMakeParser.RULE_compound_argument);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 29;
    this.match(CMakeParser.T__0);
    this.state = 34;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while((_la & ~0x1f) == 0 && ((1 << _la) & ((1 << CMakeParser.T__0) | (1 << CMakeParser.Identifier) | (1 << CMakeParser.Unquoted_argument) | (1 << CMakeParser.Quoted_argument) | (1 << CMakeParser.Bracket_argument))) !== 0) {
      this.state = 32;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case CMakeParser.Identifier:
        case CMakeParser.Unquoted_argument:
        case CMakeParser.Quoted_argument:
        case CMakeParser.Bracket_argument:
          this.state = 30;
          this.single_argument();
          break;
        case CMakeParser.T__0:
          this.state = 31;
          this.compound_argument();
          break;
        default:
          throw new antlr4.error.NoViableAltException(this);
      }
      this.state = 36;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
    }
    this.state = 37;
    this.match(CMakeParser.T__1);
  } catch(re) {
    if(re instanceof antlr4.error.RecognitionException) {
      localctx.exception = re;
      this._errHandler.reportError(this, re);
      this._errHandler.recover(this, re);
    } else {
      throw re;
    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

exports.CMakeParser = CMakeParser;
