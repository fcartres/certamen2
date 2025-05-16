// Importa la función parse de la biblioteca valibot para validación de datos
import { parse } from 'valibot';

// Crea y exporta una función que genera un middleware de validación
export const createValidationMiddleware = (schema) => {
  // Retorna la función middleware que recibe req, res y next como parámetros
  return (req, res, next) => {
    try {
      // Intenta validar los datos del body de la petición contra el esquema proporcionado
      const validatedData = parse(schema, req.body);
      // Si la validación es exitosa, actualiza el body con los datos validados
      req.body = validatedData;
      // Continúa con el siguiente middleware
      next();
    } catch (error) {
      // Si hay errores de validación
      if (error.issues) {
        // Mapea los errores a un formato más amigable
        const errors = error.issues.map(issue => ({
          field: issue.path?.[0] || 'general', // Campo que falló la validación
          message: issue.message              // Mensaje de error
        }));
        // Retorna un estado 400 con los errores formateados
        return res.status(400).json({ errors });
      }
      // Si es otro tipo de error, retorna un mensaje genérico
      res.status(400).json({ error: 'Error de validación' });
    }
  };
};