// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/XMLParser.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');
var XMLParserListener = require('./XMLParserListener').XMLParserListener;
var XMLParserVisitor = require('./XMLParserVisitor').XMLParserVisitor;

var grammarFileName = 'XMLParser.g4';

var serializedATN = [
  '\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964',
  '\u0003\u0014b\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t',
  '\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004',
  '\b\t\b\u0004\t\t\t\u0003\u0002\u0005\u0002\u0014\n\u0002\u0003\u0002',
  '\u0007\u0002\u0017\n\u0002\f\u0002\u000e\u0002\u001a\u000b\u0002\u0003',
  '\u0002\u0003\u0002\u0007\u0002\u001e\n\u0002\f\u0002\u000e\u0002!\u000b',
  '\u0002\u0003\u0003\u0003\u0003\u0007\u0003%\n\u0003\f\u0003\u000e\u0003',
  '(\u000b\u0003\u0003\u0003\u0003\u0003\u0003\u0004\u0005\u0004-\n\u0004',
  '\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0005\u0004',
  '4\n\u0004\u0003\u0004\u0005\u00047\n\u0004\u0007\u00049\n\u0004\f\u0004',
  '\u000e\u0004<\u000b\u0004\u0003\u0005\u0003\u0005\u0003\u0005\u0007',
  '\u0005A\n\u0005\f\u0005\u000e\u0005D\u000b\u0005\u0003\u0005\u0003\u0005',
  '\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005',
  '\u0003\u0005\u0003\u0005\u0007\u0005P\n\u0005\f\u0005\u000e\u0005S\u000b',
  '\u0005\u0003\u0005\u0005\u0005V\n\u0005\u0003\u0006\u0003\u0006\u0003',
  '\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0003\b\u0003\b\u0003\t\u0003',
  '\t\u0003\t\u0002\u0002\n\u0002\u0004\u0006\b\n\f\u000e\u0010\u0002\u0005',
  '\u0003\u0002\u0006\u0007\u0004\u0002\b\b\u000b\u000b\u0005\u0002\u0003',
  '\u0003\b\b\u0014\u0014\u0002g\u0002\u0013\u0003\u0002\u0002\u0002\u0004',
  '"\u0003\u0002\u0002\u0002\u0006,\u0003\u0002\u0002\u0002\bU\u0003\u0002',
  '\u0002\u0002\nW\u0003\u0002\u0002\u0002\fY\u0003\u0002\u0002\u0002\u000e',
  ']\u0003\u0002\u0002\u0002\u0010_\u0003\u0002\u0002\u0002\u0012\u0014',
  '\u0005\u0004\u0003\u0002\u0013\u0012\u0003\u0002\u0002\u0002\u0013\u0014',
  '\u0003\u0002\u0002\u0002\u0014\u0018\u0003\u0002\u0002\u0002\u0015\u0017',
  '\u0005\u0010\t\u0002\u0016\u0015\u0003\u0002\u0002\u0002\u0017\u001a',
  '\u0003\u0002\u0002\u0002\u0018\u0016\u0003\u0002\u0002\u0002\u0018\u0019',
  '\u0003\u0002\u0002\u0002\u0019\u001b\u0003\u0002\u0002\u0002\u001a\u0018',
  '\u0003\u0002\u0002\u0002\u001b\u001f\u0005\b\u0005\u0002\u001c\u001e',
  '\u0005\u0010\t\u0002\u001d\u001c\u0003\u0002\u0002\u0002\u001e!\u0003',
  '\u0002\u0002\u0002\u001f\u001d\u0003\u0002\u0002\u0002\u001f \u0003',
  '\u0002\u0002\u0002 \u0003\u0003\u0002\u0002\u0002!\u001f\u0003\u0002',
  '\u0002\u0002"&\u0007\n\u0002\u0002#%\u0005\f\u0007\u0002$#\u0003\u0002',
  "\u0002\u0002%(\u0003\u0002\u0002\u0002&$\u0003\u0002\u0002\u0002&'",
  "\u0003\u0002\u0002\u0002')\u0003\u0002\u0002\u0002(&\u0003\u0002\u0002",
  '\u0002)*\u0007\r\u0002\u0002*\u0005\u0003\u0002\u0002\u0002+-\u0005',
  '\u000e\b\u0002,+\u0003\u0002\u0002\u0002,-\u0003\u0002\u0002\u0002-',
  ':\u0003\u0002\u0002\u0002.4\u0005\b\u0005\u0002/4\u0005\n\u0006\u0002',
  '04\u0007\u0004\u0002\u000214\u0007\u0014\u0002\u000224\u0007\u0003\u0002',
  '\u00023.\u0003\u0002\u0002\u00023/\u0003\u0002\u0002\u000230\u0003\u0002',
  '\u0002\u000231\u0003\u0002\u0002\u000232\u0003\u0002\u0002\u000246\u0003',
  '\u0002\u0002\u000257\u0005\u000e\b\u000265\u0003\u0002\u0002\u00026',
  '7\u0003\u0002\u0002\u000279\u0003\u0002\u0002\u000283\u0003\u0002\u0002',
  '\u00029<\u0003\u0002\u0002\u0002:8\u0003\u0002\u0002\u0002:;\u0003\u0002',
  '\u0002\u0002;\u0007\u0003\u0002\u0002\u0002<:\u0003\u0002\u0002\u0002',
  '=>\u0007\t\u0002\u0002>B\u0007\u0012\u0002\u0002?A\u0005\f\u0007\u0002',
  '@?\u0003\u0002\u0002\u0002AD\u0003\u0002\u0002\u0002B@\u0003\u0002\u0002',
  '\u0002BC\u0003\u0002\u0002\u0002CE\u0003\u0002\u0002\u0002DB\u0003\u0002',
  '\u0002\u0002EF\u0007\f\u0002\u0002FG\u0005\u0006\u0004\u0002GH\u0007',
  '\t\u0002\u0002HI\u0007\u000f\u0002\u0002IJ\u0007\u0012\u0002\u0002J',
  'K\u0007\f\u0002\u0002KV\u0003\u0002\u0002\u0002LM\u0007\t\u0002\u0002',
  'MQ\u0007\u0012\u0002\u0002NP\u0005\f\u0007\u0002ON\u0003\u0002\u0002',
  '\u0002PS\u0003\u0002\u0002\u0002QO\u0003\u0002\u0002\u0002QR\u0003\u0002',
  '\u0002\u0002RT\u0003\u0002\u0002\u0002SQ\u0003\u0002\u0002\u0002TV\u0007',
  '\u000e\u0002\u0002U=\u0003\u0002\u0002\u0002UL\u0003\u0002\u0002\u0002',
  'V\t\u0003\u0002\u0002\u0002WX\t\u0002\u0002\u0002X\u000b\u0003\u0002',
  '\u0002\u0002YZ\u0007\u0012\u0002\u0002Z[\u0007\u0010\u0002\u0002[\\',
  '\u0007\u0011\u0002\u0002\\\r\u0003\u0002\u0002\u0002]^\t\u0003\u0002',
  '\u0002^\u000f\u0003\u0002\u0002\u0002_`\t\u0004\u0002\u0002`\u0011\u0003',
  '\u0002\u0002\u0002\r\u0013\u0018\u001f&,36:BQU'
].join('');

