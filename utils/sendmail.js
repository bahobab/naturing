const nodemailer = require('nodemailer');

const sendMail = async options => {
  // define an MTA
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  // define email options
  console.log('>>Options', options);
  const mailOptions = {
    from: 'Koudou Kouakou <kk@kodou.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };
  // send the mail

  await transporter.sendMail(mailOptions);
};
module.exports = sendMail;
