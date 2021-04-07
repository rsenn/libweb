//
// Cforall Version 1.0.0 Copyright (C) 2015 University of Waterloo
//
// The contents of this file are covered under the licence agreement in the
// file "LICENCE" distributed with Cforall.
//
// parser.yy --
//
// Author           : Peter A. Buhr
// Created On       : Sat Sep  1 20:22:55 2001
// Last Modified By : Peter A. Buhr
// Last Modified On : Thu Jan 28 07:39:50 2021
// Update Count     : 4681
//

// This grammar is based on the ANSI99/11 C grammar, specifically parts of EXPRESSION and STATEMENTS, and on the C
// grammar by James A. Roskind, specifically parts of DECLARATIONS and EXTERNAL DEFINITIONS.  While parts have been
// copied, important changes have been made in all sections; these changes are sufficient to constitute a new grammar.
// In particular, this grammar attempts to be more syntactically precise, i.e., it parses less incorrect language syntax
// that must be subsequently rejected by semantic checks.  Nevertheless, there are still several semantic checks
// required and many are noted in the grammar. Finally, the grammar is extended with GCC and CFA language extensions.

// Acknowledgments to Richard Bilson, Glen Ditchfield, and Rodolfo Gabriel Esteves who all helped when I got stuck with
// the grammar.

// The root language for this grammar is ANSI99/11 C. All of ANSI99/11 is parsed, except for:
//
// 1. designation with '=' (use ':' instead)
//
// Most of the syntactic extensions from ANSI90 to ANSI11 C are marked with the comment "C99/C11". This grammar also has
// two levels of extensions. The first extensions cover most of the GCC C extensions, except for:
//
// 1. designation with and without '=' (use ':' instead)
// 2. attributes not allowed in parenthesis of declarator
//
// All of the syntactic extensions for GCC C are marked with the comment "GCC". The second extensions are for Cforall
// (CFA), which fixes several of C's outstanding problems and extends C with many modern language concepts. All of the
// syntactic extensions for CFA C are marked with the comment "CFA". As noted above, there is one unreconcileable
// parsing problem between C99 and CFA with respect to designators; this is discussed in detail before the "designation"
// grammar rule.

%define parse.error verbose

// Types declaration for productions

//************************* TERMINAL TOKENS ********************************

// keywords
%token TYPEDEF
%token EXTERN STATIC AUTO REGISTER
%token THREADLOCAL										// C11
%token INLINE FORTRAN									// C99, extension ISO/IEC 9899:1999 Section J.5.9(1)
%token NORETURN											// C11
%token CONST VOLATILE
%token RESTRICT											// C99
%token ATOMIC											// C11
%token FORALL MUTEX VIRTUAL COERCE						// CFA
%token VOID CHAR SHORT INT LONG FLOAT DOUBLE SIGNED UNSIGNED
%token BOOL COMPLEX IMAGINARY							// C99
%token INT128 UINT128 uuFLOAT80 uuFLOAT128				// GCC
%token uFLOAT16 uFLOAT32 uFLOAT32X uFLOAT64 uFLOAT64X uFLOAT128 // GCC
%token ZERO_T ONE_T										// CFA
%token VALIST											// GCC
%token AUTO_TYPE										// GCC
%token TYPEOF BASETYPEOF LABEL							// GCC
%token ENUM STRUCT UNION
%token EXCEPTION										// CFA
%token GENERATOR COROUTINE MONITOR THREAD				// CFA
%token OTYPE FTYPE DTYPE TTYPE TRAIT					// CFA
%token SIZEOF OFFSETOF
// %token RESUME											// CFA
%token SUSPEND											// CFA
%token ATTRIBUTE EXTENSION								// GCC
%token IF ELSE SWITCH CASE DEFAULT DO WHILE FOR BREAK CONTINUE GOTO RETURN
%token CHOOSE DISABLE ENABLE FALLTHRU FALLTHROUGH TRY CATCH CATCHRESUME FINALLY THROW THROWRESUME AT WITH WHEN WAITFOR // CFA
%token ASM												// C99, extension ISO/IEC 9899:1999 Section J.5.10(1)
%token ALIGNAS ALIGNOF GENERIC STATICASSERT				// C11

// names and constants: lexer differentiates between identifier and typedef names
%token IDENTIFIER			QUOTED_IDENTIFIER		TYPEDEFname				TYPEGENname
%token TIMEOUT				WOR
%token INTEGERconstant		CHARACTERconstant		STRINGliteral
%token DIRECTIVE
// Floating point constant is broken into three kinds of tokens because of the ambiguity with tuple indexing and
// overloading constants 0/1, e.g., x.1 is lexed as (x)(.1), where (.1) is a factional constant, but is semantically
// converted into the tuple index (.)(1). e.g., 3.x
%token	FLOATING_DECIMALconstant	FLOATING_FRACTIONconstant	FLOATINGconstant

// multi-character operators
%token ARROW											// ->
%token ICR DECR											// ++	--
%token LS RS											// <<	>>
%token LE GE EQ NE										// <=	>=	==	!=
%token ANDAND OROR										// &&	||
%token ELLIPSIS											// ...

%token EXPassign	MULTassign	DIVassign	MODassign	// \=	*=	/=	%=
%token PLUSassign	MINUSassign							// +=	-=
%token LSassign		RSassign							// <<=	>>=
%token ANDassign	ERassign	ORassign				// &=	^=	|=

%token ErangeUpEq	ErangeDown	ErangeDownEq			// ~=	-~	-~=
%token ATassign											// @=


// Handle shift/reduce conflict for dangling else by shifting the ELSE token. For example, this string is ambiguous:
//   .---------.				matches IF '(' comma_expression ')' statement . (reduce)
//   if ( C ) S1 else S2
//   `-----------------'		matches IF '(' comma_expression ')' statement . (shift) ELSE statement */
// Similar issues exit with the waitfor statement.

// Order of these lines matters (low-to-high precedence). THEN is left associative over WOR/TIMEOUT/ELSE, WOR is left
// associative over TIMEOUT/ELSE, and TIMEOUT is left associative over ELSE.
%precedence THEN	// rule precedence for IF/WAITFOR statement
%precedence WOR		// token precedence for start of WOR in WAITFOR statement
%precedence TIMEOUT	// token precedence for start of TIMEOUT in WAITFOR statement
%precedence ELSE	// token precedence for start of else clause in IF/WAITFOR statement

// Handle shift/reduce conflict for generic type by shifting the '(' token. For example, this string is ambiguous:
//   forall( otype T ) struct Foo { T v; };
//       .-----.				matches pointer to function returning a generic (which is impossible without a type)
//   Foo ( *fp )( int );
//   `---'						matches start of TYPEGENname '('
// must be:
//   Foo( int ) ( *fp )( int );
// The same problem occurs here:
//   forall( otype T ) struct Foo { T v; } ( *fp )( int );
// must be:
//   forall( otype T ) struct Foo { T v; } ( int ) ( *fp )( int );

// Order of these lines matters (low-to-high precedence).
%precedence TYPEGENname
%precedence '}'
%precedence '('

// %precedence RESUME
// %precedence '{'
// %precedence ')'

%locations												// support location tracking for error messages

%start translation_unit									// parse-tree root

%%
//************************* Namespace Management ********************************

// The C grammar is not context free because it relies on the distinct terminal symbols "identifier" and "TYPEDEFname",
// which are lexically identical.
//
//   typedef int foo; // identifier foo must now be scanned as TYPEDEFname
//   foo f;           // to allow it to appear in this context
//
// While it may be possible to write a purely context-free grammar, such a grammar would obscure the relationship
// between syntactic and semantic constructs.  Cforall compounds this problem by introducing type names local to the
// scope of a declaration (for instance, those introduced through "forall" qualifiers), and by introducing "type
// generators" -- parameterized types.  This latter type name creates a third class of identifiers, "TYPEGENname", which
// must be distinguished by the lexical scanner.
//
// Since the scanner cannot distinguish among the different classes of identifiers without some context information,
// there is a type table (typedefTable), which holds type names and identifiers that override type names, for each named
// scope. During parsing, semantic actions update the type table by adding new identifiers in the current scope. For
// each context that introduces a name scope, a new level is created in the type table and that level is popped on
// exiting the scope.  Since type names can be local to a particular declaration, each declaration is itself a scope.
// This requires distinguishing between type names that are local to the current declaration scope and those that
// persist past the end of the declaration (i.e., names defined in "typedef" or "otype" declarations).
//
// The non-terminals "push" and "pop" denote the opening and closing of named scopes. Every push has a matching pop in
// the production rule. There are multiple lists of declarations, where each declaration is a named scope, so pop/push
// around the list separator.
//
//  int f( forall(T) T (*f1) T , forall( S ) S (*f2)( S ) );
//      push               pop   push                   pop

push:
	;

pop:
	;

//************************* CONSTANTS ********************************

constant:
		// ENUMERATIONconstant is not included here; it is treated as a variable with type "enumeration constant".
	INTEGERconstant
	| FLOATING_DECIMALconstant
	| FLOATING_FRACTIONconstant
	| FLOATINGconstant
	| CHARACTERconstant
	;

quasi_keyword:											// CFA
	TIMEOUT
	| WOR
	;

identifier:
	IDENTIFIER
	| quasi_keyword
	| '@'												// CFA
	;

string_literal:
	string_literal_list
	;

string_literal_list:									// juxtaposed strings are concatenated
	STRINGliteral // conversion from tok to str
	| string_literal_list STRINGliteral
	;

//************************* EXPRESSIONS ********************************

primary_expression:
	IDENTIFIER											// typedef name cannot be used as a variable name
	| quasi_keyword
	| tuple
	| '(' comma_expression ')'
	| '(' compound_statement ')'						// GCC, lambda expression
	| type_name '.' identifier							// CFA, nested type
	| type_name '.' '[' field_name_list ']'				// CFA, nested type / tuple field selector
	| GENERIC '(' assignment_expression ',' generic_assoc_list ')' // C11
	// | RESUME '(' comma_expression ')'
	//   	{ SemanticError( yylloc, "Resume expression is currently unimplemented." ); $$ = nullptr; }
	// | RESUME '(' comma_expression ')' compound_statement
	//   	{ SemanticError( yylloc, "Resume expression is currently unimplemented." ); $$ = nullptr; }
	;

