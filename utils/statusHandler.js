'use strict'
const createError = require('http-errors')

const statusHandler = (response) => {
  if (response.status === 404 || response.status === 400) {
    throw createError(response.status)
  } else if (response.status !== 200) {
    throw createError(500)
  }
}

module.exports = statusHandler