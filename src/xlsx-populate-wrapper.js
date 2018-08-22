const XlsxPopulate = require('xlsx-populate')

/** represents a worksheet */
class Worksheet {
  /**
   * initialize a worksheet
   * @param {Object} worksheet - xlsx-populate.sheet[] object of xlsx-populate library
   */
  constructor(worksheet) {
    this.worksheet = worksheet
    this.name = worksheet.name()
    this.aoaDataset = worksheet.usedRange().value()
    this.headings = this.aoaDataset.shift()
    this.jsonDataset = this.aoaDataset.map(dataEntry => {
      return this.headings.reduce((jsonData, heading, headingIndex) => {
        jsonData[heading] = dataEntry[headingIndex]
        return jsonData
      }, {})
    })
  }
  /**
   * get name of the worksheet
   * @returns {string} name of worksheet
   */
  getName() {
    return this.name
  }
  /**
   * get array of row names
   * @returns {Array.<string>} string values of first row in an array
   */
  getHeadings() {
    return this.headings
  }
  /**
   * get data in array of arrays format
   * @returns {Array.<Array.<(string|number)>>} array of excel row data
   */
  getAoaDataset() {
    return this.aoaDataset
  }
  /**
   * get data in json format
   * @returns {Array.<Object>} array of json representation of row data
   */
  getJsonDataset() {
    return this.jsonDataset
  }
}

/** excel workbook */
class Workbook {
  /**
   * creating a Workbook object
   */
  constructor() {
    this.filePath = null
    this.workbook = null
    this.worksheets = null
  }

  /**
   * loads the excel file indicated by the filePath
   * @param {String} filePath - absolute path to excel file
   * @returns {Workbook} Workbook object being initialized
   */
  initialize(filePath) {
    this.filePath = filePath
    return XlsxPopulate.fromFileAsync(filePath)
      .then(workbook => {
        this.workbook = workbook
        this.worksheets = this.workbook
          .sheets()
          .reduce((worksheets, worksheet) => {
            worksheets[worksheet.name()] = new Worksheet(worksheet)
            return worksheets
          }, {})
        return this
      })
      .catch(error => Promise.reject(error))
  }

  /**
   * get names of existing sheets in the workbook
   * @returns {Array.<string>} - a list of sheet names in the workbook
   */
  getWorksheetNames() {
    return Object.keys(this.worksheets)
  }

  /**
   * get dataset of the complete workbook in json format
   * @returns {Object} get datasets for the complete workbook in json format
   */
  getJsonDataset() {
    let dataset = {}
    for (let key in this.worksheets) {
      dataset[key] = this.worksheets[key].getJsonDataset()
    }
    return dataset
  }

  /**
   * overwrite the specified sheet with data
   * @param {String} worksheetName - worksheet to update
   * @param {Object} data
   */
  // updateWorksheet(worksheetName, data) {
  //   return
  // }
}

module.exports = Workbook
