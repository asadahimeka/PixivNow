import { VercelRequest, VercelResponse } from '@vercel/node'
import axios, { AxiosRequestConfig, Method } from 'axios'
import cookie from 'cookie'
import isbot from 'isbot'

export function makeArtList(
  obj: Record<string, { id: number }>
): { id: number }[] {
  return Object.values(obj).sort((a, b) => b.id - a.id)
}

export function replaceUrl(
  obj: Record<string, any> | string
): Record<string, any> | string {
  function replace(str: string): string {
    return str
      .replace(/https:\/\/i\.pximg\.net\//g, '/-/')
      .replace(/https:\/\/s\.pximg\.net\//g, '/~/')
  }
  if (typeof obj === 'string') return replace(obj)

  for (const key in obj) {
    if (
      typeof obj[key] === 'string' &&
      /^https:\/\/[is]\.pximg\.net\//.test(obj[key])
    ) {
      obj[key] = replace(obj[key])
    } else if (typeof obj[key] === 'object') {
      obj[key] = replaceUrl(obj[key])
    }
  }
  return obj
}

export function handleError(err: any, res: VercelResponse) {
  return res
    .status(err?.response?.status || 500)
    .send(err?.response?.data || err)
}

export async function request({
  method = 'get',
  path = '/',
  params,
  data,
  headers,
  specHeaders
}: {
  method?: Method
  path?: `/${string}`
  params?: Record<string, string | string[] | number>
  data?: string
  headers?: any
  specHeaders?: any
}) {
  const url = new URL(path, 'https://www.pixiv.net')
  const cookies = cookie.parse(headers.cookie || '')

  // 做一些转换防止抑郁
  // "foo[]": [] -> "foo": []
  for (const i in params) {
    if (i.endsWith('[]') && Array.isArray(params[i])) {
      params[i.replace(/\[\]$/, '')] = params[i]
      delete params[i]
    }
  }

  let isAnon = false
  if (params?._anon === '1') {
    isAnon = true
    delete params._anon
  }

  const config: AxiosRequestConfig = {
    url: url.href,
    method,
    params,
    data,
    timeout: 9000,
    headers: {
      accept: headers.accept || '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': headers['accept-language'] || 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
      // 避免国产阴间浏览器或手机端等导致的验证码
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Microsoft Edge\";v=\"108\"",
      "sec-ch-ua-platform": "\"Windows\"",

      // ↓ Keep these headers
      host: 'www.pixiv.net',
      origin: 'https://www.pixiv.net',
      referer: 'https://www.pixiv.net/',

      ...specHeaders
    },
  }

  if (!isAnon && (headers.cookie || process.env.PIXIV_COOKIE)) {
    config.headers!.cookie = headers.cookie || process.env.PIXIV_COOKIE
  }

  if (headers['x-csrf-token'] || cookies.CSRFTOKEN) {
    config.headers!['x-csrf-token'] = headers['x-csrf-token'] || cookies.CSRFTOKEN
  }

  console.log('config: ', config)

  try {
    const res = await axios(config)
    res.data = replaceUrl(res.data?.body || res.data)
    return res
  } catch (err) {
    console.error('[AxiosError]', err)
    throw err
  }
}

export function isAccepted(req: VercelRequest) {
  const { "user-agent": ua, origin = '', referer = '' } = req.headers
  if (!ua) return false
  if (isbot(ua)) return false
  const { UA_BLACKLIST = '[]', ACCEPT_DIMAINS = '[]' } = process.env
  try {
    const list: string[] = JSON.parse(UA_BLACKLIST)
    const acceptDomains: string[] = JSON.parse(ACCEPT_DIMAINS)
    const uaOk = !list.some(e => ua.toLowerCase().includes(e))
    const originOk = acceptDomains.some(e => origin.includes(e))
    const refererOk = acceptDomains.some(e => referer.includes(e))

    return (originOk || refererOk) && uaOk
  } catch (e) {
    return false
  }
}

export function setCorsHeader(req: VercelRequest, res: VercelResponse) {
  res.setHeader('access-control-allow-origin', '*')
}

export default async (req: VercelRequest, res: VercelResponse) => {
  res.send({
    url: req.url,
    headers: req.headers,
    cookies: req.cookies,
    isAccepted: isAccepted(req)
  })
}
