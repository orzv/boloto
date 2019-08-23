# Boloto

Faster, easier http crawler by Node.js

**v2 was rebuild which whole different from v1**

## Features

- Server side dom
- Fork sub task
- Rate limiter
- Task watcher

## Install

```shell
npm i boloto
```

## Usage

```javascript
const boloto = require('boloto')

async function start() {
    let res = await boloto('http://xxx.ooo/')

    // or special referer
    let res2 = await boloto('http://example.com/', 'http://xxx.ooo/')
    let $ = await res.html()
    return $('a').map(function() {
        return $(this).attr('href')
    })
}
```

### Save file

```javascript
let res = await boloto('http://xxx.ooo/picture.jpg')
await res.save('./test.jpg')
```

### Response infos

```javascript
let res = await boloto('http://xxx.ooo/')

// get header
res.headers.get('content-type')

// raw headers
res.headers.raw()

// cookie
res.cookie()

// status code
res.status

// string
await res.text()

// dom
await res.html()

// buffer
await res.buffer()

// json
await res.json()

// stream
await res.body
```

### Request with proxy

```javascript
const agent = boloto.proxy('http://127.0.0.1:1080')

await boloto('url', { agent })
```

### Request options

```javascript
await boloto('url', {
    // request method, default GET
    method: 'GET',

    // headers
    headers: {
        'User-Agent': 'Boloto/2'
    },

    // compress, default true
    compress: true,

    // data will send
    body: null,

    // redirect limit, defaults 0
    redirect: 3,

    // request timeout, defaults 10000
    timeout: 10000,

    // agent
    agent: boloto.proxy('https://127.0.0.1:1080'),

    // concurrency limit
    limit: 3,

    // request delay
    delay: 1000,

    // cookie,
    cookie: { session: '1' },

    // referer
    referer: 'http://from.url/'
})
```

### Task queue

```javascript
boloto.queue(['url1', 'url2'], {
    // limit rate per seconds, if special delay, it will be set to 1
    limit: 3,

    // or delay for next request
    delay: 3000
}).on('data', function(res) {
    console.log(res.url)
    await res.html()
}).on('end', function() {
    console.log('finished')
})
```


### Watch

```javascript
// interval
boloto.watch('url', 2000, options).on('data', function(res, stop) {
    console.log(res.url)

    // you can stop interval
    stop()
})

// cron
boloto.watch('url', '0 */10 * * * *', options).on('data', function(res, stop) {
    console.log(res.url)

    // you can stop interval
    stop()
})
```


### Save all files

```javascript
await boloto.saveAll([...urls], '/path/to/save', options)
```
