const jsonwebtoken = require('jsonwebtoken');
const jwt_config = require('config').jwt;
const { ERROR_CODE } = require('../../common/lib/CONST')

function VerifyToken(req, res, next) {
    let token = req.headers['token'];
    if (token) {
        try {
            let business = jsonwebtoken.verify(token, jwt_config.privateKey);
            req.body.businessLine = business.businessLine;
            req.query.businessLine = business.businessLine;
        }
        catch (err) {
            return res.status(401).send(ERROR_CODE.Unauthorized);
        }
    }
    next();
}

module.exports = {
    VerifyToken
}