// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/WebIDL.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by WebIDLParser.

function WebIDLVisitor() {
  antlr4.tree.ParseTreeVisitor.call(this);
  return this;
}

WebIDLVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
WebIDLVisitor.prototype.constructor = WebIDLVisitor;

// Visit a parse tree produced by WebIDLParser#webIDL.
WebIDLVisitor.prototype.visitWebIDL = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#definitions.
WebIDLVisitor.prototype.visitDefinitions = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#definition.
WebIDLVisitor.prototype.visitDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#callbackOrInterface.
WebIDLVisitor.prototype.visitCallbackOrInterface = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#callbackRestOrInterface.
WebIDLVisitor.prototype.visitCallbackRestOrInterface = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#interface_.
WebIDLVisitor.prototype.visitInterface_ = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#class_.
WebIDLVisitor.prototype.visitClass_ = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#partial.
WebIDLVisitor.prototype.visitPartial = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#partialDefinition.
WebIDLVisitor.prototype.visitPartialDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#partialInterface.
WebIDLVisitor.prototype.visitPartialInterface = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#interfaceMembers.
WebIDLVisitor.prototype.visitInterfaceMembers = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#interfaceMember.
WebIDLVisitor.prototype.visitInterfaceMember = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#dictionary.
WebIDLVisitor.prototype.visitDictionary = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#dictionaryMembers.
WebIDLVisitor.prototype.visitDictionaryMembers = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#dictionaryMember.
WebIDLVisitor.prototype.visitDictionaryMember = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#required.
WebIDLVisitor.prototype.visitRequired = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#partialDictionary.
WebIDLVisitor.prototype.visitPartialDictionary = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#default_.
WebIDLVisitor.prototype.visitDefault_ = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#defaultValue.
WebIDLVisitor.prototype.visitDefaultValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#inheritance.
WebIDLVisitor.prototype.visitInheritance = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extension.
WebIDLVisitor.prototype.visitExtension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#enum_.
WebIDLVisitor.prototype.visitEnum_ = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#enumValueList.
WebIDLVisitor.prototype.visitEnumValueList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#enumValueListComma.
WebIDLVisitor.prototype.visitEnumValueListComma = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#enumValueListString.
WebIDLVisitor.prototype.visitEnumValueListString = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#callbackRest.
WebIDLVisitor.prototype.visitCallbackRest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#typedef.
WebIDLVisitor.prototype.visitTypedef = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#implementsStatement.
WebIDLVisitor.prototype.visitImplementsStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#const_.
WebIDLVisitor.prototype.visitConst_ = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#constValue.
WebIDLVisitor.prototype.visitConstValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#booleanLiteral.
WebIDLVisitor.prototype.visitBooleanLiteral = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#floatLiteral.
WebIDLVisitor.prototype.visitFloatLiteral = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#serializer.
WebIDLVisitor.prototype.visitSerializer = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#serializerRest.
WebIDLVisitor.prototype.visitSerializerRest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#serializationPattern.
WebIDLVisitor.prototype.visitSerializationPattern = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#serializationPatternMap.
WebIDLVisitor.prototype.visitSerializationPatternMap = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#serializationPatternList.
WebIDLVisitor.prototype.visitSerializationPatternList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#stringifier.
WebIDLVisitor.prototype.visitStringifier = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#stringifierRest.
WebIDLVisitor.prototype.visitStringifierRest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#staticMember.
WebIDLVisitor.prototype.visitStaticMember = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#staticMemberRest.
WebIDLVisitor.prototype.visitStaticMemberRest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#readonlyMember.
WebIDLVisitor.prototype.visitReadonlyMember = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#readonlyMemberRest.
WebIDLVisitor.prototype.visitReadonlyMemberRest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#readWriteAttribute.
WebIDLVisitor.prototype.visitReadWriteAttribute = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#attributeRest.
WebIDLVisitor.prototype.visitAttributeRest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#attributeName.
WebIDLVisitor.prototype.visitAttributeName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#attributeNameKeyword.
WebIDLVisitor.prototype.visitAttributeNameKeyword = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#inherit.
WebIDLVisitor.prototype.visitInherit = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#readOnly.
WebIDLVisitor.prototype.visitReadOnly = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#operation.
WebIDLVisitor.prototype.visitOperation = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#specialOperation.
WebIDLVisitor.prototype.visitSpecialOperation = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#specials.
WebIDLVisitor.prototype.visitSpecials = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#special.
WebIDLVisitor.prototype.visitSpecial = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#operationRest.
WebIDLVisitor.prototype.visitOperationRest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#optionalIdentifier.
WebIDLVisitor.prototype.visitOptionalIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#argumentList.
WebIDLVisitor.prototype.visitArgumentList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#arguments.
WebIDLVisitor.prototype.visitArguments = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#argument.
WebIDLVisitor.prototype.visitArgument = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#optionalOrRequiredArgument.
WebIDLVisitor.prototype.visitOptionalOrRequiredArgument = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#argumentName.
WebIDLVisitor.prototype.visitArgumentName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#ellipsis.
WebIDLVisitor.prototype.visitEllipsis = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#iterable.
WebIDLVisitor.prototype.visitIterable = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#optionalType.
WebIDLVisitor.prototype.visitOptionalType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#readWriteMaplike.
WebIDLVisitor.prototype.visitReadWriteMaplike = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#readWriteSetlike.
WebIDLVisitor.prototype.visitReadWriteSetlike = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#maplikeRest.
WebIDLVisitor.prototype.visitMaplikeRest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#setlikeRest.
WebIDLVisitor.prototype.visitSetlikeRest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extendedAttributeList.
WebIDLVisitor.prototype.visitExtendedAttributeList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extendedAttributes.
WebIDLVisitor.prototype.visitExtendedAttributes = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extendedAttribute.
WebIDLVisitor.prototype.visitExtendedAttribute = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extendedAttributeRest.
WebIDLVisitor.prototype.visitExtendedAttributeRest = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extendedAttributeInner.
WebIDLVisitor.prototype.visitExtendedAttributeInner = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#other.
WebIDLVisitor.prototype.visitOther = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#argumentNameKeyword.
WebIDLVisitor.prototype.visitArgumentNameKeyword = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#otherOrComma.
WebIDLVisitor.prototype.visitOtherOrComma = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#type.
WebIDLVisitor.prototype.visitType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#singleType.
WebIDLVisitor.prototype.visitSingleType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#unionType.
WebIDLVisitor.prototype.visitUnionType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#unionMemberType.
WebIDLVisitor.prototype.visitUnionMemberType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#unionMemberTypes.
WebIDLVisitor.prototype.visitUnionMemberTypes = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#nonAnyType.
WebIDLVisitor.prototype.visitNonAnyType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#bufferRelatedType.
WebIDLVisitor.prototype.visitBufferRelatedType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#constType.
WebIDLVisitor.prototype.visitConstType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#primitiveType.
WebIDLVisitor.prototype.visitPrimitiveType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#unrestrictedFloatType.
WebIDLVisitor.prototype.visitUnrestrictedFloatType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#floatType.
WebIDLVisitor.prototype.visitFloatType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#unsignedIntegerType.
WebIDLVisitor.prototype.visitUnsignedIntegerType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#integerType.
WebIDLVisitor.prototype.visitIntegerType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#optionalLong.
WebIDLVisitor.prototype.visitOptionalLong = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#promiseType.
WebIDLVisitor.prototype.visitPromiseType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#null_.
WebIDLVisitor.prototype.visitNull_ = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#returnType.
WebIDLVisitor.prototype.visitReturnType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#identifierList.
WebIDLVisitor.prototype.visitIdentifierList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#identifiers.
WebIDLVisitor.prototype.visitIdentifiers = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extendedAttributeNoArgs.
WebIDLVisitor.prototype.visitExtendedAttributeNoArgs = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extendedAttributeArgList.
WebIDLVisitor.prototype.visitExtendedAttributeArgList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extendedAttributeIdent.
WebIDLVisitor.prototype.visitExtendedAttributeIdent = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extendedAttributeIdentList.
WebIDLVisitor.prototype.visitExtendedAttributeIdentList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by WebIDLParser#extendedAttributeNamedArgList.
WebIDLVisitor.prototype.visitExtendedAttributeNamedArgList = function(ctx) {
  return this.visitChildren(ctx);
};

exports.WebIDLVisitor = WebIDLVisitor;
