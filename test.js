const boloto = require('./boloto')
let page = 1

function log(...msg) {
    let str = '\x1b[38;5;30m\x1b[1m' + new Date().toJSON() + ' [BOLOTO] : \x1b[0m'
    str += msg.join(' ')
    console.log(str)
}

boloto('https://www.ithome.com/', function ($, url) {
    if (url === 'https://www.ithome.com/') {
        let result = $('.new-list .title').map(function () {
            let a = $(this).find('a')
            return {
                title: a.text(),
                url: a.attr('href')
            }
        }).get()

        let url = result[4].url
        return url
    } else {
        let title = $('h1').eq(0).text()
        let content = $('.post_content').html()
        log(title)
        log(content)
    }
})