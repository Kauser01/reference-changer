"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var posixPath = path.posix;
var Utilities = (function () {
    function Utilities() {
    }
    Utilities.getPossibleNameFormats = function (targetFile, searchFilePath) {
        var possibleFormat = [];
        possibleFormat.push({
            isFile: true,
            searchString: targetFile.nameWithExtension(),
            actualPath: targetFile.filePath()
        });
        possibleFormat.push({
            isFile: true,
            searchString: targetFile.nameWithOutExtension(),
            actualPath: targetFile.filePath()
        });
        if (targetFile.nameWithOutExtension() === "index") {
            var folderStack = targetFile.filePath().split('/');
            possibleFormat.push({
                isFile: false,
                searchString: folderStack[folderStack.length - 2],
                actualPath: targetFile.filePath()
            });
            var currentFilePathWithoutName = targetFile.filePath().replace(targetFile.nameWithExtension(), '');
            var targetFilePathWithoutName = searchFilePath.substring(0, searchFilePath.lastIndexOf('/'));
            var relativePath = posixPath.relative(targetFilePathWithoutName, currentFilePathWithoutName);
            possibleFormat.push({
                isFile: false,
                searchString: relativePath ? "./" + relativePath : './',
                actualPath: targetFile.filePath()
            });
            if (relativePath.match('/$')) {
                possibleFormat.push({
                    isFile: false,
                    searchString: "./" + relativePath.substring(0, relativePath.length - 1),
                    actualPath: targetFile.filePath()
                });
            }
            else if (relativePath !== '/' && relativePath !== '') {
                possibleFormat.push({
                    isFile: false,
                    searchString: "./" + relativePath + "/",
                    actualPath: targetFile.filePath()
                });
            }
            if (relativePath.match('^..')) {
                possibleFormat.push({
                    isFile: false,
                    searchString: relativePath,
                    actualPath: targetFile.filePath()
                });
                possibleFormat.push({
                    isFile: false,
                    searchString: relativePath + "/",
                    actualPath: targetFile.filePath()
                });
            }
        }
        return possibleFormat;
    };
    Utilities.getReplaceString = function (replaceIn, replaceWith, format) {
        var sourceLocation = replaceIn.substr(0, replaceIn.lastIndexOf("/"));
        var destinationLocation = replaceWith.substr(0, replaceWith.lastIndexOf("/"));
        var relativePath = posixPath.relative(sourceLocation, destinationLocation);
        if (format.isFile) {
            relativePath += replaceWith.substr(replaceWith.lastIndexOf("/"));
            if (!posixPath.extname(format.searchString))
                relativePath = relativePath.replace(posixPath.extname(relativePath), "");
        }
        else {
            var finalName = posixPath.basename(replaceWith).replace(posixPath.extname(replaceWith), '');
            if (relativePath === '/') {
                relativePath = '';
            }
            relativePath = "./" + relativePath;
            if (format.searchString.match('/$') && relativePath !== './') {
                relativePath = relativePath + "/";
            }
            if (finalName !== 'index') {
                if (relativePath.match('/$')) {
                    relativePath = "" + relativePath + finalName;
                }
                else {
                    relativePath = relativePath + "/" + finalName;
                }
            }
        }
        if (relativePath.match('^/')) {
            relativePath = "." + relativePath;
        }
        if (!relativePath.match('^./')) {
            relativePath = "./" + relativePath;
        }
        return relativePath;
    };
    return Utilities;
}());
exports.default = Utilities;
//# sourceMappingURL=Utilities.js.map