'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Menubar() {
  const [isOpen, setIsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [testByClassOpen, setTestByClassOpen] = useState(false);
  const [testByDomainOpen, setTestByDomainOpen] = useState(false);
  const [typeOfTestOpen, setTypeOfTestOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isAuthenticated, user, googleSignIn } = useAuth();
  const [signInLoading, setSignInLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setSignInLoading(true);
    try {
      await googleSignIn();
    } catch (error) {
      console.error('Google sign in failed:', error);
    } finally {
      setSignInLoading(false);
    }
  };
  const aboutRef = useRef<HTMLDivElement>(null);
  const testByClassRef = useRef<HTMLDivElement>(null);
  const testByDomainRef = useRef<HTMLDivElement>(null);
  const typeOfTestRef = useRef<HTMLDivElement>(null);

  // Dark mode toggle
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(event.target as Node)) {
        setAboutOpen(false);
      }
      if (testByClassRef.current && !testByClassRef.current.contains(event.target as Node)) {
        setTestByClassOpen(false);
      }
      if (testByDomainRef.current && !testByDomainRef.current.contains(event.target as Node)) {
        setTestByDomainOpen(false);
      }
      if (typeOfTestRef.current && !typeOfTestRef.current.contains(event.target as Node)) {
        setTypeOfTestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const aboutOptions = [
    { label: 'Vision', href: '#vision' },
    { label: 'Mission', href: '#mission' },
    { label: 'Why We?', href: '#why-we' },
  ];

  const testByClassOptions = [
    { label: 'Class 3-10', href: '/tests/class-3-10' },
    { label: '10+2', href: '/tests/10-plus-2' },
    { label: 'Degree', href: '/tests/degree' },
    { label: 'PG', href: '/tests/pg' },
    { label: 'Ph.D', href: '/tests/phd' },
  ];

  const testByDomainOptions = [
    { label: 'Kids Olympiads', href: '/tests/kids-olympiads' },
    { label: 'Govt. Exams', href: '/tests/govt-exams' },
    { label: 'Entrance Exams', href: '/tests/entrance-exams' },
    { label: 'Computer Technology', href: '/tests/computers' },
    { label: 'Others', href: '/tests/others' },
  ];

  const typeOfTestOptions = [
    { label: 'Normal', href: '/tests/normal' },
    { label: 'Time Based', href: '/tests/time-based' },
    { label: 'AI Based', href: '/tests/ai-based' },
  ];

  return (
    <nav className="w-full bg-pink-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {/* <span className="text-2xl font-bold text-white">CAREERMASTER.AI</span> */}
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 animate-pulse-slow relative">
  CAREERMASTER.AI
  <span className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 blur-xl opacity-30"></span>
</span>


          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-white font-medium hover:text-pink-200 transition-colors">
              Home
            </Link>

            <Link href="#about" className="text-white font-medium hover:text-pink-200 transition-colors">
              About Us
            </Link>

            <Link href="#why-choose" className="text-white font-medium hover:text-pink-200 transition-colors">
              Features
            </Link>

            {/* Test by Class Dropdown */}
            <div className="relative" ref={testByClassRef} onMouseEnter={() => { setTestByClassOpen(true); setAboutOpen(false); setTestByDomainOpen(false); setTypeOfTestOpen(false); }} onMouseLeave={() => setTestByClassOpen(false)}>
              <button
                className="text-white font-medium hover:text-blue-100 transition-colors flex items-center"
              >
                Test by class
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {testByClassOpen && (
                <div className="absolute top-full left-0 pt-2 w-48 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  {testByClassOptions.map((option, idx) => (
                    <Link
                      key={idx}
                      href={option.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-300 hover:text-pink-600 transition-colors"
                      onClick={() => setTestByClassOpen(false)}
                    >
                      {option.label}
                    </Link>
                  ))}
                  </div>
                </div>
              )}
            </div>

            {/* Test by Domain Dropdown */}
            <div className="relative" ref={testByDomainRef} onMouseEnter={() => { setTestByDomainOpen(true); setAboutOpen(false); setTestByClassOpen(false); setTypeOfTestOpen(false); }} onMouseLeave={() => setTestByDomainOpen(false)}>
              <button
                className="text-white font-medium hover:text-blue-100 transition-colors flex items-center"
              >
                Test by Domain
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {testByDomainOpen && (
                <div className="absolute top-full left-0 pt-2 w-56 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  {testByDomainOptions.map((option, idx) => (
                    <Link
                      key={idx}
                      href={option.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-300 hover:text-pink-600 transition-colors"
                      onClick={() => setTestByDomainOpen(false)}
                    >
                      {option.label}
                    </Link>
                  ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="#clients" className="text-white font-medium hover:text-pink-200 transition-colors">
              Clients
            </Link>

            <Link href="#pricing" className="text-white font-medium hover:text-blue-100 transition-colors">
              Pricing Table
            </Link>
          </div>

          {/* Right: Dark Mode Toggle & Login/Register */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-white hover:bg-blue-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={signInLoading}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="whitespace-nowrap">{signInLoading ? 'Signing in...' : 'Sign in'}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-blue-800 transition-colors"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-pink-700 border-t border-pink-800">
          <div className="px-4 py-4 space-y-2">
            <Link href="/" className="block text-white font-medium py-2">Home</Link>
            <Link href="#about" className="block text-white font-medium py-2">About us</Link>
            <Link href="#why-choose" className="block text-white font-medium py-2">Features</Link>
            <Link href="#pricing" className="block text-white font-medium py-2">Pricing Table</Link>
            <div className="pt-2 border-t border-indigo-800">
              {isAuthenticated ? (
                <Link href="/dashboard" className="block text-white font-medium py-2">Dashboard</Link>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={signInLoading}
                  className="flex items-center gap-2 w-full text-white font-medium py-2 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {signInLoading ? 'Signing in...' : 'Continue with Google'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

