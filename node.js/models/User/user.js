// models/User/user.js
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const userSchema = new Schema({
username:{
type: String,
required: true,
unique: true,
lowercase: true,
trim:true
},
password:{
type:String,
required:true
},
name:{
type:String,
required:true,
},
email: {
type: String,
lowercase: true,
trim:true
},
phone: {
type: String,
},
// roles:{
// type:String,
// enum:['User', 'Admin'],
// default:"User",
// },
birthDate: {
    type: Date,
    required: true
  },
active: {
type: Boolean,
default: true,
},
},{timestamps:true})
module.exports = mongoose.model("User", userSchema)