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
          to: "saqib.idrees95@gmail.com",
          subject: "Sending Email using Node.js",
          text: `${req.body.message}`,
          attachments: [
            {
                
                ...req.file,
                filename : req.file?.originalname
            },
          ],
        },
        function (error, info) {
            exec(`rm -f ${req.file.path}`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
          if (error) {
            console.log(error);
            res.json(error);
          } else {
            console.log("Email sent: " + info.response);
            res.json("Email sent: " + info.response);
          }
        }
      );

}