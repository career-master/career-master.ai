'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [quizTopicsOpen, setQuizTopicsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const coursesRef = useRef<HTMLDivElement>(null);
  const quizTopicsRef = useRef<HTMLDivElement>(null);

  const studentCategories = [
    { label: 'Class 3 to 10 (K-12 School Students)', href: '/courses/k12' },
    { label: 'Intermediate / Higher Secondary / 10+2', href: '/courses/intermediate' },
    { label: 'Degree (UG Students – Arts, Science, Commerce)', href: '/courses/degree' },
    { label: 'Engineering (All Branches)', href: '/courses/engineering' },
    { label: 'Medicine (MBBS & Paramedical)', href: '/courses/medicine' },
    { label: 'Post Graduate (PG – M.Tech, MBA, MSc, MA, etc.)', href: '/courses/postgraduate' },
    { label: 'PhD & Research Scholars', href: '/courses/phd' },
  ];

  const quizTopics = [
    { label: 'Subject-Based Academics', href: '/quiz/subject-academics' },
    { label: 'Olympiads (SOF, IMO, NSO, Cyber, NTSE, etc.)', href: '/quiz/olympiads' },
    { label: 'Aptitude (Quantitative, Logical, DI)', href: '/quiz/aptitude' },
    { label: 'Reasoning (Analytical, Verbal & Non-Verbal)', href: '/quiz/reasoning' },
    { label: 'Soft Skills (Vocabulary, Communication, Grammar)', href: '/quiz/soft-skills' },
    { label: 'Competitive Exams (GATE, CAT, EAMCET, UPSC, SSC, NEET, JEE, GRE, IELTS, etc.)', href: '/quiz/competitive-exams' },
    { label: 'Computer & Technology', href: '/quiz/computer-technology' },
    { label: 'General Knowledge & Current Affairs', href: '/quiz/gk-current-affairs' },
    { label: 'Career Skills (Resume, Interview, Etiquette, Corporate Skills)', href: '/quiz/career-skills' },
    { label: 'Cultural, Arts, Heritage, Festivals & Traditions', href: '/quiz/cultural-arts' },
    { label: 'Interview & Placement Preparation', href: '/quiz/interview-placement' },
  ];

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#projects', label: 'Projects' },
    { href: '#roadmap', label: 'Roadmap' },
    { href: '#certificates', label: 'Certificates' },
    { href: '#target-audience', label: 'Who Can Use' },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (coursesRef.current && !coursesRef.current.contains(event.target as Node)) {
        setCoursesOpen(false);
      }
      if (quizTopicsRef.current && !quizTopicsRef.current.contains(event.target as Node)) {
        setQuizTopicsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-[#010626] z-50 border-b border-white/10 fixed top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem]">
          {/* Left side: Logo */}
          <div className="flex items-center -ml-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">Career Master</span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex space-x-8 ml-24">
              {/* Courses Dropdown */}
              <div className="relative" ref={coursesRef}>
                <button
                  onClick={() => {
                    setCoursesOpen(!coursesOpen);
                    setQuizTopicsOpen(false);
                  }}
                  className="text-base font-medium transition-colors duration-200 flex items-center text-white/90 hover:text-white"
                >
                  Courses
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform ${coursesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {coursesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                    {studentCategories.map((category, idx) => (
                      <Link
                        key={idx}
                        href={category.href}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#667eea] hover:text-white transition-colors"
                        onClick={() => setCoursesOpen(false)}
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quiz Topics Dropdown */}
              <div className="relative" ref={quizTopicsRef}>
                <button
                  onClick={() => {
                    setQuizTopicsOpen(!quizTopicsOpen);
                    setCoursesOpen(false);
                  }}
                  className="text-base font-medium transition-colors duration-200 flex items-center text-white/90 hover:text-white"
                >
                  Quiz Topics
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform ${quizTopicsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {quizTopicsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                    {quizTopics.map((topic, idx) => (
                      <Link
                        key={idx}
                        href={topic.href}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#667eea] hover:text-white transition-colors"
                        onClick={() => setQuizTopicsOpen(false)}
                      >
                        {topic.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium transition-colors duration-200 flex items-center ${
                    pathname === link.href ? 'text-white' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Sign In Button */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center px-5 py-1.5 bg-[#010626] border border-[#010626] hover:border-[#667eea]/30 transition-all duration-200 group"
              >
                <span className="text-[#667eea] font-medium text-sm group-hover:text-[#764ba2]">
                  Dashboard
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-5 py-1.5 bg-[#010626] border border-[#010626] hover:border-[#667eea]/30 transition-all duration-200 group"
              >
                <svg
                  className="h-4 w-4 text-[#667eea] mr-2 group-hover:text-[#764ba2]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-[#667eea] font-medium text-sm group-hover:text-[#764ba2]">
                  Sign In
                </span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/80 hover:bg-[#0a1854] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#0a1854] shadow-lg">
          {/* Mobile Courses Dropdown */}
          <div>
            <button
              onClick={() => setCoursesOpen(!coursesOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-white hover:bg-[#131f6b]"
            >
              Courses
              <svg
                className={`h-4 w-4 transition-transform ${coursesOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {coursesOpen && (
              <div className="pl-4 mt-1 space-y-1">
                {studentCategories.map((category, idx) => (
                  <Link
                    key={idx}
                    href={category.href}
                    className="block px-3 py-2 rounded-md text-sm text-white/80 hover:text-white hover:bg-[#131f6b]"
                    onClick={() => {
                      setIsOpen(false);
                      setCoursesOpen(false);
                    }}
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Quiz Topics Dropdown */}
          <div>
            <button
              onClick={() => setQuizTopicsOpen(!quizTopicsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-white hover:bg-[#131f6b]"
            >
              Quiz Topics
              <svg
                className={`h-4 w-4 transition-transform ${quizTopicsOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {quizTopicsOpen && (
              <div className="pl-4 mt-1 space-y-1">
                {quizTopics.map((topic, idx) => (
                  <Link
                    key={idx}
                    href={topic.href}
                    className="block px-3 py-2 rounded-md text-sm text-white/80 hover:text-white hover:bg-[#131f6b]"
                    onClick={() => {
                      setIsOpen(false);
                      setQuizTopicsOpen(false);
                    }}
                  >
                    {topic.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.href
                  ? 'text-white bg-[#131f6b]'
                  : 'text-white/90 hover:text-white hover:bg-[#131f6b]'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 px-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center px-4 py-2 bg-[#010626] border border-[#010626] hover:border-[#667eea]/30 transition-all duration-200 w-full group"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-[#667eea] font-medium text-sm group-hover:text-[#764ba2]">
                  Dashboard
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center px-4 py-2 bg-[#010626] border border-[#010626] hover:border-[#667eea]/30 transition-all duration-200 w-full group"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="h-4 w-4 text-[#667eea] mr-2 group-hover:text-[#764ba2]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-[#667eea] font-medium text-sm group-hover:text-[#764ba2]">
                  Sign In
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

