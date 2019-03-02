var loader = require('csv-load-sync');
let facilities = loader('./data/large/facilities.csv');

const allFacilities = {}

facilities.forEach((facility) => {
  allFacilities[facility.id] = facility
})

module.exports = allFacilities
