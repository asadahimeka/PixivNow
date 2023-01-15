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
      message: 'Invalid Artwork ID',
    })
  }

  try {
    const [details, pages] = await Promise.all([
      request({
        path: `/ajax/illust/${id}`,
        params: req.query,
        headers: req.headers,
      }),
      request({
        path: `/ajax/illust/${id}/pages`,
        params: req.query,
        headers: req.headers,
      }),
    ])

    try {
      if (!req.query.full) delete details.data.noLoginData
      delete details.data.zoneConfig

      details.data.userIllusts = makeArtList(details.data.userIllusts)
    } catch (e) {}

    res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600')
    return res.send({ ...details.data, pages: pages.data })
  } catch (err) {
    return handleError(err, res)
  }
}
