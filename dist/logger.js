"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston = require("winston");
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)()
    ],
    exceptionHandlers: [
        new (winston.transports.Console)()
    ]
});
exports.default = logger;
//# sourceMappingURL=logger.js.map