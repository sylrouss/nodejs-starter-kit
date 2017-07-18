import mongoose from 'mongoose'
import { logger } from './../settings'

module.exports = (server, port) => {
  const closeServerHandler = (signal, err) => {
    server.close(() => {
      logger.info({ err, port, signal }, 'exit gracefully')
      process.exit(0)
    })
  }
  const exitHandler = (signal, err) => {
    mongoose.disconnect()
    .then(() => {
      logger.info({ }, 'mongo disconnected')
      closeServerHandler(signal, err)
    })
    .catch((mongoError) => {
      logger.err({ mongoError }, 'mongo failed to disconnect')
      closeServerHandler(signal, err)
    })
  }
  process.on('SIGINT', exitHandler.bind(null, 'SIGINT'))
  process.on('SIGTERM', exitHandler.bind(null, 'SIGTERM'))
  process.on('uncaughtException', (err) => {
    exitHandler('uncaughtException', err)
  })
}
