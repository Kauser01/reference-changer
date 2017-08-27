import * as winston from 'winston';
import * as path from 'path';
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ],
  exceptionHandlers: [
    new (winston.transports.Console)()
  ]
});

export default logger;