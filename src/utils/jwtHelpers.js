import expressJwt from 'express-jwt'
import jwt from 'jsonwebtoken'
import * as fs from 'fs'
import path from 'path'

let secretFilePath = path.join(path.resolve(process.cwd()), 'config/secret/secret.pem')
const PRIVATE_KEY = fs.readFileSync(secretFilePath, 'utf8').toString('utf8')

export const computeToken = (email, magicKey = undefined) =>
 jwt.sign({ email, magicKey }, PRIVATE_KEY, { expiresIn: magicKey ? '1h' : '24h' })

export const verifyToken = (token) => jwt.verify(token, PRIVATE_KEY)

export const initExpressJwt = (unlessPath) => expressJwt({ secret: PRIVATE_KEY, requestProperty: 'auth' })
 .unless({ path: unlessPath })
