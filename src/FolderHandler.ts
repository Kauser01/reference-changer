import path = require("path");
import fs = require("fs");

import { IFileHandler, FileHandler } from "./FileHandler";
let config = require("../common/config");

let posixPath = path.posix;

export default class FolderHandler {
    public static getFiles = (dir: string, source: string = "", filelist: IFileHandler[] = []): IFileHandler[] => {
        fs.readdirSync(dir).forEach(file => {
            let filePath = posixPath.join(dir, file);
            filelist = fs.statSync(filePath).isDirectory()
                ? config.exclude.indexOf(file) === -1 && filePath !== source
                    ? FolderHandler.getFiles(filePath, source, filelist)
                    : filelist
                : filelist.concat(new FileHandler(posixPath.join(dir, file)));

        });
        return filelist;
    }
}