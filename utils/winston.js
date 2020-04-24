require('dotenv').config();
const { createLogger, format, transports } = require('winston');

const MyFormatLog = format.printf((info) => {
  return `${info.level.toUpperCase()} [${info.timestamp}] ${
    info.label || 'Default'
  } - ${info.message}`;
});

const logger = createLogger({
  format: format.combine(
    format.simple(),
    format.timestamp({ format: 'DD MMM YYYY HH:mm:ss' }),
    MyFormatLog
  ),

  transports: [
    new transports.File({
      filename: `${__dirname}/../logs/error.log`,
      level: 'error',
    }),

    new transports.File({ filename: `${__dirname}/../logs/geral.log` }),
  ],
});
/**Imprimir no console quando estiver em desenv */
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      level: 'debug',
      colorize: true,
    })
  );
}

module.exports = logger;
