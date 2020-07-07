const express = require('express');
const route = express.Router();
const messageController = require('../controller/message');

route.delete('/:msgId', messageController.remove);

route.post('/track-point', messageController.trackPoint);

route.get('/list', messageController.list);

route.get('/:msgId/detail', messageController.detail);

route.post('/', messageController.create);


module.exports = route;