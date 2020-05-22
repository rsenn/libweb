// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/WebIDL.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by WebIDLParser.
function WebIDLListener() {
  antlr4.tree.ParseTreeListener.call(this);
  return this;
}

WebIDLListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
WebIDLListener.prototype.constructor = WebIDLListener;

// Enter a parse tree produced by WebIDLParser#webIDL.
WebIDLListener.prototype.enterWebIDL = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#webIDL.
WebIDLListener.prototype.exitWebIDL = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#definitions.
WebIDLListener.prototype.enterDefinitions = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#definitions.
WebIDLListener.prototype.exitDefinitions = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#definition.
WebIDLListener.prototype.enterDefinition = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#definition.
WebIDLListener.prototype.exitDefinition = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#callbackOrInterface.
WebIDLListener.prototype.enterCallbackOrInterface = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#callbackOrInterface.
WebIDLListener.prototype.exitCallbackOrInterface = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#callbackRestOrInterface.
WebIDLListener.prototype.enterCallbackRestOrInterface = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#callbackRestOrInterface.
WebIDLListener.prototype.exitCallbackRestOrInterface = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#interface_.
WebIDLListener.prototype.enterInterface_ = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#interface_.
WebIDLListener.prototype.exitInterface_ = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#class_.
WebIDLListener.prototype.enterClass_ = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#class_.
WebIDLListener.prototype.exitClass_ = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#partial.
WebIDLListener.prototype.enterPartial = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#partial.
WebIDLListener.prototype.exitPartial = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#partialDefinition.
WebIDLListener.prototype.enterPartialDefinition = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#partialDefinition.
WebIDLListener.prototype.exitPartialDefinition = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#partialInterface.
WebIDLListener.prototype.enterPartialInterface = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#partialInterface.
WebIDLListener.prototype.exitPartialInterface = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#interfaceMembers.
WebIDLListener.prototype.enterInterfaceMembers = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#interfaceMembers.
WebIDLListener.prototype.exitInterfaceMembers = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#interfaceMember.
WebIDLListener.prototype.enterInterfaceMember = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#interfaceMember.
WebIDLListener.prototype.exitInterfaceMember = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#dictionary.
WebIDLListener.prototype.enterDictionary = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#dictionary.
WebIDLListener.prototype.exitDictionary = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#dictionaryMembers.
WebIDLListener.prototype.enterDictionaryMembers = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#dictionaryMembers.
WebIDLListener.prototype.exitDictionaryMembers = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#dictionaryMember.
WebIDLListener.prototype.enterDictionaryMember = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#dictionaryMember.
WebIDLListener.prototype.exitDictionaryMember = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#required.
WebIDLListener.prototype.enterRequired = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#required.
WebIDLListener.prototype.exitRequired = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#partialDictionary.
WebIDLListener.prototype.enterPartialDictionary = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#partialDictionary.
WebIDLListener.prototype.exitPartialDictionary = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#default_.
WebIDLListener.prototype.enterDefault_ = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#default_.
WebIDLListener.prototype.exitDefault_ = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#defaultValue.
WebIDLListener.prototype.enterDefaultValue = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#defaultValue.
WebIDLListener.prototype.exitDefaultValue = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#inheritance.
WebIDLListener.prototype.enterInheritance = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#inheritance.
WebIDLListener.prototype.exitInheritance = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extension.
WebIDLListener.prototype.enterExtension = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extension.
WebIDLListener.prototype.exitExtension = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#enum_.
WebIDLListener.prototype.enterEnum_ = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#enum_.
WebIDLListener.prototype.exitEnum_ = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#enumValueList.
WebIDLListener.prototype.enterEnumValueList = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#enumValueList.
WebIDLListener.prototype.exitEnumValueList = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#enumValueListComma.
WebIDLListener.prototype.enterEnumValueListComma = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#enumValueListComma.
WebIDLListener.prototype.exitEnumValueListComma = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#enumValueListString.
WebIDLListener.prototype.enterEnumValueListString = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#enumValueListString.
WebIDLListener.prototype.exitEnumValueListString = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#callbackRest.
WebIDLListener.prototype.enterCallbackRest = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#callbackRest.
WebIDLListener.prototype.exitCallbackRest = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#typedef.
WebIDLListener.prototype.enterTypedef = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#typedef.
WebIDLListener.prototype.exitTypedef = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#implementsStatement.
WebIDLListener.prototype.enterImplementsStatement = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#implementsStatement.
WebIDLListener.prototype.exitImplementsStatement = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#const_.
WebIDLListener.prototype.enterConst_ = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#const_.
WebIDLListener.prototype.exitConst_ = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#constValue.
WebIDLListener.prototype.enterConstValue = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#constValue.
WebIDLListener.prototype.exitConstValue = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#booleanLiteral.
WebIDLListener.prototype.enterBooleanLiteral = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#booleanLiteral.
WebIDLListener.prototype.exitBooleanLiteral = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#floatLiteral.
WebIDLListener.prototype.enterFloatLiteral = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#floatLiteral.
WebIDLListener.prototype.exitFloatLiteral = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#serializer.
WebIDLListener.prototype.enterSerializer = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#serializer.
WebIDLListener.prototype.exitSerializer = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#serializerRest.
WebIDLListener.prototype.enterSerializerRest = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#serializerRest.
WebIDLListener.prototype.exitSerializerRest = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#serializationPattern.
WebIDLListener.prototype.enterSerializationPattern = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#serializationPattern.
WebIDLListener.prototype.exitSerializationPattern = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#serializationPatternMap.
WebIDLListener.prototype.enterSerializationPatternMap = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#serializationPatternMap.
WebIDLListener.prototype.exitSerializationPatternMap = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#serializationPatternList.
WebIDLListener.prototype.enterSerializationPatternList = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#serializationPatternList.
WebIDLListener.prototype.exitSerializationPatternList = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#stringifier.
WebIDLListener.prototype.enterStringifier = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#stringifier.
WebIDLListener.prototype.exitStringifier = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#stringifierRest.
WebIDLListener.prototype.enterStringifierRest = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#stringifierRest.
WebIDLListener.prototype.exitStringifierRest = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#staticMember.
WebIDLListener.prototype.enterStaticMember = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#staticMember.
WebIDLListener.prototype.exitStaticMember = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#staticMemberRest.
WebIDLListener.prototype.enterStaticMemberRest = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#staticMemberRest.
WebIDLListener.prototype.exitStaticMemberRest = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#readonlyMember.
WebIDLListener.prototype.enterReadonlyMember = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#readonlyMember.
WebIDLListener.prototype.exitReadonlyMember = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#readonlyMemberRest.
WebIDLListener.prototype.enterReadonlyMemberRest = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#readonlyMemberRest.
WebIDLListener.prototype.exitReadonlyMemberRest = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#readWriteAttribute.
WebIDLListener.prototype.enterReadWriteAttribute = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#readWriteAttribute.
WebIDLListener.prototype.exitReadWriteAttribute = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#attributeRest.
WebIDLListener.prototype.enterAttributeRest = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#attributeRest.
WebIDLListener.prototype.exitAttributeRest = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#attributeName.
WebIDLListener.prototype.enterAttributeName = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#attributeName.
WebIDLListener.prototype.exitAttributeName = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#attributeNameKeyword.
WebIDLListener.prototype.enterAttributeNameKeyword = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#attributeNameKeyword.
WebIDLListener.prototype.exitAttributeNameKeyword = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#inherit.
WebIDLListener.prototype.enterInherit = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#inherit.
WebIDLListener.prototype.exitInherit = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#readOnly.
WebIDLListener.prototype.enterReadOnly = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#readOnly.
WebIDLListener.prototype.exitReadOnly = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#operation.
WebIDLListener.prototype.enterOperation = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#operation.
WebIDLListener.prototype.exitOperation = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#specialOperation.
WebIDLListener.prototype.enterSpecialOperation = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#specialOperation.
WebIDLListener.prototype.exitSpecialOperation = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#specials.
WebIDLListener.prototype.enterSpecials = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#specials.
WebIDLListener.prototype.exitSpecials = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#special.
WebIDLListener.prototype.enterSpecial = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#special.
WebIDLListener.prototype.exitSpecial = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#operationRest.
WebIDLListener.prototype.enterOperationRest = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#operationRest.
WebIDLListener.prototype.exitOperationRest = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#optionalIdentifier.
WebIDLListener.prototype.enterOptionalIdentifier = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#optionalIdentifier.
WebIDLListener.prototype.exitOptionalIdentifier = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#argumentList.
WebIDLListener.prototype.enterArgumentList = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#argumentList.
WebIDLListener.prototype.exitArgumentList = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#arguments.
WebIDLListener.prototype.enterArguments = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#arguments.
WebIDLListener.prototype.exitArguments = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#argument.
WebIDLListener.prototype.enterArgument = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#argument.
WebIDLListener.prototype.exitArgument = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#optionalOrRequiredArgument.
WebIDLListener.prototype.enterOptionalOrRequiredArgument = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#optionalOrRequiredArgument.
WebIDLListener.prototype.exitOptionalOrRequiredArgument = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#argumentName.
WebIDLListener.prototype.enterArgumentName = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#argumentName.
WebIDLListener.prototype.exitArgumentName = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#ellipsis.
WebIDLListener.prototype.enterEllipsis = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#ellipsis.
WebIDLListener.prototype.exitEllipsis = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#iterable.
WebIDLListener.prototype.enterIterable = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#iterable.
WebIDLListener.prototype.exitIterable = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#optionalType.
WebIDLListener.prototype.enterOptionalType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#optionalType.
WebIDLListener.prototype.exitOptionalType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#readWriteMaplike.
WebIDLListener.prototype.enterReadWriteMaplike = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#readWriteMaplike.
WebIDLListener.prototype.exitReadWriteMaplike = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#readWriteSetlike.
WebIDLListener.prototype.enterReadWriteSetlike = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#readWriteSetlike.
WebIDLListener.prototype.exitReadWriteSetlike = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#maplikeRest.
WebIDLListener.prototype.enterMaplikeRest = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#maplikeRest.
WebIDLListener.prototype.exitMaplikeRest = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#setlikeRest.
WebIDLListener.prototype.enterSetlikeRest = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#setlikeRest.
WebIDLListener.prototype.exitSetlikeRest = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extendedAttributeList.
WebIDLListener.prototype.enterExtendedAttributeList = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extendedAttributeList.
WebIDLListener.prototype.exitExtendedAttributeList = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extendedAttributes.
WebIDLListener.prototype.enterExtendedAttributes = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extendedAttributes.
WebIDLListener.prototype.exitExtendedAttributes = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extendedAttribute.
WebIDLListener.prototype.enterExtendedAttribute = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extendedAttribute.
WebIDLListener.prototype.exitExtendedAttribute = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extendedAttributeRest.
WebIDLListener.prototype.enterExtendedAttributeRest = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extendedAttributeRest.
WebIDLListener.prototype.exitExtendedAttributeRest = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extendedAttributeInner.
WebIDLListener.prototype.enterExtendedAttributeInner = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extendedAttributeInner.
WebIDLListener.prototype.exitExtendedAttributeInner = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#other.
WebIDLListener.prototype.enterOther = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#other.
WebIDLListener.prototype.exitOther = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#argumentNameKeyword.
WebIDLListener.prototype.enterArgumentNameKeyword = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#argumentNameKeyword.
WebIDLListener.prototype.exitArgumentNameKeyword = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#otherOrComma.
WebIDLListener.prototype.enterOtherOrComma = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#otherOrComma.
WebIDLListener.prototype.exitOtherOrComma = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#type.
WebIDLListener.prototype.enterType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#type.
WebIDLListener.prototype.exitType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#singleType.
WebIDLListener.prototype.enterSingleType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#singleType.
WebIDLListener.prototype.exitSingleType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#unionType.
WebIDLListener.prototype.enterUnionType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#unionType.
WebIDLListener.prototype.exitUnionType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#unionMemberType.
WebIDLListener.prototype.enterUnionMemberType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#unionMemberType.
WebIDLListener.prototype.exitUnionMemberType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#unionMemberTypes.
WebIDLListener.prototype.enterUnionMemberTypes = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#unionMemberTypes.
WebIDLListener.prototype.exitUnionMemberTypes = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#nonAnyType.
WebIDLListener.prototype.enterNonAnyType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#nonAnyType.
WebIDLListener.prototype.exitNonAnyType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#bufferRelatedType.
WebIDLListener.prototype.enterBufferRelatedType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#bufferRelatedType.
WebIDLListener.prototype.exitBufferRelatedType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#constType.
WebIDLListener.prototype.enterConstType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#constType.
WebIDLListener.prototype.exitConstType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#primitiveType.
WebIDLListener.prototype.enterPrimitiveType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#primitiveType.
WebIDLListener.prototype.exitPrimitiveType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#unrestrictedFloatType.
WebIDLListener.prototype.enterUnrestrictedFloatType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#unrestrictedFloatType.
WebIDLListener.prototype.exitUnrestrictedFloatType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#floatType.
WebIDLListener.prototype.enterFloatType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#floatType.
WebIDLListener.prototype.exitFloatType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#unsignedIntegerType.
WebIDLListener.prototype.enterUnsignedIntegerType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#unsignedIntegerType.
WebIDLListener.prototype.exitUnsignedIntegerType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#integerType.
WebIDLListener.prototype.enterIntegerType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#integerType.
WebIDLListener.prototype.exitIntegerType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#optionalLong.
WebIDLListener.prototype.enterOptionalLong = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#optionalLong.
WebIDLListener.prototype.exitOptionalLong = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#promiseType.
WebIDLListener.prototype.enterPromiseType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#promiseType.
WebIDLListener.prototype.exitPromiseType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#null_.
WebIDLListener.prototype.enterNull_ = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#null_.
WebIDLListener.prototype.exitNull_ = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#returnType.
WebIDLListener.prototype.enterReturnType = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#returnType.
WebIDLListener.prototype.exitReturnType = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#identifierList.
WebIDLListener.prototype.enterIdentifierList = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#identifierList.
WebIDLListener.prototype.exitIdentifierList = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#identifiers.
WebIDLListener.prototype.enterIdentifiers = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#identifiers.
WebIDLListener.prototype.exitIdentifiers = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extendedAttributeNoArgs.
WebIDLListener.prototype.enterExtendedAttributeNoArgs = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extendedAttributeNoArgs.
WebIDLListener.prototype.exitExtendedAttributeNoArgs = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extendedAttributeArgList.
WebIDLListener.prototype.enterExtendedAttributeArgList = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extendedAttributeArgList.
WebIDLListener.prototype.exitExtendedAttributeArgList = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extendedAttributeIdent.
WebIDLListener.prototype.enterExtendedAttributeIdent = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extendedAttributeIdent.
WebIDLListener.prototype.exitExtendedAttributeIdent = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extendedAttributeIdentList.
WebIDLListener.prototype.enterExtendedAttributeIdentList = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extendedAttributeIdentList.
WebIDLListener.prototype.exitExtendedAttributeIdentList = function(ctx) {};

// Enter a parse tree produced by WebIDLParser#extendedAttributeNamedArgList.
WebIDLListener.prototype.enterExtendedAttributeNamedArgList = function(ctx) {};

// Exit a parse tree produced by WebIDLParser#extendedAttributeNamedArgList.
WebIDLListener.prototype.exitExtendedAttributeNamedArgList = function(ctx) {};

exports.WebIDLListener = WebIDLListener;
