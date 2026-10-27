// 404 para rutas inexistentes
export const notFound = (req, res) => {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

// Manejador central de errores: todo error sale como { mensaje }
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  const mensaje = status === 500 ? 'Error interno del servidor' : err.message;
  res.status(status).json({ mensaje });
};
