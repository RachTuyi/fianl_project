import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
} from 'react-router-dom';
import axios from 'axios';
import './App.css';
import logo from './rp-logo.png';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // 🔍 Log session state on load
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    console.log('🔍 App loaded. currentUser:', saved);

    // 🧹 Reset if session is missing or invalid
    if (!saved || saved === 'undefined' || saved === 'null') {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar currentUser={currentUser} setCurrentUser={setCurrentUser} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
          <Route path="/register" element={<Register setCurrentUser={setCurrentUser} />} />
           <Route path="/verify" element={<VerifyEmail setCurrentUser={setCurrentUser} />} />
           <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={currentUser ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/recent"
            element={currentUser ? <RecentChecks /> : <Navigate to="/login" replace />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

function Navbar({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const onProtectedPage = location.pathname === '/dashboard' || location.pathname === '/recent';

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');

    const protectedRoutes = ['/dashboard', '/recent'];
    const lastRoute = location.pathname;

    window.history.pushState(null, '', '/');
    window.onpopstate = () => {
      if (protectedRoutes.includes(lastRoute)) {
        navigate('/');
      }
    };

    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container brand-container">
        <div className="brand-logo">
          <img src={logo} alt="RP Logo" className="logo" />
          <Link to="/" className="brand">PHISHING DETECTOR</Link>
        </div>

        <div className="nav-links" style={{ marginLeft: '2rem' }}>
          <Link to="/">Home</Link>
          {currentUser && <Link to="/dashboard">Check site</Link>}
          {currentUser && <Link to="/recent">Recent Checks</Link>}
          {!onProtectedPage && <Link to="/about">About</Link>}
          {!onProtectedPage && <Link to="/contact">Contact</Link>}
          {!currentUser && <Link to="/login">Login</Link>}
        </div>

        {currentUser && (
          <div className="user-info">
            <span> <strong>{currentUser.email}</strong></span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

function Landing() {
  return (
    <div className="landing split-layout">
      <div className="left-side">
        <h1>Welcome to Phishing Detection Website</h1>
        <h3>Why Phishing Detection Matters 🛡️</h3>
        <p>
          Phishing is a deceptive cyberattack that tricks users into revealing personal information through fake websites.
          These attacks often mimic trusted platforms like <strong>Irembo</strong>, <strong>REB</strong>, and <strong>RRA</strong>.
        </p>
        <p>
          Our mission is to help Rwandan users and institutions stay safe online by identifying malicious links before harm is done.
        </p>
        <p>
          With our tool, you can instantly verify the safety of any website.
        </p>
        <div className="auth-buttons">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn">Register</Link>
        </div>
      </div>

      <div className="right-side">
        <img src="phish_im2.jpg" alt="Phishing Detection Illustration" className="illustration" />
        <img src="phish-image.jpg" alt="Phishing Detection Illustration" className="illustration" />
        <h3>How Our Detector Works 🔍</h3>
        <ul className="features">
          <li>✅Rule-based analysis of suspicious patterns</li>
          <li>🧠 Machine learning scoring for accuracy</li>
          <li>🔒 Whitelist of trusted .rw domains</li>
          <li>⚡ Instant feedback with risk level indicators</li>
        </ul>
      </div>
    </div>
  );
}


function Login({ setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    // 🔒 Send login request to backend
    axios
      .post('http://localhost:3001/api/login', { email, password })
      .then((res) => {
        const session = res.data; // backend sends { email }
        localStorage.setItem('currentUser', JSON.stringify(session));
        setCurrentUser(session);
        navigate('/dashboard');
      })
      .catch((err) => {
        // 🔍 Handle errors from backend
        const msg = err.response?.data?.error || 'Login failed';
        setError(msg);
      });
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <p><a href="/forgot-password">forgot your password</a></p>

        <p>
          If you don't have an account, click here to:<a href="/register"> Register</a>
        </p>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('');
    setError('');

    axios
      .post('http://localhost:3001/api/forgot-password', { email })
      .then((res) => {
        setStatus(`✅ A reset link has been sent to ${email}`);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to send reset link');
      });
  };

  return (
    <div className="auth-form">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          placeholder="Enter your registered email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>

      {status && <div className="success">{status}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}


function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = new URLSearchParams(location.search).get('token');

  const handleReset = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    axios
      .post('http://localhost:3001/api/reset-password', { token, password })
      .then(() => {
        setSuccess('✅ Password updated! You may now log in.');
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch(() => setError('❌ Reset failed. Link may be expired.'));
  };

  return (
    <div className="auth-form">
      <h2>Reset Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {success && <div className="success">{success}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true); // 👈 Start loading

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false); // Stop loading
      return;
    }

    axios
      .post('http://localhost:3001/api/register', { email, password })
      .then((res) => {
        console.log('✅ Register response:', res.data);
        setSuccess(true);
        setIsLoading(false); // Stop loading
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Registration failed');
        setIsLoading(false); // Stop loading
      });
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>

      {!success ? (
        <form onSubmit={handleRegister}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>

          {isLoading && (
            <p className="loading-message">⏳ Processing your registration. Please wait…</p>
          )}

          <p>If you don't have an account, click here to:<a href="/login"> Login</a></p>
        </form>
      ) : (
        <div className="success-message">
          <h3>✅ Registration successful!</h3>
          <p>
            We've sent a login link to <strong>{email}</strong>. Please check your inbox and click the link to confirm your account and log in.
          </p>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}



function VerifyEmail({ setCurrentUser }) {
  const location = useLocation();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');

    if (!token) {
      setError('❌ No verification token found in the URL.');
      return;
    }

    axios
      .post('http://localhost:3001/api/verify', { token })
      .then((res) => {
        localStorage.setItem('verifiedUser', JSON.stringify(res.data));
        setCurrentUser(null);

        setTimeout(() => {
          alert('✅ Email verified successfully! You can now log in.');
          navigate('/login');
        }, 2000);
      })
      .catch(() => {
        setError('❌ Verification failed. The link may be invalid or expired.');
      });
  }, [location, navigate, setCurrentUser]);

  return (
    <div className="verify-wrapper">
      <h2>🔄 Verifying your email…</h2>
      <p>Please hold tight while we confirm your account.</p>

      {error && (
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/register')}>Try Registering Again</button>
        </div>
      )}
    </div>
  );
}



function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkUrl = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a URL to check');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/check', { url });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setResult(response.data);

      const recent = JSON.parse(localStorage.getItem('recentChecks') || '[]');
      localStorage.setItem(
        'recentChecks',
        JSON.stringify([response.data, ...recent.filter(r => r.url !== response.data.url)].slice(0, 10))
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to check URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <h1>Phishing Detector</h1>
      <div className="card">
        <form onSubmit={checkUrl}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (e.g., https://example.com)"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Checking...
              </>
            ) : (
              'Check URL'
            )}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <h3>Analysis Result</h3>
            <p>
              <strong>URL:</strong>{' '}
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                {result.url}
              </a>
            </p>
            <div className={`status ${result.is_phishing ? 'phishing' : 'safe'}`}>
              {result.is_phishing ? '⚠️ PHISHING DETECTED' : '✅ SAFE WEBSITE'}
            </div>

            <div className="risk-level">
              <span>Risk Level:</span>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${Math.round(result.probability * 100)}%` }}
                >
                  {Math.round(result.probability * 100)}%
                </div>
              </div>
            </div>

            <p className="reason">
              <strong>Reason:</strong> {result.reason}
            </p>
            <p className="timestamp">
              <strong>Checked on:</strong> {result.timestamp}
            </p>

            {!result.is_phishing && (
              <div className="safe-box">
                <button onClick={() => window.open(result.url, '_blank')}>
                  Visit Website 🔗
                </button>
              </div>
            )}

            {result.is_phishing && (
              <div className="warning">
                <p>⚠️ Warning: This website appears to be a phishing attempt.</p>
                <p>🚫 Access is blocked to protect you from malicious content.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="page">
      <h2>About the Phishing Detection System</h2>
      <p>
        This responsive web application is built to help individuals and Rwandan institutions detect phishing websites.
      </p>
      <ul>
        <li><strong>Rule-based logic</strong> for immediate risks</li>
        <li><strong>ML model with 53 features</strong> for deeper prediction</li>
        <li><strong>Whitelist of trusted .rw domains</strong></li>
      </ul>
      <p>
        It’s especially useful for users accessing official portals like <strong>Irembo</strong>, <strong>REB</strong>, <strong>RRA</strong>, etc.
      </p>
      <p>
          Our mission is to help Rwandan users and institutions stay safe online by identifying malicious links before harm is done.
        </p>
    </div>
  );
}

function Contact() {
  return (
    <div className="page">
      <h2>Contact Us</h2>
      <p>If you have questions or suggestions, feel free to get in touch.</p>
      <div style={{ marginTop: '1.5rem' }}>
        <h4>📞 Phone</h4>
        <p><a href="tel:+250789246013">+250 789 246 013</a></p>
        <h4>Email</h4>
        <p><a href="mailto:rtuyi883@gmail.com">rtuyi883@gmail.com</a></p>
        <h4>Office Hours</h4>
        <p>Monday – Friday, 8:00 AM to 6:00 PM (CAT)</p>
      </div>
    </div>
  );
}


function RecentChecks() {
  const recent = JSON.parse(localStorage.getItem('recentChecks') || '[]');

  return (
    <div className="page">
      <h2>Recent Checks</h2>
      {recent.length === 0 ? (
        <p>No recent checks available.</p>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="recent-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>URL</th>
                <th>Checked On</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{
                      color: item.is_phishing ? 'red' : 'green',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.is_phishing ? 'Phishing' : 'Legitimate'}
                  </td>
                  <td style={{ wordBreak: 'break-word' }}>
                    <a href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {item.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2025 Phishing Detector. Designed by Rachel.</p>
    </footer>
  );
}

export default App;
