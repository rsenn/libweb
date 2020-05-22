// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/url.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');
var urlListener = require('./urlListener').urlListener;
var urlVisitor = require('./urlVisitor').urlVisitor;

var grammarFileName = 'url.g4';

var serializedATN = [
  '\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964',
  '\u0003\u0012\u0098\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004',
  '\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007',
  '\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f',
  '\u0004\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010\t\u0010',
  '\u0004\u0011\t\u0011\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0003',
  '\u0003\u0003\u0003\u0003\u0005\u0003)\n\u0003\u0003\u0003\u0003\u0003',
  '\u0003\u0003\u0005\u0003.\n\u0003\u0003\u0003\u0003\u0003\u0005\u0003',
  '2\n\u0003\u0005\u00034\n\u0003\u0003\u0003\u0005\u00037\n\u0003\u0003',
  '\u0003\u0005\u0003:\n\u0003\u0003\u0003\u0005\u0003=\n\u0003\u0003\u0004',
  '\u0003\u0004\u0003\u0005\u0005\u0005B\n\u0005\u0003\u0005\u0003\u0005',
  '\u0003\u0006\u0003\u0006\u0003\u0006\u0007\u0006I\n\u0006\f\u0006\u000e',
  '\u0006L\u000b\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006',
  '\u0005\u0006R\n\u0006\u0003\u0007\u0005\u0007U\n\u0007\u0003\u0007\u0003',
  '\u0007\u0005\u0007Y\n\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0005',
  '\u0007^\n\u0007\u0007\u0007`\n\u0007\f\u0007\u000e\u0007c\u000b\u0007',
  '\u0003\b\u0003\b\u0003\t\u0003\t\u0003\t\u0007\tj\n\t\f\t\u000e\tm\u000b',
  '\t\u0003\t\u0005\tp\n\t\u0003\n\u0003\n\u0003\u000b\u0003\u000b\u0003',
  '\u000b\u0005\u000bw\n\u000b\u0003\u000b\u0003\u000b\u0003\f\u0003\f',
  '\u0003\r\u0003\r\u0003\r\u0005\r\u0080\n\r\u0003\u000e\u0003\u000e\u0003',
  '\u000e\u0003\u000f\u0003\u000f\u0003\u000f\u0007\u000f\u0088\n\u000f',
  '\f\u000f\u000e\u000f\u008b\u000b\u000f\u0003\u0010\u0003\u0010\u0003',
  '\u0010\u0003\u0010\u0003\u0010\u0005\u0010\u0092\n\u0010\u0005\u0010',
  '\u0094\n\u0010\u0003\u0011\u0003\u0011\u0003\u0011\u0002\u0002\u0012',
  '\u0002\u0004\u0006\b\n\f\u000e\u0010\u0012\u0014\u0016\u0018\u001a\u001c',
  '\u001e \u0002\u0003\u0004\u0002\u0004\u0004\t\t\u0002\u009d\u0002"',
  '\u0003\u0002\u0002\u0002\u0004%\u0003\u0002\u0002\u0002\u0006>\u0003',
  '\u0002\u0002\u0002\bA\u0003\u0002\u0002\u0002\nQ\u0003\u0002\u0002\u0002',
  '\fT\u0003\u0002\u0002\u0002\u000ed\u0003\u0002\u0002\u0002\u0010f\u0003',
  '\u0002\u0002\u0002\u0012q\u0003\u0002\u0002\u0002\u0014s\u0003\u0002',
  '\u0002\u0002\u0016z\u0003\u0002\u0002\u0002\u0018|\u0003\u0002\u0002',
  '\u0002\u001a\u0081\u0003\u0002\u0002\u0002\u001c\u0084\u0003\u0002\u0002',
  '\u0002\u001e\u008c\u0003\u0002\u0002\u0002 \u0095\u0003\u0002\u0002',
  '\u0002"#\u0005\u0004\u0003\u0002#$\u0007\u0002\u0002\u0003$\u0003\u0003',
  '\u0002\u0002\u0002%&\u0005\u0006\u0004\u0002&(\u0007\u0003\u0002\u0002',
  "')\u0005\u0014\u000b\u0002('\u0003\u0002\u0002\u0002()\u0003\u0002",
  '\u0002\u0002)*\u0003\u0002\u0002\u0002*-\u0005\b\u0005\u0002+,\u0007',
  '\u0004\u0002\u0002,.\u0005\u000e\b\u0002-+\u0003\u0002\u0002\u0002-',
  '.\u0003\u0002\u0002\u0002.3\u0003\u0002\u0002\u0002/1\u0007\u0005\u0002',
  '\u000202\u0005\u0010\t\u000210\u0003\u0002\u0002\u000212\u0003\u0002',
  '\u0002\u000224\u0003\u0002\u0002\u00023/\u0003\u0002\u0002\u000234\u0003',
  '\u0002\u0002\u000246\u0003\u0002\u0002\u000257\u0005\u001a\u000e\u0002',
  '65\u0003\u0002\u0002\u000267\u0003\u0002\u0002\u000279\u0003\u0002\u0002',
  '\u00028:\u0005\u0018\r\u000298\u0003\u0002\u0002\u00029:\u0003\u0002',
  '\u0002\u0002:<\u0003\u0002\u0002\u0002;=\u0007\u0012\u0002\u0002<;\u0003',
  '\u0002\u0002\u0002<=\u0003\u0002\u0002\u0002=\u0005\u0003\u0002\u0002',
  '\u0002>?\u0005 \u0011\u0002?\u0007\u0003\u0002\u0002\u0002@B\u0007\u0005',
  '\u0002\u0002A@\u0003\u0002\u0002\u0002AB\u0003\u0002\u0002\u0002BC\u0003',
  '\u0002\u0002\u0002CD\u0005\n\u0006\u0002D\t\u0003\u0002\u0002\u0002',
  'EJ\u0005 \u0011\u0002FG\u0007\u0006\u0002\u0002GI\u0005 \u0011\u0002',
  'HF\u0003\u0002\u0002\u0002IL\u0003\u0002\u0002\u0002JH\u0003\u0002\u0002',
  '\u0002JK\u0003\u0002\u0002\u0002KR\u0003\u0002\u0002\u0002LJ\u0003\u0002',
  '\u0002\u0002MN\u0007\u0007\u0002\u0002NO\u0005\f\u0007\u0002OP\u0007',
  '\b\u0002\u0002PR\u0003\u0002\u0002\u0002QE\u0003\u0002\u0002\u0002Q',
  'M\u0003\u0002\u0002\u0002R\u000b\u0003\u0002\u0002\u0002SU\u0007\t\u0002',
  '\u0002TS\u0003\u0002\u0002\u0002TU\u0003\u0002\u0002\u0002UX\u0003\u0002',
  '\u0002\u0002VY\u0005 \u0011\u0002WY\u0007\u000f\u0002\u0002XV\u0003',
  '\u0002\u0002\u0002XW\u0003\u0002\u0002\u0002Ya\u0003\u0002\u0002\u0002',
  'Z]\t\u0002\u0002\u0002[^\u0005 \u0011\u0002\\^\u0007\u000f\u0002\u0002',
  '][\u0003\u0002\u0002\u0002]\\\u0003\u0002\u0002\u0002^`\u0003\u0002',
  '\u0002\u0002_Z\u0003\u0002\u0002\u0002`c\u0003\u0002\u0002\u0002a_\u0003',
  '\u0002\u0002\u0002ab\u0003\u0002\u0002\u0002b\r\u0003\u0002\u0002\u0002',
  'ca\u0003\u0002\u0002\u0002de\u0007\u000f\u0002\u0002e\u000f\u0003\u0002',
  '\u0002\u0002fk\u0005 \u0011\u0002gh\u0007\u0005\u0002\u0002hj\u0005',
  ' \u0011\u0002ig\u0003\u0002\u0002\u0002jm\u0003\u0002\u0002\u0002ki',
  '\u0003\u0002\u0002\u0002kl\u0003\u0002\u0002\u0002lo\u0003\u0002\u0002',
  '\u0002mk\u0003\u0002\u0002\u0002np\u0007\u0005\u0002\u0002on\u0003\u0002',
  '\u0002\u0002op\u0003\u0002\u0002\u0002p\u0011\u0003\u0002\u0002\u0002',
  'qr\u0005 \u0011\u0002r\u0013\u0003\u0002\u0002\u0002sv\u0005\u0012\n',
  '\u0002tu\u0007\u0004\u0002\u0002uw\u0005\u0016\f\u0002vt\u0003\u0002',
  '\u0002\u0002vw\u0003\u0002\u0002\u0002wx\u0003\u0002\u0002\u0002xy\u0007',
  '\n\u0002\u0002y\u0015\u0003\u0002\u0002\u0002z{\u0005 \u0011\u0002{',
  '\u0017\u0003\u0002\u0002\u0002|\u007f\u0007\u000b\u0002\u0002}\u0080',
  '\u0005 \u0011\u0002~\u0080\u0007\u000f\u0002\u0002\u007f}\u0003\u0002',
  '\u0002\u0002\u007f~\u0003\u0002\u0002\u0002\u0080\u0019\u0003\u0002',
  '\u0002\u0002\u0081\u0082\u0007\f\u0002\u0002\u0082\u0083\u0005\u001c',
  '\u000f\u0002\u0083\u001b\u0003\u0002\u0002\u0002\u0084\u0089\u0005\u001e',
  '\u0010\u0002\u0085\u0086\u0007\r\u0002\u0002\u0086\u0088\u0005\u001e',
  '\u0010\u0002\u0087\u0085\u0003\u0002\u0002\u0002\u0088\u008b\u0003\u0002',
  '\u0002\u0002\u0089\u0087\u0003\u0002\u0002\u0002\u0089\u008a\u0003\u0002',
  '\u0002\u0002\u008a\u001d\u0003\u0002\u0002\u0002\u008b\u0089\u0003\u0002',
  '\u0002\u0002\u008c\u0093\u0005 \u0011\u0002\u008d\u0091\u0007\u000e',
  '\u0002\u0002\u008e\u0092\u0005 \u0011\u0002\u008f\u0092\u0007\u000f',
  '\u0002\u0002\u0090\u0092\u0007\u0010\u0002\u0002\u0091\u008e\u0003\u0002',
  '\u0002\u0002\u0091\u008f\u0003\u0002\u0002\u0002\u0091\u0090\u0003\u0002',
  '\u0002\u0002\u0092\u0094\u0003\u0002\u0002\u0002\u0093\u008d\u0003\u0002',
  '\u0002\u0002\u0093\u0094\u0003\u0002\u0002\u0002\u0094\u001f\u0003\u0002',
  '\u0002\u0002\u0095\u0096\u0007\u0011\u0002\u0002\u0096!\u0003\u0002',
  '\u0002\u0002\u0017(-1369<AJQTX]akov\u007f\u0089\u0091\u0093'
].join('');

