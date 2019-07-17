const { pipeline } = require('./base')

async function boloto(...args) {
    pipeline(...args)
}

module.exports = {
    ...require('./task'),
    ...require('./request'),
    ...require('./transform'),
    ...require('./extractor'),
    boloto
}