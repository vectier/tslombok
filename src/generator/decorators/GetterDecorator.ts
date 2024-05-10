import { factory, MethodSignature, TypeNode } from 'typescript';
import { MethodGeneratorDecorator } from './MethodGeneratorDecorator';
import { capitalize } from '../../Utility';

// A property decorator to create a getter method dynamically up to the property name.
export class GetterDecorator implements MethodGeneratorDecorator {

  public static readonly NAME: string = 'Getter';

  public createMethodSignature(propertyName: string, returnType: TypeNode): MethodSignature {
    return factory.createMethodSignature(
      undefined,  // No need to have a modifer for interface in declaration merging
      `get${capitalize(propertyName)}`,
      undefined,
      undefined,
      [],         // No need to create parameters
      returnType,
    );
  }

}
