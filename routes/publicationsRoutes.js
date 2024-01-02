// routes.js (o tu archivo de rutas)
const express = require('express');
const router = express.Router();
const authenticate = require("../auth/authenticate");
const { Publication } = require('../schema/publicationShema'); // Importa el modelo de publicación

// Obtener todas las publicaciones
router.get('/publications', authenticate, async (req, res) => {
  try {
    const publications = await Publication.find();
    res.json(publications);
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear una nueva publicación
router.post('/publications', authenticate, async (req, res) => {
  const { contenido, url } = req.body;

  try {
    const newPublication = new Publication({
      contenido,
      url,
      reactions: { comments: [], share: [], like: [] },
    });

    const savedPublication = await newPublication.save();
    res.json(savedPublication);
  } catch (error) {
    console.error('Error al crear una nueva publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