var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map(function(ds, index) {
  return new antlr4.dfa.DFA(ds, index);
});

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [null, null, null, null, null, null, null, "'<'", null, null, "'>'", null, "'/>'", "'/'", "'='"];

var symbolicNames = [null, 'COMMENT', 'CDATA', 'DTD', 'EntityRef', 'CharRef', 'SEA_WS', 'OPEN', 'XMLDeclOpen', 'TEXT', 'CLOSE', 'SPECIAL_CLOSE', 'SLASH_CLOSE', 'SLASH', 'EQUALS', 'STRING', 'Name', 'S', 'PI'];

var ruleNames = ['document', 'prolog', 'content', 'element', 'reference', 'attribute', 'chardata', 'misc'];

function XMLParser(input) {
  antlr4.Parser.call(this, input);
  this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
  this.ruleNames = ruleNames;
  this.literalNames = literalNames;
  this.symbolicNames = symbolicNames;
  return this;
}

XMLParser.prototype = Object.create(antlr4.Parser.prototype);
XMLParser.prototype.constructor = XMLParser;

Object.defineProperty(XMLParser.prototype, 'atn', {
  get: function() {
    return atn;
  }
});

XMLParser.EOF = antlr4.Token.EOF;
XMLParser.COMMENT = 1;
XMLParser.CDATA = 2;
XMLParser.DTD = 3;
XMLParser.EntityRef = 4;
XMLParser.CharRef = 5;
XMLParser.SEA_WS = 6;
XMLParser.OPEN = 7;
XMLParser.XMLDeclOpen = 8;
XMLParser.TEXT = 9;
XMLParser.CLOSE = 10;
XMLParser.SPECIAL_CLOSE = 11;
XMLParser.SLASH_CLOSE = 12;
XMLParser.SLASH = 13;
XMLParser.EQUALS = 14;
XMLParser.STRING = 15;
XMLParser.Name = 16;
XMLParser.S = 17;
XMLParser.PI = 18;

