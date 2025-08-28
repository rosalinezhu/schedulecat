import React, { useState } from 'react';
import './AuthForm.css';
import { login } from '../../api/auth';

export default function LoginForm({ onLogin, successMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const result = await login({ email, password });
    if (result.token) {
      localStorage.setItem('token', result.token);
      if (result.name) {
        localStorage.setItem('name', result.name);
      }
      if (result.role) {
        localStorage.setItem('role', result.role);
      }
      onLogin && onLogin(result.token);
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>🐱 ScheduleCat</h1>
      </header>
      <div className="card">
        <h2>Login</h2>
        {successMessage && <div style={{ color: 'green', marginBottom: 12 }}>{successMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn">Login</button>
          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}