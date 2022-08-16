# tru.ID Development Server

The **tru.ID** development server provides basic example code to be used with client application, runnable examples via served web pages and can be used to help with the **tru.ID** development process.

The server can be used from **standalone** from source or installed and used as a **module**.

## Before you being

You will need:

- Node.JS installed
- a [**tru.ID**](https://tru.id) account

## Using Standalone

### Getting Started

Clone or unzip the tru.ID Node Server into a directory.

### Create a tru.ID Project

- Install the [tru.ID CLI](https://tru.id/docs/reference/cli)
- Setup the CLI with the command: `$ tru login {IDP}`. Replacing `{IDP}` with your Identity Provider (google|github|microsoft).
- Create a project with the CLI pointing to the tru.ID Node Server directory `$ tru projects:create --project-dir PATH_TO_SERVER_DIR`. This will create a `tru.json` file in the directory.

### Install dependencies:

```
npm install
# or
yarn install
```

### Configuration

If required, you can make configuration changes with the following environment variables:

- `PORT` : change the port that the server listens on.
- `DEBUG` : determines whether debug information is logged via `console.log`.
- `CONFIG_PATH` : the path to the `tru.json` configuration file for the tru.ID project. Not used if `TRU_CLIENT_ID` and `TRU_CLIENT_SECRET` are set.
- `API_BASE_URL` : the tru.ID base URL. Defaults to `https://eu.api.tru.id` (`https://in.api.tru.id` is also available)
- `TRU_CLIENT_ID` : The `client_id` of a **tru.ID** project.
- `TRU_CLIENT_SECRET` : The `client_secret` of a **tru.ID** project.
- `USERNAME` : A username to be used with basic auth for the site.
- `PASSWORD` : A password to be used with basic auth for the site.
- `NGROK_SUBDOMAIN` : If you have ngrok premium membership, you can define your ngrok subdomain here.
- `NGROK_AUTHTOKEN` : Your ngrok auth token found in the [ngrok dashboard](https://dashboard.ngrok.com/get-started/setup)
- `NGROK_REGION` : The `region` the ngrok tunnel is set up in.

The server will attempt to load environment variables from a `.env` file in the root directory of the server.

### Phone Check redirect

The final step to a successful Phone Check for v0.2 is to provide a `redirect_url` back to your server. With this `dev-server`, you must:

1. Run a local tunnel solution to expose your local running server to the Internet
2. Configure your Project in the [Developer Console](https://developer.tru.id/console) to have a Redirect URL. This should be `{local_tunnel_url}/v0.2/phone-check/exchange-code` (replace `{local_tunnel_url}` with the URL exposing your localhost server to the Internet).

### Phone Check callbacks

If you wish to receive Phone Check HTTP callbacks when the Phone Check enters and end state, you must:

1. Run a local tunnel solution to expose your local running server to the Internet
2. Configure your Project to have a `phonecheck_callback_url`

From the project directory run the following command replacing `{local_tunnel_url}` with the URL exposing your localhost server to the Internet:

```
$ tru projects:update --phonecheck-callback {local_tunnel_url}/phone-check/callback
```

### Run the server

There are two ways you can run this `dev-server` for testing with, the first one is to be run locally, needing a service such as [Ngrok](https://ngrok.com/) to expose the server to the Internet. The second method is to deploy it to a sevice such as [Fly.io](https://www.fly.io).

#### Run Locally

```
npm start
# or
yarn start
```

#### Remote via Fly.io

[Fly.io](https://www.fly.io) is a Platform-as-a-Service (PaaS) allowing developers to deploy full stack applications with minimal effort.

To deploy the `dev-server` remotely, install the [Flyctl](https://fly.io/docs/getting-started/installing-flyctl/) CLI. This CLI provides functionality for signing up, logging in, and deploying.

##### Environment Variables

Two environment variables are required `TRU_ID_CLIENT_ID` and `TRU_ID_CLIENT_SECRET`, which can be found in your `tru.json` file. These are needed to verify the checks. So run the command below to register these in your Fly.io project:

```bash
flyctl secrets set TRU_ID_CLIENT_ID=<YOUR_CLIENT_ID> TRU_ID_CLIENT_SECRET=<YOUR_CLIENT_SECRET>
```

#### Deploy

> **Note:** Please keep in mind that deploying this remotely could result in the API endpoints being publically accessible to anyone unless you secure these endpoints with authentication, the server will also be running until you close it down.

Running `flyctl launch` will prompt you for some pieces of information about your application, including the region you wish this to be deployed to. If you're using the [tru.ID's India Data Residency](https://tru.id/blog/india-data-residency), you may want to choose the `Chennai (Madras), India` for your deployment.

At the end of this, you'll also be asked if you wish to deploy this application remotely. Choose yes.

```bash
flyctl launch
```

Your backend server is now ready to be used on the URL: `https://<fly.io project name>.fly.dev`.

#### Internal deploy with fly.io

We keep a separate branch `deploy_fly_io` that contains the necessary changes for our internal deployment. Make sure to merge any changes from `main` to `deploy_fly_io` and then when you are ready to deploy run
```bash
flyctl deploy
```

### Explore

- View the code in [blob/main/src/index.js](blob/main/src/index.js)
- The server exposes a basic homepage with some example pages that allow you to try out some functionality

## Using as a Module

### Install

```
npm install @tru_id/dev-server
# or
yarn add @tru_id/dev-server
```

### Include and Use

```js
const truDevServer = require('@tru_id/dev-server')
truDevServer.serve(config)
```

## Configuration

```js
{
    // Number. The port for the server to listen on. Defaults to 8080
    port: PORT,

    // Boolean. Whether debug output will be passed to the `log` function. Defaults to `true`
    DEBUG: DEBUG,

    // String. The base tru.ID URL. Defaults to 'https://eu.api.tru.id'
    apiBaseUrl: API_BASE_URL,

    // Optional. Set if the server should be password protected. Uses [express-password-protect](https://github.com/jdmann/express-password-protect)
    basicAuth: {
        username: USERNAME,
        password: PASSWORD
    },

    // Object. The tru.ID project configuration to use.
    project: {
        // String. The `client_id` of the project. Defaults to loading from a local `tru.json`.
        client_id: CLIENT_ID,

        // String. The `client_secret` of the project. Defaults to loading from a local `tru.json`.
        client_secret: CLIENT_SECRET
    },
    // Object. Configuration for [ngrok.com](https://ngrok.com/)
    ngrok: {
        // Boolean. Whether ngrok should be run to expose the running server to the public Internet. Defaults to false.
        enabled: NGROK_ENABLED,

        // String. A subdomain to use with ngrok. No default. Note: unless you have a premium membership you cannot get a defined subdomain.
        subdomain: NGROK_SUBDOMAIN,

        // String. Your ngrok auth token found in the [ngrok dashboard](https://dashboard.ngrok.com/get-started/setup).
        authtoken: NGROK_AUTHTOKEN,

        // String. Choice of location where the ngrok client will connect to host its tunnels.
        region: NGROK_REGION
    },
    // Function. A function called with debug information when `DEBUG` is set to `true`. See below for default.
    log: (...args) => {
        if(DEBUG) {
            console.debug(...args)
        }
    }
}
```

## Releasing

### CHANGELOG

Ensure the `CHANGELOG.md` is updated and update the package version:

```
yarn run changelog
```

Finesse the contents of `CHANGELOG.md` and commit with a message:

```
chore(release): v{version}
```

### Tag

Tag the version that is being released with the version of the package and, optionally, the tag to be used in NPM:

```
git tag v{version}@{tag}
```

Push the update to the remote.

```
git push origin v{version}@{tag}
```

### Publish to NPM

To release a canary version run:

```
yarn run publish:canary
```

To release a latest version:

```
yarn run publish:latest
```

## License

[MIT](LICENSE)
