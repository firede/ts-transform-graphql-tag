import * as ts from "typescript"
import gql from "graphql-tag"

const GRAPHQL_TAG_LIB_REGEX = /^['"]graphql-tag['"]$/

function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {
  const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
    // `graphql-tag` import declaration detected
    if (
      node.kind === ts.SyntaxKind.ImportDeclaration &&
      GRAPHQL_TAG_LIB_REGEX.test((node as ts.ImportDeclaration).moduleSpecifier.getText())
    ) {
      return undefined
    }

    // tagged template expression detected
    if (node.kind === ts.SyntaxKind.TaggedTemplateExpression) {
      const [tag, template] = node.getChildren()

      if (tag.getText() === "gql") {
        // `gql` tag without fragment interpolation
        if (template.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
          const query = template.getText().slice(1, -1)
          const queryDocument = gql(query)

          // http://facebook.github.io/graphql/October2016/#sec-Language.Query-Document
          if (queryDocument.definitions.length > 1) {
            for (const definition of queryDocument.definitions) {
              if (!definition.name) {
                throw new Error(
                  `If a GraphQL query document contains multiple operations, each operation must be named.\n${query}`,
                )
              }
            }
          }

          // TODO: astify queryDocument, return
        }

        // `gql` tag with fragment interpolation
        if (template.kind === ts.SyntaxKind.TemplateExpression) {
          console.log("tag with fragment: ", template.getText())

          // TODO: collect variables, join template string, etc.
        }
      }

      return ts.visitEachChild(node, visitor, ctx)
    }

    return ts.visitEachChild(node, visitor, ctx)
  }
  return visitor
}

export default function() {
  return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf))
  }
}
