'use client';

import Menubar from '@/components/Menubar';
import Footer from '@/components/Footer';

export default function KidsOlympiadsPage() {
  const olympiadOrganizations = [
    { name: 'SOF (Science Olympiad Foundation)', icon: '🏆' },
    { name: 'Unified Council', icon: '🎯' },
    { name: 'Silverzone', icon: '🥈' },
    { name: 'CREST Olympiads', icon: '⭐' },
    { name: 'Humming Bird', icon: '🐦' },
    { name: 'EduHeal Foundation', icon: '📚' },
  ];

  const olympiadCategories = [
    {
      title: 'Mathematics Olympiads',
      description: 'Develop logical thinking and problem-solving skills through challenging math competitions.',
      icon: '🔢',
      olympiads: ['IMO (International Mathematical Olympiad)', 'ISMO', 'iOM', 'UCO Math', 'Silverzone iMO'],
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Science Olympiads',
      description: 'Explore the wonders of science and develop scientific temperament.',
      icon: '🔬',
      olympiads: ['NSO (National Science Olympiad)', 'iOS', 'NSTSE', 'UCO Science', 'Silverzone iOS'],
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'English Olympiads',
      description: 'Master the English language with vocabulary, grammar, and comprehension challenges.',
      icon: '📝',
      olympiads: ['IEO (International English Olympiad)', 'UIEO', 'iOEL', 'Silverzone iOEL', 'CREST English'],
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Computer/Cyber Olympiads',
      description: 'Learn computer fundamentals, coding concepts, and digital literacy.',
      icon: '💻',
      olympiads: ['NCO (National Cyber Olympiad)', 'ICO', 'UCO Computer', 'Silverzone iIO', 'CREST Cyber'],
      color: 'from-cyan-500 to-blue-600',
    },
    {
      title: 'General Knowledge',
      description: 'Expand awareness about current affairs, history, geography, and more.',
      icon: '🌍',
      olympiads: ['IGKO', 'SKGKO', 'UCO GK', 'Silverzone iGKO', 'CREST GK'],
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Reasoning & Aptitude',
      description: 'Sharpen logical reasoning, critical thinking, and mental ability.',
      icon: '🧩',
      olympiads: ['iRAO', 'NIMO', 'Mental Ability Olympiad', 'Reasoning Olympiad', 'CREST Reasoning'],
      color: 'from-rose-500 to-red-600',
    },
  ];

  const classWise = [
    { class: '1-2', label: 'Foundation', color: 'from-pink-400 to-rose-500' },
    { class: '3-4', label: 'Junior', color: 'from-orange-400 to-amber-500' },
    { class: '5-6', label: 'Middle', color: 'from-green-400 to-emerald-500' },
    { class: '7-8', label: 'Senior', color: 'from-blue-400 to-indigo-500' },
    { class: '9-10', label: 'Advanced', color: 'from-purple-400 to-violet-500' },
  ];

  const benefits = [
    { title: 'Builds Competitive Spirit', icon: '🏅', desc: 'Prepares students for future competitive exams' },
    { title: 'Enhances Knowledge', icon: '📚', desc: 'Goes beyond school curriculum for deeper learning' },
    { title: 'Develops Problem Solving', icon: '🧠', desc: 'Improves analytical and logical thinking' },
    { title: 'Scholarships & Awards', icon: '🏆', desc: 'Win medals, certificates, and cash prizes' },
    { title: 'National Recognition', icon: '⭐', desc: 'Get ranked among the best students nationally' },
    { title: 'Boosts Confidence', icon: '💪', desc: 'Builds self-confidence and academic excellence' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-amber-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Menubar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-60 -left-40 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-2xl">🏆</span>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Test by Domain</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-pink-600">
                  Kids Olympiads
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Excel in national and international <span className="font-semibold text-amber-600 dark:text-amber-400">Olympiad competitions</span> with 
                comprehensive practice tests for <span className="font-semibold text-blue-600 dark:text-blue-400">Mathematics</span>, 
                <span className="font-semibold text-green-600 dark:text-green-400"> Science</span>, 
                <span className="font-semibold text-purple-600 dark:text-purple-400"> English</span>, and more!
              </p>

              {/* Olympiad Organizations */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {olympiadOrganizations.map((org, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-xl">{org.icon}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{org.name}</span>
                  </div>
                ))}
              </div>

              {/* Class-wise tags */}
              <div className="flex flex-wrap justify-center gap-3">
                {classWise.map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-6 py-3 rounded-xl bg-gradient-to-r ${item.color} text-white font-bold shadow-lg hover:scale-105 transition-all cursor-pointer`}
                  >
                    <div className="text-lg">Class {item.class}</div>
                    <div className="text-xs opacity-80">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Olympiad Categories Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Olympiad Categories
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Practice tests available for all major Olympiad subjects and competitions
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {olympiadCategories.map((category, idx) => (
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
                      {category.olympiads.slice(0, 3).map((olympiad, oIdx) => (
                        <span
                          key={oIdx}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
                        >
                          {olympiad}
                        </span>
                      ))}
                      {category.olympiads.length > 3 && (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                          +{category.olympiads.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Why Participate in Olympiads?
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Olympiads offer numerous benefits for young learners
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center"
                >
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Start Your Olympiad Journey! 🚀
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                  Join thousands of students preparing for SOF, Unified Council, Silverzone, and other prestigious Olympiad competitions.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-8 py-4 bg-white text-amber-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Start Practice Tests
                  </button>
                  <button className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-white/30 transition-all border border-white/30">
                    View Sample Papers
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

