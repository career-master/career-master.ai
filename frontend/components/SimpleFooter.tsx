'use client';

export default function SimpleFooter() {
  return (
    <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white pt-2 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left - Logo and Branding */}
          <div className="flex items-center gap-3">
            {/* Logo Image */}
            <img 
              src="/logo.jpeg" 
              alt="CareerMaster.AI Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xs text-gray-400 tracking-[0.15em] font-medium uppercase">Learn • Grow • Succeed</span>
          </div>

          {/* Center - Copyright */}
          <p className="text-gray-400 text-sm text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            © {new Date().getFullYear()} CareerMaster.AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

