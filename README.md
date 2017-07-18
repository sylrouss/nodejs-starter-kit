# Node.js Starter Kit

This starter kit is designed to get you up and running with a Node.js/Express stack.
It provides front-end logging with LDAP, back-end logging with LDAP and OTP, unit testing, tests reporting, code coverage and docker swarm deployment files for development and production environments and a whole lot more.

## Requirements

* node `^6.10.1`
* npm `^3.10.10`

## Features

* [Express](https://github.com/expressjs/express)
* [Webpack](https://github.com/webpack/webpack)
* [Babel](https://github.com/babel/babel)
* [ESLint](http://eslint.org)
* [SuperTest](https://github.com/visionmedia/supertest)
* [LDAP Client](https://github.com/mcavage/node-ldapjs)
* [Mongo Client](https://github.com/Automattic/mongoose)
* [JWT](https://github.com/auth0/node-jsonwebtoken)


## Getting Started

Just clone the repo and install the necessary node modules:

```shell
$ git clone https://github.com/sylrouss/nodejs-starter-kit.git
$ cd nodejs-starter-kit
$ npm install                   # Install Node modules listed in ./package.json (may take a while the first time)
$ npm start dev                 # Compile and launch
```

## Usage

### Development and Production

* Doing live development? Use `npm start dev` to spin up the development server.
* Compiling the application to disk? Use `npm run build`.
* Creating a Docker image? `docker build -t example/nodejs-starter-kit .`
* Deploying to a docker swarm environment? Use docker-compose-production-template.yml


### Features

* `docker deploy -c docker-compose-development.yml dev` - Run required third parties: Mongo and OpenLDAP.
* `npm run build` - Compiles the application to disk (`~/dist` by default).
* `npm run dev` - Serve your app at `localhost:7777`. Enables nodemon to automatically restart the server when code is changed.
* `npm run dev:init` - Initializes default front-end and back-office users in Mongo and LDAP.
* `npm run generate-backoffice-user` - Helpers to generate OTP key and QR code for a back-office user.
* `npm run test` - Runs unit tests with mocha.
* `npm run test:dev` - Runs unit tests with mocha and watches for changes to re-run tests.
* `npm run test:report` - Runs unit tests with mocha and generates test-reports.xml.
* `npm run test:with-cobertura` - Runs unit tests with mocha and generates code coverage files.
* `npm run test:build-report` - Generates code coverage HTML files.

## Structure

The folder structure provided is only meant to serve as a guide.

```
.
├── build                    # Build scripts
├── config                   # Build/Start scripts
│   └── locales              # Generated locales files with i18n
│   ├── secret               # Default secret.pem file used by JWT
├── src                      # Application source code
│   ├── data                 # Data Access Object
│   │   └── connectors       # Connectors for Mongo and LDAP
│   ├── middlewares          # Express middlewares: authorization, exit (gracefully) and logs
│   ├── routes               # API Route definitions
│   ├── utils                # Helpers
│   └── server.js            # Express bootstrap
├── tests                    # Unit tests
└── utils                    # Helpers for development environment
```

## Deployment

> The default `secret.pem` file should be regenerated when going on production!

```shell
$ openssl req -newkey rsa:2048 -new -nodes -keyout new_secret.pem
```
