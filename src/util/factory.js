/* eslint no-constant-condition: "off" */
const api = require('../services/api');
const d3 = require('d3')
const _ = {
  map: require('lodash/map'),
  uniqBy: require('lodash/uniqBy'),
  each: require('lodash/each'),
}

const InputSanitizer = require('./inputSanitizer')
const Radar = require('../models/radar')
const Quadrant = require('../models/quadrant')
const Ring = require('../models/ring')
const Blip = require('../models/blip')
const GraphingRadar = require('../graphing/radar')
const MalformedDataError = require('../exceptions/malformedDataError')
const SheetNotFoundError = require('../exceptions/sheetNotFoundError')
const ContentValidator = require('./contentValidator')
const Sheet = require('./sheet')
const ExceptionMessages = require('./exceptionMessages')
const GoogleAuth = require('./googleAuth')
const { getDocumentOrSheetId, getRadarId, getSheetName } = require('./urlUtils')
const { getGraphSize, isValidConfig } = require('../graphing/config')
const InvalidConfigError = require('../exceptions/invalidConfigError')
const InvalidContentError = require('../exceptions/invalidContentError')
const FileNotFoundError = require('../exceptions/fileNotFoundError')
const { renderRadars } = require('../graphing/components/radarsList')

function validateInputQuadrantOrRingName(allQuadrantsOrRings, quadrantOrRing) {
  const quadrantOrRingNames = Object.keys(allQuadrantsOrRings)
  const regexToFixLanguagesAndFrameworks = /(-|\s+)(and)(-|\s+)|\s*(&)\s*/g
  const formattedInputQuadrant = quadrantOrRing.toLowerCase().replace(regexToFixLanguagesAndFrameworks, ' & ')
  return quadrantOrRingNames.find((quadrantOrRing) => quadrantOrRing.toLowerCase() === formattedInputQuadrant)
}

const plotRadarGraph = function (title, blips, currentRadarName, alternativeRadars) {
  document.title = title.replace(/.(csv|json)$/, '')

  d3.selectAll('.loading').remove()

  const ringMap = blips.reduce((allBlips, { quadrant, ring, ru }, index) => {
    if (!allBlips[ring]) {
      allBlips[ring] = new Ring(ring, index);
    }

    if (ru) {
      allBlips[ring].addRu(quadrant);
    }

    return allBlips;
  }, {});

  const quadrantsMap = blips.reduce((allQuadrants, { quadrant }) => {
    allQuadrants[quadrant] = new Quadrant(quadrant)
    return allQuadrants
  }, {})

  blips.forEach((blip) => {
    const currentQuadrant = validateInputQuadrantOrRingName(quadrantsMap, blip.quadrant)
    const ring = validateInputQuadrantOrRingName(ringMap, blip.ring)

    if (currentQuadrant && ring) {
      const blipObj = new Blip({
        name: blip.name,
        ring: ringMap[ring],
        isNew: blip.isNew.toLowerCase() === 'true',
        status: blip.status,
        topic: blip.topic,
        description: blip.description,
        isRu: blip.ru,
        probationResult: blip.probation_result,
      })
      quadrantsMap[currentQuadrant].add(blipObj)
    }
  })

  const radar = new Radar()
  radar.addRings(Object.values(ringMap))

  _.each(quadrantsMap, function (quadrant) {
    radar.addQuadrant(quadrant)
  })

  alternativeRadars.forEach(function (sheetName) {
    radar.addAlternative(sheetName)
  })

  radar.setCurrentSheet(currentRadarName)

  const size = getGraphSize()
  new GraphingRadar(size, radar).init().plot()
}

