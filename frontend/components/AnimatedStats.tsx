'use client';

import { useEffect, useRef, useState } from 'react';

// Custom hook for counting animation
const useCountAnimation = (end: number, duration = 3500, start = 0) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, 300);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp: number | undefined;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * (end - start) + start));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration, start, isVisible]);

  return [count, ref] as const;
};

// Format number with commas and round to nearest hundred/thousand
const formatNumber = (num: number) => {
  if (num >= 1000) {
    const rounded = Math.round(num / 1000) * 1000;
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '+';
  } else if (num >= 100) {
    const rounded = Math.round(num / 100) * 100;
    return rounded.toString() + '+';
  }
  return num.toString() + '+';
};

interface AnimatedStatProps {
  end: number;
  label: string;
  delay?: number;
  index: number;
}

const AnimatedStat = ({ end, label, delay = 0 }: AnimatedStatProps) => {
  const [count, ref] = useCountAnimation(end);
  const [isHovered, setIsHovered] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowProgress(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const displayNumber = end.toString().includes('%') ? `${count}%` : formatNumber(count);

  return (
    <div
      ref={ref}
      className="group relative flex flex-col items-center transition-all duration-500"
      style={{
        opacity: 0,
        transform: 'scale(0.95)',
        animation: `fadeInUp 0.8s ease-out ${delay}ms forwards`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <span
          className={`text-3xl font-bold transition-all duration-500 ${
            isHovered ? 'text-[#667eea] scale-110' : 'text-[#764ba2]'
          }`}
        >
          {displayNumber}
        </span>
        {isHovered && (
          <div className="absolute inset-0 blur-xl bg-[#667eea]/20 rounded-full -z-10 transition-all duration-500" />
        )}
      </div>
      <span
        className={`text-sm mt-1 transition-colors duration-500 ${
          isHovered ? 'text-white' : 'text-white/70'
        }`}
      >
        {label}
      </span>
      {showProgress && (
        <div className="w-16 h-1 mt-2 bg-gray-200/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full transition-all duration-500"
            style={{
              width: isHovered ? '100%' : `${(count / end) * 100}%`,
              boxShadow: isHovered ? '0 0 10px rgba(102, 126, 234, 0.3)' : 'none',
              transition: 'width 0.8s ease-out, box-shadow 0.5s ease-out',
            }}
          />
        </div>
      )}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default function AnimatedStats() {
  return (
    <>
      <AnimatedStat end={500} label="Courses" delay={0} index={0} />
      <AnimatedStat end={50000} label="Students" delay={300} index={1} />
      <AnimatedStat end={100} label="Instructors" delay={600} index={2} />
      <AnimatedStat end={95} label="Success Rate" delay={900} index={3} />
    </>
  );
}

