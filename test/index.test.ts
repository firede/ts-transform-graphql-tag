import compile from "../compile"
import { resolve, join } from "path"
import { readFileSync, readJsonSync } from "fs-extra"

function hasGraphQLTagDeclaration(rawFile) {
  return rawFile.indexOf("graphql-tag") !== -1
}

function hasGqlTaggedTemplateExpression(rawFile) {
  return rawFile.indexOf("gql`") !== -1
}

const actualPath = resolve(__dirname, "./fixture/actual")
const expectPath = resolve(__dirname, "./fixture/expect")

compile(join(actualPath, "./*.ts"))

describe("transform a single unnamed query.", () => {
  const actualFilePath = join(actualPath, "./single-unnamed-query.js")
  const actualRaw = readFileSync(actualFilePath, "utf8")
  const actualJson = require(actualFilePath).default
  const expectJson = readJsonSync(join(expectPath, "./single-unnamed-query.json"))

  it("no 'graphql-tag' import declaration", () => {
    expect(hasGraphQLTagDeclaration(actualRaw)).toBe(false)
  })

  it("no `gql` tagged template expression", () => {
    expect(hasGqlTaggedTemplateExpression(actualRaw)).toBe(false)
  })

  it("result matched", () => {
    expect(actualJson).toEqual(expectJson)
  })
})
