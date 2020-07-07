const rp = require('request-promise');
const appId = 'wx8996544a650e4bd6';
const appsecret = 'c100653165e2c324ffc1a5b304b13688';
const { sleep } = require('../../common/lib/util');
const { WX_APIS } = require('../lib/enum');
const redis = require('../../common/db/redis');
const _ = require('lodash');

var lead_of_businessLine = [];

class CallWxAPI {
    constructor() {

    }

    static async callWxAPI(option) {
        let { qs, body, businessLine, method, api } = option;
        if (!businessLine) {
            return Promise.reject('call WxAPI error : miss businessLine');
        }

        let token = await getAccessToken(businessLine);
        api += `?access_token=${token}`;
        return rp(api, {
            method,
            qs,
            body,
            json: true
        });
    }
}

async function getAccessToken(businessLine) {
    let access_token = await redis.get(`feWechat:access_token:${businessLine}`);
    if (access_token) {
        return access_token;
    }

    if (_.findIndex(lead_of_businessLine, (b) => { return b === businessLine }) > -1) {
        await sleep(1 * 1000);
        return getAccessToken(businessLine);
    }

    lead_of_businessLine.push(businessLine);
    let qs = {
        grant_type: 'client_credential',
        appid: appId,
        secret: appsecret
    }
    let rlt = await rp(WX_APIS.GET_TOKEN.URI, {
        method: WX_APIS.GET_TOKEN.METHOD,
        qs,
        json: true
    })

    await redis.set(`feWechat:access_token:${businessLine}`, rlt.access_token, "EX", 3600);
    lead_of_businessLine = _.remove(businessLine, i => {
        return i === businessLine;
    })
    return rlt.access_token;
}

module.exports = CallWxAPI;