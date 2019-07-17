const { Bolo } = require('./base')

/**
 * 发送GET请求
 */
function get() {
    return new Bolo(function (info, callback) {
        const request = info.request
        const encoding = info.encoding
        console.log(`get ${info.url}`)
        request.on('response', res => {
            let str = ''
            res.setEncoding('utf8')
            res.on('data', chunk => str += chunk).on('end', () => {
                console.log('finish receive')
                info.data = str
                callback(null, info)
            })
        }).end()
    })
}

module.exports = {
    get
}