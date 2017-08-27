"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReferenceChanger_1 = require("./ReferenceChanger");
var referenceChanger = function (resource, source, destination) {
    var changer = new ReferenceChanger_1.default(resource, source, destination);
    changer.changeReference();
};
exports.default = referenceChanger;
//# sourceMappingURL=index.js.map