'use client';

import Menubar from '@/components/Menubar';
import Footer from '@/components/Footer';

export default function EntranceExamsPage() {
  const examTypes = [
    { name: 'Engineering', icon: '⚙️' },
    { name: 'Medical', icon: '🏥' },
    { name: 'Management', icon: '💼' },
    { name: 'Law', icon: '⚖️' },
    { name: 'Design', icon: '🎨' },
    { name: 'Science', icon: '🔬' },
  ];

  const examCategories = [
    {
      title: 'Engineering Entrances',
      description: 'Crack top engineering entrance exams for IITs, NITs, and premier engineering colleges.',
      icon: '⚙️',
      exams: ['JEE Main', 'JEE Advanced', 'BITSAT', 'VITEEE', 'WBJEE', 'MHT CET', 'KCET', 'EAMCET/EAPCET'],
      color: 'from-blue-600 to-indigo-700',
    },
    {
      title: 'Medical Entrances',
      description: 'Prepare for medical and allied health sciences entrance examinations.',
      icon: '🏥',
      exams: ['NEET UG', 'NEET PG', 'AIIMS', 'JIPMER', 'PGIMER', 'CMC Vellore', 'FMGE'],
      color: 'from-emerald-600 to-teal-700',
    },
    {
      title: 'Management Entrances',
      description: 'Get into top B-schools with comprehensive MBA entrance preparation.',
      icon: '💼',
      exams: ['CAT', 'XAT', 'MAT', 'GMAT', 'CMAT', 'SNAP', 'NMAT', 'IIFT'],
      color: 'from-amber-600 to-orange-700',
    },
    {
      title: 'Law Entrances',
      description: 'Prepare for law entrance exams for NLUs and top law schools.',
      icon: '⚖️',
      exams: ['CLAT', 'AILET', 'LSAT India', 'MH CET Law', 'DU LLB', 'CUET Law'],
      color: 'from-purple-600 to-violet-700',
    },
    {
      title: 'Design & Architecture',
      description: 'Excel in design and architecture entrance examinations.',
      icon: '🎨',
      exams: ['NID DAT', 'NIFT', 'UCEED', 'CEED', 'JEE Paper 2', 'NATA'],
      color: 'from-pink-600 to-rose-700',
    },
    {
      title: 'Science & Research',
      description: 'Prepare for science research programs and integrated courses.',
      icon: '🔬',
      exams: ['KVPY', 'IISc BS', 'NEST', 'IAT', 'IISER Aptitude', 'CUET Science'],
      color: 'from-cyan-600 to-blue-700',
    },
  ];

  const popularExams = [
    { name: 'JEE Main', applicants: '12L+', icon: '⚙️', level: 'National', color: 'from-blue-500 to-indigo-600' },
    { name: 'NEET UG', applicants: '20L+', icon: '🏥', level: 'National', color: 'from-emerald-500 to-teal-600' },
    { name: 'CAT', applicants: '2.5L+', icon: '💼', level: 'National', color: 'from-amber-500 to-orange-600' },
    { name: 'CLAT', applicants: '70K+', icon: '⚖️', level: 'National', color: 'from-purple-500 to-violet-600' },
    { name: 'JEE Advanced', applicants: '1.5L+', icon: '🎯', level: 'National', color: 'from-red-500 to-rose-600' },
    { name: 'GATE', applicants: '9L+', icon: '🔧', level: 'National', color: 'from-slate-500 to-slate-700' },
    { name: 'CUET', applicants: '15L+', icon: '🎓', level: 'National', color: 'from-indigo-500 to-purple-600' },
    { name: 'NIFT', applicants: '50K+', icon: '🎨', level: 'National', color: 'from-pink-500 to-rose-600' },
  ];

  const stateEntrances = [
    { name: 'EAMCET/EAPCET', state: 'Telangana & AP', icon: '📍' },
    { name: 'MHT CET', state: 'Maharashtra', icon: '📍' },
    { name: 'KCET', state: 'Karnataka', icon: '📍' },
    { name: 'WBJEE', state: 'West Bengal', icon: '📍' },
    { name: 'KEAM', state: 'Kerala', icon: '📍' },
    { name: 'GUJCET', state: 'Gujarat', icon: '📍' },
    { name: 'TS POLYCET', state: 'Telangana', icon: '📍' },
    { name: 'AP POLYCET', state: 'Andhra Pradesh', icon: '📍' },
  ];

  const subjects = [
    { name: 'Physics', icon: '⚛️', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { name: 'Chemistry', icon: '🧪', color: 'bg-green-100 text-green-700 border-green-300' },
    { name: 'Mathematics', icon: '📐', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { name: 'Biology', icon: '🧬', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { name: 'English', icon: '📝', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { name: 'Logical Reasoning', icon: '🧩', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { name: 'Quantitative Aptitude', icon: '🔢', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { name: 'General Knowledge', icon: '🌍', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Menubar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-60 -left-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-2xl">🎯</span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Test by Domain</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600">
                  Entrance Exams
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Comprehensive preparation for <span className="font-semibold text-blue-600 dark:text-blue-400">Engineering</span>, 
                <span className="font-semibold text-emerald-600 dark:text-emerald-400"> Medical</span>,
                <span className="font-semibold text-amber-600 dark:text-amber-400"> Management</span>, 
                <span className="font-semibold text-purple-600 dark:text-purple-400"> Law</span>, 
                <span className="font-semibold text-pink-600 dark:text-pink-400"> Design</span>, and other entrance examinations
              </p>

              {/* Exam Types */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {examTypes.map((type, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{type.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Exam Categories Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Entrance Exam Categories
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Choose your stream and start preparing for top entrance examinations
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
                      {category.exams.slice(0, 4).map((exam, eIdx) => (
                        <span
                          key={eIdx}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
                        >
                          {exam}
                        </span>
                      ))}
                      {category.exams.length > 4 && (
                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                          +{category.exams.length - 4} more
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
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Popular Entrance Exams
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Most competitive entrance examinations in India
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
                    <p className="text-sm text-slate-500 dark:text-slate-400">{exam.applicants} Applicants</p>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400">{exam.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* State Entrance Exams */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              State-Level Entrance Exams
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              State-specific engineering and medical entrance examinations
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stateEntrances.map((exam, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{exam.icon}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{exam.state}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{exam.name}</h3>
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
              Comprehensive coverage of all entrance exam subjects
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
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Crack Your Dream Entrance Exam! 🚀
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                  Join lakhs of aspirants preparing for JEE, NEET, CAT, CLAT, and other top entrance exams with AI-powered mock tests.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Start Free Trial
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

      <Footer />
    </div>
  );
}

