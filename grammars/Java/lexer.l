%{
	#include<stdio.h>
	#include<stdlib.h>
	#include<string.h>
	#include "y.tab.h"
	int yywrap(void);
%}
Digit 	[0-9]
DigitsAndUnderscores	({Digit}|[_])({Digit}|[_])*
Digits	{Digit}|({Digit}{DigitsAndUnderscores}?{Digit})
Underscores 	[_][_]*

HexDigit 	[0-9a-fA-F]
HexDigitsAndUnderscores 	([_]|{HexDigit})([_]|{HexDigit})*
HexDigits 	{HexDigit}|{HexDigit}{HexDigitsAndUnderscores}?{HexDigit}

ExponentPart    [eE][-+]?{Digits}

FloatTypeSuffix		[fFdD]
IntegerTypeSuffix 	[lL]


OctalDigit 	[0-7]
OctalDigitOrUnderscore 	[_]|{OctalDigit}
OctalDigitsAndUnderscores 	{OctalDigitOrUnderscore}{OctalDigitOrUnderscore}*
OctalDigits 	{OctalDigit}|({OctalDigit}{OctalDigitsAndUnderscores}?{OctalDigit})

BinaryDigit 	[01]
BinaryDigitOrUnderscore 	{BinaryDigit}|[_]
BinaryDigitsAndUnderscores 	{BinaryDigitOrUnderscore}{BinaryDigitOrUnderscore}*
BinaryDigits 	{BinaryDigit}|({BinaryDigit}{BinaryDigitsAndUnderscores}?{BinaryDigit})





DecimalNumeral 	[0]|([1-9]{Digits}?)|([1-9]{Underscores}{Digits})
HexNumeral 	[0][xX]{HexDigits}
OctaNumeral 	([0]{OctalDigits})|([0]{Underscores}{OctalDigits})
BinaryNumeral 	[0][bB]{BinaryDigits}




DecimalIntegerLiteral	{DecimalNumeral}{IntegerTypeSuffix}? 
HexIntegerLiteral		{HexNumeral}{IntegerTypeSuffix}? 
OctalIntegerLiteral		{OctaNumeral}{IntegerTypeSuffix}? 
BinaryIntegerLiteral	{BinaryNumeral}{IntegerTypeSuffix}? 





IntegerLiteral		 {DecimalIntegerLiteral}|{HexIntegerLiteral}|{OctalIntegerLiteral}|{BinaryIntegerLiteral} 




DecimalFloatingPointLiteral  ([.]{Digits}{ExponentPart}?{FloatTypeSuffix}?)|({Digits}[.]{Digits}?{ExponentPart}?{FloatTypeSuffix}?)|({Digits}{ExponentPart}{FloatTypeSuffix}?)|({Digits}{ExponentPart}?{FloatTypeSuffix})


BinaryExponent	[pP][-+]?{Digits}
HexSignificand		{HexNumeral}[.]?|([0][xX]{HexDigits}?[.]{HexDigits})

HexadecimalFloatingPointLiteral		{HexSignificand}{BinaryExponent}{FloatTypeSuffix}? 

FloatingPointLiteral 		{DecimalFloatingPointLiteral}|{HexadecimalFloatingPointLiteral}

%%
"\n"												;
"\t"												;
" "												;
"/""*"([^*\n]|("*"[^/\n]))*"*""/"|"/""/".*							;
"/""*"([^*]|("*"[^/]))*"*""/"									;



abstract					{yylval.sval = strdup(yytext); return Abstract;}
continue					{yylval.sval = strdup(yytext); return Continue;}
for						{yylval.sval = strdup(yytext); return For;}
new						{yylval.sval = strdup(yytext); return New;}
switch						{yylval.sval = strdup(yytext); return Switch;}
assert						{yylval.sval = strdup(yytext); return Assert;}
default						{yylval.sval = strdup(yytext); return Default;}
if						{yylval.sval = strdup(yytext); return If;}
package						{yylval.sval = strdup(yytext); return Package;}
synchronized					{yylval.sval = strdup(yytext); return Synchronized;}	
boolean						{yylval.sval = strdup(yytext); return Boolean;}
do						{yylval.sval = strdup(yytext); return Do;}
goto						{yylval.sval = strdup(yytext); return Goto;}
private						{yylval.sval = strdup(yytext); return Private;}
this						{yylval.sval = strdup(yytext); return This;}		
break						{yylval.sval = strdup(yytext); return Break;}
double						{yylval.sval = strdup(yytext); return Double;}
implements					{yylval.sval = strdup(yytext); return Implements;}
protected					{yylval.sval = strdup(yytext); return Protected;}
throw						{yylval.sval = strdup(yytext); return Throw;}	
byte						{yylval.sval = strdup(yytext); return Byte;}
else						{yylval.sval = strdup(yytext); return Else;}
import						{yylval.sval = strdup(yytext); return Import;}
public						{yylval.sval = strdup(yytext); return Public;}
throws						{yylval.sval = strdup(yytext); return Throws1;}			
case						{yylval.sval = strdup(yytext); return Case;}
enum						{yylval.sval = strdup(yytext); return Enum;}
instanceof					{yylval.sval = strdup(yytext); return Instanceof;}
return						{yylval.sval = strdup(yytext); return Return;}
transient					{yylval.sval = strdup(yytext); return Transient;}			
catch						{yylval.sval = strdup(yytext); return Catch;}
extends						{yylval.sval = strdup(yytext); return Extends;}
int						{yylval.sval = strdup(yytext); return Int;}
short						{yylval.sval = strdup(yytext); return Short;}
try						{yylval.sval = strdup(yytext); return Try;}			
char						{yylval.sval = strdup(yytext); return Char;}
final						{yylval.sval = strdup(yytext); return Final;}
interface					{yylval.sval = strdup(yytext); return Interface;}
static						{yylval.sval = strdup(yytext); return Static;}
void						{yylval.sval = strdup(yytext); return Void;}									
class						{yylval.sval = strdup(yytext); return Class;}
finally						{yylval.sval = strdup(yytext); return Finally1;}
long						{yylval.sval = strdup(yytext); return Long;}
strictfp					{yylval.sval = strdup(yytext); return Strictfp;}
volatile					{yylval.sval = strdup(yytext); return Volatile;}						
const						{yylval.sval = strdup(yytext); return Const;}
float						{yylval.sval = strdup(yytext); return Float;}
native						{yylval.sval = strdup(yytext); return Native;}
super						{yylval.sval = strdup(yytext); return Super1;}
while						{yylval.sval = strdup(yytext); return While;}				




