'use strict'
const createError = require('http-errors')
const express = require('express')
const app = express()
const photos = require('./routes/photos')

app.use(express.json())

app.use('/externalapi/photos', photos)

app.use((req, res, next) => {
  next(createError(404))
})

app.use((err, req, res, next) => {
  res.status(err?.status || 500)
  res.send({
    type: 'error',
    message: err?.message,
    status: err?.status || 500,
    stack: err?.stack
  })
})

module.exports = app
