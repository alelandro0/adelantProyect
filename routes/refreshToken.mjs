import getTokenFromHeader from "../auth/getTokenFromHeader.mjs";
import { jsonResponse } from "../lib/jsonResponse.mjs";
import Token from "../schema/token.mjs";
import express from "express";
const router = express.Router();
import {verifyRefreshToken} from "../auth/verifyToken.mjs";

router.post("/",async(req, res)=>{

    const refreshToken = getTokenFromHeader(req.headers);

    if(refreshToken){
        try {
            const found = await Token.findOne({token: refreshToken})
            if(!found){
                return res.status(401).send(jsonResponse(401, {error: "Unauthorized"}))
            }

            const payload = verifyRefreshToken(found.token);

            if(payload){
               const accessToken = generateAccessToken(payload.use);

               return res.status(200).json(jsonResponse(200,{accessToken}))
            }else{
                return res.status(401).send(jsonResponse(401, {error: "Unauthorized"}))
            }
            
        } catch (error) {
            return res.status(401).send(jsonResponse(401, {error: "Unauthorized"}))
        }

    }else{
        res.status(401).send(jsonResponse(401, {error: "Unauthorized"}))
    }
    res.send("refresh-token");

});

export default router;