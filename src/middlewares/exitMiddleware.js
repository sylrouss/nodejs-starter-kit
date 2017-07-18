import mongoose from 'mongoose'
import { logger } from './../settings'

module.exports = (server, port) => {
  const exitHandler = (signal, err) => {
    mongoose.disconnect()
    .then(() => {
      logger.info({ err, port, signal }, 'mongo disconnected')
      server.close(() => {
        logger.info({ err, port, signal }, 'exit gracefully')
        process.exit(0)
      })
    })
    .catch((err) => {
      logger.err({ err, port, signal }, 'mongo failed to disconnect')
      server.close(() => {
        logger.info({ err, port, signal }, 'exit gracefully')
        process.exit(0)
      })
    })
  }
  process.on('SIGINT', exitHandler.bind(null, 'SIGINT'))
  process.on('SIGTERM', exitHandler.bind(null, 'SIGTERM'))
  process.on('uncaughtException', (err) => {
    exitHandler('uncaughtException', err)
  })
}
