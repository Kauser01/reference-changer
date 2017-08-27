"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston = require("winston");
var path = require("path");
var fs = require("fs");
var posixPath = path.posix;
var FileHandler = (function () {
    function FileHandler(_filePath) {
        this._filePath = _filePath;
        this.shouldSave = false;
        this.getFileContent();
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
                    endingIndex: endingIndex,
                    replacingString: replaceString
                };
            }
            else {
                var fileWithoutExtension = currentTargetPath.replace(posixPath.extname(currentTargetPath), '');
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
    };
    FileHandler.prototype.getPosition = function (name, count) {
        return this._fileContent.split(name, count).join(name).length;
    };
    FileHandler.prototype.updateFileContent = function (format) {
        var count = 1;
        var position = 0;
        while (position < this._fileContent.length) {
            position = this.getPosition(format.searchString, count);
            if (position === this._fileContent.length) {
                break;
            }
            var info = this.isValidReference(position, format.actualPath, format.searchString);
            if (info.isValid) {
                winston.info("Replacing " + info.replacingString + " with " + format.replaceString);
                this._fileContent = this._fileContent.substring(0, info.startingIndex + 1) + format.replaceString + this._fileContent.substring(info.endingIndex);
                this.shouldSave = true;
            }
            count++;
        }
    };
    FileHandler.prototype.saveFile = function () {
        if (this.shouldSave) {
            fs.writeFileSync(this._filePath, this._fileContent);
            winston.info('File saved successfully');
        }
        else {
            winston.info('No need to save the file as no content updated');
        }
    };
    return FileHandler;
}());
exports.FileHandler = FileHandler;
//# sourceMappingURL=FileHandler.js.map