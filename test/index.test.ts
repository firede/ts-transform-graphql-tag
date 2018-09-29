import compile from "../compile"
import { resolve, join } from "path"
import { readFileSync } from "fs"

function assertNoGraphQLTagImport(rawContent: string) {
  expect(rawContent.indexOf("graphql-tag")).toBe(-1)
}

function assertNoGqlTaggedTemplate(rawContent: string) {
  expect(rawContent.indexOf("gql`")).toBe(-1)
}

const actualPath = resolve(__dirname, "./fixture/actual")
const expectPath = resolve(__dirname, "./fixture/expect")

compile(join(actualPath, "./*.ts"))

describe("converts inline `gql` tag to a compiled version", () => {
  const actualFilePath = join(actualPath, "./single-named-query.js")
  const actualRaw = readFileSync(actualFilePath, "utf8")
  const actualValue = require(actualFilePath).default
  const expectValue = require(join(expectPath, "./single-named-query.js"))

  it("no 'graphql-tag' import declaration", () => assertNoGraphQLTagImport(actualRaw))
  it("no `gql` tagged template expression", () => assertNoGqlTaggedTemplate(actualRaw))
  it("result matched", () => expect(actualValue).toEqual(expectValue))
})

describe("converts inline `gql` tag with fragment interpolation", () => {
  const actualFilePath = join(actualPath, "./with-fragment-interpolation.js")
  const actualRaw = readFileSync(actualFilePath, "utf8")
  const actualValue = require(actualFilePath).default
  const expectValue = require(join(expectPath, "./with-fragment-interpolation.js"))

  it("no 'graphql-tag' import declaration", () => assertNoGraphQLTagImport(actualRaw))
  it("no `gql` tagged template expression", () => assertNoGqlTaggedTemplate(actualRaw))

  // `loc` is defferent between runtime and compile time, so we don't compare them.
  delete expectValue.loc
  delete actualValue.loc

  it("result matched", () => expect(actualValue).toEqual(expectValue))
})

describe("transform a single unnamed query.", () => {
  const actualFilePath = join(actualPath, "./single-unnamed-query.js")
  const actualRaw = readFileSync(actualFilePath, "utf8")
  const actualValue = require(actualFilePath).default
  const expectValue = require(join(expectPath, "./single-unnamed-query.js"))

  it("no 'graphql-tag' import declaration", () => assertNoGraphQLTagImport(actualRaw))
  it("no `gql` tagged template expression", () => assertNoGqlTaggedTemplate(actualRaw))
  it("result matched", () => expect(actualValue).toEqual(expectValue))
})

describe("does not transform template without `gql` tag.", () => {
  const actualRaw = readFileSync(join(actualPath, "./without-gql-tag.js"), "utf8")

  it("no 'graphql-tag' import declaration", () => assertNoGraphQLTagImport(actualRaw))
  it("does not transform template", () => assertNoGqlTaggedTemplate(actualRaw))
})

describe("does not transform template without tag.", () => {
  const actualRaw = readFileSync(join(actualPath, "./without-tag.js"), "utf8")

  it("no 'graphql-tag' import declaration", () => assertNoGraphQLTagImport(actualRaw))
  it("does not transform template", () => expect(actualRaw.match(/`/g).length).toBe(2))
})
