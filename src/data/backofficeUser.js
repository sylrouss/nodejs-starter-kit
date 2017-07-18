import mongoose from 'mongoose'
import { findOne, update } from './connectors/mongo-connector'

var backofficeUserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  magicKey: String,
  secret: String,
})

export const BackofficeUser = mongoose.models.BackofficeUser || mongoose.model('BackofficeUser', backofficeUserSchema)

export const findBackofficeUserByEmail = (email) => findOne(BackofficeUser, { email })

export const updateBackofficeUser = (_id, data) => update(BackofficeUser, _id, data)
