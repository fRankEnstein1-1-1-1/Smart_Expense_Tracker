import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import Alert from '../src/components/Alert';
import { SparklesIcon, ArrowRightIcon } from '../src/components/Icons';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/home');
    } catch (error) {
      setErrorMessage(
        error.message ||
        error.response?.data?.message ||
        'Unable to log in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-wordmark">
            <SparklesIcon size={14} />
            <span>Smart Expense Tracker</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to access your bill insights &amp; history</p>
        </div>

        {errorMessage && (
          <Alert variant="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            allowTogglePassword
            autoComplete="current-password"
          />

          <div className="auth-submit-btn">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              block
              loading={loading}
              icon={!loading && <ArrowRightIcon size={16} />}
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/sign" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;