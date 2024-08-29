const { objectToQueryString } = require('../util/urlUtils')
const { generateErrorResponse } = require('../util/apiUtils')

const config = require('../config')
const apiBaseUrl = config().api.baseUrl
const token = config().api.token

async function request(url, params, method = 'GET') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  if (params) {
    if (method === 'GET') {
      url += '?' + objectToQueryString(params)
    } else {
      options.body = JSON.stringify(params)
    }
  }

  const response = await fetch(apiBaseUrl + url, options)
  const { status, statusText } = response

  if (response.status !== 200) {
    return generateErrorResponse({ status, statusText })
  }

  return await response.json()
}

const get = (url, params) => request(url, params)

const create = (url, params) => request(url, params, 'POST')

const update = (url, params) => request(url, params, 'PUT')

const remove = (url, params) => request(url, params, 'DELETE')

module.exports = {
  get,
  create,
  update,
  delete: remove
}
