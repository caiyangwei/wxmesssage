const express = require('express');
const app = express();
const morgan = require("morgan");
const config = require('config');
const bodyParser = require('body-parser');
const route = require('./route/index');
const { init } = require('./bin/www');
const Logger = require('../common/lib/logger');
const { ERROR_CODE } = require('../common/lib/CONST');
const cors = require('cors');

// 请求日志
app.use(morgan('common'));

app.use(cors({
    origin: config.whiteOrigin
}));

// 解析body数据
app.use(bodyParser.json({
    limit: '10mb'
}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    parameterLimit: 100,
    extended: true
}));

// 初始化基础服务
init().then(() => {
    app.use(require('./middleware/reponseEvent'));
    app.use('/v1', route);
    require('./route/test')(app);

    // 404处理
    route.use('/', function (req, res, next) {
        res.status(404).rlt(ERROR_CODE.notFound);
    })
    // 异常处理
    route.use(function (err, req, res, next) {
        Logger.error(err);
        res.status(500).rlt(ERROR_CODE.serverError);
    })

    app.listen(process.env.HTTP_PORT || config.get('port'), async function (error, rlt) {
        Logger.info('server is runing !');
        Logger.info(`app-nam:${config['app-name']}`);
        Logger.info(`localhost:${process.env.HTTP_PORT || config.get('port')}`);
    });
})

process.on('uncaughtException', error => {
    Logger.error(`uncaughtException ${error}`);
})

process.on('unhandledRejection', error => {
    Logger.error(`unhandledRejection ${error}`);
})