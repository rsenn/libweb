/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

grammar IniFileGrammar;


ini : (LINE_COMMENT | section)*  EOF;

section : section_header WS?  key_value*;

section_header : LBRACK section_header_title RBRACK ;

section_header_title : [A-Za-z0-9_]+;

//key_values : (key_value   WS?)*;
key_values : key_value+;

key_value : key EQUALS value WS?;
               
key :  [-A-Za-z0-9_{}]+;

value : [^\n\r]* ;





text :TEXT;
TEXT: ( 'a' .. 'z' | 'A' .. 'Z' | '_' | '0' .. '9' | '/' | '\\' | ':' | '*' | '.' | ',' | '@' | ' ')+;
        //( 'a' .. 'z' | 'A' .. 'Z' | '_' | '0' .. '9' | '/'| '\\' | ':')* ;

//TEXT : ( ~('='|'\n') )*;

EQUALS	: [=] -> skip;

LBRACK	: '[' -> skip ;

RBRACK	: ']' -> skip  ;

LINE_COMMENT : ';' ~('\n'|'\r')*  ->  channel(HIDDEN);

WS  :  [\r\n\t\s]+  -> skip
;
