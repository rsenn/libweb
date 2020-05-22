// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/css3.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by css3Parser.
function css3Listener() {
  antlr4.tree.ParseTreeListener.call(this);
  return this;
}

css3Listener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
css3Listener.prototype.constructor = css3Listener;

// Enter a parse tree produced by css3Parser#stylesheet.
css3Listener.prototype.enterStylesheet = function(ctx) {};

// Exit a parse tree produced by css3Parser#stylesheet.
css3Listener.prototype.exitStylesheet = function(ctx) {};

// Enter a parse tree produced by css3Parser#goodCharset.
css3Listener.prototype.enterGoodCharset = function(ctx) {};

// Exit a parse tree produced by css3Parser#goodCharset.
css3Listener.prototype.exitGoodCharset = function(ctx) {};

// Enter a parse tree produced by css3Parser#badCharset.
css3Listener.prototype.enterBadCharset = function(ctx) {};

// Exit a parse tree produced by css3Parser#badCharset.
css3Listener.prototype.exitBadCharset = function(ctx) {};

// Enter a parse tree produced by css3Parser#goodImport.
css3Listener.prototype.enterGoodImport = function(ctx) {};

// Exit a parse tree produced by css3Parser#goodImport.
css3Listener.prototype.exitGoodImport = function(ctx) {};

// Enter a parse tree produced by css3Parser#badImport.
css3Listener.prototype.enterBadImport = function(ctx) {};

// Exit a parse tree produced by css3Parser#badImport.
css3Listener.prototype.exitBadImport = function(ctx) {};

// Enter a parse tree produced by css3Parser#goodNamespace.
css3Listener.prototype.enterGoodNamespace = function(ctx) {};

// Exit a parse tree produced by css3Parser#goodNamespace.
css3Listener.prototype.exitGoodNamespace = function(ctx) {};

// Enter a parse tree produced by css3Parser#badNamespace.
css3Listener.prototype.enterBadNamespace = function(ctx) {};

// Exit a parse tree produced by css3Parser#badNamespace.
css3Listener.prototype.exitBadNamespace = function(ctx) {};

// Enter a parse tree produced by css3Parser#namespacePrefix.
css3Listener.prototype.enterNamespacePrefix = function(ctx) {};

// Exit a parse tree produced by css3Parser#namespacePrefix.
css3Listener.prototype.exitNamespacePrefix = function(ctx) {};

// Enter a parse tree produced by css3Parser#media.
css3Listener.prototype.enterMedia = function(ctx) {};

// Exit a parse tree produced by css3Parser#media.
css3Listener.prototype.exitMedia = function(ctx) {};

// Enter a parse tree produced by css3Parser#mediaQueryList.
css3Listener.prototype.enterMediaQueryList = function(ctx) {};

// Exit a parse tree produced by css3Parser#mediaQueryList.
css3Listener.prototype.exitMediaQueryList = function(ctx) {};

// Enter a parse tree produced by css3Parser#mediaQuery.
css3Listener.prototype.enterMediaQuery = function(ctx) {};

// Exit a parse tree produced by css3Parser#mediaQuery.
css3Listener.prototype.exitMediaQuery = function(ctx) {};

// Enter a parse tree produced by css3Parser#mediaType.
css3Listener.prototype.enterMediaType = function(ctx) {};

// Exit a parse tree produced by css3Parser#mediaType.
css3Listener.prototype.exitMediaType = function(ctx) {};

// Enter a parse tree produced by css3Parser#mediaExpression.
css3Listener.prototype.enterMediaExpression = function(ctx) {};

// Exit a parse tree produced by css3Parser#mediaExpression.
css3Listener.prototype.exitMediaExpression = function(ctx) {};

// Enter a parse tree produced by css3Parser#mediaFeature.
css3Listener.prototype.enterMediaFeature = function(ctx) {};

// Exit a parse tree produced by css3Parser#mediaFeature.
css3Listener.prototype.exitMediaFeature = function(ctx) {};