XMLParser.RULE_document = 0;
XMLParser.RULE_prolog = 1;
XMLParser.RULE_content = 2;
XMLParser.RULE_element = 3;
XMLParser.RULE_reference = 4;
XMLParser.RULE_attribute = 5;
XMLParser.RULE_chardata = 6;
XMLParser.RULE_misc = 7;

function DocumentContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = XMLParser.RULE_document;
  return this;
}

DocumentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
DocumentContext.prototype.constructor = DocumentContext;

DocumentContext.prototype.element = function() {
  return this.getTypedRuleContext(ElementContext, 0);
};

DocumentContext.prototype.prolog = function() {
  return this.getTypedRuleContext(PrologContext, 0);
};

DocumentContext.prototype.misc = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(MiscContext);
  } else {
    return this.getTypedRuleContext(MiscContext, i);
  }
};

DocumentContext.prototype.enterRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.enterDocument(this);
  }
};

DocumentContext.prototype.exitRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.exitDocument(this);
  }
};

DocumentContext.prototype.accept = function(visitor) {
  if(visitor instanceof XMLParserVisitor) {
    return visitor.visitDocument(this);
  } else {
    return visitor.visitChildren(this);
  }
};

XMLParser.DocumentContext = DocumentContext;

XMLParser.prototype.document = function() {
  var localctx = new DocumentContext(this, this._ctx, this.state);
  this.enterRule(localctx, 0, XMLParser.RULE_document);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 17;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === XMLParser.XMLDeclOpen) {
      this.state = 16;
      this.prolog();
    }

    this.state = 22;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while((_la & ~0x1f) == 0 && ((1 << _la) & ((1 << XMLParser.COMMENT) | (1 << XMLParser.SEA_WS) | (1 << XMLParser.PI))) !== 0) {
      this.state = 19;
      this.misc();
      this.state = 24;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
    }
    this.state = 25;
    this.element();
    this.state = 29;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while((_la & ~0x1f) == 0 && ((1 << _la) & ((1 << XMLParser.COMMENT) | (1 << XMLParser.SEA_WS) | (1 << XMLParser.PI))) !== 0) {
      this.state = 26;
      this.misc();
      this.state = 31;
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

function PrologContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = XMLParser.RULE_prolog;
  return this;
}

PrologContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PrologContext.prototype.constructor = PrologContext;

PrologContext.prototype.XMLDeclOpen = function() {
  return this.getToken(XMLParser.XMLDeclOpen, 0);
};

PrologContext.prototype.SPECIAL_CLOSE = function() {
  return this.getToken(XMLParser.SPECIAL_CLOSE, 0);
};

