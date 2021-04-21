%{
	#include <stdio.h>
	#include <stdlib.h>
	#include "bison_file.tab.h"

%}

%%

"\t"|" "|"\n" {printf("%s",yytext);}

(("#".*)|("//".*))"\n" { }

("/*"(.|"\n")*"*/") { return DOC_COMMENT; }	

"\"".*"\""   {printf("%s",yytext);return LITERAL;}

"\'"."\'" | "\'"\n"\'"   {printf("%s",yytext);return SINGLE_QUOTE;}

[0-9]+ {printf("%s",yytext); return NUM;}

"FLOAT_TYPE" {printf("%s",yytext); return FLOAT_TYPE_SUFFIX;}

"[" {printf("%s",yytext); return LSB;}

"]" {printf("%s",yytext); return RSB;}

"{" {printf("%s",yytext); return LC;}

"}" {printf("%s",yytext); return RC;}

"(" {printf("%s",yytext); return LP;}

")" {printf("%s",yytext); return RP;}

"," {printf("%s",yytext); return COMMA;}

";" {printf("%s",yytext); return SCOLON;}

":" {printf("%s",yytext); return COLON;}

"." {printf("%s",yytext); return DOT;}

"?" {printf("%s",yytext); return QUESMARK;}

"+" {printf("%s",yytext); return ADD;}

"-" {printf("%s",yytext); return SUB;}

"*" {printf("%s",yytext); return MUL;}

"/" {printf("%s",yytext); return DIV;}

"%" {printf("%s",yytext); return MOD;}

"=" {printf("%s",yytext); return ASSIGN;}

"+=" {printf("%s",yytext); return ADDASSIGN;}

"-=" {printf("%s",yytext); return SUBASSIGN;}

"*=" {printf("%s",yytext); return MULASSIGN;}

"/=" {printf("%s",yytext); return DIVASSIGN;}

"%=" {printf("%s",yytext); return MODASSIGN;}

"++" {printf("%s",yytext); return INCREMENT;}

"--" {printf("%s",yytext); return DECREMENT;}

"EXPONENT" {printf("%s",yytext); return EXP;}

"\"" {printf("%s",yytext); return DQ;}

"<" {printf("%s",yytext); return LT;}

">" {printf("%s",yytext); return GT;}

"<=" {printf("%s",yytext); return LTE;}

">=" {printf("%s",yytext); return GTE;}

"==" {printf("%s",yytext); return EQEQ;}

"!=" {printf("%s",yytext); return NTEQ;}

"!" {printf("%s",yytext); return NOT;}

"&" {printf("%s",yytext); return BAND;}

"|" {printf("%s",yytext); return BOR;}

"&=" {printf("%s",yytext); return BANDEQ;}

"|=" {printf("%s",yytext); return BOREQ;}

"^" {printf("%s",yytext); return BXOR;}

"^=" {printf("%s",yytext); return BXOREQ;}

"&&" {printf("%s",yytext); return LAND;}

"||" {printf("%s",yytext); return LOR;}

"~" {printf("%s",yytext); return TILDE;}

">>" {printf("%s",yytext); return SIGNED_RSHIFT;}

"<<" {printf("%s",yytext); return SIGNED_LSHIFT;}

">>>" {printf("%s",yytext); return UNSIGNED_RSHIFT;}

"true" {printf("%s",yytext); return TRUE;}

"false" {printf("%s",yytext); return FALSE;}

"abstract" {printf("%s",yytext); return ABSTRACT;}

"assert" {printf("%s",yytext); return ASSERT;}

"boolean" {printf("%s",yytext); return BOOLEAN;}

"break" {printf("%s",yytext); return BREAK;}

"byte" {printf("%s",yytext); return BYTE;}

"case" {printf("%s",yytext); return CASE;}

"catch" {printf("%s",yytext); return CATCH;}

"char" {printf("%s",yytext); return CHAR;}

"class" {printf("%s",yytext); return CLASS;}

"const" {printf("%s",yytext); return CONST;}

"continue" {printf("%s",yytext); return CONTINUE;}

"default" {printf("%s",yytext); return DEFAULT;}

"do" {printf("%s",yytext); return DO;}

"double" {printf("%s",yytext); return DOUBLE;}

"else" {printf("%s",yytext); return ELSE;}

"enum" {printf("%s",yytext); return ENUM;}

"extends" {printf("%s",yytext); return EXTENDS;}

"final" {printf("%s",yytext); return FINAL;}

"finally" {printf("%s",yytext); return FINALLY;}

"float" {printf("%s",yytext); return FLOAT;}

"for" {printf("%s",yytext); return FOR;}

"goto" {printf("%s",yytext); return GOTO;}

"if" {printf("%s",yytext); return IF;}

"implements" {printf("%s",yytext); return IMPLEMENTS;}

"import" {printf("%s",yytext); return IMPORT;}

"instanceof" {printf("%s",yytext); return INSTANCEOF;}

"int" {printf("%s",yytext); return INT;}

"interface" {printf("%s",yytext); return INTERFACE;}

"long" {printf("%s",yytext); return LONG;}

"native" {printf("%s",yytext); return NATIVE;}

"new" {printf("%s",yytext); return NEW;}

"package" {printf("%s",yytext); return PACKAGE;}

"private" {printf("%s",yytext); return PRIVATE;}

"protected" {printf("%s",yytext); return PROTECTED;}

"public" {printf("%s",yytext); return PUBLIC;}

"return" {printf("%s",yytext); return RETURN;}

"short" {printf("%s",yytext); return SHORT;}

"static" {printf("%s",yytext); return STATIC;}

"strictfp" {printf("%s",yytext); return STRICTFP;}

"super" {printf("%s",yytext); return SUPER;}

"switch" {printf("%s",yytext); return SWITCH;}

"synchronized" {printf("%s",yytext); return SYNCHRONIZED;}

"this" {printf("%s",yytext); return THIS;}

"threadsafe" {printf("%s",yytext); return THREADSAFE;}

"throw" {printf("%s",yytext); return THROW;}

"throws" {printf("%s",yytext); return THROWS;}

"transient" {printf("%s",yytext); return TRANSIENT;}

"try" {printf("%s",yytext); return TRY;}

"void" {printf("%s",yytext); return VOID;}

"volatile" {printf("%s",yytext); return VOLATILE;}

"while" {printf("%s",yytext); return WHILE;}

"String" {printf("%s",yytext); return STRING;}

"0x"[0-9a-f]+ {printf("%s",yytext); return HEXNUM;}

"redundant" {printf("%s",yytext); return REDUNDANT;}


[a-zA-Z_][a-zA-Z0-9_]* {printf("%s",yytext); return IDENTIFIER;}

%%

int yywrap(){return 1;}