// Enter a parse tree produced by css3Parser#page.
css3Listener.prototype.enterPage = function(ctx) {};

// Exit a parse tree produced by css3Parser#page.
css3Listener.prototype.exitPage = function(ctx) {};

// Enter a parse tree produced by css3Parser#pseudoPage.
css3Listener.prototype.enterPseudoPage = function(ctx) {};

// Exit a parse tree produced by css3Parser#pseudoPage.
css3Listener.prototype.exitPseudoPage = function(ctx) {};

// Enter a parse tree produced by css3Parser#selectorGroup.
css3Listener.prototype.enterSelectorGroup = function(ctx) {};

// Exit a parse tree produced by css3Parser#selectorGroup.
css3Listener.prototype.exitSelectorGroup = function(ctx) {};

// Enter a parse tree produced by css3Parser#selector.
css3Listener.prototype.enterSelector = function(ctx) {};

// Exit a parse tree produced by css3Parser#selector.
css3Listener.prototype.exitSelector = function(ctx) {};

// Enter a parse tree produced by css3Parser#combinator.
css3Listener.prototype.enterCombinator = function(ctx) {};

// Exit a parse tree produced by css3Parser#combinator.
css3Listener.prototype.exitCombinator = function(ctx) {};

// Enter a parse tree produced by css3Parser#simpleSelectorSequence.
css3Listener.prototype.enterSimpleSelectorSequence = function(ctx) {};

// Exit a parse tree produced by css3Parser#simpleSelectorSequence.
css3Listener.prototype.exitSimpleSelectorSequence = function(ctx) {};

// Enter a parse tree produced by css3Parser#typeSelector.
css3Listener.prototype.enterTypeSelector = function(ctx) {};

// Exit a parse tree produced by css3Parser#typeSelector.
css3Listener.prototype.exitTypeSelector = function(ctx) {};

// Enter a parse tree produced by css3Parser#typeNamespacePrefix.
css3Listener.prototype.enterTypeNamespacePrefix = function(ctx) {};

// Exit a parse tree produced by css3Parser#typeNamespacePrefix.
css3Listener.prototype.exitTypeNamespacePrefix = function(ctx) {};

// Enter a parse tree produced by css3Parser#elementName.
css3Listener.prototype.enterElementName = function(ctx) {};

// Exit a parse tree produced by css3Parser#elementName.
css3Listener.prototype.exitElementName = function(ctx) {};

// Enter a parse tree produced by css3Parser#universal.
css3Listener.prototype.enterUniversal = function(ctx) {};

// Exit a parse tree produced by css3Parser#universal.
css3Listener.prototype.exitUniversal = function(ctx) {};

// Enter a parse tree produced by css3Parser#className.
css3Listener.prototype.enterClassName = function(ctx) {};

// Exit a parse tree produced by css3Parser#className.
css3Listener.prototype.exitClassName = function(ctx) {};

// Enter a parse tree produced by css3Parser#attrib.
css3Listener.prototype.enterAttrib = function(ctx) {};

// Exit a parse tree produced by css3Parser#attrib.
css3Listener.prototype.exitAttrib = function(ctx) {};

// Enter a parse tree produced by css3Parser#pseudo.
css3Listener.prototype.enterPseudo = function(ctx) {};

// Exit a parse tree produced by css3Parser#pseudo.
css3Listener.prototype.exitPseudo = function(ctx) {};

// Enter a parse tree produced by css3Parser#functionalPseudo.
css3Listener.prototype.enterFunctionalPseudo = function(ctx) {};

// Exit a parse tree produced by css3Parser#functionalPseudo.
css3Listener.prototype.exitFunctionalPseudo = function(ctx) {};

// Enter a parse tree produced by css3Parser#expression.
css3Listener.prototype.enterExpression = function(ctx) {};

// Exit a parse tree produced by css3Parser#expression.
css3Listener.prototype.exitExpression = function(ctx) {};

// Enter a parse tree produced by css3Parser#negation.
css3Listener.prototype.enterNegation = function(ctx) {};

