const Log4js = require('log4js');
const path = require('path');
Log4js.configure({
    appenders: {
        out: { type: 'console' },
        infoLog: { type: 'dateFile', pattern: 'yyyy-MM-dd', alwaysIncludePattern: true, filename: path.join(__dirname, '../../log/info') },
        info: { type: 'logLevelFilter', level: 'DEBUG', maxLevel: 'INFO', appender: 'infoLog' },
        errorLog: { type: 'dateFile', pattern: 'yyyy-MM-dd', alwaysIncludePattern: true, filename: path.join(__dirname, '../../log/error') },
        error: { type: "logLevelFilter", level: "error", appender: 'errorLog' }
    },
    categories: {
        default: { appenders: ['out', 'error', 'info'], level: 'info' }
    }
})
const logger = Log4js.getLogger('wx-wechat');

class Logger {
    constructor() {

    }

    static debug(message) {
        logger.debug(message);
    }

    static info(message) {
        logger.info(message);
    }

    static error(message) {
        logger.error(message);
    }

    static warn(message) {
        logger.warn(message);
    }
}

module.exports = Logger;