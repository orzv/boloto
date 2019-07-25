const bologet = require('bologet')
const cheerio = require('cheerio')

const cpus = require('os').cpus().length
const htmlExp = /text\/html/i
const jsonExp = /application\/json/i

String.prototype.color = function (number) {
    return `\x1b[0m\x1b[38;5;${number}m${this}\x1b[0m`
}

function boloto(options, callback) {
    if (typeof options === 'string') {
        options = { url: options }
    }
    options = defaultOpts(options)
    callback = typeof callback === 'function' ? callback : console.log
    let limit = cpus
    let delay = 0
    const now = Date.now()
    if (typeof options.concurrency === 'number') {
        limit = options.concurrency
        log('setup concurrency ' + limit)
    }

    if (typeof options.delay === 'number') {
        delay = options.delay
    }
    const { url } = options

    bologet(url, options).then(function (response) {
        let data = null
        if (htmlExp.test(response.headers['content-type'])) {
            data = cheerio.load(response.data)
        } else if (jsonExp.test(response.headers['content-type'])) {
            data = JSON.parse(response.data)
        } else {
            data = response.data
        }


        log(`fetch ${url} `, `used ${Date.now() - now}ms`.color(220))

        /**
         * @type {Array}
         */
        let res = callback(data, url, response)
        if (!res && !options._pusher) {
            if (typeof options.finish === 'function') {
                return options.finish()
            }
        }

        if (!res && typeof options._finish === 'function') {
            options._finish()
        }
        if (!res) return

        if (typeof res === 'string') {
            res = [res]
        }

        if (typeof options._pusher === 'function') {
            options._pusher(res)
            options._finish()
        } else {
            concurrencyLimit(res, limit, delay, function (data, finish, push) {
                let opts = {}
                if (typeof data === 'string') {
                    opts = Object.assign(options, {
                        url: data,
                        headers: Object.assign(options.headers || {}, {
                            referer: url
                        }),
                        cookie: response.cookie,
                        _pusher: push,
                        _finish: finish
                    })
                } else {
                    data._pusher = push
                    data._finish = finish
                    opts = data
                }

                boloto(opts, callback)
            }, options.finish)
        }
    }, function (err) {
        log(err.message.color(160))
        callback(err, url)
    })
}

function defaultOpts(options) {
    return Object.assign({
        encoding: 'utf8',
        timeout: 10000
    }, options)
}

/**
 * @param {Array} list 
 * @param {number} concurrency
 * @param {number} delay
 * @param {function} callback 
 * @param {function} finishall
 */
function concurrencyLimit(list, concurrency, delay, callback, finishall) {
    let count = 0
    let urls = list.map(i => typeof i === 'string' ? i : i.url)

    if (delay > 0) {
        concurrency = 1
        log(`delay mode, concurrency limit 1`.color(39))
    }

    function finish() {
        count--

        if (count < concurrency && list.length) {
            if (delay) {
                setTimeout(callback, delay, list.splice(0, 1)[0], finish, push)
            } else {
                setImmediate(callback, list.splice(0, 1)[0], finish, push)
            }
            count++
        }

        if (count === 0 && list.length === 0) {
            if (typeof finishall === 'function') {
                finishall()
            }
        }
    }

    function push(item) {
        if (item instanceof Array) {
            list = list.concat(item.filter(it => !urls.includes(typeof it === 'string' ? it : it.url)))
            urls = urls.concat(list.map(i => typeof i === 'string' ? i : i.url))
        } else if (typeof item === 'object' && !urls.includes(item.url)) {
            list.push(item)
            urls.push(item.url)
        } else if (typeof item === 'string' && !urls.includes(item)) {
            list.push(item)
            urls.push(item)
        }

        log(`task forked, total ${urls.length} tasks`.color(129))
    }

    while (count < concurrency && list.length) {
        if (delay) {
            setTimeout(callback, delay, list.splice(0, 1)[0], finish, push)
        } else {
            setImmediate(callback, list.splice(0, 1)[0], finish, push)
        }
        count++
    }
}

function log(...msg) {
    let str = '\x1b[38;5;30m\x1b[1m' + new Date().toJSON() + ' [BOLOTO] : \x1b[0m'
    str += msg.join(' ')
    console.log(str)
}

module.exports = boloto