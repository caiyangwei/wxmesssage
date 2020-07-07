const { Peter } = require('../../common/db/peter');
const { generateToken } = require('../../common/lib/jwt');
const uuid = require('uuid');
const col_name = '@Business';

async function create(entity) {
    let [business] = await Peter.query(col_name, { businessLine: entity.businessLine }, {
        limit: 1
    });

    if (!business) {
        entity.appId = uuid.v4();
        entity.appSecret = uuid.v4();
        return Peter.create(col_name, entity);
    }
}

async function get_access_token(businessLine, appId, appSecret) {
    let [business] = await Peter.query(col_name, { businessLine, appId, appSecret }, {
        limit: 1
    });

    if (business) {
        return generateToken({ appId, appSecret, businessLine });
    }

    return null;
}

module.exports = {
    create,
    get_access_token
}