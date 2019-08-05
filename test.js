const boloto = require('./boloto')
let page = 1

function log(...msg) {
    let str = '\x1b[38;5;30m\x1b[1m' + new Date().toJSON() + ' [BOLOTO] : \x1b[0m'
    str += msg.join(' ')
    console.log(str)
}

// boloto({
//     url: 'https://www.ithome.com/',
//     concurrency: 2
// }, function ($, url) {
//     if (url === 'https://www.ithome.com/') {
//         let result = $('.new-list .title').map(function () {
//             let a = $(this).find('a')
//             return {
//                 title: a.text(),
//                 url: a.attr('href')
//             }
//         }).get()

//         let url = result[4].url
//         return result.slice(0, 10).map(i => i.url)
//     } else {
//         let title = $('h1').eq(0).text()
//         let content = $('.post_content').html()
//         log(title)
//         log(content)
//     }
// })

boloto.queue(
    [
        'http://jandan.net/ooxx/page-24#comments',
        'http://jandan.net/ooxx/page-23#comments',
        'http://jandan.net/ooxx/page-22#comments'
    ], {
        delay: 2000
    }, function(data, url) {
        console.log(url)
    }
)