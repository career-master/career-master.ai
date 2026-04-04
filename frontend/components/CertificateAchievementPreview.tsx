'use client';

/** Must match backend bundled template (1024×682). */
export const CERTIFICATE_TEMPLATE_PUBLIC_PATH = '/certificates/default-certificate-template.png';

const SERIF = '"Times New Roman", Times, Georgia, serif';

export type CertificateAchievementPreviewProps = {
  recipientName: string;
  subjectTitle: string;
  averagePercentage: number;
  issuedOnText?: string;
  quizAchievementDateText?: string;
  certificateNumber?: string;
  scopeDescription?: string;
  assignedQuizCount?: number;
  candidateAge?: number | null;
  className?: string;
};

/**
 * Mirrors PDF: template supplies labels — we show **values only** in the same regions (1024×682).
 */
export function CertificateAchievementPreview({
  recipientName,
  subjectTitle,
  averagePercentage,
  issuedOnText,
  quizAchievementDateText,
  certificateNumber,
  scopeDescription,
  assignedQuizCount,
  candidateAge,
  className = '',
}: CertificateAchievementPreviewProps) {
  const achievementDate = (quizAchievementDateText || issuedOnText || '—').trim();
  const issueDate = (issuedOnText || '—').trim();
  const pct = Number(averagePercentage).toFixed(1);
  const pctWithNote =
    assignedQuizCount != null
      ? `${pct}% (${assignedQuizCount} quiz${assignedQuizCount === 1 ? '' : 'zes'})`
      : `${pct}%`;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg shadow-md ring-1 ring-black/10 ${className}`}
      style={{ aspectRatio: '1024 / 682', fontFamily: SERIF }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CERTIFICATE_TEMPLATE_PUBLIC_PATH}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1024}
        height={682}
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-0 select-none text-[#152c52]">
        <p
          className="absolute left-[18%] top-[34.5%] max-w-[35%] truncate font-bold leading-none"
          style={{ fontFamily: SERIF, fontSize: 'clamp(0.65rem, 2.4vw, 0.8rem)' }}
          title={recipientName}
        >
          {recipientName || 'Student'}
        </p>
        {candidateAge != null && candidateAge >= 0 && candidateAge < 130 ? (
          <p
            className="absolute left-[61%] top-[34.5%] w-[10%] text-center leading-none"
            style={{ fontFamily: SERIF, fontSize: 'clamp(0.6rem, 2.1vw, 0.72rem)' }}
          >
            {candidateAge}
          </p>
        ) : null}
        <p
          className="absolute left-1/2 top-[39%] w-[52%] -translate-x-1/2 text-center leading-none"
          style={{ fontFamily: SERIF, fontSize: 'clamp(0.55rem, 2vw, 0.68rem)' }}
        >
          {achievementDate}
        </p>
        <p
          className="absolute left-1/2 top-[46%] w-[54%] -translate-x-1/2 truncate text-center font-bold leading-none text-[#9a3412]"
          style={{ fontFamily: SERIF, fontSize: 'clamp(0.6rem, 2.2vw, 0.75rem)' }}
          title={subjectTitle}
        >
          {subjectTitle || '—'}
        </p>
        {scopeDescription ? (
          <p
            className="absolute left-1/2 top-[49%] w-[60%] -translate-x-1/2 text-center leading-tight text-slate-600"
            style={{ fontFamily: SERIF, fontSize: 'clamp(0.45rem, 1.6vw, 0.55rem)' }}
          >
            {scopeDescription}
          </p>
        ) : null}
        <p
          className="absolute left-[27%] top-[58.2%] max-w-[14%] truncate leading-none"
          style={{ fontFamily: SERIF, fontSize: 'clamp(0.55rem, 2vw, 0.7rem)' }}
        >
          {pctWithNote}
        </p>
        {certificateNumber ? (
          <p
            className="absolute left-[60.5%] top-[58.2%] max-w-[24%] truncate leading-none"
            style={{ fontFamily: SERIF, fontSize: 'clamp(0.55rem, 2vw, 0.7rem)' }}
            title={certificateNumber}
          >
            {certificateNumber}
          </p>
        ) : null}
        <p
          className="absolute bottom-[8.8%] left-[28%] max-w-[36%] truncate leading-none"
          style={{ fontFamily: SERIF, fontSize: 'clamp(0.55rem, 2vw, 0.7rem)' }}
        >
          {issueDate}
        </p>
      </div>
    </div>
  );
}
