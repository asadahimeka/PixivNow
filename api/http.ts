import { VercelRequest, VercelResponse } from '@vercel/node'
import { Method } from 'axios'
import { isAccepted, request, setCorsHeader } from './utils'

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!isAccepted(req)) {
    return res.status(403).send('403 Forbidden')
  }

  setCorsHeader(req, res)

  try {
    let { __PREFIX, __PATH } = req.query as Record<string, string>
    if (/novel\/\d+\.txt$/.test(__PATH)) {
      __PATH = __PATH.replace('.txt', '')
    }
    const { data } = await request({
      method: req.method as Method,
      path: `/${encodeURI(`${__PREFIX}${__PATH ? '/' + __PATH : ''}`)}`,
      params: req.query,
      data: req.body,
      headers: req.headers,
    })
    if (req.url?.endsWith('.txt')) {
      res.setHeader('Cache-Control', 'max-age=2678400, s-maxage=2678400')
    } else {
      res.setHeader('Cache-Control', 'max-age=3600, s-maxage=3600')
    }
    res.status(200).send(data)
  } catch (err) {
    const e = err as any
    res.status(e?.response?.status || 500).send(e?.response?.data || e)
  }
}
