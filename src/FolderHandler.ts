import path = require("path");
import fs = require("fs");

import { IFileHandler, FileHandler } from "./FileHandler";
let config = require("../common/config");

let posixPath = path.posix;

export default class FolderHandler {
    public static getFiles = (dir: string, filelist: IFileHandler[] = []): IFileHandler[] => {
        fs.readdirSync(dir).forEach(file => {
            filelist = fs.statSync(posixPath.join(dir, file)).isDirectory()
                ? config.exclude.indexOf(file) === -1
                    ? FolderHandler.getFiles(posixPath.join(dir, file), filelist)
                    : filelist
                : filelist.concat(new FileHandler(posixPath.join(dir, file)));

        });
        return filelist;
    }
}