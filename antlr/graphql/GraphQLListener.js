// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/GraphQL.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by GraphQLParser.
function GraphQLListener() {
  antlr4.tree.ParseTreeListener.call(this);
  return this;
}

GraphQLListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
GraphQLListener.prototype.constructor = GraphQLListener;

// Enter a parse tree produced by GraphQLParser#document.
GraphQLListener.prototype.enterDocument = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#document.
GraphQLListener.prototype.exitDocument = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#definition.
GraphQLListener.prototype.enterDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#definition.
GraphQLListener.prototype.exitDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#executableDefinition.
GraphQLListener.prototype.enterExecutableDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#executableDefinition.
GraphQLListener.prototype.exitExecutableDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#operationDefinition.
GraphQLListener.prototype.enterOperationDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#operationDefinition.
GraphQLListener.prototype.exitOperationDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#operationType.
GraphQLListener.prototype.enterOperationType = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#operationType.
GraphQLListener.prototype.exitOperationType = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#selectionSet.
GraphQLListener.prototype.enterSelectionSet = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#selectionSet.
GraphQLListener.prototype.exitSelectionSet = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#selection.
GraphQLListener.prototype.enterSelection = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#selection.
GraphQLListener.prototype.exitSelection = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#field.
GraphQLListener.prototype.enterField = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#field.
GraphQLListener.prototype.exitField = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#arguments.
GraphQLListener.prototype.enterArguments = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#arguments.
GraphQLListener.prototype.exitArguments = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#argument.
GraphQLListener.prototype.enterArgument = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#argument.
GraphQLListener.prototype.exitArgument = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#alias.
GraphQLListener.prototype.enterAlias = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#alias.
GraphQLListener.prototype.exitAlias = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#fragmentSpread.
GraphQLListener.prototype.enterFragmentSpread = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#fragmentSpread.
GraphQLListener.prototype.exitFragmentSpread = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#fragmentDefinition.
GraphQLListener.prototype.enterFragmentDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#fragmentDefinition.
GraphQLListener.prototype.exitFragmentDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#fragmentName.
GraphQLListener.prototype.enterFragmentName = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#fragmentName.
GraphQLListener.prototype.exitFragmentName = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#typeCondition.
GraphQLListener.prototype.enterTypeCondition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#typeCondition.
GraphQLListener.prototype.exitTypeCondition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#inlineFragment.
GraphQLListener.prototype.enterInlineFragment = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#inlineFragment.
GraphQLListener.prototype.exitInlineFragment = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#value.
GraphQLListener.prototype.enterValue = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#value.
GraphQLListener.prototype.exitValue = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#intValue.
GraphQLListener.prototype.enterIntValue = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#intValue.
GraphQLListener.prototype.exitIntValue = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#floatValue.
GraphQLListener.prototype.enterFloatValue = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#floatValue.
GraphQLListener.prototype.exitFloatValue = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#booleanValue.
GraphQLListener.prototype.enterBooleanValue = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#booleanValue.
GraphQLListener.prototype.exitBooleanValue = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#stringValue.
GraphQLListener.prototype.enterStringValue = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#stringValue.
GraphQLListener.prototype.exitStringValue = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#nullValue.
GraphQLListener.prototype.enterNullValue = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#nullValue.
GraphQLListener.prototype.exitNullValue = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#enumValue.
GraphQLListener.prototype.enterEnumValue = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#enumValue.
GraphQLListener.prototype.exitEnumValue = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#listValue.
GraphQLListener.prototype.enterListValue = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#listValue.
GraphQLListener.prototype.exitListValue = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#objectValue.
GraphQLListener.prototype.enterObjectValue = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#objectValue.
GraphQLListener.prototype.exitObjectValue = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#objectField.
GraphQLListener.prototype.enterObjectField = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#objectField.
GraphQLListener.prototype.exitObjectField = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#variable.
GraphQLListener.prototype.enterVariable = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#variable.
GraphQLListener.prototype.exitVariable = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#variableDefinitions.
GraphQLListener.prototype.enterVariableDefinitions = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#variableDefinitions.
GraphQLListener.prototype.exitVariableDefinitions = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#variableDefinition.
GraphQLListener.prototype.enterVariableDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#variableDefinition.
GraphQLListener.prototype.exitVariableDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#defaultValue.
GraphQLListener.prototype.enterDefaultValue = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#defaultValue.
GraphQLListener.prototype.exitDefaultValue = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#type_.
GraphQLListener.prototype.enterType_ = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#type_.
GraphQLListener.prototype.exitType_ = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#namedType.
GraphQLListener.prototype.enterNamedType = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#namedType.
GraphQLListener.prototype.exitNamedType = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#listType.
GraphQLListener.prototype.enterListType = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#listType.
GraphQLListener.prototype.exitListType = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#directives.
GraphQLListener.prototype.enterDirectives = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#directives.
GraphQLListener.prototype.exitDirectives = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#directive.
GraphQLListener.prototype.enterDirective = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#directive.
GraphQLListener.prototype.exitDirective = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#typeSystemDefinition.
GraphQLListener.prototype.enterTypeSystemDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#typeSystemDefinition.
GraphQLListener.prototype.exitTypeSystemDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#typeSystemExtension.
GraphQLListener.prototype.enterTypeSystemExtension = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#typeSystemExtension.
GraphQLListener.prototype.exitTypeSystemExtension = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#schemaDefinition.
GraphQLListener.prototype.enterSchemaDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#schemaDefinition.
GraphQLListener.prototype.exitSchemaDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#rootOperationTypeDefinition.
GraphQLListener.prototype.enterRootOperationTypeDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#rootOperationTypeDefinition.
GraphQLListener.prototype.exitRootOperationTypeDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#schemaExtension.
GraphQLListener.prototype.enterSchemaExtension = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#schemaExtension.
GraphQLListener.prototype.exitSchemaExtension = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#operationTypeDefinition.
GraphQLListener.prototype.enterOperationTypeDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#operationTypeDefinition.
GraphQLListener.prototype.exitOperationTypeDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#description.
GraphQLListener.prototype.enterDescription = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#description.
GraphQLListener.prototype.exitDescription = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#typeDefinition.
GraphQLListener.prototype.enterTypeDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#typeDefinition.
GraphQLListener.prototype.exitTypeDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#typeExtension.
GraphQLListener.prototype.enterTypeExtension = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#typeExtension.
GraphQLListener.prototype.exitTypeExtension = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#scalarTypeDefinition.
GraphQLListener.prototype.enterScalarTypeDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#scalarTypeDefinition.
GraphQLListener.prototype.exitScalarTypeDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#scalarTypeExtension.
GraphQLListener.prototype.enterScalarTypeExtension = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#scalarTypeExtension.
GraphQLListener.prototype.exitScalarTypeExtension = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#objectTypeDefinition.
GraphQLListener.prototype.enterObjectTypeDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#objectTypeDefinition.
GraphQLListener.prototype.exitObjectTypeDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#implementsInterfaces.
GraphQLListener.prototype.enterImplementsInterfaces = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#implementsInterfaces.
GraphQLListener.prototype.exitImplementsInterfaces = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#fieldsDefinition.
GraphQLListener.prototype.enterFieldsDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#fieldsDefinition.
GraphQLListener.prototype.exitFieldsDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#fieldDefinition.
GraphQLListener.prototype.enterFieldDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#fieldDefinition.
GraphQLListener.prototype.exitFieldDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#argumentsDefinition.
GraphQLListener.prototype.enterArgumentsDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#argumentsDefinition.
GraphQLListener.prototype.exitArgumentsDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#inputValueDefinition.
GraphQLListener.prototype.enterInputValueDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#inputValueDefinition.
GraphQLListener.prototype.exitInputValueDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#objectTypeExtension.
GraphQLListener.prototype.enterObjectTypeExtension = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#objectTypeExtension.
GraphQLListener.prototype.exitObjectTypeExtension = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#interfaceTypeDefinition.
GraphQLListener.prototype.enterInterfaceTypeDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#interfaceTypeDefinition.
GraphQLListener.prototype.exitInterfaceTypeDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#interfaceTypeExtension.
GraphQLListener.prototype.enterInterfaceTypeExtension = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#interfaceTypeExtension.
GraphQLListener.prototype.exitInterfaceTypeExtension = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#unionTypeDefinition.
GraphQLListener.prototype.enterUnionTypeDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#unionTypeDefinition.
GraphQLListener.prototype.exitUnionTypeDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#unionMemberTypes.
GraphQLListener.prototype.enterUnionMemberTypes = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#unionMemberTypes.
GraphQLListener.prototype.exitUnionMemberTypes = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#unionTypeExtension.
GraphQLListener.prototype.enterUnionTypeExtension = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#unionTypeExtension.
GraphQLListener.prototype.exitUnionTypeExtension = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#enumTypeDefinition.
GraphQLListener.prototype.enterEnumTypeDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#enumTypeDefinition.
GraphQLListener.prototype.exitEnumTypeDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#enumValuesDefinition.
GraphQLListener.prototype.enterEnumValuesDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#enumValuesDefinition.
GraphQLListener.prototype.exitEnumValuesDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#enumValueDefinition.
GraphQLListener.prototype.enterEnumValueDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#enumValueDefinition.
GraphQLListener.prototype.exitEnumValueDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#enumTypeExtension.
GraphQLListener.prototype.enterEnumTypeExtension = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#enumTypeExtension.
GraphQLListener.prototype.exitEnumTypeExtension = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#inputObjectTypeDefinition.
GraphQLListener.prototype.enterInputObjectTypeDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#inputObjectTypeDefinition.
GraphQLListener.prototype.exitInputObjectTypeDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#inputFieldsDefinition.
GraphQLListener.prototype.enterInputFieldsDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#inputFieldsDefinition.
GraphQLListener.prototype.exitInputFieldsDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#inputObjectTypeExtension.
GraphQLListener.prototype.enterInputObjectTypeExtension = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#inputObjectTypeExtension.
GraphQLListener.prototype.exitInputObjectTypeExtension = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#directiveDefinition.
GraphQLListener.prototype.enterDirectiveDefinition = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#directiveDefinition.
GraphQLListener.prototype.exitDirectiveDefinition = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#directiveLocations.
GraphQLListener.prototype.enterDirectiveLocations = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#directiveLocations.
GraphQLListener.prototype.exitDirectiveLocations = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#directiveLocation.
GraphQLListener.prototype.enterDirectiveLocation = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#directiveLocation.
GraphQLListener.prototype.exitDirectiveLocation = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#executableDirectiveLocation.
GraphQLListener.prototype.enterExecutableDirectiveLocation = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#executableDirectiveLocation.
GraphQLListener.prototype.exitExecutableDirectiveLocation = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#typeSystemDirectiveLocation.
GraphQLListener.prototype.enterTypeSystemDirectiveLocation = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#typeSystemDirectiveLocation.
GraphQLListener.prototype.exitTypeSystemDirectiveLocation = function(ctx) {};

// Enter a parse tree produced by GraphQLParser#name.
GraphQLListener.prototype.enterName = function(ctx) {};

// Exit a parse tree produced by GraphQLParser#name.
GraphQLListener.prototype.exitName = function(ctx) {};

exports.GraphQLListener = GraphQLListener;
