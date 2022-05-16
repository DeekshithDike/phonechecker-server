const path = require('path')
const express = require('express')
const cors = require('cors')

const createConfig = require('./config')
const routes = require('./routes')
const { expressPino } = require('./logger')

async function serve(customConfig) {
  const config = await createConfig(customConfig)
  config.log('configuration:\n', config)
  const app = express()
  app.use(expressPino)
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // required for `req.ip` to be populated if behind a proxy i.e. ngrok
  app.set('trust proxy', true)

  // setup basic auth if credentials are in .env
  if (config.basicAuth.username && config.basicAuth.password) {
    const passwordProtected = require('express-password-protect')
    const authConfig = {
      username: config.basicAuth.username,
      password: config.basicAuth.password,
      maxAge: 60000 * 10, // 1 hour
    }
    app.use(passwordProtected(authConfig))
    app.post('/', (req, res) => {
      const referrer = req.get('referer')
      res.redirect(referrer || '/')
    })
  }
  app.use(express.static(path.join(__dirname, '..', 'public')))

  app.use(routes(config))

  const server = app.listen(config.port, () => {
    console.log(`Example app listening at http://localhost:${config.port}`)
  })

  if (config.localtunnel.enabled) {
    // https://github.com/localtunnel/localtunnel
    config.log('Starting localtunnel')
    const localtunnel = require('localtunnel')
    const tunnel = await localtunnel({
      port: config.port,
      subdomain: config.localtunnel.subdomain,
    })
    tunnel.on('request', (info) => {
      console.log(info)
    })
    tunnel.on('error', (error) => {
      console.error(error)
    })
    tunnel.on('close', () => {
      console.log('localtunnel closing')
    })
    console.log(`localtunnel: ${tunnel.url}`)
  }
  return {
    app,
    server,
  }
}

module.exports = {
  serve,
}