// Exit a parse tree produced by css3Parser#negation.
css3Listener.prototype.exitNegation = function(ctx) {};

// Enter a parse tree produced by css3Parser#negationArg.
css3Listener.prototype.enterNegationArg = function(ctx) {};

// Exit a parse tree produced by css3Parser#negationArg.
css3Listener.prototype.exitNegationArg = function(ctx) {};

// Enter a parse tree produced by css3Parser#goodOperator.
css3Listener.prototype.enterGoodOperator = function(ctx) {};

// Exit a parse tree produced by css3Parser#goodOperator.
css3Listener.prototype.exitGoodOperator = function(ctx) {};

// Enter a parse tree produced by css3Parser#badOperator.
css3Listener.prototype.enterBadOperator = function(ctx) {};

// Exit a parse tree produced by css3Parser#badOperator.
css3Listener.prototype.exitBadOperator = function(ctx) {};

// Enter a parse tree produced by css3Parser#goodProperty.
css3Listener.prototype.enterGoodProperty = function(ctx) {};

// Exit a parse tree produced by css3Parser#goodProperty.
css3Listener.prototype.exitGoodProperty = function(ctx) {};

// Enter a parse tree produced by css3Parser#badProperty.
css3Listener.prototype.enterBadProperty = function(ctx) {};

// Exit a parse tree produced by css3Parser#badProperty.
css3Listener.prototype.exitBadProperty = function(ctx) {};

// Enter a parse tree produced by css3Parser#knownRuleset.
css3Listener.prototype.enterKnownRuleset = function(ctx) {};

// Exit a parse tree produced by css3Parser#knownRuleset.
css3Listener.prototype.exitKnownRuleset = function(ctx) {};

// Enter a parse tree produced by css3Parser#unknownRuleset.
css3Listener.prototype.enterUnknownRuleset = function(ctx) {};

// Exit a parse tree produced by css3Parser#unknownRuleset.
css3Listener.prototype.exitUnknownRuleset = function(ctx) {};

// Enter a parse tree produced by css3Parser#declarationList.
css3Listener.prototype.enterDeclarationList = function(ctx) {};

// Exit a parse tree produced by css3Parser#declarationList.
css3Listener.prototype.exitDeclarationList = function(ctx) {};

// Enter a parse tree produced by css3Parser#knownDeclaration.
css3Listener.prototype.enterKnownDeclaration = function(ctx) {};

// Exit a parse tree produced by css3Parser#knownDeclaration.
css3Listener.prototype.exitKnownDeclaration = function(ctx) {};

// Enter a parse tree produced by css3Parser#unknownDeclaration.
css3Listener.prototype.enterUnknownDeclaration = function(ctx) {};

// Exit a parse tree produced by css3Parser#unknownDeclaration.
css3Listener.prototype.exitUnknownDeclaration = function(ctx) {};

// Enter a parse tree produced by css3Parser#prio.
css3Listener.prototype.enterPrio = function(ctx) {};

// Exit a parse tree produced by css3Parser#prio.
css3Listener.prototype.exitPrio = function(ctx) {};

// Enter a parse tree produced by css3Parser#value.
css3Listener.prototype.enterValue = function(ctx) {};

// Exit a parse tree produced by css3Parser#value.
css3Listener.prototype.exitValue = function(ctx) {};

// Enter a parse tree produced by css3Parser#expr.
css3Listener.prototype.enterExpr = function(ctx) {};

// Exit a parse tree produced by css3Parser#expr.
css3Listener.prototype.exitExpr = function(ctx) {};

// Enter a parse tree produced by css3Parser#knownTerm.
css3Listener.prototype.enterKnownTerm = function(ctx) {};

// Exit a parse tree produced by css3Parser#knownTerm.
css3Listener.prototype.exitKnownTerm = function(ctx) {};

// Enter a parse tree produced by css3Parser#unknownTerm.
css3Listener.prototype.enterUnknownTerm = function(ctx) {};

// Exit a parse tree produced by css3Parser#unknownTerm.
css3Listener.prototype.exitUnknownTerm = function(ctx) {};

