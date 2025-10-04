# Attendance Management System

A comprehensive employee attendance tracking system built with Next.js, featuring real-time clock in/out, leave management, and manager oversight capabilities.

## Core Features

### Employee Dashboard
- **Real-time Clock Display** - Current time and date tracking
- **Attendance Actions** - Clock in/out, lunch break management
- **Today's Progress** - Live working hours and status tracking
- **Statistics Overview** - Daily, weekly, and monthly attendance summaries

### Leave Management
- **Leave Request System** - Submit sick, vacation, personal, work-from-home, and emergency leave requests
- **Real-time Leave Balance** - Dynamic balance tracking for all leave types
- **Request History** - View all submitted requests with status tracking
- **Automatic Balance Updates** - Leave balances update automatically when requests are approved

### Manager Dashboard
- **Leave Approval System** - Review and approve/reject employee leave requests
- **Holiday Management** - Add, edit, and delete company holidays
- **Employee Oversight** - Monitor team attendance and leave patterns
- **Manager Comments** - Add feedback to leave decisions

### User Management
- **Automatic Profile Creation** - New users automatically get employee profiles
- **Role-based Access** - Employee and manager role differentiation
- **Profile Management** - Personal information and emergency contact management

## Technical Architecture

### Authentication
- Google OAuth integration with Gmail restriction
- JWT-based session management
- Automatic user profile creation on first login
- Role-based access control (Employee/Manager)

### Database Models
- **UserProfile** - User information, roles, and leave balances
- **Attendance** - Daily clock in/out records with lunch tracking
- **LeaveRequest** - Leave applications with approval workflow
- **Holiday** - Company holiday calendar management

### Key APIs
- `/api/attendance/*` - Clock in/out, lunch management, status tracking
- `/api/leave/*` - Leave request submission, approval, and management
- `/api/profile` - User profile management
- `/api/holidays/*` - Holiday calendar management
- `/api/admin/*` - Administrative functions

## User Roles

### Employee
- Clock in/out and lunch break management
- Submit and track leave requests
- View personal attendance history
- Manage personal profile information

### Manager
- All employee capabilities
- Approve/reject leave requests
- Manage company holidays
- View team attendance reports
- Access manager dashboard

## Leave Types
- **Sick Leave** - 10 days annually
- **Vacation Leave** - 20 days annually  
- **Personal Leave** - 5 days annually
- **Work from Home** - 12 days annually
- **Emergency Leave** - 3 days annually

## System Features
- **Real-time Updates** - Live attendance tracking
- **Automatic Calculations** - Working hours and overtime computation
- **Responsive Design** - Mobile and desktop optimized
- **Data Export** - CSV export capabilities
- **Holiday Integration** - Automatic holiday detection
- **Session Management** - Secure user sessions with role persistence