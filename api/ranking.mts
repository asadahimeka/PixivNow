import { VercelRequest, VercelResponse } from '@vercel/node'
import { handleError, isAccepted, request, setCorsHeader } from './utils.mjs'

export interface RankingQuery {
  p?: number
  mode?:
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'rookie'
  | 'male'
  | 'female'
  | 'daily_r18'
  | 'weekly_r18'
  | 'monthly_r18'
  | 'daily_ai'
  | 'daily_r18_ai'
  date?: string
}

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!isAccepted(req)) {
    return res.status(403).send('403 Forbidden')
  }
  const { query, headers } = req

  setCorsHeader(req, res)

  request({
    path: '/ranking.php',
    params: {
      ...query,
      format: 'json',
    },
    headers,
    specHeaders: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      referer: 'https://www.pixiv.net/ranking.php',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest'
    }
  })
    .then(({ data }) => {
      data.contents = data?.contents?.map((i: any) => {
        i.x_restrict = i?.illust_content_type?.sexual || 0
        return i
      })
      res.setHeader('cache-control', 'max-age=0, s-maxage=86400')
      res.send(data)
    })
    .catch((err) => {
      return handleError(err, res)
    })
}
