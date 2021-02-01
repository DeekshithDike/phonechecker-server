const axios = require('axios')
const qs = require('querystring')

const config = require('./config')

/**
 * Creates a PhoneCheck for the given `phoneNumber`.
 * 
 * @param {String} phoneNumber - The phone number to create a Phone Check for.
 */
async function createPhoneCheck(phoneNumber) {
    log('createPhoneCheck')

    const url = `${config.apiBaseUrl}/phone_check/v0.1/checks`
    const params = {
        phone_number: phoneNumber,
    }

    const auth = (await getAccessToken()).access_token
    const requestHeaders = {
        Authorization: `Bearer ${auth}`,
        'Content-Type': 'application/json'
    }

    log('url', url)
    log('params', params)
    log('requestHeaders', requestHeaders)

    const phoneCheckCreationResult = await axios.post(url, params, {
        headers: requestHeaders
    })

    log('phoneCheckCreationResult.data', phoneCheckCreationResult.data)

    return phoneCheckCreationResult.data
}

/**
 * Retrieves a PhoneCheck with the given `check_id`
 * 
 * @param {String} checkId The ID of the PhoneCheck to retrieve.
 */
async function getPhoneCheck(checkId) {
    log('getPhoneCheck')

    const url = `${config.apiBaseUrl}/phone_check/v0.1/checks/${checkId}`
    const params = {}

    const auth = (await getAccessToken()).access_token
    const requestHeaders = {
        Authorization: `Bearer ${auth}`,
        'Content-Type': 'application/json'
    }

    log('url', url)
    log('params', params)
    log('requestHeaders', requestHeaders)

    const getPhoneCheckResult = await axios.get(url, {
        params: params,
        headers: requestHeaders
    })

    log('getPhoneCheckResult.data', getPhoneCheckResult.data)

    return getPhoneCheckResult.data
}

// SIMCheck

async function createSimCheck(phoneNumber) {
    log('createSimCheck')

    const url = `${config.apiBaseUrl}/sim_check/v0.1/checks`
    const params = {
        phone_number: phoneNumber,
    }

    const auth = (await getAccessToken()).access_token
    const requestHeaders = {
        Authorization: `Bearer ${auth}`,
        'Content-Type': 'application/json'
    }

    log('url', url)
    log('params', params)
    log('requestHeaders', requestHeaders)

    const simCheckCreationResult = await axios.post(url, params, {
        headers: requestHeaders
    })

    log('simCheckCreationResult.data', simCheckCreationResult.data)

    return simCheckCreationResult.data
}

// Coverage / Countries

/**
 * Get product and network coverage by country code (e.g. GB) or phone number country prefix (e.g. 44).
 * 
 * @param {string} countryCode 
 */
async function getCountryCoverage(countryCode) {
    log('getCountryCoverage')

    const url = `${config.apiBaseUrl}/coverage/v0.1/countries/${countryCode}`
    const auth = (await getAccessToken(['coverage'])).access_token
    const requestHeaders = {
        Authorization: `Bearer ${auth}`
    }

    log('url', url)
    log('requestHeaders', requestHeaders)

    const countryCoverageResult = await axios.get(url, {
        headers: requestHeaders
    })

    log('countryCoverageResult.data', countryCoverageResult.data)

    return countryCoverageResult.data
}

// Coverage / Device

/**
 * Get product and network coverage by IP address.
 * 
 * @param {string} ipAddress the IP address of the device for which coverage is being queried
 */
async function getDeviceCoverage(ipAddress) {
    log('getIPCoverage')

    const url = `${config.apiBaseUrl}/coverage/v0.1/device_ips/${ipAddress}`
    const auth = (await getAccessToken(['coverage'])).access_token
    const requestHeaders = {
        Authorization: `Bearer ${auth}`
    }

    log('url', url)
    log('requestHeaders', requestHeaders)

    const deviceCoverageResult = await axios.get(url, {
        headers: requestHeaders,
        validateStatus: function (status) {
            return status >= 200 && status <= 404;
        },
    })

    log('deviceCoverageResult.data', deviceCoverageResult.data)

    return deviceCoverageResult.data
}

// Tokens

/**
 * Creates an Access Token withon `phone_check` scope.
 * 
 * @param scopes {Object} Optional. Array of scopes for the created access token. Defaults to `['phone_check sim_check coverage']`.
 */
async function getAccessToken(scopes = ['phone_check sim_check coverage']) {
    log('getAccessToken')

    const url = `${config.apiBaseUrl}/oauth2/v1/token`
    const params = qs.stringify({
        grant_type: 'client_credentials',

        // scope to use depends on product
        scope: scopes
    })

    const toEncode = `${config.project.client_id}:${config.project.client_secret}`
    const auth = Buffer.from(toEncode).toString('base64')
    const requestHeaders = {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    log('url', url)
    log('params', params)
    log('requestHeaders', requestHeaders)

    const accessTokenResult = await axios.post(url, params, {
        headers: requestHeaders
    })

    log('accessTokenResult.data', accessTokenResult.data)

    return accessTokenResult.data
}

function log() {
    if(config.DEBUG) {
        console.debug.apply(null, arguments)
    }
}

module.exports = {
    createPhoneCheck: createPhoneCheck,
    getPhoneCheck: getPhoneCheck,
    createSimCheck: createSimCheck,
    getCountryCoverage: getCountryCoverage,
    getAccessToken: getAccessToken,
    getDeviceCoverage: getDeviceCoverage
}