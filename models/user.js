const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

userSchema.plugin(passportLocalMongoose);
//this will add on to the schema a username, a field for password, make sure those usernames are unique, also some additonal methods that we could use. 


const User = mongoose.model('User', userSchema);

module.exports = User;