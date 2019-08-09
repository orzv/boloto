const bologet = require('bologet')
const { concurrent, series } = require('bolocess')
const cheerio = require('cheerio')
const querystring = require('querystring')
const { CronJob } = require('cron')

function boloto(options, callback) {
    options = Object.assign({ encoding: 'utf8', timeout: 10000 }, typeof options === 'string' ? { url: options } : options)
    callback = typeof callback === 'function' ? callback : new Function
    let limit = typeof options.rate === 'number' ? options.rate : 100
    let delay = typeof options.delay === 'number' ? options.delay : 0
    const { url } = options
    options.callback = function (response) {
        if (response instanceof Error) {
            return callback(response, url)
        }

        /**
         * parse data
         */
        let data = response.data
        if (/text\/html/i.test(response.headers['content-type'])) {
            data = cheerio.load(response.data, { decodeEntities: false })
        } else if (/application\/json/i.test(response.headers['content-type'])) {
            data = JSON.parse(response.data)
        }

        /**
         * @type {Array}
         */
        let res = callback(data, response)
        if (!res) {
            return options.finish && options.finish()
        }

        if (typeof res === 'string' || !(res instanceof Array)) {
            res = [res]
        }

        const handler = delay ? series : concurrent
        const list = res.map(function (item) {
            if (typeof item === 'string') {
                item = { url: item }
            }
            return Object.assign({
                cookie: response.cookie,
                headers: Object.assign(options.headers || {}, { referer: url })
            }, item)
        })

        handler(list, function (params, finish) {
            boloto(params, function (data, response) {
                let subres = callback(data, response)

                if (!subres) {
                    finish()
                    return null
                }

                function transform(item) {
                    if (typeof item === 'string') {
                        item = { url: item }
                    }
                    return Object.assign({
                        headers: Object.assign({ referer: url }, item.headers || {}),
                        cookie: response.cookie
                    }, item)
                }

                if (subres instanceof Array) {
                    list.push(...subres.map(transform))
                } else {
                    list.push(transform(subres))
                }

                finish()
            })
        }, delay || limit, options.finish || new Function)
    }

    bologet(url, options)
}

function queue(urls, options, callback) {
    if (!urls instanceof Array) {
        throw new Error('Invalid urls')
    }
    let tasks = urls.map(function (url) {
        return Object.assign({ url }, options)
    })

    const handler = options.delay ? series : concurrent
    handler(tasks, function (task, finish) {
        boloto(task, function (data, response) {
            const result = callback(data, response)
            finish()

            if (!result) return

            function transform(item) {
                if (typeof item === 'string') {
                    item = { url: item }
                }
                return Object.assign({
                    headers: Object.assign({ referer: url }, item.headers || {}),
                    cookie: response.cookie
                }, item)
            }

            if (result instanceof Array) {
                tasks.push(...result.map(transform))
            } else {
                tasks.push(transform(result))
            }
        })
    }, options.delay || options.rate || 100, options.finish || new Function)
}

function watch(options, timer, callback, timezone = 'Asia/Shanghai') {
    if (typeof timer === 'number') {
        let tm = setInterval(function () {
            boloto(options, function (...args) {
                return callback(...args, function () {
                    clearInterval(tm)
                })
            })
        }, timer)
    } else if (typeof timer === 'string') {
        let tm = new CronJob(timer, function () {
            boloto(options, function (...args) {
                return callback(...args, function () {
                    tm.stop()
                })
            })
        }, null, true, timezone, true)
        tm.start()
    } else {
        throw new Error('Invalid timer')
    }
}

boloto.queue = queue
boloto.watch = watch

module.exports = boloto