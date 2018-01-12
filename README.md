# ts-transform-graphql-tag

[![Build Status](https://travis-ci.org/firede/ts-transform-graphql-tag.svg?branch=master)](https://travis-ci.org/firede/ts-transform-graphql-tag)

Compiles GraphQL tagged template strings using [graphql-tag](https://github.com/apollographql/graphql-tag) in TypeScript files.

The plugin was mostly inspired by great Babel's plugin [babel-plugin-graphql-tag](https://github.com/gajus/babel-plugin-graphql-tag).

## Motivation

Compiling GraphQL queries at the build time:

* reduces the script initialization time; and
* removes the `graphql-tag` dependency

Removing the `graphql-tag` dependecy from the bundle saves approx. 50 KB.

## Installation

The following command adds the packages to the project as a development-time dependency:

```sh
npm i --save-dev ts-transform-graphql-tag
```

This also depends on `graphql` and `graphql-tag` so you'll need those in your project as well (if you don't already have them):

```sh
# usually, this is a production dependency
npm i graphql

# add this as a development-time dependency
npm i --save-dev graphql-tag
```

## Usage

### Integration with `Webpack`

(TODO)

### Integration with `FuseBox`

(TODO)

## Implementation

* Searches for imports of `graphql-tag` and removes them.
* Searches for [tagged template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals) with `gql` identifier and compiles them using `graphql-tag`.

## Example

**before**

```typescript
// with transformer
import gql from "graphql-tag"
export default gql`query Hello {hello}`
```

**after**

```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = { "kind": "Document", "definitions": [{ "kind": "OperationDefinition", "operation": "query", "name": { "kind": "Name", "value": "Hello" }, "variableDefinitions": [], "directives": [], "selectionSet": { "kind": "SelectionSet", "selections": [{ "kind": "Field", "alias": undefined, "name": { "kind": "Name", "value": "hello" }, "arguments": [], "directives": [], "selectionSet": undefined }] } }], "loc": { "start": 0, "end": 19, "source": { "body": "query Hello {hello}", "name": "GraphQL request", "locationOffset": { "line": 1, "column": 1 } } } };
```

Need more example? run `npm test` and checkout `test/fixture/actual/*.js`.

---

<p align="center">MIT &copy; <a href="https://github.com/firede">Firede</a>, built with (+ :coffee: :hearts:).<p>
