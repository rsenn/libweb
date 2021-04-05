/* from https://github.com/starclip/new-C-Parser */
/* Archivo byson que posee las declaraciones y las reglas de la gramática.*/

%{
#include <stdio.h>
#include "semantic_actions.c"
#define YYERROR_VERBOSE 1
// datos importantes.
extern int yylex();
extern int yyparse();
extern FILE *yyin;
 
void yyerror(const char *s);
%}

%union {
	char *sval; // El valor de "una variable".
}

/* Identificadores o valores con datos -> (5, "", CON) */
%token <sval> IDENTIFIER
%token <sval> I_CONSTANT
%token <sval> F_CONSTANT
%token <sval> STRING_LITERAL
%token <sval> TYPEDEF_NAME
%token <sval> ENUMERATION_CONSTANT

%token	FUNC_NAME SIZEOF
%token	PTR_OP INC_OP DEC_OP LEFT_OP RIGHT_OP LE_OP GE_OP EQ_OP NE_OP
%token	AND_OP OR_OP MUL_ASSIGN DIV_ASSIGN MOD_ASSIGN ADD_ASSIGN
%token	SUB_ASSIGN LEFT_ASSIGN RIGHT_ASSIGN AND_ASSIGN
%token	XOR_ASSIGN OR_ASSIGN


%token	TYPEDEF EXTERN STATIC AUTO REGISTER INLINE
%token	CONST RESTRICT VOLATILE
%token	BOOL CHAR SHORT INT LONG SIGNED UNSIGNED FLOAT DOUBLE VOID
%token	COMPLEX IMAGINARY 
%token	STRUCT UNION ENUM ELLIPSIS

%token	CASE DEFAULT IF ELSE SWITCH WHILE DO FOR GOTO CONTINUE BREAK RETURN

%token	ALIGNAS ALIGNOF ATOMIC GENERIC NORETURN STATIC_ASSERT THREAD_LOCAL

%start translation_unit
%%

/* Unidad básica del parser ()*/
primary_expression
	: IDENTIFIER
	| constant	/*numeros*/		
	| string				
	| '(' expression ')'		
	| generic_selection 	
	| '(' error ')'	{ yyerrok; printf("ERROR\n");}
	| '(' expression error { yyerrok; printf("ERROR\n");}
	;

constant
	: I_CONSTANT 		/* includes character_constant */
	| F_CONSTANT
	| ENUMERATION_CONSTANT	/* after it has been defined as such */
	;

enumeration_constant		/* before it has been defined as such */
	: IDENTIFIER {save_id_stack();}
	;

string
	: STRING_LITERAL
	| FUNC_NAME
	;

generic_selection
	: GENERIC '(' assignment_expression ',' generic_assoc_list ')'
	| GENERIC '(' error ',' generic_assoc_list ')' { yyerrok; }
	;

generic_assoc_list
	: generic_association
	| generic_assoc_list ',' generic_association
	| generic_assoc_list ',' error               { yyerrok; }
	;

generic_association
	: type_name ':' assignment_expression
	| DEFAULT ':' assignment_expression
	| error ':' assignment_expression { yyerrok; }
	;

postfix_expression
	: primary_expression
	| postfix_expression '[' expression ']'
	| postfix_expression '(' ')'
	| postfix_expression '(' argument_expression_list ')'
	| postfix_expression '.' IDENTIFIER {save_id_stack();}
	| postfix_expression PTR_OP IDENTIFIER {save_id_stack();}
	| postfix_expression INC_OP
	| postfix_expression DEC_OP
	| '(' type_name ')' '{' initializer_list '}'
	| '(' type_name ')' '{' initializer_list ',' '}'
	| postfix_expression '[' error ']' { yyerrok; }
	| postfix_expression '{' error '}' { yyerrok; }
	| '(' error ')' '{' initializer_list '}' ';' { yyerrok; }
	| '(' type_name ')' '{' error '}' ';' { yyerrok; }
	;

argument_expression_list
	: assignment_expression
	| argument_expression_list ',' assignment_expression
	;

unary_expression
	: postfix_expression
	| INC_OP {printf("INC_OP: %s\n", yytext);} unary_expression
	| DEC_OP unary_expression
	| unary_operator cast_expression
	| SIZEOF unary_expression
	| SIZEOF '(' type_name ')'
	| ALIGNOF '(' type_name ')'
	| ALIGNOF '(' error ')' { yyerrok; }
	;