const GoogleSheet = function (sheetReference, sheetName) {
  var self = {}

  self.build = function () {
    var sheet = new Sheet(sheetReference)
    sheet.validate(function (error, apiKeyEnabled) {
      if (error instanceof SheetNotFoundError) {
        plotErrorMessage(error, 'sheet')
        return
      }

      self.authenticate(false, apiKeyEnabled)
    })
  }

  function createBlipsForProtectedSheet(documentTitle, values, sheetNames) {
    if (!sheetName) {
      sheetName = sheetNames[0]
    }
    values.forEach(function () {
      var contentValidator = new ContentValidator(values[0])
      contentValidator.verifyContent()
      contentValidator.verifyHeaders()
    })

    const all = values
    const header = all.shift()
    var blips = _.map(all, (blip) => new InputSanitizer().sanitizeForProtectedSheet(blip, header))
    plotRadarGraph(documentTitle, blips, sheetName, sheetNames)
  }

  self.authenticate = function (force = false, apiKeyEnabled, callback) {
    GoogleAuth.loadGoogle(force, async function () {
      self.error = false
      const sheet = new Sheet(sheetReference)
      await sheet.getSheet()
      if (sheet.sheetResponse.status === 403 && !GoogleAuth.gsiInitiated && !force) {
        // private sheet
        GoogleAuth.loadGSI()
      } else {
        await sheet.processSheetResponse(sheetName, createBlipsForProtectedSheet, (error) => {
          if (error.status === 403) {
            self.error = true
            plotUnauthorizedErrorMessage()
          } else if (error instanceof MalformedDataError) {
            plotErrorMessage(error, 'sheet')
          } else {
            plotErrorMessage(sheet.createSheetNotFoundError(), 'sheet')
          }
        })
        if (callback) {
          callback()
        }
      }
    })
  }

  self.init = function () {
    plotLoading()
    return self
  }

  return self
}

const CSVDocument = function (url) {
  var self = {}

  self.build = function () {
    d3.csv(url)
      .then(createBlips)
      .catch(() => {
        const fileNotFoundError = new FileNotFoundError(`Oops! We can't find the CSV file you've entered`)
        plotErrorMessage(fileNotFoundError, 'csv')
      })
  }

  var createBlips = function (data) {
    try {
      var columnNames = data.columns
      delete data.columns
      var contentValidator = new ContentValidator(columnNames)
      contentValidator.verifyContent()
      contentValidator.verifyHeaders()
      var blips = _.map(data, new InputSanitizer().sanitize)
      plotRadarGraph(FileName(url), blips, 'CSV File', [])
    } catch (exception) {
      const invalidContentError = new InvalidContentError(ExceptionMessages.INVALID_CSV_CONTENT)
      plotErrorMessage(invalidContentError, 'csv')
    }
  }

  self.init = function () {
    plotLoading()
    return self
  }

  return self
}

const JSONFile = function (url) {
  var self = {}

  self.build = function () {
    d3.json(url)
      .then(createBlips)
      .catch(() => {
        const fileNotFoundError = new FileNotFoundError(`Ошибка загрузки радара`)
        plotErrorMessage(fileNotFoundError, 'json')
      })
  }

  var createBlips = function (data) {
    try {
      var columnNames = Object.keys(data[0])
      var contentValidator = new ContentValidator(columnNames)
      contentValidator.verifyContent()
      contentValidator.verifyHeaders()
      var blips = _.map(data, new InputSanitizer().sanitize)

      plotRadarGraph(FileName(url), blips, 'JSON File', [])
    } catch (exception) {
      const invalidContentError = new InvalidContentError(ExceptionMessages.INVALID_JSON_CONTENT)
      plotErrorMessage(invalidContentError, 'json')
    }
  }

  self.init = function () {
    plotLoading()
    return self
  }

  return self
}

const ApiData = function (id) {
  const self = {}

  self.build = function () {
    api.get(`/radar/${id}`)
      .then(data => createBlips(data))
      .catch(() => {
        const fileNotFoundError = new FileNotFoundError(`Ошибка загрузки радара`)
        plotErrorMessage(fileNotFoundError, 'json')
      })
  }

  const createBlips = function (data) {
    try {
      const columnNames = Object.keys(data.items[0])
      const contentValidator = new ContentValidator(columnNames)
      contentValidator.verifyContent()
      contentValidator.verifyHeaders()
      var blips = _.map(data.items, new InputSanitizer().sanitize)

      plotRadarGraph(data.name, blips, 'JSON Data', [])
    } catch (exception) {
      const invalidContentError = new InvalidContentError(ExceptionMessages.INVALID_JSON_CONTENT)
      plotErrorMessage(invalidContentError, 'json')
    }
  }

  self.init = function () {
    plotLoading()
    return self
  }

  return self
}

