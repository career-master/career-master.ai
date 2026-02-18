'use client';

import Menubar from '@/components/Menubar';
import SimpleFooter from '@/components/SimpleFooter';

export default function GovtExamsPage() {
  const examBoards = [
    { name: 'UPSC', icon: '🏛️' },
    { name: 'SSC', icon: '📋' },
    { name: 'Banking', icon: '🏦' },
    { name: 'Railways', icon: '🚂' },
    { name: 'State PSC', icon: '🗳️' },
    { name: 'Defence', icon: '🎖️' },
  ];

  const examCategories = [
    {
      title: 'UPSC Civil Services',
      description: 'Prepare for India\'s most prestigious examination - IAS, IPS, IFS, and other central services.',
      icon: '🏛️',
      exams: ['UPSC CSE Prelims', 'UPSC CSE Mains', 'UPSC CAPF', 'UPSC CDS', 'UPSC NDA'],
      color: 'from-slate-700 to-slate-900',
    },
    {
      title: 'SSC Examinations',
      description: 'Staff Selection Commission exams for central government jobs.',
      icon: '📋',
      exams: ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD', 'SSC Stenographer'],
      color: 'from-blue-600 to-indigo-700',
    },
    {
      title: 'Banking & Insurance',
      description: 'Secure your career in banking and financial sector with IBPS, SBI, and RBI exams.',
      icon: '🏦',
      exams: ['IBPS PO/Clerk', 'SBI PO/Clerk', 'RBI Grade B', 'NABARD', 'LIC AAO'],
      color: 'from-emerald-600 to-teal-700',
    },
    {
      title: 'Railways (RRB)',
      description: 'Join Indian Railways with RRB NTPC, Group D, and technical positions.',
      icon: '🚂',
      exams: ['RRB NTPC', 'RRB Group D', 'RRB JE', 'RRB ALP', 'RRB Paramedical'],
      color: 'from-red-600 to-rose-700',
    },
    {
      title: 'State PSC',
      description: 'State-level civil services and administrative positions.',
      icon: '🗳️',
      exams: ['APPSC', 'TSPSC', 'MPSC', 'UPPSC', 'BPSC', 'KPSC'],
      color: 'from-purple-600 to-violet-700',
    },
    {
      title: 'Defence Services',
      description: 'Serve the nation through Army, Navy, Air Force, and paramilitary forces.',
      icon: '🎖️',
      exams: ['NDA', 'CDS', 'AFCAT', 'Indian Army', 'Indian Navy', 'Indian Air Force'],
      color: 'from-amber-600 to-orange-700',
    },
  ];

  const subjects = [
    { name: 'General Awareness', icon: '📰', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { name: 'Quantitative Aptitude', icon: '🔢', color: 'bg-green-100 text-green-700 border-green-300' },
    { name: 'Reasoning', icon: '🧩', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { name: 'English Language', icon: '📝', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { name: 'Current Affairs', icon: '🌍', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { name: 'Computer Knowledge', icon: '💻', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { name: 'Indian Polity', icon: '⚖️', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { name: 'Economy', icon: '💹', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  ];

  const popularExams = [
    { name: 'UPSC CSE', posts: '1000+', icon: '🏛️', level: 'Central', color: 'from-slate-600 to-slate-800' },
    { name: 'SSC CGL', posts: '25000+', icon: '📋', level: 'Central', color: 'from-blue-500 to-indigo-600' },
    { name: 'IBPS PO', posts: '5000+', icon: '🏦', level: 'Central', color: 'from-emerald-500 to-teal-600' },
    { name: 'RRB NTPC', posts: '35000+', icon: '🚂', level: 'Central', color: 'from-red-500 to-rose-600' },
    { name: 'SBI PO', posts: '2000+', icon: '🏦', level: 'Central', color: 'from-blue-600 to-blue-800' },
    { name: 'SSC CHSL', posts: '4500+', icon: '📋', level: 'Central', color: 'from-indigo-500 to-purple-600' },
    { name: 'State PSC', posts: 'Various', icon: '🗳️', level: 'State', color: 'from-purple-500 to-violet-600' },
    { name: 'NDA', posts: '400+', icon: '🎖️', level: 'Central', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Menubar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-60 -left-40 w-96 h-96 bg-slate-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-2xl">🏛️</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Test by Domain</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-blue-600 to-emerald-600">
                  Government Exams
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Comprehensive preparation for <span className="font-semibold text-slate-700 dark:text-slate-300">UPSC</span>, 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> SSC</span>,
                <span className="font-semibold text-emerald-600 dark:text-emerald-400"> Banking</span>, 
                <span className="font-semibold text-red-600 dark:text-red-400"> Railways</span>, 
                <span className="font-semibold text-purple-600 dark:text-purple-400"> State PSC</span>, and 
                <span className="font-semibold text-amber-600 dark:text-amber-400"> Defence</span> examinations
              </p>

              {/* Exam Boards */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {examBoards.map((board, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-2xl">{board.icon}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{board.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Exam Categories Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Exam Categories
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Choose your preferred government exam category and start preparing
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examCategories.map((category, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                  <div className="p-6">
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.exams.slice(0, 3).map((exam, eIdx) => (
                        <span
                          key={eIdx}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
                        >
                          {exam}
                        </span>
                      ))}
                      {category.exams.length > 3 && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          +{category.exams.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Exams Grid */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Popular Government Exams
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Most sought-after government job examinations
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularExams.map((exam, idx) => (
                <div
                  key={idx}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${exam.color}`}></div>
                  <div className="p-5">
                    <div className="text-3xl mb-2">{exam.icon}</div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{exam.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{exam.posts} Posts</p>
                    <span className="text-xs text-blue-600 dark:text-blue-400">{exam.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Subjects Covered
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Comprehensive coverage of all government exam subjects
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subjects.map((subject, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 ${subject.color} hover:scale-105 transition-all cursor-pointer shadow-sm hover:shadow-md`}
                >
                  <span className="text-2xl">{subject.icon}</span>
                  <span className="font-semibold text-sm">{subject.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-slate-700 via-blue-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Secure Your Government Job! 🎯
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                  Join lakhs of aspirants preparing for UPSC, SSC, Banking, Railways, and other government exams with AI-powered test series.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Start Free Trial
                  </button>
                  <button className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-white/30 transition-all border border-white/30">
                    View Test Series
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