var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map(function(ds, index) {
  return new antlr4.dfa.DFA(ds, index);
});

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [null, "'://'", "':'", "'/'", "'.'", "'['", "']'", "'::'", "'@'", "'#'", "'?'", "'&'", "'='"];

var symbolicNames = [null, null, null, null, null, null, null, null, null, null, null, null, null, 'DIGITS', 'HEX', 'STRING', 'WS'];

var ruleNames = ['url', 'uri', 'scheme', 'host', 'hostname', 'v6host', 'port', 'path', 'user', 'login', 'password', 'frag', 'query', 'search', 'searchparameter', 'string'];

function urlParser(input) {
  antlr4.Parser.call(this, input);
  this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
  this.ruleNames = ruleNames;
  this.literalNames = literalNames;
  this.symbolicNames = symbolicNames;
  return this;
}

urlParser.prototype = Object.create(antlr4.Parser.prototype);
urlParser.prototype.constructor = urlParser;

Object.defineProperty(urlParser.prototype, 'atn', {
  get: function() {
    return atn;
  }
});

urlParser.EOF = antlr4.Token.EOF;
urlParser.T__0 = 1;
urlParser.T__1 = 2;
urlParser.T__2 = 3;
urlParser.T__3 = 4;
urlParser.T__4 = 5;
urlParser.T__5 = 6;
urlParser.T__6 = 7;
urlParser.T__7 = 8;
urlParser.T__8 = 9;
urlParser.T__9 = 10;
urlParser.T__10 = 11;
urlParser.T__11 = 12;
urlParser.DIGITS = 13;
urlParser.HEX = 14;
urlParser.STRING = 15;
urlParser.WS = 16;

