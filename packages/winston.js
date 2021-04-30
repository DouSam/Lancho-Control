var winston = require('winston');
var moment = require('moment');

const myFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
//2
var options = {
    file: {
        level: 'info',
        filename: `${process.cwd()}/log/logs/${moment().format('DD-MM-YYYY')}.log`,
        handleExceptions: true, 
        format: winston.format.combine(
            winston.format.timestamp(),
            myFormat
        ),
        colorize: true,
    },
    console: {
        level: 'info',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

var logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    },
};

module.exports = logger;