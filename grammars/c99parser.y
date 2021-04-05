/* from https://github.com/alekseyburger/c99parser */
%{
#include <stdio.h>
#include <string.h>

#include "struct_table.h"

extern "C"
{

int yyparse(void);
int yylex(void);  
void yyerror(const char *str)
{
        fprintf(stderr,"error: %s\n",str);
}
        
int yywrap()
{
        return 1;
} 

declaration_t current;

main()
{       
        declaration_clean(&current);
        struct_table_init(); // init defenitions store

        yyparse();        // parse input and push info to store

        show_variable_table();  // process with parser results
        show_types_table();
        show_typedefs_table();
}

}

%}

%token  AUTO;
%token  BREAK;
%token  CASE;
%token  CHAR;
%token  CONST;
%token  CONTINUE;
%token  DEFAULT;
%token  DO;
%token  DOUBLE;
%token  ELSE;
%token  ENUM;
%token  EXTERN;
%token  FLOAT;
%token  FOR;
%token  GOTO;
%token  IF;
%token  INT;
%token  LONG;
%token  REGISTER;
%token  RETURN;
%token  SHORT;
%token  SIGNED;
%token  SIZEOF;
%token  STATIC;
%token  STRUCT;
%token  SWITCH;
%token  TYPEDEF;
%token  UNION;
%token  UNSIGNED;
%token  VOID;
%token  VOLATILE;
%token  WHILE;

%token PLUS;
%token MINUS;
%token TIMES;
%token DIVIDE;
%token MOD;
%token OR;
%token AND;
%token NOT;
%token XOR;
%token LSHIFT;
%token RSHIFT;
%token LOR;
%token LAND;
%token LNOT;
%token LT;
%token GT;
%token LE;
%token GE;
%token EQ;
%token NE;

%token EQUALS;
%token TIMESEQUAL;
%token DIVEQUAL;
%token MODEQUAL;
%token PLUSEQUAL;
%token MINUSEQUAL;
%token LSHIFTEQUAL;
%token RSHIFTEQUAL;
%token ANDEQUAL;
%token OREQUAL;
%token XOREQUAL;

%token PLUSPLUS;
%token MINUSMINUS;

%token ARROW;
%token CONDOP;

%token LPAREN;
%token RPAREN;
%token LBRACKET;
%token RBRACKET;
%token LBRACE;
%token RBRACE;
%token COMMA;
%token PERIOD;
%token SEMI;
%token COLON;
%token ELLIPSIS;

%token TYPEID;
%token SCONST;
%token FCONST;
%token CCONST;

%union
{
#define ID_MAME_LEN 256

        unsigned unumber;
        char     str[ID_MAME_LEN];
        void*    type_ptr;
}

%token <number> ICONST
%token <str> ID
%token <type_ptr> TYPEID

%%
translation_unit : external_declaration
    | translation_unit external_declaration
    ;

external_declaration : function_definition
    | declaration
    ;

function_definition : declaration_specifiers declarator declaration_list compound_statement
    | declarator declaration_list compound_statement
    | declarator compound_statement
    | declaration_specifiers declarator compound_statement
    ;

declaration : declaration_specifiers init_declarator_list SEMI { add_variable(&current); } 
    | declaration_specifiers SEMI                              { declaration_clean(&current); } 
    ;

declaration_list : declaration
    | declaration_list declaration 
    ;

declaration_specifiers : storage_class_specifier declaration_specifiers
    | type_specifier declaration_specifiers
    | type_qualifier declaration_specifiers
    | storage_class_specifier
    | type_specifier
    | type_qualifier
    ;

storage_class_specifier : AUTO { declaration_set_qualifier(&current,AUTO); }
    | REGISTER  { declaration_set_qualifier(&current,REGISTER); }
    | STATIC    { declaration_set_qualifier(&current,STATIC); }
    | EXTERN    { declaration_set_qualifier(&current,EXTERN); }
    | TYPEDEF   { declaration_set_qualifier(&current,TYPEDEF); }
    ;

