import express from "express";
// hola d
import cors from "cors";
const app = express();
import http  from "http";
import morgan from "morgan";
import mongoose from "mongoose";
import crypto  from "crypto";
import { resolve } from "path";
import {authenticate}  from "./auth/authenticate.mjs";
import { Server as SocketServer } from "socket.io";

import bodyParser from 'body-parser';
import { uploadFile} from "./firebase/storageService.mjs";

import dotenv from "dotenv"

dotenv.config();

const expressPort = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketServer(server, {
    cors: {
        origin: "*",
    },
});

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files
// Reemplaza esto en tu archivo app.mjs
app.use(express.static(resolve(import.meta.url, '..', 'front', 'dist')));



// Generar secretos de tokens aleatorios
const generateTokenSecret = () => {
    return crypto.randomBytes(64).toString("hex");
};

const ACCESS_TOKEN_SECRET = generateTokenSecret();
const REFRESH_TOKEN_SECRET = generateTokenSecret();

// Almacenar secretos de tokens en variables de entorno
process.env.ACCESS_TOKEN_SECRET = ACCESS_TOKEN_SECRET;
process.env.REFRESH_TOKEN_SECRET = REFRESH_TOKEN_SECRET;

// Inicializaciones
io.on('connection', socket => {
    console.log('Conexión con socketIO');
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', { body: msg.body, user: msg.user });
    });
});

async function main() {
    try {
        await mongoose.connect(process.env.BD_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Conectado a MongoDB :D");
    } catch (error) {
        console.error("Error al conectar con MongoDB:", error);
    }
}

main();

// Rutas
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ message: 'Sintaxis JSON no válida' });
  }
  next();
});
import signupRouter from"./routes/signup.mjs"
import loginRouter from "./routes/login.mjs"
import userRouter from "./routes/user.mjs"
import signoutRouter from "./routes/signout.mjs"
import todosRouter from "./routes/todos.mjs"
import refreshTokenRouter from "./routes/refreshToken.mjs"
import publicationsRoutes from "./routes/publicationsRoutes.mjs"
app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/user", authenticate, userRouter);
app.use("/api/signout", signoutRouter);
app.use("/api/todos", authenticate, todosRouter);
app.use("/api/refresh-token", refreshTokenRouter);
app.use('/api/publication', publicationsRoutes);
app.post("/api/upload", async (req, res) => {
  try {
    const file = req.body; // Puedes ajustar esto según cómo envíes el archivo desde el cliente
    const downloadURL = await uploadFile(file);

    res.status(200).json({ success: true, downloadURL });
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    res.status(500).json({ success: false, error: "Error al subir la imagen" });
  }
});


app.get("/", (req, res) => {
    res.send("¡Hola, mundo!");
});

server.listen(expressPort, () => {
    console.log(`El servidor de Express se está ejecutando en el puerto: ${expressPort}`);
});
