import ts, { MethodSignature, SyntaxKind, TypeNode } from 'typescript';
import { capitalize } from '../Utility';
import { MethodGeneratorDecorator } from './MethodGeneratorDecorator';

// A property decorator to create a setter method dynamically up to the property name.
export class SetterDecorator implements MethodGeneratorDecorator {

  public static readonly NAME: string = 'Setter';

  public getClassDeclaration(...params: unknown[]): ClassDecorator {
    throw new Error('Setter decorator not supported to class.');
  }

  public getPropertyDeclaration(...params: unknown[]): PropertyDecorator {
    return (target: Object, propertyKey: string | Symbol): void => {
      if (typeof propertyKey === 'symbol') propertyKey.toString();
      const propertyName = propertyKey as string;
      const methodName = this.getSetterName(propertyName);

      // Define setter method to the target class prototype,
      // that set a given value to their own property instance
      Object.defineProperty(target, methodName, {
        value: function(value: unknown) {
          this[propertyName] = value;
        },
      });
    };
  }

  public createMethodSignature(propertyName: string, returnType: TypeNode): MethodSignature {
    return ts.factory.createMethodSignature(
      undefined,  // No need to have a modifer for interface in declaration merging
      this.getSetterName(propertyName),
      undefined,
      undefined,
      [ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        propertyName,
        undefined,
        returnType,
      )],
      ts.factory.createKeywordTypeNode(SyntaxKind.VoidKeyword),
    );
  }

  private getSetterName(propertyName: string): string {
    return `set${capitalize(propertyName)}`;
  }

}

// Decorator alias
export const Setter = new SetterDecorator().getPropertyDeclaration();
