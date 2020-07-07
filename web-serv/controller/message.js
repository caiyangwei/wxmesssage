const _ = require('lodash');
const messageService = require('../service/message');
const { ERROR_CODE } = require('../../common/lib/CONST');

// 创建消息任务
async function create(req, res, next) {
    let message = req.body;
    try {
        await messageService.create(message);
        res.rlt(message, ERROR_CODE.ok);
    } catch (error) {
        next(error)
    }
}

// 上报查询的埋点
async function trackPoint(req, res, next) {
    let { msgId, openId } = req.body;
    if (_.isNull(msgId) || _.isNull(openId)) {
        return res.rlt(ERROR_CODE.missParameter);
    }

    try {
        await messageService.trackPoint(msgId, openId)
        res.rlt(ERROR_CODE.ok);
    }
    catch (error) {
        next(error);
    }
}

// 删除未执行的定时任务
async function remove(req, res, next) {
    let { msgId } = req.params;
    if (_.isNull(msgId)) {
        return res.rlt(ERROR_CODE.missParameter);
    }
    try {
        await messageService.del(msgId);
        res.rlt(ERROR_CODE.ok);
    } catch (error) {
        next(error);
    }
}

// 获取消息列表
async function list(req, res, next) {
    let { type, start, limit, businessLine } = req.query;
    try {
        type = _.toNumber(type);
        start = _.toNumber(start);
        limit = _.toNumber(limit);
    } catch (err) {
        return res.rlt(ERROR_CODE.errParameter);
    }

    try {
        let msgList = await messageService.list(type, start, limit, businessLine);
        res.rlt(msgList, ERROR_CODE.ok);
    }
    catch (error) {
        next(error);
    }
}

// 获取消息详情
async function detail(req, res, next) {
    let { msgId } = req.params;
    if (!msgId) {
        return res.rlt(ERROR_CODE.missParameter);
    }
    try {
        let message = await messageService.detail(msgId);
        if (!message) {
            return next();
        }
        res.rlt(message, ERROR_CODE.ok);
    }
    catch (error) {
        next(error);
    }
}

module.exports = {
    create,
    trackPoint,
    remove,
    list,
    detail
}