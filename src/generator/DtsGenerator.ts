import fs from 'fs';
import path from 'path';
import ts, { DeclarationStatement, ListFormat, ModuleDeclaration, NewLineKind, Node, NodeArray, ScriptTarget, SyntaxKind } from 'typescript';
import { DecoratorParser } from './DecoratorParser';

export class DtsGenerator {

  public static readonly DTS_FILE_NAME: string = 'generated.d.ts';

  private readonly outputPath: string;
  private readonly moduleByPath: Map<string, ModuleDeclaration>;

  public constructor(outputBasePath: string) {
    this.outputPath = path.join(outputBasePath, DtsGenerator.DTS_FILE_NAME);
    this.moduleByPath = new Map();
  }

  public generate(): void {
    const resultFile = ts.createSourceFile('source.ts', '', ScriptTarget.Latest);
    const printer = ts.createPrinter({ newLine: NewLineKind.LineFeed });
    const output = printer.printList(ListFormat.MultiLine, this.constructDtsNodes(), resultFile);
    fs.writeFileSync(this.outputPath, output);
  }

  private constructDtsNodes(): NodeArray<Node> {
    // Create `export {}` node, to make the dts file into a module
    const emptyNamedExport = ts.factory.createExportDeclaration(
      undefined,
      false,
      ts.factory.createNamedExports([]),
    );
    // Create module declarations for all files that include LombokTS decorators
    const moduleDeclarations = Array.from(this.moduleByPath.values());
    return ts.factory.createNodeArray([emptyNamedExport, ...moduleDeclarations]);
  }

  // We use the declaration merging technique to add method signatures to existing class.
  // So we need to generate interfaces and namespace with the same as class name,
  // then export them with the same module path for adding LombokTS methods.
  public addModule(modulePath: string, decoratorParser: DecoratorParser): void {
    const interfaceDeclarations: DeclarationStatement[] = [];
    const namespaceDeclarations: DeclarationStatement[] = [];

    const methodSignatureByClassName = decoratorParser.getMethodSignatures();
    if (methodSignatureByClassName.size === 0) return;

    // Declare interface for non-static accessor
    for (const [className, methodSignatures] of methodSignatureByClassName) {
      const interfaceDeclaration = ts.factory.createInterfaceDeclaration(
        [ts.factory.createToken(SyntaxKind.ExportKeyword)],
        className,
        undefined,
        undefined,
        methodSignatures,
      );
      interfaceDeclarations.push(interfaceDeclaration);
    }

    // Declare namespace for static accessor
    // TODO: namespace for static

    // Declare module to map with sourcecode path to extends LombokTS methods
    const moduleDeclaration = ts.factory.createModuleDeclaration(
      [ts.factory.createToken(SyntaxKind.DeclareKeyword)],
      ts.factory.createStringLiteral(modulePath),
      ts.factory.createModuleBlock([...interfaceDeclarations, ...namespaceDeclarations]),
    );
    this.moduleByPath.set(modulePath, moduleDeclaration);
  }

}
