import mongoose from 'mongoose'

mongoose.Promise = global.Promise

var uri = process.env.DATABASE_URI || `${ process.env.DATABASE_HOST || 'localhost' }:${ process.env.DATABASE_PORT }`
var options = {
  server: {
    reconnectTries: Number.MAX_VALUE,
    socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 },
  },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
}
mongoose.connect(`mongodb://${ uri }/${ process.env.DATABASE_NAME }`, options)

export const defaultJSONTransform = (doc, ret, options) => {
  delete ret._id
  delete ret.__v
  delete ret.n
  delete ret.nModified
  delete ret.ok
  return ret
}

export const findOne = (model, conditions) => model.findOne(conditions)

export const save = (object) => object.save()

export const update = (model, _id, data) => model.update({ _id }, { $set: data })
