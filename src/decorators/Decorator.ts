export interface Decorator {

  /**
   * Returns class decorator, a custom behaviour should define in this method.
   * @param params - Parameters pass from decorator signature
   */
  getClassDeclaration(...params: unknown[]): ClassDecorator;

  /**
   * Returns property decorator, a custom behaviour should define in this method.
   * @param params - Parameters pass from decorator signature
   */
  getPropertyDeclaration(...params: unknown[]): PropertyDecorator;

}
