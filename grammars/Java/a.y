%{
#include"main.h"

extern char *yytext;
extern int yyleng;
extern int yylex();

void yyerror(char*);
void undefined(char*);
void redefine(char*);
extern void Error(char*);
extern int line;	//for and line number
extern int f_mis;	//mistake flag
int f_equ=0;
extern int f_fun;
extern int for_key;
extern char id_name[MAX_BUFFER];	//for current id
extern char error[MAX_BUFFER];	//error message
extern char error2[MAX_BUFFER]; //error message buffer

extern void check_layer();
extern void creat();
extern void print();
extern int lookup(char* id);
extern int lookups(char* id);
extern int insert(char* id);

%}

%union{
char* sval;
};

%start START
%token <sval> ID
%token INT_DATA REAL_DATA STRING_DATA
%token CLASS MAIN THIS IF ELSE FOR DO WHILE SWITCH CASE DEFAULT CONTINUE BREAK
%token TRY CATCH TRUE FALSE
%token VOID INT FLOAT DOUBLE CHAR STRING BOOLEAN 
%token PRINT READ NEW CONST FINAL STATIC 
%token PUBLIC PROTECTED PRIVATE FINALLY EXTENDS IMPLEMENTS RETURN EXCEPTION
%token DOUBLE_OPERATOR COMPARE CONNECT EQUAL

%%
class_modifier : PROTECTED | PRIVATE | PUBLIC ;
data_modifier : STATIC | FINAL | CONST ;
data_type : VOID | INT | FLOAT | DOUBLE | CHAR | STRING | BOOLEAN | EXCEPTION ; 
prefix : DOUBLE_OPERATOR | '+' | '-' ;
postfix : DOUBLE_OPERATOR ;
const_data :  INT_DATA | REAL_DATA | STRING_DATA ;


/************************** start ****************************************/
START :
 | class_declarations START 
 ;  

/***************************class_declarations ****************************
*	ex: public class A{}
*		class A{}
*		public class A extends B{}
*		class A extends B{}
*		public class A implements B{} | public class A implements B, C{}
*		class A implements B, C{}
*		public class A extends D implements B, C{}
*		class A extends D implements B, C{}
****************************************************************************/

class_declarations : class_modifier CLASS ID '{' statement '}'
 | CLASS ID '{' statement '}'
 | class_modifier CLASS ID class_extends '{' statement '}'
 | CLASS ID class_extends '{' statement '}'
 | class_modifier CLASS ID class_implements class_implements_list '{' statement '}'
 | CLASS ID class_implements class_implements_list '{' statement '}'
 | class_modifier CLASS ID class_extends class_implements class_implements_list'{' statement '}'
 | CLASS ID class_extends class_implements class_implements_list'{' statement '}'
 ;

class_extends : EXTENDS ID
 ;

class_implements : IMPLEMENTS ID
 ;

class_implements_list : 
 | ',' ID class_implements_list
 ;

/************************* variable_declarations ****************************
*	ex: static int A;
* 		int A;
*		(class_id)A B = new A();
****************************************************************************/
 
variable_declarations : data_modifier data_type identifier_declarations ';'
 | data_type '[' ']' array_declarations ';'
 | data_type '[' ']' ID ';' { redefine($4); } 
 | data_type identifier_declarations ';' 
 | ID identifier_declarations ID '(' ')' ';'
 | ID identifier_declarations ';' 
 | ID identifier_declarations ID '(' ')' { f_mis=1;Error("miss ';'");}
 | error
 ;

/********************* identifier declaration (array include)*****************
* 		ex:	A;
*			A = 5;
*			A = new ?
*			A = new int [1]
*			[] a = new int [1]
*****************************************************************************/

identifier_declarations : identifier identifier_list 
 ;

/*********************** identifier ******************************************
* 		ex:	A;
*			A = B;
*			A = new ?
******************************************************************************/
identifier : ID { redefine($1); }
 | ID EQUAL ID{redefine($1); undefined($3);}
 | ID EQUAL expression { redefine($1); }
 | ID EQUAL NEW { redefine($1); }
 ;

