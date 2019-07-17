const cheerio = require('cheerio')
const { Bolo } = require('./base')

/**
 * 生成DOM
 */
const dom = function () {
    return new Bolo(function (info) {
        info.dom = cheerio.load(info.data)
        return info
    })
}

/**
 * 生成json
 */
const json = function () {
    return new Bolo(function (info) {
        info.json = JSON.parse(info.data)
        return info
    })
}

module.exports = {
    dom,
    json
}