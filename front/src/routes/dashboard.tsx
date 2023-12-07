import React, { useEffect, useState } from "react";
import { useAuth } from "../Autenticacion/AutProvider";
import { API_URL } from "../Autenticacion/constanst";
import PortalLayout from "../layout/PortalLayout";
import './dashboard.css'

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  idUser: string;
}

interface UserProfile {
  name: string;
  description: string;
  profileImage: string;
}

interface Publication {
  _id: string;
  contenido: string;
  url: string;
  reactions: {
    comments: string[];
    share: string[];
    like: string[];
  };
}

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    description: "",
    profileImage: "URL_DE_LA_IMAGEN_POR_DEFECTO",
  });
  const [publications, setPublications] = useState<Publication[]>([]);
  const [newPublication, setNewPublication] = useState({
    contenido: "",
    url: "",
  });
  const auth = useAuth();

  useEffect(() => {
    loadUserProfile();
    loadPublications();
  }, []);

  async function createTodo() {
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({
          title,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        setTodos([json, ...todos]);
        setTitle(""); // Limpiar el campo después de crear la tarea
      } else {
        console.error("Error al crear la tarea:", response.statusText);
      }
    } catch (error) {
      console.error("Error al crear la tarea:", error);
    }
  }

  async function loadUserProfile() {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        setUserProfile(json);
      } else {
        console.error("Error al cargar el perfil:", response.statusText);
      }
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
    }
  }

  async function loadPublications() {
    try {
      const response = await fetch(`${API_URL}/publications`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        setPublications(json);
      } else {
        console.error("Error al cargar las publicaciones:", response.statusText);
      }
    } catch (error) {
      console.error("Error al cargar las publicaciones:", error);
    }
  }

  async function handlePublish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/publications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify(newPublication),
      });

      if (response.ok) {
        // Recargar las publicaciones después de publicar una nueva
        await loadPublications();
        // Limpiar el estado de la nueva publicación
        setNewPublication({
          contenido: "",
          url: "",
        });
      } else {
        console.error("Error al publicar:", response.statusText);
      }
    } catch (error) {
      console.error("Error al publicar:", error);
    }
  }

  const increaseReactions = async (url: string) => {
    console.log("Aumentar reacciones para la URL:", url);
  };

  return (
    <PortalLayout>
      <div className="perfil">
        <div className="profile-header">
          <img
            src={userProfile.profileImage}
            alt="Perfil"
            className="profile-image"
          />
          <h1>{userProfile.name}</h1>
          <p>{userProfile.description}</p>
        </div>
      
        <form className="publiText" onSubmit={handlePublish}>
          <textarea className="textarea"
            placeholder="Escribe tu nueva publicación"
            value={newPublication.contenido}
            onChange={(e) =>
              setNewPublication({
                ...newPublication,
                contenido: e.target.value,
              })
            }
          ></textarea>
          <input
            type="text"
            placeholder="URL de la imagen (opcional)"
            value={newPublication.url}
            onChange={(e) =>
              setNewPublication({
                ...newPublication,
                url: e.target.value,
              })
            }
          />
          <button type="submit">Publicar</button>
        </form>
        {publications.length > 0 ? (
          <div className="publications">
            {publications.map((publication) => (
              <div key={publication._id} className="publicacion">
                <div className="nombre-usuario">
                  <div className="post-profile">
                    <div className="post-img">
                      <img src={userProfile.profileImage} alt="" />
                    </div>
                    <h3>{userProfile.name}</h3>
                  </div>
                </div>
                <div className="contenido">{publication.contenido}</div>
                <img
                  src={publication.url}
                  alt="Imagen de la publicación"
                  className="imagen-publicacion"
                />
                <div className="post-box">
                  <button
                    name="Love"
                    onClick={() => increaseReactions(publication.url)}
                  >
                    <i className="ri-heart-line"></i>
                    <span>{publication.reactions.like.length}</span>
                  </button>
                  <div>
                    <i className="ri-chat-3-line"></i>
                    <span>{publication.reactions.comments.length}k</span>
                  </div>
                  <button name="comments">
                    <i className="ri-download-cloud-2-line"></i>
                    <span>{publication.reactions.share.length}k</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay publicaciones disponibles.</p>
        )}
      </div>
    </PortalLayout>
  );
}

