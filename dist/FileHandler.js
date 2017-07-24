"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var posixPath = path.posix;
var FileHandler = (function () {
    function FileHandler(_filePath) {
        this._filePath = _filePath;
    }
    FileHandler.prototype.filePath = function () {
        return this._filePath;
    };
    FileHandler.prototype.nameWithExtension = function () {
        return posixPath.basename(this._filePath);
    };
    FileHandler.prototype.nameWithOutExtension = function () {
        var extension = posixPath.extname(this._filePath);
        return posixPath.basename(this._filePath).replace(extension, "");
    };
    FileHandler.prototype.getFileContent = function () {
        if (!this._fileContent)
            this._fileContent = fs.readFileSync(this._filePath, "utf8");
        return this._fileContent;
    };
    FileHandler.prototype.isValidReference = function (index, currentTargetPath, name) {
        var endingIndex = index + name.length;
        if (this._fileContent[endingIndex] === "'"
            || this._fileContent[endingIndex] === '"' ||
            this._fileContent[endingIndex] === "`") {
            var endingString = this._fileContent[endingIndex];
            var startingIndex = endingIndex;
            while (startingIndex--) {
                if (this._fileContent[startingIndex] === endingString) {
                    break;
                }
            }
            var replaceString = this._fileContent.substring(startingIndex + 1, endingIndex);
            var pathInFile = posixPath.join(posixPath.dirname(this._filePath), replaceString);
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
    };
    FileHandler.prototype.getPosition = function (name, count) {
        return this._fileContent.split(name, count).join(name).length;
    };
    FileHandler.prototype.getRelativePath = function (source, destination, name) {
        var sourceLocation = source.substr(0, source.lastIndexOf("/"));
        var destinationLocation = destination.substr(0, destination.lastIndexOf("/"));
        var relativePath = posixPath.relative(sourceLocation, destinationLocation);
        relativePath += destination.substr(destination.lastIndexOf("/"));
        if (!posixPath.extname(name))
            relativePath = relativePath.replace(posixPath.extname(relativePath), "");
        return relativePath;
    };
    FileHandler.prototype.updateTargetFileReferenceAt = function (index, currentTargetPath, source, destination, name) {
        var validationResponse = this.isValidReference(index, currentTargetPath, name);
        if (validationResponse.isValid) {
            currentTargetPath = currentTargetPath.replace(source, "");
            currentTargetPath = destination + currentTargetPath;
            currentTargetPath = this.getRelativePath(this._filePath, currentTargetPath, name);
            if (currentTargetPath[0] != '.') {
                currentTargetPath = "./" + currentTargetPath;
            }
            this._fileContent = this._fileContent.substring(0, validationResponse.startingIndex + 1) + currentTargetPath + this._fileContent.substring(validationResponse.endingIndex);
        }
    };
    FileHandler.prototype.updateSearchFileReferenceAt = function (index, refernceFilePath, source, destination, name) {
        var validationResponse = this.isValidReference(index, refernceFilePath, name);
        if (validationResponse.isValid) {
            var currentTargetPath = this._filePath;
            currentTargetPath = currentTargetPath.replace(source, "");
            currentTargetPath = destination + currentTargetPath;
            currentTargetPath = this.getRelativePath(currentTargetPath, refernceFilePath, name);
            if (currentTargetPath[0] != '.') {
                currentTargetPath = "./" + currentTargetPath;
            }
            this._fileContent = this._fileContent.substring(0, validationResponse.startingIndex + 1) + currentTargetPath + this._fileContent.substring(validationResponse.endingIndex);
        }
    };
    FileHandler.prototype.updateFileContent = function (currentTargetPath, source, destination, name) {
        var count = 1;
        var position = 0;
        while (position < this._fileContent.length) {
            position = this.getPosition(name, count);
            if (position === this._fileContent.length) {
                break;
            }
            this.updateTargetFileReferenceAt(position, currentTargetPath, source, destination, name);
            count++;
        }
    };
    FileHandler.prototype.updateTargetFileContent = function (refernceFilePath, source, destination, name) {
        var count = 1;
        var position = 0;
        while (position < this._fileContent.length) {
            position = this.getPosition(name, count);
            if (position === this._fileContent.length) {
                break;
            }
            this.updateSearchFileReferenceAt(position, refernceFilePath, source, destination, name);
            count++;
        }
    };
    FileHandler.prototype.saveFile = function () {
        fs.writeFileSync(this._filePath, this._fileContent);
    };
    return FileHandler;
}());
exports.FileHandler = FileHandler;
//# sourceMappingURL=FileHandler.js.map