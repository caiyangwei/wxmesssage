let route = require('express').Router();
const { parseStringPromise } = require('xml2js');
const { Porducer } = require('../../MQ/init/producer');
let { add } = require('../service/wxNotice');


route.get('/notice', (req, res, next) => {
    let query = req.query;
    res.send(query.echostr);
})

route.use('/notice', async (req, res, next) => {
    let data = '';
    req.on('data', (chunk) => {
        data += chunk;
    })
    req.on('end', async () => {
        data = await parseStringPromise(data, {
            cdata: true,
            explicitArray: false
        });
        let wxNotic = data.xml;
        //#region 模板消息
        // {
        //     ToUserName: ['gh_9402b8b5e0fa'], // 开发者账号
        //     FromUserName: ['olXvVv8a5-LKl4UqMqg0-UgcwXDE'], //用户openId
        //     CreateTime: ['1573455842'], // 推送时间
        //     MsgType: ['event'], // 消息类型 事件
        //     Event: ['TEMPLATESENDJOBFINISH'], // 事件类型 TEMPLATESENDJOBFINISH 模板消息推送完成
        //     MsgID: ['1071452930600992771'], // 消息MsgId
        //     Status: ['success'] // 推送状态
        // }
        //#endregion

        //#region 用户交互
        // Content:"111"
        // CreateTime:"1574148416"
        // FromUserName:"olXvVv8a5-LKl4UqMqg0-UgcwXDE"
        // MsgId:"22536385332775863"
        // MsgType:"text"
        // ToUserName:"gh_9402b8b5e0fa"
        //#endregion

        if (wxNotic.Event === "TEMPLATESENDJOBFINISH") {
            if (wxNotic.Status === 'success') {
                Porducer.sendMsgToWxCallBackQ(wxNotic);
            }
        }
        else {
            add(wxNotic);
        }
    });

    res.send('');
})

module.exports = route;