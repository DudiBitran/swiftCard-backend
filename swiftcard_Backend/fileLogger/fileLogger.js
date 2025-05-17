const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => {
      if (typeof message === "object" && message !== null) {
        return `${timestamp} | ${level.toUpperCase()}: Status: ${
          message.statusCode
        } | Message: ${message.message}`;
      }
      return `${timestamp} | ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new DailyRotateFile({
      dirname: path.join(__dirname, "../logs"),
      filename: "log-%DATE%.log",
      datePattern: "DD-MM-YYYY",
      zippedArchive: false,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

module.exports = logger;
