"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var fs_extra = require("fs-extra");
var FileHandler_1 = require("./FileHandler");
var FolderHandler_1 = require("./FolderHandler");
var config = require("../common/config");
var posixPath = path.posix;
var ReferenceChanger = (function () {
    function ReferenceChanger(resource, source, destination) {
        var _this = this;
        this.resource = resource;
        this.source = source;
        this.destination = destination;
        this.searchFilesList = [];
        this.targetFilesList = [];
        this.change_copy = function () {
            // Check if source is file or folder and does it exists
            // Test to check it is not updating general content like index.ts
            try {
                console.log("Fetching folders to search for reference changes");
                _this.searchFilesList = FolderHandler_1.default.getFiles(_this.resource, _this.source);
                console.log("Getting target files whose reference needs to be changed in search files list");
                if (fs.statSync(_this.source).isDirectory()) {
                    _this.targetFilesList = FolderHandler_1.default.getFiles(_this.source);
                }
                else {
                    _this.targetFilesList = [new FileHandler_1.FileHandler(_this.source)];
                }
                console.log("Replacing target file references in search files");
                _this.searchFilesList.forEach(function (file) {
                    _this.targetFilesList.forEach(function (targetFile) {
                        var fileContent = file.getFileContent();
                        var name = targetFile.nameWithExtension();
                        if (fileContent.indexOf(name) > -1) {
                            file.updateFileContent(targetFile.filePath(), _this.source, _this.destination, name);
                        }
                        name = targetFile.nameWithOutExtension();
                        if (fileContent.indexOf(name) > -1) {
                            file.updateFileContent(targetFile.filePath(), _this.source, _this.destination, name);
                        }
                        var filePathComponents = file.filePath().split("/");
                        var folderName = filePathComponents[filePathComponents.length - 2];
                        if (name === "index" && fileContent.indexOf(folderName) > -1) {
                            var filePath = targetFile.filePath().replace(targetFile.nameWithExtension(), "");
                            file.updateFileContent(filePath, _this.source, _this.destination, folderName);
                        }
                    });
                    file.saveFile();
                });
                console.log("Replacing search file references in target files");
                _this.targetFilesList.forEach(function (file) {
                    _this.searchFilesList.forEach(function (searchFile) {
                        var fileContent = file.getFileContent();
                        var name = searchFile.nameWithExtension();
                        if (fileContent.indexOf(name) > -1) {
                            file.updateTargetFileContent(searchFile.filePath(), _this.source, _this.destination, name);
                        }
                        name = searchFile.nameWithOutExtension();
                        if (fileContent.indexOf(name) > -1) {
                            file.updateTargetFileContent(searchFile.filePath(), _this.source, _this.destination, name);
                        }
                        var filePathComponents = file.filePath().split("/");
                        var folderName = filePathComponents[filePathComponents.length - 2];
                        if (name === "index" && fileContent.indexOf(folderName) > -1) {
                            var filePath = searchFile.filePath().replace(searchFile.nameWithExtension(), "");
                            file.updateTargetFileContent(filePath, _this.source, _this.destination, folderName);
                        }
                    });
                    file.saveFile();
                });
                console.log("Reference updated successfully");
                console.log("Copying the files");
                fs_extra.copySync(_this.source, _this.destination);
                console.log("Content copied successfully");
                console.log("Remove initial directory/folder");
                fs_extra.removeSync(_this.source);
                console.log("Successfully deleted older content");
                process.exit(0);
            }
            catch (e) {
                console.log(e);
                console.log("Failed to process your request");
                process.exit(-1);
            }
        };
        this.resource = this.resource.replace(/\\/g, "/");
        this.source = this.source.replace(/\\/g, "/");
        this.destination = this.destination.replace(/\\/g, "/");
        if (!posixPath.isAbsolute(this.source))
            this.source = posixPath.join(this.resource, this.source);
        if (!posixPath.isAbsolute(this.destination))
            this.destination = posixPath.join(this.resource, this.destination);
    }
    return ReferenceChanger;
}());
exports.default = ReferenceChanger;
//# sourceMappingURL=index.js.map