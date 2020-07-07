const express = require('express');
const path = require('path');
const route = express.Router();
const { VerifyToken } = require('../middleware/jwt');

// 静态资源目录
route.use(express.static(path.join(__dirname, '../public/')));
route.use('/user', VerifyToken, require('./use'));
route.use('/business', require('./business'));
route.use('/wechat-msg', VerifyToken, require('./message'));
route.use('/wechat', require('./wechat'));

module.exports = route;