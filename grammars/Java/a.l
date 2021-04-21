%{

#include "main.h"
#include "y.tab.h"

char* table[MAX_BUFFER];
int layer_table[MAX_BUFFER];

int line=0;	//for and line number
int tail=-1,layer=0;	//tail for end of hashtable ; layer for scope
int f_com=0;	//comment flag
int f_mis=0;	//mistake flag
int for_key=0; 	//for while flag
int f_fun=0;	//func flag

char id_name[MAX_BUFFER];
char buffer[MAX_BUFFER];
char error[MAX_BUFFER];
char error2[MAX_BUFFER];

void creat();
int lookup(char* id);
int lookups(char* id);
int insert(char* id);
void check_layer(char c);

void Str(char* s, int len);
void buffered(int len, char *s);

void print();
void Space(char* s);
void newline();
void Error();
%}

num [0-9]
ch [a-zA-Z_$]
fraction 0|[0-9]*
integer 0|[1-9][0-9]*
real {integer}"."{fraction}|({integer}|{integer}"."{fraction})[Ee][+-]?({integer})[fFdD]?

id [a-zA-Z_$]+[a-zA-Z_0-9_$]*
id_error [0-9]+[a-zA-Z_0-9_$]*

bracket "("|")"|"["|"]"|"{"|"}"
punctuation ";"|":"|","|"."
equal_operator "="
operator "+"|"-"|"*"|"/"|"%"
double_operator "++"|"--"
compare_bool "<="|">="|"=="|"!="|"<"|">"
connect_bool "&&"|"||"

