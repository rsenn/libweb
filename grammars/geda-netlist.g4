/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

grammar GedaNetlistGrammar;


geda_netlist : components nets  EOF;


value : [^\r\n()\x5b\x5d]*;
//value : [^()\x5b\x5d]*;

values : (value   NL)*;
 
components : (LINE_COMMENT | component)*;
nets : (LINE_COMMENT | net)*;

component : LBRACK  values RBRACK;
net : LPAREN  values RPAREN;

DELIM : ( '\n' | '\r' | '(' | ')' | '[' | ']' ) ;
TEXT : ~( '\n' | '\r' | '(' | ')' | '[' | ']' ) ;

 
LBRACK	: '[' -> skip ;
RBRACK	: ']' -> skip  ;

LPAREN	: '(' -> skip ;
RPAREN	: ')' -> skip  ;

LINE_COMMENT : ';' ~('\n'|'\r')*  ->  channel(HIDDEN);

NL  :  [\r\n]  -> skip
WS  :  [\r\n\t\s]+  -> skip
;
