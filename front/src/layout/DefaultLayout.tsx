import { Link } from "react-router-dom";
import Signup from '../routes/signup';
import Dashboard from '../routes/dashboard';
import React from "react";
interface DefaultLayoutProps{
    children: React.ReactNode,
}
export default function DefaultLayout({children}:DefaultLayoutProps){
    return(
        <>
        <header>
            <nav>
                <ul>
                    <li>
                        <Link to="/">inicio</Link>
                    </li>
                    <li>
                        <Link to="/signup">Registro</Link>
                    </li>
                    <li>
                        <Link to="/dashboard">login</Link>
                    </li>
                </ul>
            </nav>
        </header>
        <main>
            {children}
        </main>
    </>
    )
    
}