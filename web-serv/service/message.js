const _ = require('lodash');
const { Peter } = require('../../common/db/peter');
const redis = require('../../common/db/redis');
const { Porducer } = require('../../MQ/init/producer');
const userService = require('./user');
const Logger = require('../../common/lib/logger');
const moment = require('moment');
const { MESSAGE_DELIVERY_STATE, WeChat_Message_State, REDIS_KEYS, REDIS_EXPIRE } = require('../../common/lib/enum');
const { GRADES } = require('../../common/lib/CONST');

const col_name = '@WechatMessage';
const userMessage_col_name = '@UserMessage';

async function create(message) {
    message.businessLine = message.businessLine || "hfs";
    message.isDelete = false;
    message.deliveryStatus = WeChat_Message_State.CREATE;
    message.calcUserCount = 0;
    message.deliveryCount = 0;
    message.viewCount = 0;
    message.viewManTime = 0;

    let messageId = await Peter.create(col_name, message);
    
    if (message.timerStatus == 0) {
        await splitMessageTask(message, messageId);
    }
}

async function timingMessageHandler() {
    let messages = await Peter.query(col_name, {
        isDelete: false,
        timerStatus: 1,
        timerTime: { $lte: new Date() },
        deliveryStates: WeChat_Message_State.CREATE
    });

    _.forEach(messages, async (m) => {
        await splitMessageTask(m, m._id);
    })
}

/** 拆分任务 */
async function splitMessageTask(message, messageId) {
    let redis_cal_key = REDIS_KEYS.WechatMessage.calcUserCount(messageId);
    let redis_pub_key = REDIS_KEYS.WechatMessage.deliveryCount(messageId);
    let redis_view_key = REDIS_KEYS.WechatMessage.viewCount(messageId);
    let redis_viewMan_key = REDIS_KEYS.WechatMessage.viewManTime(messageId);

    await redis.set(redis_cal_key, 0, 'EX', REDIS_EXPIRE.WEEK * 2);
    await redis.set(redis_pub_key, 0, 'EX', REDIS_EXPIRE.WEEK * 2);
    await redis.set(redis_view_key, 0, 'EX', REDIS_EXPIRE.WEEK * 2);
    await redis.set(redis_viewMan_key, 0, 'EX', REDIS_EXPIRE.WEEK * 2);

    let schools = new Array();
    if (message.targetSchoolType == 1) {
        schools = await userService.getSchools(message.businessLine);
    }
    else if (message.targetSchoolType == 2) {
        allSchools = await userService.getSchools(message.businessLine);
        allSchoolIds = _.map(allSchools, item => { return item.schoolId });
        let targetSchoolIds = _.map(message.targetSchoolIds, item => { return Number(item.schoolId) });
        let diffSchoolIds = _.difference(allSchoolIds, targetSchoolIds);
        schools = _.map(diffSchoolIds, s => {
            let temp = _.find(allSchools, school => {
                return s === school.schoolId;
            })
            if (temp) {
                schools.push(temp);
            }
        })
    } else {
        schools = _.map(message.targetSchools, item => {
            return {
                schoolId: Number(item.schoolId),
                schoolName: item.schoolName
            }
        })
    }

    _.forEach(schools, (item) => {
        Logger.info(`messageId:${messageId}  school:${JSON.stringify(item)}`);
        Porducer.sendMsgToSchoolQ(_.assign({ messageId }, item));
    })

    await Peter.set(`${col_name}.${messageId}`, { deliveryStatus: WeChat_Message_State.PUBLISH_FINISH, updateTime: new Date() });
}

/**
 * 上传埋点
 * @param {String} messageId wechatMessageId 
 * @param {String} openId 用户OpenId
 */