// Enter a parse tree produced by css3Parser#badTerm.
css3Listener.prototype.enterBadTerm = function(ctx) {};

// Exit a parse tree produced by css3Parser#badTerm.
css3Listener.prototype.exitBadTerm = function(ctx) {};

// Enter a parse tree produced by css3Parser#function.
css3Listener.prototype.enterFunction = function(ctx) {};

// Exit a parse tree produced by css3Parser#function.
css3Listener.prototype.exitFunction = function(ctx) {};

// Enter a parse tree produced by css3Parser#dxImageTransform.
css3Listener.prototype.enterDxImageTransform = function(ctx) {};

// Exit a parse tree produced by css3Parser#dxImageTransform.
css3Listener.prototype.exitDxImageTransform = function(ctx) {};

// Enter a parse tree produced by css3Parser#hexcolor.
css3Listener.prototype.enterHexcolor = function(ctx) {};

// Exit a parse tree produced by css3Parser#hexcolor.
css3Listener.prototype.exitHexcolor = function(ctx) {};

// Enter a parse tree produced by css3Parser#number.
css3Listener.prototype.enterNumber = function(ctx) {};

// Exit a parse tree produced by css3Parser#number.
css3Listener.prototype.exitNumber = function(ctx) {};

// Enter a parse tree produced by css3Parser#percentage.
css3Listener.prototype.enterPercentage = function(ctx) {};

// Exit a parse tree produced by css3Parser#percentage.
css3Listener.prototype.exitPercentage = function(ctx) {};

// Enter a parse tree produced by css3Parser#dimension.
css3Listener.prototype.enterDimension = function(ctx) {};

// Exit a parse tree produced by css3Parser#dimension.
css3Listener.prototype.exitDimension = function(ctx) {};

// Enter a parse tree produced by css3Parser#unknownDimension.
css3Listener.prototype.enterUnknownDimension = function(ctx) {};

// Exit a parse tree produced by css3Parser#unknownDimension.
css3Listener.prototype.exitUnknownDimension = function(ctx) {};

// Enter a parse tree produced by css3Parser#any.
css3Listener.prototype.enterAny = function(ctx) {};

// Exit a parse tree produced by css3Parser#any.
css3Listener.prototype.exitAny = function(ctx) {};

// Enter a parse tree produced by css3Parser#unknownAtRule.
css3Listener.prototype.enterUnknownAtRule = function(ctx) {};

// Exit a parse tree produced by css3Parser#unknownAtRule.
css3Listener.prototype.exitUnknownAtRule = function(ctx) {};

// Enter a parse tree produced by css3Parser#atKeyword.
css3Listener.prototype.enterAtKeyword = function(ctx) {};

// Exit a parse tree produced by css3Parser#atKeyword.
css3Listener.prototype.exitAtKeyword = function(ctx) {};

// Enter a parse tree produced by css3Parser#unused.
css3Listener.prototype.enterUnused = function(ctx) {};

// Exit a parse tree produced by css3Parser#unused.
css3Listener.prototype.exitUnused = function(ctx) {};

// Enter a parse tree produced by css3Parser#block.
css3Listener.prototype.enterBlock = function(ctx) {};

// Exit a parse tree produced by css3Parser#block.
css3Listener.prototype.exitBlock = function(ctx) {};

// Enter a parse tree produced by css3Parser#nestedStatement.
css3Listener.prototype.enterNestedStatement = function(ctx) {};

// Exit a parse tree produced by css3Parser#nestedStatement.
css3Listener.prototype.exitNestedStatement = function(ctx) {};

// Enter a parse tree produced by css3Parser#groupRuleBody.
css3Listener.prototype.enterGroupRuleBody = function(ctx) {};

// Exit a parse tree produced by css3Parser#groupRuleBody.
css3Listener.prototype.exitGroupRuleBody = function(ctx) {};

// Enter a parse tree produced by css3Parser#supportsRule.
css3Listener.prototype.enterSupportsRule = function(ctx) {};

