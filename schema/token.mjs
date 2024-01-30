import Mongoose from"mongoose";

const TokenSchema = new Mongoose.Schema({
    id: {type: Object},
    token: {type: String, required: true}
});

export default Mongoose.model("Token", TokenSchema);