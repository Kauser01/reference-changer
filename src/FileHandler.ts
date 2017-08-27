import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

let posixPath = path.posix;

interface ValidationOutput {
  isValid: boolean;
  startingIndex: number;
  endingIndex: number;
  replacingString: string;
}

export interface PossibleFormat {
  searchString: string;
  isFile: boolean;
  replaceString: string;
  actualPath: string;
}

export interface IFileHandler {
  filePath(): string;
  nameWithExtension(): string;
  nameWithOutExtension(): string;
  getPossibleNameFormats(searchFilePath: string): PossibleFormat[];
  getFileContent(): string;
  updateFileContent(format: PossibleFormat): void;
  updateFileContent1(currentTargetPath: string, source: string, destination: string, name: string): void;
  updateTargetFileContent(refernceFilePath: string, source: string, destination: string, name: string): void;
  saveFile(): void;
}

export class FileHandler implements IFileHandler {
  private _fileContent: string;
  private shouldSave: boolean;
  constructor(private _filePath: string) {
    this.shouldSave = false;
    this.getFileContent();
  }

  public filePath(): string {
    return this._filePath;
  }

  public nameWithExtension(): string {
    return posixPath.basename(this._filePath);
  }

  public nameWithOutExtension(): string {
    let extension = posixPath.extname(this._filePath);
    return posixPath.basename(this._filePath).replace(extension, "");
  }

  public getFileContent(): string {
    if (!this._fileContent)
      this._fileContent = fs.readFileSync(this._filePath, "utf8");
    return this._fileContent;
  }

  public getPossibleNameFormats(searchFilePath: string): PossibleFormat[] {
    let possibleFormat: PossibleFormat[] = [];
    possibleFormat.push(<PossibleFormat>{
      isFile: true,
      searchString: this.nameWithExtension(),
      actualPath: this.filePath()
    });
    possibleFormat.push(<PossibleFormat>{
      isFile: true,
      searchString: this.nameWithOutExtension(),
      actualPath: this.filePath()
    });
    if (this.nameWithOutExtension() === "index") {
      const folderStack = this._filePath.split('/');
      possibleFormat.push(<PossibleFormat>{
        isFile: false,
        searchString: folderStack[folderStack.length - 2],
        actualPath: this.filePath()
      });
      const currentFilePathWithoutName = this.filePath().replace(this.nameWithExtension(), '');
      const targetFilePathWithoutName = searchFilePath.substring(0, searchFilePath.lastIndexOf('/'));

      const relativePath = posixPath.relative(targetFilePathWithoutName, currentFilePathWithoutName);
      possibleFormat.push(<PossibleFormat>{
        isFile: false,
        searchString: relativePath ? `./${relativePath}` : './',
        actualPath: this.filePath()
      });
      if (relativePath.match('/$')) {
        possibleFormat.push(<PossibleFormat>{
          isFile: false,
          searchString: "./" + relativePath.substring(0, relativePath.length - 1),
          actualPath: this.filePath()
        });
      } else if (relativePath !== '/' && relativePath !== '') {
        possibleFormat.push(<PossibleFormat>{
          isFile: false,
          searchString: `./${relativePath}/`,
          actualPath: this.filePath()
        });
      }
      if (relativePath.match('^..')) {
        possibleFormat.push(<PossibleFormat>{
          isFile: false,
          searchString: relativePath,
          actualPath: this.filePath()
        });
        possibleFormat.push(<PossibleFormat>{
          isFile: false,
          searchString: `${relativePath}/`,
          actualPath: this.filePath()
        });
      }
    }
    return possibleFormat;
  }

  private isValidReference(index: number, currentTargetPath: string, name: string): ValidationOutput {
    let endingIndex = index + name.length;
    if (this._fileContent[endingIndex] === "'"
      || this._fileContent[endingIndex] === '"' ||
      this._fileContent[endingIndex] === "`") {
      let endingString = this._fileContent[endingIndex];
      let startingIndex = endingIndex;
      while (startingIndex--) {
        if (this._fileContent[startingIndex] === endingString) {
          break;
        }
      }
      let replaceString = this._fileContent.substring(startingIndex + 1, endingIndex);
      let pathInFile = posixPath.join(posixPath.dirname(this._filePath), replaceString);
      if (pathInFile === currentTargetPath || pathInFile + posixPath.extname(currentTargetPath) === currentTargetPath) {
        return {
          isValid: true,
          startingIndex: startingIndex,
          endingIndex: endingIndex,
          replacingString: replaceString
        };
      } else {
        const fileWithoutExtension = currentTargetPath.replace(posixPath.extname(currentTargetPath), '');
        if (fileWithoutExtension.match('index$')) {
          if (pathInFile + 'index' === fileWithoutExtension || pathInFile + '/index' === fileWithoutExtension) {
            return {
              isValid: true,
              startingIndex: startingIndex,
              endingIndex: endingIndex,
              replacingString: replaceString
            };
          }
        }
      }
    }
    return {
      isValid: false,
      startingIndex: -1,
      endingIndex: -1,
      replacingString: ''
    };
  }

