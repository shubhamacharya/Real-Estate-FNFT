
const { createLogger, format, transports } = require('winston');
const LOG_FILE_PATH = `${__basedir}/logs/log.log`; // NOSONAR - Basedir is globally defined

const options = {
    file: {
        level: 'debug',
        filename: LOG_FILE_PATH,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
        eol: '\r\n',
        timestamp: true,
        prettyPrint: true,
        format: format.combine(
            format.timestamp(),
            format.json()
        )
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: true,
        colorize: true,
        eol: '\r\n',
        timestamp: true,
        prettyPrint: true
    }
};

const logger = createLogger({
    format: format.json(),
    transports: [
        new transports.File(options.file),
        new transports.Console(options.console)
    ],
    exitOnError: false
});

logger.stream = {
    write(message) {
        logger.info(message);
    }
};

module.exports = logger;
