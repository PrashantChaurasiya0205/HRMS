'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function WelcomeMessage() {
  const [user, setUser] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Check if user just logged in and hasn't seen welcome message
    if (user && !hasShownWelcome) {
      const welcomeShown = localStorage.getItem('welcomeShown');
      if (!welcomeShown) {
        setShowWelcome(true);
        // Mark as shown for this session
        localStorage.setItem('welcomeShown', 'true');
        setHasShownWelcome(true);
        
        // Auto-hide after 3 seconds
        const timer = setTimeout(() => {
          setShowWelcome(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, hasShownWelcome]);

  // Close message when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowWelcome(false);
      }
    };

    if (showWelcome) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWelcome]);

  const handleClose = () => {
    setShowWelcome(false);
  };

  if (!showWelcome || !user) {
    return null;
  }

  const userName = user.firstName || user.email?.split('@')[0] || 'User';
  const userRole = user.role;
  
  const getWelcomeMessage = () => {
    if (userRole === 'manager') {
      return {
        title: 'Welcome Manager! 👨‍💼',
        message: 'You have full administrative access to the system.'
      };
    } else if (userRole === 'CEO') {
      return {
        title: 'Welcome CEO! 👑',
        message: 'You have full administrative access to the system.'
      };
    } else if (userRole === 'Co-founder') {
      return {
        title: 'Welcome Co-founder! 🚀',
        message: 'You have full administrative access to the system.'
      };
    }
    return {
      title: `Welcome, ${userName}! 👋`,
      message: 'You\'ve successfully logged in. Ready to track your attendance?'
    };
  };

  const welcomeData = getWelcomeMessage();

  return (
    <div 
      ref={messageRef}
      className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300 cursor-pointer"
      onClick={handleClose}
    >
      <div className="bg-white rounded-lg shadow-lg border border-green-200 p-4 max-w-sm hover:shadow-xl transition-shadow">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {welcomeData.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {welcomeData.message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
