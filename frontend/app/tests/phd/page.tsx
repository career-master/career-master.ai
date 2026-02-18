'use client';

import Menubar from '@/components/Menubar';
import SimpleFooter from '@/components/SimpleFooter';

export default function PhDPage() {
  const researchDomains = [
    { name: 'Science & Technology', icon: '🔬' },
    { name: 'Engineering', icon: '⚙️' },
    { name: 'Management', icon: '📊' },
    { name: 'Humanities', icon: '📚' },
    { name: 'Medical Sciences', icon: '🏥' },
    { name: 'Law', icon: '⚖️' },
    { name: 'Social Sciences', icon: '🌍' },
    { name: 'Arts & Design', icon: '🎨' },
  ];

  const examCategories = [
    {
      title: 'Ph.D Entrance Exams',
      description: 'Crack doctoral entrance exams at top universities and research institutes.',
      icon: (
        <svg className="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      features: ['IIT Ph.D Entrance', 'IISc Entrance', 'University Ph.D Tests', 'TIFR GS'],
      color: 'from-rose-500 to-pink-500',
    },
    {
      title: 'Research Fellowships',
      description: 'Prepare for prestigious research fellowships and junior research positions.',
      icon: (
        <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      features: ['UGC NET JRF', 'CSIR NET JRF', 'ICMR JRF', 'DBT JRF'],
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Research Methodology',
      description: 'Master research methodology, statistics, and academic writing skills.',
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      features: ['Research Design', 'Statistical Analysis', 'Academic Writing', 'Literature Review'],
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Academic Exams',
      description: 'Prepare for teaching positions and academic career advancement.',
      icon: (
        <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      features: ['UGC NET Lectureship', 'SLET/SET', 'University Faculty Tests', 'College Lecturer Exams'],
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const fellowships = [
    { name: 'UGC NET JRF', desc: 'Junior Research Fellowship', icon: '🏆', color: 'from-amber-500 to-orange-500' },
    { name: 'CSIR NET JRF', desc: 'Science & Technology', icon: '🔬', color: 'from-blue-500 to-indigo-500' },
    { name: 'GATE Fellowship', desc: 'Engineering Research', icon: '⚙️', color: 'from-emerald-500 to-teal-500' },
    { name: 'ICMR JRF', desc: 'Medical Research', icon: '🏥', color: 'from-rose-500 to-pink-500' },
    { name: 'DBT JRF', desc: 'Biotechnology', icon: '🧬', color: 'from-purple-500 to-violet-500' },
    { name: 'ICAR JRF', desc: 'Agricultural Research', icon: '🌾', color: 'from-green-500 to-lime-500' },
    { name: 'INSPIRE Fellowship', desc: 'DST Fellowship', icon: '✨', color: 'from-cyan-500 to-blue-500' },
    { name: 'PM Fellowship', desc: 'Industry Research', icon: '🎯', color: 'from-red-500 to-orange-500' },
  ];

  const researchSkills = [
    { name: 'Research Methodology', icon: '📐', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { name: 'Statistical Analysis', icon: '📊', color: 'bg-green-100 text-green-700 border-green-300' },
    { name: 'Academic Writing', icon: '✍️', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { name: 'Literature Review', icon: '📚', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { name: 'Data Interpretation', icon: '📈', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { name: 'Logical Reasoning', icon: '🧩', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { name: 'Teaching Aptitude', icon: '👨‍🏫', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { name: 'General Awareness', icon: '🌍', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-rose-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Menubar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-8 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-60 -left-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-2xl">🎓</span>
                <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">Test by Class</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-purple-600 to-amber-600">
                  Ph.D / Doctoral Studies
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Advance your research career with preparation for <span className="font-semibold text-rose-600 dark:text-rose-400">Ph.D Entrances</span>, 
                <span className="font-semibold text-emerald-600 dark:text-emerald-400"> Research Fellowships (JRF)</span>,
                <span className="font-semibold text-blue-600 dark:text-blue-400"> Research Methodology</span>, and 
                <span className="font-semibold text-amber-600 dark:text-amber-400"> Academic Positions</span>
              </p>

              {/* Research Domains */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {researchDomains.map((domain, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-xl">{domain.icon}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{domain.name}</span>
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

        {/* Fellowships Grid */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Research Fellowships & JRF
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Prepare for prestigious research fellowships and funded Ph.D positions
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {fellowships.map((fellowship, idx) => (
                <div
                  key={idx}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${fellowship.color}`}></div>
                  <div className="p-5">
                    <div className="text-3xl mb-2">{fellowship.icon}</div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{fellowship.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{fellowship.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Research Skills Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Research Skills & Aptitude
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Master the essential skills required for doctoral research
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {researchSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 ${skill.color} hover:scale-105 transition-all cursor-pointer shadow-sm hover:shadow-md`}
                >
                  <span className="text-2xl">{skill.icon}</span>
                  <span className="font-semibold text-sm">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Ph.D Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-rose-600 via-purple-600 to-amber-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Your Gateway to Academic Excellence
                  </h2>
                  <ul className="space-y-4">
                    {[
                      'Comprehensive JRF & NET preparation',
                      'Ph.D entrance mock tests for IITs, IISc, NITs',
                      'Research methodology & statistics training',
                      'Academic writing & publication guidance',
                      'Teaching aptitude preparation',
                      'Subject-specific doctoral tests',
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🎓</div>
                        <div className="text-2xl font-bold">Ph.D</div>
                        <div className="text-sm opacity-80">Doctor of Philosophy</div>
                      </div>
                    </div>
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-emerald-400 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                      <span className="text-xl">📊</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
              Begin Your Research Journey
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Start preparing for your Ph.D entrance exams, JRF, and research fellowships with our comprehensive test platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-rose-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Start Research Prep
              </button>
              <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-slate-200 dark:border-slate-700">
                Explore Fellowship Tests
              </button>
            </div>
          </div>
        </section>
      </main>

      <SimpleFooter />
    </div>
  );
}

