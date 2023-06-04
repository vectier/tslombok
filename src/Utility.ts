import { bold, green } from 'kleur';
import path from 'path';

// Capitalize a first letter of given name
export const capitalize = (name: string) => {
  return name[0].toUpperCase() + name.slice(1);
};

export const pathToPosix = (pathString: string) => {
  return pathString.split(path.sep).join(path.posix.sep)
};

export const logSuccess = (sourceCodePaths: string[], durationInMs: number) => {
  if (sourceCodePaths.length === 1) {
    console.log(
      green(`Process LombokTS decorators on ${bold(path.parse(sourceCodePaths[0]).base)} ` +
      `successfully in ${bold(durationInMs)} ms`),
    );
  } else {
    console.log(
      green(`Process LombokTS decorators on ${bold(sourceCodePaths.length)} files ` +
      `successfully in ${bold(durationInMs)} ms`),
    );
  }
};
