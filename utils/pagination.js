const pagination = (items, offset = 0, limit = 25) => {
  // offset -> index to start in array
  // end -> offset + limit
  const end = Number(offset) + Number(limit)

  return items.slice(offset, end)
}

module.exports = pagination