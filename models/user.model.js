import mongoose from "mongoose";
import { mailSend } from "../config/configMail.js";

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    studentId:{
        type:String,
        trim:true,
        validate: {
            validator: function(studentId) {
                // Check if studentId is required based on the role being "Student"
                return !(this.role === "Student" && !studentId);
            },
        }
    },
    teacherId:{
        type:String,
        trim:true,
        validate: {
            validator: function(teacherId) {
                // Check if teacherId is required based on the role being "Teacher"
                return !(this.role === "Teacher" && !teacherId);
            },
        }
    },
    password:{
        type:String,
        min:[6,"Minimun 6 character"],
        max:12,
        required:true,
       
    },
    dept:{
        type:String,
        require:true,
        enum:["CSE","LAW","BANGLA","BBA","NAVAL","CIVIL","MECHANICAL","EEE"],
    },
    role:{
        type:String,
        enum:["Admin","Student","Teacher"],
    }
});

userSchema.index({email:1},{unique:true});
userSchema.index({studentId:1},{sparse:true});
userSchema.index({teacherId:1},{sparse:true});
// send mail successfully register
userSchema.post("save",mailSend);

export const userModel = mongoose.model("User",userSchema);