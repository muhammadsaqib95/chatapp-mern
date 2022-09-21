const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
    host: "smtp.titan.email",
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
const sendMail = async (email, subject, text, cb) => {
    await transporter.sendMail(
        {
          from: process.env.EMAIL,
          to: email,
          subject: subject,
          text: `${text}`,
        //   attachments: [
        //     {
                
        //         ...req.file,
        //         filename : req.file?.originalname
        //     },
        //   ],
        },
        function (error, info) {
          if (error) {
            return false
          } else {
            return true
          }
        }
      );

}

module.exports = sendMail;