let { Peter } = require('../../common/db/peter');
let { getUser } = require('./user');
let { Schema } = require('../../common/lib/enum');
const Logger = require('../../common/lib/logger');

async function add(message) {
    if (!message.businessLine) {
        message.businessLine = 'hfs';
    }
    try {
        let openId = message.FromUserName;
        let user = await getUser(openId, message.businessLine);
        if (user) {
            let col_name = Schema.User;
            await Peter.set(`${col_name}.${user._id}`, { activeTime: new Date() });
        }
    } catch (err) {
        Logger.error(err);
    }
}

module.exports = {
    add
}