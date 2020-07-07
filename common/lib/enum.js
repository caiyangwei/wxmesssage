const Schema = {
    User: '@User',
    WechatMessage: '@WechatMessage',
    UserMessage: '@UserMessage',
    BussinessLine: '@Business'
}

const MESSAGE_DELIVERY_STATE = {
    CREATE: 1,
    PUBLISH_MQ: 2,
    SEND_WXSERVER_FINISH: 3,
    SEND_WXSERVER_ERROR: -3,
    SEND_USER_FINISH: 4,
    SEND_USER_ERROR: -4,
    USER_VIEW: 5
}

const WeChat_Message_State = {
    CREATE: 0,
    PUBLISH_FINISH: 1
}

const REDIS_KEYS = {
    WechatMessage: {
        calcUserCount: (messageId) => { return `feWechat:${messageId}:calcUserCount` },
        deliveryCount: (messageId) => { return `feWechat:${messageId}:deliveryCount` },
        viewCount: (messageId) => { return `feWechat:${messageId}:viewCount` },
        viewManTime: (messageId) => { return `feWechat:${messageId}:viewManTime` }
    }
}

const REDIS_EXPIRE = {
    MIN: 60,
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7
}


module.exports = {
    MESSAGE_DELIVERY_STATE,
    WeChat_Message_State,
    REDIS_KEYS,
    REDIS_EXPIRE,
    Schema
}