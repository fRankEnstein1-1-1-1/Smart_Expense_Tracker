import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import Alert from '../src/components/Alert';
import { SparklesIcon, ArrowRightIcon } from '../src/components/Icons';
import './Signup.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      navigate('/home');
    } catch (error) {
      setErrorMessage(
        error.message ||
        error.response?.data?.message ||
        'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-wordmark">
            <SparklesIcon size={14} />
            <span>Smart Expense Tracker</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Get started with automated bill expense tracking</p>
        </div>

        {errorMessage && (
          <Alert variant="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            id="signup-name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

          <Input
            id="signup-email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            id="signup-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            allowTogglePassword
            autoComplete="new-password"
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
              {loading ? 'Creating Account…' : 'Create Account'}
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;