urlParser.RULE_url = 0;
urlParser.RULE_uri = 1;
urlParser.RULE_scheme = 2;
urlParser.RULE_host = 3;
urlParser.RULE_hostname = 4;
urlParser.RULE_v6host = 5;
urlParser.RULE_port = 6;
urlParser.RULE_path = 7;
urlParser.RULE_user = 8;
urlParser.RULE_login = 9;
urlParser.RULE_password = 10;
urlParser.RULE_frag = 11;
urlParser.RULE_query = 12;
urlParser.RULE_search = 13;
urlParser.RULE_searchparameter = 14;
urlParser.RULE_string = 15;

function UrlContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_url;
  return this;
}

UrlContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UrlContext.prototype.constructor = UrlContext;

UrlContext.prototype.uri = function() {
  return this.getTypedRuleContext(UriContext, 0);
};

UrlContext.prototype.EOF = function() {
  return this.getToken(urlParser.EOF, 0);
};

UrlContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterUrl(this);
  }
};

UrlContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitUrl(this);
  }
};

UrlContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitUrl(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.UrlContext = UrlContext;

urlParser.prototype.url = function() {
  var localctx = new UrlContext(this, this._ctx, this.state);
  this.enterRule(localctx, 0, urlParser.RULE_url);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 32;
    this.uri();
    this.state = 33;
    this.match(urlParser.EOF);
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

function UriContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_uri;
  return this;
}

UriContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UriContext.prototype.constructor = UriContext;

UriContext.prototype.scheme = function() {
  return this.getTypedRuleContext(SchemeContext, 0);
};

UriContext.prototype.host = function() {
  return this.getTypedRuleContext(HostContext, 0);
};

UriContext.prototype.login = function() {
  return this.getTypedRuleContext(LoginContext, 0);
};

UriContext.prototype.port = function() {
  return this.getTypedRuleContext(PortContext, 0);
};

UriContext.prototype.query = function() {
  return this.getTypedRuleContext(QueryContext, 0);
};

UriContext.prototype.frag = function() {
  return this.getTypedRuleContext(FragContext, 0);
};

UriContext.prototype.WS = function() {
  return this.getToken(urlParser.WS, 0);
};

UriContext.prototype.path = function() {
  return this.getTypedRuleContext(PathContext, 0);
};

UriContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterUri(this);
  }
};

UriContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitUri(this);
  }
};

UriContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitUri(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.UriContext = UriContext;

urlParser.prototype.uri = function() {
  var localctx = new UriContext(this, this._ctx, this.state);
  this.enterRule(localctx, 2, urlParser.RULE_uri);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 35;
    this.scheme();
    this.state = 36;
    this.match(urlParser.T__0);
    this.state = 38;
    this._errHandler.sync(this);
    var la_ = this._interp.adaptivePredict(this._input, 0, this._ctx);
    if(la_ === 1) {
      this.state = 37;
      this.login();
    }
    this.state = 40;
    this.host();
    this.state = 43;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === urlParser.T__1) {
      this.state = 41;
      this.match(urlParser.T__1);
      this.state = 42;
      this.port();
    }

    this.state = 49;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === urlParser.T__2) {
      this.state = 45;
      this.match(urlParser.T__2);
      this.state = 47;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
      if(_la === urlParser.STRING) {
        this.state = 46;
        this.path();
      }
    }

    this.state = 52;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === urlParser.T__9) {
      this.state = 51;
      this.query();
    }

    this.state = 55;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === urlParser.T__8) {
      this.state = 54;
      this.frag();
    }

    this.state = 58;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === urlParser.WS) {
      this.state = 57;
      this.match(urlParser.WS);
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

function SchemeContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_scheme;
  return this;
}

SchemeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SchemeContext.prototype.constructor = SchemeContext;

SchemeContext.prototype.string = function() {
  return this.getTypedRuleContext(StringContext, 0);
};

SchemeContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterScheme(this);
  }
};

SchemeContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitScheme(this);
  }
};

SchemeContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitScheme(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.SchemeContext = SchemeContext;

urlParser.prototype.scheme = function() {
  var localctx = new SchemeContext(this, this._ctx, this.state);
  this.enterRule(localctx, 4, urlParser.RULE_scheme);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 60;
    this.string();
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

function HostContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_host;
  return this;
}

HostContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
HostContext.prototype.constructor = HostContext;

HostContext.prototype.hostname = function() {
  return this.getTypedRuleContext(HostnameContext, 0);
};

HostContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterHost(this);
  }
};

HostContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitHost(this);
  }
};

HostContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitHost(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.HostContext = HostContext;

urlParser.prototype.host = function() {
  var localctx = new HostContext(this, this._ctx, this.state);
  this.enterRule(localctx, 6, urlParser.RULE_host);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 63;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === urlParser.T__2) {
      this.state = 62;
      this.match(urlParser.T__2);
    }

    this.state = 65;
    this.hostname();
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

function HostnameContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_hostname;
  return this;
}

HostnameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
HostnameContext.prototype.constructor = HostnameContext;

HostnameContext.prototype.copyFrom = function(ctx) {
  antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};

function IPv6HostContext(parser, ctx) {
  HostnameContext.call(this, parser);
  HostnameContext.prototype.copyFrom.call(this, ctx);
  return this;
}

IPv6HostContext.prototype = Object.create(HostnameContext.prototype);
IPv6HostContext.prototype.constructor = IPv6HostContext;

urlParser.IPv6HostContext = IPv6HostContext;

IPv6HostContext.prototype.v6host = function() {
  return this.getTypedRuleContext(V6hostContext, 0);
};
IPv6HostContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterIPv6Host(this);
  }
};

IPv6HostContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitIPv6Host(this);
  }
};

IPv6HostContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitIPv6Host(this);
  } else {
    return visitor.visitChildren(this);
  }
};

function DomainNameOrIPv4HostContext(parser, ctx) {
  HostnameContext.call(this, parser);
  HostnameContext.prototype.copyFrom.call(this, ctx);
  return this;
}

DomainNameOrIPv4HostContext.prototype = Object.create(HostnameContext.prototype);
DomainNameOrIPv4HostContext.prototype.constructor = DomainNameOrIPv4HostContext;

urlParser.DomainNameOrIPv4HostContext = DomainNameOrIPv4HostContext;

DomainNameOrIPv4HostContext.prototype.string = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(StringContext);
  } else {
    return this.getTypedRuleContext(StringContext, i);
  }
};
DomainNameOrIPv4HostContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterDomainNameOrIPv4Host(this);
  }
};

DomainNameOrIPv4HostContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitDomainNameOrIPv4Host(this);
  }
};

