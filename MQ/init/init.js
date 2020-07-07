const util = require('../../common/lib/util');
const MQConfig = require('config').mq;
const cp = require('child_process');
const path = require('path');

initMQ();

async function initMQ() {
    let queues = MQConfig.serv.queues;
    for (let i = 0; i < queues.length; i++) {
        let q = queues[i];
        await initConsumer(q);
    }
    console.log('initMQ is successful');
}

async function initConsumer(q) {
    let consumerCount = q.consumerCount;
    let filePath = path.join(__dirname, './consumer.js');
    cp.exec(`pm2 start ${filePath} -i ${consumerCount} --name ${q.queueName} -- ${q.queueName}`, function (error, stdout, stderr) {
        if (error) {
            Logger.error(error);
        }
    });
    await util.sleep(2 * 1000);
}