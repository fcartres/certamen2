import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();  // Instancia del cliente Prisma

// Función para generar hash de contraseña
const generatePasswordHash = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");  // Genera salt aleatorio
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {  // Genera hash
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);  // Combina salt y hash
    });
  });
};

// Función principal para sembrar la base de datos
async function main() {
  const passwordHash = await generatePasswordHash("certamen123");  // Genera hash para contraseña
  
  // Crea o actualiza usuario admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Gustavo Alfredo Marín Sáez',
      password: passwordHash,
    },
  });

  console.log({ admin });
}

// Ejecuta la función principal
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();  // Desconecta el cliente
  });