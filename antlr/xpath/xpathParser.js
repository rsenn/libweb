// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/xpath.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');
var xpathListener = require('./xpathListener').xpathListener;
var xpathVisitor = require('./xpathVisitor').xpathVisitor;

var grammarFileName = 'xpath.g4';

var serializedATN = [
  '\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964',
  '\u0003&\u00f8\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t',
  '\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004',
  '\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f\u0004',
  '\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010\t\u0010\u0004',
  '\u0011\t\u0011\u0004\u0012\t\u0012\u0004\u0013\t\u0013\u0004\u0014\t',
  '\u0014\u0004\u0015\t\u0015\u0004\u0016\t\u0016\u0004\u0017\t\u0017\u0004',
  '\u0018\t\u0018\u0004\u0019\t\u0019\u0004\u001a\t\u001a\u0004\u001b\t',
  '\u001b\u0004\u001c\t\u001c\u0003\u0002\u0003\u0002\u0003\u0003\u0003',
  '\u0003\u0005\u0003=\n\u0003\u0003\u0004\u0003\u0004\u0003\u0004\u0003',
  '\u0004\u0005\u0004C\n\u0004\u0003\u0005\u0003\u0005\u0003\u0005\u0007',
  '\u0005H\n\u0005\f\u0005\u000e\u0005K\u000b\u0005\u0003\u0006\u0003\u0006',
  '\u0003\u0006\u0007\u0006P\n\u0006\f\u0006\u000e\u0006S\u000b\u0006\u0003',
  '\u0006\u0005\u0006V\n\u0006\u0003\u0007\u0003\u0007\u0003\u0007\u0005',
  '\u0007[\n\u0007\u0005\u0007]\n\u0007\u0003\b\u0003\b\u0003\b\u0003\b',
  '\u0003\b\u0003\b\u0003\b\u0003\b\u0005\bg\n\b\u0003\t\u0003\t\u0003',
  '\t\u0003\t\u0003\n\u0003\n\u0003\u000b\u0003\u000b\u0003\f\u0003\f\u0003',
  '\f\u0003\f\u0003\f\u0003\f\u0003\f\u0003\f\u0005\fy\n\f\u0003\r\u0003',
  '\r\u0003\r\u0003\r\u0003\r\u0007\r\u0080\n\r\f\r\u000e\r\u0083\u000b',
  '\r\u0005\r\u0085\n\r\u0003\r\u0003\r\u0003\u000e\u0003\u000e\u0003\u000e',
  '\u0005\u000e\u008c\n\u000e\u0003\u000e\u0003\u000e\u0003\u000e\u0005',
  '\u000e\u0091\n\u000e\u0003\u000f\u0003\u000f\u0003\u000f\u0003\u000f',
  '\u0005\u000f\u0097\n\u000f\u0005\u000f\u0099\n\u000f\u0003\u0010\u0003',
  '\u0010\u0007\u0010\u009d\n\u0010\f\u0010\u000e\u0010\u00a0\u000b\u0010',
  '\u0003\u0011\u0003\u0011\u0003\u0011\u0007\u0011\u00a5\n\u0011\f\u0011',
  '\u000e\u0011\u00a8\u000b\u0011\u0003\u0012\u0003\u0012\u0003\u0012\u0007',
  '\u0012\u00ad\n\u0012\f\u0012\u000e\u0012\u00b0\u000b\u0012\u0003\u0013',
  '\u0003\u0013\u0003\u0013\u0007\u0013\u00b5\n\u0013\f\u0013\u000e\u0013',
  '\u00b8\u000b\u0013\u0003\u0014\u0003\u0014\u0003\u0014\u0007\u0014\u00bd',
  '\n\u0014\f\u0014\u000e\u0014\u00c0\u000b\u0014\u0003\u0015\u0003\u0015',
  '\u0003\u0015\u0007\u0015\u00c5\n\u0015\f\u0015\u000e\u0015\u00c8\u000b',
  '\u0015\u0003\u0016\u0003\u0016\u0003\u0016\u0005\u0016\u00cd\n\u0016',
  '\u0003\u0016\u0003\u0016\u0003\u0016\u0005\u0016\u00d2\n\u0016\u0005',
  '\u0016\u00d4\n\u0016\u0003\u0017\u0007\u0017\u00d7\n\u0017\f\u0017\u000e',
  '\u0017\u00da\u000b\u0017\u0003\u0017\u0003\u0017\u0003\u0018\u0003\u0018',
  '\u0003\u0018\u0005\u0018\u00e1\n\u0018\u0003\u0019\u0003\u0019\u0003',
  '\u0019\u0003\u0019\u0003\u0019\u0003\u0019\u0005\u0019\u00e9\n\u0019',
  '\u0003\u001a\u0003\u001a\u0003\u001a\u0003\u001b\u0003\u001b\u0003\u001b',
  '\u0003\u001b\u0003\u001b\u0003\u001b\u0005\u001b\u00f4\n\u001b\u0003',
  '\u001c\u0003\u001c\u0003\u001c\u0002\u0002\u001d\u0002\u0004\u0006\b',
  '\n\f\u000e\u0010\u0012\u0014\u0016\u0018\u001a\u001c\u001e "$&(*,.',
  '0246\u0002\n\u0003\u0002\u000e\u000f\u0004\u0002\u0016\u0016\u0018\u0018',
  '\u0003\u0002\u0006\u0007\u0003\u0002\u001c\u001f\u0003\u0002\u0014\u0015',
  '\u0004\u0002\b\t\u0017\u0017\u0003\u0002\b\t\u0005\u0002\u000b\u000b',
  '\r\r&&\u0002\u00fe\u00028\u0003\u0002\u0002\u0002\u0004<\u0003\u0002',
  '\u0002\u0002\u0006B\u0003\u0002\u0002\u0002\bD\u0003\u0002\u0002\u0002',
  '\nU\u0003\u0002\u0002\u0002\f\\\u0003\u0002\u0002\u0002\u000ef\u0003',
  '\u0002\u0002\u0002\u0010h\u0003\u0002\u0002\u0002\u0012l\u0003\u0002',
  '\u0002\u0002\u0014n\u0003\u0002\u0002\u0002\u0016x\u0003\u0002\u0002',
  '\u0002\u0018z\u0003\u0002\u0002\u0002\u001a\u0090\u0003\u0002\u0002',
  '\u0002\u001c\u0098\u0003\u0002\u0002\u0002\u001e\u009a\u0003\u0002\u0002',
  '\u0002 \u00a1\u0003\u0002\u0002\u0002"\u00a9\u0003\u0002\u0002\u0002',
  '$\u00b1\u0003\u0002\u0002\u0002&\u00b9\u0003\u0002\u0002\u0002(\u00c1',
  '\u0003\u0002\u0002\u0002*\u00d3\u0003\u0002\u0002\u0002,\u00d8\u0003',
  '\u0002\u0002\u0002.\u00dd\u0003\u0002\u0002\u00020\u00e8\u0003\u0002',
  '\u0002\u00022\u00ea\u0003\u0002\u0002\u00024\u00f3\u0003\u0002\u0002',
  '\u00026\u00f5\u0003\u0002\u0002\u000289\u0005\u0014\u000b\u00029\u0003',
  '\u0003\u0002\u0002\u0002:=\u0005\b\u0005\u0002;=\u0005\u0006\u0004\u0002',
  '<:\u0003\u0002\u0002\u0002<;\u0003\u0002\u0002\u0002=\u0005\u0003\u0002',
  '\u0002\u0002>?\u0007\u000e\u0002\u0002?C\u0005\b\u0005\u0002@A\u0007',
  '\u000f\u0002\u0002AC\u0005\b\u0005\u0002B>\u0003\u0002\u0002\u0002B',
  '@\u0003\u0002\u0002\u0002C\u0007\u0003\u0002\u0002\u0002DI\u0005\n\u0006',
  '\u0002EF\t\u0002\u0002\u0002FH\u0005\n\u0006\u0002GE\u0003\u0002\u0002',
  '\u0002HK\u0003\u0002\u0002\u0002IG\u0003\u0002\u0002\u0002IJ\u0003\u0002',
  '\u0002\u0002J\t\u0003\u0002\u0002\u0002KI\u0003\u0002\u0002\u0002LM',
  '\u0005\f\u0007\u0002MQ\u0005\u000e\b\u0002NP\u0005\u0010\t\u0002ON\u0003',
  '\u0002\u0002\u0002PS\u0003\u0002\u0002\u0002QO\u0003\u0002\u0002\u0002',
  'QR\u0003\u0002\u0002\u0002RV\u0003\u0002\u0002\u0002SQ\u0003\u0002\u0002',
  '\u0002TV\u0005\u0012\n\u0002UL\u0003\u0002\u0002\u0002UT\u0003\u0002',
  '\u0002\u0002V\u000b\u0003\u0002\u0002\u0002WX\u0007\r\u0002\u0002X]',
  '\u0007!\u0002\u0002Y[\u0007\u0019\u0002\u0002ZY\u0003\u0002\u0002\u0002',
  'Z[\u0003\u0002\u0002\u0002[]\u0003\u0002\u0002\u0002\\W\u0003\u0002',
  '\u0002\u0002\\Z\u0003\u0002\u0002\u0002]\r\u0003\u0002\u0002\u0002^',
  'g\u00054\u001b\u0002_`\u0007\u000b\u0002\u0002`a\u0007\u0010\u0002\u0002',
  'ag\u0007\u0011\u0002\u0002bc\u0007\u0003\u0002\u0002cd\u0007\u0010\u0002',
  '\u0002de\u0007$\u0002\u0002eg\u0007\u0011\u0002\u0002f^\u0003\u0002',
  '\u0002\u0002f_\u0003\u0002\u0002\u0002fb\u0003\u0002\u0002\u0002g\u000f',
  '\u0003\u0002\u0002\u0002hi\u0007\u0012\u0002\u0002ij\u0005\u0014\u000b',
  '\u0002jk\u0007\u0013\u0002\u0002k\u0011\u0003\u0002\u0002\u0002lm\t',
  '\u0003\u0002\u0002m\u0013\u0003\u0002\u0002\u0002no\u0005 \u0011\u0002',
  'o\u0015\u0003\u0002\u0002\u0002py\u00052\u001a\u0002qr\u0007\u0010\u0002',
  '\u0002rs\u0005\u0014\u000b\u0002st\u0007\u0011\u0002\u0002ty\u0003\u0002',
  '\u0002\u0002uy\u0007$\u0002\u0002vy\u0007\f\u0002\u0002wy\u0005\u0018',
  '\r\u0002xp\u0003\u0002\u0002\u0002xq\u0003\u0002\u0002\u0002xu\u0003',
  '\u0002\u0002\u0002xv\u0003\u0002\u0002\u0002xw\u0003\u0002\u0002\u0002',
  'y\u0017\u0003\u0002\u0002\u0002z{\u00050\u0019\u0002{\u0084\u0007\u0010',
  '\u0002\u0002|\u0081\u0005\u0014\u000b\u0002}~\u0007\u001a\u0002\u0002',
  '~\u0080\u0005\u0014\u000b\u0002\u007f}\u0003\u0002\u0002\u0002\u0080',
  '\u0083\u0003\u0002\u0002\u0002\u0081\u007f\u0003\u0002\u0002\u0002\u0081',
  '\u0082\u0003\u0002\u0002\u0002\u0082\u0085\u0003\u0002\u0002\u0002\u0083',
  '\u0081\u0003\u0002\u0002\u0002\u0084|\u0003\u0002\u0002\u0002\u0084',
  '\u0085\u0003\u0002\u0002\u0002\u0085\u0086\u0003\u0002\u0002\u0002\u0086',
  '\u0087\u0007\u0011\u0002\u0002\u0087\u0019\u0003\u0002\u0002\u0002\u0088',
  '\u008b\u0005\u001c\u000f\u0002\u0089\u008a\u0007\u001b\u0002\u0002\u008a',
  '\u008c\u0005\u001a\u000e\u0002\u008b\u0089\u0003\u0002\u0002\u0002\u008b',
  '\u008c\u0003\u0002\u0002\u0002\u008c\u0091\u0003\u0002\u0002\u0002\u008d',
  '\u008e\u0007\u000e\u0002\u0002\u008e\u008f\u0007\u001b\u0002\u0002\u008f',
  '\u0091\u0005\u001a\u000e\u0002\u0090\u0088\u0003\u0002\u0002\u0002\u0090',
  '\u008d\u0003\u0002\u0002\u0002\u0091\u001b\u0003\u0002\u0002\u0002\u0092',
  '\u0099\u0005\u0004\u0003\u0002\u0093\u0096\u0005\u001e\u0010\u0002\u0094',
  '\u0095\t\u0002\u0002\u0002\u0095\u0097\u0005\b\u0005\u0002\u0096\u0094',
  '\u0003\u0002\u0002\u0002\u0096\u0097\u0003\u0002\u0002\u0002\u0097\u0099',
  '\u0003\u0002\u0002\u0002\u0098\u0092\u0003\u0002\u0002\u0002\u0098\u0093',
  '\u0003\u0002\u0002\u0002\u0099\u001d\u0003\u0002\u0002\u0002\u009a\u009e',
  '\u0005\u0016\f\u0002\u009b\u009d\u0005\u0010\t\u0002\u009c\u009b\u0003',
  '\u0002\u0002\u0002\u009d\u00a0\u0003\u0002\u0002\u0002\u009e\u009c\u0003',
  '\u0002\u0002\u0002\u009e\u009f\u0003\u0002\u0002\u0002\u009f\u001f\u0003',
  '\u0002\u0002\u0002\u00a0\u009e\u0003\u0002\u0002\u0002\u00a1\u00a6\u0005',
  '"\u0012\u0002\u00a2\u00a3\u0007\u0004\u0002\u0002\u00a3\u00a5\u0005',
  '"\u0012\u0002\u00a4\u00a2\u0003\u0002\u0002\u0002\u00a5\u00a8\u0003',
  '\u0002\u0002\u0002\u00a6\u00a4\u0003\u0002\u0002\u0002\u00a6\u00a7\u0003',
  '\u0002\u0002\u0002\u00a7!\u0003\u0002\u0002\u0002\u00a8\u00a6\u0003',
  '\u0002\u0002\u0002\u00a9\u00ae\u0005$\u0013\u0002\u00aa\u00ab\u0007',
  '\u0005\u0002\u0002\u00ab\u00ad\u0005$\u0013\u0002\u00ac\u00aa\u0003',
  '\u0002\u0002\u0002\u00ad\u00b0\u0003\u0002\u0002\u0002\u00ae\u00ac\u0003',
  '\u0002\u0002\u0002\u00ae\u00af\u0003\u0002\u0002\u0002\u00af#\u0003',
  '\u0002\u0002\u0002\u00b0\u00ae\u0003\u0002\u0002\u0002\u00b1\u00b6\u0005',
  '&\u0014\u0002\u00b2\u00b3\t\u0004\u0002\u0002\u00b3\u00b5\u0005&\u0014',
  '\u0002\u00b4\u00b2\u0003\u0002\u0002\u0002\u00b5\u00b8\u0003\u0002\u0002',
  '\u0002\u00b6\u00b4\u0003\u0002\u0002\u0002\u00b6\u00b7\u0003\u0002\u0002',
  '\u0002\u00b7%\u0003\u0002\u0002\u0002\u00b8\u00b6\u0003\u0002\u0002',
  '\u0002\u00b9\u00be\u0005(\u0015\u0002\u00ba\u00bb\t\u0005\u0002\u0002',
  '\u00bb\u00bd\u0005(\u0015\u0002\u00bc\u00ba\u0003\u0002\u0002\u0002',
  '\u00bd\u00c0\u0003\u0002\u0002\u0002\u00be\u00bc\u0003\u0002\u0002\u0002',
  "\u00be\u00bf\u0003\u0002\u0002\u0002\u00bf'\u0003\u0002\u0002\u0002",
  '\u00c0\u00be\u0003\u0002\u0002\u0002\u00c1\u00c6\u0005*\u0016\u0002',
  '\u00c2\u00c3\t\u0006\u0002\u0002\u00c3\u00c5\u0005*\u0016\u0002\u00c4',
  '\u00c2\u0003\u0002\u0002\u0002\u00c5\u00c8\u0003\u0002\u0002\u0002\u00c6',
  '\u00c4\u0003\u0002\u0002\u0002\u00c6\u00c7\u0003\u0002\u0002\u0002\u00c7',
  ')\u0003\u0002\u0002\u0002\u00c8\u00c6\u0003\u0002\u0002\u0002\u00c9',
  '\u00cc\u0005,\u0017\u0002\u00ca\u00cb\t\u0007\u0002\u0002\u00cb\u00cd',
  '\u0005*\u0016\u0002\u00cc\u00ca\u0003\u0002\u0002\u0002\u00cc\u00cd',
  '\u0003\u0002\u0002\u0002\u00cd\u00d4\u0003\u0002\u0002\u0002\u00ce\u00d1',
  '\u0007\u000e\u0002\u0002\u00cf\u00d0\t\b\u0002\u0002\u00d0\u00d2\u0005',
  '*\u0016\u0002\u00d1\u00cf\u0003\u0002\u0002\u0002\u00d1\u00d2\u0003',
  '\u0002\u0002\u0002\u00d2\u00d4\u0003\u0002\u0002\u0002\u00d3\u00c9\u0003',
  '\u0002\u0002\u0002\u00d3\u00ce\u0003\u0002\u0002\u0002\u00d4+\u0003',
  '\u0002\u0002\u0002\u00d5\u00d7\u0007\u0014\u0002\u0002\u00d6\u00d5\u0003',
  '\u0002\u0002\u0002\u00d7\u00da\u0003\u0002\u0002\u0002\u00d8\u00d6\u0003',
  '\u0002\u0002\u0002\u00d8\u00d9\u0003\u0002\u0002\u0002\u00d9\u00db\u0003',
  '\u0002\u0002\u0002\u00da\u00d8\u0003\u0002\u0002\u0002\u00db\u00dc\u0005',
  '\u001a\u000e\u0002\u00dc-\u0003\u0002\u0002\u0002\u00dd\u00e0\u0005',
  '6\u001c\u0002\u00de\u00df\u0007 \u0002\u0002\u00df\u00e1\u00056\u001c',
  '\u0002\u00e0\u00de\u0003\u0002\u0002\u0002\u00e0\u00e1\u0003\u0002\u0002',
  '\u0002\u00e1/\u0003\u0002\u0002\u0002\u00e2\u00e3\u00056\u001c\u0002',
  '\u00e3\u00e4\u0007 \u0002\u0002\u00e4\u00e5\u00056\u001c\u0002\u00e5',
  '\u00e9\u0003\u0002\u0002\u0002\u00e6\u00e9\u0007&\u0002\u0002\u00e7',
  '\u00e9\u0007\r\u0002\u0002\u00e8\u00e2\u0003\u0002\u0002\u0002\u00e8',
  '\u00e6\u0003\u0002\u0002\u0002\u00e8\u00e7\u0003\u0002\u0002\u0002\u00e9',
  '1\u0003\u0002\u0002\u0002\u00ea\u00eb\u0007\n\u0002\u0002\u00eb\u00ec',
  '\u0005.\u0018\u0002\u00ec3\u0003\u0002\u0002\u0002\u00ed\u00f4\u0007',
  '\u0017\u0002\u0002\u00ee\u00ef\u00056\u001c\u0002\u00ef\u00f0\u0007',
  ' \u0002\u0002\u00f0\u00f1\u0007\u0017\u0002\u0002\u00f1\u00f4\u0003',
  '\u0002\u0002\u0002\u00f2\u00f4\u0005.\u0018\u0002\u00f3\u00ed\u0003',
  '\u0002\u0002\u0002\u00f3\u00ee\u0003\u0002\u0002\u0002\u00f3\u00f2\u0003',
  '\u0002\u0002\u0002\u00f45\u0003\u0002\u0002\u0002\u00f5\u00f6\t\t\u0002',
  '\u0002\u00f67\u0003\u0002\u0002\u0002\u001e<BIQUZ\\fx\u0081\u0084\u008b',
  '\u0090\u0096\u0098\u009e\u00a6\u00ae\u00b6\u00be\u00c6\u00cc\u00d1\u00d3',
  '\u00d8\u00e0\u00e8\u00f3'
].join('');

