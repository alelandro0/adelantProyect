const { initializeApp }= require("firebase/app") ;
const { getStorage, ref, uploadBytes, getDownloadURL }= require( 'firebase/storage');
const { v4 }= require("uuid");

const firebaseConfig = {
    apiKey: "AIzaSyAPjmZ5uhcJZmz6SOHeKlR5wFJ8Hi-YTak",
    authDomain: "react-firebase-upload-480ee.firebaseapp.com",
    projectId: "react-firebase-upload-480ee",
    storageBucket: "react-firebase-upload-480ee.appspot.com",
    messagingSenderId: "511568324759",
    appId: "1:511568324759:web:2af11ba6160ef9d8c921d2"
};

const app = initializeApp(firebaseConfig);
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
module.exports = {
  storage,
  uploadFile
};