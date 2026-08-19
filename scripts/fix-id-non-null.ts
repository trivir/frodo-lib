// fix-id-non-null.ts
// Deterministically add a non-null assertion (`!`) to every `foo._id` access
// that TypeScript flags as possibly undefined, e.g.:
//
//   connectorData._id.split('/')[1]        ->  connectorData._id!.split('/')[1]
//   templateName: template4._id,           ->  templateName: template4._id!,
//
// Scoped to `_id` specifically (not every possibly-undefined/mismatched-type
// error) - this is a targeted stopgap for places that assume `_id` is always
// present without narrowing it, not a general "silence every strict-null
// error" tool.
//
// TypeScript reports this in different shapes depending on context:
//   - TS18048 ("'foo._id' is possibly 'undefined'") points its diagnostic
//     span exactly at the `foo._id` expression itself - this happens when
//     `_id` is used directly, e.g. `foo._id.split(...)`.
//   - TS2322 / TS2345 ("Type 'string | undefined' is not assignable to...")
//     point their span at the *containing* node - a property assignment,
//     variable declaration, or call argument - because the mismatch is
//     between the container's declared type and the value, not the `_id`
//     access in isolation. We isolate the container, then unwrap it to find
//     the actual value expression being assigned/passed.
//
// Usage: npx tsx scripts/fix-id-non-null.ts

import { Node, Project, SyntaxKind } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const CODES = [18048, 2322, 2345];

let totalFixed = 0;
let totalSkipped = 0;

function getDiagnosticMessage(
  d: ReturnType<Project['getPreEmitDiagnostics']>[number]
) {
  const message = d.getMessageText();
  return typeof message === 'string' ? message : message.getMessageText();
}

function isIdRelated(d: ReturnType<Project['getPreEmitDiagnostics']>[number]) {
  const text = getDiagnosticMessage(d);
  // TS18048's message names the flagged expression, so we can prefilter on
  // it cheaply. TS2322/TS2345's messages are generic ("Type 'string |
  // undefined' is not assignable to type 'string'.") and never mention
  // `_id` - those are only filtered by inspecting the AST below, so let
  // every one of them through here.
  if (d.getCode() === 18048) return text.includes("._id'");
  return true;
}

// Given the node whose span exactly matches a diagnostic, unwrap common
// "container" shapes down to the actual value expression being checked.
//
// TS often narrows its span to just the *name* half of an assignment (e.g.
// the property key in `templateName: template4._id`, or the variable name
// in `const x: string = template4._id`) rather than the whole statement, so
// we check both the node itself and - if it's a name - its parent.
function unwrapToValueExpression(node: Node): Node {
  const parent = node.getParent();

  if (Node.isPropertyAssignment(parent) && parent.getNameNode() === node) {
    return parent.getInitializerOrThrow();
  }
  if (Node.isVariableDeclaration(parent) && parent.getNameNode() === node) {
    return parent.getInitializerOrThrow();
  }

  if (Node.isPropertyAssignment(node)) {
    return node.getInitializerOrThrow();
  }
  if (Node.isVariableDeclaration(node)) {
    return node.getInitializerOrThrow();
  }
  if (Node.isReturnStatement(node)) {
    return node.getExpressionOrThrow();
  }
  if (
    Node.isBinaryExpression(node) &&
    node.getOperatorToken().getKind() === SyntaxKind.EqualsToken
  ) {
    return node.getRight();
  }
  return node;
}

for (let pass = 0; pass < 10; pass++) {
  const diagnostics = project
    .getPreEmitDiagnostics()
    .filter((d) => CODES.includes(d.getCode()))
    .filter(isIdRelated);

  if (diagnostics.length === 0) break;

  const byFile = new Map<string, typeof diagnostics>();
  for (const d of diagnostics) {
    const file = d.getSourceFile();
    if (!file) continue;
    const key = file.getFilePath();
    byFile.set(key, [...(byFile.get(key) ?? []), d]);
  }

  let fixedThisPass = 0;

  for (const [filePath, fileDiagnostics] of byFile) {
    const sourceFile = project.getSourceFileOrThrow(filePath);

    // Apply edits back-to-front so earlier offsets in this file stay valid
    // while we mutate later ones.
    const sorted = [...fileDiagnostics].sort(
      (a, b) => (b.getStart() ?? 0) - (a.getStart() ?? 0)
    );

    for (const diagnostic of sorted) {
      const start = diagnostic.getStart();
      const length = diagnostic.getLength();
      if (start === undefined || length === undefined) continue;
      const end = start + length;

      // Walk from the innermost node at `start` up to the ancestor whose
      // span exactly matches [start, end) - that's the node TypeScript
      // actually flagged.
      let container: Node | undefined = sourceFile.getDescendantAtPos(start);
      while (container && container.getEnd() < end) {
        container = container.getParent();
      }
      if (
        !container ||
        container.getStart() !== start ||
        container.getEnd() !== end
      ) {
        // Only TS18048's span is guaranteed to isolate cleanly (it points
        // directly at the flagged expression); TS2322/TS2345 cover a much
        // wider range of unrelated mismatches, most of which won't isolate
        // to a single node here, so don't warn on those.
        if (diagnostic.getCode() === 18048) {
          totalSkipped++;
          console.warn(
            `Skipping ${filePath}:${diagnostic.getLineNumber()} - couldn't isolate the flagged node`
          );
        }
        continue;
      }

      const value = unwrapToValueExpression(container);

      if (!Node.isPropertyAccessExpression(value) || value.getName() !== '_id') {
        // Not a `_id` access (or a shape we don't unwrap) - not our concern,
        // and not necessarily worth a warning since most TS2322/TS2345 hits
        // are unrelated to `_id` entirely.
        continue;
      }

      if (Node.isNonNullExpression(value.getParent())) continue; // already fixed

      value.replaceWithText(`${value.getText()}!`);
      fixedThisPass++;
      totalFixed++;
    }
  }

  if (fixedThisPass === 0) break; // nothing left we know how to fix
  project.saveSync();
}

console.log(`Added non-null assertions to ${totalFixed} '_id' accesses.`);
if (totalSkipped > 0) {
  console.warn(`Skipped ${totalSkipped} diagnostics we couldn't isolate cleanly - review manually.`);
}
