const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'paccymaker@gmail.com',
    pass: 'owzt apur qshs hfqr' // Your Gmail App Password
  }
});

// 🔗 Send login confirmation link
function sendLoginLink(email, token) {
  const link = `http://localhost:3000/verify?token=${token}`;
  return transporter.sendMail({
    from: '"Phishing Detector" <paccymaker@gmail.com>',
    to: email,
    subject: 'Confirm your login',
    html: `<p>Click the link below to confirm your account:</p><a href="${link}">${link}</a>`
  });
}

module.exports = {
  sendLoginLink,
  transporter // ✅ Exported for use in server.js
};