identifier_list :
 |',' identifier identifier_list
 ;

/***************** array identifier *********************************
* 	ex: A = new int [1]
********************************************************************/ 

array_declarations : array array_list
 ;
 
array : ID EQUAL NEW data_type '[' ']' { redefine($1); }
 | ID EQUAL NEW data_type '[' expression ']' { redefine($1); }
 ;

array_list : 
 |',' array array_list
 ;

/*********************** condition *********************************
* 		ex: if 
*			if() else if() else()
*			if() else()
********************************************************************/ 

condition : IF '(' boolean_expr boolean_expr_list ')' simple_or_compound
 | IF '(' boolean_expr boolean_expr_list ')' simple_or_compound ELSE IF '(' boolean_expr boolean_expr_list ')' simple_or_compound ELSE simple_or_compound
 | IF '(' boolean_expr boolean_expr_list ')' simple_or_compound ELSE simple_or_compound
 ;

simple_or_compound : simple
 | compound
 ;
/*********************** boolean expression ************************
*	ex: if(true)
*		if(A==5)
*		if(A==5 || B==6)
********************************************************************/ 
boolean_expr : expression COMPARE expression
 | TRUE
 | FALSE
 ;
 
boolean_expr_list : 
 | CONNECT boolean_expr boolean_expr_list
 ;
 
compound : '{' statement '}' 
 ;

/***************** Loop ****************************************
* 	ex: for()
*		while()
*		do{}while();
*		for(int i=0;i<10;i++) for_init for_update
* 		loop's (simple, statement, if else) need (break,continue)
****************************************************************/ 

loop : WHILE '(' boolean_expr boolean_expr_list ')' loop_simple_or_compound
 | DO loop_compound WHILE '(' boolean_expr boolean_expr_list ')' ';'
 | FOR '(' for_init ';' boolean_expr boolean_expr_list ';' for_update ')' loop_simple_or_compound
 | FOR '(' for_init ';' boolean_expr boolean_expr_list ';' for_update ')' ';' { for_key=0; check_layer('}'); }
 ;

loop_condition : IF '(' boolean_expr boolean_expr_list ')' loop_simple_or_compound
 | IF '(' boolean_expr boolean_expr_list ')' loop_simple_or_compound ELSE loop_simple_or_compound
 ;

loop_simple_or_compound : loop_simple
 | loop_compound
 ;

for_init : 
 | data_type identifier_declarations
 | ID EQUAL const_data { undefined($1); }
 ;


for_update : ID postfix
 | prefix ID
 ;

loop_compound : '{' loop_statement '}'
 ;

/************************** try catch ******************************
*	ex: try catch finally
*******************************************************************/

try_catch_finally : TRY compound CATCH '(' parameter ')' compound FINALLY compound
 | TRY compound CATCH '(' parameter ')' compound
 ;

/********************** switch*********************************
* ex: switch case default
***************************************************************/

switch_case_default : SWITCH '(' ID ')' switch_compound

switch_compound : '{' switch_statement '}'
 | '{' switch_statement DEFAULT ':' statement '}'
 ;

switch_statement : 
 | CASE const_data ':' statement BREAK ';' switch_statement
 | CASE const_data ':' statement switch_statement
 ;
 
/************************* function parameter ****************
* 	ex: func(int A)
*****************************************************************/

parameter : 
 | argv argv_list 
 ;

argv : data_type ID { f_fun=1; /*printf("!!%s",$2);*/ redefine($2);}
 ;

argv_list : 
 |',' argv argv_list 
 ;

/*************** statement ***********************************
* 	ex: compound simple condition loop
*		return method_declaration variable_declarations
*		try_catch_finally switch_case_default
**************************************************************/

statement : 
 | compound statement
 | simple statement
 | condition statement
 | loop statement
 | return statement
 | method_declaration statement
 | variable_declarations statement
 | try_catch_finally statement
 | switch_case_default statement
 ;

