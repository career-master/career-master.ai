'use client';

import Menubar from '@/components/Menubar';
import SimpleFooter from '@/components/SimpleFooter';

export default function OthersPage() {
  const domains = [
    { name: 'Teaching', icon: '👨‍🏫' },
    { name: 'Healthcare', icon: '🏥' },
    { name: 'Agriculture', icon: '🌾' },
    { name: 'Journalism', icon: '📰' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Arts & Culture', icon: '🎭' },
  ];

  const categories = [
    {
      title: 'Teaching & Education',
      description: 'Prepare for teaching positions in schools, colleges, and universities.',
      icon: '👨‍🏫',
      exams: ['TET (CTET/STET)', 'B.Ed Entrance', 'DSSSB Teacher', 'KVS/NVS Teacher', 'UGC NET Education'],
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Healthcare & Nursing',
      description: 'Career opportunities in healthcare, nursing, and allied medical fields.',
      icon: '🏥',
      exams: ['AIIMS Nursing', 'PGIMER Nursing', 'CHO Exam', 'ANM/GNM', 'Pharmacist Exams'],
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Agriculture & Veterinary',
      description: 'Exams for agricultural officers, scientists, and veterinary professionals.',
      icon: '🌾',
      exams: ['ICAR JRF/SRF', 'NABARD Grade A/B', 'FCI Manager', 'State Agriculture Officer', 'Veterinary Exams'],
      color: 'from-green-500 to-lime-600',
    },
    {
      title: 'Journalism & Media',
      description: 'Tests for mass communication, journalism, and media studies.',
      icon: '📰',
      exams: ['IIMC Entrance', 'JNU Mass Comm', 'XIC Entrance', 'ACJ Chennai', 'Symbiosis Media'],
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Sports & Physical Education',
      description: 'Exams for sports quota, physical education, and coaching positions.',
      icon: '⚽',
      exams: ['NIS Patiala', 'B.P.Ed Entrance', 'SAI Coach', 'Sports Authority Exams', 'Physical Education TET'],
      color: 'from-red-500 to-rose-600',
    },
    {
      title: 'Fine Arts & Performing Arts',
      description: 'Entrance exams for art, music, dance, and drama programs.',
      icon: '🎭',
      exams: ['NSD Entrance', 'FTII Entrance', 'BHU Fine Arts', 'Delhi College of Art', 'Music Academies'],
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Hospitality & Tourism',
      description: 'Career in hotel management, tourism, and hospitality industry.',
      icon: '🏨',
      exams: ['NCHMCT JEE', 'IHM Entrance', 'IITTM', 'State HM Exams', 'Culinary Arts'],
      color: 'from-cyan-500 to-blue-600',
    },
    {
      title: 'Social Work & NGO',
      description: 'Exams for social work programs and development sector careers.',
      icon: '🤝',
      exams: ['TISS Entrance', 'Delhi School of Social Work', 'MSW Entrances', 'NGO Sector Tests', 'Rural Development'],
      color: 'from-pink-500 to-rose-600',
    },
  ];

  const specializedExams = [
    { name: 'CTET', desc: 'Central Teacher Eligibility', icon: '👨‍🏫', color: 'from-blue-500 to-indigo-600' },
    { name: 'NCHMCT JEE', desc: 'Hotel Management', icon: '🏨', color: 'from-amber-500 to-orange-600' },
    { name: 'ICAR AIEEA', desc: 'Agriculture Entrance', icon: '🌾', color: 'from-green-500 to-emerald-600' },
    { name: 'TISS', desc: 'Social Sciences', icon: '🤝', color: 'from-pink-500 to-rose-600' },
    { name: 'FTII', desc: 'Film & Television', icon: '🎬', color: 'from-purple-500 to-violet-600' },
    { name: 'NID', desc: 'Design Aptitude', icon: '🎨', color: 'from-cyan-500 to-blue-600' },
    { name: 'IIMC', desc: 'Mass Communication', icon: '📰', color: 'from-red-500 to-rose-600' },
    { name: 'NIS Patiala', desc: 'Sports Coaching', icon: '⚽', color: 'from-emerald-500 to-teal-600' },
  ];

  const skills = [
    { name: 'General Knowledge', icon: '📚', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { name: 'Current Affairs', icon: '📰', color: 'bg-green-100 text-green-700 border-green-300' },
    { name: 'Reasoning Ability', icon: '🧩', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { name: 'Language Skills', icon: '📝', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { name: 'Quantitative Aptitude', icon: '🔢', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { name: 'Domain Knowledge', icon: '🎯', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { name: 'Communication', icon: '💬', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { name: 'Creative Thinking', icon: '💡', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  ];

  const careerPaths = [
    { title: 'Government Teacher', salary: '₹30K - ₹80K', growth: 'Stable', icon: '👨‍🏫' },
    { title: 'Hotel Manager', salary: '₹40K - ₹1.5L', growth: 'High', icon: '🏨' },
    { title: 'Agricultural Scientist', salary: '₹50K - ₹1L', growth: 'Moderate', icon: '🌾' },
    { title: 'Journalist', salary: '₹25K - ₹80K', growth: 'Moderate', icon: '📰' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Menubar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-60 -left-40 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-2xl">🌟</span>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Test by Domain</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
                  Other Specialized Exams
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Explore diverse career paths with preparation for <span className="font-semibold text-blue-600 dark:text-blue-400">Teaching</span>, 
                <span className="font-semibold text-emerald-600 dark:text-emerald-400"> Healthcare</span>,
                <span className="font-semibold text-amber-600 dark:text-amber-400"> Hospitality</span>, 
                <span className="font-semibold text-purple-600 dark:text-purple-400"> Arts</span>, 
                <span className="font-semibold text-pink-600 dark:text-pink-400"> Agriculture</span>, and more!
              </p>

              {/* Domains */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {domains.map((domain, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-2xl">{domain.icon}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{domain.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Explore Career Domains
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Discover unique career opportunities beyond conventional paths
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                  <div className="p-5">
                    <div className="text-3xl mb-3">{category.icon}</div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                      {category.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {category.exams.slice(0, 2).map((exam, eIdx) => (
                        <span
                          key={eIdx}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
                        >
                          {exam}
                        </span>
                      ))}
                      {category.exams.length > 2 && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                          +{category.exams.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialized Exams Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Popular Specialized Exams
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Top entrance exams for specialized career paths
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {specializedExams.map((exam, idx) => (
                <div
                  key={idx}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${exam.color}`}></div>
                  <div className="p-5">
                    <div className="text-3xl mb-2">{exam.icon}</div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{exam.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{exam.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Career Paths */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Career Opportunities
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Explore rewarding career paths with great growth potential
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {careerPaths.map((career, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-center border border-slate-200 dark:border-slate-700"
                >
                  <div className="text-4xl mb-3">{career.icon}</div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">{career.title}</h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{career.salary}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Growth: {career.growth}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Skills We Cover
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Comprehensive coverage of essential skills for various careers
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {skills.map((skill, idx) => (
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

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Discover Your Unique Career Path! 🌟
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                  Explore beyond conventional careers. Prepare for teaching, hospitality, agriculture, arts, and many more specialized fields.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Explore All Domains
                  </button>
                  <button className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-white/30 transition-all border border-white/30">
                    Take Career Quiz
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

