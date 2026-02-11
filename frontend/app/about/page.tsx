'use client';

import Menubar from '@/components/Menubar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Menubar />

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-blue-100">Empowering learners to achieve their dreams</p>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-6">
                <span className="text-5xl mr-4">🎯</span>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                To become a global AI-powered learning ecosystem that empowers learners of all ages to achieve academic excellence, career success, and lifelong growth.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">What We Strive For</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Global AI-powered learning ecosystem</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Academic excellence & career success</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Intelligent personalized learning</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Data-driven insights & innovation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">Our Commitments</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2">🎓</span>
                  <span>Quality content curated by experts</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">💡</span>
                  <span>Innovative learning methodologies</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📊</span>
                  <span>Data-driven performance insights</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🤝</span>
                  <span>Student-first approach always</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-6">
                <span className="text-5xl mr-4">🚀</span>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 mt-0.5 text-sm">✓</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    To deliver AI-driven personalized learning paths that adapt to every learner&apos;s strengths, weaknesses, and goals.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 mt-0.5 text-sm">✓</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    To provide smart quizzes, progress analytics, and performance dashboards that help learners track, analyze, and improve continuously.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 mt-0.5 text-sm">✓</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    To make learning engaging through gamification, including badges, levels, streaks, and leaderboards.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 mt-0.5 text-sm">✓</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    To support learners from Class 3 to PhD and professionals, across academics, competitive exams, and skill development.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 mt-0.5 text-sm">✓</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    To enable educators and institutions with actionable insights to improve teaching effectiveness and learner outcomes.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 mt-0.5 text-sm">✓</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    To foster a culture of continuous improvement, curiosity, and confidence through technology-powered education.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Section */}
      <section id="why-we" className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-5xl">💪</span>
            <h2 className="text-4xl font-bold mt-4 text-gray-900 dark:text-white">Why Choose Us?</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">AI-Powered Learning</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our intelligent system adapts to your learning style and recommends personalized content.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Expert Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All our quizzes and materials are created and reviewed by industry experts and educators.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Real-time Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your progress with detailed insights and identify areas for improvement.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-orange-500 text-white p-6 rounded-xl text-center">
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-orange-100">Active Students</div>
            </div>
            <div className="bg-blue-500 text-white p-6 rounded-xl text-center">
              <div className="text-3xl font-bold">5,000+</div>
              <div className="text-blue-100">Quizzes Available</div>
            </div>
            <div className="bg-green-500 text-white p-6 rounded-xl text-center">
              <div className="text-3xl font-bold">95%</div>
              <div className="text-green-100">Success Rate</div>
            </div>
            <div className="bg-purple-500 text-white p-6 rounded-xl text-center">
              <div className="text-3xl font-bold">200+</div>
              <div className="text-purple-100">Expert Educators</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

