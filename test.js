const boloto = require('./boloto')
let page = 1
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

boloto({
    url: 'https://www.v2ex.com/',
    concurrency: 2,
    proxy: 'http://127.0.0.1:8888'
}, function ($, { url }) {
    if (url === 'https://www.v2ex.com/') {
        let result = $('.item_title').map(function () {
            let a = $(this).find('a')
            return {
                title: a.text(),
                url: 'https://www.v2ex.com' + a.attr('href')
            }
        }).get()

        console.log(result)
        return result.slice(0, 10).map(i => i.url)
        // return result.slice(0, 10).map(i => i.url)
    } else {
        // let title = $('h1').eq(0).text()
        // let content = $('.post_content').html()
        // console.log(title)
        // console.log(content)
    }
})

// boloto.queue(
//     [
//         'http://jandan.net/ooxx/page-24#comments',
//         'http://jandan.net/ooxx/page-23#comments',
//         'http://jandan.net/ooxx/page-22#comments'
//     ], {
//         delay: 2000
//     }, function(data, url) {
//         console.log(url)
//     }
// )