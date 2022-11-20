import { VercelRequest, VercelResponse } from '@vercel/node'
import { handleError, isAccepted, request } from './utils'

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
  const { query } = req

  request({
    path: '/ranking.php',
    params: {
      ...query,
      format: 'json',
    },
    headers: req.headers,
  })
    .then(({ data }) => {
      data.contents = data?.contents?.map((i: any) => {
        i.xRestrict = i?.illust_content_type?.sexual || 0
        return i
      })
      res.setHeader('access-control-allow-origin', '*')
      res.setHeader('access-control-allow-credentials', 'true')
      res.setHeader('cache-control', 'max-age=0, s-maxage=3600')
      res.send(data)
    })
    .catch((err) => {
      return handleError(err, res)
    })
}
