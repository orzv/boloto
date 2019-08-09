const boloto = require('./boloto')

boloto('http://news.people.com.cn/', function (json, { url, data }) {
    if (/index\.js/.test(url)) {
        json = JSON.parse(json)
        console.log(json.items.length)
        let list = new Set
        for (let item of json.items) {
            list.add(item.url)
        }
        console.log(list.size)
        let arr = [...list].slice(0, 10)
        console.log(arr)
        return arr.map(i => {
            return {
                url: i,
                encoding: 'gbk'
            }
        })
    } else if (/\/n1\//.test(url)) {
        const $ = json
        let title = $('h1').text()
        if (!title) {
            title = $('h2').text()
        }
        console.log(title)
    } else {
        let url = data.match(/\/\d+\/\d+\/index\.js/)[0]
        console.log(url)
        return `http://news.people.com.cn${url}`
    }
})