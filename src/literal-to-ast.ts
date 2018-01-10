import * as ts from "typescript"

export default function astify(literal: any): any {
  if (literal === null) {
    return ts.createNull()
  }

  switch (typeof literal) {
    case "function":
      throw new Error("`function` is the wrong type in JSON.")
    case "string":
    case "number":
    case "boolean":
      return ts.createLiteral(literal)
    case "undefined":
      return ts.createIdentifier("undefined")
    default:
      if (Array.isArray(literal)) {
        return ts.createArrayLiteral(literal.map(astify))
      }

      return ts.createObjectLiteral(
        Object.keys(literal).map(k => {
          return ts.createPropertyAssignment(ts.createLiteral(k), astify(literal[k]))
        }),
      )
  }
}
