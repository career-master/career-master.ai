'use client';

export default function CertificateSection() {
  return (
    <section id="certificates" className="py-20 bg-gray-50 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
        {/* Left: Text Content */}
        <div className="flex-1 max-w-4xl pl-0 md:pl-24 transition-all duration-1000 animate-fade-in">
          <h2 className="text-3xl md:text-3xl font-bold mb-6" style={{ color: '#060e37' }}>
            Gain Recognition. Grow Professionally
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Your successful completion will be marked with a certified document, suitable for resumes
            and professional profiles.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#667eea] bg-opacity-10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#667eea]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#060e37' }}>
                  Industry-Recognized
                </h3>
                <p className="text-gray-500">Certificates that hold weight in the professional world.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#667eea] bg-opacity-10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#667eea]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#060e37' }}>
                  Shareable Achievement
                </h3>
                <p className="text-gray-500">
                  Easily share your accomplishment on LinkedIn, resumes, and more.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#667eea] bg-opacity-10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#667eea]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#060e37' }}>
                  Stand Out
                </h3>
                <p className="text-gray-500">
                  Differentiate yourself in job applications and professional networks.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Certificate Image */}
        <div className="flex-1 flex justify-center transition-all duration-1000 animate-fade-in">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
            <div className="border-4 border-[#667eea] rounded-lg p-6 text-center">
              <svg className="w-24 h-24 text-[#667eea] mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Certificate of Completion</h3>
              <p className="text-gray-600">Career Master</p>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">This certificate verifies successful completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

