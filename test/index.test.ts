import compile from "../compile"
import { resolve, join } from "path"
import { readFileSync } from "fs"

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
  const actualValue = require(actualFilePath).default
  const expectValue = require(join(expectPath, "./single-unnamed-query.js"))

  it("no 'graphql-tag' import declaration", () => {
    expect(hasGraphQLTagDeclaration(actualRaw)).toBe(false)
  })

  it("no `gql` tagged template expression", () => {
    expect(hasGqlTaggedTemplateExpression(actualRaw)).toBe(false)
  })

  it("result matched", () => {
    expect(actualValue).toEqual(expectValue)
  })
})

describe("does not transform template without `gql` tag.", () => {
  const actualRaw = readFileSync(join(actualPath, "./without-gql-tag.js"), "utf8")

  it("no 'graphql-tag' import declaration", () => {
    expect(hasGraphQLTagDeclaration(actualRaw)).toBe(false)
  })

  it("does not transform template", () => {
    expect(actualRaw.match(/`/g).length).toBe(2)
  })
})

describe("does not transform template without tag.", () => {
  const actualRaw = readFileSync(join(actualPath, "./without-tag.js"), "utf8")

  it("no 'graphql-tag' import declaration", () => {
    expect(hasGraphQLTagDeclaration(actualRaw)).toBe(false)
  })

  it("does not transform template", () => {
    expect(actualRaw.match(/`/g).length).toBe(2)
  })
})
