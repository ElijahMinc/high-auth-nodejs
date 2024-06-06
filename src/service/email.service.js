const nodemailer = require('nodemailer')

class MailService {
   constructor(){
      this.transporter = nodemailer.createTransport({
         host: process.env.SMTP_HOST,
         port: process.env.SMTP_PORT,
         secure: false, // true for 465, false for other ports
           auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
         }
       });
   }
   async sendMail(to, activationLink){
      
    await this.transporter.sendMail({
         from: process.env.SMTP_USER, // sender address
         to, // list of receivers
         text: "", // plain text body
         html: `
            <div>
               <h1>Подтвердите свой аккаунт ${process.env.API_URL}</h1>
               <a target="_blank" href=${activationLink}>${activationLink}</a>
            </div>

         
         `, // html body
       });

   }
}

module.exports = new MailService