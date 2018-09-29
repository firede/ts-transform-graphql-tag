module.exports = function makeSourceEnumerable(doc) {
  if (doc.loc && doc.loc.source) {
    doc.loc.source = JSON.parse(JSON.stringify(doc.loc.source))
  }

  return doc
}
