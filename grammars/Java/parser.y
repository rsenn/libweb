%{
	
    #include <stdio.h> 
    #include <string.h>    
    #include <stdlib.h> 
    extern int yylex(); 
    extern FILE *yyin;
    void yyerror(char *msg); 

    int cnt=0;
    int verbose=0;
    FILE* demo;
    FILE* inp;  
    char* str;
%}

%union { 
    char* sval; 
    char* nt;
 }

%start Goal
%token<sval> Identifier Literal
%token<sval> Abstract   Continue   For          New         Switch
%token<sval> Assert     Default    If           Package     Synchronized
%token<sval> Boolean    Do         Goto         Private     This
%token<sval> Break      Double     Implements   Protected   Throw
%token<sval> Byte       Else       Import       Public      Throws1
%token<sval> Case       Enum       Instanceof   Return      Transient
%token<sval> Catch      Extends    Int          Short       Try
%token<sval> Char       Final      Interface    Static      Void
%token<sval> Class      Finally1    Long         Strictfp    Volatile
%token<sval> Const      Float      Native       Super1       While
%token<sval> OpBrac   ClosBrac   OCBrac   CCBrac   OSBrac   CSBrac   SemiColon   Comma   Dot   
%token<sval> o1   Attherate   o2
%token<sval> Equal   GT   LT   Excl   Tilda   Ques   Colon   o3
%token<sval> o4  o5  o6  o7  o8  o9  o10  o11
%token<sval> Plus   Minus   Multiply   Divide   And   Or   Xor   Percent   o12   o13   o14
%token<sval> o15  o16  o17  o18  o19  o20  o21  o22  o23  o24  o25

%type<nt> Goal CompilationUnit Type PrimitiveType NumericType IntegralType FloatingPointType ReferenceType ClassOrInterfaceType 
%type<nt> ClassType InterfaceType ArrayType Name SimpleName QualifiedName ImportDeclarations TypeDeclarations
%type<nt> PackageDeclaration ImportDeclaration SingleTypeImportDeclaration TypeImportOnDemandDeclaration TypeDeclaration Modifiers
%type<nt> Modifier ClassDeclaration Super Interfaces InterfaceTypeList ClassBody ClassBodyDeclarations ClassBodyDeclaration
%type<nt> ClassMemberDeclaration FieldDeclaration VariableDeclarators VariableDeclarator VariableDeclaratorId VariableInitializer
%type<nt> MethodDeclaration MethodHeader MethodDeclarator FormalParameterList FormalParameter Throws ClassTypeList MethodBody
%type<nt> StaticInitializer ConstructorDeclaration ConstructorDeclarator ConstructorBody ExplicitConstructorInvocation
%type<nt> InterfaceDeclaration ExtendsInterfaces InterfaceBody InterfaceMemberDeclarations InterfaceMemberDeclaration
%type<nt> ConstantDeclaration AbstractMethodDeclaration ArrayInitializer VariableInitializers Block BlockStatements BlockStatement
%type<nt> LocalVariableDeclarationStatement LocalVariableDeclaration Statement StatementNoShortif StatementWithoutTrailingSubstatement
%type<nt> EmptyStatement LabeledStatement LabeledStatementNoShortif ExpressionStatement StatementExpression ifThenStatement ifThenElseStatement
%type<nt> ifThenElseStatementNoShortif SwitchStatement SwitchBlock SwitchBlockStatementGroups SwitchBlockStatementGroup SwitchLabels
%type<nt> SwitchLabel WhileStatement WhileStatementNoShortif DoStatement ForStatement ForStatementNoShortif ForInit ForUpdate StatementExpressionList
%type<nt> BreakStatement ContinueStatement ReturnStatement ThrowStatement SynchronizedStatement TryStatement Catches CatchClause Finally
%type<nt> Primary PrimaryNoNewArray ClassInstanceCreationExpression ArgumentList ArrayCreationExpression DimExprs DimExpr Dims
%type<nt> FieldAccess MethodInvocation ArrayAccess PostfixExpression PostIncrementExpression PostDecrementExpression UnaryExpression
%type<nt> PreIncrementExpression PreDecrementExpression UnaryExpressionNotPlusMinus CastExpression MultiplicativeExpression AdditiveExpression
%type<nt> ShiftExpression RelationalExpression EqualityExpression AndExpression ExclusiveOrExpression InclusiveOrExpression ConditionalAndExpression
%type<nt> ConditionalOrExpression ConditionalExpression AssignmentExpression Assignment LeftHandSide AssignmentOperator Expression ConstantExpression