DomainNameOrIPv4HostContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitDomainNameOrIPv4Host(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.HostnameContext = HostnameContext;

urlParser.prototype.hostname = function() {
  var localctx = new HostnameContext(this, this._ctx, this.state);
  this.enterRule(localctx, 8, urlParser.RULE_hostname);
  var _la = 0; // Token type
  try {
    this.state = 79;
    this._errHandler.sync(this);
    switch (this._input.LA(1)) {
      case urlParser.STRING:
        localctx = new DomainNameOrIPv4HostContext(this, localctx);
        this.enterOuterAlt(localctx, 1);
        this.state = 67;
        this.string();
        this.state = 72;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la === urlParser.T__3) {
          this.state = 68;
          this.match(urlParser.T__3);
          this.state = 69;
          this.string();
          this.state = 74;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        break;
      case urlParser.T__4:
        localctx = new IPv6HostContext(this, localctx);
        this.enterOuterAlt(localctx, 2);
        this.state = 75;
        this.match(urlParser.T__4);
        this.state = 76;
        this.v6host();
        this.state = 77;
        this.match(urlParser.T__5);
        break;
      default:
        throw new antlr4.error.NoViableAltException(this);
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

function V6hostContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_v6host;
  return this;
}

V6hostContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
V6hostContext.prototype.constructor = V6hostContext;

V6hostContext.prototype.string = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(StringContext);
  } else {
    return this.getTypedRuleContext(StringContext, i);
  }
};

V6hostContext.prototype.DIGITS = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(urlParser.DIGITS);
  } else {
    return this.getToken(urlParser.DIGITS, i);
  }
};

V6hostContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterV6host(this);
  }
};

V6hostContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitV6host(this);
  }
};

V6hostContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitV6host(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.V6hostContext = V6hostContext;

urlParser.prototype.v6host = function() {
  var localctx = new V6hostContext(this, this._ctx, this.state);
  this.enterRule(localctx, 10, urlParser.RULE_v6host);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 82;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === urlParser.T__6) {
      this.state = 81;
      this.match(urlParser.T__6);
    }

    this.state = 86;
    this._errHandler.sync(this);
    switch (this._input.LA(1)) {
      case urlParser.STRING:
        this.state = 84;
        this.string();
        break;
      case urlParser.DIGITS:
        this.state = 85;
        this.match(urlParser.DIGITS);
        break;
      default:
        throw new antlr4.error.NoViableAltException(this);
    }
    this.state = 95;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === urlParser.T__1 || _la === urlParser.T__6) {
      this.state = 88;
      _la = this._input.LA(1);
      if(!(_la === urlParser.T__1 || _la === urlParser.T__6)) {
        this._errHandler.recoverInline(this);
      } else {
        this._errHandler.reportMatch(this);
        this.consume();
      }
      this.state = 91;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case urlParser.STRING:
          this.state = 89;
          this.string();
          break;
        case urlParser.DIGITS:
          this.state = 90;
          this.match(urlParser.DIGITS);
          break;
        default:
          throw new antlr4.error.NoViableAltException(this);
      }
      this.state = 97;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
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

function PortContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_port;
  return this;
}

PortContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PortContext.prototype.constructor = PortContext;

PortContext.prototype.DIGITS = function() {
  return this.getToken(urlParser.DIGITS, 0);
};

PortContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterPort(this);
  }
};

PortContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitPort(this);
  }
};

PortContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitPort(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.PortContext = PortContext;

urlParser.prototype.port = function() {
  var localctx = new PortContext(this, this._ctx, this.state);
  this.enterRule(localctx, 12, urlParser.RULE_port);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 98;
    this.match(urlParser.DIGITS);
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

function PathContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_path;
  return this;
}

PathContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PathContext.prototype.constructor = PathContext;

PathContext.prototype.string = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(StringContext);
  } else {
    return this.getTypedRuleContext(StringContext, i);
  }
};

PathContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterPath(this);
  }
};

PathContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitPath(this);
  }
};

PathContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitPath(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.PathContext = PathContext;

urlParser.prototype.path = function() {
  var localctx = new PathContext(this, this._ctx, this.state);
  this.enterRule(localctx, 14, urlParser.RULE_path);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 100;
    this.string();
    this.state = 105;
    this._errHandler.sync(this);
    var _alt = this._interp.adaptivePredict(this._input, 14, this._ctx);
    while(_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
      if(_alt === 1) {
        this.state = 101;
        this.match(urlParser.T__2);
        this.state = 102;
        this.string();
      }
      this.state = 107;
      this._errHandler.sync(this);
      _alt = this._interp.adaptivePredict(this._input, 14, this._ctx);
    }

    this.state = 109;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === urlParser.T__2) {
      this.state = 108;
      this.match(urlParser.T__2);
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

function UserContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_user;
  return this;
}

UserContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UserContext.prototype.constructor = UserContext;

UserContext.prototype.string = function() {
  return this.getTypedRuleContext(StringContext, 0);
};

UserContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterUser(this);
  }
};

UserContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitUser(this);
  }
};

UserContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitUser(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.UserContext = UserContext;

urlParser.prototype.user = function() {
  var localctx = new UserContext(this, this._ctx, this.state);
  this.enterRule(localctx, 16, urlParser.RULE_user);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 111;
    this.string();
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

function LoginContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_login;
  return this;
}

LoginContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LoginContext.prototype.constructor = LoginContext;

LoginContext.prototype.user = function() {
  return this.getTypedRuleContext(UserContext, 0);
};

LoginContext.prototype.password = function() {
  return this.getTypedRuleContext(PasswordContext, 0);
};

LoginContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterLogin(this);
  }
};

LoginContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitLogin(this);
  }
};

LoginContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitLogin(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.LoginContext = LoginContext;

urlParser.prototype.login = function() {
  var localctx = new LoginContext(this, this._ctx, this.state);
  this.enterRule(localctx, 18, urlParser.RULE_login);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 113;
    this.user();
    this.state = 116;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === urlParser.T__1) {
      this.state = 114;
      this.match(urlParser.T__1);
      this.state = 115;
      this.password();
    }

    this.state = 118;
    this.match(urlParser.T__7);
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

function PasswordContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_password;
  return this;
}

PasswordContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PasswordContext.prototype.constructor = PasswordContext;

PasswordContext.prototype.string = function() {
  return this.getTypedRuleContext(StringContext, 0);
};

PasswordContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterPassword(this);
  }
};

PasswordContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitPassword(this);
  }
};

PasswordContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitPassword(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.PasswordContext = PasswordContext;

urlParser.prototype.password = function() {
  var localctx = new PasswordContext(this, this._ctx, this.state);
  this.enterRule(localctx, 20, urlParser.RULE_password);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 120;
    this.string();
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

function FragContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_frag;
  return this;
}

FragContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FragContext.prototype.constructor = FragContext;

FragContext.prototype.string = function() {
  return this.getTypedRuleContext(StringContext, 0);
};

FragContext.prototype.DIGITS = function() {
  return this.getToken(urlParser.DIGITS, 0);
};

FragContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterFrag(this);
  }
};

FragContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitFrag(this);
  }
};

FragContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitFrag(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.FragContext = FragContext;

urlParser.prototype.frag = function() {
  var localctx = new FragContext(this, this._ctx, this.state);
  this.enterRule(localctx, 22, urlParser.RULE_frag);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 122;
    this.match(urlParser.T__8);
    this.state = 125;
    this._errHandler.sync(this);
    switch (this._input.LA(1)) {
      case urlParser.STRING:
        this.state = 123;
        this.string();
        break;
      case urlParser.DIGITS:
        this.state = 124;
        this.match(urlParser.DIGITS);
        break;
      default:
        throw new antlr4.error.NoViableAltException(this);
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

function QueryContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_query;
  return this;
}

QueryContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
QueryContext.prototype.constructor = QueryContext;

QueryContext.prototype.search = function() {
  return this.getTypedRuleContext(SearchContext, 0);
};

QueryContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterQuery(this);
  }
};

QueryContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitQuery(this);
  }
};

QueryContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitQuery(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.QueryContext = QueryContext;

urlParser.prototype.query = function() {
  var localctx = new QueryContext(this, this._ctx, this.state);
  this.enterRule(localctx, 24, urlParser.RULE_query);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 127;
    this.match(urlParser.T__9);
    this.state = 128;
    this.search();
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

function SearchContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_search;
  return this;
}

SearchContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SearchContext.prototype.constructor = SearchContext;

SearchContext.prototype.searchparameter = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(SearchparameterContext);
  } else {
    return this.getTypedRuleContext(SearchparameterContext, i);
  }
};

SearchContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterSearch(this);
  }
};

SearchContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitSearch(this);
  }
};

SearchContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitSearch(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.SearchContext = SearchContext;

urlParser.prototype.search = function() {
  var localctx = new SearchContext(this, this._ctx, this.state);
  this.enterRule(localctx, 26, urlParser.RULE_search);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 130;
    this.searchparameter();
    this.state = 135;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === urlParser.T__10) {
      this.state = 131;
      this.match(urlParser.T__10);
      this.state = 132;
      this.searchparameter();
      this.state = 137;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
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

function SearchparameterContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_searchparameter;
  return this;
}

SearchparameterContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SearchparameterContext.prototype.constructor = SearchparameterContext;

SearchparameterContext.prototype.string = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(StringContext);
  } else {
    return this.getTypedRuleContext(StringContext, i);
  }
};

SearchparameterContext.prototype.DIGITS = function() {
  return this.getToken(urlParser.DIGITS, 0);
};

SearchparameterContext.prototype.HEX = function() {
  return this.getToken(urlParser.HEX, 0);
};

SearchparameterContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterSearchparameter(this);
  }
};

SearchparameterContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitSearchparameter(this);
  }
};

SearchparameterContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitSearchparameter(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.SearchparameterContext = SearchparameterContext;

urlParser.prototype.searchparameter = function() {
  var localctx = new SearchparameterContext(this, this._ctx, this.state);
  this.enterRule(localctx, 28, urlParser.RULE_searchparameter);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 138;
    this.string();
    this.state = 145;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === urlParser.T__11) {
      this.state = 139;
      this.match(urlParser.T__11);
      this.state = 143;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case urlParser.STRING:
          this.state = 140;
          this.string();
          break;
        case urlParser.DIGITS:
          this.state = 141;
          this.match(urlParser.DIGITS);
          break;
        case urlParser.HEX:
          this.state = 142;
          this.match(urlParser.HEX);
          break;
        default:
          throw new antlr4.error.NoViableAltException(this);
      }
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

function StringContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = urlParser.RULE_string;
  return this;
}

StringContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
StringContext.prototype.constructor = StringContext;

StringContext.prototype.STRING = function() {
  return this.getToken(urlParser.STRING, 0);
};

StringContext.prototype.enterRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.enterString(this);
  }
};

StringContext.prototype.exitRule = function(listener) {
  if(listener instanceof urlListener) {
    listener.exitString(this);
  }
};

StringContext.prototype.accept = function(visitor) {
  if(visitor instanceof urlVisitor) {
    return visitor.visitString(this);
  } else {
    return visitor.visitChildren(this);
  }
};

urlParser.StringContext = StringContext;

urlParser.prototype.string = function() {
  var localctx = new StringContext(this, this._ctx, this.state);
  this.enterRule(localctx, 30, urlParser.RULE_string);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 147;
    this.match(urlParser.STRING);
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

exports.urlParser = urlParser;
