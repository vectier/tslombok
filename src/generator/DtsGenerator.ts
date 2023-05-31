import ts, { ListFormat, NewLineKind, Node, NodeArray, ScriptTarget, SyntaxKind } from 'typescript';
import { DecoratorParser } from './DecoratorParser';

export class DtsGenerator {

  private readonly path: string;
  private readonly decoratorParser: DecoratorParser;

  public constructor(path: string, decoratorParser: DecoratorParser) {
    this.path = path;
    this.decoratorParser = decoratorParser;
  }

  public generate(): string {
    const resultFile = ts.createSourceFile('source.ts', '', ScriptTarget.Latest);
    const printer = ts.createPrinter({ newLine: NewLineKind.LineFeed });
    return printer.printList(ListFormat.MultiLine, this.constructDtsNodes(), resultFile);
  }

  private constructDtsNodes(): NodeArray<Node> {
    const dtsNodes = [];

    const emptyNamedExport = ts.factory.createExportDeclaration(
      undefined,
      false,
      ts.factory.createNamedExports([])
    );
    dtsNodes.push(emptyNamedExport);

    // All posible classes per module
    // We need to generate interfaces and namespace with the same as class name,
    // then export them with the same module path for adding LombokTS methods.
    //
    // We use declaration merging technique to add method signatures to existing class
    const interfaceDeclarations = [];
    const methodSignatureByClassName = this.decoratorParser.getMethodSignatures();
    for (const [className, methodSignatures] of methodSignatureByClassName) {
      const interfaceDeclaration = ts.factory.createInterfaceDeclaration(
        [ts.factory.createToken(SyntaxKind.ExportKeyword)],
        className,
        undefined,
        undefined,
        methodSignatures
      );
      interfaceDeclarations.push(interfaceDeclaration);
    }

    const namespaceDeclarations = []; // TODO: namespace for static
    
    // Declare module to map with sourcecode path to extends LombokTS methods
    const moduleDeclaration = ts.factory.createModuleDeclaration(
      [ts.factory.createToken(SyntaxKind.DeclareKeyword)],
      ts.factory.createStringLiteral(this.path),
      ts.factory.createModuleBlock([...interfaceDeclarations]),
    );
    dtsNodes.push(moduleDeclaration);

    return ts.factory.createNodeArray(dtsNodes);
  }

}
