const _ = require('lodash');
const moment = require('moment');
const { Porducer } = require('../init/producer');
const { Peter } = require('../../common/db/peter');
const Logger = require('../../common/lib/logger');
const redis = require('../../common/db/redis');
const { Schema, MESSAGE_DELIVERY_STATE, WeChat_Message_State, REDIS_KEYS } = require('../../common/lib/enum');

async function messageHandler(msg) {
    let schoolId = msg.schoolId;
    let message = await Peter.get(msg.messageId);

    let users = [];
    users = await getUsers(message, schoolId);

    if (users.length > 0) {
        let userCount = 0;
        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            if (user.openId.indexOf('openid') > -1) {
                continue;
            }
            userCount++;
            let userMessageEntity = {
                businessLine: message.businessLine,
                messageId: msg.messageId,
                messageType: message.type,
                openId: user.openId,
                userName: user.userName,
                deliveryState: MESSAGE_DELIVERY_STATE.CREATE,
                viewCount: 0,
                updateTime: new Date()
            }
            let userMessageId = await Peter.create('@UserMessage', userMessageEntity);

            let qMessage = {
                user,
                msg: _.assign(message.msg,
                    {
                        msgType: message.type,
                        businessLine: message.businessLine,
                        messageId: msg.messageId
                    }),
                userMessageId,
            }
            if (user.openId && user.openId.indexOf('open') < 0) {
                Porducer.sendMsgToUserQ(qMessage);
            }
            await Peter.set(`@UserMessage.${userMessageId}`, {
                updateTime: new Date(),
                deliveryState: MESSAGE_DELIVERY_STATE.PUBLISH_MQ
            });
        }

        let redis_cal_key = REDIS_KEYS.WechatMessage.calcUserCount(msg.messageId);
        let cal_count = await redis.incrby(redis_cal_key, userCount);
        await Peter.set(`@WechatMessage.${msg.messageId}`, {
            calcUserCount: cal_count,
            updateTime: new Date(),
            deliveryState: WeChat_Message_State.PUBLISHING
        });
    }
}


function getQuery(message, schoolId) {
    let cond = {};
    cond.schoolId = schoolId;

    if (message['[grade]'].length > 0) {
        cond.grade = {
            $in: message['[grade]']
        }
    }

    // 用户身份(0:全部 1:学生 2:家长)
    if (message.role !== 0) {
        cond.role = message.role;
    }

    // 会员状态
    if (message.memberStatus !== 0) {
        if (message.memberStatus === 1) {
            // 会员
        } else {
            // 非会员
        }
    }

    // 微信单次报告购买次数
    if (message.wechatExamReportBuyingTime > -1) {
        if (message.wechatExamReportBuyingTime === 3) {
            cond.wechatExamReportBuyingTime = {
                $gte: message.wechatExamReportBuyingTime
            }
        } else {
            cond.wechatExamReportBuyingTime = message.wechatExamReportBuyingTime;
        }
    }

    // app单次报告购买次数
    if (message.appExamReportBuyingTime > -1) {
        if (message.appExamReportBuyingTime === 3) {
            cond.appExamReportBuyingTime = {
                $gte: message.appExamReportBuyingTime
            }
        } else {
            cond.appExamReportBuyingTime = message.appExamReportBuyingTime;
        }
    }
    return cond;
}

// 获取模板消息需要推动的用户列表
async function getUsers(message, schoolId) {
    let viewModel = {
        '_id': 0,
        'openId': 1,
        'userName': 1
    }
    let cond = getQuery(message, schoolId);
    if (message.type === 2) {
        let TimeTwoAaysAgo = moment().subtract(2, 'd').toDate();
        cond.activeTime = { $gte: TimeTwoAaysAgo };
    }

    let col_name = Schema.User;
    let users = await Peter.query(col_name, cond, { project: viewModel });
    return users;
}

module.exports = {
    messageHandler
}