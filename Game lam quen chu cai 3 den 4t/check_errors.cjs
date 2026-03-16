const ts = require('typescript');
const program = ts.createProgram(['src/main.ts'], { target: ts.ScriptTarget.ES2022, moduleResolution: ts.ModuleResolutionKind.NodeJs, strict: true, esModuleInterop: true });
const allDiagnostics = ts.getPreEmitDiagnostics(program);

let foundError = false;
allDiagnostics.forEach(diagnostic => {
  if (diagnostic.file && diagnostic.file.fileName.includes('src/main.ts')) {
    const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    foundError = true;
  }
});

if (!foundError) console.log("NO ERRORS IN MAIN.TS");
