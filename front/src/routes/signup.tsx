import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../Autenticacion/AutProvider";

import React, { useState } from "react"
import DefaultLayout from "../layout/DefaultLayout"
import { API_URL } from "../Autenticacion/constanst";
import type{ AuthResponseError } from "../types/types";

export default function Signup(){
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorResponse, setErrorResponse] = useState("")

  const auth = useAuth();
  const goto = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    try{
      const response = await fetch(`${API_URL}/signup`,{
        method: "POST",
        headers:{
          "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            username,
            password
        })
      })

      if(response.ok){
        console.log("el usuario se creo correctamente")
        setErrorResponse("")

        goto("/")
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
        <h1>Signup</h1>
        {!!errorResponse && <div className="errorMessage">{errorResponse}</div>}
        <label className="subtitle">Nombre</label>
        <input type="text" value={name} onChange={(e)=>setName(e.target.value)}></input>
        <label className="subtitle">Email</label>
        <input type="email" value={username} onChange={(e)=>setUsername(e.target.value)}></input>
        <label className="subtitle">password</label>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}></input>
        <button>Create Usuario</button>
      </form>
    </DefaultLayout>
  
  )
  
}