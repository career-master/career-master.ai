'use client';

import { useEffect, useState, type CSSProperties } from 'react';

/** Must match backend bundled template (1024×682). */
export const CERTIFICATE_TEMPLATE_PUBLIC_PATH = '/certificates/default-certificate-template.png';

const SERIF = '"Times New Roman", Times, Georgia, serif';
const TPL_W = 1024;
const TPL_H = 682;
/** The PDF page is 842pt wide; sizes below are PDF points converted to template pixels. */
const PT = TPL_W / 842;

/** Keep in sync with `ACHIEVEMENT_LINES` in backend/src/certificates/certificatePdf.js. */
const LINES = {
  name: { x0: 353, x1: 605, y: 289 },
  age: { x0: 665, x1: 828, y: 289 },
  dob: { x0: 322, x1: 828, y: 318 },
  course: { x0: 563, x1: 755, y: 378, overflowX1: 935 },
  scope: { x0: 262, x1: 762, y: 392 },
  score: { x0: 358, x1: 574, y: 492 },
  certNo: { x0: 769, x1: 950, y: 496 },
  issue: { x0: 359, x1: 492, y: 590 },
} as const;

type Line = { x0: number; x1: number; y: number; overflowX1?: number };

type FieldStyle = {
  size: number;
  minSize?: number;
  softMin?: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  gap?: number;
};

const NAVY = '#152c52';
const BRONZE = '#9a3412';
const SLATE = '#475569';

let measureCtx: CanvasRenderingContext2D | null = null;

function textWidthPx(text: string, style: FieldStyle, sizePx: number, canMeasure: boolean): number {
  if (canMeasure) {
    if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
    if (measureCtx) {
      measureCtx.font = `${style.italic ? 'italic ' : ''}${style.bold ? 'bold ' : ''}100px ${SERIF}`;
      return (measureCtx.measureText(text).width / 100) * sizePx;
    }
  }
  return text.length * sizePx * (style.bold ? 0.5 : 0.45);
}

/** Same rules as the PDF: shrink to the line (not below softMin), then into the overflow area (not below minSize). */
function fitField(text: string, line: Line, style: FieldStyle, canMeasure: boolean) {
  const lineW = line.x1 - line.x0;
  const maxW = (line.overflowX1 ?? line.x1) - line.x0;
  const minPx = (style.minSize ?? 7) * PT;
  const softPx = (style.softMin ?? style.minSize ?? 7) * PT;
  let px = style.size * PT;
  const w = (p: number) => textWidthPx(text, style, p, canMeasure);
  while (w(px) > lineW && px > softPx) px -= 0.25 * PT;
  while (w(px) > maxW && px > minPx) px -= 0.25 * PT;
  const textW = Math.min(w(px), maxW);
  const left = textW <= lineW ? line.x0 + (lineW - textW) / 2 : line.x0;
  return { px, left, width: Math.max(textW, 1) + 2 };
}

function Field({
  text,
  line,
  style,
  canMeasure,
}: {
  text: string;
  line: Line;
  style: FieldStyle;
  canMeasure: boolean;
}) {
  const value = text.trim();
  if (!value) return null;
  const { px, left, width } = fitField(value, line, style, canMeasure);
  const css: CSSProperties = {
    position: 'absolute',
    left: `${(left / TPL_W) * 100}%`,
    top: `${((line.y - (style.gap ?? 4)) / TPL_H) * 100}%`,
    width: `${(width / TPL_W) * 100}%`,
    transform: 'translateY(-84%)',
    fontFamily: SERIF,
    fontSize: `${(px / TPL_W) * 100}cqw`,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    color: style.color ?? NAVY,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  return (
    <p style={css} title={value}>
      {value}
    </p>
  );
}

export type CertificateAchievementPreviewProps = {
  recipientName: string;
  subjectTitle: string;
  averagePercentage: number;
  issuedOnText?: string;
  dateOfBirthText?: string;
  certificateNumber?: string;
  scopeDescription?: string;
  assignedQuizCount?: number;
  candidateAge?: number | null;
  className?: string;
};

/**
 * Mirrors the PDF: the template supplies labels and lines; we draw only the values on each line.
 */
export function CertificateAchievementPreview({
  recipientName,
  subjectTitle,
  averagePercentage,
  issuedOnText,
  dateOfBirthText,
  certificateNumber,
  scopeDescription,
  assignedQuizCount,
  candidateAge,
  className = '',
}: CertificateAchievementPreviewProps) {
  const [canMeasure, setCanMeasure] = useState(false);
  useEffect(() => setCanMeasure(true), []);

  const pctNum = Number(averagePercentage);
  const pct = Number.isFinite(pctNum) ? `${pctNum.toFixed(1)}%` : '—';
  const scoreText =
    assignedQuizCount != null && Number.isFinite(pctNum)
      ? `${pct} (${assignedQuizCount} quiz${assignedQuizCount === 1 ? '' : 'zes'})`
      : pct;
  const ageText =
    candidateAge != null && candidateAge >= 0 && candidateAge < 130 ? String(candidateAge) : '—';

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg shadow-md ring-1 ring-black/10 ${className}`}
      style={{ aspectRatio: `${TPL_W} / ${TPL_H}`, containerType: 'inline-size' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CERTIFICATE_TEMPLATE_PUBLIC_PATH}
        alt=""
        className="absolute inset-0 h-full w-full"
        width={TPL_W}
        height={TPL_H}
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-0 select-none">
        <Field text={recipientName || 'Student'} line={LINES.name} style={{ size: 17, minSize: 7.5, bold: true }} canMeasure={canMeasure} />
        <Field text={ageText} line={LINES.age} style={{ size: 14, bold: true }} canMeasure={canMeasure} />
        <Field text={dateOfBirthText || '—'} line={LINES.dob} style={{ size: 13 }} canMeasure={canMeasure} />
        <Field
          text={subjectTitle || '—'}
          line={LINES.course}
          style={{ size: 15, softMin: 11, minSize: 7.5, bold: true, color: BRONZE }}
          canMeasure={canMeasure}
        />
        {scopeDescription ? (
          <Field
            text={scopeDescription}
            line={LINES.scope}
            style={{ size: 8.5, minSize: 6, italic: true, color: SLATE, gap: 0 }}
            canMeasure={canMeasure}
          />
        ) : null}
        <Field text={scoreText} line={LINES.score} style={{ size: 13, bold: true }} canMeasure={canMeasure} />
        <Field text={certificateNumber || '—'} line={LINES.certNo} style={{ size: 11.5, minSize: 7, bold: true }} canMeasure={canMeasure} />
        <Field text={issuedOnText || '—'} line={LINES.issue} style={{ size: 12 }} canMeasure={canMeasure} />
      </div>
    </div>
  );
}
