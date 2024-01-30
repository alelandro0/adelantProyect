const mongoose=require('mongoose')

const imageSchema = new mongoose.Schema({
  userId: String,
  name: String,
  imagenPerfil: Buffer
});
  imageSchema.methods.toJSON = function () {
    const imageObject = this.toObject();
    return { filename: imageObject.filename };
  };
  const Image = mongoose.model('Image', imageSchema);
  module.exports = Image