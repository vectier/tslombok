import path from 'path';
import ts, { MethodSignature, ScriptTarget, SourceFile, StringLiteral } from 'typescript';
import { isMethodGeneratorDecorator } from '../decorators/MethodGeneratorDecorator';
import { DecoratorRegistry } from './DecoratorRegistry';

export class DecoratorParser {

  private readonly decoratorRegistry: DecoratorRegistry;
  private readonly sourceFile: SourceFile;
  private readonly sourceCodePath: string;

  // All posible method signatures from method generator decorators
  private readonly methodSignaturesByClassName: Map<string, MethodSignature[]> = new Map();

  public constructor(sourceCode: string, sourceCodePath: string, decoratorRegistry: DecoratorRegistry) {
    this.decoratorRegistry = decoratorRegistry;
    this.sourceFile = ts.createSourceFile('code.ts', sourceCode, ScriptTarget.Latest);
    this.sourceCodePath = sourceCodePath;
    this.parse();
  }

  private parse(): void {
    const expectedDecoratorNames = this.decoratorRegistry.getDecoratorNames();
    const pathByImportName: Map<string, string> = new Map();

    ts.forEachChild(this.sourceFile, (node) => {
      // Remember named import declaration for type reference importing
      if (ts.isImportDeclaration(node)) {
        // Skip import without clause
        // e.g. import './foo.ts';
        if (!node.importClause) return;

        // Skip default import
        // e.g. import foo './bar.ts';
        if (!node.importClause.namedBindings) return;

        // Skip namepsace import
        // e.g. import * from './foor.ts';
        if (ts.isNamespaceImport(node.importClause.namedBindings)) return;

        // Only `import { foo } from './bar.ts'` is acceptable
        
        const importPath = node.moduleSpecifier.getText(this.sourceFile).slice(1, -1);
        const resolvedImportPath = path.join(this.sourceCodePath, '..', importPath);

        const namedImports = node.importClause.namedBindings;
        namedImports.elements.forEach((element) => {
          // TODO: correct path
          pathByImportName.set(element.name.getText(this.sourceFile), resolvedImportPath);
        });
      }

      // Traverse only class declaration node
      if (!ts.isClassDeclaration(node)) return;

      // TODO: support `export default class {}`
      // Don't traverse to non-module file (without named export)
      if (!node.name) return;
      const className = node.name.getText(this.sourceFile);

      // Traverse to the class member
      node.forEachChild((classMemberNode) => {
        // Traverse property declarations to generate `@Getter/@Setter` decorators
        if (ts.isPropertyDeclaration(classMemberNode)) {
          const decorators = ts.getDecorators(classMemberNode);
          if (!decorators) return;

          const propertyName = classMemberNode.name.getText(this.sourceFile);
          let propertyType = classMemberNode.type;
          if (!propertyType) return; // TODO: type infer compatible

          if (ts.isTypeReferenceNode(propertyType)) {
            // Skip qualified name
            // e.g. const variable: Foo.Bar;
            if (!ts.isIdentifier(propertyType.typeName)) return;
            const importName = propertyType.typeName.getText(this.sourceFile);
            const importPath = pathByImportName.get(importName);

            // Magic to import type in dts file for type reference
            const importType = ts.factory.createImportTypeNode(
              ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(importPath || '')),
              undefined,
              ts.factory.createIdentifier(propertyType.getText(this.sourceFile)),
              undefined,
              false,
            );
            propertyType = importType;
          }

          for (const decorator of decorators) {
            // Gets only TSLombok decorators
            const decoratorName = decorator.getText(this.sourceFile).slice(1);
            if (!expectedDecoratorNames.includes(decoratorName)) continue;

            const expectedDecorator = this.decoratorRegistry.getDecorator(decoratorName);
            if (!expectedDecorator) continue;

            if (isMethodGeneratorDecorator(expectedDecorator)) {
              if (!this.methodSignaturesByClassName.get(className)) {
                this.methodSignaturesByClassName.set(className, []);
              }
              const methodSignature = expectedDecorator.createMethodSignature(propertyName, propertyType);
              this.methodSignaturesByClassName.get(className)!.push(methodSignature);
            }
          }
        }
      });
    });
  }

  public getMethodSignatures(): Map<string, MethodSignature[]> {
    return this.methodSignaturesByClassName;
  }

}
