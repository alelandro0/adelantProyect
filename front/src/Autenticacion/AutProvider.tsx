import React, { useContext, createContext, useState, useEffect } from "react";
import type { AccessTokenResponse, AuthResponse, User  } from "../types/types";
import { API_URL } from "../Autenticacion/constanst";

interface AuthProviderProps {
    children: React.ReactNode;
};

const AuthContext = createContext({
    esAutentico: false,
    getAccessToken: () => { },
    saveUser: (userData: AuthResponse) => { },
    getRefreshToken:()=>{},
    getUser: ()=>({} as User | undefined),
    signOut: ()=>{},
});

export function AuthProvider({ children }: AuthProviderProps) {

    const [esAutentico, setEsAutentico] = useState(false);
    const [accessToken, setAccessToken] = useState<string>("");
    const [user, setUser] = useState<User>();
    const [isLoading,setIsLoading]=useState(true);
    //const [refreshToken, setRefreshToken] = useState<string>("");

    useEffect(()=>{
        checkAuth();
    },[]);

    async function requestNewAccessToken(refreshToken: string){
        try {
            const response = await fetch(`${API_URL}/refresh-token`,{
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                    authorization: `Bearer ${refreshToken}`
                }  
            });
            if(response.ok){
                const json = await response.json() as AccessTokenResponse;

                if(json.error){
                    throw new Error(json.error);
                }
                return json.body.accesToken;
            }else{
                throw new Error(response.statusText);
            }
        } catch (error) {
        console.log(error);
        return null;
        }
    }

    async function getUserInfo(accessToken:string) {
        try {
            const response = await fetch(`${API_URL}/user`,{
                method: "GET",
                headers:{
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }  
            });
            if(response.ok){
                const json = await response.json();

                if(json.error){
                    throw new Error(json.error);
                }
                return json.body;
            }else{
                throw new Error(response.statusText);
            }
        } catch (error) {
        console.log(error);
        return null;
        } 
    }

    async function checkAuth() {
        if(accessToken){
            const userInfo  = await getUserInfo(accessToken);
            if(userInfo){
                saveSessionInfo(userInfo.user, accessToken, getRefreshToken()!);
                setIsLoading(false);
                return; 
            }
        }else{
            const token = getRefreshToken();
            if(token){
                const newAccessToken = await requestNewAccessToken(token);
                if(newAccessToken){
                    const userInfo  = await getUserInfo(newAccessToken);
                    if(userInfo){
                        saveSessionInfo(userInfo.user, newAccessToken,token);
                        setIsLoading(false);
                        return; 
                    }
                }
            }
        }
        setIsLoading(false);
    }

    function signOut(){
        setEsAutentico(false);
        setAccessToken("");
        setUser(undefined);
        localStorage.removeItem("token");
    }
    
    function saveSessionInfo(userInfo: User, accessToken: string, refreshToken: string){
        setAccessToken(accessToken);
        localStorage.setItem("token", JSON.stringify(refreshToken));
        setEsAutentico(true);
        setUser(userInfo)
    }

    function getAccessToken() {
        return accessToken;
    };

    function getRefreshToken():string | null {
        const tokenData = localStorage.getItem("token");
        if(tokenData){
            const token = JSON.parse(tokenData);
            return token;
        }
        return null;
    };

    function saveUser(userData: AuthResponse) {
        saveSessionInfo(
            userData.body.user, 
            userData.body.accessToken, 
            userData.body.refreshToken );
    };

    function getUser(){
        return user;
    }

    return (
        <AuthContext.Provider value={{ esAutentico, getAccessToken, saveUser, getRefreshToken, getUser, signOut }}>
            {isLoading? <div>Cargando...</div>: children}
        </AuthContext.Provider>
    );

}

export const useAuth = () => useContext(AuthContext);