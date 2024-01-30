// models.js (o tu archivo donde defines los modelos)
import mongoose from'mongoose';

const publicationSchema = new mongoose.Schema({
  contenido: { type: String, required: true },
  url: { type: String },
  reactions: {
    comments: [String],
    share: [String],
    like: [String],
  },
});

export const Publication = mongoose.model('Publication', publicationSchema);
