
export const sendPublications = async (file, Hola) => {
  try {
    const formData = new FormData();
    formData.append('publication', file); // Agregar el archivo al objeto FormData
    formData.append('Hola', Hola); // Agregar el texto al objeto FormData
    console.log(formData.get('miArchivo'));
    console.log(formData.get('Hola'));

    const response = await instance.post("/publications", formData);
    console.log(file);
    return response;
  } catch (error) {
    console.log(error);
  }
}

export const getPublications = async () => {
  try {
    const response = await instance.get('/getPublications');
    console.log(response);
    return response
  } catch (error) {
    console.log(error);
  }
}

const deleteStories = async () => {
  try {
    const response = await instance.put('/deleteStories')
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}

export const reactionLike = async (reaction, link) => {
  try {
    const response = await instance.post('/reactionLike', reaction)
    return response
  } catch (error) {
    console.log(error);
  }
}

export const getAllPublications = async () => {
  try {
    const response = await instance.get('/getAllPublications');
    return response;
  } catch (error) {
    console.log(error);
  }
}
