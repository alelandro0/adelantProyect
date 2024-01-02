const mongoose=require('mongoose')

const imageSchema = new mongoose.Schema({
    filename: String,
    img:{
     data:Buffer,
     contentType: String
    },
    createdAt: {
      type: Date,
      default: Date.now
  }
  });
  imageSchema.methods.toJSON = function () {
    const imageObject = this.toObject();
    return { filename: imageObject.filename };
  };
  const Image = mongoose.model('Image', imageSchema);
  module.exports = Image