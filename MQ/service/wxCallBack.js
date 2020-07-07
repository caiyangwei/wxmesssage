let { Peter } = require('../../common/db/peter'),
    { MESSAGE_DELIVERY_STATE } = require('../../common/lib/enum'),
    Logger = require('../../common/lib/logger');

async function messageHandler(message) {
    let wxMsgId = message.MsgID;
    let state = message.Status;

    try {
        if (state === 'success') {
            // 1.update usermessage state
            let [userMessage] = await Peter.query('@UserMessage', {
                wxMsgId
            });

            if (userMessage) {
                await Peter.set(`@UserMessage.${userMessage._id}`, {
                    deliveryState: MESSAGE_DELIVERY_STATE.SEND_USER_FINISH,
                    updateTime: new Date()
                })
            } else {
                Logger.error(`wxMsgId:${wxMsgId} userMessage is missing`);
                return;
            }

            let wechatMessage = await Peter.get(userMessage.messageId);
            if (wechatMessage) {
                let deliveryCount = wechatMessage.deliveryCount;
                await Peter.set(wechatMessage._id, {
                    deliveryCount: deliveryCount + 1,
                    updateTime: new Date()
                })
            };
        }
        Logger.debug(`wxMsgId:${wxMsgId}`);
    } catch (error) {
        Logger.error('wxCallBack messageHandler Error')
        Logger.error(error);
    }
}

module.exports = {
    messageHandler
}
