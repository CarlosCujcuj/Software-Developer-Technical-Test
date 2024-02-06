'use strict'

const getUniqueValues = async (array, value) => {
  const uniqueValues = new Set(array.map(item => item[value]))
  return Array.from(uniqueValues)
}

const filterItemsContainingValue = (array, key, filterStr) => {
  return array.filter(item => item[key].toLowerCase().includes(filterStr.toLowerCase()));
}

const filterItemsWithEqualValue = (array, key, filterStr) => {
  return array.filter(item => item[key] === filterStr)
}

module.exports = {
  getUniqueValues,
  filterItemsContainingValue,
  filterItemsWithEqualValue
}