generic_assoc_list:										// C11
	generic_association
	| generic_assoc_list ',' generic_association
	;

generic_association:									// C11
	type_no_function ':' assignment_expression
	| DEFAULT ':' assignment_expression
	;

postfix_expression:
	primary_expression
	| postfix_expression '[' assignment_expression ']'
		// CFA, comma_expression disallowed in this context because it results in a common user error: subscripting a
		// matrix with x[i,j] instead of x[i][j]. While this change is not backwards compatible, there seems to be
		// little advantage to this feature and many disadvantages. It is possible to write x[(i,j)] in CFA, which is
		// equivalent to the old x[i,j].
	| postfix_expression '{' argument_expression_list_opt '}' // CFA, constructor call
	| postfix_expression '(' argument_expression_list_opt ')'
	| postfix_expression '`' identifier					// CFA, postfix call
	| constant '`' identifier							// CFA, postfix call
	| string_literal '`' identifier						// CFA, postfix call
	| postfix_expression '.' identifier
	| postfix_expression '.' INTEGERconstant			// CFA, tuple index
	| postfix_expression FLOATING_FRACTIONconstant		// CFA, tuple index
	| postfix_expression '.' '[' field_name_list ']'	// CFA, tuple field selector
	| postfix_expression '.' aggregate_control
	| postfix_expression ARROW identifier
	| postfix_expression ARROW INTEGERconstant			// CFA, tuple index
	| postfix_expression ARROW '[' field_name_list ']'	// CFA, tuple field selector
	| postfix_expression ICR
	| postfix_expression DECR
	| '(' type_no_function ')' '{' initializer_list_opt comma_opt '}' // C99, compound-literal
	| '(' type_no_function ')' '@' '{' initializer_list_opt comma_opt '}' // CFA, explicit C compound-literal
	| '^' primary_expression '{' argument_expression_list_opt '}' // CFA, destructor call
	;

argument_expression_list_opt:
	// empty
	| argument_expression
	| argument_expression_list_opt ',' argument_expression
	;

argument_expression:
	'@'													// CFA, default parameter
	 	// { $$ = new ExpressionNode( build_constantInteger( *new string( "2" ) ) ); }
	| assignment_expression
	;

field_name_list:										// CFA, tuple field selector
	field
	| field_name_list ',' field
	;

field:													// CFA, tuple field selector
	field_name
	| FLOATING_DECIMALconstant field
	| FLOATING_DECIMALconstant '[' field_name_list ']'
	| field_name '.' field
	| field_name '.' '[' field_name_list ']'
	| field_name ARROW field
	| field_name ARROW '[' field_name_list ']'
	;

field_name:
	INTEGERconstant fraction_constants_opt
	| FLOATINGconstant fraction_constants_opt
	| identifier fraction_constants_opt
	;

fraction_constants_opt:
	// empty
	| fraction_constants_opt FLOATING_FRACTIONconstant
	;

unary_expression:
	postfix_expression
		// first location where constant/string can have operator applied: sizeof 3/sizeof "abc" still requires
		// semantics checks, e.g., ++3, 3--, *3, &&3
	| constant
	| string_literal
	| EXTENSION cast_expression							// GCC
		// '*' ('&') is separated from unary_operator because of shift/reduce conflict in:
		//		{ * X; }	 // dereference X
		//		{ * int X; } // CFA declaration of pointer to int
	| ptrref_operator cast_expression					// CFA
	| unary_operator cast_expression
	| ICR unary_expression
	| DECR unary_expression
	| SIZEOF unary_expression
	| SIZEOF '(' type_no_function ')'
	| ALIGNOF unary_expression							// GCC, variable alignment
	| ALIGNOF '(' type_no_function ')'					// GCC, type alignment
	| OFFSETOF '(' type_no_function ',' identifier ')'
	;

ptrref_operator:
	'*'
	| '&'
		// GCC, address of label must be handled by semantic check for ref,ref,label
	| ANDAND
	;

unary_operator:
	'+'
	| '-'
	| '!'
	| '~'
	;

cast_expression:
	unary_expression
	| '(' type_no_function ')' cast_expression
	| '(' aggregate_control '&' ')' cast_expression		// CFA
	| '(' VIRTUAL ')' cast_expression					// CFA
	| '(' VIRTUAL type_no_function ')' cast_expression	// CFA
	| '(' RETURN type_no_function ')' cast_expression	// CFA
	| '(' COERCE type_no_function ')' cast_expression	// CFA
	| '(' qualifier_cast_list ')' cast_expression		// CFA
//	| '(' type_no_function ')' tuple
//		{ $$ = new ExpressionNode( build_cast( $2, $4 ) ); }
	;

qualifier_cast_list:
	cast_modifier type_qualifier_name
	| cast_modifier MUTEX
	| qualifier_cast_list cast_modifier type_qualifier_name
	| qualifier_cast_list cast_modifier MUTEX
	;

cast_modifier:
	'-'
	| '+'
	;

exponential_expression:
	cast_expression
	| exponential_expression '\\' cast_expression
	;

multiplicative_expression:
	exponential_expression
	| multiplicative_expression '*' exponential_expression
	| multiplicative_expression '/' exponential_expression
	| multiplicative_expression '%' exponential_expression
	;

additive_expression:
	multiplicative_expression
	| additive_expression '+' multiplicative_expression
	| additive_expression '-' multiplicative_expression
	;

shift_expression:
	additive_expression
	| shift_expression LS additive_expression
	| shift_expression RS additive_expression
	;

relational_expression:
	shift_expression
	| relational_expression '<' shift_expression
	| relational_expression '>' shift_expression
	| relational_expression LE shift_expression
	| relational_expression GE shift_expression
	;

equality_expression:
	relational_expression
	| equality_expression EQ relational_expression
	| equality_expression NE relational_expression
	;

AND_expression:
	equality_expression
	| AND_expression '&' equality_expression
	;

exclusive_OR_expression:
	AND_expression
	| exclusive_OR_expression '^' AND_expression
	;

inclusive_OR_expression:
	exclusive_OR_expression
	| inclusive_OR_expression '|' exclusive_OR_expression
	;

logical_AND_expression:
	inclusive_OR_expression
	| logical_AND_expression ANDAND inclusive_OR_expression
	;

logical_OR_expression:
	logical_AND_expression
	| logical_OR_expression OROR logical_AND_expression
	;

conditional_expression:
	logical_OR_expression
	| logical_OR_expression '?' comma_expression ':' conditional_expression
		// FIX ME: computes $1 twice
	| logical_OR_expression '?' /* empty */ ':' conditional_expression // GCC, omitted first operand
	;

constant_expression:
	conditional_expression
	;

assignment_expression:
		// CFA, assignment is separated from assignment_operator to ensure no assignment operations for tuples
	conditional_expression
	| unary_expression assignment_operator assignment_expression
	| unary_expression '=' '{' initializer_list_opt comma_opt '}'
	;

assignment_expression_opt:
	// empty
	| assignment_expression
	;

assignment_operator:
	'='
	| ATassign
	| EXPassign
	| MULTassign
	| DIVassign
	| MODassign
	| PLUSassign
	| MINUSassign
	| LSassign
	| RSassign
	| ANDassign
	| ERassign
	| ORassign
	;

tuple:													// CFA, tuple
		// CFA, one assignment_expression is factored out of comma_expression to eliminate a shift/reduce conflict with
		// comma_expression in cfa_identifier_parameter_array and cfa_abstract_array
//	'[' ']'
//		{ $$ = new ExpressionNode( build_tuple() ); }
//	| '[' push assignment_expression pop ']'
//		{ $$ = new ExpressionNode( build_tuple( $3 ) ); }
	'[' ',' tuple_expression_list ']'
	| '[' assignment_expression ',' tuple_expression_list ']'	
	;

tuple_expression_list:
	assignment_expression
	| '@'												// CFA
	| tuple_expression_list ',' assignment_expression
	| tuple_expression_list ',' '@'
	;

comma_expression:
	assignment_expression
	| comma_expression ',' assignment_expression
	;

comma_expression_opt:
	// empty
	| comma_expression
	;

//*************************** STATEMENTS *******************************

statement:
	labeled_statement
	| compound_statement
	| expression_statement
	| selection_statement
	| iteration_statement
	| jump_statement
	| with_statement
	| mutex_statement
	| waitfor_statement
	| exception_statement
	| enable_disable_statement
	| asm_statement
	| DIRECTIVE
	;

labeled_statement:
		// labels cannot be identifiers 0 or 1
	identifier_or_type_name ':' attribute_list_opt statement
	;

compound_statement:
	'{' '}'
	| '{' local_label_declaration_opt						// GCC, local labels
	  statement_decl_list '}'	
	;

statement_decl_list:									// C99
	statement_decl
	| statement_decl_list statement_decl
	;

statement_decl:
	declaration											// CFA, new & old style declarations
	| EXTENSION declaration								// GCC
	| function_definition
	| EXTENSION function_definition						// GCC
	| statement
	;

statement_list_nodecl:
	statement
	| statement_list_nodecl statement
	;

expression_statement:
	comma_expression_opt ';'
	;

selection_statement:
			// pop causes a S/R conflict without separating the IF statement into a non-terminal even after resolving
			// the inherent S/R conflict with THEN/ELSE. if_statement	
	| SWITCH '(' comma_expression ')' case_clause
	| SWITCH '(' comma_expression ')' '{' declaration_list_opt switch_clause_list_opt '}'	 // CFA
	| CHOOSE '(' comma_expression ')' case_clause		// CFA
	| CHOOSE '(' comma_expression ')' '{' declaration_list_opt switch_clause_list_opt '}'	 // CFA
	;

if_statement:
	IF '(' if_control_expression ')' statement			%prec THEN
		// explicitly deal with the shift/reduce conflict on if/else
	| IF '(' if_control_expression ')' statement ELSE statement
	;

if_control_expression:
	comma_expression
	| c_declaration										// no semi-colon
	| cfa_declaration									// no semi-colon
	| declaration comma_expression						// semi-colon separated
 	;

