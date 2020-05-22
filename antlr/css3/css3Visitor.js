// Generated from /home/roman/Dokumente/Sources/plot-cv/lib/grammars/css3.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by css3Parser.

function css3Visitor() {
  antlr4.tree.ParseTreeVisitor.call(this);
  return this;
}

css3Visitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
css3Visitor.prototype.constructor = css3Visitor;

// Visit a parse tree produced by css3Parser#stylesheet.
css3Visitor.prototype.visitStylesheet = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#goodCharset.
css3Visitor.prototype.visitGoodCharset = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#badCharset.
css3Visitor.prototype.visitBadCharset = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#goodImport.
css3Visitor.prototype.visitGoodImport = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#badImport.
css3Visitor.prototype.visitBadImport = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#goodNamespace.
css3Visitor.prototype.visitGoodNamespace = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#badNamespace.
css3Visitor.prototype.visitBadNamespace = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#namespacePrefix.
css3Visitor.prototype.visitNamespacePrefix = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#media.
css3Visitor.prototype.visitMedia = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#mediaQueryList.
css3Visitor.prototype.visitMediaQueryList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#mediaQuery.
css3Visitor.prototype.visitMediaQuery = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#mediaType.
css3Visitor.prototype.visitMediaType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#mediaExpression.
css3Visitor.prototype.visitMediaExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#mediaFeature.
css3Visitor.prototype.visitMediaFeature = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#page.
css3Visitor.prototype.visitPage = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#pseudoPage.
css3Visitor.prototype.visitPseudoPage = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#selectorGroup.
css3Visitor.prototype.visitSelectorGroup = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#selector.
css3Visitor.prototype.visitSelector = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#combinator.
css3Visitor.prototype.visitCombinator = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#simpleSelectorSequence.
css3Visitor.prototype.visitSimpleSelectorSequence = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#typeSelector.
css3Visitor.prototype.visitTypeSelector = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#typeNamespacePrefix.
css3Visitor.prototype.visitTypeNamespacePrefix = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#elementName.
css3Visitor.prototype.visitElementName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#universal.
css3Visitor.prototype.visitUniversal = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#className.
css3Visitor.prototype.visitClassName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#attrib.
css3Visitor.prototype.visitAttrib = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#pseudo.
css3Visitor.prototype.visitPseudo = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#functionalPseudo.
css3Visitor.prototype.visitFunctionalPseudo = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#expression.
css3Visitor.prototype.visitExpression = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#negation.
css3Visitor.prototype.visitNegation = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#negationArg.
css3Visitor.prototype.visitNegationArg = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#goodOperator.
css3Visitor.prototype.visitGoodOperator = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#badOperator.
css3Visitor.prototype.visitBadOperator = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#goodProperty.
css3Visitor.prototype.visitGoodProperty = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#badProperty.
css3Visitor.prototype.visitBadProperty = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#knownRuleset.
css3Visitor.prototype.visitKnownRuleset = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#unknownRuleset.
css3Visitor.prototype.visitUnknownRuleset = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#declarationList.
css3Visitor.prototype.visitDeclarationList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#knownDeclaration.
css3Visitor.prototype.visitKnownDeclaration = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#unknownDeclaration.
css3Visitor.prototype.visitUnknownDeclaration = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#prio.
css3Visitor.prototype.visitPrio = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#value.
css3Visitor.prototype.visitValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#expr.
css3Visitor.prototype.visitExpr = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#knownTerm.
css3Visitor.prototype.visitKnownTerm = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#unknownTerm.
css3Visitor.prototype.visitUnknownTerm = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#badTerm.
css3Visitor.prototype.visitBadTerm = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#function.
css3Visitor.prototype.visitFunction = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#dxImageTransform.
css3Visitor.prototype.visitDxImageTransform = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#hexcolor.
css3Visitor.prototype.visitHexcolor = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#number.
css3Visitor.prototype.visitNumber = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#percentage.
css3Visitor.prototype.visitPercentage = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#dimension.
css3Visitor.prototype.visitDimension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#unknownDimension.
css3Visitor.prototype.visitUnknownDimension = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#any.
css3Visitor.prototype.visitAny = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#unknownAtRule.
css3Visitor.prototype.visitUnknownAtRule = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#atKeyword.
css3Visitor.prototype.visitAtKeyword = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#unused.
css3Visitor.prototype.visitUnused = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#block.
css3Visitor.prototype.visitBlock = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#nestedStatement.
css3Visitor.prototype.visitNestedStatement = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#groupRuleBody.
css3Visitor.prototype.visitGroupRuleBody = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#supportsRule.
css3Visitor.prototype.visitSupportsRule = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#supportsCondition.
css3Visitor.prototype.visitSupportsCondition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#supportsConditionInParens.
css3Visitor.prototype.visitSupportsConditionInParens = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#supportsNegation.
css3Visitor.prototype.visitSupportsNegation = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#supportsConjunction.
css3Visitor.prototype.visitSupportsConjunction = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#supportsDisjunction.
css3Visitor.prototype.visitSupportsDisjunction = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#supportsDeclarationCondition.
css3Visitor.prototype.visitSupportsDeclarationCondition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#generalEnclosed.
css3Visitor.prototype.visitGeneralEnclosed = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#var.
css3Visitor.prototype.visitVar = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#calc.
css3Visitor.prototype.visitCalc = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#calcSum.
css3Visitor.prototype.visitCalcSum = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#calcProduct.
css3Visitor.prototype.visitCalcProduct = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#calcValue.
css3Visitor.prototype.visitCalcValue = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#fontFaceRule.
css3Visitor.prototype.visitFontFaceRule = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#knownFontFaceDeclaration.
css3Visitor.prototype.visitKnownFontFaceDeclaration = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#unknownFontFaceDeclaration.
css3Visitor.prototype.visitUnknownFontFaceDeclaration = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#keyframesRule.
css3Visitor.prototype.visitKeyframesRule = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#keyframesBlocks.
css3Visitor.prototype.visitKeyframesBlocks = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#keyframeSelector.
css3Visitor.prototype.visitKeyframeSelector = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#viewport.
css3Visitor.prototype.visitViewport = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#counterStyle.
css3Visitor.prototype.visitCounterStyle = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#fontFeatureValuesRule.
css3Visitor.prototype.visitFontFeatureValuesRule = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#fontFamilyNameList.
css3Visitor.prototype.visitFontFamilyNameList = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#fontFamilyName.
css3Visitor.prototype.visitFontFamilyName = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#featureValueBlock.
css3Visitor.prototype.visitFeatureValueBlock = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#featureType.
css3Visitor.prototype.visitFeatureType = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#featureValueDefinition.
css3Visitor.prototype.visitFeatureValueDefinition = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#ident.
css3Visitor.prototype.visitIdent = function(ctx) {
  return this.visitChildren(ctx);
};

// Visit a parse tree produced by css3Parser#ws.
css3Visitor.prototype.visitWs = function(ctx) {
  return this.visitChildren(ctx);
};

exports.css3Visitor = css3Visitor;
