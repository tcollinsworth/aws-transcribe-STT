import path from 'path'
import fs from 'fs'
import https from 'https'
import express from 'express'

import awsTempCredentials from './aws-temp-credentials.mjs'

import __dirname from './dirname.mjs'

const HTTPS_PORT = '8888' // process.env.HTTPS_PORT
const HTTPS_HOST = '0.0.0.0' // "localhost" // 0.0.0.0 for all process.env //process.env.HTTPS_HOST

const app = express()

export async function start() {
  app.get('/', (req, resp) => resp.send('Hello world!'))
  app.use(awsTempCredentials)

  try {
    // https://www.kevinleary.net/self-signed-trusted-certificates-node-js-express-js/
    const httpsServer = https.createServer({
      key: fs.readFileSync(path.join(__dirname, '../https-test-cert/server.key')),
      cert: fs.readFileSync(path.join(__dirname, '../https-test-cert/server.crt')),
      requestCert: false,
      rejectUnauthorized: false,
    }, app)

    httpsServer.listen(parseInt(HTTPS_PORT, 10), HTTPS_HOST, () => {
      console.log(`https server is listening on ${HTTPS_HOST}:${HTTPS_PORT}`)
    })
      .on('error', (err) => {
        console.error(err, 'Error initializing express https')
        // delay exit to allow time to log
        setTimeout(() => process.exit(1), 1000)
      })
  } catch (err) {
    console.error(err, 'Error initializing services')
    // delay exit to allow time to log
    setTimeout(() => process.exit(1), 1000)
  }
  console.log('Initialization completed')
}

start()
