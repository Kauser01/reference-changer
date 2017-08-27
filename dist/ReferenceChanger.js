"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var fs_extra = require("fs-extra");
var winston = require("winston");
var FolderHandler_1 = require("./FolderHandler");
var Utilities_1 = require("./Utilities");
var config = require("../common/config");
var posixPath = path.posix;
var ReferenceChanger = (function () {
    function ReferenceChanger(resource, source, destination) {
        var _this = this;
        this.resource = resource;
        this.source = source;
        this.destination = destination;
        this.sourceFilesList = [];
        this.targetFilesList = [];
        this.changeReference = function () {
            try {
                if (!fs.existsSync(_this.source)) {
                    winston.info("Specified source " + _this.source + " doesn't exists");
                    process.exit(1);
                }
                winston.info("Fetching files in source and target location");
                _this.sourceFilesList = FolderHandler_1.default.getFilesList(_this.source);
                _this.targetFilesList = FolderHandler_1.default.getFilesList(_this.resource, [_this.source]);
                winston.info("Replacing target references in source files");
                _this.sourceFilesList.forEach(function (sourceFile) {
                    winston.info("Working with file " + sourceFile.filePath());
                    var sourceFinalPath = sourceFile.filePath().replace(_this.source, '');
                    sourceFinalPath = _this.destination + sourceFinalPath;
                    _this.targetFilesList.forEach(function (targetFile) {
                        var possibleFormats = Utilities_1.default.getPossibleNameFormats(targetFile, sourceFile.filePath());
                        possibleFormats.forEach(function (format) {
                            format.replaceString = Utilities_1.default.getReplaceString(sourceFinalPath, targetFile.filePath(), format);
                            sourceFile.updateFileContent(format);
                        });
                    });
                    sourceFile.saveFile();
                });
                winston.info("Replacing source references in target files");
                _this.targetFilesList.forEach(function (targetFile) {
                    winston.info("Working with file " + targetFile.filePath());
                    _this.sourceFilesList.forEach(function (sourceFile) {
                        var sourceFinalPath = sourceFile.filePath().replace(_this.source, '');
                        sourceFinalPath = _this.destination + sourceFinalPath;
                        var possibleFormats = Utilities_1.default.getPossibleNameFormats(sourceFile, targetFile.filePath());
                        possibleFormats.forEach(function (format) {
                            format.replaceString = Utilities_1.default.getReplaceString(targetFile.filePath(), sourceFinalPath, format);
                            targetFile.updateFileContent(format);
                        });
                    });
                    targetFile.saveFile();
                });
                winston.info('References changed successfully');
                winston.info('Moving the files');
                fs_extra.copySync(_this.source, _this.destination);
                winston.info('Files copied successfully');
                winston.info('Deleting old files');
                fs_extra.removeSync(_this.source);
                winston.info('Old files deleted successfully');
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
//# sourceMappingURL=ReferenceChanger.js.map