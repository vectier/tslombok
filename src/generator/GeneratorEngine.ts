import { FSWatcher } from 'chokidar';
import fs from 'fs';
import { bold } from 'kleur';
import path from 'path';
import { pathToPosix } from '../Utility';
import { GetterDecorator } from '../decorators/GetterDecorator';
import { SetterDecorator } from '../decorators/SetterDecorator';
import { DecoratorParser } from './DecoratorParser';
import { DecoratorRegistry } from './DecoratorRegistry';
import { DtsGenerator } from './DtsGenerator';

export class GeneratorEngine {

  public static readonly OUTPUT_FILE_NAME: string = 'generated.d.ts';
  public static readonly IGNORED_DIR_GLOBS: string[] = [
    '**/node_modules/**', '**/.git/**',
  ];

  // File systems
  private readonly watcher: FSWatcher;
  private readonly watchPath: string;
  private readonly outputPath: string;

  // Decorator management
  private readonly decoratorRegistry: DecoratorRegistry;

  public constructor() {
    this.watcher = new FSWatcher({ ignored: GeneratorEngine.IGNORED_DIR_GLOBS });
    this.watcher.on('change', this.onSourceCodeChange.bind(this));

    // TODO: add root path configuration
    const cwd = process.cwd();
    this.watchPath = path.join(cwd, '**/*.ts');
    this.outputPath = path.join(cwd, '/node_modules/lombokts', GeneratorEngine.OUTPUT_FILE_NAME);

    this.decoratorRegistry = new DecoratorRegistry();
    this.registerDecorators();
  }

  private registerDecorators(): void {
    this.decoratorRegistry.register(GetterDecorator.NAME, new GetterDecorator());
    this.decoratorRegistry.register(SetterDecorator.NAME, new SetterDecorator());
  }

  public generate(path: string): void {
    const sourceCode = fs.readFileSync(path).toString();
    const parser = new DecoratorParser(this.decoratorRegistry, sourceCode);
    const dtsGenerator = new DtsGenerator(path, parser);
    fs.writeFileSync(this.outputPath, dtsGenerator.generate());
  }

  public watch(): void {
    this.watcher.add(this.watchPath);
  }

  private onSourceCodeChange(changedFilePath: string): void {
    const posixPath = pathToPosix(changedFilePath);

    performance.mark('generating-start');
    this.generate(posixPath);
    performance.mark('generating-end');
    const measure = performance.measure('generating', 'generating-start', 'generating-end');

    console.log(
      `Process LombokTS decorators on '${bold(path.parse(posixPath).base)}' ` +
      `successfully in ${bold(Math.round(measure.duration))} ms`,
    );
  }

}