// Exit a parse tree produced by css3Parser#supportsRule.
css3Listener.prototype.exitSupportsRule = function(ctx) {};

// Enter a parse tree produced by css3Parser#supportsCondition.
css3Listener.prototype.enterSupportsCondition = function(ctx) {};

// Exit a parse tree produced by css3Parser#supportsCondition.
css3Listener.prototype.exitSupportsCondition = function(ctx) {};

// Enter a parse tree produced by css3Parser#supportsConditionInParens.
css3Listener.prototype.enterSupportsConditionInParens = function(ctx) {};

// Exit a parse tree produced by css3Parser#supportsConditionInParens.
css3Listener.prototype.exitSupportsConditionInParens = function(ctx) {};

// Enter a parse tree produced by css3Parser#supportsNegation.
css3Listener.prototype.enterSupportsNegation = function(ctx) {};

// Exit a parse tree produced by css3Parser#supportsNegation.
css3Listener.prototype.exitSupportsNegation = function(ctx) {};

// Enter a parse tree produced by css3Parser#supportsConjunction.
css3Listener.prototype.enterSupportsConjunction = function(ctx) {};

// Exit a parse tree produced by css3Parser#supportsConjunction.
css3Listener.prototype.exitSupportsConjunction = function(ctx) {};

// Enter a parse tree produced by css3Parser#supportsDisjunction.
css3Listener.prototype.enterSupportsDisjunction = function(ctx) {};

// Exit a parse tree produced by css3Parser#supportsDisjunction.
css3Listener.prototype.exitSupportsDisjunction = function(ctx) {};

// Enter a parse tree produced by css3Parser#supportsDeclarationCondition.
css3Listener.prototype.enterSupportsDeclarationCondition = function(ctx) {};

// Exit a parse tree produced by css3Parser#supportsDeclarationCondition.
css3Listener.prototype.exitSupportsDeclarationCondition = function(ctx) {};

// Enter a parse tree produced by css3Parser#generalEnclosed.
css3Listener.prototype.enterGeneralEnclosed = function(ctx) {};

// Exit a parse tree produced by css3Parser#generalEnclosed.
css3Listener.prototype.exitGeneralEnclosed = function(ctx) {};

// Enter a parse tree produced by css3Parser#var.
css3Listener.prototype.enterVar = function(ctx) {};

// Exit a parse tree produced by css3Parser#var.
css3Listener.prototype.exitVar = function(ctx) {};

// Enter a parse tree produced by css3Parser#calc.
css3Listener.prototype.enterCalc = function(ctx) {};

// Exit a parse tree produced by css3Parser#calc.
css3Listener.prototype.exitCalc = function(ctx) {};

// Enter a parse tree produced by css3Parser#calcSum.
css3Listener.prototype.enterCalcSum = function(ctx) {};

// Exit a parse tree produced by css3Parser#calcSum.
css3Listener.prototype.exitCalcSum = function(ctx) {};

// Enter a parse tree produced by css3Parser#calcProduct.
css3Listener.prototype.enterCalcProduct = function(ctx) {};

// Exit a parse tree produced by css3Parser#calcProduct.
css3Listener.prototype.exitCalcProduct = function(ctx) {};

// Enter a parse tree produced by css3Parser#calcValue.
css3Listener.prototype.enterCalcValue = function(ctx) {};

// Exit a parse tree produced by css3Parser#calcValue.
css3Listener.prototype.exitCalcValue = function(ctx) {};

// Enter a parse tree produced by css3Parser#fontFaceRule.
css3Listener.prototype.enterFontFaceRule = function(ctx) {};

// Exit a parse tree produced by css3Parser#fontFaceRule.
css3Listener.prototype.exitFontFaceRule = function(ctx) {};

// Enter a parse tree produced by css3Parser#knownFontFaceDeclaration.
css3Listener.prototype.enterKnownFontFaceDeclaration = function(ctx) {};

// Exit a parse tree produced by css3Parser#knownFontFaceDeclaration.
css3Listener.prototype.exitKnownFontFaceDeclaration = function(ctx) {};