unary_operator
	: '&'
	| '*'
	| '+' 
	| '-'
	| '~'
	| '!'
	;

cast_expression
	: unary_expression
	| '(' type_name ')' cast_expression
	| '(' error ')' cast_expression { yyerrok; }
	| '(' type_name ')' error { yyerrok; }
	;

multiplicative_expression
	: cast_expression
	| multiplicative_expression '*' cast_expression
	| multiplicative_expression '/' cast_expression
	| multiplicative_expression '%' cast_expression
	| error '%' cast_expression ';'  { yyerrok; }
	| multiplicative_expression '%' error ';' { yyerrok; } 
	;

additive_expression
	: multiplicative_expression
	| additive_expression '+'  multiplicative_expression
	| additive_expression '-' multiplicative_expression
	| error '+' multiplicative_expression { yyerrok; }
	| error '-' multiplicative_expression { yyerrok; }
	| additive_expression '+' error { yyerrok; }
	| additive_expression '-' error { yyerrok; }
	;

shift_expression
	: additive_expression
	| shift_expression LEFT_OP additive_expression
	| shift_expression RIGHT_OP additive_expression
	| shift_expression RIGHT_OP error { yyerrok; }
	;

relational_expression
	: shift_expression
	| relational_expression '<' shift_expression
	| relational_expression '>' shift_expression
	| relational_expression LE_OP shift_expression
	| relational_expression GE_OP shift_expression
	| relational_expression '<' error { yyerrok; }
	| relational_expression '>' error { yyerrok; }
	| relational_expression LE_OP error { yyerrok; }
	| relational_expression GE_OP error { yyerrok; }
	;

equality_expression
	: relational_expression
	| equality_expression EQ_OP relational_expression
	| equality_expression NE_OP relational_expression
	| equality_expression EQ_OP error  { yyerrok; }
	| equality_expression NE_OP error { yyerrok; }
	;

and_expression
	: equality_expression
	| and_expression '&' equality_expression
	| and_expression '&' error { yyerrok; }
	;

exclusive_or_expression
	: and_expression
	| exclusive_or_expression '^' and_expression
	| exclusive_or_expression '^' error { yyerrok; }
	;

inclusive_or_expression
	: exclusive_or_expression
	| inclusive_or_expression '|' exclusive_or_expression
	| error '|' exclusive_or_expression { yyerrok; }
	;

logical_and_expression
	: inclusive_or_expression
	| logical_and_expression AND_OP inclusive_or_expression
	| logical_and_expression AND_OP error ';' { yyerrok; }
	;

logical_or_expression
	: logical_and_expression
	| logical_or_expression OR_OP logical_and_expression
	| logical_or_expression OR_OP error { yyerrok; }
	;

conditional_expression
	: logical_or_expression
	| logical_or_expression '?' expression ':' conditional_expression
	| logical_or_expression '?' error ':' conditional_expression { yyerrok; }
	;

assignment_expression
	: conditional_expression
	| unary_expression {ck_decl();} assignment_operator assignment_expression
	| unary_expression error assignment_expression { yyerrok; }
	;

assignment_operator
	: '='
	| MUL_ASSIGN
	| DIV_ASSIGN
	| MOD_ASSIGN
	| ADD_ASSIGN
	| SUB_ASSIGN
	| LEFT_ASSIGN
	| RIGHT_ASSIGN
	| AND_ASSIGN
	| XOR_ASSIGN
	| OR_ASSIGN
	;

expression
	: assignment_expression
	| expression ',' assignment_expression
	| expression ',' error { yyerrok; }
	;

constant_expression
	: conditional_expression	/* with constraints */
	;

declaration
	: declaration_specifiers ';'
	| declaration_specifiers init_declarator_list ';' {end_decl();}
	| static_assert_declaration
	| error ';'  { yyerrok; }
	| declaration_specifiers error ';' { yyerrok; }
	;

declaration_specifiers
	: storage_class_specifier declaration_specifiers
	| storage_class_specifier
	| type_specifier declaration_specifiers
	| type_specifier
	| type_qualifier declaration_specifiers
	| type_qualifier
	| function_specifier declaration_specifiers
	| function_specifier
	| alignment_specifier declaration_specifiers
	| alignment_specifier
	| error declaration_specifiers { yyerrok; }
	;

