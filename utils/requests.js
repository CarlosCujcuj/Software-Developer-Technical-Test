'use strict'
const statusHandler = require('./statusHandler')

const request = async (url) => {
  try {
    const response = await fetch(`${url}`)
    statusHandler(response)
    const responseJson = await response.json()
    return responseJson
  } catch (err) {
    throw err
  }
}

const requestServiceById = async (baseURL, id) => {
  try {
    const url = `${baseURL}/${id}`
    const response = await request(url)
    return response
  } catch (err) {
    throw err
  }
}

module.exports = {
  request,
  requestServiceById
}