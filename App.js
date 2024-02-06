'use strict'
const createError = require('http-errors')
const express = require('express')
const app = express()
const photos = require('./routes/photos')

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*')
  res.header("Access-Control-Allow-Credentials", true)
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json')
  next()
})

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
