const path = require('path');
const rp = require('request-promise');

function initRoute(app) {
    app.use('/test/index.html', (req, res, next) => {
        res.sendFile(path.join(__dirname, '../view/index.html'));
    })

    app.use('/test/1', async (req, res, next) => {
        let rlt = await rp({
            url: 'http://www.aiyunxiao.com',
            method: 'get',
            json: false
        })
        res.send(rlt);
    })
}

module.exports = initRoute;