  private getPosition(name: string, count: number): number {
    return this._fileContent.split(name, count).join(name).length;
  }

  private getRelativePath(source: string, destination: string, name: string): string {
    let sourceLocation = source.substr(0, source.lastIndexOf("/"));
    let destinationLocation = destination.substr(0, destination.lastIndexOf("/"));
    let relativePath = posixPath.relative(sourceLocation, destinationLocation);
    relativePath += destination.substr(destination.lastIndexOf("/"));
    if (!posixPath.extname(name))
      relativePath = relativePath.replace(posixPath.extname(relativePath), "");
    return relativePath;
  }

  private updateTargetFileReferenceAt(index: number, currentTargetPath: string, source: string, destination: string, name: string) {
    let validationResponse = this.isValidReference(index, currentTargetPath, name);
    if (validationResponse.isValid) {
      currentTargetPath = currentTargetPath.replace(source, "");
      currentTargetPath = destination + currentTargetPath;
      currentTargetPath = this.getRelativePath(this._filePath, currentTargetPath, name);
      if (currentTargetPath[0] != '.') {
        currentTargetPath = "./" + currentTargetPath;
      }
      this._fileContent = this._fileContent.substring(0, validationResponse.startingIndex + 1) + currentTargetPath + this._fileContent.substring(validationResponse.endingIndex);
    }
  }

  private updateSearchFileReferenceAt(index: number, refernceFilePath: string, source: string, destination: string, name: string) {
    let validationResponse = this.isValidReference(index, refernceFilePath, name);
    if (validationResponse.isValid) {
      let currentTargetPath = this._filePath;
      currentTargetPath = currentTargetPath.replace(source, "");
      currentTargetPath = destination + currentTargetPath;
      currentTargetPath = this.getRelativePath(currentTargetPath, refernceFilePath, name);
      if (currentTargetPath[0] != '.') {
        currentTargetPath = "./" + currentTargetPath;
      }
      this._fileContent = this._fileContent.substring(0, validationResponse.startingIndex + 1) + currentTargetPath + this._fileContent.substring(validationResponse.endingIndex);
    }
  }

  public updateFileContent1(currentTargetPath: string, source: string, destination: string, name: string): void {
    let count = 1;
    let position = 0;
    while (position < this._fileContent.length) {
      position = this.getPosition(name, count);
      if (position === this._fileContent.length) {
        break;
      }
      this.updateTargetFileReferenceAt(position, currentTargetPath, source, destination, name);
      count++;
    }
  }

  public updateTargetFileContent(refernceFilePath: string, source: string, destination: string, name: string): void {
    let count = 1;
    let position = 0;
    while (position < this._fileContent.length) {
      position = this.getPosition(name, count);
      if (position === this._fileContent.length) {
        break;
      }
      this.updateSearchFileReferenceAt(position, refernceFilePath, source, destination, name);
      count++;
    }
  }

  public updateFileContent(format: PossibleFormat): void {
    let count = 1;
    let position = 0;
    while (position < this._fileContent.length) {
      position = this.getPosition(format.searchString, count);
      if (position === this._fileContent.length) {
        break;
      }
      const info = this.isValidReference(position, format.actualPath, format.searchString);
      if (info.isValid) {
        winston.info(`Replacing ${info.replacingString} with ${format.replaceString}`);
        this._fileContent = this._fileContent.substring(0, info.startingIndex + 1) + format.replaceString + this._fileContent.substring(info.endingIndex);
        this.shouldSave = true;
      }
      count++;
    }
  }

  public saveFile(): void {
    if (this.shouldSave) {
      fs.writeFileSync(this._filePath, this._fileContent);
      winston.info('File saved successfully');
    } else {
      winston.info('No need to save the file as no content updated');
    }
  }
}