%%
Goal:
    CompilationUnit  { $$ = $1; }
    ;

Type:
    PrimitiveType    { $$ = $1; }
    | ReferenceType  { $$ = $1; }
    ;

PrimitiveType:
    NumericType    { $$ = $1; }
    | Boolean    { $$ = $1; }
    ;

NumericType:
    IntegralType  { $$ = $1; }
    | FloatingPointType  { $$ = $1; }
    ;

IntegralType:
    Byte { $$ = $1; }
    | Short { $$ = $1; }
    | Int { $$ = $1; }
    | Long { $$ = $1; }
    | Char { $$ = $1; }
    ;

FloatingPointType:
    Float { $$ = $1; }
    | Double { $$ = $1; }
    ;

ReferenceType:
    ClassOrInterfaceType { $$ = $1; }
    | ArrayType  { $$ = $1; }
    ;

ClassOrInterfaceType:
    Name { $$ = $1; }
    ;

ClassType:
    ClassOrInterfaceType { $$ = $1; }
    ;

InterfaceType:
    ClassOrInterfaceType { $$ = $1; }
    ;

ArrayType:
    PrimitiveType OSBrac CSBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayType_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    | Name OSBrac CSBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayType_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    | ArrayType OSBrac CSBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayType_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    ;

Name:
    SimpleName { $$ = $1; }
    | QualifiedName  { $$ = $1; }
    ;

SimpleName:
    Identifier  { strcpy(str,"\"");strcat(str,$1);strcat(str,"\"");$$ = str;}
    ;

QualifiedName:
    Name Dot Identifier {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"QualifiedName_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    ;

CompilationUnit:
    PackageDeclaration ImportDeclarations TypeDeclarations {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"CompilationUnit_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | PackageDeclaration ImportDeclarations {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"CompilationUnit_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}	
    | PackageDeclaration TypeDeclarations {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"CompilationUnit_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    | ImportDeclarations TypeDeclarations {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"CompilationUnit_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    | PackageDeclaration				   { $$ = $1; }
    | ImportDeclarations				   { $$ = $1; }
    | TypeDeclarations					   { $$ = $1; } 	
    | { $$ = '\0';}
    ;

ImportDeclarations:
    ImportDeclaration    { $$ = $1; }
    | ImportDeclarations ImportDeclaration {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ImportDeclarations_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

TypeDeclarations:
    TypeDeclaration   { $$ = $1; }
    | TypeDeclarations TypeDeclaration {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"TypeDeclarations_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

PackageDeclaration:
    Package Name SemiColon {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"PackageDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    ;

ImportDeclaration:
    SingleTypeImportDeclaration  { $$ = $1; } 
    | TypeImportOnDemandDeclaration  { $$ = $1; }
    ;

SingleTypeImportDeclaration:
    Import Name SemiColon  {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SingleTypeImportDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    ;

TypeImportOnDemandDeclaration:
    Import Name Dot Multiply SemiColon {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"TypeImportOnDemandDeclaration_%d",cnt);////////////////////////////
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	cnt++;
	}
    ;

TypeDeclaration:
    ClassDeclaration   { $$ = $1; }
    | InterfaceDeclaration { $$ = $1; }
    ;

Modifiers:
    Modifier  { $$ = $1; }
    | Modifiers Modifier {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Modifiers_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

Modifier: 
    Public { $$ = $1; }
    | Protected { $$ = $1; } 
    | Private { $$ = $1; }
    | Static { $$ = $1; }
    | Abstract { $$ = $1; } 
    | Final { $$ = $1; }
    | Native { $$ = $1; }
    | Synchronized { $$ = $1; } 
    | Transient { $$ = $1; }
    | Volatile { $$ = $1; }
    ;

ClassDeclaration:
    Modifiers Class Identifier Super Interfaces ClassBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	cnt++;
	}
    | Modifiers Class Identifier Super ClassBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
	}
    | Modifiers Class Identifier Interfaces ClassBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
	}
    | Class Identifier Super Interfaces ClassBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
	}
    | Modifiers Class Identifier ClassBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
	}
    | Class Identifier Super ClassBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
	}
    | Class Identifier Interfaces ClassBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
	}
    | Class Identifier ClassBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

Super:
    Extends ClassType {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Super_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

Interfaces:
    Implements InterfaceTypeList {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Interfaces_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

InterfaceTypeList:
    InterfaceType { $$ = $1; }
    | InterfaceTypeList Comma InterfaceType {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"InterfaceTypeList_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

ClassBody:
    OCBrac ClassBodyDeclarations CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassBody_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    | OCBrac CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassBody_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
	}
    ;

ClassBodyDeclarations:
    ClassBodyDeclaration { $$ = $1; }
    | ClassBodyDeclarations ClassBodyDeclaration {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassBodyDeclarations_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

ClassBodyDeclaration:
    ClassMemberDeclaration { $$ = $1; }
    | StaticInitializer { $$ = $1; }
    | ConstructorDeclaration { $$ = $1; }
    | ClassDeclaration { $$ = $1; }
    ;

ClassMemberDeclaration:
    FieldDeclaration { $$ = $1; }
    | MethodDeclaration { $$ = $1; }
    ;

FieldDeclaration:
    Modifiers Type VariableDeclarators SemiColon {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"FieldDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
	}
    | Type VariableDeclarators SemiColon {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"FieldDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    ;

VariableDeclarators:
    VariableDeclarator { $$ = $1; }
    | VariableDeclarators Comma VariableDeclarator {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"VariableDeclarators_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

VariableDeclarator:
    VariableDeclaratorId { $$ = $1; }
    | VariableDeclaratorId Equal VariableInitializer {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"VariableDeclarator_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

VariableDeclaratorId:
    Identifier { strcpy(str,"\"");strcat(str,$1);strcat(str,"\"");$$ = str; }
    | VariableDeclaratorId OSBrac CSBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"VariableDeclaratorId_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    ;

VariableInitializer:
    Expression { $$ = $1; }
    | ArrayInitializer { $$ = $1; }
    | New PrimitiveType Dims ArrayInitializer {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

MethodDeclaration:
    MethodHeader MethodBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

MethodHeader:
    Modifiers Type MethodDeclarator Throws {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodHeader_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
	}
    | Modifiers Type MethodDeclarator {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodHeader_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | Type MethodDeclarator Throws {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodHeader_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | Type MethodDeclarator  {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodHeader_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    | Modifiers Void MethodDeclarator Throws {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodHeader_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
	}
    | Modifiers Void MethodDeclarator {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodHeader_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | Void MethodDeclarator Throws {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodHeader_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | Void MethodDeclarator  {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodHeader_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

MethodDeclarator:
    Identifier OpBrac FormalParameterList ClosBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodDeclarator_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
	}
    | Identifier OpBrac ClosBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodDeclarator_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    | MethodDeclarator OSBrac CSBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodDeclarator_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    ;

FormalParameterList:
    FormalParameter { $$ = $1; }
    | FormalParameterList Comma FormalParameter {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"FormalParameterList_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

FormalParameter:
    Type VariableDeclaratorId {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"FormalParameter_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    | Modifiers Type VariableDeclaratorId {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"FormalParameter_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

Throws:
    Throws1 ClassTypeList {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Throws_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

ClassTypeList:
    ClassType { $$ = $1; }
    | ClassTypeList Comma ClassType {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassTypeList_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

MethodBody:
    Block  { $$ = $1; }
    ;

StaticInitializer:
    Static Block {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"StaticInitializer_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

ConstructorDeclaration:
    Modifiers ConstructorDeclarator Throws ConstructorBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConstructorDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
	}
    | Modifiers ConstructorDeclarator ConstructorBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConstructorDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | ConstructorDeclarator Throws ConstructorBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConstructorDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | ConstructorDeclarator ConstructorBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConstructorDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

ConstructorDeclarator:
    SimpleName OpBrac FormalParameterList ClosBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConstructorDeclarator_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
	}
    | SimpleName OpBrac ClosBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConstructorDeclarator_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    ;

ConstructorBody:
    OCBrac ExplicitConstructorInvocation BlockStatements CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConstructorBody_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
	}
    | OCBrac ExplicitConstructorInvocation CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConstructorBody_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    | OCBrac BlockStatements CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConstructorBody_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    | OCBrac CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConstructorBody_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
	}
    ;

ExplicitConstructorInvocation:
    This OpBrac ArgumentList ClosBrac SemiColon {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ExplicitConstructorInvocation_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	cnt++;
	}
    | This OpBrac ClosBrac SemiColon        {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ExplicitConstructorInvocation_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
	}                
    | Super1 OpBrac ArgumentList ClosBrac SemiColon {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ExplicitConstructorInvocation_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	cnt++;
	}
    | Super1 OpBrac ClosBrac SemiColon {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ExplicitConstructorInvocation_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
	}
    ;

InterfaceDeclaration:
    Modifiers Interface Identifier ExtendsInterfaces InterfaceBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"InterfaceDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
	}
    | Interface Identifier ExtendsInterfaces InterfaceBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"InterfaceDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
	}
    | Modifiers Interface Identifier InterfaceBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"InterfaceDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
	}
    | Interface Identifier InterfaceBody {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"InterfaceDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

ExtendsInterfaces:
    Extends InterfaceType {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ExtendsInterfaces_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    | ExtendsInterfaces Comma InterfaceType {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ExtendsInterfaces_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

InterfaceBody:
    OCBrac InterfaceMemberDeclarations CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"InterfaceBody_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    | OCBrac CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"InterfaceBody_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
	}
    ;

InterfaceMemberDeclarations:
    InterfaceMemberDeclaration { $$ = $1; }
    | InterfaceMemberDeclarations InterfaceMemberDeclaration {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"InterfaceMemberDeclarations_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;

InterfaceMemberDeclaration:
    ConstantDeclaration { $$ = $1; }
    | AbstractMethodDeclaration { $$ = $1; }
    ;

ConstantDeclaration:
    FieldDeclaration { $$ = $1; }
    ;

AbstractMethodDeclaration:
    MethodHeader SemiColon {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"AbstractMethodDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
	}
    ;

ArrayInitializer:
    OCBrac VariableInitializers Comma CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayInitializer_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
	}
    | OCBrac Comma CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayInitializer_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    | OCBrac VariableInitializers CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayInitializer_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    | OCBrac CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayInitializer_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
	}
    ;

VariableInitializers:
    VariableInitializer { $$ = $1; }
    | VariableInitializers Comma VariableInitializer {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"VariableInitializers_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

Block:
    OCBrac BlockStatements CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Block_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
	}
    | OCBrac CCBrac {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Block_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
	}
    ;

BlockStatements:
    BlockStatement { $$ = $1; }
    | BlockStatements BlockStatement {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"BlockStatements_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    ;
    
BlockStatement:
    LocalVariableDeclarationStatement { $$ = $1; }
    | Statement { $$ = $1; }
    ;
    
LocalVariableDeclarationStatement:
    LocalVariableDeclaration SemiColon {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"LocalVariableDeclarationStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
	}
    ;
    
LocalVariableDeclaration:
    Type VariableDeclarators {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"LocalVariableDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
	}
    | Modifiers Type VariableDeclarators {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"LocalVariableDeclaration_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;
    
Statement:
    StatementWithoutTrailingSubstatement { $$ = $1; }
    | LabeledStatement { $$ = $1; }
    | ifThenStatement { $$ = $1; }
    | ifThenElseStatement { $$ = $1; }
    | WhileStatement { $$ = $1; }
    | ForStatement { $$ = $1; }
    ;
    
StatementNoShortif:
    StatementWithoutTrailingSubstatement { $$ = $1; }
    | LabeledStatementNoShortif { $$ = $1; }
    | ifThenElseStatementNoShortif { $$ = $1; }
    | WhileStatementNoShortif { $$ = $1; }
    | ForStatementNoShortif { $$ = $1; }
    ;
    
StatementWithoutTrailingSubstatement:
    Block { $$ = $1; }
    | EmptyStatement { $$ = $1; }
    | ExpressionStatement { $$ = $1; }
    | SwitchStatement { $$ = $1; }
    | DoStatement { $$ = $1; }
    | BreakStatement { $$ = $1; }
    | ContinueStatement { $$ = $1; }
    | ReturnStatement { $$ = $1; }
    | SynchronizedStatement { $$ = $1; }
    | ThrowStatement { $$ = $1; }
    | TryStatement { $$ = $1; }
    ;
    
EmptyStatement:
     SemiColon {strcpy(str,"\";\""); $$ = str; }
    ;
LabeledStatement:
    Identifier Colon Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"LabeledStatement_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
    }
    ;

LabeledStatementNoShortif:
    Identifier Colon StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"LabeledStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
    }
    ;
    
ExpressionStatement:
    StatementExpression SemiColon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ExpressionStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
    }
    ;
    
StatementExpression:
    Assignment { $$ = $1; }
    | PreIncrementExpression { $$ = $1; }
    | PreDecrementExpression { $$ = $1; }
    | PostIncrementExpression { $$ = $1; }
    | PostDecrementExpression { $$ = $1; }
    | MethodInvocation { $$ = $1; }
    | ClassInstanceCreationExpression { $$ = $1; }
    ;
    
ifThenStatement:
    If OpBrac Expression ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ifThenStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
    }
    ;
    
ifThenElseStatement:
    If OpBrac Expression ClosBrac StatementNoShortif Else Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ifThenElseStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	fprintf(demo,"%s -> %s ;\n",$$,$7);
	cnt++;
    }
    ;
    
ifThenElseStatementNoShortif:
    If OpBrac Expression ClosBrac StatementNoShortif Else StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ifThenElseStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	fprintf(demo,"%s -> %s ;\n",$$,$7);
	cnt++;
    }
    ;
    
SwitchStatement:
    Switch OpBrac Expression ClosBrac SwitchBlock
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SwitchStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
    }
    ;

SwitchBlock:
    OCBrac SwitchBlockStatementGroups SwitchLabels CCBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SwitchBlock_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
    }
    | OCBrac SwitchLabels CCBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SwitchBlock_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    | OCBrac SwitchBlockStatementGroups CCBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SwitchBlock_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    | OCBrac CCBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SwitchBlock_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
    }
    ;

SwitchBlockStatementGroups:
    SwitchBlockStatementGroup { $$ = $1; }
    | SwitchBlockStatementGroups SwitchBlockStatementGroup
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SwitchBlockStatementGroups_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    ;
    
SwitchBlockStatementGroup:
    SwitchLabels BlockStatements
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SwitchBlockStatementGroup_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    ;

SwitchLabels:
    SwitchLabel { $$ = $1; }
    | SwitchLabels SwitchLabel
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SwitchLabels_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    ;

SwitchLabel:
    Case ConstantExpression Colon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SwitchLabel_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    | Default Colon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SwitchLabel_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
    }
    ;
    
WhileStatement:
    While OpBrac Expression ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"WhileStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
    }
    ;

WhileStatementNoShortif:
    While OpBrac Expression ClosBrac StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"WhileStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
    }
    ;

DoStatement:
    Do Statement While OpBrac Expression ClosBrac SemiColon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"DoStatemnt_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$7);
	cnt++;
    }
    ;
    
