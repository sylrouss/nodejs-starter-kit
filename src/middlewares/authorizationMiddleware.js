import cors from 'cors'
import uuid from 'uuid'
import { VERSION } from '../settings'
import { computeToken, initExpressJwt, verifyToken } from '../utils/jwtHelpers'
import { findBackofficeUserByEmail, updateBackofficeUser } from '../data/backofficeUser'

const pathsWithoutToken = [
  { url: `/${ VERSION }/api/login`, methods: ['POST'] },
  { url: `/${ VERSION }/api/health`, methods: ['GET'] },
]

const pathsWithBackofficeRights = [
  { url: `/${ VERSION }/api/kpi`, methods: ['GET'], roles: ['admin'] },
]

const refreshToken = (req, res, next) => {
  for (let pathWithoutToken of pathsWithoutToken) {
    if (req.url.match(pathWithoutToken.url) && pathWithoutToken.methods.indexOf(req.method) > -1) {
      return next()
    }
  }
  let authorization = req.headers['authorization']
  var token = authorization.match(/^Bearer ([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9-_]+)$/)[1]
  const verify = verifyToken(token)
  if (!verify.email) {
    res.status(400).json({ message: req.__('invalid token') })
  } else if (verify.magicKey) {
    findBackofficeUserByEmail(verify.email)
    .then((backofficeUser) => {
      if (!backofficeUser || verify.magicKey !== backofficeUser.magicKey) {
        return Promise.reject({ status: 403, message: req.__('forbidden access') })
      }
      req.auth = { backofficeUser: verify.email }
      let magicKey = uuid.v1()
      res.setHeader('Authorization', `Bearer ${ computeToken(req.auth.backofficeUser, magicKey) }`)
      return updateBackofficeUser(backofficeUser._id, { magicKey })
    })
    .then((updateStatus) => {
      if (!updateStatus.ok) {
        return Promise.reject({ status: 500, message: req.__('internal error') })
      }
      next()
    })
    .catch((err) => {
      res.status(err.status || 500).json({ message: err.message || req.__('internal error') })
    })
  } else {
    req.auth = { frontendUser: verify.email }
    res.setHeader('Authorization', `Bearer ${ computeToken(verify.email) }`)
    next()
  }
}

const checkBackofficeRights = (req, res, next) => {
  for (let path of pathsWithBackofficeRights) {
    if (req.url.match(path.url) && path.methods.indexOf(req.method) > -1) {
      if (req.auth.backofficeUser) {
        return next()
      }
      return res.status(403).json({ message: req.__('forbidden access') })
    }
  }
  return next()
}

module.exports = (app) => {
  app.use(cors({ exposedHeaders: 'Authorization' }))
  app.use(initExpressJwt(pathsWithoutToken))
  app.use(refreshToken)
  app.use(checkBackofficeRights)
}
