module.exports = class UserDto{
   constructor(model){
      this.id = model._id || model.id || undefined
      this.email = model.email
      this.password = model.password
   }
}