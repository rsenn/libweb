  // FLEX file example1.l
%{
 #include <cstdio>
 #include <string>
 using namespace std;
 #include "biflex.tab.h"  // output of bison on example1.y
 
 void yyerror(char*);
// int yyparse(void);
%}

%%

[ \t\n]+               ;  // do nothing on whitespace
"System.out.println"   return PRINT;
"true"                 {yylval.bool_val = true; return BOOLEAN;}
"false"                {yylval.bool_val = false; return BOOLEAN;}
"if"                   return IF;
"else"                 return ELSE;
"while"                return WHILE;
"for"                  return FOR;

byte|short|int|long|float|double|char|string|boolean   {yylval.str_val = new string(yytext); return TYPE;}
[a-zA-Z][a-zA-Z0-9]*   {yylval.str_val = new string(yytext); return VARIABLE;}
[0-9][0-9]*(.[0-9]+)?  {yylval.double_val = atof(yytext); return NUMBER;}

"="                    return EQUALS;
"+"                    return PLUS;
"-"                    return MINUS;
"*"                    return ASTERISK;
"/"                    return FSLASH;
"("                    return LPAREN;
")"                    return RPAREN;
";"                    return SEMICOLON;
"&&"                   return ANDOP;
"||"                   return OROP;
"!"                    return NOTOP;
"{"                    return LBRACE;
"}"                    return RBRACE;
">"                    return GT;
"<"                    return ST;
">="                   return GTE;
"<="                   return STE;
"=="                   return EQ;
"!="                   return NEQ;

%%

void yyerror(char* s) {printf("Parse Error: %s\n",s);}
int yywrap(void) { }
int main(int num_args, char** args) {
  if(num_args != 2) {printf("Usage: ./parser filename\n"); exit(0);}
  FILE* file = fopen(args[1],"r");
  if(file == NULL) {printf("Couldn't open '%s', Reason: %s\n", args[1], strerror(errno)); exit(0);}
  yyin = file;
  yyparse();
  fclose(file);
}
