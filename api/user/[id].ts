import { VercelRequest, VercelResponse } from '@vercel/node'
import { handleError, isAccepted, makeArtList, request } from '../utils'

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!isAccepted(req)) {
    return res.status(403).send('403 Forbidden')
  }
  const id = req.query.id as string
  if (!/^\d+$/g.test(id)) {
    return res.status(400).send({
      error: true,
      message: 'Invalid User ID',
    })
  }

  Promise.all([
    request({
      path: `/ajax/user/${id}`,
      params: { full: '1', ...req.query },
      headers: req.headers,
    }),
    request({
      path: `/ajax/user/${id}/profile/top`,
      params: req.query,
      headers: req.headers,
    }),
  ]).then(
    ([{ data: basic }, { data: more }]) => {
      const { illusts, manga, novels } = more

      const data = {
        ...basic,
        illusts: makeArtList(illusts),
        manga: makeArtList(manga),
        novels,
      }
      res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600')
      res.send(data)
    },
    (err) => {
      return handleError(err, res)
    }
  )
}
