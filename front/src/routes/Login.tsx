import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../Autenticacion/AutProvider";
import DefaultLayout from "../layout/DefaultLayout"
import { useState } from "react"
import { API_URL } from "../Autenticacion/constanst";
import type { AuthResponse, AuthResponseError } from "../types/types";
import React from "react";
import './login.css'

export default function Login(){

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorResponse, setErrorResponse] = useState("")
  const auth = useAuth();
  const goto = useNavigate();

  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    try{
      const response = await fetch(`${API_URL}/login`,{
        method: "POST",
        headers:{
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      })

      if(
        response.ok){
        console.log("Inicio de sesión exitoso.")
        setErrorResponse("");
        const json =(await response.json()) as AuthResponse;
        
        if(json.body.accessToken && json.body.refreshToken){
          auth.saveUser(json);

          goto("/dashboard")

        }


      }else{
        console.log("algo malo acurrió :o");
        const json = (await response.json()) as AuthResponseError;
        setErrorResponse(json.body.error);
        return;
      
      }
    }catch(error){
      console.log(error)
    }
  }

  if(auth.esAutentico){
    return <Navigate to="/dashboard"/>
  };

  return (
    <DefaultLayout>
      <div className="luna"></div>
      <form className="form" onSubmit={handleSubmit}>
        <h1 className="title">Login</h1>
        {!!errorResponse && <div className="errorMessage">{errorResponse}</div>}
        <label className="subtitle">Email</label>
        <input 
        className="textarea"
          type="email" 
          value={username} 
          onChange={(e)=>setUsername(e.target.value)}></input>
        <label className="subtitle">password</label>
        <input 
        className="textarea"
          type="password" 
          value={password} 
          onChange={(e)=>setPassword(e.target.value)}></input>
        <button  className="boton">Login</button>
      </form>
    </DefaultLayout>
  
  )
  
}