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
    FolderHandler.getFiles = function (dir, filelist) {
        if (filelist === void 0) { filelist = []; }
        fs.readdirSync(dir).forEach(function (file) {
            filelist = fs.statSync(posixPath.join(dir, file)).isDirectory()
                ? config.exclude.indexOf(file) === -1
                    ? FolderHandler.getFiles(posixPath.join(dir, file), filelist)
                    : filelist
                : filelist.concat(new FileHandler_1.FileHandler(posixPath.join(dir, file)));
        });
        return filelist;
    };
    return FolderHandler;
}());
exports.default = FolderHandler;
//# sourceMappingURL=FolderHandler.js.map