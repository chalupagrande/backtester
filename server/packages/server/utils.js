class Response {
  /**
   *
   * @param {bool} success
   * @param {*} data
   * @param {string} msg
   * @param {*} errors
   */
  constructor(success, data, msg, errors) {
    this.success = success
    this.message = msg
    this.data = data
    this.errors = errors
  }
}

module.exports = { Response }
