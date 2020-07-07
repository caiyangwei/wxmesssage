const express = require('express');
const route = express.Router();
const userController = require('../controller/user');

route.put('/:openid', userController.put);

module.exports = route;