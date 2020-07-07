const redis_conf = require('config').redis;
const redis = require('ioredis');
const redisClient = new redis(redis_conf, {
    retryStrategy: (times) => {
        var delay = Math.min(times * 50, 2000);
        return delay;
    }, keepAlive: true
});

redisClient.on('error', (error) => {
    
})

redisClient.on('connect', (rlt) => {

})

redisClient.on('reconnecting', (rlt) => {

})

redisClient.on('ready', (rlt) => {

})

module.exports = redisClient;