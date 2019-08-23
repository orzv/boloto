const boloto = require('./boloto')

async function fetchJandanTops() {
    boloto.queue([
        'https://www.baidu.com/',
        'https://www.qq.com/'
    ]).on('data', function (res) {
        console.log(res.url)
    }).on('end', function () {
        console.log('ok')
    })
}

fetchJandanTops()