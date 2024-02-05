'use strict'
const jsonPlaceholderUrl = 'https://jsonplaceholder.typicode.com'
const PHOTOS_SERVICE_URL = `${jsonPlaceholderUrl}/photos`
const ALBUMS_SERVICE_URL = `${jsonPlaceholderUrl}/albums`
const USERS_SERVICE_URL = `${jsonPlaceholderUrl}/users`

module.exports = {
  PHOTOS_SERVICE_URL,
  ALBUMS_SERVICE_URL,
  USERS_SERVICE_URL,
  ALBUM_ID_KEY: 'albumId',
  USER_ID_KEY: 'userId'
}