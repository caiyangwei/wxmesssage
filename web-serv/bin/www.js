const { initDB } = require('../../common/db/peter');
const { initProducer } = require('../../MQ/init/producer');
const Logger = require('../../common/lib/logger');
const { initTimer } = require('../timer/index');

async function init() {
    await initDB();
    Logger.info('initDB is success !');
    await initProducer();
    Logger.info('initMQ is success !')
    initTimer();
    Logger.info('initTimer is success !')
}

module.exports = {
    init
}
