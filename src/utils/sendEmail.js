const nodemailer = require("nodemailer")

const sendMail =async (options)=>{

    const transporter = nodemailer.createTransport({
    
            host: 'smtp.office365.com', 
           port: 587,                 
           secure: false,   
           auth: {
            user: 'classes@disenosys.com',
            pass: 'xnccsypkfhfpymwg',
          }
           });

    //   const transporter = nodemailer.createTransport({
    //         service: 'gmail',
    //         auth: {
    //             user: 'rajkumarprjpm@gmail.com',
    //             pass: 'eztbnuzrbwxocizk',
    //         }
    //     });
           
           const htmlBody = options.html || options.text || "";
           const textBody =
            options.plainText ||
            options.text ||
            (typeof htmlBody === "string"
              ? htmlBody.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
              : "");

           const mailOptions = {
            from: 'classes@disenosys.com',
            to: options.to,
            subject: options.subject,
            text: textBody,
            html: htmlBody,
        };
    
        await transporter.sendMail(mailOptions);
     };

module.exports = sendMail
