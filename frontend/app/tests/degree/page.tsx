'use client';

import Menubar from '@/components/Menubar';
import SimpleFooter from '@/components/SimpleFooter';

export default function DegreePage() {
  const degreeTypes = [
    { name: 'B.Tech / B.E.', icon: '⚙️' },
    { name: 'B.Sc', icon: '🔬' },
    { name: 'B.Com', icon: '📊' },
    { name: 'B.A.', icon: '📚' },
    { name: 'BBA / BMS', icon: '💼' },
    { name: 'B.Pharm', icon: '💊' },
  ];

  const examCategories = [
    {
      title: 'University Exams',
      description: 'Ace your semester exams with comprehensive subject-wise preparation and mock tests.',
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      features: ['Semester-wise tests', 'Previous year papers', 'Model papers', 'Practical viva prep'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Competitive Exams',
      description: 'Prepare for government jobs, banking, SSC, and other competitive exams.',
      icon: (
        <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      features: ['SSC CGL/CHSL', 'Banking (IBPS/SBI)', 'RRB NTPC', 'State PSC'],
      color: 'from-emerald-500 to-green-500',
    },
    {
      title: 'PG Entrance Exams',
      description: 'Get ready for postgraduate entrance exams with targeted practice tests.',
      icon: (
        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      features: ['GATE', 'CAT/MAT/XAT', 'CUET PG', 'JAM'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Professional Certifications',
      description: 'Prepare for industry-recognized certifications and skill tests.',
      icon: (
        <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      features: ['AWS/Azure/GCP', 'Data Science', 'Digital Marketing', 'Project Management'],
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const competitiveExams = [
    { name: 'GATE', desc: 'Graduate Aptitude Test', icon: '🎯' },
    { name: 'CAT', desc: 'Common Admission Test', icon: '📈' },
    { name: 'UPSC', desc: 'Civil Services Exam', icon: '🏛️' },
    { name: 'SSC', desc: 'Staff Selection Commission', icon: '📋' },
    { name: 'Banking', desc: 'IBPS/SBI/RBI Exams', icon: '🏦' },
    { name: 'Railways', desc: 'RRB NTPC/Group D', icon: '🚂' },
    { name: 'State PSC', desc: 'State Public Services', icon: '🗳️' },
    { name: 'NET/SET', desc: 'Teaching Eligibility', icon: '👨‍🏫' },
  ];

  const subjects = [
    { name: 'Engineering', icon: '⚙️', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { name: 'Sciences', icon: '🔬', color: 'bg-green-100 text-green-700 border-green-300' },
    { name: 'Commerce', icon: '📊', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { name: 'Management', icon: '💼', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { name: 'Computer Science', icon: '💻', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { name: 'Quantitative Aptitude', icon: '🔢', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { name: 'Reasoning', icon: '🧩', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { name: 'General Knowledge', icon: '🌍', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Menubar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-8 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-60 -left-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-2xl">🎓</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Test by Class</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600">
                  Degree / Undergraduate
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Excel in your <span className="font-semibold text-blue-600 dark:text-blue-400">University Exams</span>, 
                prepare for <span className="font-semibold text-emerald-600 dark:text-emerald-400">Competitive Exams</span>,
                <span className="font-semibold text-purple-600 dark:text-purple-400"> PG Entrances for </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">  the following Degree Courses </span>
              </p>

              {/* Degree Types */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {degreeTypes.map((degree, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-2xl">{degree.icon}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{degree.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Exam Categories Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800 dark:text-white">
              What We Cover
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {examCategories.map((category, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                  <div className="p-6">
                    <div className="mb-4">{category.icon}</div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                      {category.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {category.description}
                    </p>
                    <ul className="space-y-2">
                      {category.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Competitive Exams Grid */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Popular Competitive Exams
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Prepare for top competitive exams with our comprehensive test series
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {competitiveExams.map((exam, idx) => (
                <div
                  key={idx}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <div className="text-4xl mb-3">{exam.icon}</div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{exam.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{exam.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Subjects & Topics
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Comprehensive coverage across all major subjects
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
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Build Your Career Foundation
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                  Whether you're preparing for university exams, competitive tests, or professional certifications, we've got you covered.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Start Practicing
                  </button>
                  <button className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-white/30 transition-all border border-white/30">
                    View All Tests
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SimpleFooter />
    </div>
  );
}

