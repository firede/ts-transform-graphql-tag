import * as ts from "typescript"
import gql from "graphql-tag"
import astify from "./literal-to-ast"

const GRAPHQL_TAG_MODULE_REGEX = /^['"]graphql-tag['"]$/

function getVisitor(context: ts.TransformationContext /*, sourceFile: ts.SourceFile */): ts.Visitor {
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
        let placeholders: Array<string> = []

        // remove backticks
        let source = template.getText().slice(1, -1)

        // `gql` tag with fragment interpolation
        if (isTemplateExpression) {
          collectTemplatePlaceholders(template, placeholders)

          // remove embed expressions
          source = source.replace(/\$\{(.*)\}/g, "")
        }

        let queryDocument = getQueryDocument(source)
        let body = astify(queryDocument)

        if (placeholders.length > 0) {
          // TODO: collect variables, join template string, etc.
          console.log("Oops! we don't support `gql` tag with placeholders yet.")
        }

        return body
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

function collectTemplatePlaceholders(node: ts.Node, placeholders: Array<string>): ts.VisitResult<ts.Node> {
  if (ts.isTemplateSpan(node)) {
    const placeholder = node.getChildAt(0)

    if (!ts.isIdentifier(placeholder) && !ts.isPropertyAccessExpression(placeholder)) {
      throw new Error(
        "Only identifiers or property access expressions are allowed by this transformer as an interpolation in a GraphQL template literal.",
      )
    }

    placeholders.push(placeholder.getText())
  }

  return ts.forEachChild(node, childNode => collectTemplatePlaceholders(childNode, placeholders))
}

// export transformerFactory as default
export default function(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => ts.visitNode(sourceFile, getVisitor(context /*, sourceFile */))
  }
}
