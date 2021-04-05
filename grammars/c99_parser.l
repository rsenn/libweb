/* from https://github.com/alekseyburger/c99parser */
/*
  c99 lexems definition

  Aleksey Burger (alekseyburger@gmail.com) 2020
  License: BSD
*/

%{
#include "y.tab.h"

extern YYSTYPE yylval;

extern void* find_typedef(char*);
extern void* find_struct_union(char* name_c);
%}

%%
auto        return AUTO; /* Reserved words */
break       return BREAK;
case        return CASE;
char        return CHAR;
const       return CONST;
continue    return CONTINUE;
default     return DEFAULT;
do          return DO;
double      return DOUBLE;
else        return ELSE;
enum        return ENUM;
extern      return EXTERN;
float       return FLOAT;
for         return FOR;
goto        return GOTO;
if          return IF;
int         return INT;
long        return LONG;
register    return REGISTER;
return      return RETURN;
short       return SHORT;
signed      return SIGNED;
sizeof      return SIZEOF;
static      return STATIC;
struct      return STRUCT;
switch      return SWITCH;
typedef     return TYPEDEF;
union       return UNION;
unsigned    return UNSIGNED;
void        return VOID;
volatile    return VOLATILE;
while       return WHILE;

[a-zA-Z][a-zA-Z0-9_]*    { strncpy(yylval.str, yytext, ID_MAME_LEN); void* type_ptr=find_typedef(yylval.str); if(type_ptr){ yylval.type_ptr=type_ptr; return TYPEID;} else {return ID;} } /* identifier */

(0x)?[0-9]+([uU]|[lL]|[uU][lL]|[lL][uU])?       { return ICONST; }   /* integer literal TBD: set value */

[0-9]+e(\+|\-)?[0-9]+([lL]|[fF])?               { return FCONST;} /* Floating literal TBD */
[0-9]+\.[0-9]*(e(\+|\-)?[0-9]+)?([lL]|[fF])?    { return FCONST;} /* Floating literal TBD */

\"([^\\\n]|(\\.))*?\"                           { return SCONST; } /* String literal TBD */

'[\40-\176]'                                    { return CCONST; }   /* char literal TBD */
'\\[abfnrtv]'                                   { return CCONST; }   /* char literal TBD */
'\\([0-7]{1,3})'                                { return CCONST; }  /* char literal TBD */ 

\+    return PLUS;  // Operators
\-   return MINUS;
\*    return TIMES;
\/   return DIVIDE;
\%   return MOD;
\|    return OR;
&    return AND;
~    return NOT;
\^    return XOR;
\<\<   return LSHIFT;
\>\>    return RSHIFT;
\|\|   return LOR;
&&   return LAND;
!    return LNOT;
\<    return LT;
\>    return GT;
\<=    return LE;
\>=   return GE;
==    return EQ;
!=    return NE;

=  return EQUALS;   // Assignment
\*= return TIMESEQUAL;
\/= return DIVEQUAL;
\%= return MODEQUAL;
\+= return PLUSEQUAL;
\-= return MINUSEQUAL;
\\<\<= return LSHIFTEQUAL;
\>\>= return RSHIFTEQUAL;
&= return ANDEQUAL;
\^= return XOREQUAL;
\|= return OREQUAL;

\+\+  return PLUSPLUS;  // Increment/decrement
\-\-  return MINUSMINUS;

\-\>  return ARROW;

\?  return CONDOP;
\( return LPAREN; // Delimeters
\) return RPAREN;
\[ return LBRACKET;
\] return RBRACKET;
\{ return LBRACE;
\} return RBRACE;
, return COMMA;
\. return PERIOD;
; return SEMI;
: return COLON;
\.\.\. return ELLIPSIS;

#(.)*?\n /* ignore preprocessor directives */

\/\/[\40-\176]*\n       /* ignore inline comment */
\/\*[\01-\176]*\*\/     /* skip the multiline commment */
\n                      /* ignore new line symbol */;
[ \t]+                  /* ignore blank and tabulation */;

.                       return (int) yytext[0];
%%