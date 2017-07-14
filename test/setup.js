/* eslint-env node, mocha */
import mongoose from 'mongoose'
import ldap from 'ldapjs'
import { BackofficeUser } from '../src/data/backofficeUser'
import { generateSecret } from '../src/utils/otpHelpers'

var url
var mongoUrl = `mongodb://${ process.env.DATABASE_HOST || 'localhost' }:${ process.env.DATABASE_PORT }/test`
var ldapUrl = `ldap://${ process.env.LDAP_HOST || 'localhost' }:${ process.env.LDAP_PORT }`
var ldapClient = ldap.createClient({ url: ldapUrl })
var options = {
  server: {
    reconnectTries: Number.MAX_VALUE,
    socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 },
  },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
}

before((done) => {
  url = require('../src/server')
  ldapClient.bind('cn=admin,dc=example,dc=org', 'admin', (err) => {
    if (err) { done(err) }
    createLDAPUser('testback', 'testoffice', 'weak', (err) => {
      if (err) { done(err) }
      done()
    })
  })
})

after((done) => (
  removeLDAPUser('testback', 'testoffice', done)
))

beforeEach((done) => {
  mongoose.disconnect()
  .then(() => {
    mongoose.connect(mongoUrl, options)
    mongoose.connection.once('connected', () => {
      mongoose.connection.db.dropDatabase()
      done()
    })
  })
  .catch(done)
})

afterEach((done) => {
  mongoose.disconnect()
  .then(done)
})

export const baseURL = () => url

export const createBackofficeUser = (email) =>
  new BackofficeUser({ email, secret: generateSecret(email).base32 })
  .save()
  .then((backofficeUser) => Promise.resolve(backofficeUser))
  .catch((err) => Promise.reject(err))

export const createLDAPUser = (username, surname, password, done) => {
  var entry = {
    cn: username,
    sn: surname,
    mail: `${ username }.${ surname }@example.org`,
    objectclass: 'inetOrgPerson',
    userPassword: password,
  }
  ldapClient.add(`cn=${ username } ${ surname },dc=example,dc=org`, entry, done)
}

export const removeLDAPUser = (username, surname, done) =>
  ldapClient.del(`cn=${ username } ${ surname },dc=example,dc=org`, done)
