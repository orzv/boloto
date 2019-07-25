const boloto = require('./boloto')
let page = 1

boloto('https://www.v2ex.com/', function ($) {
    let list = $('.item_title a').map(function () {
        return $(this).text()
    }).get()

    console.log(list)
})