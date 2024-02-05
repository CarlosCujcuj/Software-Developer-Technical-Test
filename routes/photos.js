'use strict'
const { Router } = require('express')
const createError = require('http-errors')
const {
  PHOTOS_SERVICE_URL,
  ALBUMS_SERVICE_URL,
  USERS_SERVICE_URL,
  ALBUM_ID_KEY,
  USER_ID_KEY,
  ID_KEY
} = require('../constants')
const statusHandler = require('../statusHandler')
const dataEnrichment = require('../utils/dataEnrichment')

const router = Router()
// const signal = AbortSignal.timeout(1250)

const filterOptions = ['title', 'album.title', 'album.user.email']

const filterQueryParam = (req, res, next) => {
  const filterOption = filterOptions.find(filter => req.query.hasOwnProperty(filter)) // undefined
  // add if to return bad request based on undefined query-param
  if (!filterOption){
    next(createError(400, 'Invalid Filter Option'))
    return
  }

  req.filterOption = filterOption
  next()
}

const request = async (url) => {
  try {
    // console.log('==url: ', url)
    const response = await fetch(`${url}`)
    statusHandler(response)
    const responseJson = await response.json()
    /* if (url.includes('albums')) {
      console.log('===response: ', responseJson)
    } */
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

const getUniqueValues = async (array, value) => {
  const uniqueValues = new Set(array.map(item => item[value]))
  return Array.from(uniqueValues)
}

const filterItemsByString = (array, key, filterStr) => {
  return array.filter(item => item[key].toLowerCase().includes(filterStr.toLowerCase()));
}


router.get('/', filterQueryParam, async(req, res, next) => {
  const filterOption = req.filterOption
  const filterStr = req.query[filterOption]

  if (filterOption === filterOptions[0]) {
    try {
      const photoResponse = await request(PHOTOS_SERVICE_URL)
      const photos = photoResponse.filter(item => item.title.toLowerCase().includes(filterStr.toLowerCase()))


      const albumsId = await getUniqueValues(photos, ALBUM_ID_KEY)
      const albumsResponse = await Promise.all(
        albumsId.map(id => requestServiceById(ALBUMS_SERVICE_URL, id))
      )


      const usersId = await getUniqueValues(albumsResponse, USER_ID_KEY)
      const usersResponse = await Promise.all(
        usersId.map(id => requestServiceById(USERS_SERVICE_URL, id))
      )

      const dataEnriched = await dataEnrichment(photos, albumsResponse, usersResponse)
      res.status(200).send(dataEnriched)
      return 
    } catch (err) {
      next(err)
      return
    }
    
  } else if (filterOption === filterOptions[1]) {
    try {
      const albumsResponse = await request(ALBUMS_SERVICE_URL)
      const albums = albumsResponse.filter(item => item.title.toLowerCase().includes(filterStr.toLowerCase()))
      const albumsId = await getUniqueValues(albums, ID_KEY)

      const usersId = await getUniqueValues(albums, USER_ID_KEY)
      const usersResponse = await Promise.all(
        usersId.map(id => requestServiceById(USERS_SERVICE_URL, id))
      )

      const photoResponse = await request(PHOTOS_SERVICE_URL)
      const photos = photoResponse.filter(photo => albumsId.includes(photo.albumId))

      const dataEnriched = dataEnrichment(photos, albums, usersResponse)
    
      res.status(200).send(dataEnriched)
      return
    } catch (err) {
      next(err)
      return
    }
  } else if (filterOption === filterOptions[2]) {
    try {
      const usersResponse = await request(USERS_SERVICE_URL)
      const users = usersResponse.filter(item => item.email === filterStr)
      const usersId = await getUniqueValues(users, ID_KEY)

      const albumsResponse = await request(ALBUMS_SERVICE_URL)
      const albums = albumsResponse.filter(album => usersId.includes(album.userId))
      const albumsId = await getUniqueValues(albums, ID_KEY)

      const photoResponse = await request(PHOTOS_SERVICE_URL)
      const photos = photoResponse.filter(photo => albumsId.includes(photo.albumId))

      const dataEnriched = dataEnrichment(photos, albums, usersResponse)
    
      res.status(200).send(dataEnriched)

      return
    } catch (err) {
      next(err)
      return
    }
  }

})

router.get('/:id', async(req, res, next) => {
  const id = req.params.id

  const photosReq = await fetch(`${PHOTOS_SERVICE_URL}/${id}`)
  statusHandler(photosReq, next)
  const photosReqJson = await photosReq.json()


  const albumsReq = await fetch(`${ALBUMS_SERVICE_URL}/${photosReqJson.albumId}`)
  statusHandler(albumsReq, next)
  const albumsReqJson = await albumsReq.json()


  const usersReq = await fetch(`${USERS_SERVICE_URL}/${albumsReqJson.userId}`)
  statusHandler(usersReq, next)
  const usersReqJson = await usersReq.json()

  // remove unnecessary ids in a different way
  const userRes = {
    user: {
      ...usersReqJson
    }
  }

  delete albumsReqJson.userId
  const albumRes = {
    album: {
      ...albumsReqJson,
      ...userRes
    }
  }

  delete photosReqJson.albumId
  const photosRes = {
    ...photosReqJson,
    ...albumRes
  }

  res.status(200).send(photosRes)
})

module.exports = router