PrologContext.prototype.attribute = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(AttributeContext);
  } else {
    return this.getTypedRuleContext(AttributeContext, i);
  }
};

PrologContext.prototype.enterRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.enterProlog(this);
  }
};

PrologContext.prototype.exitRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.exitProlog(this);
  }
};

PrologContext.prototype.accept = function(visitor) {
  if(visitor instanceof XMLParserVisitor) {
    return visitor.visitProlog(this);
  } else {
    return visitor.visitChildren(this);
  }
};

XMLParser.PrologContext = PrologContext;

XMLParser.prototype.prolog = function() {
  var localctx = new PrologContext(this, this._ctx, this.state);
  this.enterRule(localctx, 2, XMLParser.RULE_prolog);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 32;
    this.match(XMLParser.XMLDeclOpen);
    this.state = 36;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === XMLParser.Name) {
      this.state = 33;
      this.attribute();
      this.state = 38;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
    }
    this.state = 39;
    this.match(XMLParser.SPECIAL_CLOSE);
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

function ContentContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = XMLParser.RULE_content;
  return this;
}

ContentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ContentContext.prototype.constructor = ContentContext;

ContentContext.prototype.chardata = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(ChardataContext);
  } else {
    return this.getTypedRuleContext(ChardataContext, i);
  }
};

ContentContext.prototype.element = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(ElementContext);
  } else {
    return this.getTypedRuleContext(ElementContext, i);
  }
};

ContentContext.prototype.reference = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(ReferenceContext);
  } else {
    return this.getTypedRuleContext(ReferenceContext, i);
  }
};

ContentContext.prototype.CDATA = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(XMLParser.CDATA);
  } else {
    return this.getToken(XMLParser.CDATA, i);
  }
};

ContentContext.prototype.PI = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(XMLParser.PI);
  } else {
    return this.getToken(XMLParser.PI, i);
  }
};

ContentContext.prototype.COMMENT = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(XMLParser.COMMENT);
  } else {
    return this.getToken(XMLParser.COMMENT, i);
  }
};

ContentContext.prototype.enterRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.enterContent(this);
  }
};

ContentContext.prototype.exitRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.exitContent(this);
  }
};

ContentContext.prototype.accept = function(visitor) {
  if(visitor instanceof XMLParserVisitor) {
    return visitor.visitContent(this);
  } else {
    return visitor.visitChildren(this);
  }
};

XMLParser.ContentContext = ContentContext;

XMLParser.prototype.content = function() {
  var localctx = new ContentContext(this, this._ctx, this.state);
  this.enterRule(localctx, 4, XMLParser.RULE_content);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 42;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === XMLParser.SEA_WS || _la === XMLParser.TEXT) {
      this.state = 41;
      this.chardata();
    }

    this.state = 56;
    this._errHandler.sync(this);
    var _alt = this._interp.adaptivePredict(this._input, 7, this._ctx);
    while(_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
      if(_alt === 1) {
        this.state = 49;
        this._errHandler.sync(this);
        switch (this._input.LA(1)) {
          case XMLParser.OPEN:
            this.state = 44;
            this.element();
            break;
          case XMLParser.EntityRef:
          case XMLParser.CharRef:
            this.state = 45;
            this.reference();
            break;
          case XMLParser.CDATA:
            this.state = 46;
            this.match(XMLParser.CDATA);
            break;
          case XMLParser.PI:
            this.state = 47;
            this.match(XMLParser.PI);
            break;
          case XMLParser.COMMENT:
            this.state = 48;
            this.match(XMLParser.COMMENT);
            break;
          default:
            throw new antlr4.error.NoViableAltException(this);
        }
        this.state = 52;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la === XMLParser.SEA_WS || _la === XMLParser.TEXT) {
          this.state = 51;
          this.chardata();
        }
      }
      this.state = 58;
      this._errHandler.sync(this);
      _alt = this._interp.adaptivePredict(this._input, 7, this._ctx);
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

function ElementContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = XMLParser.RULE_element;
  return this;
}

ElementContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ElementContext.prototype.constructor = ElementContext;

ElementContext.prototype.OPEN = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(XMLParser.OPEN);
  } else {
    return this.getToken(XMLParser.OPEN, i);
  }
};

ElementContext.prototype.Name = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(XMLParser.Name);
  } else {
    return this.getToken(XMLParser.Name, i);
  }
};

ElementContext.prototype.CLOSE = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(XMLParser.CLOSE);
  } else {
    return this.getToken(XMLParser.CLOSE, i);
  }
};

ElementContext.prototype.content = function() {
  return this.getTypedRuleContext(ContentContext, 0);
};

ElementContext.prototype.SLASH = function() {
  return this.getToken(XMLParser.SLASH, 0);
};

ElementContext.prototype.attribute = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(AttributeContext);
  } else {
    return this.getTypedRuleContext(AttributeContext, i);
  }
};

ElementContext.prototype.SLASH_CLOSE = function() {
  return this.getToken(XMLParser.SLASH_CLOSE, 0);
};

ElementContext.prototype.enterRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.enterElement(this);
  }
};

ElementContext.prototype.exitRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.exitElement(this);
  }
};

ElementContext.prototype.accept = function(visitor) {
  if(visitor instanceof XMLParserVisitor) {
    return visitor.visitElement(this);
  } else {
    return visitor.visitChildren(this);
  }
};

XMLParser.ElementContext = ElementContext;

XMLParser.prototype.element = function() {
  var localctx = new ElementContext(this, this._ctx, this.state);
  this.enterRule(localctx, 6, XMLParser.RULE_element);
  var _la = 0; // Token type
  try {
    this.state = 83;
    this._errHandler.sync(this);
    var la_ = this._interp.adaptivePredict(this._input, 10, this._ctx);
    switch (la_) {
      case 1:
        this.enterOuterAlt(localctx, 1);
        this.state = 59;
        this.match(XMLParser.OPEN);
        this.state = 60;
        this.match(XMLParser.Name);
        this.state = 64;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la === XMLParser.Name) {
          this.state = 61;
          this.attribute();
          this.state = 66;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 67;
        this.match(XMLParser.CLOSE);
        this.state = 68;
        this.content();
        this.state = 69;
        this.match(XMLParser.OPEN);
        this.state = 70;
        this.match(XMLParser.SLASH);
        this.state = 71;
        this.match(XMLParser.Name);
        this.state = 72;
        this.match(XMLParser.CLOSE);
        break;

      case 2:
        this.enterOuterAlt(localctx, 2);
        this.state = 74;
        this.match(XMLParser.OPEN);
        this.state = 75;
        this.match(XMLParser.Name);
        this.state = 79;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la === XMLParser.Name) {
          this.state = 76;
          this.attribute();
          this.state = 81;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 82;
        this.match(XMLParser.SLASH_CLOSE);
        break;
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

function ReferenceContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = XMLParser.RULE_reference;
  return this;
}

ReferenceContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ReferenceContext.prototype.constructor = ReferenceContext;

ReferenceContext.prototype.EntityRef = function() {
  return this.getToken(XMLParser.EntityRef, 0);
};

ReferenceContext.prototype.CharRef = function() {
  return this.getToken(XMLParser.CharRef, 0);
};

ReferenceContext.prototype.enterRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.enterReference(this);
  }
};

ReferenceContext.prototype.exitRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.exitReference(this);
  }
};

ReferenceContext.prototype.accept = function(visitor) {
  if(visitor instanceof XMLParserVisitor) {
    return visitor.visitReference(this);
  } else {
    return visitor.visitChildren(this);
  }
};

XMLParser.ReferenceContext = ReferenceContext;

