const boloto = require('./boloto')

async function fetchJandanTops() {
    let res = await boloto('https://jandan.net/top')
    let $ = await res.html()
    let list = $('.view_img_link').map((i, e) => 'https:' + $(e).attr('href')).get()
    await boloto.saveAll(list, './jandan')
    console.log(`save ${list.length} files`)
}

fetchJandanTops()