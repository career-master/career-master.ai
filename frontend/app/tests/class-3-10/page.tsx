'use client';

import Menubar from '@/components/Menubar';
import SimpleFooter from '@/components/SimpleFooter';

export default function Class310Page() {
  const boards = [
    { name: 'CBSE', icon: '📚' },
    { name: 'ICSE', icon: '📖' },
    { name: 'State Boards', icon: '🏫' },
    { name: 'International Boards', icon: '🌍' },
  ];

  const examCategories = [
    {
      title: 'Academic Excellence',
      description: 'Comprehensive tests aligned with your school curriculum to help you master every subject.',
      icon: (
        <svg className="w-12 h-12 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      features: ['Chapter-wise tests', 'Unit tests', 'Mock exams', 'Revision tests'],
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Olympiad Preparation',
      description: 'Excel in national and international Olympiads with our specialized practice tests.',
      icon: (
        <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      features: ['SOF Olympiads (IMO, NSO, IEO, NCO)', 'CREST Olympiads', 'Unified Council Olympiads', 'Silverzone Olympiads'],
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Entrance Exam Prep',
      description: 'Get ready for competitive entrance exams with targeted practice and mock tests.',
      icon: (
        <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      features: ['Navodaya (JNVST)', 'Sainik School (AISSEE)', 'RMS Entrance', 'State Talent Search'],
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  const subjects = [
    { name: 'Mathematics', icon: '🔢', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { name: 'Science', icon: '🔬', color: 'bg-green-100 text-green-700 border-green-300' },
    { name: 'English', icon: '📝', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { name: 'Social Studies', icon: '🌏', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { name: 'Hindi', icon: '📜', color: 'bg-red-100 text-red-700 border-red-300' },
    { name: 'Computer Science', icon: '💻', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { name: 'General Knowledge', icon: '💡', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { name: 'Reasoning', icon: '🧩', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-pink-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Menubar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-60 -left-40 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-2xl">🎓</span>
                <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">Test by Class</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600">
                  Class 3 - 10
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Comprehensive test preparation covering <span className="font-semibold text-pink-600 dark:text-pink-400">Academic</span>, 
                <span className="font-semibold text-amber-600 dark:text-amber-400"> Olympiad</span>, and 
                <span className="font-semibold text-cyan-600 dark:text-cyan-400"> Entrance Exams</span> of various boards related to Class 3-10
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

              {/* Class selector */}
              <div className="inline-flex items-center gap-2 flex-wrap justify-center">
                {[3, 4, 5, 6, 7, 8, 9, 10].map((classNum) => (
                  <button
                    key={classNum}
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    {classNum}
                  </button>
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

            <div className="grid md:grid-cols-3 gap-8">
              {examCategories.map((category, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Gradient top bar */}
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

                  {/* Hover effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`}></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Subjects Covered
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Practice tests available for all major subjects aligned with your curriculum
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

        {/* Features Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Why Choose Our Class 3-10 Tests?
                  </h2>
                  <ul className="space-y-4">
                    {[
                      'AI-powered personalized learning paths',
                      'Detailed performance analytics & reports',
                      'Updated question banks from all major boards',
                      'Instant feedback and solutions',
                      'Track progress across subjects and topics',
                      'Mock tests simulating real exam conditions',
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
                        <div className="text-6xl font-bold mb-2">3-10</div>
                        <div className="text-lg opacity-80">Classes Covered</div>
                      </div>
                    </div>
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-cyan-400 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
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
              Ready to Excel in Your Studies?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Start practicing with our comprehensive tests and track your progress towards academic excellence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Start Practicing Now
              </button>
              <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-slate-200 dark:border-slate-700">
                View All Tests
              </button>
            </div>
          </div>
        </section>
      </main>

      <SimpleFooter />
    </div>
  );
}

