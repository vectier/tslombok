import { bold, cyan, gray } from 'kleur';
import { GeneratorEngine } from '../generator/GeneratorEngine';

const packageJson = require('../../package.json');

export class CommandLine{

  public execute(): void {
    // Run watch command as a default.
    // We will support more than 1 command later.
    this.watch();
  }

  private watch(): void {
    console.log(
      `\n${bold().blue('LombokTS')} ${cyan('v' + packageJson.version)} ` +
      gray('generator engine is watching your sourcecode...') + '\n' +
      `${bold('(!)')} Always save your sourcecode after emit a LombokTS decorator\n`,
    );

    const generatorEngine = new GeneratorEngine();
    // generatorEngine.generate();
    generatorEngine.watch();
  }

}
