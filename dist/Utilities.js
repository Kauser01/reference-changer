"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var posixPath = path.posix;
var Utilities = (function () {
    function Utilities() {
    }
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