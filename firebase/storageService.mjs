// storageService.js
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 } from "uuid";
import app from "./firebaseConfig.mjs";
 const storage = getStorage(app);

 async function uploadFile(file) {
  const storageRef = ref(storage, v4());

  try {
    // Subir la imagen
    const snapshot = await uploadBytes(storageRef, file);

    // Obtener la URL de descarga de la imagen
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log("URL de descarga:", downloadURL);

    // Puedes devolver la URL si la necesitas en otro lugar
    return downloadURL;
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    throw error;
  }
}
export { uploadFile };