type_specifier : VOID   { declaration_set_type(&current, VOID); }
    | CHAR              { declaration_set_type(&current, CHAR); }
    | SHORT             { declaration_set_type(&current, SHORT); }
    | INT               { declaration_set_type(&current, INT); }
    | LONG              { declaration_set_type(&current, LONG); }
    | FLOAT             { declaration_set_type(&current, FLOAT); }
    | DOUBLE            { declaration_set_type(&current, DOUBLE); }
    | SIGNED            { declaration_set_qualifier(&current, SIGNED); }
    | UNSIGNED          { declaration_set_qualifier(&current, UNSIGNED); }
    | struct_or_union_specifier
    | enum_specifier
    | TYPEID            {  declaration_set_type(&current, TYPEDEF); declaration_set_user_type(&current, $1); }
    ;

type_qualifier : CONST
    | VOLATILE
    ;

struct_or_union_specifier : struct_or_union ID LBRACE struct_declaration_list RBRACE 
        {
            finish_user_type_set_name($2);
        }
    | struct_or_union LBRACE struct_declaration_list RBRACE
        {
           finish_user_type();
        }   
    | struct_or_union ID 
        {
            void* struct_ptr = find_struct_union($2);
            if (!struct_ptr) {
                yyerror("Struct/union defenition not found for name:");
                yyerror($2);
                YYERROR;
            } else {
                finish_user_type_from_table();
                declaration_set_user_type(&current, struct_ptr);
            }
        }
    ;

struct_or_union : STRUCT    { declaration_set_type(&current,STRUCT);add_user_type(&current);}
    | UNION                 { declaration_set_type(&current,UNION); add_user_type(&current);}
    ;

struct_declaration_list : struct_declaration
    | struct_declaration_list struct_declaration
    ;

init_declarator_list : init_declarator
    | init_declarator_list COMMA init_declarator
    ;

init_declarator : declarator
    | declarator EQUALS initializer
    ;

struct_declaration : specifier_qualifier_list struct_declarator_list SEMI
                   // struct element declaration is compleated
                   { add_element(&current); }
    ;

specifier_qualifier_list : type_specifier specifier_qualifier_list
    | type_specifier
    | type_qualifier specifier_qualifier_list
    | type_qualifier
    ;

struct_declarator_list : struct_declarator
    | struct_declarator_list COMMA struct_declarator
    ;

struct_declarator : declarator
    | declarator COLON constant_expression
    | COLON constant_expression
    ;

enum_specifier : ENUM ID LBRACE enumerator_list RBRACE
    | ENUM LBRACE enumerator_list RBRACE
    | ENUM ID
    ;

enumerator_list : enumerator
    | enumerator_list COMMA enumerator
    ;

enumerator : ID
    | ID EQUALS constant_expression
    ;

declarator : pointer direct_declarator
    | direct_declarator
    ;

direct_declarator : ID  { declaration_set_name(&current, $1);}
    | LPAREN declarator RPAREN
    | direct_declarator LBRACKET constant_expression_opt RBRACKET
    | direct_declarator LPAREN parameter_type_list RPAREN 
    | direct_declarator LPAREN identifier_list RPAREN 
    | direct_declarator LPAREN RPAREN 
    ;

pointer : TIMES type_qualifier_list
    | TIMES
    | TIMES type_qualifier_list pointer
    | TIMES pointer
    ;

type_qualifier_list : type_qualifier
    | type_qualifier_list type_qualifier
    ;

parameter_type_list : parameter_list
    | parameter_list COMMA ELLIPSIS
    ;

parameter_list : parameter_declaration
    | parameter_list COMMA parameter_declaration
    ;

parameter_declaration : declaration_specifiers declarator
    | declaration_specifiers abstract_declarator_opt
    ;

identifier_list : ID
    | identifier_list COMMA ID
    ;

initializer : assignment_expression
    |  LBRACE initializer_list RBRACE
    | LBRACE initializer_list COMMA RBRACE
    ;

initializer_list : initializer
    | initializer_list COMMA initializer
    ;

type_name : specifier_qualifier_list abstract_declarator_opt
    ;

abstract_declarator_opt : empty
    | abstract_declarator
    ;

abstract_declarator : pointer 
    | pointer direct_abstract_declarator
    | direct_abstract_declarator
    ;

direct_abstract_declarator : LPAREN abstract_declarator RPAREN
    | direct_abstract_declarator LBRACKET constant_expression_opt RBRACKET
    | LBRACKET constant_expression_opt RBRACKET
    | direct_abstract_declarator LPAREN parameter_type_list_opt RPAREN
    | LPAREN parameter_type_list_opt RPAREN
    ;

constant_expression_opt : empty
    | constant_expression
    ;

