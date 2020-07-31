import { extname } from 'path';

const micromatch = require('micromatch');

export class FilePathArray extends Array<string> {
  filterByGlob(glob: string | string[]) {
    return micromatch(this, glob);
  }

  get extensions() {
    return [
      ...this.reduce((uniqueExtensions: Set<string>, path: string) => {
        uniqueExtensions.add(extname(path).replace('.', ''));
        return uniqueExtensions;
      }, new Set<string>()),
    ];
  }
}