// CASE and DEFAULT clauses are only allowed in the SWITCH statement, precluding Duff's device. In addition, a case
// clause allows a list of values and subranges.

case_value:												// CFA
	constant_expression
	| constant_expression ELLIPSIS constant_expression	// GCC, subrange
	| subrange											// CFA, subrange
	;

case_value_list:										// CFA
	case_value
		// convert case list, e.g., "case 1, 3, 5:" into "case 1: case 3: case 5"
	| case_value_list ',' case_value
	;

case_label:												// CFA
	CASE case_value_list ':'
	| DEFAULT ':'
		// A semantic check is required to ensure only one default clause per switch/choose statement.
	;

//label_list_opt:
//	// empty
//	| identifier_or_type_name ':'
//	| label_list_opt identifier_or_type_name ':'
//	;

case_label_list:										// CFA
	case_label
	| case_label_list case_label
	;

case_clause:											// CFA
	case_label_list statement
	;

switch_clause_list_opt:									// CFA
	// empty
	| switch_clause_list
	;

switch_clause_list:										// CFA
	case_label_list statement_list_nodecl
	| switch_clause_list case_label_list statement_list_nodecl
	;

iteration_statement:
	WHILE '(' if_control_expression ')' statement	
	| WHILE '(' ')' statement							// CFA => while ( 1 )
	| DO statement WHILE '(' comma_expression ')' ';'
	| DO statement WHILE '(' ')' ';'					// CFA => do while( 1 )
	| FOR '(' for_control_expression_list ')' statement	
	| FOR '(' ')' statement								// CFA => for ( ;; )
	;

for_control_expression_list:
	for_control_expression
	| for_control_expression_list ':' for_control_expression
		// ForCtrl + ForCtrl:
		//    init + init => multiple declaration statements that are hoisted
		//    condition + condition => (expression) && (expression)
		//    change + change => (expression), (expression)
	;

for_control_expression:
	';' comma_expression_opt ';' comma_expression_opt
	| comma_expression ';' comma_expression_opt ';' comma_expression_opt
	| declaration comma_expression_opt ';' comma_expression_opt // C99, declaration has ';'

	| comma_expression									// CFA
	| '=' comma_expression								// CFA
	| comma_expression inclexcl comma_expression		// CFA
	| comma_expression inclexcl comma_expression '~' comma_expression // CFA
	| comma_expression ';'								// CFA
	| comma_expression ';' comma_expression				// CFA
	| comma_expression ';' '=' comma_expression			// CFA
	| comma_expression ';' comma_expression inclexcl comma_expression // CFA
	| comma_expression ';' comma_expression inclexcl comma_expression '~' comma_expression // CFA

		// There is a S/R conflicit if ~ and -~ are factored out.
	| comma_expression ';' comma_expression '~' '@'		// CFA
	| comma_expression ';' comma_expression ErangeDown '@' // CFA
	| comma_expression ';' comma_expression '~' '@' '~' comma_expression // CFA
	| comma_expression ';' comma_expression ErangeDown '@' '~' comma_expression // CFA
	| comma_expression ';' comma_expression '~' '@' '~' '@' // CFA
 	;

inclexcl:
	'~'
	| ErangeUpEq
	| ErangeDown
	| ErangeDownEq
 	;

jump_statement:
	GOTO identifier_or_type_name ';'
	| GOTO '*' comma_expression ';'						// GCC, computed goto
		// The syntax for the GCC computed goto violates normal expression precedence, e.g., goto *i+3; => goto *(i+3);
		// whereas normal operator precedence yields goto (*i)+3;
		// A semantic check is required to ensure fallthru appears only in the body of a choose statement.
	| fall_through_name ';'								// CFA
	| fall_through_name identifier_or_type_name ';'		// CFA
	| fall_through_name DEFAULT ';'						// CFA
	| CONTINUE ';'
		// A semantic check is required to ensure this statement appears only in the body of an iteration statement.
	| CONTINUE identifier_or_type_name ';'				// CFA, multi-level continue
		// A semantic check is required to ensure this statement appears only in the body of an iteration statement, and
		// the target of the transfer appears only at the start of an iteration statement.
	| BREAK ';'
		// A semantic check is required to ensure this statement appears only in the body of an iteration statement.
	| BREAK identifier_or_type_name ';'					// CFA, multi-level exit
		// A semantic check is required to ensure this statement appears only in the body of an iteration statement, and
		// the target of the transfer appears only at the start of an iteration statement.
	| RETURN comma_expression_opt ';'
	| RETURN '{' initializer_list_opt comma_opt '}' ';'
	| SUSPEND ';'
	| SUSPEND compound_statement
	| SUSPEND COROUTINE ';'
	| SUSPEND COROUTINE compound_statement
	| SUSPEND GENERATOR ';'
	| SUSPEND GENERATOR compound_statement
	| THROW assignment_expression_opt ';'				// handles rethrow
	| THROWRESUME assignment_expression_opt ';'			// handles reresume
	| THROWRESUME assignment_expression_opt AT assignment_expression ';' // handles reresume
	;

fall_through_name:										// CFA
	FALLTHRU
	| FALLTHROUGH
	;

with_statement:
	WITH '(' tuple_expression_list ')' statement
	;

// If MUTEX becomes a general qualifier, there are shift/reduce conflicts, so change syntax to "with mutex".
mutex_statement:
	MUTEX '(' argument_expression_list_opt ')' statement
	;

when_clause:
	WHEN '(' comma_expression ')'
	;

when_clause_opt:
	// empty
	| when_clause
	;

waitfor:
	WAITFOR '(' cast_expression ')'
//	| WAITFOR '(' cast_expression ',' argument_expression_list_opt ')'
//	  	{ $$ = (ExpressionNode *)$3->set_last( $5 ); }
	| WAITFOR '(' cast_expression_list ':' argument_expression_list_opt ')'
	;

cast_expression_list:
	cast_expression
	| cast_expression_list ',' cast_expression
		// { $$ = (ExpressionNode *)($1->set_last( $3 )); }
	;

timeout:
	TIMEOUT '(' comma_expression ')'
	;

waitfor_clause:
	when_clause_opt waitfor statement					%prec THEN
	| when_clause_opt waitfor statement WOR waitfor_clause
	| when_clause_opt timeout statement					%prec THEN
	| when_clause_opt ELSE statement
		// "else" must be conditional after timeout or timeout is never triggered (i.e., it is meaningless)
	| when_clause_opt timeout statement WOR ELSE statement
	| when_clause_opt timeout statement WOR when_clause ELSE statement
	;

waitfor_statement:
	when_clause_opt waitfor statement					%prec THEN
	| when_clause_opt waitfor statement WOR waitfor_clause
	;

exception_statement:
	TRY compound_statement handler_clause
	| TRY compound_statement finally_clause
	| TRY compound_statement handler_clause finally_clause
	;

handler_clause:
	handler_key '(' exception_declaration handler_predicate_opt ')' compound_statement	
	| handler_clause handler_key '(' exception_declaration handler_predicate_opt ')' compound_statement	
	;

handler_predicate_opt:
	// empty
	| ';' conditional_expression
	;

handler_key:
	CATCH
	| CATCHRESUME
	;

finally_clause:
	FINALLY compound_statement
	;

exception_declaration:
		// No SUE declaration in parameter list.
	type_specifier_nobody
	| type_specifier_nobody declarator
	| type_specifier_nobody variable_abstract_declarator
	| cfa_abstract_declarator_tuple identifier			// CFA
	| cfa_abstract_declarator_tuple						// CFA
	;

enable_disable_statement:
	enable_disable_key identifier_list compound_statement
	;

enable_disable_key:
	ENABLE
	| DISABLE
	;

asm_statement:
	ASM asm_volatile_opt '(' string_literal ')' ';'
	| ASM asm_volatile_opt '(' string_literal ':' asm_operands_opt ')' ';' // remaining GCC
	| ASM asm_volatile_opt '(' string_literal ':' asm_operands_opt ':' asm_operands_opt ')' ';'
	| ASM asm_volatile_opt '(' string_literal ':' asm_operands_opt ':' asm_operands_opt ':' asm_clobbers_list_opt
				')' ';'
	| ASM asm_volatile_opt GOTO '(' string_literal ':' ':' asm_operands_opt ':' asm_clobbers_list_opt ':' label_list
				')' ';'
	;

asm_volatile_opt:										// GCC
	// empty
	| VOLATILE
	;

asm_operands_opt:										// GCC
	// empty								// use default argument
	| asm_operands_list
	;

asm_operands_list:										// GCC
	asm_operand
	| asm_operands_list ',' asm_operand
	;

asm_operand:											// GCC
	string_literal '(' constant_expression ')'
	| '[' IDENTIFIER ']' string_literal '(' constant_expression ')'
	;

asm_clobbers_list_opt:									// GCC
	// empty								// use default argument
	| string_literal
	| asm_clobbers_list_opt ',' string_literal
	;

label_list:
	identifier
	| label_list ',' identifier
	;

//******************************* DECLARATIONS *********************************

declaration_list_opt:									// used at beginning of switch statement
	// empty
	| declaration_list
	;

declaration_list:
	declaration
	| declaration_list declaration
	;

KR_parameter_list_opt:									// used to declare parameter types in K&R style functions
	// empty
	| KR_parameter_list
	;

KR_parameter_list: c_declaration ';'	
	| KR_parameter_list c_declaration ';'	
	;

local_label_declaration_opt:							// GCC, local label
	// empty
	| local_label_declaration_list
	;

local_label_declaration_list:							// GCC, local label
	LABEL local_label_list ';'
	| local_label_declaration_list LABEL local_label_list ';'
	;

local_label_list:										// GCC, local label
	identifier_or_type_name
	| local_label_list ',' identifier_or_type_name
	;

declaration:											// old & new style declarations
	c_declaration ';'
	| cfa_declaration ';'								// CFA
	| static_assert										// C11
	;

static_assert:
	STATICASSERT '(' constant_expression ',' string_literal ')' ';' // C11
	| STATICASSERT '(' constant_expression ')' ';'		// CFA

