class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode; // HTTP status code
    this.details = details;       // Información opcional
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details); // 400 Bad Request
  }
}

class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "No tiene permisos") {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflicto: recurso ya existe") {
    super(message, 409);
  }
}

class DatabaseError extends AppError {
  constructor(message = "Error en la base de datos") {
    super(message, 500);
  }
}

module.exports = {
  AppError, 
  ValidationError, 
  NotFoundError,
  ForbiddenError,
  ConflictError,
  DatabaseError
};