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
    FolderHandler.getFilesList = function (dir, excludeList, filelist) {
        if (excludeList === void 0) { excludeList = []; }
        if (filelist === void 0) { filelist = []; }
        var excludes = excludeList.concat(config.exclude);
        if (!fs.statSync(dir).isDirectory()) {
            filelist = filelist.concat(new FileHandler_1.FileHandler(dir));
            return filelist;
        }
        fs.readdirSync(dir).forEach(function (file) {
            var filePath = posixPath.join(dir, file);
            var fileExtension = posixPath.extname(file).toLowerCase();
            filelist = fs.statSync(filePath).isDirectory()
                ? excludes.indexOf(file) === -1 && excludes.indexOf(filePath) === -1
                    ? FolderHandler.getFilesList(filePath, excludeList, filelist)
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