// C declaration syntax is notoriously confusing and error prone. Cforall provides its own type, variable and function
// declarations. CFA declarations use the same declaration tokens as in C; however, CFA places declaration modifiers to
// the left of the base type, while C declarations place modifiers to the right of the base type. CFA declaration
// modifiers are interpreted from left to right and the entire type specification is distributed across all variables in
// the declaration list (as in Pascal).  ANSI C and the new CFA declarations may appear together in the same program
// block, but cannot be mixed within a specific declaration.
//
//			CFA					C
//		[10] int x;			int x[10];		// array of 10 integers
//		[10] * char y;		char *y[10];	// array of 10 pointers to char

cfa_declaration:										// CFA
	cfa_variable_declaration
	| cfa_typedef_declaration
	| cfa_function_declaration
	| type_declaring_list
	| trait_specifier
	;

cfa_variable_declaration:								// CFA
	cfa_variable_specifier initializer_opt
	| declaration_qualifier_list cfa_variable_specifier initializer_opt
		// declaration_qualifier_list also includes type_qualifier_list, so a semantic check is necessary to preclude
		// them as a type_qualifier cannot appear in that context.
	| cfa_variable_declaration ',' identifier_or_type_name initializer_opt	
	;

cfa_variable_specifier:									// CFA
		// A semantic check is required to ensure asm_name only appears on declarations with implicit or explicit static
		// storage-class
	cfa_abstract_declarator_no_tuple identifier_or_type_name asm_name_opt
	| cfa_abstract_tuple identifier_or_type_name asm_name_opt
	| type_qualifier_list cfa_abstract_tuple identifier_or_type_name asm_name_opt
	;

cfa_function_declaration:								// CFA
	cfa_function_specifier
	| type_qualifier_list cfa_function_specifier
	| declaration_qualifier_list cfa_function_specifier
	| declaration_qualifier_list type_qualifier_list cfa_function_specifier
	| cfa_function_declaration ',' identifier_or_type_name '(' cfa_parameter_ellipsis_list_opt ')'	
	;

cfa_function_specifier:									// CFA
//	'[' ']' identifier_or_type_name '(' push cfa_parameter_ellipsis_list_opt pop ')' // S/R conflict
//		{
//			$$ = DeclarationNode::newFunction( $3, DeclarationNode::newTuple( 0 ), $6, 0, true );
//		}
//	'[' ']' identifier '(' push cfa_parameter_ellipsis_list_opt pop ')'
//		{
//			typedefTable.setNextIdentifier( *$5 );
//			$$ = DeclarationNode::newFunction( $5, DeclarationNode::newTuple( 0 ), $8, 0, true );
//		}
//	| '[' ']' TYPEDEFname '(' push cfa_parameter_ellipsis_list_opt pop ')'
//		{
//			typedefTable.setNextIdentifier( *$5 );
//			$$ = DeclarationNode::newFunction( $5, DeclarationNode::newTuple( 0 ), $8, 0, true );
//		}
//	| '[' ']' typegen_name
		// identifier_or_type_name must be broken apart because of the sequence:
		//
		//   '[' ']' identifier_or_type_name '(' cfa_parameter_ellipsis_list_opt ')'
		//   '[' ']' type_specifier
		//
		// type_specifier can resolve to just TYPEDEFname (e.g., typedef int T; int f( T );). Therefore this must be
		// flattened to allow lookahead to the '(' without having to reduce identifier_or_type_name.
	cfa_abstract_tuple identifier_or_type_name '(' cfa_parameter_ellipsis_list_opt ')' attribute_list_opt	
		// To obtain LR(1 ), this rule must be factored out from function return type (see cfa_abstract_declarator).
	| cfa_function_return identifier_or_type_name '(' cfa_parameter_ellipsis_list_opt ')' attribute_list_opt	
	;

cfa_function_return:									// CFA
	'[' cfa_parameter_list ']'	
	| '[' cfa_parameter_list ',' cfa_abstract_parameter_list ']'		
		// To obtain LR(1 ), the last cfa_abstract_parameter_list is added into this flattened rule to lookahead to the ']'.
	;

cfa_typedef_declaration:								// CFA
	TYPEDEF cfa_variable_specifier
	| TYPEDEF cfa_function_specifier
	| cfa_typedef_declaration ',' identifier	
	;

// Traditionally typedef is part of storage-class specifier for syntactic convenience only. Here, it is factored out as
// a separate form of declaration, which syntactically precludes storage-class specifiers and initialization.

typedef_declaration:
	TYPEDEF type_specifier declarator
	| typedef_declaration ',' declarator	
	| type_qualifier_list TYPEDEF type_specifier declarator // remaining OBSOLESCENT (see 2 )
	| type_specifier TYPEDEF declarator
	| type_specifier TYPEDEF type_qualifier_list declarator
	;

typedef_expression:
		// deprecated GCC, naming expression type: typedef name = exp; gives a name to the type of an expression
	TYPEDEF identifier '=' assignment_expression
	| typedef_expression ',' identifier '=' assignment_expression	
	;

c_declaration:
	declaration_specifier declaring_list
	| typedef_declaration
	| typedef_expression								// deprecated GCC, naming expression type
	| sue_declaration_specifier
	;

declaring_list:
		// A semantic check is required to ensure asm_name only appears on declarations with implicit or explicit static
		// storage-class
	declarator asm_name_opt initializer_opt
	| declaring_list ',' attribute_list_opt declarator asm_name_opt initializer_opt
	;

declaration_specifier:									// type specifier + storage class
	basic_declaration_specifier
	| sue_declaration_specifier
	| type_declaration_specifier
	;

declaration_specifier_nobody:							// type specifier + storage class - {...}
		// Preclude SUE declarations in restricted scopes:
		//
		//    int f( struct S { int i; } s1, Struct S s2 ) { struct S s3; ... }
		//
		// because it is impossible to call f due to name equivalence.
	basic_declaration_specifier
	| sue_declaration_specifier_nobody
	| type_declaration_specifier
	;

type_specifier:											// type specifier
	basic_type_specifier
	| sue_type_specifier
	| type_type_specifier
	;

type_specifier_nobody:									// type specifier - {...}
		// Preclude SUE declarations in restricted scopes:
		//
		//    int f( struct S { int i; } s1, Struct S s2 ) { struct S s3; ... }
		//
		// because it is impossible to call f due to name equivalence.
	basic_type_specifier
	| sue_type_specifier_nobody
	| type_type_specifier
	;

enum_specifier_nobody:									// type specifier - {...}
		// Preclude SUE declarations in restricted scopes (see type_specifier_nobody)
	basic_type_specifier
	| sue_type_specifier_nobody
	;

type_qualifier_list_opt:								// GCC, used in asm_statement
	// empty
	| type_qualifier_list
	;

type_qualifier_list:
		// A semantic check is necessary to ensure a type qualifier is appropriate for the kind of declaration.
		//
		// ISO/IEC 9899:1999 Section 6.7.3(4 ) : If the same qualifier appears more than once in the same
		// specifier-qualifier-list, either directly or via one or more typedefs, the behavior is the same as if it
		// appeared only once.
	type_qualifier
	| type_qualifier_list type_qualifier
	;

type_qualifier:
	type_qualifier_name
	| attribute
	;

type_qualifier_name:
	CONST
	| RESTRICT
	| VOLATILE
	| ATOMIC
	| forall
	;

forall:
	FORALL '(' type_parameter_list ')'					// CFA
	;

declaration_qualifier_list:
	storage_class_list
	| type_qualifier_list storage_class_list			// remaining OBSOLESCENT (see 2 )
	| declaration_qualifier_list type_qualifier_list storage_class_list
	;

storage_class_list:
		// A semantic check is necessary to ensure a storage class is appropriate for the kind of declaration and that
		// only one of each is specified, except for inline, which can appear with the others.
		//
		// ISO/IEC 9899:1999 Section 6.7.1(2) : At most, one storage-class specifier may be given in the declaration
		// specifiers in a declaration.
	storage_class
	| storage_class_list storage_class
	;

storage_class:
	EXTERN
	| STATIC
	| AUTO
	| REGISTER
	| THREADLOCAL										// C11
		// Put function specifiers here to simplify parsing rules, but separate them semantically.
	| INLINE											// C99
	| FORTRAN											// C99
	| NORETURN											// C11
	;

basic_type_name:
	VOID
	| BOOL												// C99
	| CHAR
	| INT
	| INT128
	| UINT128
	| FLOAT
	| DOUBLE
	| uuFLOAT80
	| uuFLOAT128
	| uFLOAT16
	| uFLOAT32
	| uFLOAT32X
	| uFLOAT64
	| uFLOAT64X
	| uFLOAT128
	| COMPLEX											// C99
	| IMAGINARY											// C99
	| SIGNED
	| UNSIGNED
	| SHORT
	| LONG
	| VALIST											// GCC, __builtin_va_list
	| AUTO_TYPE
	;

basic_declaration_specifier:
		// A semantic check is necessary for conflicting storage classes.
	basic_type_specifier
	| declaration_qualifier_list basic_type_specifier
	| basic_declaration_specifier storage_class			// remaining OBSOLESCENT (see 2)
	| basic_declaration_specifier storage_class type_qualifier_list
	| basic_declaration_specifier storage_class basic_type_specifier
	;

basic_type_specifier:
	direct_type
		// Cannot have type modifiers, e.g., short, long, etc.
	| type_qualifier_list_opt indirect_type type_qualifier_list_opt
	;

direct_type:
	basic_type_name
	| type_qualifier_list basic_type_name
	| direct_type type_qualifier
	| direct_type basic_type_name
	;

indirect_type:
	TYPEOF '(' type ')'									// GCC: typeof( x ) y;
	| TYPEOF '(' comma_expression ')'					// GCC: typeof( a+b ) y;
	| BASETYPEOF '(' type ')'							// CFA: basetypeof( x ) y;
	| BASETYPEOF '(' comma_expression ')'				// CFA: basetypeof( a+b ) y;
	| ZERO_T											// CFA
	| ONE_T												// CFA
	;

