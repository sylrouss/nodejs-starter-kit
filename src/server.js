import express from 'express'
import bodyParser from 'body-parser'
import { logger, VERSION } from './settings'
import i18n from 'i18n'
import path from 'path'

const app = express()
const isDevelopmentEnv = app.get('env') !== 'production'

i18n.configure({
  locales: ['en', 'fr'],
  directory: path.join(path.resolve(process.cwd()), 'config/locales'),
  updateFiles: isDevelopmentEnv,
  autoReload: isDevelopmentEnv,
})
app.use(i18n.init)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.set('port', process.env.PORT || 7777)

require('./middlewares/logsMiddleware')(app)
require('./middlewares/authorizationMiddleware')(app)

var router = express.Router()
require('./routes/api')(router)
app.use(`/${ VERSION }/api`, router)

app.use((req, res, next) => {
  var err = new Error(req.__('not found'))
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.json({ 'error': { message: err.message, error: {} } })
})

const PORT_USED_FOR_TESTS = '3001'
const port = app.get('port')
if (port !== PORT_USED_FOR_TESTS) {
  var server = app.listen(port, () => {
    logger.info({ port }, 'start')
  })
  server.on('error', (error) => {
    logger.error({ error, port }, 'start')
  })
  require('./middlewares/exitMiddleware')(server, port)
}

module.exports = app
