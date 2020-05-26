function log(source, msg) {
    var echo = false;
    switch (source) {
    case 'stack': echo = true;
    case 'terminal': echo = true;
	case 'recursion': echo = true;
	// case 'alternation': echo = true;
	// case 'exception': echo = true;
	case 'ParseState': echo = true;
    case 'ParseNode': echo = true;
    }

    var dots = '';
    if (typeof parser != 'undefined') {
	for (var i = 0; i < parser.stack.length; i++) dots = dots + '.';
    }

    if (echo) console.log(dots + source + ': ' + msg);
}

// Class ParseNode

ParseNode.prototype.value = function() {
    return buffer.substring(this.start, this.end);
}

ParseNode.prototype.nodeLength = function() {
    return this.end - this.start;
}

ParseNode.prototype.addChild = function(child) {
    child.parent = this;
    this.children.push(child);
}

ParseNode.prototype.print = function(indent) {
    var spaces = '';
    for (var i = 0; i < indent; i++) spaces = spaces + ' ';

    console.log(spaces + '{');
    console.log(spaces + '   type: ' + this.type + ' start: ' + this.start + ' end: ' + this.end);
    console.log(spaces + '  value: ' + this.value());
    console.log(spaces + '  children:');
    for (var i = 0; i < this.children.length; i++) {
	this.children[i].print(indent + 2);
    }
    console.log(spaces + '}');
}

function ParseNode(type, buffer, start, end) {
    this.parent = null;
    this.children = new Array();
    this.type = type;
    this.buffer = buffer;
    this.start = start;
    this.end = end;

    log('ParseNode', this.type + ' start=' + this.start + ' end=' + this.end + ' value=.' + this.value() + '.');
}

// Class ParseState

ParseState.prototype.charAt = function(offset) {
    return buffer.charAt(this.offset + offset);
}

ParseState.prototype.advance = function(n) {
    var msg = 'offset=' + this.offset + ' n=' + n;
    this.lineNumber += buffer.substring(this.offset, this.offset + n).split(/\r*\n/).length - 1;
    this.offset += n;
    this.current = buffer.charAt(this.offset);
    log('advance', msg + ' new offset=' + this.offset);
}

ParseState.prototype.parseNode = function(type) {
    if (this.ruleStart == this.offset) {
	console.log('parseNode: type=' + type + ' ruleStart=' + this.ruleStart + ' start=' + this.start + ' offset=' + this.offset);
	return null;
    } else {
	return new ParseNode(type, this.buffer, this.ruleStart, this.offset);
    }
}

ParseState.prototype.checkWhitespace = function() {
    var n = 0;
    var c = this.buffer.charAt(this.offset);
    log('checkWhitespace', 'offset=' + this.offset + ' c=' + c);
    while (c == ' ' || c == '\t' || c == '\n' || c == '\r') {
	n = n + 1;
	c = this.buffer.charAt(this.offset + n);
	log('checkWhitespace', 'n=' + n + ' c=' + c);
    }

    return n;
}

ParseState.prototype.checkComment = function() {
    log('checkComment', 'offset=' + this.offset);
    var n = 0;
    var c1 = this.buffer.charAt(this.offset);
    var c2 = this.buffer.charAt(this.offset + 1);
    if (c1 != '(' || c2 != '*') {
	c2 = '';
    } else {
	n = 2;
	c1 = this.buffer.charAt(this.offset + n);
	c2 = this.buffer.charAt(this.offset + n + 1);
	while (! (c1 == '*' && c2 == ')')) {
	    c1 = c2;
	    n = n + 1;
	    c2 = this.buffer.charAt(n);
	    if (c2 == '') break;
	}
    }
    
    if (c2 == ')') return n + 1;
    else return 0;
}

ParseState.prototype.nextToken = function() {
    // skip any combination of comments and whitespace
    var n = 0, wn, cn;
    do {
	wn = this.checkWhitespace();
	if (wn == 0) cn = this.checkComment();
	else cn = 0;
	this.advance(wn + cn);
	n += wn + cn;
    } while (wn != 0 || cn != 0);
    
    this.start = this.offset;
}

