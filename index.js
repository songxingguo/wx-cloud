const Router = require('./router')

/**
 * Example of how router can be used in an application
 *  */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

function handler (request) {
    const init = {
        headers: { 'content-type': 'application/json' },
    }
    const body = JSON.stringify({ some: 'json' })
    return new Response(body, init)
}

// 处理请求，分发路由
async function handleRequest (request) {
    const r = new Router()
    r.get('.*/token', () => tokenResponse())
    r.get('.*/coll', () => colsResponse(request))


    r.get('/', () => new Response('WX API!')) // return a default message for the root route

    const resp = await r.route(request)
    return resp
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

// 小程序 HTTP 请求 TOKEN 值
const tokenResponse = async () => {
    const tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx851ea7878ea99d18&secret=4c353cf5a856771ecfbc93bd1463e00f'
    const { access_token } = await new Promise((resolve => {
        fetch(tokenUrl).then(async response => {
            if (response.status === 200) {
                const data = await response.json()
                resolve(data)
            }
        }).then(response => {
            console.log(response)
        })
    }))
    return new Response(JSON.stringify({ access_token }), {
        headers: {
            ...corsHeaders,
            'content-type': 'application/json;charset=UTF-8',
        },
    })
}

// 获取数据库集合
const colsResponse = async ({ url }) => {
    const { searchParams: sParams } = new URL(url)
    const access_token = sParams.get('token')
    const tokenUrl = `https://api.weixin.qq.com/tcb/databasecollectionget?access_token=${access_token}`
    const { collections } = await new Promise((resolve => {
        fetch(tokenUrl, {
            method: 'POST',
            body: JSON.stringify({
                env: sParams.get('env') || '',
                limit: sParams.get('limit') || 10,
                offset: sParams.get('offset') || 0,
            }),
        }).then(async response => {
            if (response.status === 200) {
                const data = await response.json()
                resolve(data)
            }
        }).then(response => {
            console.log(response)
        })
    }))
    return new Response(JSON.stringify({ collections }), {
        headers: {
            ...corsHeaders,
            'content-type': 'application/json;charset=UTF-8',
        },
    })
}
