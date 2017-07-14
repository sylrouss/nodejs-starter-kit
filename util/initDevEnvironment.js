require('babel-register')
var BackofficeUser = require('../src/data/backofficeUser').BackofficeUser
var save = require('../src/data/connectors/mongo-connector').save
var bind = require('../src/data/connectors/ldap-connector').bind
var ldapClient = require('../src/data/connectors/ldap-connector').ldapClient

var ldapLogin = process.env.LDAP_LOGIN
var ldapPassword = process.env.LDAP_PASSWORD

const BACKOFFICE_USER_EMAIL = 'back.office@example.org'
const FOO_BAR_USER_EMAIL = 'foo.bar@example.org'
const BACKOFFICE_USER_DB = {
  email: BACKOFFICE_USER_EMAIL,
  secret: 'K5RC6SR6NVJDE3B6EFQSG5BYHNIEWIKHKFJSCQ2HMZJDGYLSPFBTIJTTJJUWK4KBHZXDATCELUXUAL3IN54DEZLOMNIGMUT2PEVD6J' +
    'JQG55FMR3BF5HSIVCKOBBG4LDSHYVCQ33IHJQW6USVERXUQYTOMRSG6YJPLZKFO43QHQQSKXKSIAXWE4LTNEZGMQR6ENVXOTRVEMYXQ',
}
const BACKOFFICE_USER_LDAP = {
  cn: 'back',
  sn: 'office',
  mail: BACKOFFICE_USER_EMAIL,
  objectclass: 'inetOrgPerson',
  userPassword: '12345678',
}
const USER_LDAP = {
  cn: 'foo',
  sn: 'bar',
  mail: FOO_BAR_USER_EMAIL,
  objectclass: 'inetOrgPerson',
  userPassword: '12345678',
}

const addLDAPUser = (cn, entry) =>
  new Promise((resolve, reject) => {
    ldapClient.add(`cn=${ cn },dc=example,dc=org`, entry, (err) => {
      if (err) { return reject(err) }
      return resolve()
    })
  })

const addBackofficeUser = () => save(new BackofficeUser(BACKOFFICE_USER_DB))

bind(`cn=${ ldapLogin },dc=example,dc=org`, ldapPassword)
.then(() => Promise.all([addLDAPUser('back office', BACKOFFICE_USER_LDAP), addLDAPUser('foo bar', USER_LDAP)]))
.then(() => {
  console.log(`>> Added ${ BACKOFFICE_USER_EMAIL } and ${ FOO_BAR_USER_EMAIL } in LDAP`)
  return addBackofficeUser()
})
.then((backofficeUser) => {
  console.log(`>> Added ${ BACKOFFICE_USER_EMAIL } in DB`)
  process.exit()
})
.catch((err) => {
  console.log(err)
  process.exit(1)
})
