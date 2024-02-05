const getItemById = (array, id) => {
  return array.find(item => item.id === id)
}

const photoEnrinchment = (photos, albums) => {
  return photos.map((photo) => {
    const newPhoto = {
      ...photo,
      album: getItemById(albums, photo.albumId)
    }
    delete newPhoto.albumId
    return newPhoto
  })
}

const albumsEnrichment = (albums, users) => {
  return albums.map((album) => {
    const newAlbum = {
      ...album,
      user: getItemById(users, album.userId)
    }

    delete newAlbum.userId
    return newAlbum
  })
}

const dataEnrichment = (photos, albums, users) => {
  const albumsEnriched = albumsEnrichment(albums, users)
  const photosEnriched = photoEnrinchment(photos, albumsEnriched)
  return photosEnriched
}

module.exports = dataEnrichment