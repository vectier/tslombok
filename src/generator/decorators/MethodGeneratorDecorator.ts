import { MethodSignature, TypeNode } from 'typescript';
import { Decorator } from './Decorator';

export interface MethodGeneratorDecorator extends Decorator {

  /**
   * Creates a method signature
   * @param propertyName - A property name that the decorator decorates to
   * @param returnType - A return type as a string
   */
  createMethodSignature(propertyName: string, returnType: TypeNode): MethodSignature;

}

export const isMethodGeneratorDecorator = (
  decorator: Decorator,
): decorator is MethodGeneratorDecorator => {
  return !!((decorator as MethodGeneratorDecorator).createMethodSignature);
};
