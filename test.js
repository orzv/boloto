const boloto = require('./boloto')
let page = 1

let headerraw = `Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Cache-Control: no-cache
Connection: keep-alive
DNT: 1
Host: jandan.net
Pragma: no-cache
Referer: http://jandan.net/
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36`

boloto({
    url: 'http://jandan.net/ooxx',
    headers: boloto.parseHeader(headerraw),
    delay: 1000
}, function ($, { url }) {
    if (/page/.test(url)) {
        console.log(url)
    } else {
        return $('.cp-pagenavi').map(function () {
            return {
                url: 'https:' + $(this).find('a').attr('href'),
                cookie: {
                    _t: Date.now()
                }
            }
        }).get()
    }
})