function ParseState(rule, buffer, offset, lineNumber) {
    this.rule = rule;
    this.buffer = buffer;
    this.ruleStart = offset;
    this.start = offset;
    this.offset = offset;
    this.lineNumber = lineNumber;
    this.nextToken();
    this.current = buffer.charAt(offset);

    log('ParseState', 'rule=' + this.rule + ' start=' + this.start + ' offset=' + this.offset +
	' lineNumber=' + this.lineNumber + ' text=' + buffer.substring(this.offset, this.offset + 20).replace(/(?:\r\n|\r|\n)/g, '\\n'));
}

// Class Parser

Parser.prototype.pushFrame = function(rule) {
    var sstate = null;
    var recursion = 0;

    for (var i = 0; i < this.stack.length; i++) {
	sstate = this.stack[i];
	if (sstate.rule == rule && sstate.offset == this.state.offset) {
	    recursion++;
	}
    }

    if (recursion > 1) {
	// allow one, deny more than one
	log('recursion', 'infinte recursion detected at rule=' + rule + ' offset=' + sstate.offset);
	return null;
    }

    var pstate = new ParseState(rule, this.state.buffer, this.state.offset, this.state.lineNumber);
    log('stack','push: rule=' + rule);
    this.stack.push(pstate);
    this.state = pstate;
    return pstate;
}

Parser.prototype.popFrame = function(rule, pnode) {
    log('stack', 'pop: rule: ' + rule + ' state: ' + this.state.rule + 
	' stack: ' + this.stack.length + ' pnode: ' + (pnode == null ? 'null' : pnode.type));
    this.stack.pop();
    this.state = this.stack[this.stack.length - 1];
    if (pnode != null && pnode.end > this.maxParseEnd) {
	log('stack', 'maxParseEnd: ' + this.maxParseEnd + ' pnode.end: ' + pnode.end);
	this.maxParseEnd = pnode.end;
	this.maxParseNode = pnode;
	pnode.print(0);
    }
}

// single character parsing - return 0/1

Parser.prototype.parseLetter = function() {
    var c = this.state.current;
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) return 1;
    else return 0;
}

Parser.prototype.parseDigit = function() {
    var c = this.state.current;
    if (c >= '0' && c <= '9') return 1;
    else return 0;
}

Parser.prototype.parseNonzero = function() {
    var c = this.state.current;
    if (c > '0' && c <= '9') return 1;
    else return 0;
}

Parser.prototype.parseSymbol = function() {
    switch (this.state.current) {
    case '[': case ']': case '{': case '}': case '(': case ')': case '<': case '>':
    case this.SQUOTE: case this.DQUOTE: case '=': case '|': case '.': case ',': case ';': 
	return 1;
    default:
	return 0;
    }
}

Parser.prototype.parseCharacter = function() {
    if (this.parseLetter()) return 1;
    if (this.parseDigit()) return 1;
    if (this.parseSymbol()) return 1;
    if (this.state.current == '_') return 1;
    return 0;
}

// multiple character parsing - return node or null

Parser.prototype.parseIdentifier = function() {
    var rule = 'identifier';
    var pstate = this.pushFrame(rule);
    if (pstate == null) return null;

    var identifier = null;
    if (this.parseLetter() > 0) {
	pstate.advance(1);
	while (this.parseLetter() > 0 ||
	       this.parseDigit(pstate) > 0 ||
	       pstate.current == '_') {
	    pstate.advance(1);
	}

	identifier = pstate.parseNode('identifier');
    }

    this.popFrame(rule, identifier);
    return identifier;
}

