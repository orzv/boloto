const boloto = require('./boloto')
let page = 1

boloto.watch({
    url: 'http://jandan.net/top',
    delay: 1000
}, '*/10 * * * * *', function ($, { url }) {
    console.log($('.view_img_link').map(function () {
        return $(this).attr('href')
    }).get())
})