init_declarator_list
	: init_declarator
	| init_declarator_list ',' init_declarator
	| init_declarator_list ',' error { yyerrok; }
	;

init_declarator
	: declarator '='  initializer 
	| declarator
	//| error '=' initializer //{ yyerrok; }
	//| declarator '=' error //{ yyerrok; }
	;

storage_class_specifier
	: TYPEDEF	/* identifiers must be flagged as TYPEDEF_NAME */
	| EXTERN
	| STATIC
	| THREAD_LOCAL
	| AUTO
	| REGISTER
	;

type_specifier
	: VOID
	| CHAR
	| SHORT
	| {save_type_stack();} INT
	| LONG
	| FLOAT
	| DOUBLE
	| SIGNED
	| UNSIGNED
	| BOOL
	| COMPLEX
	| IMAGINARY	  	/* non-mandated extension */
	| atomic_type_specifier
	| struct_or_union_specifier
	| enum_specifier
	| TYPEDEF_NAME		/* after it has been defined as such */
	;

struct_or_union_specifier
	: struct_or_union '{' struct_declaration_list '}'
	| struct_or_union IDENTIFIER '{' struct_declaration_list '}'
	| struct_or_union IDENTIFIER {save_id_stack();}
	;

struct_or_union
	: STRUCT
	| UNION
	;

struct_declaration_list
	: struct_declaration
	| struct_declaration_list struct_declaration
	;

struct_declaration
	: specifier_qualifier_list ';'	/* for anonymous struct/union */
	| specifier_qualifier_list struct_declarator_list ';'
	| static_assert_declaration
	;

specifier_qualifier_list
	: type_specifier specifier_qualifier_list
	| type_specifier
	| type_qualifier specifier_qualifier_list
	| type_qualifier
	;

struct_declarator_list
	: struct_declarator
	| struct_declarator_list ',' struct_declarator
	;

struct_declarator
	: ':' constant_expression
	| declarator ':' constant_expression
	| declarator
	;

enum_specifier
	: ENUM '{' enumerator_list '}'
	| ENUM '{' enumerator_list ',' '}'
	| ENUM IDENTIFIER {save_id_stack();} '{' enumerator_list '}'
	| ENUM IDENTIFIER {save_id_stack();} '{' enumerator_list ',' '}'
	| ENUM IDENTIFIER {save_id_stack();}
	;

enumerator_list
	: enumerator
	| enumerator_list ',' enumerator
	;

enumerator	/* identifiers must be flagged as ENUMERATION_CONSTANT */
	: enumeration_constant '=' constant_expression
	| enumeration_constant
	;

atomic_type_specifier
	: ATOMIC '(' type_name ')'
	;

type_qualifier
	: CONST
	| RESTRICT
	| VOLATILE
	| ATOMIC
	;

function_specifier
	: INLINE
	| NORETURN
	;

alignment_specifier
	: ALIGNAS '(' type_name ')'
	| ALIGNAS '(' constant_expression ')'
	;

declarator
	: pointer direct_declarator
	| direct_declarator
	;

direct_declarator
	: IDENTIFIER {save_id_stack();}
	| '(' declarator ')'
	| direct_declarator '[' ']'
	| direct_declarator '[' '*' ']'
	| direct_declarator '[' STATIC type_qualifier_list assignment_expression ']'
	| direct_declarator '[' STATIC assignment_expression ']'
	| direct_declarator '[' type_qualifier_list '*' ']'
	| direct_declarator '[' type_qualifier_list STATIC assignment_expression ']'
	| direct_declarator '[' type_qualifier_list assignment_expression ']'
	| direct_declarator '[' type_qualifier_list ']'
	| direct_declarator '[' assignment_expression ']'
	| direct_declarator '(' parameter_type_list ')'
	| direct_declarator '(' ')'
	| direct_declarator '(' identifier_list ')'
	;

pointer
	: '*' type_qualifier_list pointer
	| '*' type_qualifier_list
	| '*' pointer
	| '*'
	;

type_qualifier_list
	: type_qualifier
	| type_qualifier_list type_qualifier
	;


parameter_type_list
	: parameter_list ',' ELLIPSIS
	| parameter_list
	;