parameter_type_list_opt : empty
    | parameter_type_list
    ;

statement : labeled_statement
    | expression_statement
    | compound_statement
    | selection_statement
    | iteration_statement
    | jump_statement
    ;

labeled_statement : ID COLON statement
    | CASE constant_expression COLON statement
    | DEFAULT COLON statement
    ;

expression_statement : expression_opt SEMI
    ;

compound_statement : LBRACE declaration_list statement_list RBRACE
    | LBRACE statement_list RBRACE
    | LBRACE declaration_list RBRACE
    | LBRACE RBRACE
    ;

statement_list : statement
    | statement_list statement
    ;

selection_statement : IF LPAREN expression RPAREN statement
    | IF LPAREN expression RPAREN statement ELSE statement 
    | SWITCH LPAREN expression RPAREN statement 
    ;
iteration_statement : WHILE LPAREN expression RPAREN statement
    | FOR LPAREN expression_opt SEMI expression_opt SEMI expression_opt RPAREN statement 
    | DO statement WHILE LPAREN expression RPAREN SEMI
    ;

jump_statement : GOTO ID SEMI
    | CONTINUE SEMI
    | BREAK SEMI
    | RETURN expression_opt SEMI
    ;

expression_opt : empty
    | expression
    ;

expression : assignment_expression
    | expression COMMA assignment_expression
    ;

assignment_expression : conditional_expression
    | unary_expression assignment_operator assignment_expression
    ;

assignment_operator : EQUALS
    | TIMESEQUAL
    | DIVEQUAL
    | MODEQUAL
    | PLUSEQUAL
    | MINUSEQUAL
    | LSHIFTEQUAL
    | RSHIFTEQUAL
    | ANDEQUAL
    | OREQUAL
    | XOREQUAL
    ;

conditional_expression : logical_or_expression
    | logical_or_expression CONDOP expression COLON conditional_expression 
    ;

constant_expression : conditional_expression
    ;

logical_or_expression : logical_and_expression
    | logical_or_expression LOR logical_and_expression
    ;

logical_and_expression : inclusive_or_expression
    | logical_and_expression LAND inclusive_or_expression
    ;

inclusive_or_expression : exclusive_or_expression
    | inclusive_or_expression OR exclusive_or_expression
    ;

exclusive_or_expression :  and_expression
    |  exclusive_or_expression XOR and_expression
    ;

and_expression : equality_expression
    | and_expression AND equality_expression
    ;

equality_expression : relational_expression
    | equality_expression EQ relational_expression
    | equality_expression NE relational_expression
    ;

relational_expression : shift_expression
    | relational_expression LT shift_expression
    | relational_expression GT shift_expression
    | relational_expression LE shift_expression
    | relational_expression GE shift_expression
    ;

shift_expression : additive_expression
    | shift_expression LSHIFT additive_expression
    | shift_expression RSHIFT additive_expression
    ;

additive_expression : multiplicative_expression
    | additive_expression PLUS multiplicative_expression
    | additive_expression MINUS multiplicative_expression
    ;

multiplicative_expression : cast_expression
    | multiplicative_expression TIMES cast_expression
    | multiplicative_expression DIVIDE cast_expression
    | multiplicative_expression MOD cast_expression
    ;

cast_expression : unary_expression
    | LPAREN type_name RPAREN cast_expression
    ;

unary_expression : postfix_expression
    | PLUSPLUS unary_expression
    | MINUSMINUS unary_expression
    | unary_operator cast_expression
    | SIZEOF unary_expression
    | SIZEOF LPAREN type_name RPAREN
    ;

unary_operator : AND
    | TIMES
    | PLUS 
    | MINUS
    | NOT
    | LNOT
    ;

postfix_expression : primary_expression
    | postfix_expression LBRACKET expression RBRACKET
    | postfix_expression LPAREN argument_expression_list RPAREN
    | postfix_expression LPAREN RPAREN
    | postfix_expression PERIOD ID
    | postfix_expression ARROW ID
    | postfix_expression PLUSPLUS
    | postfix_expression MINUSMINUS
    ;

primary_expression :  ID
    |  constant
    |  SCONST
    |  LPAREN expression RPAREN
    ;

argument_expression_list :  assignment_expression
    |  argument_expression_list COMMA assignment_expression
    ;

constant : ICONST
    | FCONST
    | CCONST
    ;

empty : 
    ;
%%