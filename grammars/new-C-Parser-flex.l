/* from https://github.com/starclip/new-C-Parser */
/*DECLARACIONES*/

%e  1019
%p  2807
%n  371
%k  284
%a  1213
%o  1117
%x include_found
%x comment_found
%x define_found
%x process_define_value

O   [0-7]
D   [0-9]
NZ  [1-9]
L   [a-zA-Z_]
A   [a-zA-Z_0-9]
H   [a-fA-F0-9]
HP  (0[xX])
E   ([Ee][+-]?{D}+)
P   ([Pp][+-]?{D}+)
FS  (f|F|l|L)
IS  (((u|U)(l|L|ll|LL)?)|((l|L|ll|LL)(u|U)?))
CP  (u|U|L)
SP  (u8|u|U|L)
ES  (\\(['"\?\\abfnrtv]|[0-7]{1,3}|x[a-fA-F0-9]+))
WS  [ \t\v\n\f]

%{
#include <stdio.h>
#include "scanner.h"
#include "bison.tab.h"
FILE *processed_file;
FILE *myfile;
FILE *output;
#define YY_DECL extern int yylex()
#define MAX_INCLUDE_DEPTH 10
#define MAX_DEFINE_STRUCT 100
YY_BUFFER_STATE include_stack[MAX_INCLUDE_DEPTH];
int include_stack_ptr = 0;
int counter = 0;
int row = 1;
int column = 1;
char* aux_filename;
char* define_id;
char* define_value;
int i,j;
char* constant_sustitute = NULL;

typedef struct {
    char id[200];
    char value[200];
    struct define_struct *next;

}define_struct;

define_struct *first_define_node = NULL;
define_struct *last_define_node = NULL;
define_struct *current_define_node;


%}

%%
"/*"                    { BEGIN(comment_found); }
"//".*                  { /* consume //-comment */ }
"#include"              { BEGIN(include_found); }
"#define"[ \t]          { BEGIN(define_found); }

<include_found>[ \t]*      /* se come los espacios en blanco */
<include_found>[^ \t\n]+   { /* obtiene el nombre de fichero a incluir */
    if ( include_stack_ptr >= MAX_INCLUDE_DEPTH ){
        fprintf( stderr, "Demasiados include anidados" );
        exit( 1 );
    }

    include_stack[include_stack_ptr++] = YY_CURRENT_BUFFER;
	aux_filename = malloc(strlen(yytext));
    for(i=j=0; i<strlen(yytext); i++){
        if(yytext[i] != '"' && yytext[i] != '<' && yytext[i] != '>'){
            aux_filename[j++] = yytext[i];
        }
    }
	aux_filename[j] = '\0';
    yyin = fopen(aux_filename, "r");
    if (!yyin)
        error("No se pudo abrir el archivo: %s\n", yytext);

    yy_switch_to_buffer(yy_create_buffer(yyin, YY_BUF_SIZE));
    BEGIN(INITIAL);
}

<comment_found>([^*]|\n)+|.  
<comment_found>"*/"             { BEGIN INITIAL; } /* Falta verificar que se cierre el comentario */
<comment_found><<EOF>>          {yyerror("Comentario sin cerrar\n"); yyterminate();}

<define_found>[ \t]*      /* se come los espacios en blanco */
<define_found>[^ \t]+   { /* obtiene el ID */
    define_id = malloc(strlen(yytext)-1);
    for(i=j=0; i<strlen(yytext); i++){
        define_id[j] = yytext[i];
        j++;
    }
    define_id[j] = '\0';
    BEGIN(process_define_value);
}

<process_define_value>[ \t]*      /* se come los espacios en blanco */
<process_define_value>[^ \t\n]+   { /* obtiene el valor del ID */
    define_value = malloc(strlen(yytext)-1);
    current_define_node = (define_struct *) malloc(sizeof(define_struct));

    define_value = malloc(strlen(yytext)-1);
    for(i=j=0; i<strlen(yytext); i++){
        define_value[j] = yytext[i];
        j++;
    }
    define_value[j] = '\0';

    /* verificar si el id ya esta en los defines*/
    define_struct *aux;
    aux = first_define_node;
    int id_found_flag = 0;

    while(aux != NULL){
        if(!strcmp(define_id, aux->id)){
            id_found_flag = 1;
            for(i=0; i<strlen(aux->value); i++){
                aux->value[i] = '\0';
            }
            memcpy(aux->value, define_value, sizeof(define_value));
            break;
        }

        aux = aux->next;
    }

    if(!id_found_flag){
        memcpy(current_define_node->id, define_id, sizeof(define_id));
        memcpy(current_define_node->value, define_value, sizeof(define_value));
        
    }else{
        id_found_flag = 0;
    }

    /* resetear los valores */
    for(i=0; i<strlen(define_id); i++){
        define_id[i] = '\0';
    }

    for(i=0; i<strlen(define_value); i++){
        define_value[i] = '\0';
    }

    current_define_node->next = NULL;

    if (first_define_node==NULL) {
        first_define_node = current_define_node;
        last_define_node = current_define_node;
    }
    else {
        /* el que hasta ahora era el último tiene que apuntar al nuevo */
        last_define_node->next = current_define_node;
        /* hacemos que el nuevo sea ahora el último */
        last_define_node = current_define_node;
    }
    
    BEGIN(INITIAL);
}
<process_define_value><<EOF>>          {yyterminate();}


<<EOF>> {
    if ( --include_stack_ptr < 0 ){
        yyterminate();
    }

    else{
        yy_delete_buffer( YY_CURRENT_BUFFER );
        yy_switch_to_buffer(
        include_stack[include_stack_ptr] );
    }
}


"auto"					{ count(); write_to_processed_file(yytext); return(AUTO); }
"break"					{ count(); write_to_processed_file(yytext); return(BREAK); }
"case"					{ count(); write_to_processed_file(yytext); return(CASE); }
"char"					{ count(); write_to_processed_file(yytext); return(CHAR); }
"const"					{ count(); write_to_processed_file(yytext); return(CONST); }
"continue"				{ count(); write_to_processed_file(yytext); return(CONTINUE); }
"default"				{ count(); write_to_processed_file(yytext); return(DEFAULT); }
"do"					{ count(); write_to_processed_file(yytext); return(DO); }
"double"				{ count(); write_to_processed_file(yytext); return(DOUBLE); }
"else"					{ count(); write_to_processed_file(yytext); return(ELSE); }
"enum"					{ count(); write_to_processed_file(yytext); return(ENUM); }
"extern"				{ count(); write_to_processed_file(yytext); return(EXTERN); }
"float"					{ count(); write_to_processed_file(yytext); return(FLOAT); }
"for"					{ count(); write_to_processed_file(yytext); return(FOR); }
"goto"					{ count(); write_to_processed_file(yytext); return(GOTO); }
"if"					{ count(); write_to_processed_file(yytext); return(IF); }
"inline"				{ count(); write_to_processed_file(yytext); return(INLINE); }
"int"					{ count(); write_to_processed_file(yytext); return(INT); }
"long"					{ count(); write_to_processed_file(yytext); return(LONG); }
"register"				{ count(); write_to_processed_file(yytext); return(REGISTER); }
"restrict"				{ count(); write_to_processed_file(yytext); return(RESTRICT); }
"return"				{ count(); write_to_processed_file(yytext); return(RETURN); }
"short"					{ count(); write_to_processed_file(yytext); return(SHORT); }
"signed"				{ count(); write_to_processed_file(yytext); return(SIGNED); }
"sizeof"				{ count(); write_to_processed_file(yytext); return(SIZEOF); }
"static"				{ count(); write_to_processed_file(yytext); return(STATIC); }
"struct"				{ count(); write_to_processed_file(yytext); return(STRUCT); }
"switch"				{ count(); write_to_processed_file(yytext); return(SWITCH); }
"typedef"				{ count(); write_to_processed_file(yytext); return(TYPEDEF); }
"union"					{ count(); write_to_processed_file(yytext); return(UNION); }
"unsigned"				{ count(); write_to_processed_file(yytext); return(UNSIGNED); }
"void"					{ count(); write_to_processed_file(yytext); return(VOID); }
"volatile"				{ count(); write_to_processed_file(yytext); return(VOLATILE); }
"while"					{ count(); write_to_processed_file(yytext); return(WHILE); }
"_Alignas"              { count(); write_to_processed_file(yytext); return ALIGNAS; }
"_Alignof"              { count(); write_to_processed_file(yytext); return ALIGNOF; }
"_Atomic"               { count(); write_to_processed_file(yytext); return ATOMIC; }
"_Bool"                 { count(); write_to_processed_file(yytext); return BOOL; } 
"_Complex"              { count(); write_to_processed_file(yytext); return COMPLEX; }
"_Generic"              { count(); write_to_processed_file(yytext); return GENERIC; }
"_Imaginary"            { count(); write_to_processed_file(yytext); return IMAGINARY; }
"_Noreturn"             { count(); write_to_processed_file(yytext); return NORETURN; }
"_Static_assert"        { count(); write_to_processed_file(yytext); return STATIC_ASSERT; }
"_Thread_local"         { count(); write_to_processed_file(yytext); return THREAD_LOCAL; }
"__func__"              { count(); write_to_processed_file(yytext); return FUNC_NAME; }

{L}{A}*					{ count(); search_define_constant(); yylval.sval = strdup(yytext);
                          return check_type(); }

{HP}{H}+{IS}?				{ count(); yylval.sval = strdup(yytext); write_to_processed_file(yytext); return I_CONSTANT; }
{NZ}{D}*{IS}?				{ count(); yylval.sval = strdup(yytext); write_to_processed_file(yytext); return I_CONSTANT; }
"0"{O}*{IS}?				{ count(); yylval.sval = strdup(yytext); write_to_processed_file(yytext); return I_CONSTANT; }
{CP}?"'"([^'\\\n]|{ES})+"'"	{ count(); yylval.sval = strdup(yytext); write_to_processed_file(yytext); return I_CONSTANT; }

{D}+{E}{FS}?				{ count(); yylval.sval = strdup(yytext); write_to_processed_file(yytext); return F_CONSTANT; }
{D}*"."{D}+{E}?{FS}?		{ count(); yylval.sval = strdup(yytext); write_to_processed_file(yytext); return F_CONSTANT; }
{D}+"."{E}?{FS}?			{ count(); yylval.sval = strdup(yytext); write_to_processed_file(yytext); return F_CONSTANT; }
{HP}{H}+{P}{FS}?			{ count(); yylval.sval = strdup(yytext); write_to_processed_file(yytext); return F_CONSTANT; }
{HP}{H}*"."{H}+{P}{FS}?		{ count(); yylval.sval = strdup(yytext); write_to_processed_file(yytext); return F_CONSTANT; }
{HP}{H}+"."{P}{FS}?			{ count(); yylval.sval = strdup(yytext); write_to_processed_file(yytext); return F_CONSTANT; }

({SP}?\"([^"\\\n]|{ES})*\"{WS}*)+	{ count(); yylval.sval = strdup(yytext); format_string(yytext); return STRING_LITERAL;}

"..."					{ count(); write_to_processed_file(yytext); return ELLIPSIS; }
">>="					{ count(); write_to_processed_file(yytext); return RIGHT_ASSIGN; }
"<<="					{ count(); write_to_processed_file(yytext); return LEFT_ASSIGN; }
"+="					{ count(); write_to_processed_file(yytext); return ADD_ASSIGN; }
"-="					{ count(); write_to_processed_file(yytext); return SUB_ASSIGN; }
"*="					{ count(); write_to_processed_file(yytext); return MUL_ASSIGN; }
"/="					{ count(); write_to_processed_file(yytext); return DIV_ASSIGN; }
"%="					{ count(); write_to_processed_file(yytext); return MOD_ASSIGN; }
"&="					{ count(); write_to_processed_file(yytext); return AND_ASSIGN; }
"^="					{ count(); write_to_processed_file(yytext); return XOR_ASSIGN; }
"|="					{ count(); write_to_processed_file(yytext); return OR_ASSIGN; }
">>"					{ count(); write_to_processed_file(yytext); return RIGHT_OP; }
"<<"					{ count(); write_to_processed_file(yytext); return LEFT_OP; }
"++"					{ count(); write_to_processed_file(yytext); return INC_OP; }
"--"					{ count(); write_to_processed_file(yytext); return DEC_OP; }
"->"					{ count(); write_to_processed_file(yytext); return PTR_OP; }
"&&"					{ count(); write_to_processed_file(yytext); return AND_OP; }
"||"					{ count(); write_to_processed_file(yytext); return OR_OP; }
"<="					{ count(); write_to_processed_file(yytext); return LE_OP; }
">="					{ count(); write_to_processed_file(yytext); return GE_OP; }
"=="					{ count(); write_to_processed_file(yytext); return EQ_OP; }
"!="					{ count(); write_to_processed_file(yytext); return NE_OP; }
";"					    { count(); write_to_processed_file(yytext); return ';'; }
("{"|"<%")				{ count(); write_to_processed_file(yytext); return '{'; }
("}"|"%>")				{ count(); write_to_processed_file(yytext); return '}'; }
","					    { count(); write_to_processed_file(yytext); return ','; }
":"					    { count(); write_to_processed_file(yytext); return ':'; }
"="					    { count(); write_to_processed_file(yytext); return '='; }
"("					    { count(); write_to_processed_file(yytext); return '('; }
")"					    { count(); write_to_processed_file(yytext); return ')'; }
("["|"<:")				{ count(); write_to_processed_file(yytext); return '['; }
("]"|":>")				{ count(); write_to_processed_file(yytext); return ']'; }
"."					    { count(); write_to_processed_file(yytext); return '.'; }
"&"					    { count(); write_to_processed_file(yytext); return '&'; }
"!"					    { count(); write_to_processed_file(yytext); return '!'; }
"~"					    { count(); write_to_processed_file(yytext); return '~'; }
"-"					    { count(); write_to_processed_file(yytext); return '-'; }
"+"					    { count(); write_to_processed_file(yytext); return '+'; }
"*"					    { count(); write_to_processed_file(yytext); return '*'; }
"/"					    { count(); write_to_processed_file(yytext); return '/'; }
"%"					    { count(); write_to_processed_file(yytext); return '%'; }
"<"					    { count(); write_to_processed_file(yytext); return '<'; }
">"					    { count(); write_to_processed_file(yytext); return '>'; }
"^"					    { count(); write_to_processed_file(yytext); return '^'; }
"|"					    { count(); write_to_processed_file(yytext); return '|'; }
"?"					    { count(); write_to_processed_file(yytext); return '?'; }

{WS}+					{ count(); write_to_processed_file(yytext); /* whitespace separates tokens */ }
.	                    { printLexicalErrors();/* discard bad characters */ }

%%

int yywrap(void){       /* called at end of input */
    return 1;           /* terminate now */
}

static void comment(void){
    int c;

    while ((c = input()) != 0)
        if (c == '*')
        {
            while ((c = input()) == '*');

            if (c == '/')
                return;

            if (c == 0)
                break;
        }
    yyerror("unterminated comment");
}

static int check_type(void){
    switch (sym_type(yytext))
    {
    case TYPEDEF_NAME:                /* previously defined */
        return TYPEDEF_NAME;
    case ENUMERATION_CONSTANT:        /* previously defined */
        return ENUMERATION_CONSTANT;
    default:                          /* includes undefined */
        return IDENTIFIER;
    }
}

void count(){

	for (int i = 0; yytext[i] != '\0'; i++){
		if (yytext[i] == '\n'){
			column = 1;
          row++;
        }
		else if (yytext[i] == '\t'){
			column += 4 - (column % 4);
        }
		else{
			column++;
        }
    }
}

void printLexicalErrors(void){
	
	fprintf(stderr, "%s:%d:%d: %s%s: %s stray %s'%s' %s in program \n\n", COLOR_BLUE, row, column, COLOR_RED, "lexical error", COLOR_RESET, COLOR_YELLOW, yytext, COLOR_RESET);
	fprintf(stdout, "Fila:%d - Columna:%d : \n%s, %s: %s \n\n", row+1, column, "lexical error", "character unknown", yytext);
	counter++;
}

void search_define_constant(){
    define_struct *aux;
    aux = first_define_node;
    constant_sustitute = yytext;
    int constant_found_flag = 0;

    while(aux != NULL){
        //printf("Lista: %s\n", aux->id);
        if(!strcmp(yytext, aux->id)){
            constant_sustitute = aux->value;
            constant_found_flag = 1;
            break;
        }

        aux = aux->next;
    }

    if(constant_found_flag){
        write_to_processed_file(constant_sustitute);
        constant_found_flag = 0;
        
    }else{
        write_to_processed_file(yytext);
    }
    
}

void format_string(char* string){
    char aux[sizeof(string)+1];
    int index = 0;
    char* s;
    for(s = &string[0]; *s!='\0'; s++){
        if(*s == '%'){
            aux[index++] = *s;
        }
        aux[index++] = *s;
    }
    aux[index] = '\0';
    write_to_processed_file(aux);
}

void write_to_processed_file(char* string){
    fprintf(yyout, string);
}
