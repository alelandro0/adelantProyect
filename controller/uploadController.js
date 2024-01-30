const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { v4 } = require('uuid');
const { storage } = require('../config/firebase');

const uploadFile = async (req, res) => {
  try {
    const { file } = req.files;

    const storageRef = ref(storage, v4());
    const snapshot = await uploadBytes(storageRef, file.data);
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('URL de descarga:', downloadURL);

    res.json({ downloadURL });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
};

module.exports = { uploadFile };