Parser.prototype.parseTerminal = function() {
    var rule = 'terminal';
    var pstate = this.pushFrame(rule);
    if (pstate == null) return null;

    var terminal = null;
    if (pstate.current == this.SQUOTE || pstate.current == this.DQUOTE) {
	var left_quote = pstate.current;
	pstate.advance(1);
	while (left_quote != pstate.current && this.parseCharacter() != 0) {
	    pstate.advance(1);
	}

	if (left_quote != pstate.current) {
	    return null; // unterminated terminal
	} else {
	    pstate.advance(1);
	    terminal = pstate.parseNode('terminal');
	}
    }

    this.popFrame(rule, terminal);
    return terminal
}

Parser.prototype.parseCount = function() {
    var rule = 'count';
    var pstate = this.pushFrame(rule);;
    if (pstate == null) return null;

    var count = null;
    if (this.parseNonzero() > 0) {
	pstate.advance(1);
	while (this.parseDigit() > 0) {
	    pstate.advance(1);
	}

	count = pstate.parseNode('count');
    }

    this.popFrame(rule, count);
    return count;
}

Parser.prototype.parseLhs = function() {
    var rule = 'lhs';
    var pstate = this.pushFrame(rule);
    if (pstate == null) return null;

    var lhs = null;
    var identifier = this.parseIdentifier();
    if (identifier != null) {
	pstate.advance(identifier.nodeLength());
	lhs = pstate.parseNode('lhs');
	lhs.addChild(identifier);
    }

    this.popFrame(rule, lhs);
    return lhs;
}

Parser.prototype._parseBinary = function(rule, parseLeft, operator, parseRight) {
    var pstate = this.pushFrame(rule);
    if (pstate == null) return null;

    var binary = null;
    var left = parseLeft.call(this);
    if (left != null) {
	log(rule, 'left: ' + left.type + ' value: ' + left.value());
	pstate.advance(left.nodeLength());
	pstate.nextToken();
	if (pstate.current == operator) {
	    log(rule, 'operator: ' + operator);
	    pstate.advance(1);
	    pstate.nextToken();
	    var right = parseRight.call(this);
	    if (right != null) {
		log(rule, 'right: ' + right.type + ' value: ' + right.value());
		pstate.advance(right.nodeLength());
		log(rule, ' state: start=' + pstate.start + ' offset=' + pstate.offset);
		binary = pstate.parseNode(rule);
		binary.addChild(left);
		binary.addChild(right);
	    }
	}
    }

    this.popFrame(rule, binary);
    return binary;
}

Parser.prototype._parseEnclosure = function(rule, beginEnclosure, parseEnclosed, endEnclosure) {
    var pstate = this.pushFrame(rule);
    if (pstate == null) return null;

    var enclosure = null;
    if (pstate.current == beginEnclosure) {
	pstate.advance(1);
	pstate.nextToken();
	var enclosed = parseEnclosed.call(this);
	if (enclosed != null) {
	    pstate.advance(enclosed.nodeLength());
	    pstate.nextToken();
	    if (pstate.current == endEnclosure) {
		pstate.advance(1);
		enclosure = pstate.parseNode(rule);
		enclosure.addChild(enclosed);
	    }
	}
    }

    this.popFrame(rule, enclosure);
    return enclosure;
}

Parser.prototype.parseCounted = function() {
    return this._parseBinary('counted', this.parseCount, '*', this.parseRhs);
}

Parser.prototype.parseException = function() {
    return this._parseBinary('exception', this.parseRhs, '-', this.parseRhs);
}

Parser.prototype.parseOptional = function() {
    return this._parseEnclosure('optional', '[', this.parseRhs, ']');
}

Parser.prototype.parseRepetition = function() {
    return this._parseEnclosure('repetition', '{', this.parseRhs, '}');
}

Parser.prototype.parseGrouping = function() {
    return this._parseEnclosure('grouping', '(', this.parseRhs, ')');
}

Parser.prototype.parseAlternation = function() {
    return this._parseBinary('alternation', this.parseRhs, '|', this.parseRhs);
}

Parser.prototype.parseConcatenation = function() {
    return this._parseBinary('concatenation', this.parseRhs, ',', this.parseRhs);
}

