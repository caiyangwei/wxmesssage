let schedule = require('node-schedule');
const { timingMessageHandler } = require('../service/message');

function initTimer() {
    schedule.scheduleJob('1 * * * * *', async function () {
        await timingMessageHandler();
    })
}

module.exports = {
    initTimer
}