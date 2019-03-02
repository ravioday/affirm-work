const fs = require('fs')
const csv = require('csv-parser')

const allFacilities  = require('./facility')

// CSV parsing Boiler plates
const covenantsFacilitiesPromise = () => {
  return new Promise((resolve, reject) => {
    const allCovenants = []

    fs.createReadStream('./data/large/covenants.csv')
      .pipe(csv())
      .on('data', (rule) => {
        allCovenants.push(rule)
      } )
      .on('end', () => {
        resolve(allCovenants)
      })
  })
}

class Covenant {
   static async covenantFacilityJoin({loan_amount, loan_interest_rate, default_likelihood, state}) {

    let allCovenants = await covenantsFacilitiesPromise()
    const matchingFacilities = allCovenants.filter((cov) => {
      const facility = allFacilities[cov.facility_id]

      const facility_interest_rate = facility.interest_rate
      // Below is bad js object manipulation while enumerating,
      // but the idea is to make facility interest rate and yield for loan available in the response
      cov.facility_interest_rate = parseFloat(facility_interest_rate)
      cov.expected_yield = (1 - default_likelihood) * loan_interest_rate * loan_amount - default_likelihood * loan_amount - facility_interest_rate * loan_amount

      // Ideally one would want to index max_default_likelihood and the clause below will be the where clause
      const isLegal = cov.max_default_likelihood >= default_likelihood && cov.banned_state != state
      const facilityCanAccommodate = facility.amount - loan_amount >= 0

      const ok = isLegal && facilityCanAccommodate

      return ok
    })

    return matchingFacilities
  }
}

module.exports = Covenant