Parser.prototype.parseRhs = function() {
    var rule = 'rhs';
    var pstate = this.pushFrame(rule);
    if (pstate == null) return null;

    var rhs = null;
    var child = null;
    var best = null;

    [[this, this.parseCounted]
     ,[this, this.parseException]
     ,[this, this.parseOptional]
     ,[this, this.parseRepetition]
     ,[this, this.parseGrouping]
     ,[this, this.parseAlternation]
     ,[this, this.parseConcatenation]
     ,[this, this.parseIdentifier]
     ,[this, this.parseTerminal]
     ].forEach(function(parseRule) {
	     child = parseRule[1].call(parseRule[0]);
	     if (child != null) {
		 best = (best == null) ? child :
		     ((child.nodeLength() > best.nodeLength()) ? child : best);
	     }
	 });

    //if (child == null) child = this.parseCounted();
    //if (child == null) child = this.parseException();
    //if (child == null) child = this.parseOptional();
    //if (child == null) child = this.parseGrouping();
    //if (child == null) child = this.parseAlternation();
    //if (child == null) child = this.parseConcatenation();
    //if (child == null) child = this.parseIdentifier();
    //if (child == null) child = this.parseTerminal();

    if (child != null) {
	pstate.advance(child.nodeLength());
	rhs = pstate.parseNode('rhs');
	rhs.addChild(child);
    }

    this.popFrame(rule, rhs);
    return rhs;
}

Parser.prototype.parseRule = function() {
    var rule = 'rule';
    var pstate = this.pushFrame('rule');
    if (pstate == null) return null;

    var prule = null;
    var lhs = this.parseLhs();

    if (lhs != null) {
	pstate.advance(lhs.nodeLength());
	pstate.nextToken();
	if (pstate.current != '=') return null;
	else {
	    pstate.advance(1);
	    pstate.nextToken();
	    var rhs = this.parseRhs(pstate);
	    if (rhs != null) {
		pstate.advance(rhs.nodeLength());
		pstate.nextToken();
		if (pstate.current == ';') {
		    pstate.advance(1);
		    prule = pstate.parseNode('rule');
		    prule.addChild(lhs);
		    prule.addChild(rhs);
		}
	    }
	}
    }

    this.popFrame(rule, prule);
    return prule;
}

Parser.prototype.parseGrammar = function() {
    var rule = 'grammar';
    var pstate = this.pushFrame(rule);
    if (pstate == null) return null;

    var grammar = null;
    var rules = new Array();
    var prule = null;

    do {
	prule = this.parseRule();
	if (prule != null) {
	    rules.push(prule);
	    pstate.advance(prule.nodeLength());
	    pstate.nextToken();
	    console.log('pstate: ruleStart=' + pstate.ruleStart + ' start=' + pstate.start + ' offset=' + pstate.offset);
	}
    } while (prule != null);

    grammar = pstate.parseNode('grammar');
    for (var i = 0; i < rules.length; i++) {
	grammar.addChild(rules[i]);
    }

    this.popFrame(rule, grammar);
    return grammar;
}

function Parser(buffer) {
    this.SQUOTE = "'";
    this.DQUOTE = '"';
    this.stack = new Array();
    this.buffer = buffer;
    this.maxParseEnd = 0;
    this.maxParseNode = null;
    this.state = new ParseState('toplevel', buffer, 0, 1);
    this.stack.push(this.state);
}

var fs = require('fs');

var inputFile = process.argv[2];
console.log(process.argv[1] + ': inputFile=' + inputFile);
var buffer = fs.readFileSync(inputFile, 'utf8');
var parser = new Parser(buffer);
var grammar = parser.parseGrammar();

if (grammar != null) parser.state.advance(grammar.nodeLength());
if (parser.state.current == '') {
    grammar.print(0);
    process.exit(0);
} else {
    console.log('incomplete parse: lineNumber=' + parser.state.lineNumber + ' input=' +
		parser.state.buffer.substring(parser.state.offset, parser.state.offset + 50));
    process.exit(-1);
}