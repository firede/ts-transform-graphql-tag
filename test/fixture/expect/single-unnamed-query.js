// without transformer
const gql = require("graphql-tag")
const makeSourceEnumerable = require("../../make-source-enumerable")
const doc = gql`query {hello}`
module.exports = makeSourceEnumerable(doc)
