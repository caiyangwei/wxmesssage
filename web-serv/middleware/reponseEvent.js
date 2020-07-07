const moment = require('moment');
const Logger = require('../../common/lib/logger');

function reqEvent(req, res, next) {
    let startTime = moment().valueOf();
    req.startTime = startTime;

    let json = res.json;
    res.rlt = function (data, rlt_code) {
        resTime(req, res);
        if (!rlt_code) {
            json.call(res, data);
        } else {
            json.call(res, Object.assign({ data }, rlt_code));
        }
    }
    next();
}

function resTime(req, res) {
    let endTime = moment().valueOf();
    let ip = req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.connection.remoteAddress || // 判断 connection 的远程 IP
        req.socket.remoteAddress || // 判断后端的 socket 的 IP
        req.connection.socket.remoteAddress;
    let api = req.headers.host + req.originalUrl;

    let diffTime = endTime - req.startTime;
    Logger.info(`url:${api} ip:${ip} resTime:${diffTime}`);
}

module.exports = reqEvent;