// Enter a parse tree produced by css3Parser#unknownFontFaceDeclaration.
css3Listener.prototype.enterUnknownFontFaceDeclaration = function(ctx) {};

// Exit a parse tree produced by css3Parser#unknownFontFaceDeclaration.
css3Listener.prototype.exitUnknownFontFaceDeclaration = function(ctx) {};

// Enter a parse tree produced by css3Parser#keyframesRule.
css3Listener.prototype.enterKeyframesRule = function(ctx) {};

// Exit a parse tree produced by css3Parser#keyframesRule.
css3Listener.prototype.exitKeyframesRule = function(ctx) {};

// Enter a parse tree produced by css3Parser#keyframesBlocks.
css3Listener.prototype.enterKeyframesBlocks = function(ctx) {};

// Exit a parse tree produced by css3Parser#keyframesBlocks.
css3Listener.prototype.exitKeyframesBlocks = function(ctx) {};

// Enter a parse tree produced by css3Parser#keyframeSelector.
css3Listener.prototype.enterKeyframeSelector = function(ctx) {};

// Exit a parse tree produced by css3Parser#keyframeSelector.
css3Listener.prototype.exitKeyframeSelector = function(ctx) {};

// Enter a parse tree produced by css3Parser#viewport.
css3Listener.prototype.enterViewport = function(ctx) {};

// Exit a parse tree produced by css3Parser#viewport.
css3Listener.prototype.exitViewport = function(ctx) {};

// Enter a parse tree produced by css3Parser#counterStyle.
css3Listener.prototype.enterCounterStyle = function(ctx) {};

// Exit a parse tree produced by css3Parser#counterStyle.
css3Listener.prototype.exitCounterStyle = function(ctx) {};

// Enter a parse tree produced by css3Parser#fontFeatureValuesRule.
css3Listener.prototype.enterFontFeatureValuesRule = function(ctx) {};

// Exit a parse tree produced by css3Parser#fontFeatureValuesRule.
css3Listener.prototype.exitFontFeatureValuesRule = function(ctx) {};

// Enter a parse tree produced by css3Parser#fontFamilyNameList.
css3Listener.prototype.enterFontFamilyNameList = function(ctx) {};

// Exit a parse tree produced by css3Parser#fontFamilyNameList.
css3Listener.prototype.exitFontFamilyNameList = function(ctx) {};

// Enter a parse tree produced by css3Parser#fontFamilyName.
css3Listener.prototype.enterFontFamilyName = function(ctx) {};

// Exit a parse tree produced by css3Parser#fontFamilyName.
css3Listener.prototype.exitFontFamilyName = function(ctx) {};

// Enter a parse tree produced by css3Parser#featureValueBlock.
css3Listener.prototype.enterFeatureValueBlock = function(ctx) {};

// Exit a parse tree produced by css3Parser#featureValueBlock.
css3Listener.prototype.exitFeatureValueBlock = function(ctx) {};

// Enter a parse tree produced by css3Parser#featureType.
css3Listener.prototype.enterFeatureType = function(ctx) {};

// Exit a parse tree produced by css3Parser#featureType.
css3Listener.prototype.exitFeatureType = function(ctx) {};

// Enter a parse tree produced by css3Parser#featureValueDefinition.
css3Listener.prototype.enterFeatureValueDefinition = function(ctx) {};

// Exit a parse tree produced by css3Parser#featureValueDefinition.
css3Listener.prototype.exitFeatureValueDefinition = function(ctx) {};

// Enter a parse tree produced by css3Parser#ident.
css3Listener.prototype.enterIdent = function(ctx) {};

// Exit a parse tree produced by css3Parser#ident.
css3Listener.prototype.exitIdent = function(ctx) {};

// Enter a parse tree produced by css3Parser#ws.
css3Listener.prototype.enterWs = function(ctx) {};

// Exit a parse tree produced by css3Parser#ws.
css3Listener.prototype.exitWs = function(ctx) {};

exports.css3Listener = css3Listener;