sue_declaration_specifier:								// struct, union, enum + storage class + type specifier
	sue_type_specifier
	| declaration_qualifier_list sue_type_specifier
	| sue_declaration_specifier storage_class			// remaining OBSOLESCENT (see 2)
	| sue_declaration_specifier storage_class type_qualifier_list
	;

sue_type_specifier:										// struct, union, enum + type specifier
	elaborated_type
	| type_qualifier_list // remember generic type
	  elaborated_type
	| sue_type_specifier type_qualifier
	;

sue_declaration_specifier_nobody:						// struct, union, enum - {...} + storage class + type specifier
	sue_type_specifier_nobody
	| declaration_qualifier_list sue_type_specifier_nobody
	| sue_declaration_specifier_nobody storage_class	// remaining OBSOLESCENT (see 2)
	| sue_declaration_specifier_nobody storage_class type_qualifier_list
	;

sue_type_specifier_nobody:								// struct, union, enum - {...} + type specifier
	elaborated_type_nobody
	| type_qualifier_list elaborated_type_nobody
	| sue_type_specifier_nobody type_qualifier
	;

type_declaration_specifier:
	type_type_specifier
	| declaration_qualifier_list type_type_specifier
	| type_declaration_specifier storage_class			// remaining OBSOLESCENT (see 2)
	| type_declaration_specifier storage_class type_qualifier_list
	;

type_type_specifier:									// typedef types
	type_name
	| type_qualifier_list type_name
	| type_type_specifier type_qualifier
	;

type_name:
	TYPEDEFname
	| '.' TYPEDEFname
	| type_name '.' TYPEDEFname
	| typegen_name
	| '.' typegen_name
	| type_name '.' typegen_name
	;

typegen_name:											// CFA
	TYPEGENname
	| TYPEGENname '(' ')'
	| TYPEGENname '(' type_list ')'
	;

elaborated_type:										// struct, union, enum
	aggregate_type
	| enum_type
	;

elaborated_type_nobody:									// struct, union, enum - {...}
	aggregate_type_nobody
	| enum_type_nobody
	;

aggregate_type:											// struct, union
	aggregate_key attribute_list_opt								// reset
	  '{' field_declaration_list_opt '}' type_parameters_opt
	| aggregate_key attribute_list_opt identifier '{' field_declaration_list_opt '}' type_parameters_opt
	| aggregate_key attribute_list_opt type_name '{' field_declaration_list_opt '}' type_parameters_opt
	| aggregate_type_nobody
	;

type_parameters_opt:
	// empty								%prec '}'
	| '(' type_list ')'
	;

aggregate_type_nobody:									// struct, union - {...}
	aggregate_key attribute_list_opt identifier
	| aggregate_key attribute_list_opt type_name
	;

aggregate_key:
	aggregate_data
	| aggregate_control
	;

aggregate_data:
	STRUCT
	| UNION
	| EXCEPTION											// CFA
		// { yyy = true; $$ = AggregateDecl::Exception; }
	;

aggregate_control:										// CFA
	MONITOR
	| MUTEX STRUCT
	| GENERATOR
	| MUTEX GENERATOR
	| COROUTINE
	| MUTEX COROUTINE
	| THREAD
	| MUTEX THREAD
	;

field_declaration_list_opt:
	// empty
	| field_declaration_list_opt field_declaration
	;

field_declaration:
	type_specifier field_declaring_list_opt ';'
	| EXTENSION type_specifier field_declaring_list_opt ';'	// GCC
	| INLINE type_specifier field_abstract_list_opt ';'	// CFA
	| INLINE aggregate_control ';'						// CFA
	| typedef_declaration ';'							// CFA
	| cfa_field_declaring_list ';'						// CFA, new style field declaration
	| EXTENSION cfa_field_declaring_list ';'			// GCC						// mark all fields in list
	| INLINE cfa_field_abstract_list ';'				// CFA, new style field declaration									// mark all fields in list
	| cfa_typedef_declaration ';'						// CFA
	| static_assert										// C11
	;

field_declaring_list_opt:
	// empty
	| field_declarator
	| field_declaring_list_opt ',' attribute_list_opt field_declarator
	;

field_declarator:
	bit_subrange_size									// C special case, no field name
	| variable_declarator bit_subrange_size_opt
		// A semantic check is required to ensure bit_subrange only appears on integral types.
	| variable_type_redeclarator bit_subrange_size_opt
		// A semantic check is required to ensure bit_subrange only appears on integral types.
	;

field_abstract_list_opt:
	// empty
	| field_abstract
	| field_abstract_list_opt ',' attribute_list_opt field_abstract
	;

field_abstract:
		// 	no bit fields
	variable_abstract_declarator
	;

cfa_field_declaring_list:								// CFA, new style field declaration
	// bit-fields are handled by C declarations
	cfa_abstract_declarator_tuple identifier_or_type_name
	| cfa_field_declaring_list ',' identifier_or_type_name
	;

cfa_field_abstract_list:								// CFA, new style field declaration
	// bit-fields are handled by C declarations
	cfa_abstract_declarator_tuple
	| cfa_field_abstract_list ','
	;

bit_subrange_size_opt:
	// empty
	| bit_subrange_size
	;

bit_subrange_size:
	':' assignment_expression
	;

// Cannot use attribute_list_opt because of ambiguity with enum_specifier_nobody, which already parses attribute.
// Hence, only a single attribute is allowed after the "ENUM".
enum_type:												// enum
	ENUM attribute_opt '{' enumerator_list comma_opt '}'
	| ENUM attribute_opt identifier '{' enumerator_list comma_opt '}'
	| ENUM attribute_opt typedef						// enum cannot be generic
	  '{' enumerator_list comma_opt '}'
	| ENUM enum_specifier_nobody '{' enumerator_list comma_opt '}'
		// { $$ = DeclarationNode::newEnum( nullptr, $4, true ); }
	| ENUM enum_specifier_nobody declarator '{' enumerator_list comma_opt '}'
		// {
		// 	typedefTable.makeTypedef( *$3->name );
		// 	$$ = DeclarationNode::newEnum( nullptr, $5, true );
		// }
	| enum_type_nobody
	;

enum_type_nobody:										// enum - {...}
	ENUM attribute_opt identifier
	| ENUM attribute_opt type_name						// enum cannot be generic
	;

enumerator_list:
	identifier_or_type_name enumerator_value_opt
	| enumerator_list ',' identifier_or_type_name enumerator_value_opt
	;

enumerator_value_opt:
	// empty
	// | '=' constant_expression
	// 	{ $$ = $2; }
	| '=' initializer					// FIX ME: enum only deals with constant_expression
	;

cfa_parameter_ellipsis_list_opt:						// CFA, abstract + real
	// empty
	| ELLIPSIS
	| cfa_abstract_parameter_list
	| cfa_parameter_list
	| cfa_parameter_list ',' cfa_abstract_parameter_list	
	| cfa_abstract_parameter_list ',' ELLIPSIS	
	| cfa_parameter_list ',' ELLIPSIS	
	;

cfa_parameter_list:										// CFA
		// To obtain LR(1) between cfa_parameter_list and cfa_abstract_tuple, the last cfa_abstract_parameter_list is
		// factored out from cfa_parameter_list, flattening the rules to get lookahead to the ']'.
	cfa_parameter_declaration
	| cfa_abstract_parameter_list ',' cfa_parameter_declaration	
	| cfa_parameter_list ',' cfa_parameter_declaration	
	| cfa_parameter_list ',' cfa_abstract_parameter_list ',' cfa_parameter_declaration		
	;

cfa_abstract_parameter_list:							// CFA, new & old style abstract
	cfa_abstract_parameter_declaration
	| cfa_abstract_parameter_list ',' cfa_abstract_parameter_declaration	
	;

parameter_type_list_opt:
	// empty
	| ELLIPSIS
	| parameter_list
	| parameter_list ',' ELLIPSIS	
	;

parameter_list:											// abstract + real
	abstract_parameter_declaration
	| parameter_declaration
	| parameter_list ',' abstract_parameter_declaration	
	| parameter_list ',' parameter_declaration	
	;

// Provides optional identifier names (abstract_declarator/variable_declarator), no initialization, different semantics
// for typedef name by using type_parameter_redeclarator instead of typedef_redeclarator, and function prototypes.

cfa_parameter_declaration:								// CFA, new & old style parameter declaration
	parameter_declaration
	| cfa_identifier_parameter_declarator_no_tuple identifier_or_type_name default_initializer_opt
	| cfa_abstract_tuple identifier_or_type_name default_initializer_opt
		// To obtain LR(1), these rules must be duplicated here (see cfa_abstract_declarator).
	| type_qualifier_list cfa_abstract_tuple identifier_or_type_name default_initializer_opt
	| cfa_function_specifier
	;

cfa_abstract_parameter_declaration:						// CFA, new & old style parameter declaration
	abstract_parameter_declaration
	| cfa_identifier_parameter_declarator_no_tuple
	| cfa_abstract_tuple
		// To obtain LR(1), these rules must be duplicated here (see cfa_abstract_declarator).
	| type_qualifier_list cfa_abstract_tuple
	| cfa_abstract_function
	;

parameter_declaration:
		// No SUE declaration in parameter list.
	declaration_specifier_nobody identifier_parameter_declarator default_initializer_opt
	| declaration_specifier_nobody type_parameter_redeclarator default_initializer_opt
	;

abstract_parameter_declaration:
	declaration_specifier_nobody default_initializer_opt
	| declaration_specifier_nobody abstract_parameter_declarator default_initializer_opt
	;

// ISO/IEC 9899:1999 Section 6.9.1(6) : "An identifier declared as a typedef name shall not be redeclared as a
// parameter." Because the scope of the K&R-style parameter-list sees the typedef first, the following is based only on
// identifiers.  The ANSI-style parameter-list can redefine a typedef name.

identifier_list:										// K&R-style parameter list => no types
	identifier
	| identifier_list ',' identifier
	;

identifier_or_type_name:
	identifier
	| TYPEDEFname
	| TYPEGENname
	;

type_no_function:										// sizeof, alignof, cast (constructor)
	cfa_abstract_declarator_tuple						// CFA
	| type_specifier
	| type_specifier abstract_declarator
	;

