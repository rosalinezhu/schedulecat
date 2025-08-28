import React, { useState } from 'react';
import { register } from '../../api/auth';

export default function RegisterForm({ onRegister }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const result = await register({ firstName, lastName, email, password });
    if (result.message === 'User registered successfully') {
      setSuccess('Registration successful! You can now log in.');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirm('');
      onRegister && onRegister();
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="container">
    <header className="app-header">
          <h1>🐱 ScheduleCat</h1>
        </header>
    <div className="card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
        <div className="input-group">
            <label htmlFor="firstName">First Name:</label>
            <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
            />
        </div>
        <div className="input-group">
            <label htmlFor="lastName">Last Name:</label>
            <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
            />
        </div>
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
        <div className="input-group">
            <label htmlFor="confirm">Confirm Password:</label>
            <input
                type="password"
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm your password"
            />
        </div>
        <button type="submit" className="btn">Register</button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
        </form>
    </div>
    </div>
    
  );
}