import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
    question:{
        type:String,
        required:true,
    },
    answer:{
        type:String,
        required:true,
    },
    "author":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }


});


export const chatModel = mongoose.model("Chat",chatSchema);