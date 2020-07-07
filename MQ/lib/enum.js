const MessageType = {
    TEMPLATE: 1,
    CUSTOM_SERVICE: 2
}

const Template = {
    dev: {
        ActivityNotice: 'VZ8WtyXhwWiMlbawKPQHs0197jv9WS1HHK2WXLywXJM'
    },
    pro: {
        ActivityNotice: 'VZ8WtyXhwWiMlbawKPQHs0197jv9WS1HHK2WXLywXJM'
    }
}

const WX_APIS = {
    GET_TOKEN: {
        URI: 'https://api.weixin.qq.com/cgi-bin/token',
        METHOD: 'GET'
    },
    TELEMPALE_MESSAGE: {
        URI: 'https://api.weixin.qq.com/cgi-bin/message/template/send',
        METHOD: 'POST'
    },
    CUSTOMER_MESSAGE: {
        URI: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
        METHOD: 'POST'
    }
}

module.exports = {
    MessageType,
    Template,
    WX_APIS
}