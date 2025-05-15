import express from "express";
import crypto from "node:crypto";
import { UserRepository } from "./repositories/userRepository.js";
import { ReminderRepository } from "./repositories/reminderRepository.js";
import { loginSchema } from "./schemas/authSchema.js";
import { createUserSchema } from "./schemas/userSchema.js";
import { createReminderSchema, updateReminderSchema } from "./schemas/reminderSchema.js";
import { createValidationMiddleware } from "./middlewares/validationMiddleware.js";

const PORT = process.env.PORT ?? 3000;
const app = express();
const userRepository = new UserRepository();
const reminderRepository = new ReminderRepository();

app.use(express.json());
app.use(express.static("public"));

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  const token = req.header("X-Authorization");

  if (!token) {
    return res.status(401).json({ error: "No se proporciona ningún token" });
  }

  const user = await userRepository.findByToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = user;
  next();
};

// Función auxiliar para verificar la contraseña
const verifyPassword = (password, storedPassword) => {
  const [salt, key] = storedPassword.split(":");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString("hex") === key);
    });
  });
};

// Función que genera un hash seguro de una contraseña
const generatePasswordHash = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
};

// Ruta para crear un nuevo usuario
app.post("/api/users", createValidationMiddleware(createUserSchema), async (req, res) => {
  try {
    const existingUser = await userRepository.findByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
    }

    const user = await userRepository.create(req.body);
    res.status(201).json({
      username: user.username,
      name: user.name
    });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el usuario" });
  }
});

// Login route
app.post("/api/auth/login", createValidationMiddleware(loginSchema), async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await userRepository.login(username, password);
    if (!result) {
      return res.status(401).json({ error: "Credenciales Invalidas" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error Interno del Servidor" });
  }
});

// Logout route
app.post("/api/auth/logout", authMiddleware, async (req, res) => {
  const token = req.header("X-Authorization");
  
  try {
    const success = await userRepository.logout(token);
    if (!success) {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error Interno del Servidor" });
  }
});

// Ruta para obtener recordatorios
app.get("/api/reminders", authMiddleware, async (req, res) => {
  try {
    const reminders = await reminderRepository.findAll(req.user.id);
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los recordatorios" });
  }
});

// Ruta para crear un nuevo recordatorio
app.post("/api/reminders", 
  authMiddleware, 
  createValidationMiddleware(createReminderSchema), 
  async (req, res) => {
    try {
      const newReminder = await reminderRepository.create({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(newReminder);
    } catch (error) {
      res.status(500).json({ error: "Error al crear el recordatorio" });
    }
  }
);

// Ruta para actualizar un recordatorio
app.patch("/api/reminders/:id", 
  authMiddleware, 
  createValidationMiddleware(updateReminderSchema), 
  async (req, res) => {
    const { id } = req.params;

    try {
      const reminder = await reminderRepository.findById(id);
      if (!reminder) {
        return res.status(404).json({ error: "Recordatorio no Encontrado" });
      }

      const updatedReminder = await reminderRepository.update(id, req.body);
      res.status(200).json(updatedReminder);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el recordatorio" });
    }
  }
);

// Ruta para eliminar un recordatorio
app.delete("/api/reminders/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const reminder = await reminderRepository.findById(id);
    if (!reminder) {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }

    await reminderRepository.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el recordatorio" });
  }
});

app.listen(PORT, (error) => {
  if (error) {
    console.error(`No se puede ocupar el puerto ${PORT} :(`);
    return;
  }
  console.log(`Escuchando en el puerto ${PORT}`);
});

export default app