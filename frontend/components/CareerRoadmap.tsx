'use client';

// Icon components
const CodeIcon = () => (
  <svg className="w-12 h-12 mb-3 text-[#0a1854]" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const LaptopIcon = () => (
  <svg className="w-12 h-12 mb-3 text-[#0a1854]" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
  </svg>
);

const RobotIcon = () => (
  <svg className="w-12 h-12 mb-3 text-[#0a1854]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13 7H7v6h6V7z" />
    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-12 h-12 mb-3 text-[#0a1854]" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-12 h-12 mb-3 text-[#0a1854]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-8 text-[#0a1854] drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const roadmapData = [
  {
    title: 'Code Foundations',
    icon: <CodeIcon />,
    duration: '30 Weeks',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    description:
      'Kickstart your programming journey by learning how to think like a developer. Build strong logical and analytical skills.',
    outcomes: ['Programming constructs & logic', 'Programming fundamentals', 'Basics of computer science'],
  },
  {
    title: 'Full Stack Mastery',
    icon: <LaptopIcon />,
    duration: '40 Weeks',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
    description:
      'Master the art of developing complete web applications using both frontend and backend technologies.',
    outcomes: [
      'Frontend with HTML, CSS, JS, React',
      'Backend with Node.js, Express & More',
      'Database integration and APIs',
    ],
  },
  {
    title: 'Tech Specialization',
    icon: <RobotIcon />,
    duration: '40 Weeks',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
    description:
      'Dive deeper into advanced technologies based on your interest and career goals in the 4.0 industry space.',
    outcomes: [
      'Choose from domains like AI, DevOps, Cloud, or Data Science',
      'Advanced frameworks and tools',
      'Hands-on specialization projects',
    ],
  },
  {
    title: 'Project Accelerator',
    icon: <ProjectIcon />,
    duration: '20 Weeks',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    description:
      'Build and deploy real-world applications that simulate industry standards and workflows.',
    outcomes: [
      'Agile-based team projects',
      'Code reviews and version control',
      'Scalable and production-ready apps',
    ],
  },
  {
    title: 'Career Launchpad',
    icon: <RocketIcon />,
    duration: 'Until Placement',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
    description:
      'Receive end-to-end career support till you land a top role, with salaries up to ₹24 LPA.',
    outcomes: [
      'Interview preparation and mock sessions',
      'Industry networking opportunities',
      'Placement assistance and support',
    ],
  },
];

interface FlipCardProps {
  data: (typeof roadmapData)[0];
  index: number;
}

const FlipCard = ({ data, index }: FlipCardProps) => {
  return (
    <div className="relative group overflow-visible">
      <div className="relative h-[280px] sm:h-[300px] lg:h-[320px] w-full rounded-2xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front of card */}
        <div className="absolute w-full h-full rounded-2xl [backface-visibility:hidden] overflow-hidden">
          <img src={data.image} alt={data.title} className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center justify-end z-10">
            <h3 className="text-lg font-bold text-white mb-1 text-center drop-shadow-lg">
              {data.title}
            </h3>
            <p className="text-white text-sm font-semibold drop-shadow-lg">{data.duration}</p>
          </div>
        </div>
        {/* Back of card */}
        <div className="absolute w-full h-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center bg-[#0a1854] p-5">
          <div className="text-white flex items-center justify-center">{data.icon}</div>
          <p className="text-white mb-4 text-center text-sm leading-relaxed">{data.description}</p>
          {data.outcomes && (
            <ul className="text-white space-y-1.5 px-3 text-left list-disc list-inside text-xs">
              {data.outcomes.map((outcome, i) => (
                <li key={i}>{outcome}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Arrow between cards */}
      {index < roadmapData.length - 1 && (
        <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 hidden xl:block z-10">
          <div className="animate-pulse">
            <ArrowIcon />
          </div>
        </div>
      )}
    </div>
  );
};

export default function CareerRoadmap() {
  return (
    <section id="roadmap" className="py-16 pb-24 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#0a1854]">
          Your Career Roadmap
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 lg:gap-10">
          {roadmapData.map((data, index) => (
            <FlipCard key={index} data={data} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

