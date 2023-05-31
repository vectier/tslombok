import { Decorator } from '../decorators/Decorator';

export class DecoratorRegistry {
  
  private readonly decorators: Map<string, Decorator>;

  public constructor() {
    this.decorators = new Map();
  }

  public register(name: string, decorator: Decorator) {
    this.decorators.set(name, decorator);
  }

  public getDecorator(name: string): Decorator | undefined {
    return this.decorators.get(name);
  }

  public getDecoratorNames(): string[] {
    return Array.from(this.decorators.keys());
  }

}
