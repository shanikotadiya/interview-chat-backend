function notFound(req, res, next) {
  const err = new Error(`Not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  const body = {
    success: false,
    message,
  };

  if (err.error !== undefined) {
    body.error = err.error;
  } else if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.error = err.stack;
  }

  res.status(statusCode).json(body);
}

function wrap(handler) {
  return (req, res, next) => {
    try {
      const result = handler(req, res, next);
      if (result && typeof result.catch === 'function') result.catch(next);
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { notFound, errorMiddleware, wrap };
