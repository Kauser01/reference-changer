import path = require("path");
import fs = require("fs");

import { IFileHandler, FileHandler } from "./FileHandler";
import IConfig from "./IConfig";
let config: IConfig = require("../common/config");

let posixPath = path.posix;


export default class FolderHandler {

  public static getFilesList(dir: string, excludeList: string[] = [], filelist: IFileHandler[] = []): IFileHandler[] {
    const excludes = excludeList.concat(config.exclude);
    if (!fs.statSync(dir).isDirectory()) {
      filelist = filelist.concat(new FileHandler(dir));
      return filelist;
    }
    fs.readdirSync(dir).forEach(file => {
      const filePath = posixPath.join(dir, file);
      const fileExtension = posixPath.extname(file).toLowerCase();
      filelist = fs.statSync(filePath).isDirectory()
        ? excludes.indexOf(file) === -1 && excludes.indexOf(filePath) === -1
          ? FolderHandler.getFilesList(filePath, excludeList, filelist)
          : filelist
        : config.includedFileTypes.indexOf(fileExtension) > -1
          ? filelist.concat(new FileHandler(filePath))
          : filelist;

    });
    return filelist;
  }

  public static getFiles = (dir: string, source: string = "", filelist: IFileHandler[] = []): IFileHandler[] => {
    fs.readdirSync(dir).forEach(file => {
      let filePath = posixPath.join(dir, file);
      let nameWithoutExtension = file.replace(posixPath.extname(file), "");
      let fileExtension = posixPath.extname(file).toLowerCase();
      filelist = fs.statSync(filePath).isDirectory()
        ? config.exclude.indexOf(file) === -1 && filePath !== source
          ? FolderHandler.getFiles(filePath, source, filelist)
          : filelist
        : config.includedFileTypes.indexOf(fileExtension) > -1
          ? filelist.concat(new FileHandler(filePath))
          : filelist;

    });
    return filelist;
  }
}