export function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: `No such endpoint: ${req.method} ${req.path}` });
  }
  next();
}

export function errorHandler(err, _req, res, _next) {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
}
