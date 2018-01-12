import * as ts from "typescript"
import gql from "graphql-tag"
import astify, { InterpolationNode } from "./literal-to-ast"

const GRAPHQL_TAG_MODULE_REGEX = /^['"]graphql-tag['"]$/

function getVisitor(context: ts.TransformationContext): ts.Visitor {
  // `interpolations` as GLOBAL per SourceFile
  let INTERPOLATIONS: Array<InterpolationNode>

  function collectTemplateInterpolations(
    node: ts.Node,
    interpolations: Array<ts.Node>,
    context: ts.TransformationContext,
  ): ts.VisitResult<ts.Node> {
    if (ts.isTemplateSpan(node)) {
      const interpolation = node.getChildAt(0)

      if (!ts.isIdentifier(interpolation) && !ts.isPropertyAccessExpression(interpolation)) {
        throw new Error(
          "Only identifiers or property access expressions are allowed by this transformer as an interpolation in a GraphQL template literal.",
        )
      }

      interpolations.push(interpolation)
    }

    return ts.visitEachChild(
      node,
      childNode => collectTemplateInterpolations(childNode, interpolations, context),
      context,
    )
  }

  const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
    // `graphql-tag` import declaration detected
    if (ts.isImportDeclaration(node)) {
      const moduleName = (node as ts.ImportDeclaration).moduleSpecifier.getText()
      if (GRAPHQL_TAG_MODULE_REGEX.test(moduleName)) {
        // delete it
        return undefined
      }
    }

    // tagged template expression detected
    if (ts.isTaggedTemplateExpression(node)) {
      const [tag, template] = node.getChildren()

      const isTemplateExpression = ts.isTemplateExpression(template)
      const isTemplateLiteral = ts.isNoSubstitutionTemplateLiteral(template)

      if (tag.getText() === "gql" && (isTemplateExpression || isTemplateLiteral)) {
        // init interpolation
        INTERPOLATIONS = []

        // remove backticks
        let source = template.getText().slice(1, -1)

        // `gql` tag with fragment interpolation
        if (isTemplateExpression) {
          collectTemplateInterpolations(template, INTERPOLATIONS, context)

          // remove embed expressions
          source = source.replace(/\$\{(.*)\}/g, "")
        }

        let queryDocument = getQueryDocument(source)

        return astify(queryDocument, INTERPOLATIONS)
      }
    }

    return ts.visitEachChild(node, visitor, context)
  }

  return visitor
}

function getQueryDocument(source: string) {
  const queryDocument = gql(source)

  // http://facebook.github.io/graphql/October2016/#sec-Language.Query-Document
  if (queryDocument.definitions.length > 1) {
    for (const definition of queryDocument.definitions) {
      if (!definition.name) {
        throw new Error(
          `If a GraphQL query document contains multiple operations, each operation must be named.\n${source}`,
        )
      }
    }
  }

  return queryDocument
}

// export transformerFactory as default
export default function(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => ts.visitNode(sourceFile, getVisitor(context))
  }
}
