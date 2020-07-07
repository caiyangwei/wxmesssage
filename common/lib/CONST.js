const ERROR_CODE = {
    ok: {
        code: 0,
        msg: 'success'
    },
    missParameter: {
        code: -1,
        msg: '参数不全'
    },
    errParameter: {
        code: -2,
        msg: '参数异常'
    },

    notFound: {
        code: 404,
        msg: 'not found'
    },
    Unauthorized: {
        code: 401,
        msg: 'jwt verify fail !'
    },
    serverError: {
        code: 500,
        msg: 'server is error '
    }
}

const GRADES = ["小学", "初一", "初二", "初三", "初四", "高一", "高二", "高三"];

module.exports = {
    ERROR_CODE,
    GRADES
};
