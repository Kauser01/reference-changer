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
            var nameWithoutExtension = file.replace(posixPath.extname(file), "");
            var fileExtension = posixPath.extname(file).toLowerCase();
            filelist = fs.statSync(filePath).isDirectory()
                ? config.exclude.indexOf(file) === -1 && filePath !== source
                    ? FolderHandler.getFiles(filePath, source, filelist)
                    : filelist
                : config.includedFileTypes.indexOf(fileExtension) > -1
                    ? filelist.concat(new FileHandler_1.FileHandler(filePath))
                    : filelist;
        });
        return filelist;
    };
    return FolderHandler;
}());
exports.default = FolderHandler;
//# sourceMappingURL=FolderHandler.js.map