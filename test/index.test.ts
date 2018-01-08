import compile from "../compile"
import { resolve } from "path"

describe("ts-transform-graphql-tag", () => {
  compile(resolve(__dirname, "fixture/*.ts"))

  it("test should work.", () => {
    expect(1 + 1).toBe(2)
  })
})
