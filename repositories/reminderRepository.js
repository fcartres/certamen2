// Importa el cliente de Prisma para interactuar con la base de datos
import { PrismaClient } from '@prisma/client';

// Crea una nueva instancia del cliente Prisma
const prisma = new PrismaClient();

// Define y exporta la clase ReminderRepository para manejar operaciones con recordatorios
export class ReminderRepository {
  // Método para encontrar todos los recordatorios de un usuario específico
  async findAll(userId) {
    return prisma.reminder.findMany({
      where: { userId: userId },     // Filtra por el ID del usuario
      orderBy: [
        { important: 'desc' },       // Ordena primero por importancia (descendente)
        { createdAt: 'desc' }        // Luego por fecha de creación (más recientes primero)
      ],
      include: {                     // Incluye información del usuario relacionado
        user: {
          select: {                  // Selecciona solo los campos necesarios del usuario
            username: true,
            name: true
          }
        }
      }
    });
  }

  // Método para encontrar un recordatorio específico por su ID
  async findById(id) {
    return prisma.reminder.findUnique({
      where: { id },                 // Busca por ID del recordatorio
      include: {                     // Incluye información del usuario relacionado
        user: {
          select: {                  // Selecciona campos específicos del usuario
            username: true,
            name: true
          }
        }
      }
    });
  }

  // Método para crear un nuevo recordatorio
  async create(reminderData) {
    return prisma.reminder.create({
      data: reminderData,            // Datos del nuevo recordatorio
      include: {                     // Incluye información del usuario relacionado
        user: {
          select: {                  // Selecciona campos específicos del usuario
            username: true,
            name: true
          }
        }
      }
    });
  }

  // Método para actualizar un recordatorio existente
  async update(id, reminderData) {
    return prisma.reminder.update({
      where: { id },                 // Identifica el recordatorio a actualizar
      data: reminderData,            // Nuevos datos para actualizar
      include: {                     // Incluye información del usuario relacionado
        user: {
          select: {                  // Selecciona campos específicos del usuario
            username: true,
            name: true
          }
        }
      }
    });
  }

  // Método para eliminar un recordatorio
  async delete(id) {
    return prisma.reminder.delete({
      where: { id }                  // Identifica el recordatorio a eliminar
    });
  }
}