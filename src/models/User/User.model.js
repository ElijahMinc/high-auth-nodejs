const { Schema, model } = require('mongoose');


const User = new Schema({
   email: {
      type: String,
      unique: true,
      require: true,
   },
   password: {
      type: String,
      unique: true,
      require: true
   },
   isActivated: {
      type: Boolean,
      default: false
   },
   activationLink: {
      type: String,

   }
})


module.exports = model('User', User)