str \"(\\['"abfnrtv\\]|[^\\"])*\"
str_error ["].*["]

comment [/][/].*
muti_comment [/][*]([^*]|[*]*[^*/])*[*]+[/]


space [ \t]
eol \r\n|\n
dot .

%%
{comment}	{ f_com=1; buffered(yyleng, yytext);}
{muti_comment}	{ f_com=1; buffered(yyleng, yytext);}

print 		{ buffered(yyleng, yytext); return PRINT;}
read 		{ buffered(yyleng, yytext); return READ;}

class 		{ buffered(yyleng, yytext); return CLASS;}
this 		{ buffered(yyleng, yytext); return THIS;}
main		{ buffered(yyleng, yytext); return MAIN;}

if 			{ buffered(yyleng, yytext); return IF;}
else		{ buffered(yyleng, yytext); return ELSE;}

for 		{ for_key=1;buffered(yyleng, yytext); return FOR;}

while 		{ for_key=1;buffered(yyleng, yytext); return WHILE;}
do 			{ buffered(yyleng, yytext); return DO;}

switch 		{ buffered(yyleng, yytext); return SWITCH;}
case 		{ buffered(yyleng, yytext); return CASE;}
default 	{ buffered(yyleng, yytext); return DEFAULT;}

continue	{ buffered(yyleng, yytext); return CONTINUE;}
break		{ buffered(yyleng, yytext); return BREAK;}

true 		{ buffered(yyleng, yytext); return TRUE;}
false 		{ buffered(yyleng, yytext); return FALSE;}

try 		{ buffered(yyleng, yytext); return TRY;}
catch		{ buffered(yyleng, yytext); return CATCH;}

void		{ buffered(yyleng, yytext); return VOID;}
int 		{ buffered(yyleng, yytext); return INT;}
float 		{ buffered(yyleng, yytext); return FLOAT;}
double 		{ buffered(yyleng, yytext); return DOUBLE;}
char 		{ buffered(yyleng, yytext); return CHAR;}
String 		{ buffered(yyleng, yytext); return STRING;}
boolean		{ buffered(yyleng, yytext); return BOOLEAN;}

new 		{ buffered(yyleng, yytext); return NEW;}
final 		{ buffered(yyleng, yytext); return FINAL;}
static 		{ buffered(yyleng, yytext); return STATIC;}
const		{ buffered(yyleng, yytext); return CONST;}

finally 	{ buffered(yyleng, yytext); return FINALLY;}
public 		{ buffered(yyleng, yytext); return PUBLIC;}
private 	{ buffered(yyleng, yytext); return PRIVATE;}
protected 	{ buffered(yyleng, yytext); return PROTECTED;}

return 		{ buffered(yyleng, yytext); return RETURN;}
extends		{ buffered(yyleng, yytext); return EXTENDS;}
implements	{ buffered(yyleng, yytext); return IMPLEMENTS;}
Exception	{ buffered(yyleng, yytext); return EXCEPTION;}

{bracket}	{ buffered(yyleng, yytext); check_layer(yytext[0]); return yytext[0];}
{punctuation}		{ buffered(yyleng, yytext); return yytext[0];}
{equal_operator}	{ buffered(yyleng, yytext); return EQUAL;}	
{operator}	{ buffered(yyleng, yytext); return yytext[0];}
{double_operator}	{ buffered(yyleng, yytext); return DOUBLE_OPERATOR;}	
{compare_bool}		{ buffered(yyleng, yytext); return COMPARE;}
{connect_bool}		{ buffered(yyleng, yytext); return CONNECT;}

{str}		{ Str(yytext,yyleng); return STRING_DATA;}

{eol}		{ print(); newline();}
{space}		{ Space(yytext);}

{integer} 	{ buffered(yyleng, yytext); return INT_DATA;}
{real}	{ buffered(yyleng, yytext); return REAL_DATA;}

{id}		{ buffered(yyleng, yytext); yylval.sval=strdup(yytext); strcpy(id_name, yytext); return ID;}

{dot}		{ strcat(buffer,yytext);}

%%

int yywrap(){
	return 1;
}

void creat(){
	tail=-1;
	for(int i=0;i<MAX_BUFFER;i++){
		table[i]=NULL;
		layer_table[i]=0;
	}
	return ;
}
//for redefine
int lookup(char *id){
	int index=0;
	while(table[index] != NULL){
		if(!strcmp(table[index],id) && layer_table[index]==layer&& layer_table[index]>-1){
			return index;
		}
		index++;
	}
	return -1;
}
//for undefined
int lookups(char *id){
	int index = 0;
	while(table[index] != NULL){
		if(!strcmp(table[index],id) && layer_table[index]<=layer&& layer_table[index]>-1){//layer½Ä¬ð 
			return index;
		}
		index++;
	}
	return -1;
}
int insert(char *id){
	table[++tail]=(char*)malloc(sizeof(char)*MAX_BUFFER);
	strcpy(table[tail],id);
	layer_table[tail]=layer;
	return 1;
}
void Str(char* s,int l){
	char* f=(char*)malloc(sizeof(char) * MAX_BUFFER);
	strcpy(f,s);
	for(int i=0;i<l-1;i++){	
		if((f[i]=='\\' && f[i+1]=='\"') || (f[i]=='\\' && f[i+1]=='\\')){
			for(int j=i;j<l-1;j++){
				f[j]=f[j+1];
			}
			l--;
			f[l]='\0';
		}
	}
	strcat(buffer,f);
	return ;
}
/*for: if '(' do layer++ 
	   if ')' don't do anything(by for_key==1) //because for may not have '{'
	   if no '{' go yacc loop_simple do for_key=0; check_layer('}'); //because for terminate
	   if has '{' then '}' do layer--; for_key=0;*/
void check_layer( char c ){
	if(c=='(' || c=='{'){
		if(for_key==1 && c=='{');
		else if(f_fun==1 && c=='{');
		else
			layer++;
	}
	else if(c==')' || c=='}'){
		if( (for_key==1 || f_fun==1) && c=='}'){
			layer--;
			int index=0;
			while(table[index]!=NULL){	
				if(layer_table[index]>layer){
					layer_table[index]=-1;
				}
				index++;
			}
			//printf("compound for end");
			for_key=0;
			f_fun=0;
		}
		else if(for_key==0){
			if(f_fun==1);
			else{
				layer--;
				int index=0;
				while(table[index]!=NULL){	
					if(layer_table[index]>layer){
						layer_table[index]=-1;
					}
					index++;
				}
			}
		}
	}
	//printf("layer:%d\n",layer);
	return;
}

void buffered(int len,char *s){
	strcat(buffer,s);
}

void print(){
	printf("%s\n",buffer);
	if(f_mis==1){
		printf("%s\n",error);
		int i;
		for(i=0;i<MAX_BUFFER;i++){
			error[i]='\0';
		}
		f_mis=0;
	}
}

void Space(char* s){
	strcat(buffer,s);
}

void newline(){
	line++;
	for(int i=0;i<MAX_BUFFER;i++){
		buffer[i]='\0';
	}
	sprintf(buffer,"Line: %d: ",line);
}

void Error(char* s){
	sprintf(error2,"> ERROR : Line %d has %s\n",line,s);//just like itoa() but linux do not support itoa; 
	strcat(error, error2);
	return ;
}