var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map(function(ds, index) {
  return new antlr4.dfa.DFA(ds, index);
});

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [
  null,
  "'processing-instruction'",
  "'or'",
  "'and'",
  "'='",
  "'!='",
  "'div'",
  "'mod'",
  "'$'",
  null,
  null,
  null,
  "'/'",
  "'//'",
  "'('",
  "')'",
  "'['",
  "']'",
  "'-'",
  "'+'",
  "'.'",
  "'*'",
  "'..'",
  "'@'",
  "','",
  "'|'",
  "'<'",
  "'>'",
  "'<='",
  "'>='",
  "':'",
  "'::'",
  "'''",
  "'\"'"
];

var symbolicNames = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'NodeType',
  'Number',
  'AxisName',
  'PATHSEP',
  'ABRPATH',
  'LPAR',
  'RPAR',
  'LBRAC',
  'RBRAC',
  'MINUS',
  'PLUS',
  'DOT',
  'MUL',
  'DOTDOT',
  'AT',
  'COMMA',
  'PIPE',
  'LESS',
  'MORE_',
  'LE',
  'GE',
  'COLON',
  'CC',
  'APOS',
  'QUOT',
  'Literal',
  'Whitespace',
  'NCName'
];

var ruleNames = [
  'main',
  'locationPath',
  'absoluteLocationPathNoroot',
  'relativeLocationPath',
  'step',
  'axisSpecifier',
  'nodeTest',
  'predicate',
  'abbreviatedStep',
  'expr',
  'primaryExpr',
  'functionCall',
  'unionExprNoRoot',
  'pathExprNoRoot',
  'filterExpr',
  'orExpr',
  'andExpr',
  'equalityExpr',
  'relationalExpr',
  'additiveExpr',
  'multiplicativeExpr',
  'unaryExprNoRoot',
  'qName',
  'functionName',
  'variableReference',
  'nameTest',
  'nCName'
];

