const { insertOrUpdateUser } = require('../service/user');
const { ERROR_CODE } = require('../../common/lib/CONST');
const _ = require('lodash');

async function put(req, res, next) {
    let user = req.body;
    if (_.isNull(user.businessLine) ||
        _.isNull(user.openId) || _.isNull(user.userName) || _.isNull(user.role) || _.isNull(user.memberStatus)) {
        return res.json(ERROR_CODE.missParameter);
    }

    user.schoolId = Number(user.schoolId);
    user.role = Number(user.role);
    if (!_.isNull(user.wechatExamReportBuyingTime)) {
        user.wechatExamReportBuyingTime = Number(user.wechatExamReportBuyingTime);
    }

    if (!_.isNull(user.appExamReportBuyingTime)) {
        user.appExamReportBuyingTime = Number(user.appExamReportBuyingTime);
    }

    if (!_.isNull(user.memberStatus)) {
        user.memberStatus = Number(user.memberStatus);
    }

    try {
        await insertOrUpdateUser(user);
        if (!res.headersSent) return res.rlt(ERROR_CODE.ok);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    put
}