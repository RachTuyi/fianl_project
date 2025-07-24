const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { sendLoginLink, transporter } = require('./emailService'); // ✅ Import both

const app = express();
app.use(bodyParser.json());
app.use(cors());

const users = [];      // In-memory user store
const tokens = {};     // token → email mapping
const resetTokens = {}; // token → email

// 🔐 Registration
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).send({ error: 'Email already registered' });
  }

  users.push({ email, password, verified: false });
  const token = uuidv4();
  tokens[token] = email;

  sendLoginLink(email, token)
    .then(() => res.send({ message: 'Login link sent to email' }))
    .catch(() => res.status(500).send({ error: 'Failed to send email' }));
});

// ✅ Email verification
app.post('/api/verify', (req, res) => {
  const { token } = req.body;
  const email = tokens[token];
  if (!email) return res.status(400).send({ error: 'Invalid or expired token' });

  const user = users.find(u => u.email === email);
  user.verified = true;
  delete tokens[token];

  res.send({ email });
});

// 🔑 Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).send({ error: 'Invalid email or password' });
  }

  if (!user.verified) {
    return res.status(403).send({ error: 'Please verify your email before logging in' });
  }

  res.send({ email });
});

// 🔁 Forgot Password
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).send({ error: 'Email not registered' });

  const token = uuidv4();
  resetTokens[token] = email;

  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  transporter.sendMail({
    from: '"Phishing Detector" <paccymaker@gmail.com>',
    to: email,
    subject: 'Password Reset',
    html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
  })
    .then(() => res.send({ message: 'Reset link sent' }))
    .catch((err) => {
      console.error('❌ Email send failed:', err);
      res.status(500).send({ error: 'Failed to send email' });
    });
});

// 🔒 Reset Password
app.post('/api/reset-password', (req, res) => {
  const { token, password } = req.body;
  const email = resetTokens[token];
  if (!email) return res.status(400).send({ error: 'Invalid or expired token' });

  const user = users.find(u => u.email === email);
  user.password = password;
  delete resetTokens[token];
  res.send({ message: 'Password updated' });
});

app.listen(3001, () => console.log('✅ Backend running on http://localhost:3001'));