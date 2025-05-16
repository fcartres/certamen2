import { object, string, boolean, minLength, maxLength, optional } from 'valibot';

export const createReminderSchema = object({
  content: string([
    minLength(1, 'El contenido no puede estar vacío'),
    maxLength(120, 'El contenido no puede exceder los 120 caracteres')
  ]),
  important: optional(boolean())
});

export const updateReminderSchema = object({
  content: optional(string([
    minLength(1, 'El contenido no puede estar vacío'),
    maxLength(120, 'El contenido no puede exceder los 120 caracteres')
  ])),
  important: optional(boolean())
}); 