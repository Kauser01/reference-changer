import path = require("path");
import fs = require("fs");

let posixPath = path.posix;

interface ValidationOutput {
    isValid: boolean;
    startingIndex: number;
    endingIndex: number;
}

export interface IFileHandler {
    filePath(): string;
    nameWithExtension(): string;
    nameWithOutExtension(): string;
    getFileContent(): string;
    updateFileContent(currentTargetPath: string, source: string, destination: string, name: string): void;
    updateTargetFileContent(refernceFilePath: string, source: string, destination: string, name: string): void;
    saveFile(): void;
}

export class FileHandler implements IFileHandler {
    private _fileContent: string;
    constructor(private _filePath: string) { }

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
                    endingIndex: endingIndex
                };
            }
        }
        return {
            isValid: false,
            startingIndex: -1,
            endingIndex: -1
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

    public updateFileContent(currentTargetPath: string, source: string, destination: string, name: string): void {
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

    public saveFile(): void {
        fs.writeFileSync(this._filePath, this._fileContent);
    }
}