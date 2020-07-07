const amqp = require('amqplib');
const Logger = require('../../common/lib/logger');
const MQConfig = require('config').mq;
const _ = require('lodash');
const util = require('../../common/lib/util');

const Porducer = {
    sendMsgToSchoolQ: (message) => { },
    sendMsgToUserQ: (message) => { },
    sendMsgToWxCallBackQ: (message) => { }
}

var amqpConn = null;
var pubChannel = null;

async function initConn() {
    const conneOption = MQConfig.connection;
    let conn = await amqp.connect(conneOption);
    conn.on('error', async (err) => {
        if (err.message !== "Connection closing") {
            Logger.error(`[AMQP Error ]:${err}`);
        }
    })

    conn.on('close', async () => {
        Logger.error(`[AMQP] reconnecting`);
        await util.sleep(2 * 1000);
        await initConn();
    })

    Logger.info(`[AMQP] connected`);
    amqpConn = conn;
    await initChannel();
    await initProducer();
}

async function initChannel() {
    let channel = await amqpConn.createConfirmChannel().catch(async (err) => {
        if (!err.message.indexOf('Connection closed')) {
            await util.sleep(2 * 1000);
            return await initChannel();
        }
        Logger.error(err.message);
    });
    channel.on('err', (err) => {
        Logger.error(`[AMQP] channel error : ${err.message}`);
    })
    channel.on('close', async (err) => {
        Logger.error("[AMQP] channel closed");
    })
    pubChannel = channel;
}

async function initProducer() {
    let queues = MQConfig.serv.queues;
    for (let i = 0; i < queues.length; i++) {
        let q = queues[i];
        await createProducer(q);
    }
}

async function createProducer(qConfig) {
    if (!(qConfig instanceof Object) || typeof (qConfig) != 'object') {
        Logger.error(`MQConfig is fail`);
        return Promise.reject('MQConfig is fail');
    }

    const exchangeName = qConfig.exchangeName;
    const exchangeType = qConfig.exchangeType;
    const routeKey = qConfig.routeKey;
    const queueName = qConfig.queueName;
    const pushFunName = qConfig.pushFunName;

    await pubChannel.assertExchange(exchangeName, exchangeType, { durable: true });
    await pubChannel.assertQueue(queueName, { durable: true });
    await pubChannel.bindQueue(queueName, exchangeName, routeKey);
    Porducer[pushFunName] = async function (message) {
        try {
            pubChannel.publish(exchangeName, routeKey, Buffer.from(JSON.stringify(message)), {
                persistent: true
            });
        } catch (err) {
            Logger.error(`[AMQP] ${queueName} publishMessage: ${err}`);
        }
    }
}

module.exports = {
    Porducer,
    initProducer: initConn
};