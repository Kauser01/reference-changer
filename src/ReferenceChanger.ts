import fs = require("fs");
import path = require("path");
import fs_extra = require("fs-extra");
import logger from './logger';

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
        logger.info(`Specified source ${this.source} doesn't exists`);
        process.exit(1);
      }
      logger.info(`Fetching files in source and target location`);
      this.sourceFilesList = FolderHandler.getFilesList(this.source);
      this.targetFilesList = FolderHandler.getFilesList(this.resource, [this.source]);
      logger.info(`Replacing target references in source files`);
      this.sourceFilesList.forEach(sourceFile => {
        logger.info(`Working with file ${sourceFile.filePath()}`);
        let sourceFinalPath = sourceFile.filePath().replace(this.source, '');
        sourceFinalPath = this.destination + sourceFinalPath;
        this.targetFilesList.forEach(targetFile => {
          const possibleFormats = Utilities.getPossibleNameFormats(targetFile, sourceFile.filePath());
          possibleFormats.forEach(format => {
            format.replaceString = Utilities.getReplaceString(sourceFinalPath, targetFile.filePath(), format);
            sourceFile.updateFileContent(format);
          });
        });
        sourceFile.saveFile();
      });

      logger.info(`Replacing source references in target files`);
      this.targetFilesList.forEach(targetFile => {
        logger.info(`Working with file ${targetFile.filePath()}`);
        this.sourceFilesList.forEach(sourceFile => {
          let sourceFinalPath = sourceFile.filePath().replace(this.source, '');
          sourceFinalPath = this.destination + sourceFinalPath;
          const possibleFormats = Utilities.getPossibleNameFormats(sourceFile, targetFile.filePath());
          possibleFormats.forEach(format => {
            format.replaceString = Utilities.getReplaceString(targetFile.filePath(), sourceFinalPath, format);
            targetFile.updateFileContent(format);
          });
        });
        targetFile.saveFile();
      });

      logger.info('References changed successfully');
      logger.info('Moving the files');
      fs_extra.copySync(this.source, this.destination);
      logger.info('Files copied successfully');
      logger.info('Deleting old files');
      fs_extra.removeSync(this.source);
      logger.info('Old files deleted successfully');
      process.exit(0);
    } catch (e) {
      logger.error(e);
      logger.error("Failed to process your request");
      process.exit(-1);
    }
  }
}