parameter_list
	: parameter_declaration
	| parameter_list ',' parameter_declaration
	;

parameter_declaration
	: declaration_specifiers declarator
	| declaration_specifiers abstract_declarator
	| declaration_specifiers
	;

identifier_list
	: IDENTIFIER {save_id_stack();}
	| IDENTIFIER {save_id_stack();} ',' identifier_list
	;

type_name
	: specifier_qualifier_list abstract_declarator
	| specifier_qualifier_list
	;

abstract_declarator
	: pointer direct_abstract_declarator
	| pointer
	| direct_abstract_declarator
	;

direct_abstract_declarator
	: '(' abstract_declarator ')'
	| '[' ']'
	| '[' '*' ']'
	| '[' STATIC type_qualifier_list assignment_expression ']'
	| '[' STATIC assignment_expression ']'
	| '[' type_qualifier_list STATIC assignment_expression ']'
	| '[' type_qualifier_list assignment_expression ']'
	| '[' type_qualifier_list ']'
	| '[' assignment_expression ']'
	| direct_abstract_declarator '[' ']'
	| direct_abstract_declarator '[' '*' ']'
	| direct_abstract_declarator '[' STATIC type_qualifier_list assignment_expression ']'
	| direct_abstract_declarator '[' STATIC assignment_expression ']'
	| direct_abstract_declarator '[' type_qualifier_list assignment_expression ']'
	| direct_abstract_declarator '[' type_qualifier_list STATIC assignment_expression ']'
	| direct_abstract_declarator '[' type_qualifier_list ']'
	| direct_abstract_declarator '[' assignment_expression ']'
	| '(' ')'
	| '(' parameter_type_list ')'
	| direct_abstract_declarator '(' ')'
	| direct_abstract_declarator '(' parameter_type_list ')'
	;

initializer
	: '{' initializer_list '}'
	| '{' initializer_list ',' '}'
	| assignment_expression 
	;

initializer_list
	: designation initializer
	| initializer
	| initializer_list ',' designation initializer
	| initializer_list ',' initializer
	;

designation
	: designator_list '='
	;

designator_list
	: designator
	| designator_list designator
	;

designator
	: '[' constant_expression ']'
	| '.' IDENTIFIER {save_id_stack();}
	;

static_assert_declaration
	: STATIC_ASSERT '(' constant_expression ',' STRING_LITERAL ')' ';'
	;

statement
	: labeled_statement
	| compound_statement
	| expression_statement
	| selection_statement
	| iteration_statement
	| jump_statement
	;

labeled_statement
	: IDENTIFIER {save_id_stack();} ':' statement
	| CASE constant_expression ':' statement
	| DEFAULT ':' statement
	;

compound_statement
	: '{' '}'
	| '{' {printf("Open Scope\n"); add_new_TS(); add_new_TS();} block_item_list '}' {printf("Close Scope\n");}
	; /* HAY UN ERROR CON EL ADD NEW TS() SEGMENTATION fAULT*/

block_item_list
	: block_item
	| block_item_list block_item
	;

block_item
	: declaration
	| statement
	;

expression_statement
	: ';'
	| expression ';'
	| expression error { yyerrok; }
	;

selection_statement
	: IF {printf("INICIO_IF\n");} '(' expression ')' statement {printf("FIN_IF\n");}
	| IF '(' expression {begin_if();} ')' statement ELSE {printf("INICIO_ELSE\n");} statement {printf("FIN_IF\n");}
	| SWITCH '(' expression ')' statement
	;

iteration_statement
	: {printf("INICIO_WHILE\n");} WHILE '(' expression ')' statement
	| DO statement WHILE '(' expression ')' ';'
	| FOR '(' expression_statement expression_statement ')' statement
	| FOR '(' expression_statement expression_statement expression ')' statement
	| FOR '(' declaration expression_statement ')' statement
	| FOR '(' declaration expression_statement expression ')' statement
	//| WHILE '(' error ')' statement
	//| WHILE '(' expression ')' error
	| FOR '(' error expression_statement ')' statement
	| FOR error expression_statement ')' statement
	;

jump_statement
	: GOTO IDENTIFIER {save_id_stack();} ';'
	| CONTINUE ';'
	| BREAK ';'
	| RETURN ';'
	| RETURN expression ';'
	| RETURN error ';'
	;

