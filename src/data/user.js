import { bind, search, baseDN } from './connectors/ldap-connector'

var ldapLogin = process.env.LDAP_LOGIN
var ldapPassword = process.env.LDAP_PASSWORD

export const findUser = (email, password) =>
  bind(`cn=${ ldapLogin },${ baseDN }`, ldapPassword)
  .then(() => search(email))
  .then((user) => bind(user.dn, password))
  .catch(() => Promise.reject({ status: 401, message: 'Incorrect credentials' }))