ForStatement:
    For OpBrac ForInit SemiColon Expression SemiColon ForUpdate ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> %s ;\n",$$,$7);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$8);
	fprintf(demo,"%s -> %s ;\n",$$,$9);
	cnt++;
    }
    | For OpBrac ForInit SemiColon Expression SemiColon ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$7);
	fprintf(demo,"%s -> %s ;\n",$$,$8);
	cnt++;
    }
    | For OpBrac ForInit SemiColon SemiColon ForUpdate ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$7);
	fprintf(demo,"%s -> %s ;\n",$$,$8);
	cnt++;
    }
    | For OpBrac SemiColon Expression SemiColon ForUpdate ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$7);
	fprintf(demo,"%s -> %s ;\n",$$,$8);
	cnt++;
    }
    | For OpBrac ForInit SemiColon SemiColon ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> %s ;\n",$$,$7);
	cnt++;
    }
    | For OpBrac SemiColon SemiColon ForUpdate ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> %s ;\n",$$,$7);
	cnt++;
    }
    | For OpBrac SemiColon Expression SemiColon ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> %s ;\n",$$,$7);
	cnt++;
    }
    | For OpBrac SemiColon SemiColon ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	cnt++;
    }
    | For OpBrac Type Identifier Colon Expression ClosBrac Statement
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$7);
	fprintf(demo,"%s -> %s ;\n",$$,$8);
	cnt++;
    }
    ;

