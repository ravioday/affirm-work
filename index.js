const csv = require('csv-parser')
const fs = require('fs')
const getMatchingFacility = require('./services/matcher')
const loanFacilityTable = {}
const json2csv = require('json2csv').parse;

const loans = []

// Process one loan at a time by reading line by line from loans csv

const facilitiesYield = {}

fs.createReadStream('./data/large/loans.csv')
  .pipe(csv())
  .on('data', async (loan) => {
    const facility= await getMatchingFacility(loan)

    // Generate the solutions file

    // 1. The assignments or the matches files

    const loanfields = ['loan_id', 'facility_id']

    loans.push({'loan_id': loan.id, 'facility_id': facility.facility_id})
    const csv = json2csv(loans, { loanfields });
    fs.writeFileSync('./data/large/solutions/assignments.csv', csv)


    // The expected yeilds from each facility
    if(facility.facility_id in facilitiesYield) {
      facilitiesYield[facility.facility_id] += Math.round(facility.expected_yield)
    } else {
      facilitiesYield[facility.facility_id] = Math.round(facility.expected_yield)
    }

    const yields = []
    let yieldsCSV
    Object.entries(facilitiesYield).forEach(([key, value]) => {
      const yieldFields = ['facility_id', 'expected_yield']
      yields.push({'facility_id': key, 'expected_yield': value})
      yieldsCSV = json2csv(yields, { yieldFields });
    })

    fs.writeFileSync('./data/large/solutions/yields.csv', yieldsCSV)
  })