function xpathParser(input) {
  antlr4.Parser.call(this, input);
  this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
  this.ruleNames = ruleNames;
  this.literalNames = literalNames;
  this.symbolicNames = symbolicNames;
  return this;
}

xpathParser.prototype = Object.create(antlr4.Parser.prototype);
xpathParser.prototype.constructor = xpathParser;

Object.defineProperty(xpathParser.prototype, 'atn', {
  get: function() {
    return atn;
  }
});

xpathParser.EOF = antlr4.Token.EOF;
xpathParser.T__0 = 1;
xpathParser.T__1 = 2;
xpathParser.T__2 = 3;
xpathParser.T__3 = 4;
xpathParser.T__4 = 5;
xpathParser.T__5 = 6;
xpathParser.T__6 = 7;
xpathParser.T__7 = 8;
xpathParser.NodeType = 9;
xpathParser.Number = 10;
xpathParser.AxisName = 11;
xpathParser.PATHSEP = 12;
xpathParser.ABRPATH = 13;
xpathParser.LPAR = 14;
xpathParser.RPAR = 15;
xpathParser.LBRAC = 16;
xpathParser.RBRAC = 17;
xpathParser.MINUS = 18;
xpathParser.PLUS = 19;
xpathParser.DOT = 20;
xpathParser.MUL = 21;
xpathParser.DOTDOT = 22;
xpathParser.AT = 23;
xpathParser.COMMA = 24;
xpathParser.PIPE = 25;
xpathParser.LESS = 26;
xpathParser.MORE_ = 27;
xpathParser.LE = 28;
xpathParser.GE = 29;
xpathParser.COLON = 30;
xpathParser.CC = 31;
xpathParser.APOS = 32;
xpathParser.QUOT = 33;
xpathParser.Literal = 34;
xpathParser.Whitespace = 35;
xpathParser.NCName = 36;

xpathParser.RULE_main = 0;
xpathParser.RULE_locationPath = 1;
xpathParser.RULE_absoluteLocationPathNoroot = 2;
xpathParser.RULE_relativeLocationPath = 3;
xpathParser.RULE_step = 4;
xpathParser.RULE_axisSpecifier = 5;
xpathParser.RULE_nodeTest = 6;
xpathParser.RULE_predicate = 7;
xpathParser.RULE_abbreviatedStep = 8;
xpathParser.RULE_expr = 9;
xpathParser.RULE_primaryExpr = 10;
xpathParser.RULE_functionCall = 11;
xpathParser.RULE_unionExprNoRoot = 12;
xpathParser.RULE_pathExprNoRoot = 13;
xpathParser.RULE_filterExpr = 14;
xpathParser.RULE_orExpr = 15;
xpathParser.RULE_andExpr = 16;
xpathParser.RULE_equalityExpr = 17;
xpathParser.RULE_relationalExpr = 18;
xpathParser.RULE_additiveExpr = 19;
xpathParser.RULE_multiplicativeExpr = 20;
xpathParser.RULE_unaryExprNoRoot = 21;
xpathParser.RULE_qName = 22;
xpathParser.RULE_functionName = 23;
xpathParser.RULE_variableReference = 24;
xpathParser.RULE_nameTest = 25;
xpathParser.RULE_nCName = 26;

function MainContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_main;
  return this;
}

MainContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MainContext.prototype.constructor = MainContext;

MainContext.prototype.expr = function() {
  return this.getTypedRuleContext(ExprContext, 0);
};

MainContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterMain(this);
  }
};

MainContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitMain(this);
  }
};

MainContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitMain(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.MainContext = MainContext;

xpathParser.prototype.main = function() {
  var localctx = new MainContext(this, this._ctx, this.state);
  this.enterRule(localctx, 0, xpathParser.RULE_main);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 54;
    this.expr();
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

function LocationPathContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_locationPath;
  return this;
}

LocationPathContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LocationPathContext.prototype.constructor = LocationPathContext;

LocationPathContext.prototype.relativeLocationPath = function() {
  return this.getTypedRuleContext(RelativeLocationPathContext, 0);
};

LocationPathContext.prototype.absoluteLocationPathNoroot = function() {
  return this.getTypedRuleContext(AbsoluteLocationPathNorootContext, 0);
};

LocationPathContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterLocationPath(this);
  }
};

LocationPathContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitLocationPath(this);
  }
};

LocationPathContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitLocationPath(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.LocationPathContext = LocationPathContext;

xpathParser.prototype.locationPath = function() {
  var localctx = new LocationPathContext(this, this._ctx, this.state);
  this.enterRule(localctx, 2, xpathParser.RULE_locationPath);
  try {
    this.state = 58;
    this._errHandler.sync(this);
    switch (this._input.LA(1)) {
      case xpathParser.T__0:
      case xpathParser.NodeType:
      case xpathParser.AxisName:
      case xpathParser.DOT:
      case xpathParser.MUL:
      case xpathParser.DOTDOT:
      case xpathParser.AT:
      case xpathParser.NCName:
        this.enterOuterAlt(localctx, 1);
        this.state = 56;
        this.relativeLocationPath();
        break;
      case xpathParser.PATHSEP:
      case xpathParser.ABRPATH:
        this.enterOuterAlt(localctx, 2);
        this.state = 57;
        this.absoluteLocationPathNoroot();
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

function AbsoluteLocationPathNorootContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_absoluteLocationPathNoroot;
  return this;
}

AbsoluteLocationPathNorootContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AbsoluteLocationPathNorootContext.prototype.constructor = AbsoluteLocationPathNorootContext;

AbsoluteLocationPathNorootContext.prototype.PATHSEP = function() {
  return this.getToken(xpathParser.PATHSEP, 0);
};

AbsoluteLocationPathNorootContext.prototype.relativeLocationPath = function() {
  return this.getTypedRuleContext(RelativeLocationPathContext, 0);
};

AbsoluteLocationPathNorootContext.prototype.ABRPATH = function() {
  return this.getToken(xpathParser.ABRPATH, 0);
};

AbsoluteLocationPathNorootContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterAbsoluteLocationPathNoroot(this);
  }
};

AbsoluteLocationPathNorootContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitAbsoluteLocationPathNoroot(this);
  }
};

AbsoluteLocationPathNorootContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitAbsoluteLocationPathNoroot(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.AbsoluteLocationPathNorootContext = AbsoluteLocationPathNorootContext;

xpathParser.prototype.absoluteLocationPathNoroot = function() {
  var localctx = new AbsoluteLocationPathNorootContext(this, this._ctx, this.state);
  this.enterRule(localctx, 4, xpathParser.RULE_absoluteLocationPathNoroot);
  try {
    this.state = 64;
    this._errHandler.sync(this);
    switch (this._input.LA(1)) {
      case xpathParser.PATHSEP:
        this.enterOuterAlt(localctx, 1);
        this.state = 60;
        this.match(xpathParser.PATHSEP);
        this.state = 61;
        this.relativeLocationPath();
        break;
      case xpathParser.ABRPATH:
        this.enterOuterAlt(localctx, 2);
        this.state = 62;
        this.match(xpathParser.ABRPATH);
        this.state = 63;
        this.relativeLocationPath();
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

function RelativeLocationPathContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_relativeLocationPath;
  return this;
}

RelativeLocationPathContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
RelativeLocationPathContext.prototype.constructor = RelativeLocationPathContext;

RelativeLocationPathContext.prototype.step = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(StepContext);
  } else {
    return this.getTypedRuleContext(StepContext, i);
  }
};

RelativeLocationPathContext.prototype.PATHSEP = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(xpathParser.PATHSEP);
  } else {
    return this.getToken(xpathParser.PATHSEP, i);
  }
};

RelativeLocationPathContext.prototype.ABRPATH = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(xpathParser.ABRPATH);
  } else {
    return this.getToken(xpathParser.ABRPATH, i);
  }
};

RelativeLocationPathContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterRelativeLocationPath(this);
  }
};

RelativeLocationPathContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitRelativeLocationPath(this);
  }
};

RelativeLocationPathContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitRelativeLocationPath(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.RelativeLocationPathContext = RelativeLocationPathContext;

xpathParser.prototype.relativeLocationPath = function() {
  var localctx = new RelativeLocationPathContext(this, this._ctx, this.state);
  this.enterRule(localctx, 6, xpathParser.RULE_relativeLocationPath);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 66;
    this.step();
    this.state = 71;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === xpathParser.PATHSEP || _la === xpathParser.ABRPATH) {
      this.state = 67;
      _la = this._input.LA(1);
      if(!(_la === xpathParser.PATHSEP || _la === xpathParser.ABRPATH)) {
        this._errHandler.recoverInline(this);
      } else {
        this._errHandler.reportMatch(this);
        this.consume();
      }
      this.state = 68;
      this.step();
      this.state = 73;
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

function StepContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_step;
  return this;
}

StepContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
StepContext.prototype.constructor = StepContext;

StepContext.prototype.axisSpecifier = function() {
  return this.getTypedRuleContext(AxisSpecifierContext, 0);
};

StepContext.prototype.nodeTest = function() {
  return this.getTypedRuleContext(NodeTestContext, 0);
};

StepContext.prototype.predicate = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(PredicateContext);
  } else {
    return this.getTypedRuleContext(PredicateContext, i);
  }
};

StepContext.prototype.abbreviatedStep = function() {
  return this.getTypedRuleContext(AbbreviatedStepContext, 0);
};

StepContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterStep(this);
  }
};

StepContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitStep(this);
  }
};

StepContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitStep(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.StepContext = StepContext;

xpathParser.prototype.step = function() {
  var localctx = new StepContext(this, this._ctx, this.state);
  this.enterRule(localctx, 8, xpathParser.RULE_step);
  var _la = 0; // Token type
  try {
    this.state = 83;
    this._errHandler.sync(this);
    switch (this._input.LA(1)) {
      case xpathParser.T__0:
      case xpathParser.NodeType:
      case xpathParser.AxisName:
      case xpathParser.MUL:
      case xpathParser.AT:
      case xpathParser.NCName:
        this.enterOuterAlt(localctx, 1);
        this.state = 74;
        this.axisSpecifier();
        this.state = 75;
        this.nodeTest();
        this.state = 79;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la === xpathParser.LBRAC) {
          this.state = 76;
          this.predicate();
          this.state = 81;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        break;
      case xpathParser.DOT:
      case xpathParser.DOTDOT:
        this.enterOuterAlt(localctx, 2);
        this.state = 82;
        this.abbreviatedStep();
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

function AxisSpecifierContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_axisSpecifier;
  return this;
}

AxisSpecifierContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AxisSpecifierContext.prototype.constructor = AxisSpecifierContext;

AxisSpecifierContext.prototype.AxisName = function() {
  return this.getToken(xpathParser.AxisName, 0);
};

AxisSpecifierContext.prototype.CC = function() {
  return this.getToken(xpathParser.CC, 0);
};

AxisSpecifierContext.prototype.AT = function() {
  return this.getToken(xpathParser.AT, 0);
};

AxisSpecifierContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterAxisSpecifier(this);
  }
};

AxisSpecifierContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitAxisSpecifier(this);
  }
};

AxisSpecifierContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitAxisSpecifier(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.AxisSpecifierContext = AxisSpecifierContext;

xpathParser.prototype.axisSpecifier = function() {
  var localctx = new AxisSpecifierContext(this, this._ctx, this.state);
  this.enterRule(localctx, 10, xpathParser.RULE_axisSpecifier);
  var _la = 0; // Token type
  try {
    this.state = 90;
    this._errHandler.sync(this);
    var la_ = this._interp.adaptivePredict(this._input, 6, this._ctx);
    switch (la_) {
      case 1:
        this.enterOuterAlt(localctx, 1);
        this.state = 85;
        this.match(xpathParser.AxisName);
        this.state = 86;
        this.match(xpathParser.CC);
        break;

      case 2:
        this.enterOuterAlt(localctx, 2);
        this.state = 88;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la === xpathParser.AT) {
          this.state = 87;
          this.match(xpathParser.AT);
        }

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

function NodeTestContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_nodeTest;
  return this;
}

NodeTestContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
NodeTestContext.prototype.constructor = NodeTestContext;

NodeTestContext.prototype.nameTest = function() {
  return this.getTypedRuleContext(NameTestContext, 0);
};

NodeTestContext.prototype.NodeType = function() {
  return this.getToken(xpathParser.NodeType, 0);
};

NodeTestContext.prototype.LPAR = function() {
  return this.getToken(xpathParser.LPAR, 0);
};

NodeTestContext.prototype.RPAR = function() {
  return this.getToken(xpathParser.RPAR, 0);
};

NodeTestContext.prototype.Literal = function() {
  return this.getToken(xpathParser.Literal, 0);
};

NodeTestContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterNodeTest(this);
  }
};

NodeTestContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitNodeTest(this);
  }
};

NodeTestContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitNodeTest(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.NodeTestContext = NodeTestContext;

xpathParser.prototype.nodeTest = function() {
  var localctx = new NodeTestContext(this, this._ctx, this.state);
  this.enterRule(localctx, 12, xpathParser.RULE_nodeTest);
  try {
    this.state = 100;
    this._errHandler.sync(this);
    var la_ = this._interp.adaptivePredict(this._input, 7, this._ctx);
    switch (la_) {
      case 1:
        this.enterOuterAlt(localctx, 1);
        this.state = 92;
        this.nameTest();
        break;

      case 2:
        this.enterOuterAlt(localctx, 2);
        this.state = 93;
        this.match(xpathParser.NodeType);
        this.state = 94;
        this.match(xpathParser.LPAR);
        this.state = 95;
        this.match(xpathParser.RPAR);
        break;

      case 3:
        this.enterOuterAlt(localctx, 3);
        this.state = 96;
        this.match(xpathParser.T__0);
        this.state = 97;
        this.match(xpathParser.LPAR);
        this.state = 98;
        this.match(xpathParser.Literal);
        this.state = 99;
        this.match(xpathParser.RPAR);
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

function PredicateContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_predicate;
  return this;
}

PredicateContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PredicateContext.prototype.constructor = PredicateContext;

PredicateContext.prototype.LBRAC = function() {
  return this.getToken(xpathParser.LBRAC, 0);
};

PredicateContext.prototype.expr = function() {
  return this.getTypedRuleContext(ExprContext, 0);
};

PredicateContext.prototype.RBRAC = function() {
  return this.getToken(xpathParser.RBRAC, 0);
};

PredicateContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterPredicate(this);
  }
};

PredicateContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitPredicate(this);
  }
};

PredicateContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitPredicate(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.PredicateContext = PredicateContext;

xpathParser.prototype.predicate = function() {
  var localctx = new PredicateContext(this, this._ctx, this.state);
  this.enterRule(localctx, 14, xpathParser.RULE_predicate);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 102;
    this.match(xpathParser.LBRAC);
    this.state = 103;
    this.expr();
    this.state = 104;
    this.match(xpathParser.RBRAC);
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

function AbbreviatedStepContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_abbreviatedStep;
  return this;
}

AbbreviatedStepContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AbbreviatedStepContext.prototype.constructor = AbbreviatedStepContext;

AbbreviatedStepContext.prototype.DOT = function() {
  return this.getToken(xpathParser.DOT, 0);
};

AbbreviatedStepContext.prototype.DOTDOT = function() {
  return this.getToken(xpathParser.DOTDOT, 0);
};

AbbreviatedStepContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterAbbreviatedStep(this);
  }
};

AbbreviatedStepContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitAbbreviatedStep(this);
  }
};

AbbreviatedStepContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitAbbreviatedStep(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.AbbreviatedStepContext = AbbreviatedStepContext;

xpathParser.prototype.abbreviatedStep = function() {
  var localctx = new AbbreviatedStepContext(this, this._ctx, this.state);
  this.enterRule(localctx, 16, xpathParser.RULE_abbreviatedStep);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 106;
    _la = this._input.LA(1);
    if(!(_la === xpathParser.DOT || _la === xpathParser.DOTDOT)) {
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

function ExprContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_expr;
  return this;
}

ExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExprContext.prototype.constructor = ExprContext;

ExprContext.prototype.orExpr = function() {
  return this.getTypedRuleContext(OrExprContext, 0);
};

ExprContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterExpr(this);
  }
};

ExprContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitExpr(this);
  }
};

ExprContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitExpr(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.ExprContext = ExprContext;

xpathParser.prototype.expr = function() {
  var localctx = new ExprContext(this, this._ctx, this.state);
  this.enterRule(localctx, 18, xpathParser.RULE_expr);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 108;
    this.orExpr();
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

function PrimaryExprContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_primaryExpr;
  return this;
}

PrimaryExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PrimaryExprContext.prototype.constructor = PrimaryExprContext;

PrimaryExprContext.prototype.variableReference = function() {
  return this.getTypedRuleContext(VariableReferenceContext, 0);
};

PrimaryExprContext.prototype.LPAR = function() {
  return this.getToken(xpathParser.LPAR, 0);
};

PrimaryExprContext.prototype.expr = function() {
  return this.getTypedRuleContext(ExprContext, 0);
};

PrimaryExprContext.prototype.RPAR = function() {
  return this.getToken(xpathParser.RPAR, 0);
};

PrimaryExprContext.prototype.Literal = function() {
  return this.getToken(xpathParser.Literal, 0);
};

PrimaryExprContext.prototype.Number = function() {
  return this.getToken(xpathParser.Number, 0);
};

PrimaryExprContext.prototype.functionCall = function() {
  return this.getTypedRuleContext(FunctionCallContext, 0);
};

PrimaryExprContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterPrimaryExpr(this);
  }
};

PrimaryExprContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitPrimaryExpr(this);
  }
};

PrimaryExprContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitPrimaryExpr(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.PrimaryExprContext = PrimaryExprContext;

xpathParser.prototype.primaryExpr = function() {
  var localctx = new PrimaryExprContext(this, this._ctx, this.state);
  this.enterRule(localctx, 20, xpathParser.RULE_primaryExpr);
  try {
    this.state = 118;
    this._errHandler.sync(this);
    switch (this._input.LA(1)) {
      case xpathParser.T__7:
        this.enterOuterAlt(localctx, 1);
        this.state = 110;
        this.variableReference();
        break;
      case xpathParser.LPAR:
        this.enterOuterAlt(localctx, 2);
        this.state = 111;
        this.match(xpathParser.LPAR);
        this.state = 112;
        this.expr();
        this.state = 113;
        this.match(xpathParser.RPAR);
        break;
      case xpathParser.Literal:
        this.enterOuterAlt(localctx, 3);
        this.state = 115;
        this.match(xpathParser.Literal);
        break;
      case xpathParser.Number:
        this.enterOuterAlt(localctx, 4);
        this.state = 116;
        this.match(xpathParser.Number);
        break;
      case xpathParser.NodeType:
      case xpathParser.AxisName:
      case xpathParser.NCName:
        this.enterOuterAlt(localctx, 5);
        this.state = 117;
        this.functionCall();
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

function FunctionCallContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_functionCall;
  return this;
}

FunctionCallContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FunctionCallContext.prototype.constructor = FunctionCallContext;

FunctionCallContext.prototype.functionName = function() {
  return this.getTypedRuleContext(FunctionNameContext, 0);
};

FunctionCallContext.prototype.LPAR = function() {
  return this.getToken(xpathParser.LPAR, 0);
};

FunctionCallContext.prototype.RPAR = function() {
  return this.getToken(xpathParser.RPAR, 0);
};

FunctionCallContext.prototype.expr = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(ExprContext);
  } else {
    return this.getTypedRuleContext(ExprContext, i);
  }
};

FunctionCallContext.prototype.COMMA = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(xpathParser.COMMA);
  } else {
    return this.getToken(xpathParser.COMMA, i);
  }
};

FunctionCallContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterFunctionCall(this);
  }
};

FunctionCallContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitFunctionCall(this);
  }
};

FunctionCallContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitFunctionCall(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.FunctionCallContext = FunctionCallContext;

xpathParser.prototype.functionCall = function() {
  var localctx = new FunctionCallContext(this, this._ctx, this.state);
  this.enterRule(localctx, 22, xpathParser.RULE_functionCall);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 120;
    this.functionName();
    this.state = 121;
    this.match(xpathParser.LPAR);
    this.state = 130;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(
      ((_la & ~0x1f) == 0 &&
        ((1 << _la) &
          ((1 << xpathParser.T__0) |
            (1 << xpathParser.T__7) |
            (1 << xpathParser.NodeType) |
            (1 << xpathParser.Number) |
            (1 << xpathParser.AxisName) |
            (1 << xpathParser.PATHSEP) |
            (1 << xpathParser.ABRPATH) |
            (1 << xpathParser.LPAR) |
            (1 << xpathParser.MINUS) |
            (1 << xpathParser.DOT) |
            (1 << xpathParser.MUL) |
            (1 << xpathParser.DOTDOT) |
            (1 << xpathParser.AT))) !==
          0) ||
      _la === xpathParser.Literal ||
      _la === xpathParser.NCName
    ) {
      this.state = 122;
      this.expr();
      this.state = 127;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
      while(_la === xpathParser.COMMA) {
        this.state = 123;
        this.match(xpathParser.COMMA);
        this.state = 124;
        this.expr();
        this.state = 129;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
      }
    }

    this.state = 132;
    this.match(xpathParser.RPAR);
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

function UnionExprNoRootContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_unionExprNoRoot;
  return this;
}

UnionExprNoRootContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UnionExprNoRootContext.prototype.constructor = UnionExprNoRootContext;

UnionExprNoRootContext.prototype.pathExprNoRoot = function() {
  return this.getTypedRuleContext(PathExprNoRootContext, 0);
};

UnionExprNoRootContext.prototype.PIPE = function() {
  return this.getToken(xpathParser.PIPE, 0);
};

UnionExprNoRootContext.prototype.unionExprNoRoot = function() {
  return this.getTypedRuleContext(UnionExprNoRootContext, 0);
};

UnionExprNoRootContext.prototype.PATHSEP = function() {
  return this.getToken(xpathParser.PATHSEP, 0);
};

UnionExprNoRootContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterUnionExprNoRoot(this);
  }
};

UnionExprNoRootContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitUnionExprNoRoot(this);
  }
};

UnionExprNoRootContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitUnionExprNoRoot(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.UnionExprNoRootContext = UnionExprNoRootContext;

xpathParser.prototype.unionExprNoRoot = function() {
  var localctx = new UnionExprNoRootContext(this, this._ctx, this.state);
  this.enterRule(localctx, 24, xpathParser.RULE_unionExprNoRoot);
  var _la = 0; // Token type
  try {
    this.state = 142;
    this._errHandler.sync(this);
    var la_ = this._interp.adaptivePredict(this._input, 12, this._ctx);
    switch (la_) {
      case 1:
        this.enterOuterAlt(localctx, 1);
        this.state = 134;
        this.pathExprNoRoot();
        this.state = 137;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la === xpathParser.PIPE) {
          this.state = 135;
          this.match(xpathParser.PIPE);
          this.state = 136;
          this.unionExprNoRoot();
        }

        break;

      case 2:
        this.enterOuterAlt(localctx, 2);
        this.state = 139;
        this.match(xpathParser.PATHSEP);
        this.state = 140;
        this.match(xpathParser.PIPE);
        this.state = 141;
        this.unionExprNoRoot();
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

function PathExprNoRootContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_pathExprNoRoot;
  return this;
}

PathExprNoRootContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PathExprNoRootContext.prototype.constructor = PathExprNoRootContext;

PathExprNoRootContext.prototype.locationPath = function() {
  return this.getTypedRuleContext(LocationPathContext, 0);
};

PathExprNoRootContext.prototype.filterExpr = function() {
  return this.getTypedRuleContext(FilterExprContext, 0);
};

PathExprNoRootContext.prototype.relativeLocationPath = function() {
  return this.getTypedRuleContext(RelativeLocationPathContext, 0);
};

PathExprNoRootContext.prototype.PATHSEP = function() {
  return this.getToken(xpathParser.PATHSEP, 0);
};

PathExprNoRootContext.prototype.ABRPATH = function() {
  return this.getToken(xpathParser.ABRPATH, 0);
};

PathExprNoRootContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterPathExprNoRoot(this);
  }
};

PathExprNoRootContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitPathExprNoRoot(this);
  }
};

PathExprNoRootContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitPathExprNoRoot(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.PathExprNoRootContext = PathExprNoRootContext;

xpathParser.prototype.pathExprNoRoot = function() {
  var localctx = new PathExprNoRootContext(this, this._ctx, this.state);
  this.enterRule(localctx, 26, xpathParser.RULE_pathExprNoRoot);
  var _la = 0; // Token type
  try {
    this.state = 150;
    this._errHandler.sync(this);
    var la_ = this._interp.adaptivePredict(this._input, 14, this._ctx);
    switch (la_) {
      case 1:
        this.enterOuterAlt(localctx, 1);
        this.state = 144;
        this.locationPath();
        break;

      case 2:
        this.enterOuterAlt(localctx, 2);
        this.state = 145;
        this.filterExpr();
        this.state = 148;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la === xpathParser.PATHSEP || _la === xpathParser.ABRPATH) {
          this.state = 146;
          _la = this._input.LA(1);
          if(!(_la === xpathParser.PATHSEP || _la === xpathParser.ABRPATH)) {
            this._errHandler.recoverInline(this);
          } else {
            this._errHandler.reportMatch(this);
            this.consume();
          }
          this.state = 147;
          this.relativeLocationPath();
        }

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

function FilterExprContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_filterExpr;
  return this;
}

FilterExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FilterExprContext.prototype.constructor = FilterExprContext;

FilterExprContext.prototype.primaryExpr = function() {
  return this.getTypedRuleContext(PrimaryExprContext, 0);
};

FilterExprContext.prototype.predicate = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(PredicateContext);
  } else {
    return this.getTypedRuleContext(PredicateContext, i);
  }
};

FilterExprContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterFilterExpr(this);
  }
};

FilterExprContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitFilterExpr(this);
  }
};

FilterExprContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitFilterExpr(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.FilterExprContext = FilterExprContext;

xpathParser.prototype.filterExpr = function() {
  var localctx = new FilterExprContext(this, this._ctx, this.state);
  this.enterRule(localctx, 28, xpathParser.RULE_filterExpr);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 152;
    this.primaryExpr();
    this.state = 156;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === xpathParser.LBRAC) {
      this.state = 153;
      this.predicate();
      this.state = 158;
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

function OrExprContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_orExpr;
  return this;
}

OrExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
OrExprContext.prototype.constructor = OrExprContext;

OrExprContext.prototype.andExpr = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(AndExprContext);
  } else {
    return this.getTypedRuleContext(AndExprContext, i);
  }
};

OrExprContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterOrExpr(this);
  }
};

OrExprContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitOrExpr(this);
  }
};

OrExprContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitOrExpr(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.OrExprContext = OrExprContext;

xpathParser.prototype.orExpr = function() {
  var localctx = new OrExprContext(this, this._ctx, this.state);
  this.enterRule(localctx, 30, xpathParser.RULE_orExpr);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 159;
    this.andExpr();
    this.state = 164;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === xpathParser.T__1) {
      this.state = 160;
      this.match(xpathParser.T__1);
      this.state = 161;
      this.andExpr();
      this.state = 166;
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

function AndExprContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_andExpr;
  return this;
}

AndExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AndExprContext.prototype.constructor = AndExprContext;

AndExprContext.prototype.equalityExpr = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(EqualityExprContext);
  } else {
    return this.getTypedRuleContext(EqualityExprContext, i);
  }
};

AndExprContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterAndExpr(this);
  }
};

AndExprContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitAndExpr(this);
  }
};

AndExprContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitAndExpr(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.AndExprContext = AndExprContext;

xpathParser.prototype.andExpr = function() {
  var localctx = new AndExprContext(this, this._ctx, this.state);
  this.enterRule(localctx, 32, xpathParser.RULE_andExpr);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 167;
    this.equalityExpr();
    this.state = 172;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === xpathParser.T__2) {
      this.state = 168;
      this.match(xpathParser.T__2);
      this.state = 169;
      this.equalityExpr();
      this.state = 174;
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

function EqualityExprContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_equalityExpr;
  return this;
}

EqualityExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
EqualityExprContext.prototype.constructor = EqualityExprContext;

EqualityExprContext.prototype.relationalExpr = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(RelationalExprContext);
  } else {
    return this.getTypedRuleContext(RelationalExprContext, i);
  }
};

EqualityExprContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterEqualityExpr(this);
  }
};

EqualityExprContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitEqualityExpr(this);
  }
};

EqualityExprContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitEqualityExpr(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.EqualityExprContext = EqualityExprContext;

xpathParser.prototype.equalityExpr = function() {
  var localctx = new EqualityExprContext(this, this._ctx, this.state);
  this.enterRule(localctx, 34, xpathParser.RULE_equalityExpr);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 175;
    this.relationalExpr();
    this.state = 180;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === xpathParser.T__3 || _la === xpathParser.T__4) {
      this.state = 176;
      _la = this._input.LA(1);
      if(!(_la === xpathParser.T__3 || _la === xpathParser.T__4)) {
        this._errHandler.recoverInline(this);
      } else {
        this._errHandler.reportMatch(this);
        this.consume();
      }
      this.state = 177;
      this.relationalExpr();
      this.state = 182;
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

function RelationalExprContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_relationalExpr;
  return this;
}

RelationalExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
RelationalExprContext.prototype.constructor = RelationalExprContext;

RelationalExprContext.prototype.additiveExpr = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(AdditiveExprContext);
  } else {
    return this.getTypedRuleContext(AdditiveExprContext, i);
  }
};

RelationalExprContext.prototype.LESS = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(xpathParser.LESS);
  } else {
    return this.getToken(xpathParser.LESS, i);
  }
};

RelationalExprContext.prototype.MORE_ = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(xpathParser.MORE_);
  } else {
    return this.getToken(xpathParser.MORE_, i);
  }
};

RelationalExprContext.prototype.LE = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(xpathParser.LE);
  } else {
    return this.getToken(xpathParser.LE, i);
  }
};

RelationalExprContext.prototype.GE = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(xpathParser.GE);
  } else {
    return this.getToken(xpathParser.GE, i);
  }
};

RelationalExprContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterRelationalExpr(this);
  }
};

RelationalExprContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitRelationalExpr(this);
  }
};

RelationalExprContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitRelationalExpr(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.RelationalExprContext = RelationalExprContext;

xpathParser.prototype.relationalExpr = function() {
  var localctx = new RelationalExprContext(this, this._ctx, this.state);
  this.enterRule(localctx, 36, xpathParser.RULE_relationalExpr);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 183;
    this.additiveExpr();
    this.state = 188;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(
      (_la & ~0x1f) == 0 &&
      ((1 << _la) &
        ((1 << xpathParser.LESS) |
          (1 << xpathParser.MORE_) |
          (1 << xpathParser.LE) |
          (1 << xpathParser.GE))) !==
        0
    ) {
      this.state = 184;
      _la = this._input.LA(1);
      if(
        !(
          (_la & ~0x1f) == 0 &&
          ((1 << _la) &
            ((1 << xpathParser.LESS) |
              (1 << xpathParser.MORE_) |
              (1 << xpathParser.LE) |
              (1 << xpathParser.GE))) !==
            0
        )
      ) {
        this._errHandler.recoverInline(this);
      } else {
        this._errHandler.reportMatch(this);
        this.consume();
      }
      this.state = 185;
      this.additiveExpr();
      this.state = 190;
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

function AdditiveExprContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_additiveExpr;
  return this;
}

AdditiveExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AdditiveExprContext.prototype.constructor = AdditiveExprContext;

AdditiveExprContext.prototype.multiplicativeExpr = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(MultiplicativeExprContext);
  } else {
    return this.getTypedRuleContext(MultiplicativeExprContext, i);
  }
};

AdditiveExprContext.prototype.PLUS = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(xpathParser.PLUS);
  } else {
    return this.getToken(xpathParser.PLUS, i);
  }
};

AdditiveExprContext.prototype.MINUS = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(xpathParser.MINUS);
  } else {
    return this.getToken(xpathParser.MINUS, i);
  }
};

AdditiveExprContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterAdditiveExpr(this);
  }
};

AdditiveExprContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitAdditiveExpr(this);
  }
};

AdditiveExprContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitAdditiveExpr(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.AdditiveExprContext = AdditiveExprContext;

xpathParser.prototype.additiveExpr = function() {
  var localctx = new AdditiveExprContext(this, this._ctx, this.state);
  this.enterRule(localctx, 38, xpathParser.RULE_additiveExpr);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 191;
    this.multiplicativeExpr();
    this.state = 196;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === xpathParser.MINUS || _la === xpathParser.PLUS) {
      this.state = 192;
      _la = this._input.LA(1);
      if(!(_la === xpathParser.MINUS || _la === xpathParser.PLUS)) {
        this._errHandler.recoverInline(this);
      } else {
        this._errHandler.reportMatch(this);
        this.consume();
      }
      this.state = 193;
      this.multiplicativeExpr();
      this.state = 198;
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

function MultiplicativeExprContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_multiplicativeExpr;
  return this;
}

MultiplicativeExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MultiplicativeExprContext.prototype.constructor = MultiplicativeExprContext;

MultiplicativeExprContext.prototype.unaryExprNoRoot = function() {
  return this.getTypedRuleContext(UnaryExprNoRootContext, 0);
};

MultiplicativeExprContext.prototype.multiplicativeExpr = function() {
  return this.getTypedRuleContext(MultiplicativeExprContext, 0);
};

MultiplicativeExprContext.prototype.MUL = function() {
  return this.getToken(xpathParser.MUL, 0);
};

MultiplicativeExprContext.prototype.PATHSEP = function() {
  return this.getToken(xpathParser.PATHSEP, 0);
};

MultiplicativeExprContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterMultiplicativeExpr(this);
  }
};

MultiplicativeExprContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitMultiplicativeExpr(this);
  }
};

MultiplicativeExprContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitMultiplicativeExpr(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.MultiplicativeExprContext = MultiplicativeExprContext;

xpathParser.prototype.multiplicativeExpr = function() {
  var localctx = new MultiplicativeExprContext(this, this._ctx, this.state);
  this.enterRule(localctx, 40, xpathParser.RULE_multiplicativeExpr);
  var _la = 0; // Token type
  try {
    this.state = 209;
    this._errHandler.sync(this);
    var la_ = this._interp.adaptivePredict(this._input, 23, this._ctx);
    switch (la_) {
      case 1:
        this.enterOuterAlt(localctx, 1);
        this.state = 199;
        this.unaryExprNoRoot();
        this.state = 202;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(
          (_la & ~0x1f) == 0 &&
          ((1 << _la) &
            ((1 << xpathParser.T__5) | (1 << xpathParser.T__6) | (1 << xpathParser.MUL))) !==
            0
        ) {
          this.state = 200;
          _la = this._input.LA(1);
          if(
            !(
              (_la & ~0x1f) == 0 &&
              ((1 << _la) &
                ((1 << xpathParser.T__5) | (1 << xpathParser.T__6) | (1 << xpathParser.MUL))) !==
                0
            )
          ) {
            this._errHandler.recoverInline(this);
          } else {
            this._errHandler.reportMatch(this);
            this.consume();
          }
          this.state = 201;
          this.multiplicativeExpr();
        }

        break;

      case 2:
        this.enterOuterAlt(localctx, 2);
        this.state = 204;
        this.match(xpathParser.PATHSEP);
        this.state = 207;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la === xpathParser.T__5 || _la === xpathParser.T__6) {
          this.state = 205;
          _la = this._input.LA(1);
          if(!(_la === xpathParser.T__5 || _la === xpathParser.T__6)) {
            this._errHandler.recoverInline(this);
          } else {
            this._errHandler.reportMatch(this);
            this.consume();
          }
          this.state = 206;
          this.multiplicativeExpr();
        }

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

function UnaryExprNoRootContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_unaryExprNoRoot;
  return this;
}

UnaryExprNoRootContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UnaryExprNoRootContext.prototype.constructor = UnaryExprNoRootContext;

UnaryExprNoRootContext.prototype.unionExprNoRoot = function() {
  return this.getTypedRuleContext(UnionExprNoRootContext, 0);
};

UnaryExprNoRootContext.prototype.MINUS = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTokens(xpathParser.MINUS);
  } else {
    return this.getToken(xpathParser.MINUS, i);
  }
};

UnaryExprNoRootContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterUnaryExprNoRoot(this);
  }
};

UnaryExprNoRootContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitUnaryExprNoRoot(this);
  }
};

UnaryExprNoRootContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitUnaryExprNoRoot(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.UnaryExprNoRootContext = UnaryExprNoRootContext;

xpathParser.prototype.unaryExprNoRoot = function() {
  var localctx = new UnaryExprNoRootContext(this, this._ctx, this.state);
  this.enterRule(localctx, 42, xpathParser.RULE_unaryExprNoRoot);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 214;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while(_la === xpathParser.MINUS) {
      this.state = 211;
      this.match(xpathParser.MINUS);
      this.state = 216;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
    }
    this.state = 217;
    this.unionExprNoRoot();
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

function QNameContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_qName;
  return this;
}

QNameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
QNameContext.prototype.constructor = QNameContext;

QNameContext.prototype.nCName = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(NCNameContext);
  } else {
    return this.getTypedRuleContext(NCNameContext, i);
  }
};

QNameContext.prototype.COLON = function() {
  return this.getToken(xpathParser.COLON, 0);
};

QNameContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterQName(this);
  }
};

QNameContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitQName(this);
  }
};

QNameContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitQName(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.QNameContext = QNameContext;

xpathParser.prototype.qName = function() {
  var localctx = new QNameContext(this, this._ctx, this.state);
  this.enterRule(localctx, 44, xpathParser.RULE_qName);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 219;
    this.nCName();
    this.state = 222;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    if(_la === xpathParser.COLON) {
      this.state = 220;
      this.match(xpathParser.COLON);
      this.state = 221;
      this.nCName();
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

function FunctionNameContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_functionName;
  return this;
}

FunctionNameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FunctionNameContext.prototype.constructor = FunctionNameContext;

FunctionNameContext.prototype.nCName = function(i) {
  if(i === undefined) {
    i = null;
  }
  if(i === null) {
    return this.getTypedRuleContexts(NCNameContext);
  } else {
    return this.getTypedRuleContext(NCNameContext, i);
  }
};

FunctionNameContext.prototype.COLON = function() {
  return this.getToken(xpathParser.COLON, 0);
};

FunctionNameContext.prototype.NCName = function() {
  return this.getToken(xpathParser.NCName, 0);
};

FunctionNameContext.prototype.AxisName = function() {
  return this.getToken(xpathParser.AxisName, 0);
};

FunctionNameContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterFunctionName(this);
  }
};

FunctionNameContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitFunctionName(this);
  }
};

FunctionNameContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitFunctionName(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.FunctionNameContext = FunctionNameContext;

xpathParser.prototype.functionName = function() {
  var localctx = new FunctionNameContext(this, this._ctx, this.state);
  this.enterRule(localctx, 46, xpathParser.RULE_functionName);
  try {
    this.state = 230;
    this._errHandler.sync(this);
    var la_ = this._interp.adaptivePredict(this._input, 26, this._ctx);
    switch (la_) {
      case 1:
        this.enterOuterAlt(localctx, 1);
        this.state = 224;
        this.nCName();
        this.state = 225;
        this.match(xpathParser.COLON);
        this.state = 226;
        this.nCName();
        break;

      case 2:
        this.enterOuterAlt(localctx, 2);
        this.state = 228;
        this.match(xpathParser.NCName);
        break;

      case 3:
        this.enterOuterAlt(localctx, 3);
        this.state = 229;
        this.match(xpathParser.AxisName);
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

function VariableReferenceContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_variableReference;
  return this;
}

VariableReferenceContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
VariableReferenceContext.prototype.constructor = VariableReferenceContext;

VariableReferenceContext.prototype.qName = function() {
  return this.getTypedRuleContext(QNameContext, 0);
};

VariableReferenceContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterVariableReference(this);
  }
};

VariableReferenceContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitVariableReference(this);
  }
};

VariableReferenceContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitVariableReference(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.VariableReferenceContext = VariableReferenceContext;

xpathParser.prototype.variableReference = function() {
  var localctx = new VariableReferenceContext(this, this._ctx, this.state);
  this.enterRule(localctx, 48, xpathParser.RULE_variableReference);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 232;
    this.match(xpathParser.T__7);
    this.state = 233;
    this.qName();
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

function NameTestContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_nameTest;
  return this;
}

NameTestContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
NameTestContext.prototype.constructor = NameTestContext;

NameTestContext.prototype.MUL = function() {
  return this.getToken(xpathParser.MUL, 0);
};

NameTestContext.prototype.nCName = function() {
  return this.getTypedRuleContext(NCNameContext, 0);
};

NameTestContext.prototype.COLON = function() {
  return this.getToken(xpathParser.COLON, 0);
};

NameTestContext.prototype.qName = function() {
  return this.getTypedRuleContext(QNameContext, 0);
};

NameTestContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterNameTest(this);
  }
};

NameTestContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitNameTest(this);
  }
};

NameTestContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitNameTest(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.NameTestContext = NameTestContext;

xpathParser.prototype.nameTest = function() {
  var localctx = new NameTestContext(this, this._ctx, this.state);
  this.enterRule(localctx, 50, xpathParser.RULE_nameTest);
  try {
    this.state = 241;
    this._errHandler.sync(this);
    var la_ = this._interp.adaptivePredict(this._input, 27, this._ctx);
    switch (la_) {
      case 1:
        this.enterOuterAlt(localctx, 1);
        this.state = 235;
        this.match(xpathParser.MUL);
        break;

      case 2:
        this.enterOuterAlt(localctx, 2);
        this.state = 236;
        this.nCName();
        this.state = 237;
        this.match(xpathParser.COLON);
        this.state = 238;
        this.match(xpathParser.MUL);
        break;

      case 3:
        this.enterOuterAlt(localctx, 3);
        this.state = 240;
        this.qName();
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

function NCNameContext(parser, parent, invokingState) {
  if(parent === undefined) {
    parent = null;
  }
  if(invokingState === undefined || invokingState === null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = xpathParser.RULE_nCName;
  return this;
}

NCNameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
NCNameContext.prototype.constructor = NCNameContext;

NCNameContext.prototype.NCName = function() {
  return this.getToken(xpathParser.NCName, 0);
};

NCNameContext.prototype.AxisName = function() {
  return this.getToken(xpathParser.AxisName, 0);
};

NCNameContext.prototype.NodeType = function() {
  return this.getToken(xpathParser.NodeType, 0);
};

NCNameContext.prototype.enterRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.enterNCName(this);
  }
};

NCNameContext.prototype.exitRule = function(listener) {
  if(listener instanceof xpathListener) {
    listener.exitNCName(this);
  }
};

NCNameContext.prototype.accept = function(visitor) {
  if(visitor instanceof xpathVisitor) {
    return visitor.visitNCName(this);
  } else {
    return visitor.visitChildren(this);
  }
};

xpathParser.NCNameContext = NCNameContext;

xpathParser.prototype.nCName = function() {
  var localctx = new NCNameContext(this, this._ctx, this.state);
  this.enterRule(localctx, 52, xpathParser.RULE_nCName);
  var _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 243;
    _la = this._input.LA(1);
    if(
      !(
        ((_la - 9) & ~0x1f) == 0 &&
        ((1 << (_la - 9)) &
          ((1 << (xpathParser.NodeType - 9)) |
            (1 << (xpathParser.AxisName - 9)) |
            (1 << (xpathParser.NCName - 9)))) !==
          0
      )
    ) {
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

exports.xpathParser = xpathParser;
