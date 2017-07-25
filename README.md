# Reference changer

[![build-image]][build-url]

`Reference change` is a command-line utility that helps moving of folders/files from one location to another. Advantage of using this is, it automatically change the references in the repository

# Install

With [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):

	npm install reference-changer -g 

You can now use `reference-changer` from the command line.

Use this command in the root directory of your project to replace the references in all the files in your project.

## Examples

Move single file from one location to another

```
refernce-changer ./path/to/file ./destination/path/to/file
```

Move folder from one location to another

```
refernce-changer ./path/to/folder ./destination/path/to/folder
```
<sub><sup>*Note: This command should be run from root directory of project to replace all the reference in the project</sup></sub>

# Details

## Excludes

By default, the following folders are excluded from changing references.
```
node_modules
typings
.vscode
.git
.idea
```

## Enhancements
- Accept a configuration to accept exclude list.
- Accept a configuration to accept include list to avoid default excludes.


[build-image]: https://travis-ci.org/Jagapathi126/reference-changer.svg?branch=master
[build-url]: https://github.com/Jagapathi126/reference-changer