ForStatementNoShortif:
    For OpBrac ForInit SemiColon Expression SemiColon ForUpdate ClosBrac StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> %s ;\n",$$,$7);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$8);
	fprintf(demo,"%s -> %s ;\n",$$,$9);
	cnt++;
    }
    | For OpBrac ForInit SemiColon Expression SemiColon ClosBrac StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$7);
	fprintf(demo,"%s -> %s ;\n",$$,$8);
	cnt++;
    }
    | For OpBrac ForInit SemiColon SemiColon ForUpdate ClosBrac StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$7);
	fprintf(demo,"%s -> %s ;\n",$$,$8);
	cnt++;
    }
    | For OpBrac SemiColon Expression SemiColon ForUpdate ClosBrac StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$7);
	fprintf(demo,"%s -> %s ;\n",$$,$8);
	cnt++;
    }
    | For OpBrac ForInit SemiColon SemiColon ClosBrac StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> %s ;\n",$$,$7);
	cnt++;
    }
    | For OpBrac SemiColon SemiColon ForUpdate ClosBrac StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> %s ;\n",$$,$7);
	cnt++;
    }
    | For OpBrac SemiColon Expression SemiColon ClosBrac StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	fprintf(demo,"%s -> %s ;\n",$$,$7);
	cnt++;
    }
    | For OpBrac SemiColon SemiColon ClosBrac StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	cnt++;
    }
    | For OpBrac Type Identifier Colon Expression ClosBrac StatementNoShortif
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ForStatementNoShortif_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	fprintf(demo,"%s -> %s ;\n",$$,$6);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$7);
	fprintf(demo,"%s -> %s ;\n",$$,$8);
	cnt++;
    }
    ;
    
