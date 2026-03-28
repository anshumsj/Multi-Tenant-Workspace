const transporter = require('../config/mailer');

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <p>Your OTP code is:</p>
      <h2>${otp}</h2>
      <p>This code expires in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };