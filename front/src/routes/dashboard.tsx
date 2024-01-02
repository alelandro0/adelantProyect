import React, { useEffect, useState } from "react";
import { useAuth } from "../Autenticacion/AutProvider";
//import { API_URL } from "../Autenticacion/constanst";
import PortalLayout from "../layout/PortalLayout";
import "./dashboard.css";

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
  const [editingProfileImage, setEditingProfileImage] = useState(false);
 
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    description: "",
    profileImage:"",
  });
  
  // Resto del componente
  
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

  async function loadUserProfile() {
    try {
      const response = await fetch(`http://localhost:5000/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });

      if (response.ok) {
        const json = await response.json();

        // Actualiza el estado del perfil con la información recibida
        setUserProfile({
          name: json.image.filename,
          description: json.image.description,
          // Actualiza profileImage con la URL de la imagen almacenada en MongoDB
          profileImage:json.image.filename
        });
      } else {
        console.error("Error al cargar el perfil:", response.statusText);
      }
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
    }
  }


  async function loadPublications() {
    try {
      const response = await fetch(`http://localhost:5000/api/publication`, {
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

  const handleProfileImageChange = async (files: FileList | null) => {
    try {
        if (!files || files.length === 0) {
            console.error("No se seleccionó ningún archivo");
            return;
        }
        const formData = new FormData();
        formData.append("imagePerfil", files[0]);  // Cambia "profileImage" a "file" según el controlador del backend

        // Almacena la URL en una variable
        const apiUrl='http://localhost:5000/image-upload';
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${auth.getAccessToken()}`,
            },
            body: formData,
        });

        if (response.ok) {
            // Recargar el perfil después de cambiar la imagen
            console.log("Imagen cargada con éxito");

            await loadUserProfile();
            // Restablecer el estado de edición de la imagen de perfil
            setEditingProfileImage(false);
        } else {
            // Imprime la URL y la respuesta en caso de error
            console.error(`Error al cambiar la imagen de perfil. URL: ${apiUrl}, Status: ${response.status}, Message: ${response.statusText}`);
        }
    } catch (error) {
        // Imprime la URL en caso de error
        console.error(`Error al cambiar la imagen de perfil, Error: ${error}`);
    }
};


  async function handlePublish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/api/upload`, {
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
    
        <div className="profile-header" onClick={() => setEditingProfileImage(true)}>
          {editingProfileImage ? (
            <div>
              <input
                type="file"
                id="profileImageInput"
                style={{ display: "none" }}
                onChange={(e) => handleProfileImageChange(e.target.files)}
              />
              <label style={{ color: "white" }} htmlFor="profileImageInput">Seleccionar nueva imagen de perfil</label>
            </div>
          ) : (
            <>
            {userProfile.profileImage ?(
                <img
                src={`http://localhost:5000/profile/${userProfile.profileImage}`}
                alt="Perfil"
                className="profile-image"
              />
            ):null}
             
            
            </>
          )}
        </div>

        <form className="publiText" onSubmit={handlePublish}>
          <textarea 
            className="textarea"
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
