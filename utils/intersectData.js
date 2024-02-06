'use strict'
const {
  ALBUM_ID_KEY,
  USER_ID_KEY,
  ID_KEY,
} = require('../constants')

const intersectArray = (arr1, key1, arr2, key2) => {
  const result = arr1.filter(arr1Item => {
    return arr2.some(arr2Item => arr2Item[key2] === arr1Item[key1])
  })
  return result
}

const intersectData = (photos, albums, users) => {
  let albumsIntersect
  let usersIntersect
  let photosIntersect
  
  if (photos && albums && users) {
    usersIntersect = intersectArray(users, ID_KEY, albums, USER_ID_KEY)
    albumsIntersect = intersectArray(albums, USER_ID_KEY, users, ID_KEY)
    photosIntersect = intersectArray(photos, ALBUM_ID_KEY, albums, ID_KEY)
  }

  if (photos && albums) {
    albumsIntersect = intersectArray(albums, ID_KEY, photos, ALBUM_ID_KEY)
    photosIntersect = intersectArray(photos, ALBUM_ID_KEY, albums, ID_KEY)
    
  }

  if (albums && users) {
    usersIntersect = intersectArray(users, ID_KEY, albums, USER_ID_KEY)
    albumsIntersect = intersectArray(albums, USER_ID_KEY, users, ID_KEY)
  }
  
  return {
    photosIntersect,
    albumsIntersect,
    usersIntersect
  }
}

module.exports = intersectData