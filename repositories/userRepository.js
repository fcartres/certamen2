// Importa el cliente de Prisma para interactuar con la base de datos
import { PrismaClient } from '@prisma/client';
// Importa el módulo crypto de Node.js para funciones criptográficas
import crypto from 'node:crypto';

// Crea una nueva instancia del cliente Prisma
const prisma = new PrismaClient();

// Define y exporta la clase UserRepository para manejar operaciones con usuarios
export class UserRepository {
  // Método para buscar un usuario por su token de autenticación
  async findByToken(token) {
    return prisma.user.findFirst({
      where: { token }              // Busca el primer usuario que coincida con el token
    });
  }

  // Método para buscar un usuario por su nombre de usuario
  async findByUsername(username) {
    return prisma.user.findUnique({
      where: { username }           // Busca un usuario por su username único
    });
  }

  // Método para manejar el inicio de sesión
  async login(username, password) {
    const user = await this.findByUsername(username);  // Busca el usuario
    if (!user) {
      return null;                  // Si no existe el usuario, retorna null
    }

    // Separa la sal y el hash almacenado de la contraseña
    const [salt, storedHash] = user.password.split(':');
    // Genera el hash de la contraseña proporcionada
    const hash = await new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex'));
      });
    });

    // Verifica si el hash generado coincide con el almacenado
    if (hash !== storedHash) {
      return null;                  // Si no coincide, retorna null
    }

    // Genera un nuevo token de autenticación
    const token = crypto.randomBytes(48).toString('hex');
    // Actualiza el token del usuario en la base de datos
    await this.updateToken(username, token);

    // Retorna los datos del usuario y el token
    return {
      username: user.username,
      name: user.name,
      token
    };
  }

  // Método para cerrar sesión
  async logout(token) {
    const user = await this.findByToken(token);  // Busca el usuario por token
    if (!user) {
      return false;                 // Si no existe el usuario, retorna false
    }

    // Elimina el token del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { token: null }
    });

    return true;                    // Retorna true si se cerró sesión exitosamente
  }

  // Método para actualizar el token de un usuario
  async updateToken(username, token) {
    return prisma.user.update({
      where: { username },          // Busca por username
      data: { token }              // Actualiza el token
    });
  }

  // Método para crear un nuevo usuario
  async create(userData) {
    const { password, ...rest } = userData;  // Separa la contraseña del resto de datos
    const salt = crypto.randomBytes(16).toString('hex');  // Genera una sal aleatoria
    
    // Genera el hash de la contraseña
    const hash = await new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex'));
      });
    });

    // Combina la sal y el hash
    const hashedPassword = `${salt}:${hash}`;

    // Crea el nuevo usuario en la base de datos
    return prisma.user.create({
      data: {
        ...rest,                    // Spread del resto de datos del usuario
        password: hashedPassword    // Guarda la contraseña hasheada
      }
    });
  }
}