XMLParser.prototype.reference = function() {
  var localctx = new ReferenceContext(this, this._ctx, this.state);
  this.enterRule(localctx, 8, XMLParser.RULE_reference);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 85;
    _la = this._input.LA(1);
    if(!(_la === XMLParser.EntityRef || _la === XMLParser.CharRef)) {
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

function AttributeContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = XMLParser.RULE_attribute;
  return this;
}

AttributeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AttributeContext.prototype.constructor = AttributeContext;

AttributeContext.prototype.Name = function() {
  return this.getToken(XMLParser.Name, 0);
};

AttributeContext.prototype.EQUALS = function() {
  return this.getToken(XMLParser.EQUALS, 0);
};

AttributeContext.prototype.STRING = function() {
  return this.getToken(XMLParser.STRING, 0);
};

AttributeContext.prototype.enterRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.enterAttribute(this);
  }
};

AttributeContext.prototype.exitRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.exitAttribute(this);
  }
};

AttributeContext.prototype.accept = function(visitor) {
  if(visitor instanceof XMLParserVisitor) {
    return visitor.visitAttribute(this);
  } else {
    return visitor.visitChildren(this);
  }
};

XMLParser.AttributeContext = AttributeContext;

XMLParser.prototype.attribute = function() {
  var localctx = new AttributeContext(this, this._ctx, this.state);
  this.enterRule(localctx, 10, XMLParser.RULE_attribute);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 87;
    this.match(XMLParser.Name);
    this.state = 88;
    this.match(XMLParser.EQUALS);
    this.state = 89;
    this.match(XMLParser.STRING);
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

function ChardataContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = XMLParser.RULE_chardata;
  return this;
}

ChardataContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ChardataContext.prototype.constructor = ChardataContext;

ChardataContext.prototype.TEXT = function() {
  return this.getToken(XMLParser.TEXT, 0);
};

ChardataContext.prototype.SEA_WS = function() {
  return this.getToken(XMLParser.SEA_WS, 0);
};

ChardataContext.prototype.enterRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.enterChardata(this);
  }
};

ChardataContext.prototype.exitRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.exitChardata(this);
  }
};

ChardataContext.prototype.accept = function(visitor) {
  if(visitor instanceof XMLParserVisitor) {
    return visitor.visitChardata(this);
  } else {
    return visitor.visitChildren(this);
  }
};

XMLParser.ChardataContext = ChardataContext;

XMLParser.prototype.chardata = function() {
  var localctx = new ChardataContext(this, this._ctx, this.state);
  this.enterRule(localctx, 12, XMLParser.RULE_chardata);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 91;
    _la = this._input.LA(1);
    if(!(_la === XMLParser.SEA_WS || _la === XMLParser.TEXT)) {
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

function MiscContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = XMLParser.RULE_misc;
  return this;
}

MiscContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MiscContext.prototype.constructor = MiscContext;

MiscContext.prototype.COMMENT = function() {
  return this.getToken(XMLParser.COMMENT, 0);
};

MiscContext.prototype.PI = function() {
  return this.getToken(XMLParser.PI, 0);
};

MiscContext.prototype.SEA_WS = function() {
  return this.getToken(XMLParser.SEA_WS, 0);
};

MiscContext.prototype.enterRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.enterMisc(this);
  }
};

MiscContext.prototype.exitRule = function(listener) {
  if(listener instanceof XMLParserListener) {
    listener.exitMisc(this);
  }
};

MiscContext.prototype.accept = function(visitor) {
  if(visitor instanceof XMLParserVisitor) {
    return visitor.visitMisc(this);
  } else {
    return visitor.visitChildren(this);
  }
};

XMLParser.MiscContext = MiscContext;

XMLParser.prototype.misc = function() {
  var localctx = new MiscContext(this, this._ctx, this.state);
  this.enterRule(localctx, 14, XMLParser.RULE_misc);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 93;
    _la = this._input.LA(1);
    if(!((_la & ~0x1f) == 0 && ((1 << _la) & ((1 << XMLParser.COMMENT) | (1 << XMLParser.SEA_WS) | (1 << XMLParser.PI))) !== 0)) {
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

exports.XMLParser = XMLParser;
