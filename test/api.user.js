let assert = require('assert');
let rp = require('request-promise');
let COMMON = require('./common');
const _ = require('lodash');

describe('user', () => {
    it('add-user', async () => {
        let user = new Object();
        let timestamp = new Date().getTime();
        user.openId = ['olXvVvzZc_UwsKdeNOhDsnNwWdxI', 'olXvVv8a5-LKl4UqMqg0-UgcwXDE'][Math.round(Math.random() * 2)];
        user.userId = `user-${timestamp}`;
        user.userName = `user-${user.openId}`;
        user.schoolId = 80 + Math.round(Math.random() * 100);
        user.schoolName = `${user.schoolId}学校`;
        user.grade = ["小学", "初一", "初二", "初三", "高一", "高二", "高三"][1];
        user.role = Math.round(Math.random() * 2);
        user.memberStatus = Math.round(Math.random() * 4);
        user.wechatExamReportBuyingTime = Math.round(Math.random() * 10);
        user.appExamReportBuyingTime = Math.round(Math.random() * 10);
        user.businessLine = 'hfs';

        let url = `/user/${user.openId}`;
        let rlt = await rp({
            url: url,
            baseUrl: COMMON.BASE_URL,
            method: 'PUT',
            body: user,
            json: true
        });

        assert.equal(rlt.code, 0, rlt.msg);
    })
})