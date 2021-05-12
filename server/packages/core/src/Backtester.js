const Study = require('./Study')
const { uuid } = require('@backtester/tools/utils')

class Backtester {
  constructor() {
    this.studies = {}
  }

  /**
   * @param {string} - description - study description
   * @param {datetime} start - iso formatted date of the start of the data to test
   * @param {datetime} end - iso formatted date of teh end of the data to test
   * @param {int} cash - the amount of money to start the portfolio with.
   */
  prepare({ cash, service, portfolio, description }) {
    const id = uuid()
    this.studies[id] = new Study({ id, cash, service, portfolio, description })
    return id
  }

  getStudy(id) {
    return this.studies[id]
  }

  all() {
    return Object.entries(this.studies).reduce((a, [key, val]) => {
      let study = { ...val }
      delete study.service
      a[key] = study
      return a
    }, {})
  }

  clear(id) {
    let study = this.studies[id]
    if (study) delete this.studies[id]
    return true
  }
}

module.exports = Backtester
