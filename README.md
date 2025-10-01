# 🕐 Attendance Monitor

A modern, responsive attendance tracking system built with Next.js 14, TypeScript, and Tailwind CSS. Track your work hours, lunch breaks, and generate detailed reports with ease.

## ✨ Features

### Core Functionality
- **🕐 Clock In/Out** - One-click attendance tracking with current date and time
- **🍽️ Lunch Break Tracking** - Start and end lunch breaks with automatic duration calculation
- **⏱️ Working Hours Calculation** - Automatic calculation of total working hours (excluding lunch breaks)
- **📊 Real-time Clock** - Live time display with session duration tracking

### Data Management
- **💾 Local Storage** - All data stored locally in your browser
- **📈 Statistics Dashboard** - View daily, weekly, and monthly statistics
- **📋 Attendance Log** - Complete history with search and filtering
- **📤 Export Functionality** - Export data to CSV format

### User Experience
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **🎨 Modern UI** - Clean, intuitive interface with smooth animations
- **⚡ Real-time Updates** - Live updates without page refresh
- **🔍 Search & Filter** - Find specific records quickly

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context + useReducer
- **Storage**: Local Storage

## 📱 Usage

### Basic Workflow

1. **Clock In** - Click "Clock In" to start your work day
2. **Start Lunch** - Click "Start Lunch" when taking a break
3. **End Lunch** - Click "End Lunch" when returning from break
4. **Clock Out** - Click "Clock Out" to end your work day

### Features Overview

#### Dashboard
- Real-time clock display
- Current session status
- Session duration timer
- Working hours for the day

#### Statistics
- Total hours worked
- This week/month summaries
- Average daily hours
- Working days count
- Progress towards daily target

#### Attendance Log
- Complete history of all records
- Search by date or ID
- Filter by status or date range
- Export to CSV
- Detailed breakdown of each day

## 🎯 Key Components

### ClockDisplay
- Real-time clock with current date/time
- Session duration display
- Status indicators
- Working hours summary

### ActionButtons
- Dynamic buttons based on current status
- Clock In/Out functionality
- Lunch break management
- Status information

### AttendanceLog
- Tabular display of all records
- Search and filtering capabilities
- Export functionality
- Summary statistics

### Statistics
- Comprehensive analytics
- Time-based calculations
- Progress tracking
- Visual indicators

## 🔧 Configuration

### Environment Variables
No environment variables required - the app works entirely with local storage.

### Customization
- Modify time calculations in `src/utils/timeCalculations.ts`
- Update storage logic in `src/utils/storage.ts`
- Customize UI components in `src/components/`

## 📊 Data Structure

```typescript
interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  clockIn: Date;
  clockOut?: Date;
  lunchStart?: Date;
  lunchEnd?: Date;
  totalWorkingHours: number;
  lunchDuration: number; // in minutes
  status: AttendanceStatus;
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
- **Netlify**: Connect your repository and deploy
- **Railway**: Deploy with one click
- **Self-hosted**: Build and serve the static files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Date handling by [date-fns](https://date-fns.org/)

## 📞 Support

If you have any questions or need help, please:
1. Check the documentation above
2. Search existing issues
3. Create a new issue with detailed information

---

**Happy Tracking! 🎉**