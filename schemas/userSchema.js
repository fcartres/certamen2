import { object, string, minLength, maxLength } from 'valibot';

export const createUserSchema = object({
  username: string([
    minLength(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
    maxLength(30, 'El nombre de usuario no puede exceder los 30 caracteres')
  ]),
  name: string([
    minLength(1, 'El nombre es requerido'),
    maxLength(100, 'El nombre no puede exceder los 100 caracteres')
  ]),
  password: string([
    minLength(6, 'La contraseña debe tener al menos 6 caracteres'),
    maxLength(50, 'La contraseña no puede exceder los 50 caracteres')
  ])
}); 