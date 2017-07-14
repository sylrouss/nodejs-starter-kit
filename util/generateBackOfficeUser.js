require('babel-register')
var argv = require('yargs').argv
var generate = require('../src/utils/backofficeHelpers.js').generate
var fs = require('fs')
var path = require('path')

if (argv.user === undefined) {
  throw Error('User argument is mandatory, i.e. \'npm run generate-backoffice-user -- --user foo\'')
}

var svgPath = path.join(__dirname, `qr_code/${ argv.user }.svg`)

generate(`${ argv.user }@example.org`)
.then(({ secret, imageData }) => {
  console.log(`>> Generated secret for ${ argv.user }@example.org: ${ secret.base32 }`)
  return fs.writeFileSync(svgPath, imageData, 'utf8')
})
.then(() => console.log(`>> Generated QR Code SVG file: ${ svgPath }`))
.catch((err) => console.log(err))
