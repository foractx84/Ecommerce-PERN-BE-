function notFoundMiddleware(req, res, next) {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
}

export default notFoundMiddleware;