"("							{yylval.sval = strdup(yytext);return OpBrac;}
")"							{yylval.sval = strdup(yytext);return ClosBrac;}
"{"							{yylval.sval = strdup(yytext);return OCBrac;}
"}"							{yylval.sval = strdup(yytext);return CCBrac;}
"["							{yylval.sval = strdup(yytext);return OSBrac;}
"]"							{yylval.sval = strdup(yytext);return CSBrac;}
";"							{yylval.sval = strdup(yytext); return SemiColon;}
","							{yylval.sval = strdup(yytext);return Comma;}
"."							{yylval.sval = strdup(yytext);return Dot;}
"..."							{yylval.sval = strdup(yytext);return o1;}
"@"							{yylval.sval = strdup(yytext);return Attherate;}
"::"   							{yylval.sval = strdup(yytext);return o2;}
		

"="							{yylval.sval = strdup(yytext);return Equal;}
">"							{yylval.sval = strdup(yytext);return GT;}
"<"							{yylval.sval = strdup(yytext);return LT;}
"!"							{yylval.sval = strdup(yytext);return Excl;}
"~"							{yylval.sval = strdup(yytext);return Tilda;}
"?"							{yylval.sval = strdup(yytext);return Ques;}
":"							{yylval.sval = strdup(yytext);return Colon;}
"->"						{yylval.sval = strdup(yytext);return o3;}
"=="						{yylval.sval = strdup(yytext);return o4;}
">="						{yylval.sval = strdup(yytext);return o5;}
"<="						{yylval.sval = strdup(yytext);return o6;}
"!="						{yylval.sval = strdup(yytext);return o7;}
"&&"						{yylval.sval = strdup(yytext);return o8;}
"||"						{yylval.sval = strdup(yytext);return o9;}
"++"						{yylval.sval = strdup(yytext);return o10;}
"--"						{yylval.sval = strdup(yytext);return o11;}
"+"							{yylval.sval = strdup(yytext);return Plus;}
"-"							{yylval.sval = strdup(yytext);return Minus;}
"*"							{yylval.sval = strdup(yytext);return Multiply;}
"/"							{yylval.sval = strdup(yytext);return Divide;}
"&"							{yylval.sval = strdup(yytext);return And;}
"|"							{yylval.sval = strdup(yytext);return Or;}
"^"							{yylval.sval = strdup(yytext);return Xor;}
"%"							{yylval.sval = strdup(yytext);return Percent;}
"<<"						{yylval.sval = strdup(yytext);return o12;}
">>"						{yylval.sval = strdup(yytext);return o13;}
">>>"						{yylval.sval = strdup(yytext);return o14;}
"+="						{yylval.sval = strdup(yytext);return o15;}
"-="						{yylval.sval = strdup(yytext);return o16;}
"*="						{yylval.sval = strdup(yytext);return o17;}
"/="						{yylval.sval = strdup(yytext);return o18;}
"&="						{yylval.sval = strdup(yytext);return o19;}
"|="						{yylval.sval = strdup(yytext);return o20;}
"^="						{yylval.sval = strdup(yytext);return o21;}
"%="						{yylval.sval = strdup(yytext);return o22;}
"<<="						{yylval.sval = strdup(yytext);return o23;}
">>="						{yylval.sval = strdup(yytext);return o24;}
">>>="						{yylval.sval = strdup(yytext);return o25;}



true|false|null|{FloatingPointLiteral}|{IntegerLiteral}				{yylval.sval = strdup(yytext); return Literal;}
0[0-9_]*[8-9][0-9_]*												{printf("Illegal character found in %s\n",yytext);}
"\""([^\\\"]|\\b|\\t|\\n|\\f|\\\"|\\\'|\\\\|\\r|\\[0-7]|\\[0-7][0-7]|\\[0-3][0-7][0-7])*"\""		{yylval.sval = strdup(yytext); return Literal;}									
"\'"([^\\\"\\']|\\b|\\t|\\n|\\f|\\\"|\\\'|\\\\|\\r|\\[0-7]|\\[0-7][0-7]|\\[0-3][0-7][0-7])"\'"		{yylval.sval = strdup(yytext); return Literal;}								
[a-zA-Z][a-zA-Z0-9_]*												{yylval.sval = strdup(yytext); return Identifier;}
.																	{printf("Error Illegal character found in %s\n",yytext);}
%%

int yywrap(void){
	return 1;
}
