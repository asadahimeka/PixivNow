import { VercelRequest, VercelResponse } from '@vercel/node'
import { handleError, isAccepted, request } from '../utils'

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!isAccepted(req)) {
    return res.status(403).send('403 Forbidden')
  }
  const { query } = req
  const { word } = query
  try {
    const { data } = await request({
      path: `/ajax/search/artworks/${encodeURI(word as string)}`,
      params: {
        mode: 'all',
        p: '1',
        ...query,
      },
      headers: req.headers,
    })
    res.setHeader('Cache-Control', 'max-age=0, s-maxage=600')
    res.send(data)
  } catch (err) {
    return handleError(err, res)
  }
}
