'use client';

import Menubar from '@/components/Menubar';
import Footer from '@/components/Footer';

export default function TenPlus2Page() {
  const boards = [
    { name: 'CBSE', icon: '📚' },
    { name: 'State Boards', icon: '🏫' },
    { name: 'ICSE/ISC', icon: '📖' },
    { name: 'International', icon: '🌍' },
  ];

  const streams = [
    {
      title: 'MPC (Maths, Physics, Chemistry)',
      description: 'For students pursuing Engineering, Technology, and Applied Sciences',
      icon: '🔬',
      color: 'from-blue-500 to-indigo-600',
      exams: ['JEE Main & Advanced', 'EAMCET/EAPCET', 'BITSAT', 'VITEEE', 'State Engineering Entrances'],
    },
    {
      title: 'BiPC (Biology, Physics, Chemistry)',
      description: 'For students pursuing Medical, Life Sciences, and Healthcare careers',
      icon: '🧬',
      color: 'from-green-500 to-emerald-600',
      exams: ['NEET UG', 'AIIMS', 'JIPMER', 'State Medical Entrances', 'Veterinary Entrances'],
    },
    {
      title: 'Commerce',
      description: 'For students pursuing Business, Finance, and Management careers',
      icon: '📊',
      color: 'from-amber-500 to-orange-600',
      exams: ['CA Foundation', 'CS Foundation', 'CUET Commerce', 'IPMAT', 'BBA Entrances'],
    },
    {
      title: 'Arts/Humanities',
      description: 'For students pursuing Arts, Literature, Social Sciences, and Law',
      icon: '📜',
      color: 'from-purple-500 to-pink-600',
      exams: ['CLAT', 'CUET Arts', 'NID', 'NIFT', 'Mass Communication Entrances'],
    },
  ];

  const examCategories = [
    {
      title: 'Academic Excellence',
      description: 'Master your board exams with comprehensive chapter-wise and mock tests.',
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      features: ['Board exam preparation', 'Chapter-wise tests', 'Previous year papers', 'Model papers'],
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Entrance Exams',
      description: 'Prepare for top engineering and medical entrance exams with AI-powered practice.',
      icon: (
        <svg className="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      features: ['NEET UG', 'JEE Main & Advanced', 'EAMCET/EAPCET', 'CUET'],
      color: 'from-rose-500 to-pink-500',
    },
    {
      title: 'Scholarship Exams',
      description: 'Compete for prestigious scholarships with specialized preparation tests.',
      icon: (
        <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      features: ['NTSE', 'KVPY', 'Olympiads', 'State Scholarships'],
      color: 'from-amber-500 to-yellow-500',
    },
  ];

  const subjects = [
    { name: 'Physics', icon: '⚛️', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { name: 'Chemistry', icon: '🧪', color: 'bg-green-100 text-green-700 border-green-300' },
    { name: 'Mathematics', icon: '📐', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { name: 'Biology', icon: '🧬', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { name: 'English', icon: '📝', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { name: 'Accountancy', icon: '📊', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { name: 'Economics', icon: '💹', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { name: 'Computer Science', icon: '💻', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Menubar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-60 -left-40 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-2xl">🎓</span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Test by Class</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600">
                  10+2 / Intermediate
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Comprehensive preparation for <span className="font-semibold text-indigo-600 dark:text-indigo-400">Academic Exams</span>, 
                <span className="font-semibold text-rose-600 dark:text-rose-400"> EAMCET, NEET</span>, 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> MPC & BiPC Entrance Exams</span>, and 
                <span className="font-semibold text-amber-600 dark:text-amber-400"> Scholarship Exams</span> across all boards
              </p>

              {/* Boards */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {boards.map((board, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-2xl">{board.icon}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{board.name}</span>
                  </div>
                ))}
              </div>

              {/* Class badges */}
              <div className="inline-flex items-center gap-4">
                <div className="px-8 py-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-2xl shadow-lg">
                  Class 11
                </div>
                <div className="px-8 py-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white font-bold text-2xl shadow-lg">
                  Class 12
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Streams Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Choose Your Stream
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Specialized test preparation for every stream and career path
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {streams.map((stream, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`h-2 bg-gradient-to-r ${stream.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl">{stream.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{stream.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stream.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stream.exams.map((exam, eIdx) => (
                        <span
                          key={eIdx}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium"
                        >
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exam Categories Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800 dark:text-white">
              What We Cover
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {examCategories.map((category, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                  <div className="p-8">
                    <div className="mb-4">{category.icon}</div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                      {category.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {category.description}
                    </p>
                    <ul className="space-y-2">
                      {category.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Subjects Covered
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Comprehensive tests for all intermediate subjects
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subjects.map((subject, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 ${subject.color} hover:scale-105 transition-all cursor-pointer shadow-sm hover:shadow-md`}
                >
                  <span className="text-2xl">{subject.icon}</span>
                  <span className="font-semibold">{subject.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Crack Your Dream Entrance Exam!
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                  Join thousands of students preparing for NEET, JEE, EAMCET, and board exams with our AI-powered platform.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Start Free Trial
                  </button>
                  <button className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-white/30 transition-all border border-white/30">
                    Explore Tests
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

