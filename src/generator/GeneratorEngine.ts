import { FSWatcher } from 'chokidar';
import fs from 'fs';
import { globSync } from 'glob';
import path from 'path';
import ts, { CompilerOptions } from 'typescript';
import { logSuccess, logTsConfigNotFound, pathToPosix } from '../Utility';
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
  private readonly tsconfig: CompilerOptions;
  private readonly decoratorRegistry: DecoratorRegistry;
  private readonly dtsGenerator: DtsGenerator;

  public constructor() {
    this.watcher = new FSWatcher({ ignored: ['**/node_modules/**', '**/.git/**'] });
    this.watcher.on('change', this.onSourceCodeChange.bind(this));

    // TODO: add root path configuration
    const rootPath = process.cwd();
    this.watchPath = path.join(rootPath, '**/*.ts');
    this.outputBasePath = path.join(rootPath, '/node_modules/tslombok');

    // Load tsconfig.json file
    const tsconfigPath = ts.findConfigFile(rootPath, ts.sys.fileExists, 'tsconfig.json');
    if (!tsconfigPath) {
      logTsConfigNotFound();
      throw new Error('Cannot find tsconfig.json');
    }
    const tsconfigFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    this.tsconfig = ts.parseJsonConfigFileContent(tsconfigFile.config, ts.sys, rootPath).options;

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
      const parser = new DecoratorParser(
        sourceCode,
        sourceCodePath,
        this.tsconfig,
        this.decoratorRegistry,
      );
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