async function trackPoint(messageId, openId) {
    let wechatMessage = await Peter.get(`${col_name}.${messageId}`);
    if (!wechatMessage) {
        return -1;
    }

    let userMessage = await Peter.query(userMessage_col_name, { messageId, openId });
    if (!userMessage) {
        return -1;
    }

    let user_viewCount = userMessage.viewCount;
    let message_viewCount = wechatMessage.viewCount;
    let message_viewManTime = wechatMessage.viewManTime;

    // 更细pv
    user_viewCount = user_viewCount + 1;
    if (moment(wechatMessage.createTime).add(2, 'w').toDate() < new Date()) {
        message_viewCount = message_viewCount + 1;
        if (viewCount === 0) {
            // 只更新该消息的uv
            message_viewManTime = message_viewManTime + 1;
        }
    } else {
        let redis_view_key = REDIS_KEYS.WechatMessage.viewCount(messageId);
        let redis_viewMan_key = REDIS_KEYS.WechatMessage.viewManTime(messageId);
        message_viewCount = await redis.incrby(redis_view_key, 1);
        if (viewCount === 0) {
            message_viewManTime = await redis.incrby(redis_viewMan_key, 1);
        }
    }

    await Peter.set(`${userMessage_col_name}.${userMessage._id}`, {
        viewCount: user_viewCount,
        deliveryState: MESSAGE_DELIVERY_STATE.USER_VIEW,
        updateTime: new Date()
    });
    await Peter.set(`${col_name}.${wechatMessage._id}`, {
        viewCount: message_viewCount,
        viewManTime: message_viewManTime,
        updateTime: new Date()
    });
}

async function del(messageId) {
    await Peter.set(`${col_name}.${messageId}`, { isDelete: true });
}

async function list(type, start, limit, businessLine) {
    businessLine = businessLine || 'hfs';
    let cond = {
        businessLine,
        type,
        isDelete: false
    }

    let options = {
        skip: start,
        limit,
        sort: { createTime: -1 }
    }
    let all_list = await Peter.query(col_name, cond, {
        project: { _id: 1 }
    });
    let totalCount = all_list.length;

    let list = await Peter.query(col_name, cond, options);

    list = _.map(list, item => {
        return {
            id: item._id.toString(),
            type: item.type,
            createTime: item.createTime,
            title: item.msg.title,
            name: item.msg.name,
            time: item.msg.time,
            msgType: item.msg.msgType,
            description: item.msg.description,
            cover: item.msg.cover,
            url: item.msg.url,
            calcUserCount: item.calcUserCount,               // 计算人数 即该消息预计推送的人数
            deliveryTime: item.deliveryTime || null,
            deliveryCount: item.deliveryCount,
            viewCount: item.viewCount,
            viewManTime: item.viewManTime,
            deliveryStatus: item.deliveryStatus,                  // 0: 尚未推送 1: 已推送
            timerStatus: item.timerStatus,                     // 0: 未设置定时 1: 设置定时
            timerTime: item.timerTime            // 定时器发送时间
        }
    })

    return { list, totalCount };
}

async function detail(msgId) {
    let message = await Peter.get(`${col_name}.${msgId}`);
    if (message.isDelete) {
        return null;
    }

    let rlt = {
        "id": message._id,
        "type": message.type,
        "createTime": message.createTime.getTime(),
        "msg": {
            "cover": message.type === 1 ? null : message.msg.cover,
            "msgType": message.msg.msgType,
            "title": message.msg.title,
            "time": moment(message.msg.time).format('YYYY-MM-DD'),
            "name": message.msg.name,
            "description": message.msg.description,
            "url": message.msg.url
        },
        "targetSchoolType": message.targetSchoolType,
        "targetSchools": message['[targetSchools]'],
        "grade": message['[grade]'].length === 0 ? GRADES : message['[grade]'],
        "role": message.role,
        "memberStatus": message.memberStatus,
        "memberExpireTime": message.memberExpireTime,
        "appExamReportBuyingTime": message.appExamReportBuyingTime,
        "wechatExamReportBuyingTime": message.wechatExamReportBuyingTime,
        "prepareDeliveryCount": message.prepareDeliveryCount,
        "calcUserCount": message.calcUserCount,
        "timerStatus": message.timerStatus,
        "timerTime": message.timerTime,
        "deliveryCount": message.deliveryCount,
        "deliveryTime": message.deliveryTime || null,
        "viewCount": message.viewCount,
        "viewManTime": message.viewManTime
    }

    return rlt;
}

module.exports = {
    create,
    trackPoint,
    del,
    list,
    detail,
    timingMessageHandler
}