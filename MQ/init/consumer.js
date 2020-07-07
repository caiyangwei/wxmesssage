const amqp = require('amqplib');
const MQConfig = require('config').mq;
const { initDB } = require('../../common/db/peter');
const { initProducer } = require('./producer');
const Logger = require('../../common/lib/logger');
const schoolTask = require('../service/schoolTask');
const userTask = require('../service/userTask');
const wxCallBack = require('../service/wxCallBack');
const { sleep } = require('../../common/lib/util');

var dicQueueAndHalder = {
    'queue.wechat.message.job.school': schoolTask,
    'queue.wechat.message.job.user': userTask,
    'queue.wechat.message.wxcallback': wxCallBack
}

var queueName;
var messageHandler;

main();

/**
 *  初始化消费者
 */
async function main() {
    console.log(process.argv[2]);
    queueName = process.argv[2];
    messageHandler = dicQueueAndHalder[queueName].messageHandler;

    await initDB();
    Logger.info(`initDB is successful !`);
    await initProducer();
    await createConsumer();
}

/**
 * 创建消费者
 */
async function createConsumer() {
    let conn = await amqp.connect(MQConfig.connection);
    conn.on('error', async (err) => {
        if (err.message !== "Connection closing") {
            Logger.error(`[AMQP Error ]:${err}`);
        }
    })

    conn.on('close', async () => {
        Logger.error(`[AMQP] reconnecting`);
        await sleep(2 * 1000);
        await createConsumer();
    })

    let channel = await conn.createConfirmChannel().catch(async err => {
        await sleep(2 * 1000);
        return await createConsumer();
    });

    channel.on('err', (err) => {
        Logger.error(`[AMQP] channel error: ${err.message}`);
    })
    channel.on('close', async (err) => {
        Logger.error("[AMQP] channel closed");
    })

    channel.prefetch = 10;
    channel.consume(queueName, async function (msg) {
        let message = msg.content.toString();
        try {
            await messageHandler(JSON.parse(message));
        } catch (error) {
            Logger.error(error);
        }
        channel.ack(msg);
    }, { noAck: false })
}