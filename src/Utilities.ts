import * as path from 'path';

import { PossibleFormat, IFileHandler } from './FileHandler';

const posixPath = path.posix;

export default class Utilities {
  public static getPossibleNameFormats(targetFile: IFileHandler, searchFilePath: string): PossibleFormat[] {
    let possibleFormat: PossibleFormat[] = [];
    possibleFormat.push(<PossibleFormat>{
      isFile: true,
      searchString: targetFile.nameWithExtension(),
      actualPath: targetFile.filePath()
    });
    possibleFormat.push(<PossibleFormat>{
      isFile: true,
      searchString: targetFile.nameWithOutExtension(),
      actualPath: targetFile.filePath()
    });
    if (targetFile.nameWithOutExtension() === "index") {
      const folderStack = targetFile.filePath().split('/');
      possibleFormat.push(<PossibleFormat>{
        isFile: false,
        searchString: folderStack[folderStack.length - 2],
        actualPath: targetFile.filePath()
      });
      const currentFilePathWithoutName = targetFile.filePath().replace(targetFile.nameWithExtension(), '');
      const targetFilePathWithoutName = searchFilePath.substring(0, searchFilePath.lastIndexOf('/'));

      const relativePath = posixPath.relative(targetFilePathWithoutName, currentFilePathWithoutName);
      possibleFormat.push(<PossibleFormat>{
        isFile: false,
        searchString: relativePath ? `./${relativePath}` : './',
        actualPath: targetFile.filePath()
      });
      if (relativePath.match('/$')) {
        possibleFormat.push(<PossibleFormat>{
          isFile: false,
          searchString: "./" + relativePath.substring(0, relativePath.length - 1),
          actualPath: targetFile.filePath()
        });
      } else if (relativePath !== '/' && relativePath !== '') {
        possibleFormat.push(<PossibleFormat>{
          isFile: false,
          searchString: `./${relativePath}/`,
          actualPath: targetFile.filePath()
        });
      }
      if (relativePath.match('^..')) {
        possibleFormat.push(<PossibleFormat>{
          isFile: false,
          searchString: relativePath,
          actualPath: targetFile.filePath()
        });
        possibleFormat.push(<PossibleFormat>{
          isFile: false,
          searchString: `${relativePath}/`,
          actualPath: targetFile.filePath()
        });
      }
    }
    return possibleFormat;
  }

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