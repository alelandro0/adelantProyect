
import { useState } from "react";
import { Outlet, Navigate} from "react-router-dom";
import { useAuth } from "../Autenticacion/AutProvider";
import React from "react";

export default function ProtectedRoute(){
    const auth = useAuth()
    return auth.esAutentico ? <Outlet/> : <Navigate to="/" />
}