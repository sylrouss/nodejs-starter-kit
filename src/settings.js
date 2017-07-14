import bunyan from 'bunyan'
import blackhole from 'stream-blackhole'

export const VERSION = '20170714'

export const logger = bunyan.createLogger({
  name: 'api',
  streams: [ { level: 'debug', stream: process.env.NOTRACE ? blackhole() : process.stdout } ],
})
