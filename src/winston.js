const path = require('path')
const { createLogger, format, transports } = require('winston')

const logsDirPath = path.resolve('./logs')
const appOutputFormat = format.printf(info => `[${info.level}] ${info.message}`)
const consoleOutputFormat = format.printf(info => info.message)
const winstonOptions = {
  file: {
    app: {
      level: 'debug',
      format: format.combine(appOutputFormat),
      filename: path.join(logsDirPath, 'app.log'),
      handleExceptions: false,
    },
    error: {
      level: 'warn',
      filename: path.join(logsDirPath, 'error.log'),
      handleExceptions: true,
    },
  },
  console: {
    app: {
      level: 'debug',
      format: format.combine(consoleOutputFormat),
      handleExceptions: false,
    },
    error: {
      level: 'warn',
      handleExceptions: true,
    },
  },
}

const logger = createLogger({
  transports: [
    new transports.File(winstonOptions.file.app),
    new transports.File(winstonOptions.file.error),
    new transports.Console(winstonOptions.console.app),
    // new transports.Console(winstonOptions.console.error),
  ],
  exitOnError: false, // do not exit on handled exceptions
})

module.exports = logger
