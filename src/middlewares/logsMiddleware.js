import { logger } from '../settings'
import onFinished from 'on-finished'

const getIP = (req) => (
  req.ip || req._remoteAddress ||
   (req.connection && req.connection.remoteAddress) ||
  (req.socket && req.socket.remoteAddress) ||
  (req.socket.socket && req.socket.socket.remoteAddress) ||
  undefined
)

const responseTime = (startTime) => {
  let hrtime = process.hrtime(startTime)
  return (hrtime[0] * 1e3 + hrtime[1] / 1e6).toFixed(3)
}

module.exports = (app) => {
  app.use((req, res, next) => {
    req.log = logger
    req._startTime = process.hrtime()
    req._remoteAddress = getIP(req)
    const logRequest = () => {
      logger.info({
        req_body: req.body && req.body.password ? { ...req.body, password: '********' } : req.body,
        req_http_version: `HTTP/${ req.httpVersionMajor }.${ req.httpVersionMinor }`,
        req_method: req.method,
        req_referer: req.header('referer') || req.header('referrer'),
        req_remote_address: req._remoteAddress,
        req_url: req.originalUrl || req.url,
        req_user_agent: req.header('user-agent'),
        req_user_id: req.auth && req.auth.user && req.auth.user._id,
        res_length: res._headers['content-length'],
        res_status_code: res.statusCode,
        res_time: responseTime(req._startTime),
      }, 'request')
    }
    onFinished(res, logRequest)
    next()
  })
}
