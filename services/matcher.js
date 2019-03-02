const Covenant = require('../models/covenant')
const allFacilities  = require('../models/facility')

const findTheBestMatch = (covenants) => {
  covenants.sort((cov1, cov2) => {
    return cov1.facility_interest_rate - cov2.facility_interest_rate
  })

  // just pick the first one from this array, assuming its the best local choice.
  return covenants[0]
}

const getMatchingFacility = async (loan) => {
  // This join aims at mimicking the db join between facility and covenant

  // Select all the covenants and facilities that matches, facilities covenants and loans params
  // O(n) times
  let covenants = await Covenant.covenantFacilityJoin({
    loan_amount: loan.amount,
    loan_interest_rate: loan.interest_rate,
    default_likelihood: loan.default_likelihood,
    state: loan.state,
  })

  // Order by lowest interest rate to find the cheapest
  // Sort:  O(n * log(n))
  matchedFacility = findTheBestMatch(covenants)

  //update the facility matched for the loan to accurately reflect true capacity for subsequent loan requests
  const facility =  allFacilities[matchedFacility.facility_id]
  facility.amount = facility.amount - loan.amount

  return matchedFacility
}

module.exports = getMatchingFacility
