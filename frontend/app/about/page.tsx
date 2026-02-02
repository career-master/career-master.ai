'use client';

import Menubar from '@/components/Menubar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Menubar />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-blue-100">Empowering learners to achieve their dreams</p>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <span className="text-5xl mr-4">🎯</span>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                To become the leading platform for comprehensive education and career development, empowering learners
                at every stage of their journey. We envision a world where quality education is accessible to everyone,
                regardless of their background or location.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Our vision extends beyond just providing quizzes and tests. We aim to create a holistic learning
                ecosystem that nurtures curiosity, builds confidence, and prepares students for the challenges of
                tomorrow.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">What We Strive For</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Democratize quality education for all</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Bridge the gap between learning and career success</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Create lifelong learners and achievers</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Foster innovation in education technology</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
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
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                To provide accessible, high-quality educational resources and assessments that help students achieve
                their academic and career goals. We are committed to delivering personalized learning experiences
                that adapt to each student's unique needs and pace.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Through our comprehensive quiz system, real-time analytics, and expert guidance, we empower students
                to track their progress, identify areas for improvement, and achieve excellence in their chosen fields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Section */}
      <section id="why-we" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-5xl">💪</span>
            <h2 className="text-4xl font-bold mt-4 text-gray-900 dark:text-white">Why Choose Us?</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
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

