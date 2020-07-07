const route = require('express').Router();
const { ERROR_CODE } = require('../../common/lib/CONST');
const { create, get_access_token } = require('../service/business');
const _ = require('lodash');

route.post('/add', async function (req, res, next) {
    await create(req.body);
    res.json(ERROR_CODE.ok);
})

route.post('/token', async (req, res, next) => {
    let { businessLine, appId, appSecret } = req.body;

    if (_.isNull(businessLine) || _.isNull(appId) || _.isNull(appSecret)) {
        return res.rlt(ERROR_CODE.missParameter);
    }

    let token = await get_access_token(businessLine, appId, appSecret);

    if (token) {
        return res.rlt({ token }, ERROR_CODE.ok);
    }

    return res.rlt(ERROR_CODE.errParameter);
})

module.exports = route;