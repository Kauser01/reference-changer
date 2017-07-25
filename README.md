# Reference changer

[![build-image]][build-url]

`Reference changer` is a command-line utility that helps in moving folders/files from one location to another. It automatically changes the references in the project repository

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
<sub><sup>*Note: To change all the references in the project, run this command from root directory of that project.</sup></sub>

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

## Upcoming enhancement
- Include/exclude list of folders/files from user provided configuration.

[build-image]: https://travis-ci.org/Jagapathi126/reference-changer.svg?branch=master
[build-url]: https://github.com/Jagapathi126/reference-changer
