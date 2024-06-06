const { Schema, model, SchemaTypes } = require('mongoose');


const Token = new Schema({
   refreshToken: {
      type: String,
      require: true,
      default: false
   },
   userId: {
      type: SchemaTypes.ObjectId,
      ref: 'User'
   }
})


module.exports = model('Token', Token)