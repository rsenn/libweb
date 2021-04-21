%{
    #include <string.h>
    #include "y.tab.h"
    #define print(x) printf(x, yytext)
    #define prin(x) printf(x)
    int line = 1;
%}

letter                      [a-zA-Z]
digit                       [0-9]
anychar                     {letter}|{digit}|"_"
space                       [ \t\n]+
paragraphComments           "/*"(.|\n)*"*/"
lineComments                "//".*\n
primitive                   "void"|"boolean"|"byte"|"short"|"int"|"long"|"float"|"double"|"char"
accessModifiers             "public"|"protected"|"private"
nonAccessModifiers          "static"|"final"|"abstract"|"volatile"
title                       [A-Z]{anychar}*
id                          {letter}({anychar})*
signedint                   {digit}+
double                      {digit}+"."{digit}*|"."{digit}+
charstring                  "\'"."\'"
notcharstring               "\'".(.+)"\'"
string                      "\"".+"\""
boolops                     "&&"|"||"
ops                         "+"|"-"|"*"|"/"
unops                       "++"|"--"
relops                      "<"|">"|"=="|"<="|">="

%%
{paragraphComments} {/* skip */}
{lineComments}      {/* skip */}
{string}            {print("(STRING:%s)"); return _STRING;}
{charstring}        {print("(CHAR:%s)"); return _CHAR;}
{notcharstring}     {print("(NOTCHAR:%s)"); return _NCHAR;}
{space}             {print("%s");}
"eof"               {prin("ENDOFFILE"); return _ENDOFFILE;}
";"                 {prin(";"); return _SEMICOLON;}
":"                 {prin(":"); return _COLON;}
","                 {prin(","); return _COMMA;}
"["                 {prin("["); return _LBRACKET;}
"]"                 {prin("]"); return _RBRACKET;}
"{"                 {prin("{"); return _LBRACE;}
"}"                 {prin("}"); return _RBRACE;}
"("                 {prin("("); return _LPAREN;}
")"                 {prin(")"); return _RPAREN;}
"*"                 {prin("*"); return _STAR;}
"="                 {prin("="); return _IS;}
"."                 {prin("DOT"); return _DOT;}
"import"            {prin("IMPORT"); return _IMPORT;}
"class"             {prin("CLASS"); return _CLASS;}
"extends"           {prin("EXTENDS"); return _EXTENDS;}
"if"                {prin("IF"); return _IF;}
"else"              {prin("ELSE"); return _ELSE;}
"while"             {prin("WHILE"); return _WHILE;}
"break"             {prin("BREAK"); return _BREAK;}
"return"            {prin("RETURN"); return _RETURN;}
"for"               {prin("FOR"); return _FOR;}
"switch"            {prin("SWITCH"); return _SWITCH;}
"case"              {prin("CASE"); return _CASE;}
"default"           {prin("DEFAULT"); return _DEFAULT;}
"try" 				{prin("TRY"); return _TRY;}
"catch" 			{prin("CATCH"); return _CATCH;}
"finally" 			{prin("FINALLY"); return _FINALLY;}
{boolops}           {print("(BOOLOP:%s)"); return _BOOLOP;}
{relops}            {print("(RELOP:%s)"); return _RELOP;}
{ops}               {print("(OP:%s)"); return _OP;}
{unops}             {print("(UNOP:%s)"); return _UNOP;}
{primitive}         {prin("TYPE"); return _TYPE;}
{accessModifiers}   {print("(ACCMOD:%s)"); return _ACC_MOD;}
{nonAccessModifiers} {print("(NONACCMOD:%s)"); return _NON_ACC_MOD;}
{title}             {print("(TITLE:%s)"); return _TITLE;}
{id}                {print("(ID:%s)"); return _ID;}
{signedint}         {print("(NUM:%s)"); return _NUM;}
{double}            {print("(DOUBLE:%s)"); return _DOUBLE;}
.                   {print("%s");}
%%

// "\'"                {prin("SINGLEQUOTE"); return _SINGLEQUOTE;}
// "\""                {prin("DOUBLEQUOTE"); return _DOUBLEQUOTE;}
int yywrap() {
    prin("_!WOW!");
    return 1;
}