type:													// typeof, assertion
	type_no_function
	| cfa_abstract_function								// CFA
	;

initializer_opt:
	// empty
	| '=' initializer
	| '=' VOID
	| ATassign initializer
	;

initializer:
	assignment_expression
	| '{' initializer_list_opt comma_opt '}'
	;

initializer_list_opt:
	// empty
	| initializer
	| designation initializer
	| initializer_list_opt ',' initializer
	| initializer_list_opt ',' designation initializer
	;

// There is an unreconcileable parsing problem between C99 and CFA with respect to designators. The problem is use of
// '=' to separator the designator from the initializer value, as in:
//
//		int x[10] = { [1] = 3 };
//
// The string "[1] = 3" can be parsed as a designator assignment or a tuple assignment.  To disambiguate this case, CFA
// changes the syntax from "=" to ":" as the separator between the designator and initializer. GCC does uses ":" for
// field selection. The optional use of the "=" in GCC, or in this case ":", cannot be supported either due to
// shift/reduce conflicts

designation:
	designator_list ':'									// C99, CFA uses ":" instead of "="
	| identifier ':'									// GCC, field name
	;

designator_list:										// C99
	designator
	| designator_list designator
	//| designator_list designator						{ $$ = new ExpressionNode( $1, $2 ); }
	;

designator:
	'.' identifier										// C99, field name
	| '[' assignment_expression ']'				// C99, single array element
		// assignment_expression used instead of constant_expression because of shift/reduce conflicts with tuple.
	| '[' subrange ']'								// CFA, multiple array elements
	| '[' constant_expression ELLIPSIS constant_expression ']'	 // GCC, multiple array elements
	| '.' '[' field_name_list ']'					// CFA, tuple field selector
	;

// The CFA type system is based on parametric polymorphism, the ability to declare functions with type parameters,
// rather than an object-oriented type system. This required four groups of extensions:
//
// Overloading: function, data, and operator identifiers may be overloaded.
//
// Type declarations: "otype" is used to generate new types for declaring objects. Similarly, "dtype" is used for object
//     and incomplete types, and "ftype" is used for function types. Type declarations with initializers provide
//     definitions of new types. Type declarations with storage class "extern" provide opaque types.
//
// Polymorphic functions: A forall clause declares a type parameter. The corresponding argument is inferred at the call
//     site. A polymorphic function is not a template; it is a function, with an address and a type.
//
// Specifications and Assertions: Specifications are collections of declarations parameterized by one or more
//     types. They serve many of the purposes of abstract classes, and specification hierarchies resemble subclass
//     hierarchies. Unlike classes, they can define relationships between types.  Assertions declare that a type or
//     types provide the operations declared by a specification.  Assertions are normally used to declare requirements
//     on type arguments of polymorphic functions.

type_parameter_list:									// CFA
	type_parameter
	| type_parameter_list ',' type_parameter
	;

type_initializer_opt:									// CFA
	// empty
	| '=' type
	;

type_parameter:											// CFA
	type_class identifier_or_type_name type_initializer_opt assertion_list_opt
	| identifier_or_type_name new_type_class type_initializer_opt assertion_list_opt
	| '[' identifier_or_type_name ']'
	// | type_specifier identifier_parameter_declarator
	| assertion_list
	;

new_type_class:											// CFA
	// empty
	| '&'
	| '*'						// dtype + sized
	| ELLIPSIS
	;

type_class:												// CFA
	OTYPE
	| DTYPE
	| FTYPE
	| TTYPE
	;

assertion_list_opt:										// CFA
	// empty
	| assertion_list
	;

assertion_list:											// CFA
	assertion
	| assertion_list assertion
	;

assertion:												// CFA
	'|' identifier_or_type_name '(' type_list ')'
	| '|' '{' trait_declaration_list '}'	
	// | '|' '(' push type_parameter_list pop ')' '{' push trait_declaration_list pop '}' '(' type_list ')'
	// 	{ SemanticError( yylloc, "Generic data-type assertion is currently unimplemented." ); $$ = nullptr; }
	;

type_list:												// CFA
	type
	| assignment_expression
	| type_list ',' type
	| type_list ',' assignment_expression
		// { $$ = (ExpressionNode *)( $1->set_last( $3 )); }
	;

type_declaring_list:									// CFA
	OTYPE type_declarator
	| storage_class_list OTYPE type_declarator
	| type_declaring_list ',' type_declarator
	;

type_declarator:										// CFA
	type_declarator_name assertion_list_opt
	| type_declarator_name assertion_list_opt '=' type
	;

type_declarator_name:									// CFA
	identifier_or_type_name
	| identifier_or_type_name '(' type_parameter_list ')'
	;

trait_specifier:										// CFA
	TRAIT identifier_or_type_name '(' type_parameter_list ')' '{' '}'
	| TRAIT identifier_or_type_name '(' type_parameter_list ')' '{' trait_declaration_list '}'	
	;

trait_declaration_list:									// CFA
	trait_declaration
	| trait_declaration_list trait_declaration	
	;

trait_declaration:										// CFA
	cfa_trait_declaring_list ';'
	| trait_declaring_list ';'
	;

cfa_trait_declaring_list:								// CFA
	cfa_variable_specifier
	| cfa_function_specifier
	| cfa_trait_declaring_list ',' identifier_or_type_name	
	;

trait_declaring_list:									// CFA
	type_specifier declarator
	| trait_declaring_list ',' declarator	
	;

//***************************** EXTERNAL DEFINITIONS *****************************

translation_unit:
	// empty, input file
	| external_definition_list
	;

external_definition_list: external_definition	
	| external_definition_list external_definition	
	;

external_definition_list_opt:
	// empty
	| external_definition_list
	;

up:
	;

down:
	;

external_definition:
	declaration
	| external_function_definition
	| EXTENSION external_definition						// GCC, multiple __extension__ allowed, meaning unknown
	| ASM '(' string_literal ')' ';'					// GCC, global assembler statement
	| EXTERN STRINGliteral								// C++-style linkage specifier '{' up external_definition_list_opt down '}'
	| type_qualifier_list '{' up external_definition_list_opt down '}'		// CFA, namespace
	| declaration_qualifier_list '{' up external_definition_list_opt down '}'		// CFA, namespace
	| declaration_qualifier_list type_qualifier_list '{' up external_definition_list_opt down '}'		// CFA, namespace
	;

external_function_definition:
	function_definition
		// These rules are a concession to the "implicit int" type_specifier because there is a significant amount of
		// legacy code with global functions missing the type-specifier for the return type, and assuming "int".
		// Parsing is possible because function_definition does not appear in the context of an expression (nested
		// functions preclude this concession, i.e., all nested function must have a return type). A function prototype
		// declaration must still have a type_specifier.  OBSOLESCENT (see 1)
	| function_declarator compound_statement
	| KR_function_declarator KR_parameter_list_opt compound_statement
	;

with_clause_opt:
	// empty
	| WITH '(' tuple_expression_list ')'
	;

function_definition:
	cfa_function_declaration with_clause_opt compound_statement	// CFA
	| declaration_specifier function_declarator with_clause_opt compound_statement
	| declaration_specifier variable_type_redeclarator with_clause_opt compound_statement
		// handles default int return type, OBSOLESCENT (see 1)
	| type_qualifier_list function_declarator with_clause_opt compound_statement
		// handles default int return type, OBSOLESCENT (see 1)
	| declaration_qualifier_list function_declarator with_clause_opt compound_statement
		// handles default int return type, OBSOLESCENT (see 1)
	| declaration_qualifier_list type_qualifier_list function_declarator with_clause_opt compound_statement

		// Old-style K&R function definition, OBSOLESCENT (see 4)
	| declaration_specifier KR_function_declarator KR_parameter_list_opt with_clause_opt compound_statement
		// handles default int return type, OBSOLESCENT (see 1)
	| type_qualifier_list KR_function_declarator KR_parameter_list_opt with_clause_opt compound_statement
		// handles default int return type, OBSOLESCENT (see 1)
	| declaration_qualifier_list KR_function_declarator KR_parameter_list_opt with_clause_opt
				compound_statement
		// handles default int return type, OBSOLESCENT (see 1)
	| declaration_qualifier_list type_qualifier_list KR_function_declarator KR_parameter_list_opt
				with_clause_opt compound_statement
	;

declarator:
	variable_declarator
	| variable_type_redeclarator
	| function_declarator
	;

subrange:
	constant_expression '~' constant_expression			// CFA, integer subrange
	;

asm_name_opt:											// GCC
	// empty
	| ASM '(' string_literal ')' attribute_list_opt
	;

attribute_list_opt:										// GCC
	// empty
	| attribute_list
	;

attribute_list:											// GCC
	attribute
	| attribute_list attribute
	;

attribute_opt:
	// empty
	| attribute
	;

attribute:												// GCC
	ATTRIBUTE '(' '(' attribute_name_list ')' ')'
	;

attribute_name_list:									// GCC
	attribute_name
	| attribute_name_list ',' attribute_name
	;

attribute_name:											// GCC
	// empty
	| attr_name
	| attr_name '(' argument_expression_list_opt ')'
	;

attr_name:												// GCC
	IDENTIFIER
	| quasi_keyword
	| TYPEDEFname
	| TYPEGENname
	| FALLTHROUGH
	| CONST
	;

// ============================================================================
// The following sections are a series of grammar patterns used to parse declarators. Multiple patterns are necessary
// because the type of an identifier in wrapped around the identifier in the same form as its usage in an expression, as
// in:
//
//		int (*f())[10] { ... };
//		... (*f())[3] += 1;		// definition mimics usage
//
// Because these patterns are highly recursive, changes at a lower level in the recursion require copying some or all of
// the pattern. Each of these patterns has some subtle variation to ensure correct syntax in a particular context.
// ============================================================================

// ----------------------------------------------------------------------------
// The set of valid declarators before a compound statement for defining a function is less than the set of declarators
// to define a variable or function prototype, e.g.:
//
//		valid declaration		invalid definition
//		-----------------		------------------
//		int f;					int f {}
//		int *f;					int *f {}
//		int f[10];				int f[10] {}
//		int (*f)(int);			int (*f)(int) {}
//
// To preclude this syntactic anomaly requires separating the grammar rules for variable and function declarators, hence
// variable_declarator and function_declarator.
// ----------------------------------------------------------------------------

