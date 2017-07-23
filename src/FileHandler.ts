import path = require("path");
import fs = require("fs");

let posixPath = path.posix;

export interface IFileHandler {
    filePath(): string;
    nameWithExtension(): string;
    nameWithOutExtension(): string;
    getFileContent(): string;
    updateFileContent(currentTargetPath: string, source: string, destination: string, name: string): void;
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

    private updateRefernceAt(index: number, currentTargetPath: string, source: string, destination: string, name: string) {
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
                currentTargetPath = currentTargetPath.replace(source, "");
                currentTargetPath = destination + currentTargetPath;
                currentTargetPath = currentTargetPath.replace(posixPath.extname(currentTargetPath), "");
                currentTargetPath = posixPath.relative(posixPath.dirname(this._filePath), currentTargetPath);
                if (currentTargetPath[0] != '.') {
                    currentTargetPath = "./" + currentTargetPath;
                }
                if (posixPath.extname(name)) {
                    currentTargetPath += posixPath.extname(name);
                }
                this._fileContent = this._fileContent.substring(0, startingIndex + 1) + currentTargetPath + this._fileContent.substring(endingIndex);
            }
        }
    }

    private getPosition(name: string, count: number): number {
        return this._fileContent.split(name, count).join(name).length;
    }

    public updateFileContent(currentTargetPath: string, source: string, destination: string, name: string): void {
        let count = 1;
        let position = 0;
        while (position < this._fileContent.length) {
            position = this.getPosition(name, count);
            if (position === this._fileContent.length) {
                break;
            }
            this.updateRefernceAt(position, currentTargetPath, source, destination, name);
            count++;
        }
    }

    public saveFile(): void {
        fs.writeFileSync(this._filePath, this._fileContent);
    }
}