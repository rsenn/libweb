%{
	#include<stdio.h>
	#include<stdlib.h>
	#define YYDEBUG 1
	int yylex();
	int yyerror();
	extern FILE *yyin;
	#
%}

%token ABSTRACT	ASSERT BOOLEAN BREAK BYTE CASE CATCH CHAR CLASS	CONST CONTINUE DEFAULT DO DOUBLE ELSE ENUM EXTENDS FINAL FINALLY FLOAT FOR GOTO IF IMPLEMENTS IMPORT INSTANCEOF INT	INTERFACE LONG NATIVE NEW PACKAGE PRIVATE PROTECTED PUBLIC RETURN SHORT	STATIC STRICTFP	SUPER SWITCH SYNCHRONIZED THIS THREADSAFE THROW THROWS	TRANSIENT TRY VOID VOLATILE	WHILE SCOLON DOT LC RC LP RP LSB RSB COLON QUESMARK COMMA ADD SUB MUL DIV MOD ASSIGN ADDASSIGN SUBASSIGN MULASSIGN DIVASSIGN MODASSIGN INCREMENT DECREMENT EXP DQ LT LTE GT GTE EQEQ NTEQ TRUE FALSE NUM NOT BAND BOR BANDEQ BOREQ BXOR BXOREQ LAND LOR TILDE SIGNED_RSHIFT UNSIGNED_RSHIFT SIGNED_LSHIFT FLOAT_TYPE_SUFFIX HEXNUM IDENTIFIER LITERAL STRING REDUNDANT DOC_COMMENT

%%


compilation_unit			: package_statement import_statement_more type_declaration_more 
							| import_statement_more type_declaration_more ;				

import_statement_more		: import_statement import_statement_more
							| eps ;				

type_declaration_more 		: type_declaration type_declaration_more
							| eps ; 

package_statement			: PACKAGE package_name SCOLON ;

import_statement			: IMPORT package_name DOT MUL SCOLON 
							| IMPORT class_name SCOLON
							| IMPORT interface_name SCOLON ;

type_declaration			: DOC_COMMENT class_declaration
							| DOC_COMMENT interface_declaration
							| class_declaration 
							| interface_declaration ;

class_declaration			: modifier_more CLASS IDENTIFIER class_declaration_1 class_declaration_2 LC 										  field_declaration_more RC

modifier_more 				: modifier modifier_more
							| eps ;

field_declaration_more		: field_declaration field_declaration_more
							| eps ;

class_declaration_1			: EXTENDS class_name 
							| eps ;

class_declaration_2			: IMPLEMENTS interface_name interface_name_more
							| eps ;

interface_name_more			: COMMA interface_name interface_name_more 
							| eps ;							

interface_declaration		: modifier_more INTERFACE IDENTIFIER interface_declaration_1 LC field_declaration_more 								  RC ;

interface_declaration_1		: EXTENDS interface_name_more
							| eps ;

field_declaration			: method_declaration 
							| constructor_declaration 
							| variable_declaration
							| DOC_COMMENT method_declaration 
							| DOC_COMMENT constructor_declaration 
							| DOC_COMMENT variable_declaration
							| static_initializer
							| SCOLON ; 

method_declaration			: modifier_more type IDENTIFIER LP parameter_list RP square_brak_more method_declaration_1;

method_declaration_1 		: statement_block 
							| SCOLON ;

square_brak_more			: LSB RSB square_brak_more 
							| LSB expression RSB square_brak_more 
							| eps ;						

constructor_declaration		: modifier_more IDENTIFIER LP parameter_list RP statement_block ;

statement_block				: LC statement_more RC ;

statement_more				: statement statement_more
							| eps ;

variable_declaration		:  modifier_more type variable_declarator variable_declaration_1 SCOLON 
							| IDENTIFIER IDENTIFIER SCOLON 
							| IDENTIFIER IDENTIFIER square_brak_more variable_declaration_1 SCOLON 
							| IDENTIFIER IDENTIFIER square_brak_more ASSIGN expression SCOLON;

variable_declaration_1		: COMMA variable_declarator variable_declaration_1
							| eps ;


variable_declarator			: IDENTIFIER square_brak_more variable_declarator_1 ;

variable_declarator_1		: ASSIGN variable_initializer 
							| eps ;

variable_initializer		: expression
							| LC variable_initializer_1 RC ;

variable_initializer_1 		: variable_initializer
							| variable_initializer COMMA
							| variable_initializer variable_initializer_more
							| variable_initializer variable_initializer_more COMMA
							| eps ;

variable_initializer_more 	: COMMA variable_initializer variable_initializer_more 
							| eps ;							

static_initializer			: STATIC statement_block ;

parameter_list				: parameter parameter_more
							| eps ;

parameter_more				: COMMA parameter parameter_more 
							| eps ;

parameter					: type IDENTIFIER square_brak_more ;

statement					: variable_declaration 
							| expression SCOLON
							| statement_block
							| if_statement
							| do_statement
							| while_statement
							| for_statement
							| try_statement
							| switch_statement
							| SYNCHRONIZED LP expression RP statement
							| RETURN SCOLON
							| RETURN expression SCOLON
							| THROW expression SCOLON
							| IDENTIFIER COLON statement
							| BREAK SCOLON
							| BREAK IDENTIFIER SCOLON
							| CONTINUE SCOLON
							| CONTINUE IDENTIFIER SCOLON
							| SCOLON ;

