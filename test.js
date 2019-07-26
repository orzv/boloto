const boloto = require('./boloto')
let page = 1

function log(...msg) {
    let str = '\x1b[38;5;30m\x1b[1m' + new Date().toJSON() + ' [BOLOTO] : \x1b[0m'
    str += msg.join(' ')
    console.log(str)
}

boloto({
    url: 'https://www.pexels.com/search/beautiful%20girl/',
    finish: function() {
        console.log('finish'.color(177))
    },
    delay: 200,
    _daemon_log: log
}, function ($, url, response, console) {
    let list = $('.photo-item__img').map(function () {
        return $(this).data('large-src')
    }).get().map(i => i.match(/^(.*?)\?.*?$/)[1])

    console.log(list)

    if(page++ < 5){
        return 'https://www.pexels.com/search/beautiful%20girl/?page=' + page
    }
})