'use client';

import { useEffect, useState } from 'react';

const SIZE_CLASSES = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-14 w-14 text-xl',
} as const;

/** Stable hue from name for varied but consistent “3D” orbs */
function gradientForName(name: string): string {
  let n = 7;
  const s = name || '?';
  for (let i = 0; i < s.length; i += 1) n = (n * 31 + s.charCodeAt(i)) >>> 0;
  const h = n % 360;
  const h2 = (h + 40) % 360;
  return `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.08) 28%, transparent 42%),
    radial-gradient(circle at 50% 100%, rgba(0,0,0,0.22) 0%, transparent 55%),
    linear-gradient(145deg, hsl(${h}, 82%, 62%) 0%, hsl(${h}, 70%, 48%) 45%, hsl(${h2}, 65%, 38%) 100%)`;
}

export default function ProfileAvatar3D({
  src,
  name,
  size = 'md',
  className = '',
}: {
  src?: string | null;
  name?: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const trimmed = typeof src === 'string' ? src.trim() : '';
  const showImg = Boolean(trimmed && !failed);
  const initial = (name?.trim()?.charAt(0) || '?').toUpperCase();

  useEffect(() => {
    setFailed(false);
  }, [trimmed]);

  const dim = SIZE_CLASSES[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${dim} ${className}`}
      aria-hidden={showImg ? undefined : true}
    >
      {showImg ? (
        <img
          src={trimmed}
          alt=""
          className="h-full w-full rounded-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full font-bold uppercase tracking-tight text-white"
          style={{
            background: gradientForName(name || initial),
            boxShadow:
              'inset 0 2px 6px rgba(255,255,255,0.45), inset 0 -5px 10px rgba(0,0,0,0.2), 0 4px 14px rgba(15,23,42,0.25)',
            textShadow: '0 1px 2px rgba(0,0,0,0.35)',
          }}
          title={name || 'Student'}
        >
          <span className="select-none">{initial}</span>
        </div>
      )}
    </div>
  );
}
