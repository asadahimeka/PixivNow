import { VercelRequest, VercelResponse } from '@vercel/node'
import { isAccepted, request } from './utils'

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!req.headers['user-agent']?.includes('UptimeRobot') && !isAccepted(req)) {
    return res.status(403).send('403 Forbidden')
  }
  const timestamp = Date.now()
  let status = true
  let error: any
  try {
    await request({ path: '/users/11', headers: req.headers })
  } catch (err) {
    status = false
    error = err
  }
  res.send({
    status,
    timestamp,
    ping: Date.now() - timestamp,
    error,
  })
}
