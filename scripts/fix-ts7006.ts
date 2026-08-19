// fix-ts7006.ts
// Deterministically annotate every implicit-any parameter (TS7006) with `: any`.
//
// Usage: npx tsx scripts/fix-ts7006.ts
// (ts-morph is already a devDependency; if tsx isn't installed, run via
// `vp install -D tsx` first, or `node --experimental-strip-types` on Node 22+.)

import { Project, ts } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

let totalFixed = 0;

// Loop because fixing params in a file can change later diagnostics' positions
// within that same file (new text = new offsets), so we re-diagnose after each pass.
for (let pass = 0; pass < 10; pass++) {
  const diagnostics = project
    .getPreEmitDiagnostics()
    .filter((d) => d.getCode() === 7006);

  if (diagnostics.length === 0) break;

  // Group by file so we can batch-edit each SourceFile once per pass.
  const byFile = new Map<string, typeof diagnostics>();
  for (const d of diagnostics) {
    const file = d.getSourceFile();
    if (!file) continue;
    const key = file.getFilePath();
    byFile.set(key, [...(byFile.get(key) ?? []), d]);
  }

  for (const [filePath, fileDiagnostics] of byFile) {
    const sourceFile = project.getSourceFileOrThrow(filePath);

    // Apply edits back-to-front so earlier offsets in this file stay valid
    // while we mutate later ones.
    const sorted = [...fileDiagnostics].sort(
      (a, b) => (b.getStart() ?? 0) - (a.getStart() ?? 0)
    );

    for (const diagnostic of sorted) {
      const start = diagnostic.getStart();
      if (start === undefined) continue;

      const node = sourceFile.getDescendantAtPos(start);
      if (!node) continue;

      // TS7006 always points at an Identifier that is a parameter name;
      // walk up to the enclosing ParameterDeclaration.
      const param = node.getFirstAncestorByKind(ts.SyntaxKind.Parameter);
      if (!param) continue;
      if (param.getTypeNode()) continue; // already annotated, skip

      param.setType('any');
      totalFixed++;
    }
  }

  project.saveSync();
}

console.log(`Annotated ${totalFixed} implicit-any parameters.`);

const remaining = project
  .getPreEmitDiagnostics()
  .filter((d) => d.getCode() === 7006);
if (remaining.length > 0) {
  console.error(`${remaining.length} TS7006 diagnostics remain unfixed:`);
  for (const d of remaining) {
    console.error(
      `  ${d.getSourceFile()?.getFilePath()}:${d.getLineNumber()}`
    );
  }
  process.exit(1);
}
