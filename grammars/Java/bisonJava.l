%option noyywrap

%{
	#include <stdlib.h> 
	#include "parser.h"

	unsigned int lineCount = 1;

	void SetInputFile(const char* strFileName);
	void CloseInputFile();

	FILE* pInputFile = NULL;
%}

%x COMMENT COMMENT_LINE

%%

"package" { return PACKAGE; }
"import" {return IMPORT; }
"public" {return PUBLIC; }
"private" {return PRIVATE; }
"protected" {return PROTECTED;}
"static" {return STATIC; }
"final" {return FINAL;}
"native" {return NATIVE; }
"synchronized" {return SYNCHRONIZED; }
"abstract" {return ABSTRACT;}
"treadsafe" {return TREADSAFE; }
"transient" {return TRANSIENT; }
"boolean" {yylval = strdup(yytext); return BOOLEAN; }
"byte" {yylval = strdup(yytext); return BYTE;}
"char" {yylval = strdup(yytext); return CHAR;}
"short" {yylval = strdup(yytext); return SHORT;}
"int" {yylval = strdup(yytext); return INT;}
"float" {yylval = strdup(yytext); return FLOAT;}
"long" {yylval = strdup(yytext); return LONG;}
"double" {yylval = strdup(yytext); return DOUBLE;}


"class"	{ return CLASS; }
"extends" { return EXTENDS;}
"implements" {return IMPLEMENTS; }
"interface" {return INTERFACE; }
"if" {return IF; }
"else" {return ELSE; }
"do" {return DO; }
"while" {return WHILE;}
"for" {return FOR; }
"try" {return TRY; }
"catch" {return CATCH;}
"finally" {return FINALLY;}
"switch" {return SWITCH;}
"case" {return CASE;}
"default" {return DEFAULT;}
"true" {return TRUE;}
"false" {return FALSE;}
"new" {return NEW;}
"null" {return _NULL;}
"super" {return SUPER;}
"this" {return THIS;}
"instanceof" {return INSTANCEOF;}
"synchronized" {return SYNCHRONIZED;}
"return" {return RETURN;}
"throw" {return THROW;}
"break" {return BREAK;}
"continue" {return CONTINUE;}

"/*" {BEGIN(COMMENT); }
"//" {BEGIN(COMMENT_LINE); }

<COMMENT>{
"*/" {BEGIN(INITIAL); } 
"\n"	{++lineCount; }
.	;
}

<COMMENT_LINE>{
"\n" {++lineCount; BEGIN(INITIAL); }
.	;
}

"'"[a-zA-Z0-9$_]"'" {return CHAR_VAL; }
"\""[a-zA-Z0-9$_]*"\"" {return STRING; }
"-"?([0]|[1-9][0-9]*) {return INTEGER_LITERAL; }
"-"?([0]|[1-9][0-9]*)"."[0-9]+ {return FLOAT_LITERAL; }

"&" {return AMPERSAND; }
";" { return yytext[0]; }
"." { return yytext[0]; }
"{" { return yytext[0]; }
"}" { return yytext[0]; }
"[" {return yytext[0]; }
"]" {return yytext[0]; }
"(" {return yytext[0]; }
")" {return yytext[0]; }
"," {return yytext[0]; }
"=" {return yytext[0]; }
"*" {return yytext[0]; }
"+" {return yytext[0]; }
">"	{return yytext[0]; }
"<"	{return yytext[0]; }
"!"	{return yytext[0]; }
"?" {return yytext[0]; }
":" {return yytext[0]; }
"|" {return yytext[0]; }
"^"	{return yytext[0]; }
"%"	{return yytext[0]; }
"~" {return yytext[0]; }

[a-zA-Z$_]+[a-zA-Z0-9$_]* {yylval = strdup(yytext); return IDENTIFIER; }


\n {++lineCount;}
\t|" " ;
. {printf("Niespodziewany symbol: %c\n", yytext[0]); return ERROR;}

%%

void SetInputFile(const char* strFileName){
	if(strFileName){
		pInputFile = fopen(strFileName, "r");
		yyin = pInputFile;
	}
}

void CloseInputFile(){
	if(pInputFile){
		fclose(pInputFile);
		pInputFile = NULL;
	}
}

unsigned int getLineCount(){
	return lineCount;
}