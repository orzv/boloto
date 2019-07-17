const { Transform } = require('stream')
const http = require('http')
const https = require('https')
const { URL, parse } = require('url')

/**
 * 通用转换类
 */
class Bolo extends Transform {

    /**
     * @param {function(Map)} cb 转换回调函数
     */
    constructor(cb = null) {
        super({ objectMode: true })

        /** 
         * @param {Map} info 任务信息
         */
        this.callback = typeof cb === 'function' ? cb : new Function('i', 'return i')
    }
    _transform(info, e, callback) {
        const result = this.callback(info, callback)
        if (result) callback(null, result)
    }
}

/**
 * 返回连接对象
 * @param {string} url URL
 * @param {object} options 选项
 * @returns {http.ClientRequest | https.ClientRequest}
 */
function createRequest(url, options = {}) {
    const headers = Object.assign({
        Host: parse(url).hostname,
        Accept: '*'
    }, options.headers || {})
    if (options.proxy) {
        const _url = parse(options.proxy)
        const params = {
            host: _url.hostname,
            port: +_url.port,
            path: url,
            method: options.method || 'GET',
            headers,
            protocol: 'http:'
        }
        return http.request(params)
    } else {
        return (/^https/.test(url) ? https : http).request(url, {
            headers,
            method: options.method || 'GET'
        })
    }
}

module.exports = {
    Bolo,
    pipeline: require('util').promisify(require('stream').pipeline),
    createRequest
}