ForInit:
    StatementExpressionList { $$ = $1; }
    | LocalVariableDeclaration { $$ = $1; }
    ;
    
ForUpdate:
    StatementExpressionList { $$ = $1; }
    ;
    
StatementExpressionList:
    StatementExpression { $$ = $1; }
    | StatementExpressionList Comma StatementExpression
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"StatementExpressionList_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
    }
    ;
    

BreakStatement:
    Break Identifier SemiColon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"BreakStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    | Break SemiColon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"BreakStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
    }
    ;
    
ContinueStatement:
    Continue Identifier SemiColon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ContinueStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    | Continue SemiColon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ContinueStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
    }
    ;
    
ReturnStatement:
    Return Expression SemiColon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ReturnStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    | Return SemiColon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ReturnStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
    }
    ;
    
ThrowStatement:
    Throw Expression SemiColon
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ThrowStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    ;
    
SynchronizedStatement:
    Synchronized OpBrac Expression ClosBrac Block
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"SynchronizedStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
    }
    ;
    
TryStatement:
    Try Block Catches
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"TryStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
    }
    | Try Block Catches Finally
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"TryStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
    }
    | Try Block Finally
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"TryStatement_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
    }
    ;
    
Catches:
    CatchClause { $$ = $1; }
    | Catches CatchClause
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Catches_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    ;
    
CatchClause:
    Catch OpBrac FormalParameter ClosBrac Block
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"CatchClause_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
    }
    ;
    
Finally:
    Finally1 Block
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Finally_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    ;
    
Primary:
    PrimaryNoNewArray { $$ = $1; }
    | ArrayCreationExpression { $$ = $1; }
    ;
    
PrimaryNoNewArray:
    Literal { $$ = $1; }
    | This { $$ = $1; }
    | OpBrac Expression ClosBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"PrimaryNoNewArray_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    | ClassInstanceCreationExpression { $$ = $1; }
    | FieldAccess { $$ = $1; }
    | MethodInvocation { $$ = $1; }
    | ArrayAccess { $$ = $1; }
    ;

ClassInstanceCreationExpression:
    New ClassType OpBrac ArgumentList ClosBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassInstanceCreationExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	cnt++;
    }
    | New ClassType OpBrac ClosBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ClassInstanceCreationExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
    }
    ;
    
ArgumentList:
    Expression { $$ = $1; }
    | ArgumentList Comma Expression
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArgumentList_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
    }
    ;
    
ArrayCreationExpression:
    New PrimitiveType DimExprs Dims
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayCreationExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
    }
    | New PrimitiveType DimExprs
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayCreationExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
    }
    | New ClassOrInterfaceType DimExprs Dims
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayCreationExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
    }
    | New ClassOrInterfaceType DimExprs
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayCreationExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
    }
    ;
    
DimExprs:
    DimExpr { $$ = $1; }
    | DimExprs DimExpr
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"DimExprs_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    ;
    
DimExpr:
    OSBrac Expression CSBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"DimExpr_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    ;

Dims:
    OSBrac CSBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Dims_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
    }
    | Dims OSBrac CSBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Dims_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    ;
    
FieldAccess:
    Primary Dot Identifier
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"FieldAccess_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    | Super1 Dot Identifier
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"FieldAccess_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    ;
    
MethodInvocation:
    Name OpBrac ArgumentList ClosBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodInvocation_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
    }
    | Name OpBrac ClosBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodInvocation_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	cnt++;
    }
    | Primary Dot Identifier OpBrac ArgumentList ClosBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodInvocation_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	cnt++;
    }
    | Primary Dot Identifier OpBrac ClosBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodInvocation_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	cnt++;
    }
    | Super1 Dot Identifier OpBrac ArgumentList ClosBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodInvocation_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$6);
	cnt++;
    }
    | Super1 Dot Identifier OpBrac ClosBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MethodInvocation_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$5);
	cnt++;
    }
    ;

