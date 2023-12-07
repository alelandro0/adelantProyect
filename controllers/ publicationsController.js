const mongoose= require('mongoose');
const jwt= require ('jsonwebtoken');
const formidable =('formidable');

// Importa tu modelo de usuario (asegúrate de haber definido el modelo UserSchema)
import { UserSchema } from '../schema/user';

export const addPublications = async (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        const contenido = fields.Hola[0];
        console.log(contenido);

        if (err) {
            console.error("Error al procesar el formulario:", err);
            res.status(500).send("Error al procesar el formulario");
            return;
        }

        const archivo = files.publication;

        if (!archivo) {
            res.status(400).send("No se ha subido ningún archivo");
            return;
        }

        const storagePath = "publications/" + archivo[0].originalFilename;

        // Conexión a MongoDB
        await mongoose.connect(process.env.BD_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        try {
            const token = req.cookies.token;
            const decodedToken = jwt.decode(token);

            if (!token) return res.status(401).json({ message: "Unauthorized" });

            // Actualiza el documento del usuario en MongoDB
            const user = await UserSchema.findOne({ _id: decodedToken.id });

            if (!user) {
                console.error("Usuario no encontrado");
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            user.publications.push({
                url: storagePath, // Cambia esto según tus necesidades
                contenido: contenido,
                reactions: {
                    comments: [],
                    share: [],
                    like: [],
                },
            });

            await user.save();

            // Envía la respuesta con las publicaciones del usuario
            return res.json({
                publications: user.publications.reverse(),
            });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Error al procesar la solicitud");
        } finally {
            // Cierra la conexión a MongoDB
            await mongoose.connection.close();
        }
    });
};

export const geTPublications = async (req, res) => {
    const token = req.cookies.token;
    const decodedToken = jwt.decode(token);
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    let email = decodedToken.email;
    let user = await UserSchema.findOne({ username });
    res.json({
        publications: user.publications.reverse()
    })
}

export const reactionLove = async (req, res) => {
    const { link } = req.body;
    const token = req.cookies.token;
    console.log(token);
    const decodedToken = jwt.decode(token);

    if (!token || !decodedToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const email = decodedToken.email;
    const user = await UserSchema.findOne({ username });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const name = user.name;

    const document = await UserSchema.findOne({
        username: username,
        "publications.url": link
    }, { "publications.$": 1 });

    console.log("docu ", document);

    const publication = document.publications[0];

    let userExists = false;

    for (const element of publication.reactions.like) {
        if (element.user === name) {
            userExists = true;
            break;
        }
    }

    if (userExists) {
        await UserSchema.findOneAndUpdate(
            {
                username: username,
                "publications.url": link,
                "publications.reactions.like.user": name,
            },
            {
                $pull: {
                    "publications.$.reactions.like": { user: name },
                },
            }
        );
    } else {
        await UserSchema.findOneAndUpdate(
            {
                username: username,
                "publications.url": link,
            },
            {
                $push: {
                    "publications.$.reactions.like": {
                        user: name,
                        num: 1,
                    },
                },
            },
            { new: true }
        );
    }

    const publicationFound = await UserSchema.findOne(
        { username: username, "publications.url": link },
        { "publications.$": 1 }
    );

    return res.json({
        publications: publicationFound.publications[0]
    });
};


export const comments = async (req, res) => {
    try {
        const { comment, link } = req.body;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const decodedToken = jwt.decode(token);
        let email = decodedToken.username;
        const user = await UserSchema.findOne({ email });
        await UserSchema.findOneAndUpdate(
            { username: username, "publications.url": link },
            {
                $push: {
                    "publications.$.reactions.comments": {
                        _id: new ObjectId(),
                        user: user.name,
                        comment: comment,
                    },
                },
            }
        );
        return res.json({
            id: user._id,
            username: user.username,
            reaction: user.reactions,
        });
    } catch (error) {
        console.log(error);
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { comment, link, idUser } = req.body;
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: "Unauthorized" });
        const decodedToken = jwt.decode(token);
        let email = decodedToken.username;
        const user = await UserSchema.findOne({ username });
        console.log(user);
        const result = await UserSchema.findOneAndUpdate(
            { username: username, "publications.url": link },
            {
                $pull: {
                    "publications.$[pub].reactions.comments": {
                        _id: mongoose.Types.ObjectId(idUser) // Cambia 'id' a '_id' para utilizar el identificador único (_id)
                    }
                }
            },
            {
                arrayFilters: [
                    { "pub.url": link }
                ]
            }
        );


        return res.json(user);
    } catch (error) {
        console.log(error);
    }
};

// Endpoint para refrescar tokens
export const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.token; // Obtener el token de actualización desde las cookies

    if (!refreshToken) {
        return res.status(401).json({ message: "No se proporcionó el token" });
    }

    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const decodedToken = jwt.decode(refreshToken);
        if (decodedToken.exp < currentTime) {
            console.log("El token de actualización ha expirado");
            const email = decodedToken.email;
            const user = await UserSchema.findOne({ username });

            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            const newAccessToken = await createAcccessToken(user); // Generar un nuevo token de acceso
            // actualización
            res.clearCookie("token"); // Eliminar el token de actualización antiguo
            res.cookie("token", newAccessToken); // Establecer el nuevo token de acceso como cookie
            const newTokenVerify = jwt.verify(newAccessToken, TOKEN_SECRET); // Verificar el token de
            console.log(newTokenVerify);
            return res.status(200).json({ accessToken: newAccessToken }); // Enviar el nuevo token de acceso al cliente
        } else {
            return res.status(200).json({ message: "Token de actualización válido" });
        }
    } catch (error) {
        console.log(error);
        return res
            .status(403)
            .json({ message: "Error al verificar el token de actualización" });
    }
};


export const geTAllPublications = async (req, res) => {
    const publications = await UserSchema.find({}, 'publications profileImage name');
    console.log(publications);
    res.json({
        publis: publications
    })
}


