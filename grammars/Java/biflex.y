  // BISON file example1.y
%{

#include <cstdio>
#include <string>
#include <map>

using namespace std;

map<string, double> vars;   // map from variable name to value

extern int yylex();
extern void yyerror(char*);
void Div0Error(void);
void UnknownVarError(string s);
%}

%union {
  int     int_val;
  double  double_val;
  string* str_val;
  bool    bool_val;
}

%token <int_val>    PLUS MINUS ASTERISK FSLASH EQUALS PRINT LPAREN RPAREN SEMICOLON OROP ANDOP NOTOP LBRACE RBRACE 
%token <str_val>    VARIABLE
%token <str_val>    GT ST GTE STE EQ NEQ
%token <double_val> NUMBER
%token <bool_val>   BOOLEAN

%token IF ELSE FOR WHILE TYPE


%type <double_val> expression;
%type <double_val> inner1;
%type <double_val> inner2;

%type <bool_val> bool_exp;
%type <bool_val> bool_in;
%type <bool_val> bool_in2;
%type <bool_val> condition;

%start parsetree

%%

parsetree:    lines;
lines:        lines line | line;
line:       declaration
            | print_stmt
            | if_stmt
            | while_stmt
            | for_stmt
            |;

expression:   expression PLUS inner1               	{$$ = $1 + $3;}
            | expression MINUS inner1              	{$$ = $1 - $3;}
            | inner1                               	{$$ = $1;}
            | bool_exp                             	{$$ = $1;};

            /* Inner variables are needed to Honor precedence */
inner1:       inner1 ASTERISK inner2               	{$$ = $1 * $3;}
            | inner1 FSLASH inner2
              {if($3 == 0) Div0Error(); else $$ = $1 / $3;}
            | inner2                               	{$$ = $1;};

inner2:       VARIABLE
              {if (!vars.count(*$1)) UnknownVarError(*$1); else $$ = vars[*$1]; delete $1;}
            | NUMBER                               	{$$ = $1;}
            | LPAREN expression RPAREN             	{$$ = $2;};

bool_exp:   NOTOP bool_exp                         	{$$ = !$2;}
           | bool_exp ANDOP bool_in                	{$$ = $1 && $3;}
           | bool_in                               	{$$ = $1;};

bool_in:   bool_in OROP bool_in2                   	{$$ = $1 || $3;}
           | bool_in2                              	{$$ = $1;};

bool_in2: BOOLEAN                               	{$$ = $1;}
          | condition                                   {$$ = $1;}
          | LPAREN bool_exp RPAREN                	{$$ = $2;}; /* Expand an expression within parens */


declaration:
	TYPE assignment
	| assignment;

assignment:
	VARIABLE EQUALS expression declaration_end  	{vars[*$1] = $3; delete $1;};

declaration_end:
	SEMICOLON
	| ;

condition:
	expression GT expression {$$ = $1 > $3;}
	| expression GTE expression {$$ = $1 >= $3;}
	| expression ST expression {$$ = $1 < $3;}
	| expression STE expression {$$ = $1 <= $3;}
	| expression EQ expression {$$ = $1 == $3;}
	| expression NEQ expression {$$ = $1 != $3;};

if:
	IF LPAREN condition RPAREN LBRACE lines RBRACE {if ($3) {$5;}};

if_else:
	if ELSE LBRACE lines RBRACE {if (true) {$3;}};

else_if:
	ELSE if ;

if_stmt: if
        | if_else
        | if else_if;

while_stmt: WHILE LPAREN condition RPAREN
		LBRACE
			lines
		RBRACE;

for_stmt:   FOR LPAREN declaration condition SEMICOLON declaration RPAREN
		LBRACE
			lines
		RBRACE;

print_stmt:
	PRINT LPAREN expression RPAREN SEMICOLON 	{printf("%.4f\n", $3);};
%%

void Div0Error(void) {printf("Error: division by zero\n"); exit(0);}
void UnknownVarError(string s) {printf("Error: %s does not exist!\n", s.c_str()); exit(0);}
