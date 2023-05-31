import fs from 'fs';
import path from 'path';

// Capitalize a first letter of given name
export const capitalize = (name: string) => {
  return name[0].toUpperCase() + name.slice(1);
};

export const pathToPosix = (pathString: string) => {
  return pathString.split(path.sep).join(path.posix.sep)
};

// Get all files from specific directory recursivly
export const getAllFilePaths = (directoryPath: string, files: string[] = []) => {
  const contents = fs.readdirSync(directoryPath);
  for (const content of contents) {
    const name = `${directoryPath}/${content}`;
    if (fs.statSync(name).isDirectory()) {
      getAllFilePaths(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}
