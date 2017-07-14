import ldap from 'ldapjs'

export const ldapClient = ldap.createClient({
  reconnect: true,
  timeout: 30000,
  url: `ldap://${ process.env.LDAP_HOST || 'localhost' }:${ process.env.LDAP_PORT }`,
})

export const baseDN = process.env.LDAP_BASE_DN || 'dc=example,dc=org'

export const search = (email) =>
  new Promise((resolve, reject) => {
    var opts = {
      filter: `(mail=${ email })`,
      scope: 'sub',
      attributes: ['dn'],
    }
    ldapClient.search(baseDN, opts, (err, res) => {
      if (err) {
        return reject(err)
      }
      var foundResult
      res.on('searchEntry', function (entry) {
        foundResult = entry.object
      })
      res.on('error', function (err) {
        return reject(err)
      })
      res.on('end', function (result) {
        return resolve(foundResult)
      })
    })
  })

export const bind = (cn, password) =>
  new Promise((resolve, reject) => {
    ldapClient.bind(cn, password, (err) => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })
