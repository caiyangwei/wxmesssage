var Peter = require('peter').getManager('wechat-be');
const dbStr = require('config').get('db');
const { promisify } = require('es6-promisify')
const _ = require('lodash');
Peter = formatPeterSync(Peter);

function formatPeterSync(peter) {
    _.each(Object.getPrototypeOf(peter), (v, k) => {
        peter[k] = promisify(v.bind(peter))
    })
    return peter
}

async function initDB() {
    try {
        process.on('', () => {
            Peter = null;
        })
        return await Peter.bindDb(dbStr);
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    Peter,
    initDB
};
