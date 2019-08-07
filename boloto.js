const bologet = require('bologet')
const bolocess = require('bolocess')
const cheerio = require('cheerio')
const querystring=require('querystring')

function boloto(options, callback) {
    if (typeof options === 'string') {
        options = { url: options }
    }
    options = Object.assign({ encoding: 'utf8', timeout: 10000 }, options)
    callback = typeof callback === 'function' ? callback : console.log
    let limit = typeof options.concurrency === 'number' ? options.concurrency : require('os').cpus().length
    let delay = typeof options.delay === 'number' ? options.delay : 0
    const now = Date.now()
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
            return typeof options.finish === 'function' && options.finish()
        }

        if (typeof res === 'string' || !(res instanceof Array)) {
            res = [res]
        }

        const handler = delay ? bolocess.series : bolocess.concurrent
        const list = res.map(function (item) {
            if (typeof item === 'string') {
                return Object.assign({}, options, {
                    url: item,
                    cookie: response.cookie,
                    headers: Object.assign(options.headers || {}, { referer: url })
                })
            } else {
                return Object.assign({
                    cookie: response.cookie,
                    headers: Object.assign(options.headers || {}, { referer: url })
                }, item)
            }
        })

        handler(list, function (params, finish) {
            delete params.delay
            delete params.concurrency
            delete params.finish

            boloto(params, function (data, response) {
                let subres = callback(data, response)
                finish()

                function transform(item) {
                    if (typeof item === 'string') {
                        return {
                            url: subres,
                            headers: Object.assign({ referer: url }, options.headers || {}),
                            cookie: response.cookie
                        }
                    } else {
                        return Object.assign({
                            headers: Object.assign({ referer: url }, item.headers || {}),
                            cookie: response.cookie
                        }, item)
                    }
                }

                if (!subres) return null

                if (subres instanceof Array) {
                    list = list.concat(subres.map(transform))
                } else {
                    list.push(transform(subres))
                }
            })
        }, delay ? delay : limit, typeof options.finish === 'function' ? options.finish : new Function)
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

    const handler = typeof options.delay === 'number' ? bolocess.series : bolocess.concurrent
    handler(tasks, function (task, finish) {
        delete task.finish
        delete task.concurrency
        delete task.delay
        boloto(task, function (data, response) {
            const result = callback(data, response)
            finish()

            if (!result) return

            function transform(item) {
                if (typeof item === 'string') {
                    return {
                        url: subres,
                        headers: Object.assign({ referer: url }, options.headers),
                        cookie: response.cookie
                    }
                } else {
                    return Object.assign({
                        headers: Object.assign({ referer: url }, item.headers || {}),
                        cookie: response.cookie
                    }, item)
                }
            }

            if (result instanceof Array) {
                tasks = tasks.concat(task.map(transform))
            } else {
                task.push(transform(result))
            }
        })
    }, typeof options.delay === 'number' ? options.delay : options.concurrency,
        typeof options.finish === 'function' ? options.finish : new Function)
}

function parseHeader(str){
    return querystring.parse(str, '\n', ': ')
}

boloto.queue = queue
boloto.parseHeader = parseHeader

module.exports = boloto