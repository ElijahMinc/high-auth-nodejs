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
   async sendMailWithActivationLink(to, activationLink){
      
    await this.transporter.sendMail({
         from: process.env.SMTP_USER, // sender address
         to, // list of receivers
         text: "", // plain text body
         html: `
            <div>
               <h1>Verify your account</h1>
               <a target="_blank" href=${activationLink}>${activationLink}</a>
            </div>

         
         `, // html body
       });

   }

   async sendMailForForgotPassword(to, resetPasswordLink){
      
      await this.transporter.sendMail({
           from: process.env.SMTP_USER, // sender address
           to, // list of receivers
           text: "", // plain text body
           html: `
              <div>
                 <h1>Message from ${process.env.API_URL}</h1>
                 Link for reset password: 
                 <a target="_blank" href=${resetPasswordLink}>
                  ${resetPasswordLink}
                  </a>
              </div>
  
           
           `, // html body
         });
  
     }
}

module.exports = new MailService