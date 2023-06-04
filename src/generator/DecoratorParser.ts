import ts, { Identifier, MethodSignature, ScriptTarget, SourceFile, StringLiteral, SyntaxKind } from 'typescript';
import { isMethodGeneratorDecorator } from '../decorators/MethodGeneratorDecorator';
import { DecoratorRegistry } from './DecoratorRegistry';

export class DecoratorParser {

  private readonly decoratorRegistry: DecoratorRegistry;
  private readonly sourceFile: SourceFile;

  // All posible method signatures from method generator decorators
  private readonly methodSignaturesByClassName: Map<string, MethodSignature[]> = new Map();

  public constructor(sourceCode: string, decoratorRegistry: DecoratorRegistry) {
    this.decoratorRegistry = decoratorRegistry;
    this.sourceFile = ts.createSourceFile('code.ts', sourceCode, ScriptTarget.Latest);
    this.parse();
  }

  private parse(): void {
    const expectedDecoratorNames = this.decoratorRegistry.getDecoratorNames();

    const namedImports: Map<Identifier, StringLiteral> = new Map();

    ts.forEachChild(this.sourceFile, (node) => {
      // Remember named import declaration for type reference importing
      if (ts.isImportDeclaration(node)) { // TODO:

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
          let returnType = classMemberNode.type;
          if (!returnType) return; // TODO: type infer compatible

          // TODO: predict buit-in type references
          if (returnType.kind === SyntaxKind.TypeReference) {
            console.log(returnType);
          }

          for (const decorator of decorators) {
            // Gets only LombokTS decorators
            const decoratorName = decorator.getText(this.sourceFile).slice(1);
            if (!expectedDecoratorNames.includes(decoratorName)) continue;

            const expectedDecorator = this.decoratorRegistry.getDecorator(decoratorName);
            if (!expectedDecorator) continue;

            if (isMethodGeneratorDecorator(expectedDecorator)) {
              if (!this.methodSignaturesByClassName.get(className)) {
                this.methodSignaturesByClassName.set(className, []);
              }
              const methodSignature = expectedDecorator.createMethodSignature(propertyName, returnType);
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
