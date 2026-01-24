'use client';

import Link from 'next/link';
import Menubar from '@/components/Menubar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [counterStats, setCounterStats] = useState({
    students: 0,
    quizzes: 0,
    success: 0,
    awards: 0,
  });

  // Slider images (placeholder - replace with actual images)
  const sliderImages = [
    { src: '/api/placeholder/1920/600', alt: 'Learning Platform' },
    { src: '/api/placeholder/1920/600', alt: 'Quiz System' },
    { src: '/api/placeholder/1920/600', alt: 'Success Stories' },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Counter animation
  useEffect(() => {
    const targets = { students: 10000, quizzes: 5000, success: 95, awards: 200 };
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      setCounterStats({
        students: Math.floor(targets.students * progress),
        quizzes: Math.floor(targets.quizzes * progress),
        success: Math.floor(targets.success * progress),
        awards: Math.floor(targets.awards * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, increment);
  }, []);

  // Latest competitive exams (scrolling)
  const latestExams = [
    'UPSC Civil Services 2025',
    'SSC CGL 2025',
    'JEE Main 2025',
    'NEET 2025',
    'GATE 2025',
    'CAT 2025',
    'Banking PO 2025',
    'Railway NTPC 2025',
  ];

  // New features (scrolling)
  const newFeatures = [
    'AI-Powered Quiz Recommendations',
    'Real-time Performance Analytics',
    'Personalized Learning Paths',
    'Interactive Video Lessons',
    'Mobile App Launch',
    'Advanced Progress Tracking',
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Menubar />

      {/* Slider Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-4xl md:text-6xl font-bold mb-4">{image.alt}</h2>
                <p className="text-xl md:text-2xl">Your journey to success starts here</p>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">About Us</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Vision */}
            <div id="vision" className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <h3 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">Vision</h3>
              <p className="text-gray-700 dark:text-gray-300">
                To become the leading platform for comprehensive education and career development, empowering learners
                at every stage of their journey.
              </p>
            </div>

            {/* Mission */}
            <div id="mission" className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <h3 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">Mission</h3>
              <p className="text-gray-700 dark:text-gray-300">
                To provide accessible, high-quality educational resources and assessments that help students achieve
                their academic and career goals.
              </p>
            </div>

            {/* Why We? */}
            <div id="why-we" className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <h3 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">Why We?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We combine cutting-edge technology with expert-curated content to deliver personalized learning
                experiences that drive real results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Counter Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{counterStats.students.toLocaleString()}+</div>
              <div className="text-lg">Active Students</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{counterStats.quizzes.toLocaleString()}+</div>
              <div className="text-lg">Quizzes Available</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{counterStats.success}%</div>
              <div className="text-lg">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{counterStats.awards}+</div>
              <div className="text-lg">Awards Won</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose CareerMaster.AI? */}
      <section id="why-choose" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose CareerMaster.AI?</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Comprehensive Content',
                description: 'Access thousands of quizzes covering all subjects and competitive exams.',
                icon: '📚',
              },
              {
                title: 'AI-Powered Learning',
                description: 'Personalized recommendations and adaptive learning paths.',
                icon: '🤖',
              },
              {
                title: 'Real-time Analytics',
                description: 'Track your progress with detailed performance insights.',
                icon: '📊',
              },
              {
                title: 'Expert Guidance',
                description: 'Learn from industry experts and experienced educators.',
                icon: '👨‍🏫',
              },
              {
                title: 'Flexible Learning',
                description: 'Study at your own pace, anytime, anywhere.',
                icon: '⏰',
              },
              {
                title: 'Certification',
                description: 'Earn certificates upon completion of courses.',
                icon: '🏆',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Use This Portal? */}
      <section id="who-can-use" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Who Can Use This Portal?</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Class 3-10 Students',
              '10+2 / Intermediate',
              'Degree Students',
              'Post Graduate',
              'Ph.D Scholars',
              'Competitive Exam Aspirants',
              'Working Professionals',
              'Career Changers',
            ].map((category, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md text-center hover:scale-105 transition-transform cursor-pointer">
                <div className="text-3xl mb-2">🎓</div>
                <h3 className="font-bold text-gray-900 dark:text-white">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Quiz Topics & Learning Domains */}
      <section id="quiz-topics" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Comprehensive Quiz Topics & Learning Domains
            </h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Subject-Based Academics',
              'Olympiads (SOF, IMO, NSO, Cyber, NTSE)',
              'Aptitude (Quantitative, Logical, DI)',
              'Reasoning (Analytical, Verbal & Non-Verbal)',
              'Soft Skills (Vocabulary, Communication, Grammar)',
              'Competitive Exams (GATE, CAT, EAMCET, UPSC, SSC, NEET, JEE)',
              'Computer & Technology',
              'General Knowledge & Current Affairs',
              'Career Skills',
              'Cultural, Arts, Heritage, Festivals',
              'Interview & Placement Preparation',
            ].map((topic, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-orange-500 hover:shadow-lg transition-shadow"
              >
                <p className="text-gray-900 dark:text-white font-medium">{topic}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section id="certification" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Get Certified</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
              Earn recognized certificates upon completion of courses and assessments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((cert, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg text-center hover:scale-105 transition-transform cursor-pointer">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Certificate {cert}</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Complete the course and assessments to earn your certificate
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Pricing Plans</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Basic',
                price: 'Free',
                features: ['Limited Quizzes', 'Basic Analytics', 'Community Support'],
              },
              {
                name: 'Premium',
                price: '₹999',
                period: '/month',
                features: ['Unlimited Quizzes', 'Advanced Analytics', 'Priority Support', 'Certificates'],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                features: ['Everything in Premium', 'Custom Content', 'Dedicated Support', 'API Access'],
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-lg ${
                  plan.popular ? 'border-4 border-orange-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-orange-500 text-white text-center py-1 rounded-t-lg -mt-8 -mx-8 mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">{plan.price}</span>
                  {plan.period && <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    plan.popular
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section id="clients" className="py-20 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Our Clients</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>
        </div>

        <div className="flex animate-scroll-slow">
          <div className="flex space-x-8 px-4">
            {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((client, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md flex items-center justify-center h-24 min-w-[200px]"
              >
                <div className="text-2xl font-bold text-gray-400">Client {client}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Site Tour Video */}
      <section id="site-tour" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Site Tour Video</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">Video Placeholder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Competitive Exams (Scrolling) */}
      <section className="py-8 bg-orange-500 text-white overflow-hidden">
        <div className="flex space-x-8 animate-scroll">
          <div className="flex space-x-8 whitespace-nowrap">
            {[...latestExams, ...latestExams].map((exam, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-lg font-medium">{exam}</span>
                <span className="text-orange-300">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Features Added (Scrolling) */}
      <section className="py-8 bg-blue-600 text-white overflow-hidden">
        <div className="flex space-x-8 animate-scroll-reverse">
          <div className="flex space-x-8 whitespace-nowrap">
            {[...newFeatures, ...newFeatures].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-lg font-medium">✨ {feature}</span>
                <span className="text-blue-300">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success-stories" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Success Stories</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rajesh Kumar',
                role: 'UPSC Aspirant',
                story: 'CareerMaster.AI helped me clear UPSC prelims with comprehensive mock tests and analytics.',
                image: '👨‍💼',
              },
              {
                name: 'Priya Sharma',
                role: 'JEE Student',
                story: 'The AI-powered recommendations helped me focus on weak areas and improve my score significantly.',
                image: '👩‍🎓',
              },
              {
                name: 'Amit Patel',
                role: 'GATE Aspirant',
                story: 'Excellent platform for GATE preparation with detailed explanations and performance tracking.',
                image: '👨‍🔬',
              },
            ].map((story, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
                <div className="text-5xl mb-4 text-center">{story.image}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{story.name}</h3>
                <p className="text-orange-600 dark:text-orange-400 mb-3">{story.role}</p>
                <p className="text-gray-700 dark:text-gray-300">{story.story}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
