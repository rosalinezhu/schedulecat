import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage({ onAuth }) {
  const [showRegister, setShowRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      {showRegister ? (
        <>
          <RegisterForm onRegister={() => {
            setRegisterSuccess('Registration successful! You can now log in.');
            setShowRegister(false);
          }} />
          <p style={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setShowRegister(false)}
              style={{
                color: 'blue',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              Log in here
            </button>
          </p>
        </>
      ) : (
        <>
          <LoginForm onLogin={ onAuth } successMessage={registerSuccess} />
          <p style={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => { setShowRegister(true); setRegisterSuccess(''); }}
              style={{
                color: 'blue',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              Click here to create one
            </button>
          </p>
        </>
      )}
    </div>
  );
}