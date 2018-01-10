# ts-transform-graphql-tag

Compiles GraphQL tagged template strings using [graphql-tag](https://github.com/apollographql/graphql-tag) in TypeScript files.

The plugin was mostly inspired by great Babel's plugin [babel-plugin-graphql-tag](https://github.com/gajus/babel-plugin-graphql-tag).

This project is **WORK IN PROGRESS**, do **NOT** try to use it :trollface:

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

## Examples

(TODO)

---

<p align="center">MIT &copy; <a href="https://github.com/firede">Firede</a>, built with (+ :coffee: :hearts:).<p>
