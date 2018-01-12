// Compile `ts` files using transformer
// Primarily from https://github.com/longlho/ts-transform-img

import * as ts from "typescript"
import { sync as globSync } from "glob"
import { getTransformer } from "./src"
import debug from "debug"

const log = debug("compile")

const CJS_CONFIG = {
  experimentalDecorators: true,
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  noEmitOnError: false,
  noUnusedLocals: true,
  noUnusedParameters: true,
  stripInternal: true,
  target: ts.ScriptTarget.ES2015,
}

export default function compile(input: string, options: ts.CompilerOptions = CJS_CONFIG) {
  const files = globSync(input)
  const compilerHost = ts.createCompilerHost(options)
  const program = ts.createProgram(files, options, compilerHost)

  let emitResult = program.emit(undefined, undefined, undefined, undefined, {
    before: [getTransformer()],
  })

  let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)

  allDiagnostics.forEach(diagnostic => {
    let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
    log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`)
  })
}