ArrayAccess:
    Name OSBrac Expression CSBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayAccess_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
    }
    | PrimaryNoNewArray OSBrac Expression CSBrac
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ArrayAccess_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	cnt++;
    }
    ;
    
PostfixExpression:
    Primary { $$ = $1; }
    | Name { $$ = $1; }
    | PostIncrementExpression { $$ = $1; }
    | PostDecrementExpression { $$ = $1; }
    ;
    
PostIncrementExpression:
    PostfixExpression o10
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"PostIncrementExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
    }
    ;
    
PostDecrementExpression:
    PostfixExpression o11
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"PostDecrementExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	cnt++;
    }
    ;
    
UnaryExpression:
    PreIncrementExpression { $$ = $1; }
    | PreDecrementExpression { $$ = $1; }
    | Plus UnaryExpression
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"UnaryExpression_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    | Minus UnaryExpression
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"UnaryExpression_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    | UnaryExpressionNotPlusMinus { $$ = $1; }
    ;
    
PreIncrementExpression:
    o10 UnaryExpression
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"PreIncrementExpression_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    ;
    
PreDecrementExpression:
    o11 UnaryExpression
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"PreDecrementExpression_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    ;
    
UnaryExpressionNotPlusMinus:
    PostfixExpression { $$ = $1; }
    | Tilda UnaryExpression
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"UnaryExpressionNotPlusMinus_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    | Excl UnaryExpression
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"UnaryExpressionNotPlusMinus_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	cnt++;
    }
    | CastExpression { $$ = $1; }
    ;

CastExpression:
    OpBrac PrimitiveType Dims ClosBrac UnaryExpression
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"CastExpression_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
    }
    | OpBrac PrimitiveType ClosBrac UnaryExpression
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"CastExpression_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
    }
    | OpBrac Expression ClosBrac UnaryExpressionNotPlusMinus
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"CastExpression_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$3);
	fprintf(demo,"%s -> %s ;\n",$$,$4);
	cnt++;
    }
    | OpBrac Name Dims ClosBrac UnaryExpressionNotPlusMinus
    {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"CastExpression_%d",cnt);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
    }
    ;
    
    
MultiplicativeExpression:
    UnaryExpression { $$ = $1; }
    | MultiplicativeExpression Multiply UnaryExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MultiplicativeExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | MultiplicativeExpression Divide UnaryExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MultiplicativeExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | MultiplicativeExpression Percent UnaryExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"MultiplicativeExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

AdditiveExpression:
    MultiplicativeExpression { $$ = $1; }
    | AdditiveExpression Plus MultiplicativeExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"AdditiveExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | AdditiveExpression Minus MultiplicativeExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"AdditiveExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

ShiftExpression:
    AdditiveExpression { $$ = $1; }
    | ShiftExpression o12 AdditiveExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ShiftExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | ShiftExpression o13 AdditiveExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ShiftExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | ShiftExpression o14 AdditiveExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ShiftExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

RelationalExpression:
    ShiftExpression { $$ = $1; }
    | RelationalExpression LT ShiftExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"RelationalExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | RelationalExpression GT ShiftExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"RelationalExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | RelationalExpression o6 ShiftExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"RelationalExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | RelationalExpression o5 ShiftExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"RelationalExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | RelationalExpression Instanceof ReferenceType {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"RelationalExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> %s ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

EqualityExpression:
    RelationalExpression { $$ = $1; }
    | EqualityExpression o4 RelationalExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"EqualityExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    | EqualityExpression o7 RelationalExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"EqualityExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

AndExpression:
    EqualityExpression { $$ = $1; }
    | AndExpression And EqualityExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"AndExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

ExclusiveOrExpression:
    AndExpression { $$ = $1; }
    | ExclusiveOrExpression Xor AndExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ExclusiveOrExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

InclusiveOrExpression:
    ExclusiveOrExpression { $$ = $1; }
    | InclusiveOrExpression Or ExclusiveOrExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"InclusiveOrExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

ConditionalAndExpression:
    InclusiveOrExpression { $$ = $1; }
    | ConditionalAndExpression o8 InclusiveOrExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConditionalAndExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

ConditionalOrExpression:
    ConditionalAndExpression { $$ = $1; }
    | ConditionalOrExpression o9 ConditionalAndExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConditionalOrExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

ConditionalExpression:
    ConditionalOrExpression { $$ = $1; }
    | ConditionalOrExpression Ques Expression Colon ConditionalExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"ConditionalExpression_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$4);
	fprintf(demo,"%s -> %s ;\n",$$,$5);
	cnt++;
	}
    ;

