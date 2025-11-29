/**
 * Manejador de errores centralizado
 * @param {Error} err - Objeto de error
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: err.message
    });
  }

  // Errores de autenticación
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'No autorizado',
      error: err.message
    });
  }

  // Error 404 - Recurso no encontrado
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      message: 'Recurso no encontrado',
      error: err.message
    });
  }

  // Error 409 - Conflicto (ej. recurso duplicado)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Conflicto: el recurso ya existe',
      error: err.message
    });
  }

  // Error 500 - Error del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error inesperado',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};

export default errorHandler;
