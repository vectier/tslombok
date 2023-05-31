import ts, { MethodSignature, TypeNode } from 'typescript';
import { capitalize } from '../Utility';
import { MethodGeneratorDecorator } from './MethodGeneratorDecorator';

// A property decorator to create a getter method dynamically up to the property name.
export class GetterDecorator implements MethodGeneratorDecorator {

  public static readonly NAME: string = 'Getter';

  public getClassDeclaration(...params: unknown[]): ClassDecorator {
    throw new Error('Getter decorator not supported to class.');
  }

  public getPropertyDeclaration(...params: unknown[]): PropertyDecorator {
    return (target: Object, propertyKey: string | Symbol): void => {
      if (typeof propertyKey === 'symbol') propertyKey.toString();
      const propertyName = propertyKey as string;
      const methodName = this.getGetterName(propertyName);

      // Define getter method to the target class prototype,
      // that point to their own property instance
      Object.defineProperty(target, methodName, {
        value: function() {
          return this[propertyName];
        },
      });
    };
  }

  public createMethodSignature(propertyName: string, returnType: TypeNode): MethodSignature {
    return ts.factory.createMethodSignature(
      undefined,  // No need to have a modifer for interface in declaration merging
      this.getGetterName(propertyName),  
      undefined,
      undefined,
      [],         // No need to create parameters
      returnType,
    );
  }

  private getGetterName(propertyName: string): string {
    return `get${capitalize(propertyName)}`;
  }

}

// Decorator alias
export const Getter = new GetterDecorator().getPropertyDeclaration();