// This pattern parses a declaration of a variable that is not redefining a typedef name. The pattern precludes
// declaring an array of functions versus a pointer to an array of functions.

variable_declarator:
	paren_identifier attribute_list_opt
	| variable_ptr
	| variable_array attribute_list_opt
	| variable_function attribute_list_opt
	;

paren_identifier:
	identifier
	| '(' paren_identifier ')'							// redundant parenthesis
	;

variable_ptr:
	ptrref_operator variable_declarator
	| ptrref_operator type_qualifier_list variable_declarator
	| '(' variable_ptr ')' attribute_list_opt				// redundant parenthesis
	;

variable_array:
	paren_identifier array_dimension
	| '(' variable_ptr ')' array_dimension
	| '(' variable_array ')' multi_array_dimension		// redundant parenthesis
	| '(' variable_array ')'							// redundant parenthesis
	;

variable_function:
	'(' variable_ptr ')' '(' parameter_type_list_opt ')'	 // empty parameter list OBSOLESCENT (see 3)
	| '(' variable_function ')'							// redundant parenthesis
	;

// This pattern parses a function declarator that is not redefining a typedef name. For non-nested functions, there is
// no context where a function definition can redefine a typedef name, i.e., the typedef and function name cannot exist
// is the same scope.  The pattern precludes returning arrays and functions versus pointers to arrays and functions.

function_declarator:
	function_no_ptr attribute_list_opt
	| function_ptr
	| function_array attribute_list_opt
	;

function_no_ptr:
	paren_identifier '(' parameter_type_list_opt ')'	 // empty parameter list OBSOLESCENT (see 3)
	| '(' function_ptr ')' '(' parameter_type_list_opt ')'	
	| '(' function_no_ptr ')'							// redundant parenthesis
	;

function_ptr:
	ptrref_operator function_declarator
	| ptrref_operator type_qualifier_list function_declarator
	| '(' function_ptr ')'
	;

function_array:
	'(' function_ptr ')' array_dimension
	| '(' function_array ')' multi_array_dimension		// redundant parenthesis
	| '(' function_array ')'							// redundant parenthesis
	;

// This pattern parses an old-style K&R function declarator (OBSOLESCENT, see 4)
//
//   f( a, b, c ) int a, *b, c[]; {}
//
// that is not redefining a typedef name (see function_declarator for additional comments). The pattern precludes
// returning arrays and functions versus pointers to arrays and functions.

KR_function_declarator:
	KR_function_no_ptr
	| KR_function_ptr
	| KR_function_array
	;

KR_function_no_ptr:
	paren_identifier '(' identifier_list ')'			// function_declarator handles empty parameter
	| '(' KR_function_ptr ')' '(' parameter_type_list_opt ')'	
	| '(' KR_function_no_ptr ')'						// redundant parenthesis
	;

KR_function_ptr:
	ptrref_operator KR_function_declarator
	| ptrref_operator type_qualifier_list KR_function_declarator
	| '(' KR_function_ptr ')'
	;

KR_function_array:
	'(' KR_function_ptr ')' array_dimension
	| '(' KR_function_array ')' multi_array_dimension	// redundant parenthesis
	| '(' KR_function_array ')'							// redundant parenthesis
	;

// This pattern parses a declaration for a variable or function prototype that redefines a type name, e.g.:
//
//		typedef int foo;
//		{
//		   int foo; // redefine typedef name in new scope
//		}
//
// The pattern precludes declaring an array of functions versus a pointer to an array of functions, and returning arrays
// and functions versus pointers to arrays and functions.

variable_type_redeclarator:
	paren_type attribute_list_opt
	| type_ptr
	| type_array attribute_list_opt
	| type_function attribute_list_opt
	;

paren_type:
	typedef
		// hide type name in enclosing scope by variable name
	| '(' paren_type ')'
	;

type_ptr:
	ptrref_operator variable_type_redeclarator
	| ptrref_operator type_qualifier_list variable_type_redeclarator
	| '(' type_ptr ')' attribute_list_opt				// redundant parenthesis
	;

type_array:
	paren_type array_dimension
	| '(' type_ptr ')' array_dimension
	| '(' type_array ')' multi_array_dimension			// redundant parenthesis
	| '(' type_array ')'								// redundant parenthesis
	;

type_function:
	paren_type '(' parameter_type_list_opt ')'	 // empty parameter list OBSOLESCENT (see 3)
	| '(' type_ptr ')' '(' parameter_type_list_opt ')'	 // empty parameter list OBSOLESCENT (see 3)
	| '(' type_function ')'								// redundant parenthesis
	;

// This pattern parses a declaration for a parameter variable of a function prototype or actual that is not redefining a
// typedef name and allows the C99 array options, which can only appear in a parameter list.  The pattern precludes
// declaring an array of functions versus a pointer to an array of functions, and returning arrays and functions versus
// pointers to arrays and functions.

identifier_parameter_declarator:
	paren_identifier attribute_list_opt
	| '&' MUTEX paren_identifier attribute_list_opt
	| identifier_parameter_ptr
	| identifier_parameter_array attribute_list_opt
	| identifier_parameter_function attribute_list_opt
	;

identifier_parameter_ptr:
	ptrref_operator identifier_parameter_declarator
	| ptrref_operator type_qualifier_list identifier_parameter_declarator
	| '(' identifier_parameter_ptr ')' attribute_list_opt
	;

identifier_parameter_array:
	paren_identifier array_parameter_dimension
	| '(' identifier_parameter_ptr ')' array_dimension
	| '(' identifier_parameter_array ')' multi_array_dimension // redundant parenthesis
	| '(' identifier_parameter_array ')'				// redundant parenthesis
	;

identifier_parameter_function:
	paren_identifier '(' parameter_type_list_opt ')'	 // empty parameter list OBSOLESCENT (see 3)
	| '(' identifier_parameter_ptr ')' '(' parameter_type_list_opt ')'	 // empty parameter list OBSOLESCENT (see 3)
	| '(' identifier_parameter_function ')'				// redundant parenthesis
	;

// This pattern parses a declaration for a parameter variable or function prototype that is redefining a typedef name,
// e.g.:
//
//		typedef int foo;
//		forall( otype T ) struct foo;
//		int f( int foo ); // redefine typedef name in new scope
//
// and allows the C99 array options, which can only appear in a parameter list.

type_parameter_redeclarator:
	typedef attribute_list_opt
	| '&' MUTEX typedef attribute_list_opt
	| type_parameter_ptr
	| type_parameter_array attribute_list_opt
	| type_parameter_function attribute_list_opt
	;

typedef:
	TYPEDEFname
	| TYPEGENname
	;

type_parameter_ptr:
	ptrref_operator type_parameter_redeclarator
	| ptrref_operator type_qualifier_list type_parameter_redeclarator
	| '(' type_parameter_ptr ')' attribute_list_opt
	;

type_parameter_array:
	typedef array_parameter_dimension
	| '(' type_parameter_ptr ')' array_parameter_dimension
	;

type_parameter_function:
	typedef '(' parameter_type_list_opt ')'		// empty parameter list OBSOLESCENT (see 3)
	| '(' type_parameter_ptr ')' '(' parameter_type_list_opt ')'	 // empty parameter list OBSOLESCENT (see 3)
	;

// This pattern parses a declaration of an abstract variable or function prototype, i.e., there is no identifier to
// which the type applies, e.g.:
//
//		sizeof( int );
//		sizeof( int * );
//		sizeof( int [10] );
//		sizeof( int (*)() );
//		sizeof( int () );
//
// The pattern precludes declaring an array of functions versus a pointer to an array of functions, and returning arrays
// and functions versus pointers to arrays and functions.

abstract_declarator:
	abstract_ptr
	| abstract_array attribute_list_opt
	| abstract_function attribute_list_opt
	;

abstract_ptr:
	ptrref_operator
	| ptrref_operator type_qualifier_list
	| ptrref_operator abstract_declarator
	| ptrref_operator type_qualifier_list abstract_declarator
	| '(' abstract_ptr ')' attribute_list_opt
	;

abstract_array:
	array_dimension
	| '(' abstract_ptr ')' array_dimension
	| '(' abstract_array ')' multi_array_dimension		// redundant parenthesis
	| '(' abstract_array ')'							// redundant parenthesis
	;

abstract_function:
	'(' parameter_type_list_opt ')'				// empty parameter list OBSOLESCENT (see 3)
	| '(' abstract_ptr ')' '(' parameter_type_list_opt ')'	 // empty parameter list OBSOLESCENT (see 3)
	| '(' abstract_function ')'							// redundant parenthesis
	;

array_dimension:
		// Only the first dimension can be empty.
	'[' ']'
	| '[' ']' multi_array_dimension
	| multi_array_dimension
	;

multi_array_dimension:
	'[' assignment_expression ']'	
	| '[' '*' ']'									// C99
	| multi_array_dimension '[' assignment_expression ']'	
	| multi_array_dimension '[' '*' ']'			// C99
	;

// This pattern parses a declaration of a parameter abstract variable or function prototype, i.e., there is no
// identifier to which the type applies, e.g.:
//
//		int f( int );			// not handled here
//		int f( int * );			// abstract function-prototype parameter; no parameter name specified
//		int f( int (*)() );		// abstract function-prototype parameter; no parameter name specified
//		int f( int (int) );		// abstract function-prototype parameter; no parameter name specified
//
// The pattern precludes declaring an array of functions versus a pointer to an array of functions, and returning arrays
// and functions versus pointers to arrays and functions. In addition, the pattern handles the
// special meaning of parenthesis around a typedef name:
//
//		ISO/IEC 9899:1999 Section 6.7.5.3(11) : "In a parameter declaration, a single typedef name in
//		parentheses is taken to be an abstract declarator that specifies a function with a single parameter,
//		not as redundant parentheses around the identifier."
//
// For example:
//
//		typedef float T;
//		int f( int ( T [5] ) );					// see abstract_parameter_declarator
//		int g( int ( T ( int ) ) );				// see abstract_parameter_declarator
//		int f( int f1( T a[5] ) );				// see identifier_parameter_declarator
//		int g( int g1( T g2( int p ) ) );		// see identifier_parameter_declarator
//
// In essence, a '(' immediately to the left of typedef name, T, is interpreted as starting a parameter type list, and
// not as redundant parentheses around a redeclaration of T. Finally, the pattern also precludes declaring an array of
// functions versus a pointer to an array of functions, and returning arrays and functions versus pointers to arrays and
// functions.

