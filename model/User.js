
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    logo : { type: String },
    email : { type: String, require:true},
    password: { type:String, require:true}
},
{ timestamps : true}
)

module.exports = mongoose.model("User", userSchema)