const DomainName = function (url) {
  var search = /.+:\/\/([^\\/]+)/
  var match = search.exec(decodeURIComponent(url.replace(/\+/g, ' ')))
  return match == null ? null : match[1]
}

const FileName = function (url) {
  var search = /([^\\/]+)$/
  var match = search.exec(decodeURIComponent(url.replace(/\+/g, ' ')))
  if (match != null) {
    return match[1]
  }
  return url
}

const Factory = function () {
  var self = {}
  var sheet

  self.build = async function () {
    if (!isValidConfig()) {
      plotError(new InvalidConfigError(ExceptionMessages.INVALID_CONFIG))
      return
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === '/') {
        const inputElement =
          d3.select('input.search-container__input').node()

        if (document.activeElement !== inputElement) {
          e.preventDefault()
          inputElement.focus()
          inputElement.scrollIntoView({
            behavior: 'smooth',
          })
        }
      }
    })

    const domainName = DomainName(window.location.search.substring(1))

    const paramId = getDocumentOrSheetId()
    const radarId = getRadarId()
    const isRadarPage = paramId || radarId
    if (paramId && paramId.endsWith('.csv')) {
      sheet = CSVDocument(paramId)
      sheet.init().build()
    } else if (paramId && paramId.endsWith('.json')) {
      sheet = JSONFile(paramId)
      sheet.init().build()
    } else if (domainName && domainName.endsWith('google.com') && paramId) {
      const sheetName = getSheetName()
      sheet = GoogleSheet(paramId, sheetName)
      sheet.init().build()
    } else if (radarId) {
      sheet = ApiData(radarId)
      sheet.init().build()
    } else {
      if (!isRadarPage) {
        await renderRadars()
      }

      setDocumentTitle()
    }
  }

  return self
}

function setDocumentTitle() {
  document.title = 'Радар ИТ инфраструктуры'
}

function plotLoading() {
  document.querySelector('.helper-description .loader-text').style.display = 'block'
}

function plotErrorMessage(exception, fileType) {
  showErrorMessage(exception, fileType)
}

function plotError(exception) {
  let message = exception.message

  d3.selectAll('.error-container__message').remove()
  const container = d3.select('#error-container')

  container.classed('hidden', false)
  const errorContainer = container.append('div').attr('class', 'error-container__message')
  errorContainer.append('p').html(message)

  document.querySelector('.helper-description > p').style.display = 'block'
}

function showErrorMessage(exception, fileType) {
  document.querySelector('.helper-description .loader-text').style.display = 'none'
  plotError(exception, fileType)
}

function plotUnauthorizedErrorMessage() {
  let content = d3.select('main')
  const helperDescription = d3.select('.helper-description')
  helperDescription.style('display', 'none')
  d3.selectAll('.loader-text').remove()
  d3.selectAll('.error-container').remove()

  const currentUser = GoogleAuth.getEmail()
  let homePageURL = window.location.protocol + '//' + window.location.hostname
  homePageURL += window.location.port === '' ? '' : ':' + window.location.port
  const goBack = '<a href=' + homePageURL + '>GO BACK</a>'
  const message = `<strong>Oops!</strong> Looks like you are accessing this sheet using <b>${currentUser}</b>, which does not have permission.Try switching to another account.`

  const container = content.append('div').attr('class', 'error-container')

  const errorContainer = container.append('div').attr('class', 'error-container__message')

  errorContainer.append('div').append('p').attr('class', 'error-title').html(message)
  const newUi = 'switch-account-button-newui'
  const button = errorContainer.append('button').attr('class', `button ${newUi}`).text('Switch account')

  errorContainer
    .append('div')
    .append('p')
    .attr('class', 'error-subtitle')
    .html(`or ${goBack} to try a different sheet.`)

  button.on('click', () => {
    let sheet
    sheet = GoogleSheet(getDocumentOrSheetId(), getSheetName())

    sheet.authenticate(true, false, () => {
      if (!sheet.error) {
        helperDescription.style('display', 'block')
        errorContainer.remove()
      } else if (sheet.error) {
        helperDescription.style('display', 'none')
      } else {
        content.remove()
      }
    })
  })
}

module.exports = Factory
