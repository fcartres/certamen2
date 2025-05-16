import { object, string, minLength } from 'valibot';

export const loginSchema = object({
  username: string([
    minLength(1, 'El nombre de usuario es requerido')
  ]),
  password: string([
    minLength(1, 'La contraseña es requerida')
  ])
}); 