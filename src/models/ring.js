const Ring = function (name, order) {
  const self = { totalRu: {} }

  self.name = function () {
    return name
  }

  self.order = function () {
    return order
  }

  self.addRu = function (quadrant) {
    if (!self.totalRu[quadrant]) {
      self.totalRu[quadrant] = 0
    }

    self.totalRu[quadrant] += 1
  }

  return self
}

module.exports = Ring
