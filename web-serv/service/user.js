const { Peter } = require('../../common/db/peter');
const { Schema } = require('../../common/lib/enum');
const _ = require('lodash');

// 新增或者更新user
async function insertOrUpdateUser(user) {
    let col_name;
    user.businessLine = user.businessLine || "hfs";
    col_name = Schema.User;

    let [user_db] = await Peter.query(col_name, { openId: user.openId });
    if (!user_db) {
        await Peter.create(col_name, user);
    }
    else {
        await Peter.set(`${col_name}.${user_db._id}`, user);
    }
}

async function getSchools(businessLine) {
    let cond = { businessLine };
    col_name = Schema.User;

    let schools = await Peter.aggregate(col_name, [
        {
            $match: cond
        }, {
            $group: {
                _id: {
                    schoolId: '$schoolId',
                    schoolName: '$schoolName'
                }
            }
        }, {
            $project: {
                _id: 0,
                schoolId: '$_id.schoolId',
                schoolName: '$_id.schoolName'
            }
        }
    ]);

    schools = _.map(schools, item => {
        return { schoolId: item.schoolId, schoolName: item.schoolName };
    });
    return schools;
}

async function getUser(openId, businessLine) {
    let col_name = Schema.User;
    let [user] = await Peter.query(col_name, { businessLine, openId });
    return user;
}

module.exports = {
    insertOrUpdateUser: insertOrUpdateUser,
    getSchools: getSchools,
    getUser
}