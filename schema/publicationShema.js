// models.js (o tu archivo donde defines los modelos)
const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  contenido: { type: String, required: true },
  url: { type: String },
  reactions: {
    comments: [String],
    share: [String],
    like: [String],
  },
});

module.exports =mongoose.model('Publication', publicationSchema);
