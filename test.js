const {
    task,
    get,
    dom,
    select,
    end,
    boloto
} = require('./boloto')

boloto(
    task('https://github.com/trending'),
    get(),
    dom(),
    select('list', $ => {
        return $('.Box-row').map(function () {
            const link = $(this).find('.h3.lh-condensed a').eq(0).attr('href')
            const res = {
                name: link.match(/^\/.*?\/(.+)$/)[1],
                user: link.match(/^\/(.*?)\/.+$/)[1],
                link: 'https://github.com' + link,
                desc: $(this).find('.text-gray.my-1').text() || '',
                stars: $(this).find('.muted-link.d-inline-block.mr-3').eq(0).text(),
                forks: $(this).find('.muted-link.d-inline-block.mr-3').eq(1).text()
            }
            res.desc = res.desc.trim()
            res.stars = parseInt(res.stars.trim().replace(',', ''))
            res.forks = parseInt(res.forks.trim().replace(',', ''))
            return res
        }).toArray()
    }),
    end((info, cb) => {
        console.log(JSON.stringify(info.result, null, 2))
        cb()
    })
)