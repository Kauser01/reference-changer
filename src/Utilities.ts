import * as path from 'path';

import { PossibleFormat } from './FileHandler';

const posixPath = path.posix;

export default class Utilities {
  public static getReplaceString(replaceIn: string, replaceWith: string, format: PossibleFormat) {
    let sourceLocation = replaceIn.substr(0, replaceIn.lastIndexOf("/"));
    let destinationLocation = replaceWith.substr(0, replaceWith.lastIndexOf("/"));
    let relativePath = posixPath.relative(sourceLocation, destinationLocation);
    if (format.isFile) {
      relativePath += replaceWith.substr(replaceWith.lastIndexOf("/"));
      if (!posixPath.extname(format.searchString))
        relativePath = relativePath.replace(posixPath.extname(relativePath), "");
    } else {
      const finalName = posixPath.basename(replaceWith).replace(posixPath.extname(replaceWith), '');
      if (relativePath === '/') {
        relativePath = '';
      }
      relativePath = `./${relativePath}`;
      if (format.searchString.match('/$') && relativePath !== './') {
        relativePath = `${relativePath}/`;
      }
      if (finalName !== 'index') {
        if (relativePath.match('/$')) {
          relativePath = `${relativePath}${finalName}`;
        } else {
          relativePath = `${relativePath}/${finalName}`;
        }
      }
    }
    if (relativePath.match('^/')) {
      relativePath = `.${relativePath}`;
    }
    if (!relativePath.match('^./')) {
      relativePath = `./${relativePath}`;
    }
    return relativePath;
  }
}