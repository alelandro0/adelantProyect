import Mongoose from "mongoose";

const todoSchema = new Mongoose.Schema({
    id: {type: Object},
    isUser: {type: String, require: true},
    title: {type: String, require: true},
    completed: {type: Boolean, require: true},
});

export default Mongoose.model("Todo", todoSchema);