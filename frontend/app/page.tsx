'use client';

import Link from 'next/link';
import Menubar from '@/components/Menubar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [counterStats, setCounterStats] = useState({
    students: 0,
    quizzes: 0,
    domains: 0,
    courses: 0,
  });

  // Slider images with background images
  const sliderImages = [
    { 
      src: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&h=600&fit=crop', 
      alt: 'AI-Powered Learning',
      title: 'Master Your Future with AI',
      subtitle: 'Personalized learning paths tailored to your goals'
    },
    { 
      src: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1920&h=600&fit=crop', 
      alt: 'Competitive Exam Success',
      title: 'Crack Any Competitive Exam',
      subtitle: 'GATE • CAT • UPSC • JEE • NEET • SSC & More'
    },
    { 
      src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop', 
      alt: 'Collaborative Learning',
      title: 'Learn Together, Grow Together',
      subtitle: 'Join thousands of students on their learning journey'
    },
    { 
      src: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920&h=600&fit=crop', 
      alt: 'Career Success',
      title: 'Accelerate Your Career',
      subtitle: 'From academics to industry-ready skills'
    },
    { 
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=600&fit=crop', 
      alt: 'Smart Analytics',
      title: 'Track Your Progress',
      subtitle: 'Real-time analytics & performance dashboards'
    },
    { 
      src: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&h=600&fit=crop', 
      alt: 'Focused Learning',
      title: 'Stay Focused, Stay Ahead',
      subtitle: 'Dedicated practice for competitive excellence'
    },
    { 
      src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=600&fit=crop', 
      alt: 'Modern Education',
      title: 'Earn Recognized Certificates',
      subtitle: 'Showcase your expertise with Silver, Gold & Platinum badges'
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Counter animation
  useEffect(() => {
    const targets = { students: 1000, quizzes: 5000, domains: 15, courses: 1500 };
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      setCounterStats({
        students: Math.floor(targets.students * progress),
        quizzes: Math.floor(targets.quizzes * progress),
        domains: Math.floor(targets.domains * progress),
        courses: Math.floor(targets.courses * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, increment);
  }, []);

  // Latest competitive exams (scrolling)
  const latestExams = [
    'UPSC Civil Services',
    'SSC CGL',
    'JEE Main',
    'NEET',
    'GATE',
    'CAT',
    'Banking PO',
    'Railway NTPC',
  ];

  // New features (scrolling)
  const newFeatures = [
    'AI-Powered Quiz Recommendations',
    'Real-time Performance Analytics',
    'Personalized Learning Paths',
    
    'Mobile Support',
    'Advanced Progress Tracking',
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Menubar />

      {/* Slider Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 ${
              index === currentSlide ? 'block z-10' : 'hidden z-0'
            }`}
          >
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
              style={{ backgroundImage: `url('${image.src}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
              <div className="relative text-center text-white px-4 z-10 max-w-4xl">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                  {image.title}
                </h2>
                <p className="text-lg md:text-2xl lg:text-3xl drop-shadow-md text-gray-100">
                  {image.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slide Navigation Arrows */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-sm z-20"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % sliderImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-sm z-20"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all ${
                index === currentSlide 
                  ? 'w-8 h-3 bg-orange-500 rounded-full' 
                  : 'w-3 h-3 bg-white/50 hover:bg-white/80 rounded-full'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 1. About Us Section */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">About Us</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Vision */}
            <div id="vision" className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <h3 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">Vision</h3>
              <p className="text-gray-700 dark:text-gray-300">
                To become a global AI-powered learning ecosystem that empowers learners of all ages to achieve academic excellence, career success, and lifelong growth.
              </p>
            </div>

            {/* Mission */}
            <div id="mission" className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <h3 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">Mission</h3>
              <p className="text-gray-700 dark:text-gray-300">
                To provide accessible, high-quality educational resources and assessments that help students achieve
                their academic and career goals.
              </p>
            </div>

            {/* Why We? */}
            <div id="why-we" className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <h3 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">Why We?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We combine cutting-edge technology with expert-curated content to deliver personalized learning
                experiences that drive real results.
              </p>
            </div>
          </div>

          {/* Know More Button */}
          <div className="text-center mt-10">
            <Link href="/about" className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl">
              Know More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Counter Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{counterStats.students.toLocaleString()}+</div>
              <div className="text-lg">Active Visitors</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{counterStats.quizzes.toLocaleString()}+</div>
              <div className="text-lg">Quizzes Available</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{counterStats.domains.toLocaleString()}+</div>
              <div className="text-lg"> Domains</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{counterStats.courses.toLocaleString()}+</div>
              <div className="text-lg">Courses</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose CareerMaster.AI? */}
      <section id="why-choose" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">Why Choose CareerMaster.AI?</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Comprehensive Content',
                description: 'Access thousands of quizzes covering all subjects and competitive exams.',
                icon: '📚',
              },
              {
                title: 'AI-Powered Learning',
                description: 'Personalized recommendations and adaptive learning paths.',
                icon: '🤖',
              },
              {
                title: 'Real-time Analytics',
                description: 'Track your progress with detailed performance insights.',
                icon: '📊',
              },
              {
                title: 'Expert Guidance',
                description: 'Learn from industry experts and experienced educators.',
                icon: '👨‍🏫',
              },
              {
                title: 'Flexible Learning',
                description: 'Study at your own pace, anytime, anywhere.',
                icon: '⏰',
              },
              {
                title: 'Certification',
                description: 'Earn certificates upon completion of courses.',
                icon: '🏆',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Who Can Use This Portal? */}
      <section id="who-can-use" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">Who Can Use This Portal?</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Class 3-10 Students',
              '10+2 / Intermediate',
              'Degree Students',
              'Post Graduate',
              'Ph.D Scholars',
              'Competitive Exam Aspirants',
              'Working Professionals',
              'Job Seekers',
            ].map((category, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md text-center hover:scale-105 transition-transform cursor-pointer">
                <div className="text-3xl mb-2">🎓</div>
                <h3 className="font-bold text-gray-900 dark:text-white">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Comprehensive Quiz Topics & Learning Domains */}
      <section id="quiz-topics" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">
              Comprehensive Quiz Topics & Learning Domains
            </h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Subject-Based Academics',
              'Olympiads (SOF, IMO, NSO, Cyber, NTSE)',
              'Aptitude (Quantitative, Logical, DI)',
              'Reasoning (Analytical, Verbal & Non-Verbal)',
              'Soft Skills (Vocabulary, Communication, Grammar)',
              'Competitive Exams (GATE, CAT, EAMCET, UPSC, SSC, NEET, JEE)',
              'Computer & Technology',
              'General Knowledge & Current Affairs',
              'Career Skills',
              'Cultural, Arts, Heritage, Festivals',
              'Interview & Placement Preparation',
            ].map((topic, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500 hover:shadow-lg transition-shadow"
              >
                <p className="text-gray-900 dark:text-white font-medium">{topic}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Monthly Top Performers Section */}
      <section id="top-performers" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">Monthly Top Performers</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
              Celebrating our outstanding achievers of the month
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ananya Reddy',
                education: 'B.Tech Computer Science',
                course: 'GATE CS Preparation',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
                score: '96%',
                rank: 1,
              },
              {
                name: 'Vikram Singh',
                education: 'M.Sc Mathematics',
                course: 'Quantitative Aptitude',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
                score: '94%',
                rank: 2,
              },
              {
                name: 'Sneha Patel',
                education: 'B.Com Honours',
                course: 'Banking PO Preparation',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
                score: '92%',
                rank: 3,
              },
            ].map((performer, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                  performer.rank === 1 ? 'ring-4 ring-yellow-400 dark:ring-yellow-500' : ''
                }`}
              >
                {/* Rank Badge */}
                <div
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg z-10 ${
                    performer.rank === 1
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                      : performer.rank === 2
                      ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                      : 'bg-gradient-to-br from-amber-600 to-amber-800'
                  }`}
                >
                  #{performer.rank}
                </div>

                {/* Top Gradient Bar */}
                <div
                  className={`h-2 ${
                    performer.rank === 1
                      ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400'
                      : performer.rank === 2
                      ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300'
                      : 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600'
                  }`}
                ></div>

                <div className="p-6">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-4">
                    <div
                      className={`relative w-24 h-24 rounded-full overflow-hidden ring-4 shadow-lg ${
                        performer.rank === 1
                          ? 'ring-yellow-400'
                          : performer.rank === 2
                          ? 'ring-gray-400'
                          : 'ring-amber-600'
                      }`}
                    >
                      <img
                        src={performer.image}
                        alt={performer.name}
                        className="w-full h-full object-cover"
                      />
                      {performer.rank === 1 && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-2xl">👑</div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">
                    {performer.name}
                  </h3>

                  {/* Education */}
                  <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="mr-1">🎓</span>
                    {performer.education}
                  </div>

                  {/* Course */}
                  <div className="bg-orange-50 dark:bg-gray-600 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Course</p>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{performer.course}</p>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">{performer.score}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Score Achieved</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Permission Note */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 italic">
            * Photos displayed with performer&apos;s consent
          </p>
        </div>
      </section>

      {/* 7. Certification Section */}
      <section id="certification" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">Get Certified</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
              Earn certificates upon completion of courses and assessments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Silver Certificate */}
            <div className="relative bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-400 p-8 rounded-xl shadow-lg text-center hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-gray-400 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🥈</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Silver</h3>
                <div className="text-4xl font-extrabold text-gray-600 dark:text-gray-200 mb-2">70%+</div>
                <p className="text-gray-700 dark:text-gray-200 text-sm">
                  Score 70% or more to earn this certificate and prove your foundational knowledge
                </p>
                <div className="mt-4 inline-block px-4 py-2 bg-gray-500/20 rounded-full text-gray-700 dark:text-gray-200 text-sm font-medium">
                  Foundation Level
                </div>
              </div>
            </div>

            {/* Gold Certificate */}
            <div className="relative bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-300 dark:from-yellow-700 dark:via-yellow-600 dark:to-amber-500 p-8 rounded-xl shadow-xl text-center hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-yellow-500 overflow-hidden group transform md:scale-105 md:z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md">
                POPULAR
              </div>
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-yellow-400/50">
                  <span className="text-5xl">🥇</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-amber-800 dark:text-yellow-100">Gold</h3>
                <div className="text-4xl font-extrabold text-amber-600 dark:text-yellow-200 mb-2">80%+</div>
                <p className="text-amber-800 dark:text-yellow-100 text-sm">
                  Score 80% or more to earn this prestigious certificate showcasing your expertise
                </p>
                <div className="mt-4 inline-block px-4 py-2 bg-yellow-500/30 rounded-full text-amber-800 dark:text-yellow-100 text-sm font-medium">
                  Expert Level
                </div>
              </div>
            </div>

            {/* Platinum Certificate */}
            <div className="relative bg-gradient-to-br from-slate-100 via-indigo-100 to-purple-200 dark:from-slate-700 dark:via-indigo-800 dark:to-purple-700 p-8 rounded-xl shadow-lg text-center hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-indigo-400 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-300 rounded-full flex items-center justify-center shadow-lg ring-2 ring-indigo-300/50">
                  <span className="text-4xl">💎</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-indigo-800 dark:text-indigo-200">Platinum</h3>
                <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-300 mb-2">90%+</div>
                <p className="text-indigo-800 dark:text-indigo-200 text-sm">
                  Score 90% or more to earn this elite certificate demonstrating mastery
                </p>
                <div className="mt-4 inline-block px-4 py-2 bg-indigo-500/20 rounded-full text-indigo-800 dark:text-indigo-200 text-sm font-medium">
                  Master Level
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pricing Table */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">Pricing Plans</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Basic',
                price: 'Free',
                features: [
                  { text: 'Limited Quizzes', included: true },
                  { text: 'Sample Quizzes', included: true },
                  { text: 'Easy Level Quizzes', included: false },
                  { text: 'Hard Level Quizzes', included: false },
                  { text: 'Random Quizzes', included: false },
                  { text: 'Time Based Quizzes', included: false },
                  { text: 'Non-Time Based Quizzes', included: false },
                  { text: 'Analytics', included: false },
                  { text: 'Certificates', included: false },
                  { text: 'Custom Content', included: false },
                ],
              },
              {
                name: 'Premium',
                price: '₹199',
                period: '/subject',
                features: [
                  { text: 'Easy Level Quizzes', included: true },
                  { text: 'Hard Level Quizzes', included: true },
                  { text: 'Random Quizzes', included: true },
                  { text: 'Time Based Quizzes', included: true },
                  { text: 'Non-Time Based Quizzes', included: true },
                  { text: 'Analytics', included: true },
                  { text: 'Certificates', included: true },
                  { text: 'Custom Content', included: false },
                  { text: 'Support', included: false },
                ],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: '₹Custom',
                features: [
                  { text: 'Easy Level Quizzes', included: true },
                  { text: 'Hard Level Quizzes', included: true },
                  { text: 'Random Quizzes', included: true },
                  { text: 'Time Based Quizzes', included: true },
                  { text: 'Non-Time Based Quizzes', included: true },
                  { text: 'Analytics', included: true },
                  { text: 'Certificates', included: true },
                  { text: 'Custom Content', included: true },
                  { text: 'Support', included: true },
                ],
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg ${
                  plan.popular ? 'border-4 border-orange-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-orange-500 text-white text-center py-1 rounded-t-lg -mt-8 -mx-8 mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">{plan.price}</span>
                  {plan.period && <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-center ${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                      {feature.included ? (
                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={!feature.included ? 'line-through' : ''}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    plan.popular
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Clients Section */}
      <section id="clients" className="py-20 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">Our Clients</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>
        </div>

        <div className="flex animate-scroll-slow">
          <div className="flex space-x-8 px-4">
            {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((client, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md flex items-center justify-center h-24 min-w-[200px]"
              >
                <div className="text-2xl font-bold text-gray-400">Client {client}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Site Tour Video */}
      <section id="site-tour" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">Site Tour Video</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">Video Placeholder</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Scrolling Sections */}
      {/* Latest Competitive Exams (Scrolling) */}
      <section className="py-8 bg-orange-500 text-white overflow-hidden">
        <div className="flex space-x-8 animate-scroll">
          <div className="flex space-x-8 whitespace-nowrap">
            {[...latestExams, ...latestExams].map((exam, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-lg font-medium">{exam}</span>
                <span className="text-orange-300">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Features Added (Scrolling) */}
      <section className="py-8 bg-blue-600 text-white overflow-hidden">
        <div className="flex space-x-8 animate-scroll-reverse">
          <div className="flex space-x-8 whitespace-nowrap">
            {[...newFeatures, ...newFeatures].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-lg font-medium">✨ {feature}</span>
                <span className="text-blue-300">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Updates, Events & Exams Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">Updates, Events & Exams</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Quick Updates Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-blue-600 text-white py-3 px-4">
                <h3 className="text-xl font-bold flex items-center">
                  <span className="mr-2">📢</span> Quick Updates
                </h3>
              </div>
              <div className="h-64 overflow-hidden">
                <div className="animate-scroll-vertical">
                  {[
                    { title: 'New Quiz Added', desc: 'Python Advanced Quiz is now live!', date: 'Jan 28, 2026' },
                    { title: 'Feature Update', desc: 'Dark mode now available', date: 'Jan 25, 2026' },
                    { title: 'Performance Boost', desc: 'Faster quiz loading times', date: 'Jan 22, 2026' },
                    { title: 'New Batch Started', desc: 'GATE 2026 batch registrations open', date: 'Jan 20, 2026' },
                    { title: 'Mobile App', desc: 'Coming soon on Android & iOS', date: 'Jan 18, 2026' },
                    { title: 'New Quiz Added', desc: 'Python Advanced Quiz is now live!', date: 'Jan 28, 2026' },
                    { title: 'Feature Update', desc: 'Dark mode now available', date: 'Jan 25, 2026' },
                    { title: 'Performance Boost', desc: 'Faster quiz loading times', date: 'Jan 22, 2026' },
                    { title: 'New Batch Started', desc: 'GATE 2026 batch registrations open', date: 'Jan 20, 2026' },
                    { title: 'Mobile App', desc: 'Coming soon on Android & iOS', date: 'Jan 18, 2026' },
                  ].map((update, idx) => (
                    <div key={idx} className="p-4 border-b border-blue-200 dark:border-gray-600 hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                      <p className="font-semibold text-gray-900 dark:text-white">{update.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{update.desc}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{update.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Events Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-purple-600 text-white py-3 px-4">
                <h3 className="text-xl font-bold flex items-center">
                  <span className="mr-2">📅</span> Online Trainings
                </h3>
              </div>
              <div className="h-52 overflow-hidden">
                <div className="animate-scroll-vertical-reverse">
                  {[
                    { title: 'GATE Prep Session', desc: 'Live session with experts', date: 'Feb 5, 2026 - 10:00 AM' },
                    { title: 'Career Guidance Webinar', desc: 'Choose your right path', date: 'Feb 8, 2026 - 3:00 PM' },
                    { title: 'Mock Test Series', desc: 'Full-length practice tests', date: 'Feb 12, 2026 - 9:00 AM' },
                    { title: 'Interview Skills Workshop', desc: 'Crack your next interview', date: 'Feb 15, 2026 - 2:00 PM' },
                    { title: 'Coding Bootcamp', desc: '3-day intensive program', date: 'Feb 20-22, 2026' },
                    { title: 'GATE Prep Session', desc: 'Live session with experts', date: 'Feb 5, 2026 - 10:00 AM' },
                    { title: 'Career Guidance Webinar', desc: 'Choose your right path', date: 'Feb 8, 2026 - 3:00 PM' },
                    { title: 'Mock Test Series', desc: 'Full-length practice tests', date: 'Feb 12, 2026 - 9:00 AM' },
                    { title: 'Interview Skills Workshop', desc: 'Crack your next interview', date: 'Feb 15, 2026 - 2:00 PM' },
                    { title: 'Coding Bootcamp', desc: '3-day intensive program', date: 'Feb 20-22, 2026' },
                  ].map((event, idx) => (
                    <div key={idx} className="p-4 border-b border-purple-200 dark:border-gray-600 hover:bg-purple-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                      <p className="font-semibold text-gray-900 dark:text-white">{event.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{event.desc}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">{event.date}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Registration Form Link */}
              <div className="p-4 bg-purple-100 dark:bg-gray-700 border-t border-purple-200 dark:border-gray-600">
                <Link
                  href="/training-registration"
                  className="flex items-center justify-center w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  <span className="mr-2">📝</span>
                  Register for Training
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <p className="text-xs text-center text-purple-600 dark:text-purple-300 mt-2">
                  Fill the form to attend upcoming sessions
                </p>
              </div>
            </div>

            {/* Latest Competitive Exams Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-blue-600 text-white py-3 px-4">
                <h3 className="text-xl font-bold flex items-center">
                  <span className="mr-2">🎯</span> Latest Exams
                </h3>
              </div>
              <div className="h-64 overflow-hidden">
                <div className="animate-scroll-vertical">
                  {[
                    { title: 'UPSC CSE 2026', desc: 'Prelims: May 25, 2026', status: 'Applications Open' },
                    { title: 'SSC CGL 2026', desc: 'Tier-1: April 10, 2026', status: 'Notification Out' },
                    { title: 'GATE 2026', desc: 'Exam: Feb 1-16, 2026', status: 'Admit Card Released' },
                    { title: 'CAT 2026', desc: 'Exam: Nov 24, 2026', status: 'Coming Soon' },
                    { title: 'JEE Main 2026', desc: 'Session 1: Jan 2026', status: 'Results Declared' },
                    { title: 'UPSC CSE 2026', desc: 'Prelims: May 25, 2026', status: 'Applications Open' },
                    { title: 'SSC CGL 2026', desc: 'Tier-1: April 10, 2026', status: 'Notification Out' },
                    { title: 'GATE 2026', desc: 'Exam: Feb 1-16, 2026', status: 'Admit Card Released' },
                    { title: 'CAT 2026', desc: 'Exam: Nov 24, 2026', status: 'Coming Soon' },
                    { title: 'JEE Main 2026', desc: 'Session 1: Jan 2026', status: 'Results Declared' },
                  ].map((exam, idx) => (
                    <div key={idx} className="p-4 border-b border-blue-200 dark:border-gray-600 hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                      <p className="font-semibold text-gray-900 dark:text-white">{exam.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{exam.desc}</p>
                      <span className="inline-block text-xs bg-blue-600 text-white px-2 py-1 rounded mt-1">{exam.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Success Stories */}
      <section id="success-stories" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-orange-600 dark:text-orange-400">Success Stories</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rajesh Kumar',
                role: 'UPSC Aspirant',
                story: 'CareerMaster.AI helped me clear UPSC prelims with comprehensive mock tests and analytics.',
                image: '👨‍💼',
              },
              {
                name: 'Priya Sharma',
                role: 'JEE Student',
                story: 'The AI-powered recommendations helped me focus on weak areas and improve my score significantly.',
                image: '👩‍🎓',
              },
              {
                name: 'Amit Patel',
                role: 'GATE Aspirant',
                story: 'Excellent platform for GATE preparation with detailed explanations and performance tracking.',
                image: '👨‍🔬',
              },
            ].map((story, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
                <div className="text-5xl mb-4 text-center">{story.image}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{story.name}</h3>
                <p className="text-orange-600 dark:text-orange-400 mb-3">{story.role}</p>
                <p className="text-gray-700 dark:text-gray-300">{story.story}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
