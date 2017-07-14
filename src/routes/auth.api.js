import { findBackofficeUserByEmail, updateBackofficeUser } from '../data/backofficeUser'
import uuid from 'uuid'
import { computeToken } from '../utils/jwtHelpers'
import { verifyOTP } from '../utils/otpHelpers'
import { findUser } from '../data/user'

const login = (req, res) => {
  if (req.body.email && req.body.password) {
    if (req.body.code) {
      loginBackOffice(req, res)
    } else {
      loginFrontEnd(req, res)
    }
  } else {
    res.status(401).json({ message: 'Incorrect credentials' })
  }
}

const loginFrontEnd = (req, res) => {
  findUser(req.body.email, req.body.password)
  .then(() => {
    res.setHeader('Authorization', `Bearer ${ computeToken(req.body.email) }`)
    res.status(200).json({ _id: req.body.email })
  })
  .catch(() => {
    res.status(401).json({ message: 'Incorrect credentials' })
  })
}

const loginBackOffice = (req, res) => {
  findUser(req.body.email, req.body.password)
  .then(() => findBackofficeUserByEmail(req.body.email))
  .then((backofficeUser) => {
    if (!backofficeUser || !verifyOTP(backofficeUser.secret, req.body.code)) {
      return Promise.reject({ status: 401, message: req.__('incorrect credentials') })
    }
    let magicKey = uuid.v1()
    res.setHeader('Authorization', `Bearer ${ computeToken(req.body.email, magicKey) }`)
    return updateBackofficeUser(backofficeUser._id, { magicKey })
  })
  .then((updateStatus) => {
    if (!updateStatus.ok) {
      return Promise.reject({ status: 500, message: req.__('internal error') })
    }
    res.status(200).json({ _id: req.body.email })
  })
  .catch((err) => {
    res.status(err.status || 500).json({ message: err.message || req.__('internal error') })
  })
}

export default {
  login,
}
