# Boloto

Faster, easier http crawler by Node.js

## Features

- Server side dom
- Fork sub task
- Concurrency task

## Install

```shell
# Recommend
pnpm i boloto

# or
yarn add boloto

# or
npm i boloto
```

## Api

```javascript
const boloto = require('boloto')

boloto({

    // required, url
    url: 'https://xxxx',

    // optional, request header
    headers: {},

    // optional, cookie
    cookie: [],

    // optional, formData stream will send
    formData: xxx,

    // optional, Buffer, string or stream
    data: xxx,

    // optional, default GET
    method: 'GET',

    // optional, default 10000
    timeout: 10000,

    // optional, request proxy
    proxy: 'http://127.0.0.1:1080',

    // optional, concurrency limit, default os.cpus.length
    concurrency: 10,

    // optional, time for per request, if specific, concurrency set to 1
    delay: 0,

    // optional, use stream without parse
    stream: false
}, 

/**
 * @param {$ | object | string} data parsed data
 * @param {string} url which request url
 * @param {object} response response infos
 */
function (data, url, response) {
    // status code
    console.log(response.code)

    // headers
    console.log(response.headers)

    // cookie
    console.log(response.cookie)

    // Buffer for response
    console.log(response.buffer.toString())

    // response text
    console.log(response.data)

    // response stream
    response.stream.pipe(xxx)

    if (/html/.test(response.headers['content-type'])) {
        // dom
        const $ = data
        $('a').map(function () { return $(this).attr('href') }).get()
    } else if (/json/.test(response.headers['content-type'])) {
        // json
        console.log(JSON.stringify(data))
    } else {
        // string
        data.match(/title/)
    }

    // return something for next request
    return 'url'

    // or a url list
    return ['urls']

    // specific other options
    return { url: '', headers: {} }

    // or option list
    return [{ url: '', headers: {} }]
})
```