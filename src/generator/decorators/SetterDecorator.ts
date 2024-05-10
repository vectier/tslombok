import { factory, MethodSignature, SyntaxKind, TypeNode } from 'typescript';
import { capitalize } from '../../Utility';
import { MethodGeneratorDecorator } from './MethodGeneratorDecorator';

// A property decorator to create a setter method dynamically up to the property name.
export class SetterDecorator implements MethodGeneratorDecorator {

  public static readonly NAME: string = 'Setter';

  public createMethodSignature(propertyName: string, returnType: TypeNode): MethodSignature {
    return factory.createMethodSignature(
      undefined,  // No need to have a modifer for interface in declaration merging
      `get${capitalize(propertyName)}`,
      undefined,
      undefined,
      [factory.createParameterDeclaration(
        undefined,
        undefined,
        propertyName,
        undefined,
        returnType,
      )],
      factory.createKeywordTypeNode(SyntaxKind.VoidKeyword),
    );
  }

}