loop_statement : 
 | loop_compound loop_statement
 | simple loop_statement
 | loop_condition loop_statement
 | loop loop_statement
 | return loop_statement
 | method_declaration loop_statement
 | variable_declarations loop_statement
 | try_catch_finally loop_statement
 | CONTINUE ';'
 | BREAK ';'
 ;
 
 
/************************ method_declaration **********************
*  ex: public int A(){}
	   int A(){}
	   main(){} 
*******************************************************************/

method_declaration : class_modifier data_modifier data_type ID '(' parameter ')' '{' statement '}' { redefine($4);}
 | class_modifier data_type ID '(' parameter ')' '{' statement '}' { redefine($3);}
 | data_type ID '(' parameter ')' '{' statement '}' { redefine($2); /*printf("%s function define",$2);*/}
 | class_modifier ID '(' parameter ')' '{' statement '}' { undefined($2);}
 | class_modifier data_type MAIN '(' ')' '{' statement '}'
 | class_modifier data_modifier data_type MAIN '(' ')' '{' statement '}'
 | data_type MAIN '(' ')' '{' statement '}'
 | MAIN '(' ')' '{' statement '}'
 ;

/************  simple ***********************
********************************************/

loop_simple : variable_declarations { for_key=0; check_layer('}'); }
 | name EQUAL expression ';' { for_key=0;check_layer('}'); }
 | PRINT '(' expression ')' ';' { for_key=0;check_layer('}'); }
 | READ '(' name ')' ';' { for_key=0;check_layer('}'); }
 | expression ';' { for_key=0;check_layer('}'); }
 | CONTINUE ';' { for_key=0;check_layer('}'); }
 | BREAK ';' { for_key=0;check_layer('}'); }
 ;

simple : name EQUAL expression ';'
 | PRINT '(' expression ')' ';'
 | expression ';'
 ;

expression : term
 | expression '+' term
 | expression '-' term
 ;
 
name : ID{undefined($1);}
 | ID '.' ID
 | THIS '.' ID
 ;
 
term : op op_list
 ;

/*********** op *****************
*	ex: A
* 		A[B]
*		A[5]
*		(a+1)
*		++i +i -i
*		i++ i--
*		func(a)
*********************************/ 
op : ID{undefined($1);}
 | ID '[' ID ']'{undefined($1);undefined($3);}
 | ID '[' INT_DATA ']'{undefined($1);}
 | const_data
 | '+' const_data
 | '-' const_data
 | '*' const_data
 | '/' const_data
 | '(' expression ')'
 | prefix ID {undefined($2);}
 | ID postfix {undefined($1);}
 | ID postfix INT_DATA {undefined($1);}
 | method_invocation 
 | NEW data_type '[' ']'
 | NEW data_type '[' expression ']'
 | NEW ID '(' ')'
 | NEW ID '(' expression ')'
 ;

op_list : 
 | '*' op op_list
 | '/' op op_list
 ;
 
/**** function call argument ********************
* 	ex: A(B,C);
*		return A;
*************************************************/
method_invocation : name '(' argument ')'
 ;
argument : 
 | expression argument_list
 ; 

argument_list : 
 |',' expression argument_list
 ;

return : RETURN expression ';' 
 ;
 
%%

int main(){
	creat();
	yyparse();
	return 0;
}

void yyerror(char *str){
	f_mis=1;
	sprintf(error2,"> ERROR: Line %d [%s] has %s. \n", line,yytext,str);
	strcat(error, error2);
	return ;
}
void undefined(char *s){
	if(lookups(s)==-1){
		f_mis=1;
		sprintf(error,"> ERROR: Line %d '%s' is a undefined identifier.\n",line,s);
	}
}
void redefine(char *s){
	if(lookup(s)==-1){
		insert(s);
	}
	else{
		f_mis=1;
		sprintf(error,"> ERROR: Line %d '%s' is a redefine identifier.\n",line,s);
	}
}