abstract_parameter_declarator:
	abstract_parameter_ptr
	| '&' MUTEX attribute_list_opt
	| abstract_parameter_array attribute_list_opt
	| abstract_parameter_function attribute_list_opt
	;

abstract_parameter_ptr:
	ptrref_operator
	| ptrref_operator type_qualifier_list
	| ptrref_operator abstract_parameter_declarator
	| ptrref_operator type_qualifier_list abstract_parameter_declarator
	| '(' abstract_parameter_ptr ')' attribute_list_opt
	;

abstract_parameter_array:
	array_parameter_dimension
	| '(' abstract_parameter_ptr ')' array_parameter_dimension
	| '(' abstract_parameter_array ')' multi_array_dimension // redundant parenthesis
	| '(' abstract_parameter_array ')'					// redundant parenthesis
	;

abstract_parameter_function:
	'(' parameter_type_list_opt ')'				// empty parameter list OBSOLESCENT (see 3)
	| '(' abstract_parameter_ptr ')' '(' parameter_type_list_opt ')'	 // empty parameter list OBSOLESCENT (see 3)
	| '(' abstract_parameter_function ')'				// redundant parenthesis
	;

array_parameter_dimension:
		// Only the first dimension can be empty or have qualifiers.
	array_parameter_1st_dimension
	| array_parameter_1st_dimension multi_array_dimension
	| multi_array_dimension
	;

// The declaration of an array parameter has additional syntax over arrays in normal variable declarations:
//
//		ISO/IEC 9899:1999 Section 6.7.5.2(1) : "The optional type qualifiers and the keyword static shall appear only in
//		a declaration of a function parameter with an array type, and then only in the outermost array type derivation."

array_parameter_1st_dimension:
	'[' ']'
		// multi_array_dimension handles the '[' '*' ']' case
	| '[' type_qualifier_list '*' ']'				// remaining C99
	| '[' type_qualifier_list ']'	
		// multi_array_dimension handles the '[' assignment_expression ']' case
	| '[' type_qualifier_list assignment_expression ']'	
	| '[' STATIC type_qualifier_list_opt assignment_expression ']'	
	| '[' type_qualifier_list STATIC assignment_expression ']'	
	;

// This pattern parses a declaration of an abstract variable, but does not allow "int ()" for a function pointer.
//
//		struct S {
//          int;
//          int *;
//          int [10];
//          int (*)();
//      };

variable_abstract_declarator:
	variable_abstract_ptr
	| variable_abstract_array attribute_list_opt
	| variable_abstract_function attribute_list_opt
	;

variable_abstract_ptr:
	ptrref_operator
	| ptrref_operator type_qualifier_list
	| ptrref_operator variable_abstract_declarator
	| ptrref_operator type_qualifier_list variable_abstract_declarator
	| '(' variable_abstract_ptr ')' attribute_list_opt
	;

variable_abstract_array:
	array_dimension
	| '(' variable_abstract_ptr ')' array_dimension
	| '(' variable_abstract_array ')' multi_array_dimension // redundant parenthesis
	| '(' variable_abstract_array ')'					// redundant parenthesis
	;

variable_abstract_function:
	'(' variable_abstract_ptr ')' '(' parameter_type_list_opt ')'	 // empty parameter list OBSOLESCENT (see 3)
	| '(' variable_abstract_function ')'				// redundant parenthesis
	;

// This pattern parses a new-style declaration for a parameter variable or function prototype that is either an
// identifier or typedef name and allows the C99 array options, which can only appear in a parameter list.

cfa_identifier_parameter_declarator_tuple:				// CFA
	cfa_identifier_parameter_declarator_no_tuple
	| cfa_abstract_tuple
	| type_qualifier_list cfa_abstract_tuple
	;

cfa_identifier_parameter_declarator_no_tuple:			// CFA
	cfa_identifier_parameter_ptr
	| cfa_identifier_parameter_array
	;

cfa_identifier_parameter_ptr:							// CFA
		// No SUE declaration in parameter list.
	ptrref_operator type_specifier_nobody
	| type_qualifier_list ptrref_operator type_specifier_nobody
	| ptrref_operator cfa_abstract_function
	| type_qualifier_list ptrref_operator cfa_abstract_function
	| ptrref_operator cfa_identifier_parameter_declarator_tuple
	| type_qualifier_list ptrref_operator cfa_identifier_parameter_declarator_tuple
	;

cfa_identifier_parameter_array:							// CFA
		// Only the first dimension can be empty or have qualifiers. Empty dimension must be factored out due to
		// shift/reduce conflict with new-style empty (void) function return type.
	'[' ']' type_specifier_nobody
	| cfa_array_parameter_1st_dimension type_specifier_nobody
	| '[' ']' multi_array_dimension type_specifier_nobody
	| cfa_array_parameter_1st_dimension multi_array_dimension type_specifier_nobody
	| multi_array_dimension type_specifier_nobody

	| '[' ']' cfa_identifier_parameter_ptr
	| cfa_array_parameter_1st_dimension cfa_identifier_parameter_ptr
	| '[' ']' multi_array_dimension cfa_identifier_parameter_ptr
	| cfa_array_parameter_1st_dimension multi_array_dimension cfa_identifier_parameter_ptr
	| multi_array_dimension cfa_identifier_parameter_ptr
	;

cfa_array_parameter_1st_dimension:
	'[' type_qualifier_list '*' ']'				// remaining C99
	| '[' type_qualifier_list assignment_expression ']'	
	| '[' declaration_qualifier_list assignment_expression ']'	
		// declaration_qualifier_list must be used because of shift/reduce conflict with
		// assignment_expression, so a semantic check is necessary to preclude them as a type_qualifier cannot
		// appear in this context.
	| '[' declaration_qualifier_list type_qualifier_list assignment_expression ']'	
	;

// This pattern parses a new-style declaration of an abstract variable or function prototype, i.e., there is no
// identifier to which the type applies, e.g.:
//
//		[int] f( int );				// abstract variable parameter; no parameter name specified
//		[int] f( [int] (int) );		// abstract function-prototype parameter; no parameter name specified
//
// These rules need LR(3):
//
//		cfa_abstract_tuple identifier_or_type_name
//		'[' cfa_parameter_list ']' identifier_or_type_name '(' cfa_parameter_ellipsis_list_opt ')'
//
// since a function return type can be syntactically identical to a tuple type:
//
//		[int, int] t;
//		[int, int] f( int );
//
// Therefore, it is necessary to look at the token after identifier_or_type_name to know when to reduce
// cfa_abstract_tuple. To make this LR(1), several rules have to be flattened (lengthened) to allow the necessary
// lookahead. To accomplish this, cfa_abstract_declarator has an entry point without tuple, and tuple declarations are
// duplicated when appearing with cfa_function_specifier.

cfa_abstract_declarator_tuple:							// CFA
	cfa_abstract_tuple
	| type_qualifier_list cfa_abstract_tuple
	| cfa_abstract_declarator_no_tuple
	;

cfa_abstract_declarator_no_tuple:						// CFA
	cfa_abstract_ptr
	| cfa_abstract_array
	;

cfa_abstract_ptr:										// CFA
	ptrref_operator type_specifier
	| type_qualifier_list ptrref_operator type_specifier
	| ptrref_operator cfa_abstract_function
	| type_qualifier_list ptrref_operator cfa_abstract_function
	| ptrref_operator cfa_abstract_declarator_tuple
	| type_qualifier_list ptrref_operator cfa_abstract_declarator_tuple
	;

cfa_abstract_array:										// CFA
		// Only the first dimension can be empty. Empty dimension must be factored out due to shift/reduce conflict with
		// empty (void) function return type.
	'[' ']' type_specifier
	| '[' ']' multi_array_dimension type_specifier
	| multi_array_dimension type_specifier
	| '[' ']' cfa_abstract_ptr
	| '[' ']' multi_array_dimension cfa_abstract_ptr
	| multi_array_dimension cfa_abstract_ptr
	;

cfa_abstract_tuple:										// CFA
	'[' cfa_abstract_parameter_list ']'	
	| '[' type_specifier_nobody ELLIPSIS ']'	
	| '[' type_specifier_nobody ELLIPSIS constant_expression ']'	
	;

cfa_abstract_function:									// CFA
//	'[' ']' '(' cfa_parameter_ellipsis_list_opt ')'
//		{ $$ = DeclarationNode::newFunction( nullptr, DeclarationNode::newTuple( nullptr ), $4, nullptr ); }
	cfa_abstract_tuple '(' cfa_parameter_ellipsis_list_opt ')'	
	| cfa_function_return '(' cfa_parameter_ellipsis_list_opt ')'	
	;

// 1) ISO/IEC 9899:1999 Section 6.7.2(2) : "At least one type specifier shall be given in the declaration specifiers in
//    each declaration, and in the specifier-qualifier list in each structure declaration and type name."
//
// 2) ISO/IEC 9899:1999 Section 6.11.5(1) : "The placement of a storage-class specifier other than at the beginning of
//    the declaration specifiers in a declaration is an obsolescent feature."
//
// 3) ISO/IEC 9899:1999 Section 6.11.6(1) : "The use of function declarators with empty parentheses (not
//    prototype-format parameter type declarators) is an obsolescent feature."
//
// 4) ISO/IEC 9899:1999 Section 6.11.7(1) : "The use of function definitions with separate parameter identifier and
//    declaration lists (not prototype-format parameter type and identifier declarators) is an obsolescent feature.

//************************* MISCELLANEOUS ********************************

comma_opt:												// redundant comma
	// empty
	| ','
	;

default_initializer_opt:
	// empty
	| '=' assignment_expression
	;
