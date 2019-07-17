const { Bolo } = require('./base')

/**
 * 使用正则表达式提取结果
 * 依赖raw的处理结果
 * @param {string} name 字段名称
 * @param {RegExp} reg 正则表达式
 */
function regexp(name, reg) {
    return new Bolo(function (info) {
        const text = info.data || ''
        const result = info.result || {}

        const matches = reg.global ? text.match(reg) : reg.exec(text)
        if (matches) {
            /**
             * 根据不同设置返回不同结果
             */
            if (reg.global) {
                /**
                 * 如果是全局模式，返回所有结果
                 */
                result[name] = matches
            } else {
                /**
                 * 普通模式包含子查询的返回子查询结果
                 */
                if (matches.length > 2) {
                    result[name] = matches.slice(1)
                } else if (matches.length === 2) {
                    result[name] = matches[1]
                } else {
                    /**
                     * 没有子查询只返回第一个结果
                     */
                    result[name] = matches[0]
                }
            }
            info.result = result
        } else {
            console.log('Any more not found')
        }
        return info
    })
}

/**
 * 使用选择器提取结果
 * 依赖dom的处理结果
 * @param {string} name 字段名称
 * @param {function} cb 通过回调函数获取结果
 */
function select(name, cb) {
    return new Bolo(function (info) {
        const dom = info.dom
        if (!dom) return info

        const result = info.result || {}
        result[name] = cb(dom)
        info.result = result
        return info
    })
}

module.exports = {
    regexp,
    select
}