const boloto = require('./boloto')
let page = 1

boloto({
    url: 'https://www.pexels.com/search/beautiful%20girl/',
    finish: function() {
        console.log('finish'.color(177))
    },
    delay: 200
}, function ($) {
    let list = $('.photo-item__img').map(function () {
        return $(this).data('large-src')
    }).get().map(i => i.match(/^(.*?)\?.*?$/)[1])

    console.log(list)

    if(page++ < 5){
        return 'https://www.pexels.com/search/beautiful%20girl/?page=' + page
    }
})