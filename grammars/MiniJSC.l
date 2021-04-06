%{
#include <stdlib.h>
#include <stdio.h>
void yyerror (char *s);
int yylex();
int yyparse(void);
%}

%%

\/\*(\n|(\/\*)|(\/)|(\*[^\/])|[^\*])*\*\/										{ printf("<MULTI_LINE_COMMENT>"); }
\/\/.*															{ printf("<SINGE_LINE_COMMENT>"); }
(\"([^"\n]|[\\\"]|(\\\n))*\")|(\'([^'\n]|[\\\"]|(\\\n))*\')								{ printf("<STRING_VAL>"); }
var															{ printf("<VAR>"); }
let															{ printf("<LET>"); }
const															{ printf("<CONST>"); }
break															{ printf("<BREAK>"); }
case															{ printf("<CASE>"); }
catch															{ printf("<CATCH>"); }
class															{ printf("<CLASS>"); }
continue														{ printf("<CONTINUE>"); }
debugger														{ printf("<DEBUGGER>"); }
default															{ printf("<DEFAULT>"); }
delete															{ printf("<DELETE>"); }
do															{ printf("<DO>"); }
else															{ printf("<ELSE>"); }
export															{ printf("<EXPORT>"); }
extends															{ printf("<EXTENDS>"); }
finally															{ printf("<FINALLY>"); }
for															{ printf("<FOR>"); }
function														{ printf("<FUNCTION>"); }
if															{ printf("<IF>"); }
import															{ printf("<IMPORT>"); }
in															{ printf("<IN>"); }
instanceof														{ printf("<INSTANCEOF>"); }
new															{ printf("<NEW>"); }
return															{ printf("<RETURN>"); }
super															{ printf("<SUPER>"); }
switch															{ printf("<SWITCH>"); }
this															{ printf("<THIS>"); }
throw															{ printf("<THROW>"); }
try															{ printf("<TRY>"); }
typeof															{ printf("<TYPEOF>"); }
void															{ printf("<VOID>"); }
while															{ printf("<WHILE>"); }
with															{ printf("<WITH>"); }
yield															{ printf("<YIELD>"); }
null															{ printf("<NULL>"); }
true															{ printf("<TRUE>"); }
false															{ printf("<FALSE>"); }
\+															{ printf("<ADD_OP>"); }
\-															{ printf("<SUB_OP>"); }
\*															{ printf("<MULT_OP>"); }
\>															{ printf("<RIGHT_ARR_OP>"); }
\<															{ printf("<LEFT_ARR_OP>"); }
\=															{ printf("<ASSIGN_OP>"); }
[\_a-zA-Z][\_a-zA-Z0-9]*												{ printf("<IDENTIFIER>"); }
[ ] 															;
([0-9]*\.)?[0-9]+													{ printf("<NUMBER_VAL>"); }
\(															{ printf("<OPEN_PARENTHESIS>"); }
\)															{ printf("<CLOSE_PARENTHESIS>"); }
\{															{ printf("<OPEN_CURLY>"); }
\}															{ printf("<CLOSE_CURLY>"); }
\[															{ printf("<OPEN_SQUARE>"); }
\]															{ printf("<CLOSE_SQUARE>"); }

%%
// Additional C code
// Currently allows expression such as: var a = .2  which is illegal. only var a = .2; is allowed


