'use strict'
const { Router } = require('express')
const createError = require('http-errors')

const dataEnrichment = require('../utils/dataEnrichment')
const intersectData = require('../utils/intersectData')
const pagination  = require('../utils/pagination')
const {
  getUniqueValues,
  filterItemsContainingValue,
  filterItemsWithEqualValue
} = require('../utils/filters')
const {
  request,
  requestServiceById
} = require('../utils/requests')
const {
  PHOTOS_SERVICE_URL,
  ALBUMS_SERVICE_URL,
  USERS_SERVICE_URL,
  ALBUM_ID_KEY,
  USER_ID_KEY,
  ID_KEY,
  TITLE_KEY,
  EMAIL_KEY,
  ALBUM_USER_EMAIL_FILTER,
  ALBUM_TITLE_FILTER,
  TITLE_FILTER,
  OFFSET_FILTER,
  LIMIT_FILTER
} = require('../constants')

const router = Router()
// const signal = AbortSignal.timeout(1250)

const filterOptions = [ALBUM_USER_EMAIL_FILTER, ALBUM_TITLE_FILTER, TITLE_FILTER]

const filterQueryParam = (req, res, next) => {
  const filterOption = filterOptions.find(filter => req.query.hasOwnProperty(filter)) // undefined
  // add if to return bad request based on undefined query-param
  if (!filterOption){
    next(createError(400, 'Invalid Filter Option'))
    return
  }
  next()
}

router.get('/', filterQueryParam, async(req, res, next) => {
  let dataEnriched
  const filters = req.query

  const hasAlbumUserEmailFilter = filters.hasOwnProperty(ALBUM_USER_EMAIL_FILTER)
  const hasAlbumTitleFilter = filters.hasOwnProperty(ALBUM_TITLE_FILTER)
  const hasTitleFilter = filters.hasOwnProperty(TITLE_FILTER)

  let usersResponse
  let albumsResponse
  let photosResponse

  let usersFiltered
  let albumsFiltered
  let photosFiltered


  try {
    // ======= REQUEST & FILTERING =======

    // The request to /photos is always made no matter wich filter you use, 
    photosResponse = await request(PHOTOS_SERVICE_URL)

    if (hasTitleFilter) {
      photosFiltered = filterItemsContainingValue(photosResponse, TITLE_KEY, filters[TITLE_FILTER])
    }
    
    if (hasAlbumUserEmailFilter) {
      // The request to /users is always made
      usersResponse = await request(USERS_SERVICE_URL)
      usersFiltered = filterItemsWithEqualValue(usersResponse, EMAIL_KEY, filters[ALBUM_USER_EMAIL_FILTER])
    }

    if (hasAlbumTitleFilter) {
      // The request to /albums is always made
      albumsResponse = await request(ALBUMS_SERVICE_URL)
      albumsFiltered = filterItemsContainingValue(albumsResponse, TITLE_KEY, filters[ALBUM_TITLE_FILTER])
    }


    // ======= LOGIC FOR FILTER'S COMBINATIONS =======

    if (hasAlbumUserEmailFilter && hasAlbumTitleFilter && hasTitleFilter) {
      const { photosIntersect, albumsIntersect, usersIntersect } = intersectData(photosFiltered, albumsFiltered, usersFiltered)

      dataEnriched = dataEnrichment(photosIntersect, albumsIntersect, usersIntersect)
    }

    else if (hasAlbumTitleFilter && hasTitleFilter) {
      const { photosIntersect, albumsIntersect } = intersectData(photosFiltered, albumsFiltered, undefined)

      const usersId = await getUniqueValues(albumsIntersect, USER_ID_KEY)
      usersResponse = await Promise.all(
        usersId.map(id => requestServiceById(USERS_SERVICE_URL, id))
      )

      dataEnriched = dataEnrichment(photosIntersect, albumsIntersect, usersResponse)
    }


    else if (hasAlbumUserEmailFilter && hasAlbumTitleFilter) {
      const { photosIntersect, albumsIntersect, usersIntersect } = intersectData(photosResponse, albumsFiltered, usersFiltered)

      dataEnriched = dataEnrichment(photosIntersect, albumsIntersect, usersIntersect)
    }


    else if (hasAlbumUserEmailFilter && hasTitleFilter) {
      albumsResponse = await request(ALBUMS_SERVICE_URL)
      const { photosIntersect, albumsIntersect, usersIntersect } = intersectData(photosFiltered, albumsResponse, usersFiltered)

      dataEnriched = dataEnrichment(photosIntersect, albumsIntersect, usersIntersect)
    }


    // ===== SINGLE FILTERS =====
    else if (hasTitleFilter) {
      const albumsId = await getUniqueValues(photosFiltered, ALBUM_ID_KEY)
      albumsResponse = await Promise.all(
        albumsId.map(id => requestServiceById(ALBUMS_SERVICE_URL, id))
      )

      const usersId = await getUniqueValues(albumsResponse, USER_ID_KEY)
      usersResponse = await Promise.all(
        usersId.map(id => requestServiceById(USERS_SERVICE_URL, id))
      )

      dataEnriched = await dataEnrichment(photosFiltered, albumsResponse, usersResponse)
    }

    else if (hasAlbumTitleFilter) {
      const albumsId = await getUniqueValues(albumsFiltered, ID_KEY)
      
      const usersId = await getUniqueValues(albumsFiltered, USER_ID_KEY)
      const usersResponse = await Promise.all(
        usersId.map(id => requestServiceById(USERS_SERVICE_URL, id))
      )

      photosFiltered = photosResponse.filter(photo => albumsId.includes(photo.albumId))

      dataEnriched = dataEnrichment(photosFiltered, albumsFiltered, usersResponse)
    }


    else if (hasAlbumUserEmailFilter) {
      const usersId = await getUniqueValues(usersFiltered, ID_KEY)

      const albumsResponse = await request(ALBUMS_SERVICE_URL)
      albumsFiltered = albumsResponse.filter(album => usersId.includes(album.userId))
      const albumsId = await getUniqueValues(albumsFiltered, ID_KEY)

      photosFiltered = photosResponse.filter(photo => albumsId.includes(photo.albumId))

      dataEnriched = dataEnrichment(photosFiltered, albumsFiltered, usersFiltered)
    }

    const finalData = pagination(dataEnriched, filters[OFFSET_FILTER], filters[LIMIT_FILTER])

    res.status(200).send(finalData)
    return
  } catch (err) {
    next(err)
    return
  }

})

router.get('/:id', async(req, res, next) => {
  const id = req.params.id

  try{
    const photosResponse = await requestServiceById(PHOTOS_SERVICE_URL, id)
    const albumsResponse = await requestServiceById(ALBUMS_SERVICE_URL, photosResponse.albumId)
    const usersResponse = await requestServiceById(USERS_SERVICE_URL, albumsResponse.userId)
    
    const dataEnriched = await dataEnrichment([photosResponse], [albumsResponse], [usersResponse])
    res.status(200).send(dataEnriched)
    return
  } catch (err) {
    next(err)
    return
  }
})

module.exports = router