if_statement				: IF LP expression RP statement 
							| IF LP expression RP statement ELSE statement ;

do_statement				: DO statement WHILE LP expression RP SCOLON ;

while_statement				: WHILE LP expression RP statement ;

for_statement				: FOR LP for_statement_1 RP statement ;

for_statement_1				: for_statement_1_1 for_statement_1_2 SCOLON for_statement_1_2 ;

for_statement_1_1			: variable_declaration
							| expression SCOLON
							| SCOLON ;

for_statement_1_2 			: expression 
							| eps ;					


try_statement				: TRY statement try_statement_1
							| TRY statement try_statement_1 FINALLY statement ;

try_statement_1				: CATCH LP parameter RP statement try_statement_1 
							| eps;				

switch_statement			: SWITCH LP expression RP LC switch_statement_1 RC ;

switch_statement_1 			: CASE expression COLON switch_statement_1
							| DEFAULT COLON switch_statement_1
							| statement switch_statement_1
							| eps ;

expression					: numeric_expression
							| testing_expression
							| logical_expression
							| bit_expression
							| casting_expression
							| creating_expression
							| literal_expression
							| SUPER
							| THIS
							| IDENTIFIER
							| LP expression RP
							| expression expression_1 ;

expression_1 				: LP RP
							| LP arglist RP
							| LSB expression RSB
							| DOT expression
							| COMMA expression
							| INSTANCEOF class_name
							| INSTANCEOF interface_name;														

numeric_expression			: SUB expression
							| INCREMENT expression
							| DECREMENT expression
							| expression INCREMENT
							| expression DECREMENT
							| expression ADD expression
							| expression SUB expression
							| expression MUL expression
							| expression DIV expression
							| expression MOD expression
							| expression ASSIGN expression
							| expression ADDASSIGN expression
							| expression SUBASSIGN expression
							| expression DIVASSIGN expression
							| expression MULASSIGN expression
							| expression MODASSIGN expression ;

testing_expression			: expression LT expression
							| expression GT expression
							| expression LTE expression
							| expression GTE expression
							| expression EQEQ expression
							| expression NTEQ expression ;

logical_expression			: NOT expression
							| expression BAND expression
							| expression BOR expression
							| expression BANDEQ expression
							| expression BOREQ expression
							| expression BXOR expression
							| expression BXOREQ expression
							| expression LAND expression
							| expression LOR expression
							| expression QUESMARK expression COLON expression
							| TRUE
							| FALSE ;

bit_expression				: TILDE expression
							| expression SIGNED_RSHIFT expression
							| expression SIGNED_LSHIFT expression
							| expression UNSIGNED_RSHIFT expression ;

casting_expression			: LP type RP expression ;

creating_expression			: NEW class_name LP RP
							| NEW class_name LP arglist RP
							| NEW type_specifier
							| NEW type_specifier LSB expression RSB
							| NEW type_specifier square_brak_more
							| NEW LP expression RP ;

literal_expression			: integer_literal
							| float_literal
							| string
							;

arglist						: expression arglist_1 ;

arglist_1 					: COMMA expression arglist_1
							| eps ;

type						: type_specifier square_brak_more ;

type_specifier				: BOOLEAN 
							| BYTE 
							| CHAR 
							| SHORT 
							| INT 
							| FLOAT 
							| LONG 
							| DOUBLE 
							| STRING
							| VOID
							|IDENTIFIER
							 ;

modifier					: PUBLIC 
							| PRIVATE 
							| PROTECTED 
							| STATIC 
							| FINAL 
							| NATIVE 
							| SYNCHRONIZED 
							| ABSTRACT 
							| TRANSIENT 
							| THREADSAFE ;

package_name				: IDENTIFIER 
							| package_name DOT IDENTIFIER ;

class_name					: IDENTIFIER 
							| package_name DOT IDENTIFIER ;

interface_name				: IDENTIFIER 
							| package_name DOT IDENTIFIER ;

integer_literal 			: NUM
							| HEXNUM							

float_literal 				: NUM DOT 
							| NUM DOT NUM
							| NUM DOT exponent_part
							| NUM DOT NUM exponent_part
							| NUM DOT NUM FLOAT_TYPE_SUFFIX 
							| NUM DOT exponent_part FLOAT_TYPE_SUFFIX
							| NUM DOT NUM exponent_part FLOAT_TYPE_SUFFIX
							| DOT NUM 
							| DOT NUM exponent_part
							| DOT NUM FLOAT_TYPE_SUFFIX
							| DOT NUM exponent_part FLOAT_TYPE_SUFFIX
							| NUM exponent_part
							| NUM FLOAT_TYPE_SUFFIX
							| NUM exponent_part FLOAT_TYPE_SUFFIX ;

exponent_part 				: EXP NUM
							| EXP ADD NUM
							| EXP SUB NUM						

string 						: LITERAL ;

eps 						:  ;

%%

int yyerror(char *msg){
	printf("\nInvalid expression");
	return 1;
}

void main (){
	#ifdef YYDEBUG
  	yydebug = 1;
	#endif
	yyin=fopen("inpfile.java","r");

	do{
		if(yyparse() )
		{
			printf("\n Failure!");
			exit(0);
		}

	}while(!feof(yyin));
			
	printf("\n\nSuccessfully parsed!!!\n");
	
}