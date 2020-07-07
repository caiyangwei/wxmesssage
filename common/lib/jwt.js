const jsonwebtoken = require('jsonwebtoken');
const jwt_config = require('config').jwt;

function generateToken(payLoad) {
    let token = jsonwebtoken.sign(payLoad, jwt_config.privateKey, {
        algorithm: jwt_config.algorithm,
        expiresIn: 60 * 60 * 6
    })
    return token;
}

module.exports = {
    generateToken
}