translation_unit
	: external_declaration
	| translation_unit external_declaration
	;

external_declaration
	: function_definition
	| declaration
	;

function_definition
	: declaration_specifiers declarator declaration_list compound_statement
	| declaration_specifiers declarator compound_statement
	| error declarator compound_statement { yyerrok; }
	;

declaration_list
	: declaration
	| declaration_list declaration
	;

%%
#include <stdio.h>
#include <string.h>
extern int row;
extern int column;
char *messageOne;
char *messageTwo;
char *messageThree;

void writeInString(const char *s, int start, int end, int numLines){
	int MAXIDLEN = end - start;
	int i=0;
	char message[200], ch;
	while(start < end){
		ch = s[start];
		message[i] = ch;
		start++;
		i++;
	}
	message[i] = '\0';
	switch(numLines){
		case 1:
			messageOne =  malloc(MAXIDLEN);
			strcpy(messageOne, message);
			break;
		case 2:
			messageTwo = malloc(MAXIDLEN);
			strcpy(messageTwo, message);
			break;
		default:
			messageThree = malloc(MAXIDLEN);
			strcpy(messageThree, message);
	}
}

int messageAnalise(const char *s){
	int numLines = 0;
	int start = 0;
	int k=0;
	for(k; k < strlen(s); k++){
		if (s[k] == ',' && k < strlen(s)-1){
			if (s[k + 1] == ' '){
				numLines++;
				writeInString(s, start, k, numLines);
				start = k + 1;
			}
		}
	}
	numLines++;
	writeInString(s, start, k, numLines);
	numLines--;
	return numLines;
}

void lookLines(int lineError, int columnPar){
	char messageLine[MAX_LINE_PRINT];
	char messageRepresent[MAX_LINE_PRINT];
	for (int i=0; i < MAX_LINE_PRINT; i++){
		messageRepresent[i] ='\0';
	}
	int exactlyPlace = columnPar;
	int count;
	int tabs = 0;
	fseek(myfile, 0, SEEK_SET);
	int c;
	int countColumn = 0;
	int countLines = 1;
	while (countLines <= lineError){
		c = fgetc(myfile);
		if( feof(myfile)){
			break;
		}
		if (c == '\n'){
			countLines++;
		}else if (countLines == lineError && c != '\t'){
			messageLine[countColumn] = c;
			countColumn++;
		}else if (countLines == lineError && c == '\t'){
			tabs++;
		}
	}
	exactlyPlace = columnPar - (tabs * 4) + tabs;
	messageLine[countColumn] = '\0';
	countColumn = 0;
	while(countColumn < exactlyPlace){
		messageRepresent[countColumn] = ' ';
		countColumn++;
	}
	messageRepresent[countColumn - 1] = '^';
	messageRepresent[countColumn] = '\0';
	fprintf(stderr, " %s\n", messageLine);
	fprintf(stderr, " %s%s%s\n", COLOR_GREEN, messageRepresent, COLOR_RESET);
}

void yyerror(const char *s){
	fflush(stdout);
	counter++;
	int x = messageAnalise(s);
	int i;
	for (i = 0; yytext[i] != '\0'; i++){ }
	int columnPar = column - i;
	if (x == 0){
		fprintf(stderr, "%s%s:%d:%d: %s%s: %s'%s' \n", COLOR_BLUE, yyout, row, columnPar, COLOR_RED, messageOne, COLOR_YELLOW, yytext);
		free(messageOne);
	}else if(x == 1){
		fprintf(stderr, "%s%s:%d:%d: %s%s: %s'%s' %s%s \n", COLOR_BLUE, yyout, row, columnPar, COLOR_RED, messageOne, COLOR_YELLOW, yytext, COLOR_RESET, messageTwo);
		free(messageOne);
		free(messageTwo);
	}else if(x == 2){
		fprintf(stderr, "%s%s:%d:%d: %s%s: %s'%s' %s%s%s \n", COLOR_BLUE, yyout, row, columnPar, COLOR_RED, messageOne, COLOR_YELLOW, yytext, COLOR_RESET, messageTwo, messageThree);
		free(messageOne);
		free(messageTwo);
		free(messageThree);
	}else{
		fprintf(stderr, "No funcionó %s" , "l");
	}
	lookLines(row, columnPar);
}