"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var FileHandler_1 = require("./FileHandler");
var config = require("../common/config");
var posixPath = path.posix;
var FolderHandler = (function () {
    function FolderHandler() {
    }
    FolderHandler.getFiles = function (dir, source, filelist) {
        if (source === void 0) { source = ""; }
        if (filelist === void 0) { filelist = []; }
        fs.readdirSync(dir).forEach(function (file) {
            var filePath = posixPath.join(dir, file);
            filelist = fs.statSync(filePath).isDirectory()
                ? config.exclude.indexOf(file) === -1 && filePath !== source
                    ? FolderHandler.getFiles(filePath, source, filelist)
                    : filelist
                : filelist.concat(new FileHandler_1.FileHandler(posixPath.join(dir, file)));
        });
        return filelist;
    };
    return FolderHandler;
}());
exports.default = FolderHandler;
//# sourceMappingURL=FolderHandler.js.map