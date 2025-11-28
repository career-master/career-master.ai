'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AnimatedStats from '@/components/AnimatedStats';
import CertificateSection from '@/components/CertificateSection';
import CareerRoadmap from '@/components/CareerRoadmap';
import TypewriterText from '@/components/TypewriterText';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section Container with Gradient */}
      <div className="relative min-h-screen bg-gradient-to-b from-[#010626] to-[#0a1854] pt-[4.5rem]">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section Content */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 relative">
            {/* Background Elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center pt-20">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                <TypewriterText
                  text="Career Master AI Platform"
                  speed={100}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
                />
              </h1>

              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/80 leading-relaxed">
                <TypewriterText
                  text="Get started with your immersive learning journey now! Access cutting-edge training solutions and personalized learning experiences powered by AI."
                  speed={30}
                  className="text-lg md:text-xl text-white/80"
                />
              </p>

              <div className="flex justify-center gap-4">
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5568d3] hover:to-[#6a3d8f] text-white font-bold py-3 px-8 rounded-md transition duration-300 shadow-lg shadow-[#667eea]/20 text-center min-w-[180px]"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="bg-transparent border-2 border-white/30 hover:border-white/50 text-white font-bold py-3 px-8 rounded-md transition duration-300 text-center min-w-[180px]"
                >
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-white">
                <AnimatedStats />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Target Audience Section */}
      <section id="target-audience" className="py-20 bg-white -mt-[100px] pt-32 relative z-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#060e37' }}>
              Who Can Use This Portal?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Career Master AI is designed for learners at every stage of their academic and professional journey. 
              From school students to research scholars, we provide comprehensive learning solutions tailored to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { 
                title: 'Class 3 to 10', 
                subtitle: 'K-12 School Students',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                description: 'Build strong foundations with age-appropriate content and interactive learning.'
              },
              { 
                title: 'Intermediate / Higher Secondary', 
                subtitle: '10+2 Students',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                description: 'Prepare for board exams and competitive entrance tests with comprehensive resources.'
              },
              { 
                title: 'Degree Students', 
                subtitle: 'UG – Arts, Science, Commerce',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                description: 'Enhance your subject knowledge and develop skills for career readiness.'
              },
              { 
                title: 'Engineering', 
                subtitle: 'All Branches',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ),
                description: 'Master technical concepts, programming, and engineering fundamentals across all disciplines.'
              },
              { 
                title: 'Medicine', 
                subtitle: 'MBBS & Paramedical',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                description: 'Comprehensive medical education resources and exam preparation materials.'
              },
              { 
                title: 'Post Graduate', 
                subtitle: 'M.Tech, MBA, MSc, MA, etc.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                description: 'Advanced learning modules for specialized postgraduate programs and research.'
              },
              { 
                title: 'PhD & Research Scholars', 
                subtitle: 'Advanced Research',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                description: 'Specialized resources for research methodology, academic writing, and scholarly work.'
              },
            ].map((category, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-[#667eea]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center text-white">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1" style={{ color: '#060e37' }}>
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{category.subtitle}</p>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quiz Topics Section */}
          <div className="mt-16 pt-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#060e37' }}>
                Comprehensive Quiz Topics & Learning Domains
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Explore a wide range of quiz topics covering academic subjects, competitive exams, and professional skills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Subject-Based Academics (Maths, Science, Social, Languages, etc.)',
                'Olympiads (SOF, IMO, NSO, Cyber, NTSE, etc.)',
                'Aptitude (Quantitative, Logical, DI)',
                'Reasoning (Analytical, Verbal & Non-Verbal)',
                'Soft Skills (Vocabulary, Communication, Grammar)',
                'Competitive Exams (GATE, CAT, EAMCET, UPSC, SSC, NEET, JEE, GRE, IELTS, etc.)',
                'Computer & Technology (Programming, AI, ML, DBMS, Cloud, Testing, Cyber Security, etc.)',
                'General Knowledge & Current Affairs',
                'Career Skills (Resume, Interview, Etiquette, Corporate Skills)',
                'Cultural, Arts, Heritage, Festivals & Traditions',
                'Interview & Placement Preparation',
              ].map((topic, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-[#667eea] transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-[#667eea] rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700 font-medium">{topic}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 relative z-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#060e37' }}>
            Boost Your Career With Our Unique Advantages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#060e37' }}>
                Dynamic Learning Experiences
              </h3>
              <p className="text-gray-600">Participate in hands-on sessions that make concepts come alive.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#060e37' }}>
                Detailed Progress Checks
              </h3>
              <p className="text-gray-600">Regular, focused assessments to ensure deep understanding.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#060e37' }}>
                Mindset for Success
              </h3>
              <p className="text-gray-600">Develop resilience and adaptability with proven strategies.</p>
            </div>
            {/* Feature 4 */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#060e37' }}>
                Showcase Your Skills
              </h3>
              <p className="text-gray-600">Build a portfolio and share your achievements on top platforms.</p>
            </div>
            {/* Feature 5 */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#060e37' }}>
                Elite Tech Community
              </h3>
              <p className="text-gray-600">Join a network of passionate learners and industry leaders.</p>
            </div>
            {/* Feature 6 */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#060e37' }}>
                Industry-Aligned Curriculum
              </h3>
              <p className="text-gray-600">Learn with content designed in collaboration with top companies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#060e37' }}>
            Showcase Your Skills with Real Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project cards - simplified version */}
            {[
              { title: 'E-Learning Platform', desc: 'Develop a full-stack online learning portal' },
              { title: 'AI Chatbot', desc: 'Build a smart chatbot for student support' },
              { title: 'Quiz Application', desc: 'Create a dynamic quiz system with analytics' },
            ].map((project, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 group hover:shadow-2xl hover:scale-105 transition-all duration-500"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-2 transition-all duration-500 group-hover:text-[#667eea]">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Roadmap Section */}
      <CareerRoadmap />

      {/* Certificate Section */}
      <CertificateSection />
    </div>
  );
}
