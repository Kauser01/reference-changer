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
    FileHandler.prototype.updateRefernceAt = function (index, currentTargetPath, source, destination, name) {
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
                currentTargetPath = currentTargetPath.replace(source, "");
                currentTargetPath = destination + currentTargetPath;
                currentTargetPath = currentTargetPath.replace(posixPath.extname(currentTargetPath), "");
                currentTargetPath = posixPath.relative(posixPath.dirname(this._filePath), currentTargetPath);
                if (currentTargetPath[0] != '.') {
                    currentTargetPath = "./" + currentTargetPath;
                }
                this._fileContent = this._fileContent.substring(0, startingIndex + 1) + currentTargetPath + this._fileContent.substring(endingIndex);
                return;
            }
            else {
                return;
            }
        }
    };
    FileHandler.prototype.updateFileContent = function (currentTargetPath, source, destination, name) {
        var _this = this;
        var regex = new RegExp(name, "gi");
        var result, indices = [];
        while ((result = regex.exec(this._fileContent))) {
            indices.push(result.index);
        }
        indices.forEach(function (index) {
            _this.updateRefernceAt(index, currentTargetPath, source, destination, name);
        });
    };
    FileHandler.prototype.saveFile = function () {
        fs.writeFileSync(this._filePath, this._fileContent);
    };
    return FileHandler;
}());
exports.FileHandler = FileHandler;
//# sourceMappingURL=FileHandler.js.map