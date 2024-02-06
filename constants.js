'use strict'
const jsonPlaceholderUrl = 'https://jsonplaceholder.typicode.com'
const PHOTOS_SERVICE_URL = `${jsonPlaceholderUrl}/photos`
const ALBUMS_SERVICE_URL = `${jsonPlaceholderUrl}/albums`
const USERS_SERVICE_URL = `${jsonPlaceholderUrl}/users`

module.exports = {
  PHOTOS_SERVICE_URL,
  ALBUMS_SERVICE_URL,
  USERS_SERVICE_URL,
  ID_KEY: 'id',
  ALBUM_ID_KEY: 'albumId',
  USER_ID_KEY: 'userId',
  TITLE_KEY: 'title',
  EMAIL_KEY: 'email',
  ALBUM_USER_EMAIL_FILTER: 'album.user.email',
  ALBUM_TITLE_FILTER: 'album.title',
  TITLE_FILTER: 'title'
}