// logger.js
const winston = require('winston');

const logConfiguration = {
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), 
    new winston.transports.Console({ level: 'info' })
  ]
};

const logger = winston.createLogger(logConfiguration);

module.exports = logger;
