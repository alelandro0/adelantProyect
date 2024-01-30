import React, { useEffect, useState } from "react";
import { useAuth } from "../Autenticacion/AutProvider";
import PortalLayout from "../layout/PortalLayout";
import "./dashboard.css";
import  {uploadFile}  from '../../../firebase/storageService.mjs';


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
  const [editingProfileImage, setEditingProfileImage] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    description: "",
    profileImage: "",
  });

  const [publications, setPublications] = useState<Publication[]>([]);
  const [newPublication, setNewPublication] = useState({
    contenido: "",
    url: "",
  });
  const auth = useAuth();

  useEffect(() => {
    loadPublications(); // Eliminamos la carga del perfil al inicio
  }, []);

  async function handleProfileImageChange(files: FileList | null) {
    try {
      if (!files || files.length === 0) {
        console.error("No se seleccionó ningún archivo");
        return;
      }

      const file = files[0];
      const downloadURL = await uploadFile(file);

      setImageUrl(downloadURL);
      setUserProfile({
        ...userProfile,
        profileImage: downloadURL,
      });

      try {
        const apiUrl = 'http://localhost:5000/api/upload';
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ downloadURL, updateProfile: true }),
        });

        if (response.ok) {
          console.log("Imagen cargada con éxito");
          setEditingProfileImage(false);
        } else {
          console.error(`Error al cambiar la imagen de perfil. URL: ${apiUrl}, Status: ${response.status}, Message: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error al cambiar la imagen de perfil, Error: ${error}`);
      }
    } catch (error) {
      console.error(`Error al cambiar la imagen de perfil, Error: ${error}`);
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
  // ...

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
        await loadPublications();
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
              {userProfile.profileImage ? (
                <img
                  src={`${userProfile.profileImage}`}
                  alt="Perfil"
                  className="profile-image"
                />
              ) : null}
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
