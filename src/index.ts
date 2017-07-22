import fs = require("fs");

const change_copy = (resource: string, source: string, destination: string) => {
    console.log(resource + source + destination);
    // Check if source is file or folder and does it exists
    try {
        let isDirectory = fs.lstatSync(source).isDirectory();
        if(isDirectory) {
            console.log(`We are currently not supporting folder copy.`);
            process.exit(-1);
        }
        
    } catch (e) {
        console.log(e);
        console.log("Failed to process your request");
        process.exit(-1);
    }
}

module.exports = { change_copy };