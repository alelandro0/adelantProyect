const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const morgan = require("morgan");
const mongoose = require("mongoose");
const crypto = require("crypto");
const { resolve } = require("path");
const authenticate = require("./auth/authenticate.js");
const { Server: SocketServer } = require("socket.io");
const upload =require('./config/multerUpload.js')
const Image =require('./schema/imagenUpload.js');
const { log } = require("console");


require("dotenv").config();

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
app.use(express.static(resolve(__dirname, "front", "dist")));




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
app.use("/api/signup", require("./routes/signup"));
app.use("/api/login", require("./routes/login"));
app.use("/api/user", authenticate, require("./routes/user"));
app.use("/api/signout", require("./routes/signout"));
app.use("/api/todos", authenticate, require("./routes/todos"));
app.use("/api/refresh-token", require("./routes/refreshToken"));
app.use('/api/publication',authenticate, require("./routes/publicationsRoutes"));
app.post('/image-upload', upload.single('imagePerfil'), async (req, res) => {
    try {
      
     
     
      console.log('verificar estructura :',req.file);
      // Guardar la referencia de la imagen en MongoDB
      const imagenPerfil = new Image({
        name:req.file.originalname,
        imagenPerfil:req.buffer
        
      });
  
      await imagenPerfil.save(); // Utilizar await para esperar la operación de guardado
      res.send({message:'imagen cargada con exito'})
      // console.log('filename:',newImage.filename);
      // console.log('URL: ',newImage.imageUrl);
    
      // res.status(200).json({success:true, imageUrl:newImage.imageUrl})
      // console.log('imagen carga con exito');
    } catch (error) {
      console.error('Error al cargar y guardar la imagen:', error);
      res.status(500).send('Error al cargar ');
    }
  });
  app.get('/profile', async (req, res) => {
    try {
      const imagenid= mongoose.model('imagenPerfil', {name: string, imagen: buffer})
      const obtenerImagen = async (id)=>{
       const imagenes= Image.findById(id)
       if (imagenes) {
        return imagenes.imagen;
       } 
       return null;
      } 
    } catch (error) {
      console.error('Error al cargar la última imagen:', error);
      res.status(500).json({ success: false, error: 'Error al cargar la última imagen' });
    }
  });


app.get("/", (req, res) => {
    res.send("¡Hola, mundo!");
});

server.listen(expressPort, () => {
    console.log(`El servidor de Express se está ejecutando en el puerto: ${expressPort}`);
});
