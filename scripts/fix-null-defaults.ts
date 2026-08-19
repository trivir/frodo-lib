// fix-null-defaults.ts
// Deterministically fix parameters that are ALREADY declared optional (`?:`)
// but default to `null` instead of just omitting the default (i.e. `undefined`).
// Does NOT touch parameters that aren't already marked optional - that's a
// separate, more invasive decision (adding `?`) left for a human to make.
//
//   function f({ x = null }: { x?: T }) {}   -> function f({ x }: { x?: T }) {}
//   function f(x?: string = null) {}         -> function f(x?: string) {}
//
//   function f({ x = null }: { x: T }) {}    -> left alone (x isn't optional)
//   function f(x: string = null) {}          -> left alone (x isn't optional)
//
// Usage: npx tsx scripts/fix-null-defaults.ts

import { Node, Project, SyntaxKind } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

let totalFixed = 0;

function isNullLiteral(node: Node | undefined): boolean {
  return !!node && node.getKind() === SyntaxKind.NullKeyword;
}

for (const sourceFile of project.getSourceFiles('src/**/*.ts')) {
  let changed = false;

  // --- Simple parameters: function f(x?: string = null) ---
  for (const param of sourceFile.getDescendantsOfKind(
    SyntaxKind.Parameter
  )) {
    if (!Node.isIdentifier(param.getNameNode())) continue;
    if (!isNullLiteral(param.getInitializer())) continue;
    if (!param.hasQuestionToken()) continue;

    param.removeInitializer();
    changed = true;
    totalFixed++;
  }

  // --- Destructured parameters: function f({ x = null }: { x?: T }) ---
  for (const bindingElement of sourceFile.getDescendantsOfKind(
    SyntaxKind.BindingElement
  )) {
    if (!isNullLiteral(bindingElement.getInitializer())) continue;

    const param = bindingElement.getFirstAncestorByKind(SyntaxKind.Parameter);
    if (!param) continue;

    const typeNode = param.getTypeNode();
    if (!typeNode || !Node.isTypeLiteral(typeNode)) {
      console.warn(
        `Skipping ${sourceFile.getFilePath()}:${bindingElement.getStartLineNumber()} - destructured param has no inline type literal`
      );
      continue;
    }

    // Match the property in the type literal by the *property* name,
    // i.e. the BindingElement's `propertyName` if present (handles
    // `{ prop: renamed = null }`), else its own name.
    const propertyName = (
      bindingElement.getPropertyNameNode() ?? bindingElement.getNameNode()
    ).getText();

    const prop = typeNode
      .getMembers()
      .find(
        (m) => Node.isPropertySignature(m) && m.getName() === propertyName
      );

    if (!prop || !Node.isPropertySignature(prop)) {
      console.warn(
        `Skipping ${sourceFile.getFilePath()}:${bindingElement.getStartLineNumber()} - no matching property signature for '${propertyName}'`
      );
      continue;
    }

    // Only touch it if the property is already declared optional.
    if (!prop.hasQuestionToken()) continue;

    bindingElement.removeInitializer();
    changed = true;
    totalFixed++;
  }

  if (changed) {
    sourceFile.saveSync();
  }
}

console.log(`Fixed ${totalFixed} null-defaulted optional parameters.`);
