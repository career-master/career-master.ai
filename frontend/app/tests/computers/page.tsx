'use client';

import Menubar from '@/components/Menubar';
import Footer from '@/components/Footer';

export default function ComputerTechnologyPage() {
  const techDomains = [
    { name: 'Programming', icon: '💻' },
    { name: 'Data Science', icon: '📊' },
    { name: 'Cloud Computing', icon: '☁️' },
    { name: 'Cybersecurity', icon: '🔒' },
    { name: 'Web Development', icon: '🌐' },
    { name: 'AI & ML', icon: '🤖' },
  ];

  const categories = [
    {
      title: 'Programming Languages',
      description: 'Master popular programming languages with hands-on coding challenges and assessments.',
      icon: '💻',
      topics: ['Python', 'Java', 'JavaScript', 'C/C++', 'SQL', 'Go', 'Rust', 'TypeScript'],
      color: 'from-blue-600 to-indigo-700',
    },
    {
      title: 'Data Science & Analytics',
      description: 'Learn data analysis, visualization, and machine learning techniques.',
      icon: '📊',
      topics: ['Python for Data Science', 'R Programming', 'Machine Learning', 'Deep Learning', 'Statistics', 'Data Visualization'],
      color: 'from-emerald-600 to-teal-700',
    },
    {
      title: 'Cloud Computing',
      description: 'Prepare for cloud certifications and master cloud technologies.',
      icon: '☁️',
      topics: ['AWS', 'Microsoft Azure', 'Google Cloud Platform', 'DevOps', 'Docker', 'Kubernetes'],
      color: 'from-amber-600 to-orange-700',
    },
    {
      title: 'Cybersecurity',
      description: 'Learn ethical hacking, security protocols, and cyber defense techniques.',
      icon: '🔒',
      topics: ['Ethical Hacking', 'Network Security', 'Penetration Testing', 'Security+', 'CEH', 'CISSP'],
      color: 'from-red-600 to-rose-700',
    },
    {
      title: 'Web Development',
      description: 'Build modern web applications with frontend and backend technologies.',
      icon: '🌐',
      topics: ['HTML/CSS', 'React', 'Node.js', 'Angular', 'Vue.js', 'MongoDB', 'REST APIs'],
      color: 'from-purple-600 to-violet-700',
    },
    {
      title: 'AI & Machine Learning',
      description: 'Explore artificial intelligence, neural networks, and deep learning.',
      icon: '🤖',
      topics: ['Neural Networks', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Generative AI'],
      color: 'from-cyan-600 to-blue-700',
    },
  ];

  const certifications = [
    { name: 'AWS Solutions Architect', provider: 'Amazon', icon: '☁️', color: 'from-orange-500 to-amber-600' },
    { name: 'Azure Administrator', provider: 'Microsoft', icon: '🔷', color: 'from-blue-500 to-indigo-600' },
    { name: 'Google Cloud Professional', provider: 'Google', icon: '🌈', color: 'from-red-500 to-yellow-500' },
    { name: 'CompTIA Security+', provider: 'CompTIA', icon: '🔒', color: 'from-red-600 to-rose-700' },
    { name: 'Cisco CCNA', provider: 'Cisco', icon: '🔗', color: 'from-cyan-500 to-blue-600' },
    { name: 'PMP', provider: 'PMI', icon: '📋', color: 'from-purple-500 to-violet-600' },
    { name: 'Scrum Master', provider: 'Scrum.org', icon: '🔄', color: 'from-green-500 to-emerald-600' },
    { name: 'Data Science Professional', provider: 'IBM', icon: '📊', color: 'from-blue-600 to-blue-800' },
  ];

  const skills = [
    { name: 'Data Structures', icon: '🌳', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { name: 'Algorithms', icon: '⚙️', color: 'bg-green-100 text-green-700 border-green-300' },
    { name: 'Database Management', icon: '🗄️', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { name: 'Operating Systems', icon: '🖥️', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { name: 'Computer Networks', icon: '🌐', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { name: 'Software Engineering', icon: '🔧', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { name: 'System Design', icon: '📐', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { name: 'Version Control', icon: '📝', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  ];

  const examTypes = [
    { title: 'Aptitude Tests', desc: 'Technical aptitude for placements', icon: '🎯' },
    { title: 'Coding Challenges', desc: 'DSA & problem solving', icon: '💻' },
    { title: 'Certification Prep', desc: 'Industry certifications', icon: '📜' },
    { title: 'Interview Prep', desc: 'Technical interviews', icon: '🎤' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Menubar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/30 rounded-full blur-3xl"></div>
            <div className="absolute top-60 -left-40 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-teal-400/30 rounded-full blur-3xl"></div>
            {/* Code-like decoration */}
            <div className="absolute top-20 left-10 text-cyan-500/20 font-mono text-6xl">&lt;/&gt;</div>
            <div className="absolute bottom-20 right-10 text-blue-500/20 font-mono text-6xl">{'{}'}</div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
                <span className="text-2xl">💻</span>
                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">Test by Domain</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600">
                  Computer Technology
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                Master <span className="font-semibold text-cyan-600 dark:text-cyan-400">Programming</span>, 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> Cloud Computing</span>,
                <span className="font-semibold text-teal-600 dark:text-teal-400"> Data Science</span>, 
                <span className="font-semibold text-indigo-600 dark:text-indigo-400"> AI/ML</span>, and 
                <span className="font-semibold text-emerald-600 dark:text-emerald-400"> Cybersecurity</span> with industry-standard tests
              </p>

              {/* Tech Domains */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {techDomains.map((domain, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-2xl">{domain.icon}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{domain.name}</span>
                  </div>
                ))}
              </div>

              {/* Exam Types */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {examTypes.map((type, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all"
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">{type.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{type.desc}</p>
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
              Technology Domains
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Comprehensive tests covering all major areas of computer technology
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, idx) => (
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
                      {category.topics.slice(0, 4).map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                      {category.topics.length > 4 && (
                        <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-medium">
                          +{category.topics.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Industry Certifications
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Prepare for globally recognized IT certifications
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${cert.color}`}></div>
                  <div className="p-5">
                    <div className="text-3xl mb-2">{cert.icon}</div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">{cert.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{cert.provider}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800 dark:text-white">
              Core Computer Science Skills
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Strengthen your fundamentals with comprehensive practice tests
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
            <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
              {/* Code decorations */}
              <div className="absolute top-4 right-8 text-white/20 font-mono text-4xl">&lt;code/&gt;</div>
              <div className="absolute bottom-4 left-8 text-white/20 font-mono text-4xl">{'{ }'}</div>
              
              <div className="relative text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Level Up Your Tech Skills! 🚀
                </h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                  Practice coding challenges, prepare for certifications, and ace technical interviews with our comprehensive test platform.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-8 py-4 bg-white text-cyan-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Start Coding Now
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

