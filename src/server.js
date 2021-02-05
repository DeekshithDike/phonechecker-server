const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

let config = null

function configure(_config) {
    config = _config

    config.log('configuration:\n', config)

    const app = express()
    app.use(bodyParser.json())
    app.use(express.urlencoded({ extended: true }))

    // required for `req.ip` to be populated if behind a proxy i.e. ngrok
    app.set('trust proxy', true)

    // setup basic auth if credentials are in .env
    if(config.basicAuth.username && config.basicAuth.password) {
        const passwordProtected = require('express-password-protect')
        const authConfig = {
            username: config.basicAuth.username,
            password: config.basicAuth.password,
            maxAge: 60000 * 10 // 1 hour
        }
        app.use(passwordProtected(authConfig))
        app.post('/', (req, res) => {
            const referrer = req.get('referer')
            res.redirect(referrer || '/')
        })
    }
    app.use(express.static(path.join(__dirname, '..', 'public')))

    const routes = require('./routes')
    app.use(routes(config))

    return app
}

async function serve(config) {
    const defaultConfig = require('./config')
    if(config) {
        // add any missing configuation from default config
        config = {...defaultConfig, ...config}
    }
    else {
        config = defaultConfig
    }
    const app = configure(config)

    app.listen(config.port, () => {
        console.log(`Example app listening at http://localhost:${config.port}`)
    })

    if(config.localtunnel.enabled) {
        // https://github.com/localtunnel/localtunnel
        async function startLocalTunnel() {
            config.log('Starting localtunnel')
            const localtunnel = require('localtunnel') 
            const tunnel = await localtunnel({
                port: config.port,
                subdomain: config.localtunnel.subdomain
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
        
        startLocalTunnel()
    }
}

module.exports = {
    serve
}