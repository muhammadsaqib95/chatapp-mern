const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {type : String, requird: true, unqiue: true, trim: true},
    password: {type: String, required: true, trim: true},
    displayName: {type: String, required: true, trim: true},
    isOnline : {type: Boolean, default: false},
},
{
    timestamps: true,
})

const User = mongoose.model("User", userSchema);

module.exports = User;