const Ring = function (name, order) {
  var self = { totalRu: 0 }

  self.name = function () {
    return name
  }

  self.order = function () {
    return order
  }

  self.addRu = function () {
    self.totalRu++
  }

  return self
}

module.exports = Ring
