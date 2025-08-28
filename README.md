# 🐱 ScheduleCat

A modern web application designed to simplify shift scheduling and availability management for volunteer organizations, animal shelters, and small teams.

## ✨ Features

### 🔐 User Management
- **User Authentication**: Secure login and registration system
- **Role-based Access**: Admin and regular user roles with different permissions
- **Profile Management**: User profiles with name and contact information

### 📅 Shift Management
- **Regular Shifts**: Create recurring weekly shifts (e.g., daily morning/evening shifts)
- **Special Events**: Schedule one-time events and special shifts
- **Flexible Scheduling**: Customizable shift times and durations
- **Week-ahead Planning**: Configure how many weeks in advance users can sign up

### 👥 Availability Tracking
- **Individual Availability**: Users can mark their availability for specific shifts
- **Group Overview**: Admins can see who's available for each shift at a glance
- **Visual Calendar**: Interactive calendar interface for easy shift management
- **Real-time Updates**: Changes reflect immediately across all users

### 📧 Email Notifications
- **Weekly Summaries**: Automated weekly schedule summaries via SendGrid
- **Customizable Timing**: Users can choose when to receive notifications
- **Test Email Feature**: Verify email setup with test messages
- **Service Status**: Monitor email system health and scheduler status

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   │   ├── AuthPage.js
│   │   ├── LoginForm.js
│   │   ├── RegisterForm.js
│   │   └── AuthForm.css
│   ├── schedule/       # Schedule-related components
│   │   ├── ShiftAvailability.js
│   │   └── GroupAvailability.js
│   ├── admin/          # Admin-only components
│   │   ├── AdminSettings.js
│   │   └── ShiftManager.js
│   └── shared/         # Reusable components
│       ├── CalendarTemplate.js
│       ├── NotificationSettings.js
│       ├── NotificationSettings.css
│       └── custom-group-calendar.css
├── api/                # API communication layer
│   ├── auth.js
│   ├── availability.js
│   ├── notifications.js
│   └── settings.js
├── utils/              # Utility functions
│   └── shiftGenerator.js
└── App.js              # Main application component
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd schedulecat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Backend Setup
This frontend requires a backend server running on `http://localhost:5000`. The backend should provide:
- User authentication endpoints
- Shift management APIs
- Availability tracking
- Email notification services

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Email Setup
For email notifications, configure SendGrid in your backend:
- `SENDGRID_API_KEY`: Your SendGrid API key
- `SENDER_EMAIL`: Verified sender email address

## 📱 Usage

### For Regular Users
1. **Register/Login**: Create an account or log in
2. **View Shifts**: See available shifts in the calendar view
3. **Mark Availability**: Click on shifts to indicate your availability
4. **Email Settings**: Configure notification preferences
5. **Weekly Updates**: Receive automated schedule summaries

### For Administrators
1. **Shift Management**: Create and manage regular shifts and special events
2. **Group Overview**: Monitor team availability across all shifts
3. **Settings**: Configure calendar settings and availability windows
4. **Email System**: Manage notification settings and test email delivery

## 🛠️ Built With

- **React 18** - Frontend framework
- **JavaScript ES6+** - Programming language
- **CSS3** - Styling and responsive design
- **FullCalendar** - Calendar component library
- **Date-fns** - Date manipulation utilities

## 📋 Key Components

- **CalendarTemplate**: Reusable calendar component with shift display
- **ShiftAvailability**: Individual user availability management
- **GroupAvailability**: Admin view of team-wide availability
- **ShiftManager**: Admin tool for creating and managing shifts
- **NotificationSettings**: Email preference management

## 🤝 Contributing

This project is designed for volunteer organizations and welcomes contributions to improve scheduling efficiency for animal shelters and similar organizations.

## 📄 License

This project is private and intended for specific organizational use.

---

*Making volunteer scheduling as smooth as a cat's purr* 🐱
