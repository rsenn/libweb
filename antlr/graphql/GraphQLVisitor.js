// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/GraphQL.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by GraphQLParser.

function GraphQLVisitor() {
  antlr4.tree.ParseTreeVisitor.call(this);
  return this;
}

GraphQLVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
GraphQLVisitor.prototype.constructor = GraphQLVisitor;

// Visit a parse tree produced by GraphQLParser#document.
GraphQLVisitor.prototype.visitDocument = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#definition.
GraphQLVisitor.prototype.visitDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#executableDefinition.
GraphQLVisitor.prototype.visitExecutableDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#operationDefinition.
GraphQLVisitor.prototype.visitOperationDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#operationType.
GraphQLVisitor.prototype.visitOperationType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#selectionSet.
GraphQLVisitor.prototype.visitSelectionSet = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#selection.
GraphQLVisitor.prototype.visitSelection = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#field.
GraphQLVisitor.prototype.visitField = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#arguments.
GraphQLVisitor.prototype.visitArguments = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#argument.
GraphQLVisitor.prototype.visitArgument = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#alias.
GraphQLVisitor.prototype.visitAlias = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#fragmentSpread.
GraphQLVisitor.prototype.visitFragmentSpread = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#fragmentDefinition.
GraphQLVisitor.prototype.visitFragmentDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#fragmentName.
GraphQLVisitor.prototype.visitFragmentName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#typeCondition.
GraphQLVisitor.prototype.visitTypeCondition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#inlineFragment.
GraphQLVisitor.prototype.visitInlineFragment = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#value.
GraphQLVisitor.prototype.visitValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#intValue.
GraphQLVisitor.prototype.visitIntValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#floatValue.
GraphQLVisitor.prototype.visitFloatValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#booleanValue.
GraphQLVisitor.prototype.visitBooleanValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#stringValue.
GraphQLVisitor.prototype.visitStringValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#nullValue.
GraphQLVisitor.prototype.visitNullValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#enumValue.
GraphQLVisitor.prototype.visitEnumValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#listValue.
GraphQLVisitor.prototype.visitListValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#objectValue.
GraphQLVisitor.prototype.visitObjectValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#objectField.
GraphQLVisitor.prototype.visitObjectField = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#variable.
GraphQLVisitor.prototype.visitVariable = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#variableDefinitions.
GraphQLVisitor.prototype.visitVariableDefinitions = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#variableDefinition.
GraphQLVisitor.prototype.visitVariableDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#defaultValue.
GraphQLVisitor.prototype.visitDefaultValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#type_.
GraphQLVisitor.prototype.visitType_ = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#namedType.
GraphQLVisitor.prototype.visitNamedType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#listType.
GraphQLVisitor.prototype.visitListType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#directives.
GraphQLVisitor.prototype.visitDirectives = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#directive.
GraphQLVisitor.prototype.visitDirective = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#typeSystemDefinition.
GraphQLVisitor.prototype.visitTypeSystemDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#typeSystemExtension.
GraphQLVisitor.prototype.visitTypeSystemExtension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#schemaDefinition.
GraphQLVisitor.prototype.visitSchemaDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#rootOperationTypeDefinition.
GraphQLVisitor.prototype.visitRootOperationTypeDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#schemaExtension.
GraphQLVisitor.prototype.visitSchemaExtension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#operationTypeDefinition.
GraphQLVisitor.prototype.visitOperationTypeDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#description.
GraphQLVisitor.prototype.visitDescription = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#typeDefinition.
GraphQLVisitor.prototype.visitTypeDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#typeExtension.
GraphQLVisitor.prototype.visitTypeExtension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#scalarTypeDefinition.
GraphQLVisitor.prototype.visitScalarTypeDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#scalarTypeExtension.
GraphQLVisitor.prototype.visitScalarTypeExtension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#objectTypeDefinition.
GraphQLVisitor.prototype.visitObjectTypeDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#implementsInterfaces.
GraphQLVisitor.prototype.visitImplementsInterfaces = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#fieldsDefinition.
GraphQLVisitor.prototype.visitFieldsDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#fieldDefinition.
GraphQLVisitor.prototype.visitFieldDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#argumentsDefinition.
GraphQLVisitor.prototype.visitArgumentsDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#inputValueDefinition.
GraphQLVisitor.prototype.visitInputValueDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#objectTypeExtension.
GraphQLVisitor.prototype.visitObjectTypeExtension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#interfaceTypeDefinition.
GraphQLVisitor.prototype.visitInterfaceTypeDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#interfaceTypeExtension.
GraphQLVisitor.prototype.visitInterfaceTypeExtension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#unionTypeDefinition.
GraphQLVisitor.prototype.visitUnionTypeDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#unionMemberTypes.
GraphQLVisitor.prototype.visitUnionMemberTypes = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#unionTypeExtension.
GraphQLVisitor.prototype.visitUnionTypeExtension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#enumTypeDefinition.
GraphQLVisitor.prototype.visitEnumTypeDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#enumValuesDefinition.
GraphQLVisitor.prototype.visitEnumValuesDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#enumValueDefinition.
GraphQLVisitor.prototype.visitEnumValueDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#enumTypeExtension.
GraphQLVisitor.prototype.visitEnumTypeExtension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#inputObjectTypeDefinition.
GraphQLVisitor.prototype.visitInputObjectTypeDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#inputFieldsDefinition.
GraphQLVisitor.prototype.visitInputFieldsDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#inputObjectTypeExtension.
GraphQLVisitor.prototype.visitInputObjectTypeExtension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#directiveDefinition.
GraphQLVisitor.prototype.visitDirectiveDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#directiveLocations.
GraphQLVisitor.prototype.visitDirectiveLocations = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#directiveLocation.
GraphQLVisitor.prototype.visitDirectiveLocation = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#executableDirectiveLocation.
GraphQLVisitor.prototype.visitExecutableDirectiveLocation = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#typeSystemDirectiveLocation.
GraphQLVisitor.prototype.visitTypeSystemDirectiveLocation = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by GraphQLParser#name.
GraphQLVisitor.prototype.visitName = function(ctx) {
  return this.visitChildren(ctx);
};

exports.GraphQLVisitor = GraphQLVisitor;