AssignmentExpression:
    ConditionalExpression { $$ = $1; }
    | Assignment { $$ = $1; }
    ;

Assignment:
    LeftHandSide AssignmentOperator AssignmentExpression {
	$$ = (char*)malloc(64*sizeof(char));
	int i= snprintf($$,64,"Assignment_%d",cnt);
	fprintf(demo,"%s -> %s ;\n",$$,$1);
	fprintf(demo,"%s -> \"%s\" ;\n",$$,$2);
	fprintf(demo,"%s -> %s ;\n",$$,$3);
	cnt++;
	}
    ;

LeftHandSide:
    Name { $$ = $1; }
    | FieldAccess { $$ = $1; }
    | ArrayAccess { $$ = $1; }
    ;

AssignmentOperator:
    Equal { $$ = $1; }
    | o17 { $$ = $1; }
    | o18 { $$ = $1; }
    | o22 { $$ = $1; }
    | o15 { $$ = $1; }
    | o16 { $$ = $1; }
    | o23 { $$ = $1; }
    | o24 { $$ = $1; }
    | o25 { $$ = $1; }
    | o19 { $$ = $1; }
    | o21 { $$ = $1; }
    | o20 { $$ = $1; }
    ;

Expression:
    AssignmentExpression { $$ = $1; }
    ;

ConstantExpression:
    Expression { $$ = $1; }
    ;	
%%
void yyerror(char *msg) 
{ 
	if(!verbose)
		printf("ERROR\n"); 
	exit(0); 
} 

int main(int argc,char* argv[]){
	
	int j;
	char infile[100];
	char outfile[100];
	strcpy(infile,"empty");
	strcpy(outfile,"empty");
	if(argc==1){
		printf("Run ./myASTGenerator --help for help.\n");
		exit(1);
	}
	for(int i=1;i<argc;i++){
		if(!strcmp(argv[i],"--help")){
		    printf("Give the following inputs along with the exe:\n");
		    printf("\t--input=filename change the input file to filename\n");
		    printf("\t--out=filename change the output file to filename\n");
		    printf("\n");
		    printf("--help output execution instructions to console\n");
		    printf("--verbose=false lead to quiet execution\n");
		    return 0;
		}
		if(argv[i][0]=='-'&&argv[i][1]=='-'&&argv[i][2]=='o'&&argv[i][3]=='u'&&argv[i][4]=='t'&&argv[i][5]=='='){
		    for(j = 6;j<strlen(argv[i]);j++)
			outfile[j-6]= argv[i][j];
			outfile[j-6]='\0';
		    continue;
		}
		if(argv[i][0]=='-'&&argv[i][1]=='-'&&argv[i][2]=='i'&&argv[i][3]=='n'&&argv[i][4]=='p'&&argv[i][5]=='u'&&argv[i][6]=='t'&&argv[i][7]=='='){
		    for(j = 8;j<strlen(argv[i]);j++)
			infile[j-8] = argv[i][j];
		    	infile[j-8]='\0';
		    continue;
		}
		if(strcmp(argv[i],"--verbose=true")){
		    verbose=1;
		    continue;
		}
		if(strcmp(argv[i],"--verbose=false")){
		    verbose=0;
		    continue;
		}
		printf("Please check your inputs.\nRun ./myASTGenerator --help for help.\n");
		exit(1);
    	}
	
	
	if(infile=="empty"){
		printf("No input file provided.\n");
		exit(1);
    	}

	if(outfile=="empty"){
		printf("No output file provided.\n");
		exit(1);
    	}


	str = (char*)malloc(500*sizeof(char));
    	demo = fopen(outfile, "w+");
	inp  = fopen(infile, "r+");
	if(!inp){
		printf("File could not be opened.\n");
		exit(1);	
	}
	yyin = inp;
	fprintf(demo,"digraph AST{\n");
	yyparse();
	fprintf(demo,"}");
	fclose(demo);
	fclose(yyin); 
	return 0;
}
