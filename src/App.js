import React, { useState } from 'react';
import './App.css';
import AuthPage from './components/auth/AuthPage';
import ShiftAvailability from './components/schedule/ShiftAvailability';
import AdminSettings from './components/admin/AdminSettings';
import GroupAvailability from './components/schedule/GroupAvailability';
import NotificationSettings from './components/shared/NotificationSettings';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentTab, setCurrentTab] = useState('groupAvailability');
  const [isActive, setIsActive] = useState(false);

  if (!token) {
    return <AuthPage onAuth={ setToken } />;
  }

  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  return (
    <div className="App">
      <div className="container">
        <nav className="navbar">
  <div className="navbar-container">
    <div className="navbar-logo">🐱 ScheduleCat</div>
      <ul className="navbar-links">
        <li className={currentTab === 'groupAvailability' ? 'active' : ''}>
          <button className="navbar-btn" onClick={() => setCurrentTab('groupAvailability')}>Group Availability</button>
        </li>
        <li className={currentTab === 'shifts' ? 'active' : ''}>
          <button className="navbar-btn" onClick={() => setCurrentTab('shifts')}>My Availability</button>
        </li>
        <li className={currentTab === 'notifications' ? 'active' : ''}>
          <button className="navbar-btn" onClick={() => setCurrentTab('notifications')}>Email Settings</button>
        </li>
        {isAdmin && (
          <li className={currentTab === 'settings' ? 'active' : ''}>
            <button className="navbar-btn" onClick={() => setCurrentTab('settings')}>Admin Settings</button>
          </li>
        )}
      </ul>
    <div className="navbar-profile-group">
  <div className="navbar-profile" title="Profile">
    <span className="profile-avatar" style={{background: '#28a745', color: '#fff'}}>
      {(() => {
        const name = localStorage.getItem('name');
        if (name) {
          const parts = name.split(' ');
          return (parts[0][0] || '') + (parts[1]?.[0] || '');
        }
        return '?';
      })()}
    </span>
  </div>
  <button className="navbar-logout-btn" onClick={() => {
    localStorage.clear();
    setToken(null);
    setCurrentTab('availability');
  }}>Log out</button>
</div>
  </div>
</nav>
        {currentTab === 'groupAvailability' && (
          <GroupAvailability
            token={token}
          />
        )}
        {currentTab === 'shifts' && (
          <ShiftAvailability
            token={token}
            isActive={currentTab === 'shifts'}
          />
        )}
        {currentTab === 'notifications' && (
          <div>
            <h2>Email Notification Settings</h2>
            <NotificationSettings token={token} />
          </div>
        )}
        {currentTab === 'settings' && role === 'admin' && (
          <div>
            <AdminSettings />
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
