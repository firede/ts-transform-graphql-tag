// without transformer
const gql = require("graphql-tag")
const makeSourceEnumerable = require("../../make-source-enumerable")
const doc = gql`query Hello {hello}`
module.exports = makeSourceEnumerable(doc)
