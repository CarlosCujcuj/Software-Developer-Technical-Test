'use strict'
const createError = require('http-errors')

const statusHandler = (response) => {
  console.log('====status Handler====')
  if (response.status === 404 || response.status === 400) {
    throw createError(response.status)
    //next(createError(response.status))
    // return 
  } else if (response.status !== 200) {
    throw createError(500)
    // next(createError(500))
    // return
  }
}

module.exports = statusHandler