import fs = require("fs");
import path = require("path");
import fs_extra = require("fs-extra");
import * as winston from 'winston';

import { IFileHandler, FileHandler } from "./FileHandler";
import FolderHandler from "./FolderHandler";
import Utilities from './Utilities';
let config = require("../common/config");

let posixPath = path.posix;

export default class ReferenceChanger {
  private sourceFilesList: IFileHandler[] = [];
  private targetFilesList: IFileHandler[] = [];

  constructor(private resource: string, private source: string, private destination: string) {
    this.resource = this.resource.replace(/\\/g, "/");
    this.source = this.source.replace(/\\/g, "/");
    this.destination = this.destination.replace(/\\/g, "/");
    if (!posixPath.isAbsolute(this.source))
      this.source = posixPath.join(this.resource, this.source);
    if (!posixPath.isAbsolute(this.destination))
      this.destination = posixPath.join(this.resource, this.destination);

  }

  public changeReference = () => {
    try {
      if (!fs.existsSync(this.source)) {
        winston.info(`Specified source ${this.source} doesn't exists`);
        process.exit(1);
      }
      winston.info(`Fetching files in source and target location`);
      this.sourceFilesList = FolderHandler.getFilesList(this.source);
      this.targetFilesList = FolderHandler.getFilesList(this.resource, [this.source]);
      winston.info(`Replacing target references in source files`);
      this.sourceFilesList.forEach(sourceFile => {
        winston.info(`Working with file ${sourceFile.filePath()}`);
        let sourceFinalPath = sourceFile.filePath().replace(this.source, '');
        sourceFinalPath = this.destination + sourceFinalPath;
        this.targetFilesList.forEach(targetFile => {
          const possibleFormats = targetFile.getPossibleNameFormats(sourceFile.filePath());
          possibleFormats.forEach(format => {
            format.replaceString = Utilities.getReplaceString(sourceFinalPath, targetFile.filePath(), format);
            sourceFile.updateFileContent(format);
          });
        });
        sourceFile.saveFile();
      });

      winston.info(`Replacing source references in target files`);
      this.targetFilesList.forEach(targetFile => {
        winston.info(`Working with file ${targetFile.filePath()}`);
        this.sourceFilesList.forEach(sourceFile => {
          let sourceFinalPath = sourceFile.filePath().replace(this.source, '');
          sourceFinalPath = this.destination + sourceFinalPath;
          const possibleFormats = sourceFile.getPossibleNameFormats(targetFile.filePath());
          possibleFormats.forEach(format => {
            format.replaceString = Utilities.getReplaceString(targetFile.filePath(), sourceFinalPath, format);
            targetFile.updateFileContent(format);
          });
        });
        targetFile.saveFile();
      });

      winston.info('References changed successfully');
      winston.info('Moving the files');
      fs_extra.copySync(this.source, this.destination);
      winston.info('Files copied successfully');
      winston.info('Deleting old files');
      fs_extra.removeSync(this.source);
      winston.info('Old files deleted successfully');
      process.exit(0);
    } catch (e) {
      console.log(e);
      console.log("Failed to process your request");
      process.exit(-1);
    }
  }
}