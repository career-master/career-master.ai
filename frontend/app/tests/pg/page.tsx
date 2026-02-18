'use client';

import Menubar from '@/components/Menubar';
import SimpleFooter from '@/components/SimpleFooter';

export default function PGPage() {
  const pgPrograms = [
    { name: 'M.Tech / M.E.', icon: '⚙️' },
    { name: 'MBA', icon: '💼' },
    { name: 'M.Sc', icon: '🔬' },
    { name: 'M.Com', icon: '📊' },
    { name: 'M.A.', icon: '📚' },
    { name: 'MCA', icon: '💻' },
    { name: 'M.Pharm', icon: '💊' },
    { name: 'LLM', icon: '⚖️' },
  ];

  const examCategories = [
    {
      title: 'PG Entrance Exams',
      description: 'Crack top postgraduate entrance exams with comprehensive preparation.',
      icon: (
        <svg className="w-12 h-12 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      features: ['GATE', 'CAT/XAT/MAT', 'CUET PG', 'NEET PG', 'CLAT PG'],
      color: 'from-violet-500 to-purple-500',
    },
    {
      title: 'University Exams',
      description: 'Excel in your PG semester exams with specialized test preparation.',
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      features: ['Semester exams', 'Specialization tests', 'Project vivas', 'Dissertation prep'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Research Aptitude',
      description: 'Prepare for research fellowships and Ph.D entrance exams.',
      icon: (
        <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      features: ['UGC NET/JRF', 'CSIR NET', 'SLET/SET', 'ICMR JRF'],
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Professional Exams',
      description: 'Prepare for professional certifications and career advancement.',
      icon: (
        <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      features: ['CA Final', 'CS Professional', 'CFA', 'CMA'],
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const entranceExams = [
    { name: 'GATE', desc: 'Engineering & Science', icon: '🎯', color: 'from-blue-500 to-indigo-500' },
    { name: 'CAT', desc: 'Management (IIMs)', icon: '📈', color: 'from-orange-500 to-red-500' },
    { name: 'XAT', desc: 'XLRI Management', icon: '🏆', color: 'from-purple-500 to-pink-500' },
    { name: 'MAT', desc: 'Management Aptitude', icon: '📊', color: 'from-green-500 to-emerald-500' },
    { name: 'NEET PG', desc: 'Medical PG', icon: '🏥', color: 'from-cyan-500 to-blue-500' },
    { name: 'CUET PG', desc: 'Central Universities', icon: '🎓', color: 'from-violet-500 to-purple-500' },
    { name: 'UGC NET', desc: 'Lectureship/JRF', icon: '👨‍🏫', color: 'from-teal-500 to-green-500' },
    { name: 'CLAT PG', desc: 'Law PG', icon: '⚖️', color: 'from-amber-500 to-yellow-500' },
  ];

  const specializations = [
    { name: 'Data Science & AI', icon: '🤖', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { name: 'Finance & Banking', icon: '💰', color: 'bg-green-100 text-green-700 border-green-300' },
    { name: 'Marketing', icon: '📢', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { name: 'Human Resources', icon: '👥', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { name: 'Operations', icon: '⚙️', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { name: 'IT & Systems', icon: '💻', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { name: 'Research & Analytics', icon: '📊', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { name: 'Entrepreneurship', icon: '🚀', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-violet-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Menubar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-8 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-60 -left-40 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-2xl">🎓</span>
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">Test by Class</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-amber-600">
                  Post Graduate (PG)
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Comprehensive preparation for <span className="font-semibold text-violet-600 dark:text-violet-400">PG Entrance Exams</span>, 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> University Exams</span>,
                <span className="font-semibold text-emerald-600 dark:text-emerald-400"> Research Fellowships </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">for the following Master Degree Courses</span>
              </p>

              {/* PG Programs */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {pgPrograms.map((program, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-xl">{program.icon}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{program.name}</span>
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

        {/* Entrance Exams Grid */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Popular PG Entrance Exams
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Ace your postgraduate entrance exams with our specialized test series
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {entranceExams.map((exam, idx) => (
                <div
                  key={idx}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${exam.color}`}></div>
                  <div className="p-5">
                    <div className="text-3xl mb-2">{exam.icon}</div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{exam.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{exam.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specializations Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Specialization Areas
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Practice tests available for all major PG specializations
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {specializations.map((spec, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 ${spec.color} hover:scale-105 transition-all cursor-pointer shadow-sm hover:shadow-md`}
                >
                  <span className="text-2xl">{spec.icon}</span>
                  <span className="font-semibold text-sm">{spec.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-amber-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Advance Your Career with PG Excellence
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                  Join thousands of aspirants preparing for GATE, CAT, NET, and other PG entrance exams with our AI-powered platform.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-8 py-4 bg-white text-violet-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Start Preparation
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

      <SimpleFooter />
    </div>
  );
}

