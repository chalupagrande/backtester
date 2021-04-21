const Study = require('./Study')
const { uuid } = require('@backtester/tools/utils')

class Backtester {
  constructor() {
    this.studies = {}
  }

  /**
   *
   * @param {datetime} start - iso formatted date of the start of the data to test
   * @param {datetime} end - iso formatted date of teh end of the data to test
   * @param {int} cash - the amount of money to start the portfolio with.
   */
  prepare({ cash, service, portfolio }) {
    const id = uuid()
    this.studies[id] = new Study({ id, cash, service, portfolio })
    return id
  }

  getStudy(id) {
    return this.studies[id]
  }
}

module.exports = Backtester
