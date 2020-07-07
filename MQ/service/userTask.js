const moment = require('moment');
const { Peter } = require('../../common/db/peter');
const redis = require('../../common/db/redis');
const { MessageType, Template, WX_APIS } = require('../lib/enum');
const { MESSAGE_DELIVERY_STATE, WeChat_Message_State, REDIS_KEYS } = require('../../common/lib/enum');
const Logger = require('../../common/lib/logger');
const callWxAPI = require('../service/callWxAPI');
const config = require('config');
const queryString = require('querystring');

async function messageHandler(msg) {
    let user = msg.user;
    let message = msg.msg;
    let userMessageId = msg.userMessageId;

    if (!user.openId) {
        return false;
    }

    let wx_message_body = build_wx_message_body(message, user);
    let api = message.msgType === 1 ? WX_APIS.TELEMPALE_MESSAGE : WX_APIS.CUSTOMER_MESSAGE;

    let updateData = { updateTime: new Date() };
    let rlt = await callWxAPI.callWxAPI({
        body: wx_message_body,
        businessLine: message.businessLine,
        method: api.METHOD,
        api: api.URI
    }).catch(error => {
        state = MESSAGE_DELIVERY_STATE.SEND_WXSERVER_ERROR;
        error_msg = JSON.stringify(error);
    })

    if (rlt && rlt.errcode === 0) {
        updateData['deliveryState'] = MESSAGE_DELIVERY_STATE.SEND_WXSERVER_FINISH;
        updateData['wxMsgId'] = rlt.msgid.toString();

        let redis_key_puc = REDIS_KEYS.WechatMessage.deliveryCount(message.messageId);
        let deliveryCount = await redis.incrby(redis_key_puc, 1);
        await Peter.set(`@WechatMessage.${message.messageId}`, { deliveryCount, updateTime: new Date() });

    } else {
        updateData['deliveryState'] = MESSAGE_DELIVERY_STATE.SEND_WXSERVER_ERROR;
        updateData['error'] = `call wx error :${rlt ? rlt.errmsg : error_msg}`;
    }
    await Peter.set(`@UserMessage.${userMessageId}`, updateData).catch(error => {
        Logger.error(error);
    })
}

function build_wx_message_body(message, user, type) {
    let message_body = {};
    if (message.msgType === MessageType.TEMPLATE) {
        message_body = {
            touser: user.openId,
            template_id: Template.dev.ActivityNotice,
            url: renderTemplate(config.get('wechatOfficialPages'), {
                url: encodeURIComponent(message.url),
                yunxiaoWechatMsgId: message.messageId
            }),
            data: {
                "first": {
                    "value": message.title,
                    "color": "#173177"
                },
                "keyword1": {
                    "value": message.name,
                    "color": "#173177"
                },
                "keyword2": {
                    "value": message.msgType,
                    "color": "#173177"
                },
                "keyword3": {
                    "value": user.userName,
                    "color": "#173177"
                },
                "keyword4": {
                    "value": moment(message.time).format('YYYY/MM/DD'),
                    "color": "#173177"
                },
                "remark": {
                    "value": message.description,
                    "color": "#173177"
                }
            }
        }
    } else {
        message_body = {
            touser: user.openId,
            msgtype: 'news',
            news: {
                articles: [
                    {
                        title: message.title,
                        description: message.description,
                        url: renderTemplate(config.get('wechatOfficialPages'), {
                            url: encodeURIComponent(message.url),
                            yunxiaoWechatMsgId: message.messageId
                        }),
                        picurl: message.cover
                    }
                ]
            }
        }
    }
    return message_body;
}

function renderTemplate(template, placeholder) {
    let result = template;
    for (let k in placeholder) {
        let regex = new RegExp('\\${' + k + '}', 'g');
        result = result.replace(regex, placeholder[k]);
    }
    return result;
}

module.exports = {
    messageHandler
}