const { Readable, Writable, Transform } = require('stream')
const { Bolo, createRequest, pipeline } = require('./base')

/**
 * 创建一个任务
 * @param {string} url 地址
 */
function task(url, options = {}) {
    let info = {
        url,
        encoding: options.encoding || 'utf8',
        startTime: Date.now(),
        request: createRequest(url, options)
    }
    console.log(`start task ${url}`)
    return new Readable({
        objectMode: true,
        read() {
            this.push(info || null)
            info = null
        }
    })
}

/**
 * 结束一个任务
 * @param {function(object, function)} callback 处理结果回调函数
 */
function end(final) {
    return new Writable({
        objectMode: true,

        /**
         * 结束任务流程
         * @param {Map} chunk 任务信息
         * @param {string} enc 类型
         * @param {function} callback 完成回调
         */
        write(info, enc, callback) {
            console.log(`${info.url} finished. used ${Date.now() - info.startTime}ms`)
            typeof final === 'function' && final(info, callback)
        }
    })
}

/**
 * 使用自定义处理流程
 * @param {function} custom 自定义处理函数，必须返回info，不要使用异步函数
 */
function then(custom) {
    return new Bolo((info, callback) => custom(info, callback))
}

/**
 * 创建子任务
 * 创建子任务后，主任务的逻辑将不再执行
 * @param {function} handler 子任务生成函数，返回遍历器
 * @param {function} end 主任务结束方法
 */
function fork(handler, end) {
    return new Bolo(function (info, callback) {

        /**
         * @type {Set}
         */
        const subTasks = handler(info)
        console.log(`${subTasks.length} sub tasks`)

        for (const url of subTasks) {
            const sub = {
                url,
                encoding: info.encoding,
                startTime: Date.now(),
                request: createRequest(url)
            }
            this.push(sub)
        }

        end = end || new Function('info', 'callback', 'callback()')
        end(info, callback)
    })
}

module.exports = {
    task,
    end,
    then,
    fork
}