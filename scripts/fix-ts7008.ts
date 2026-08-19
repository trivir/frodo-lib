// fix-ts7008.ts
// Deterministically annotate every implicit-any type-literal member (TS7008)
// with `: any` - same idea as fix-ts7006.ts, but TS7008 fires on property
// signatures (`{ state; }` inside an inline object type) rather than on
// function parameters.
//
// Usage: npx tsx scripts/fix-ts7008.ts

import { Project, ts } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

let totalFixed = 0;

// Loop because fixing a member can shift offsets for later diagnostics in the
// same file, so we re-diagnose after each pass rather than trusting stale
// positions.
for (let pass = 0; pass < 10; pass++) {
  const diagnostics = project
    .getPreEmitDiagnostics()
    .filter((d) => d.getCode() === 7008);

  if (diagnostics.length === 0) break;

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

      const member = node.getFirstAncestorByKind(
        ts.SyntaxKind.PropertySignature
      );
      if (!member) continue;
      if (member.getTypeNode()) continue; // already annotated, skip

      member.setType('any');
      totalFixed++;
    }
  }

  project.saveSync();
}

console.log(`Annotated ${totalFixed} implicit-any type-literal members.`);

const remaining = project
  .getPreEmitDiagnostics()
  .filter((d) => d.getCode() === 7008);
if (remaining.length > 0) {
  console.error(`${remaining.length} TS7008 diagnostics remain unfixed:`);
  for (const d of remaining) {
    console.error(
      `  ${d.getSourceFile()?.getFilePath()}:${d.getLineNumber()}`
    );
  }
  process.exit(1);
}
