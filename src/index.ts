import fs = require("fs");
import path = require("path");
import fs_extra = require("fs-extra");

import { IFileHandler, FileHandler } from "./FileHandler";
import FolderHandler from "./FolderHandler";
let config = require("../common/config");

let posixPath = path.posix;

export default class ReferenceChanger {
    private searchFilesList: IFileHandler[] = [];
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

    public change_copy = () => {
        // Check if source is file or folder and does it exists
        // Test to check it is not updating general content like index.ts
        try {
            this.searchFilesList = FolderHandler.getFiles(this.resource, this.source);
            if (fs.statSync(this.source).isDirectory()) {
                this.targetFilesList = FolderHandler.getFiles(this.source);
            } else {
                this.targetFilesList = [new FileHandler(this.source)];
            }
            this.searchFilesList.forEach(file => {
                this.targetFilesList.forEach(targetFile => {
                    let fileContent = file.getFileContent();
                    let name = targetFile.nameWithExtension();
                    if (fileContent.indexOf(name) > -1) {
                        file.updateFileContent(targetFile.filePath(), this.source, this.destination, name);
                    }
                    name = targetFile.nameWithOutExtension();
                    if (fileContent.indexOf(name) > -1) {
                        file.updateFileContent(targetFile.filePath(), this.source, this.destination, name);
                    }
                });
                file.saveFile();
            });
            console.log(`Reference updated successfully`);
            console.log(`Copying the files`);
            fs_extra.copySync(this.source, this.destination);
            console.log(`Content copied successfully`);
            console.log(`Remove initial directory/folder`);
            fs_extra.removeSync(this.source);
            console.log(`Successfully deleted older content`);
            process.exit(0);
        } catch (e) {
            console.log(e);
            console.log("Failed to process your request");
            process.exit(-1);
        }
    }
}