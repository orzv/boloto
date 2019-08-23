const _fetch = require('node-fetch')
const { load } = require('cheerio')
const { stringify } = require('querystring')
const { createWriteStream } = require('fs')
const { promisify } = require('util')
const { Headers, Response } = _fetch
const tunnel = require('tunnel')
const { EventEmitter } = require('events')
const pipeline = promisify(require('stream').pipeline)
const { join, parse } = require('path')
const { CronJob } = require('cron')

const default_headers = {
    Accept: 'text/html;q=0.9,application/json,application/javascript,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'cache-control': 'no-cache',
    dnt: '1',
    pragma: 'no-cache',
    'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko)'
}

function fetch(url, opts = {}) {
    if (typeof opts === 'string') {
        opts = { headers: { referer: opts } }
    }
    let headers = new Headers(opts.headers ? Object.assign(default_headers, opts.headers) : default_headers)
    if (opts.cookie) {
        if (typeof opts.cookie === 'string') {
            headers.set('cookie', opts.cookie)
        } else {
            headers.set('cookie', stringify(opts.cookie, '; '))
        }
    }
    if (typeof opts.redirect === 'number') {
        opts.follow = opts.redirect
        opts.redirect = 'follow'
    }
    if (opts.referer) {
        headers.set('referer', opts.referer)
    }
    opts = Object.assign({
        timeout: 10000,
        follow: 0
    }, opts, { headers })
    return _fetch(url, opts)
}

Response.prototype.html = function () {
    return new Promise(resolve => {
        this.textConverted().then(function (text) {
            setImmediate(function () {
                resolve(load(text, { decodeEntities: false }))
            })
        })
    })
}

Response.prototype.save = async function (filename) {
    return await promisify(pipeline)(this.body, createWriteStream(filename))
}

Response.prototype.cookie = function () {
    let cookies = this.headers.raw()['set-cookie']
    let res = {}
    cookies.forEach(item => {
        let arr = item.split(/;\s*/)
        arr.forEach(i => {
            let [key, value] = i.split('=')
            if (!(['path', 'domain', 'httponly', 'secure', 'max-age', 'expires'].includes(key.toLowerCase()))) {
                res[key] = decodeURIComponent(value)
            }
        })
    })
    return res
}

/**
 * example:
 * http://123.123.123.123:1234
 * http://user:pwd@123.123.123.123:1234
 */
function proxy(url) {
    if (!/^http/.test(url)) url = 'http://' + url
    let { protocol, username, password, hostname, port } = new URL(url)
    const proxyHandle = protocol === 'https:' ? tunnel.httpsOverHttps : tunnel.httpsOverHttp
    return proxyHandle({
        proxy: {
            host: hostname, port,
            proxyAuth: username ? `${username}:${password}` : null,
            headers: default_headers
        }
    })
}

/**
 * @param {Array} urls urls
 * @param {object} opts params
 */
function queue(urls, opts = {}) {
    let res = [], concurrency = 0, timer = null, ev = new EventEmitter
    if (opts.delay > 0) {
        // delay mode
        function allocTask() {
            if (urls.length === 0) {
                return ev.emit('end')
            }
            let url = urls.shift()
            function _callback(r) {
                if (!r.url) r.url = url
                ev.emit('data', r)
                setTimeout(allocTask, opts.delay)
            }
            fetch(url, opts).then(_callback, _callback)
        }

        allocTask()
    } else if (opts.limit > 0) {
        // concurrency mode
        function allocTask() {
            if (urls.length === 0 && timer) {
                clearInterval(timer)
                return ev.emit('end')
            }
            while (concurrency < opts.limit && urls.length > 0) {
                concurrency++
                let url = urls.shift()
                function _callback(r) {
                    concurrency--
                    if (!r.url) r.url = url
                    ev.emit('data', r)
                }
                fetch(url, opts).then(_callback, _callback)
            }
        }
        timer = setInterval(allocTask, 1000)
        allocTask()
    } else {
        // no limit
        while (urls.length) {
            let url = urls.shift()
            concurrency++
            function _callback(r) {
                concurrency--
                if (!r.url) r.url = url
                ev.emit('data', r)
                if (urls.length === 0 && concurrency === 0) {
                    ev.emit('end')
                }
            }
            fetch(url, opts).then(_callback, _callback)
        }
    }
    return ev
}

function saveAll(urls, path, opts = {}) {
    const length = urls.length
    return new Promise(function (resolve) {
        let finished = 0
        queue(urls, opts).on('data', async function (res) {
            try {
                let filename = parse(new URL(res.url).pathname).base
                if (!filename) {
                    filename = 'index.html'
                } else if (!/\.\w+$/.test(filename)) {
                    filename += '.html'
                }
                await pipeline(res.body, createWriteStream(join(path, filename)))
            } catch (err) {
                console.error(err)
            } finally {
                finished++

                if (finished === length) {
                    resolve()
                }
            }
        })
    })
}

function watch(url, timer, opts = {}) {
    const ev = new EventEmitter
    if (typeof timer === 'number') {
        let tm = setInterval(function () {
            function stop() { clearInterval(tm) }
            fetch(url, opts).then(function (res) {
                ev.emit('data', res, stop)
            }, function (err) {
                ev.emit('error', err, stop)
            })
        }, timer)
    } else if (typeof timer === 'string') {
        let tm = new CronJob(timer, function () {
            function stop() { tm.stop() }
            fetch(url, opts).then(function (res) {
                ev.emit('data', res, stop)
            }, function (err) {
                ev.emit('data', err, stop)
            })
        }, null, true, opts.timezone || 'Asia/Shanghai', true)
        tm.start()
    } else {
        throw new Error('Invalid timer')
    }
    return ev
}

fetch.proxy = proxy
fetch.queue = queue
fetch.saveAll = saveAll
fetch.watch = watch

module.exports = fetch