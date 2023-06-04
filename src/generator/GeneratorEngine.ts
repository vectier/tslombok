import { FSWatcher } from 'chokidar';
import fs from 'fs';
import { globSync } from 'glob';
import path from 'path';
import { logSuccess, pathToPosix } from '../Utility';
import { GetterDecorator } from '../decorators/GetterDecorator';
import { SetterDecorator } from '../decorators/SetterDecorator';
import { DecoratorParser } from './DecoratorParser';
import { DecoratorRegistry } from './DecoratorRegistry';
import { DtsGenerator } from './DtsGenerator';

export class GeneratorEngine {

  // File systems
  private readonly watcher: FSWatcher;
  private readonly watchPath: string;
  private readonly outputBasePath: string;

  // Core systems
  private readonly dtsGenerator: DtsGenerator;
  private readonly decoratorRegistry: DecoratorRegistry;

  public constructor() {
    this.watcher = new FSWatcher({ ignored: ['**/node_modules/**', '**/.git/**'] });
    this.watcher.on('change', this.onSourceCodeChange.bind(this));

    // TODO: add root path configuration
    const rootPath = process.cwd();
    this.watchPath = path.join(rootPath, '**/*.ts');
    this.outputBasePath = path.join(rootPath, '/node_modules/lombokts');

    this.decoratorRegistry = new DecoratorRegistry();
    this.registerDecorators();
    this.dtsGenerator = new DtsGenerator(this.outputBasePath);
  }

  // Don't forget to register the complete implemented decorator
  private registerDecorators(): void {
    this.decoratorRegistry.register(GetterDecorator.NAME, new GetterDecorator());
    this.decoratorRegistry.register(SetterDecorator.NAME, new SetterDecorator());
  }

  public generate(sourceCodePaths: string[]): void {
    performance.mark('generating-start');

    sourceCodePaths.forEach((sourceCodePath) => {
      const sourceCode = fs.readFileSync(sourceCodePath).toString();
      const parser = new DecoratorParser(sourceCode, sourceCodePath, this.decoratorRegistry);
      this.dtsGenerator.addModule(sourceCodePath, parser);
    });
    this.dtsGenerator.generate();

    performance.mark('generating-end');
    const measure = performance.measure('generating', 'generating-start', 'generating-end');
    logSuccess(sourceCodePaths, Math.round(measure.duration));
  }

  public init(): void {
    const targetFiles = globSync('**/*.ts', {
      ignore: ['node_modules/**'],
      posix: true,
      absolute: true,
    });
    this.generate(targetFiles);
  }

  public watch(): void {
    this.watcher.add(this.watchPath);
  }

  private onSourceCodeChange(changedFilePath: string): void {
    const posixPath = pathToPosix(changedFilePath);
    this.generate([posixPath]);
  }

}
