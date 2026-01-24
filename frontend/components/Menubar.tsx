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
  const { isAuthenticated, user } = useAuth();
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
    { label: 'Computers', href: '/tests/computers' },
    { label: 'Others', href: '/tests/others' },
  ];

  const typeOfTestOptions = [
    { label: 'Normal', href: '/tests/normal' },
    { label: 'Time Based', href: '/tests/time-based' },
    { label: 'AI Based', href: '/tests/ai-based' },
  ];

  return (
    <nav className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 glossy">
      <nav className="w-full bg-cyan-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xl font-bold text-white">CAREERMASTER.AI</span>
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* About Us Dropdown */}
            <div className="relative" ref={aboutRef} onMouseEnter={() => { setAboutOpen(true); setTestByClassOpen(false); setTestByDomainOpen(false); setTypeOfTestOpen(false); }} onMouseLeave={() => setAboutOpen(false)}>
              <button
                className="text-white font-medium hover:text-blue-100 transition-colors flex items-center"
              >
                About us
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {aboutOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {aboutOptions.map((option, idx) => (
                    <Link
                      key={idx}
                      href={option.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setAboutOpen(false)}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="#features" className="text-white font-medium hover:text-blue-100 transition-colors">
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
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {testByClassOptions.map((option, idx) => (
                    <Link
                      key={idx}
                      href={option.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setTestByClassOpen(false)}
                    >
                      {option.label}
                    </Link>
                  ))}
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
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {testByDomainOptions.map((option, idx) => (
                    <Link
                      key={idx}
                      href={option.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setTestByDomainOpen(false)}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Type of Test Dropdown */}
            <div className="relative" ref={typeOfTestRef} onMouseEnter={() => { setTypeOfTestOpen(true); setAboutOpen(false); setTestByClassOpen(false); setTestByDomainOpen(false); }} onMouseLeave={() => setTypeOfTestOpen(false)}>
              <button
                className="text-white font-medium hover:text-blue-100 transition-colors flex items-center"
              >
                Type of Test
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {typeOfTestOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {typeOfTestOptions.map((option, idx) => (
                    <Link
                      key={idx}
                      href={option.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setTypeOfTestOpen(false)}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-white font-medium hover:text-blue-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Register
                </Link>
              </div>
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
        <div className="lg:hidden bg-indigo-700 border-t border-indigo-800">
          <div className="px-4 py-4 space-y-2">
            <Link href="#about" className="block text-white font-medium py-2">About us</Link>
            <Link href="#features" className="block text-white font-medium py-2">Features</Link>
            <Link href="#pricing" className="block text-white font-medium py-2">Pricing Table</Link>
            <div className="pt-2 border-t border-indigo-800">
              {isAuthenticated ? (
                <Link href="/dashboard" className="block text-white font-medium py-2">Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="block text-white font-medium py-2">Login</Link>
                  <Link href="/signup" className="block text-white font-medium py-2">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
    </nav>
  );
}

