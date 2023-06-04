import { bold, cyan, gray } from 'kleur';
import { GeneratorEngine } from '../generator/GeneratorEngine';

const packageJson = require('../../package.json');

export class CommandLine{

  public execute(): void {
    // Run `init` command as a default.
    // We will support more than 1 command later.
    this.init();
  }

  private init(): void {
    console.log(
      `\n${bold().blue('TSLombok')} ${cyan('v' + packageJson.version)} ` +
      gray('generator engine is watching your sourcecode...') + '\n' +
      `${bold('(!)')} Always save your sourcecode after emit a TSLombok decorator\n`,
    );

    const generatorEngine = new GeneratorEngine();
    generatorEngine.init();
    generatorEngine.watch();
  }

}
