function uuid() {
  return '_' + Math.random().toString(36).substr(2, 9)
}

module.exports = { uuid }
