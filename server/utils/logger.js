/**
 * utils/logger.js
 * Lightweight structured logger for UCab.
 * Uses colour-coded console output in development and JSON in production.
 */

const isDev = process.env.NODE_ENV !== 'production';

const LEVELS = { info: 'INFO', warn: 'WARN', error: 'ERROR', debug: 'DEBUG', http: 'HTTP' };

const COLORS = {
  INFO:  '\x1b[36m',  // Cyan
  WARN:  '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m',  // Red
  DEBUG: '\x1b[35m',  // Magenta
  HTTP:  '\x1b[32m',  // Green
  RESET: '\x1b[0m',
};

const timestamp = () => new Date().toISOString();

const formatDev = (level, message, meta) => {
  const color = COLORS[level] || '';
  const reset = COLORS.RESET;
  const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${color}[${timestamp()}] [${level}] ${message}${reset}${metaStr}`;
};

const formatProd = (level, message, meta) =>
  JSON.stringify({ timestamp: timestamp(), level, message, ...meta });

const log = (level, message, meta = null) => {
  const formatted = isDev
    ? formatDev(level, message, meta)
    : formatProd(level, message, meta);

  if (level === LEVELS.error) {
    console.error(formatted);
  } else if (level === LEVELS.warn) {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
};

const logger = {
  info:  (msg, meta) => log(LEVELS.info,  msg, meta),
  warn:  (msg, meta) => log(LEVELS.warn,  msg, meta),
  error: (msg, meta) => log(LEVELS.error, msg, meta),
  debug: (msg, meta) => { if (isDev) log(LEVELS.debug, msg, meta); },
  http:  (msg, meta) => log(LEVELS.http,  msg, meta),
};

/**
 * Express HTTP request logger middleware.
 * Usage: app.use(logger.requestMiddleware)
 */
logger.requestMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? COLORS.ERROR : COLORS.HTTP;
    logger.http(
      `${req.method} ${req.originalUrl} ${statusColor}${res.statusCode}${COLORS.RESET} — ${duration}ms`,
      isDev ? null : { ip: req.ip, userAgent: req.get('User-Agent') }
    );
  });
  next();
};

module.exports = logger;