import express from "express"
const router = express.Router();
import sendConfirmationEmail  from "./correos.mjs";

import { jsonResponse } from "../lib/jsonResponse.mjs";
import User  from "../schema/user.mjs";

router.post("/", async (req, res) => {

    const { username, name, password } = req.body;

    if (!!!username || !!!name || !!!password) {
        return res.status(400).json(jsonResponse(400, {
            error: "archivos son requeridos"
        }));
    }

    try {
        const user = new User();

        const exists = await user.usernameExist(username);

        if (exists) {
            return res.status(400).json(jsonResponse(400, {
                error: "Username ya existe D:"
            }));
        }

        const newUser = new User({ username, name, password });
     
        await newUser.save();
        sendConfirmationEmail(username)
        console.log(sendConfirmationEmail(username));
        res.status(200).json(jsonResponse(200, {
            mesage: "Usuario creado"
        }));
       
    } catch (error) {
        res.status(500).json(jsonResponse(500, {
            error: "Error al crear un usuario"
        }));
    }
});

export default router;
