const PDFDocument = require('pdfkit');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

/**
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
function fetchUrlToBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrlToBuffer(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

/** A4 landscape points (pdfkit default) */
const W = 842;
const H = 595;

/** Fallback if JPEG/PNG dimensions cannot be read from buffer (replace asset with your real template). */
const BUNDLED_TEMPLATE_W = 1024;
const BUNDLED_TEMPLATE_H = 682;

/**
 * Read width/height from JPEG or PNG buffer so scaling stays correct when you swap the template file.
 */
function imageIntrinsicSize(buffer) {
  if (!buffer || buffer.length < 24) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let i = 2;
    while (i < buffer.length - 8) {
      if (buffer[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buffer[i + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return { w: buffer.readUInt16BE(i + 7), h: buffer.readUInt16BE(i + 5) };
      }
      if (marker === 0xd8) {
        i += 2;
        continue;
      }
      const segLen = buffer.readUInt16BE(i + 2);
      i += 2 + segLen;
    }
    return null;
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer.toString('ascii', 12, 16) === 'IHDR') {
    return { w: buffer.readUInt32BE(16), h: buffer.readUInt32BE(20) };
  }
  return null;
}

function loadBundledAchievementTemplateBuffer() {
  const candidates = [
    path.join(__dirname, 'assets', 'default-certificate-template.png'),
    path.join(__dirname, 'assets', 'default-certificate-template.jpg')
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p);
    } catch {
      /* continue */
    }
  }
  return null;
}

/**
 * Achievement template image: URL (e.g. Cloudinary) → server file path → bundled asset.
 */
async function resolveAchievementTemplateBuffer() {
  const url = env.CERTIFICATE_ACHIEVEMENT_TEMPLATE_URL && String(env.CERTIFICATE_ACHIEVEMENT_TEMPLATE_URL).trim();
  if (url) {
    try {
      const buf = await fetchUrlToBuffer(url);
      if (buf && buf.length > 0) return buf;
    } catch {
      /* fall through */
    }
  }
  const custom = env.CERTIFICATE_ACHIEVEMENT_TEMPLATE_PATH && String(env.CERTIFICATE_ACHIEVEMENT_TEMPLATE_PATH).trim();
  if (custom) {
    try {
      if (fs.existsSync(custom)) return fs.readFileSync(custom);
    } catch {
      /* fall through */
    }
  }
  return loadBundledAchievementTemplateBuffer();
}

/**
 * @param {object|null|undefined} userLean - user doc with profile.dateOfBirth
 */
function formatDobForCertificate(userLean) {
  const raw = userLean?.profile?.dateOfBirth;
  if (!raw) return { candidateAge: null, dateOfBirthText: null };
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return { candidateAge: null, dateOfBirthText: null };
  const dateOfBirthText = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const candidateAge = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return { candidateAge, dateOfBirthText };
}

/**
 * Achievement layout: bundled **1024×682** template already prints labels
 * (Candidate Name, Age, Date of Birth line → we put *quiz date* on that line, Course Name, Score, etc.).
 * We draw **values only** in Times to match the serif artwork; coords are template pixels → page space.
 */
function buildAchievementCertificatePdf(opts) {
  const {
    recipientName,
    subjectTitle,
    averagePercentage,
    issuedOnText,
    templateBuffer,
    certificateNumber,
    certificateScopeLine,
    candidateAge,
    quizAchievementDateText,
    assignedQuizCount
  } = opts;

  const intr = imageIntrinsicSize(templateBuffer);
  const tw = intr?.w || BUNDLED_TEMPLATE_W;
  const th = intr?.h || BUNDLED_TEMPLATE_H;
  const scale = Math.max(W / tw, H / th);
  const drawW = tw * scale;
  const drawH = th * scale;
  const ox = (W - drawW) / 2;
  const oy = (H - drawH) / 2;

  const navy = '#152c52';
  const bronze = '#9a3412';

  const achievementDate = quizAchievementDateText || issuedOnText || '—';
  const issueDate = issuedOnText || '—';
  const pct = Number(averagePercentage).toFixed(1);
  const pctWithNote =
    assignedQuizCount != null ? `${pct}% (${assignedQuizCount} quiz${assignedQuizCount === 1 ? '' : 'zes'})` : `${pct}%`;

  /**
   * Template pixels (1024×682). For `align: 'center'`, `x` is the **left** edge of the text box (center − width/2).
   */
  const TP = {
    name: { x: 188, y: 236, w: 360 },
    age: { x: 628, y: 236, w: 96 },
    quizDate: { x: 252, y: 266, w: 520 },
    course: { x: 242, y: 314, w: 540 },
    scope: { x: 212, y: 334, w: 600 },
    scoreVal: { x: 278, y: 398, w: 120 },
    certVal: { x: 618, y: 398, w: 220 },
    issueVal: { x: 286, y: 612, w: 340 }
  };

  const px = (ix, iy) => ({ x: ox + ix * scale, y: oy + iy * scale });
  const pw = (w) => w * scale;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [W, H],
      layout: 'landscape',
      margin: 0
    });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    try {
      doc.image(templateBuffer, ox, oy, { width: drawW, height: drawH });

      const pName = px(TP.name.x, TP.name.y);
      doc.font('Times-Bold').fontSize(12).fillColor(navy);
      doc.text((recipientName || 'Student').trim(), pName.x, pName.y, { width: pw(TP.name.w) });

      const pAge = px(TP.age.x, TP.age.y);
      doc.font('Times-Roman').fontSize(11).fillColor(navy);
      if (candidateAge != null && candidateAge >= 0 && candidateAge < 130) {
        doc.text(String(candidateAge), pAge.x, pAge.y, { width: pw(TP.age.w), align: 'center' });
      }

      /* On the printed “Date of Birth” line we only write the quiz date (label stays on artwork). */
      const pQuiz = px(TP.quizDate.x, TP.quizDate.y);
      doc.font('Times-Roman').fontSize(10).fillColor(navy);
      doc.text(achievementDate, pQuiz.x, pQuiz.y, {
        width: pw(TP.quizDate.w),
        align: 'center'
      });

      const pCourse = px(TP.course.x, TP.course.y);
      doc.font('Times-Bold').fontSize(11).fillColor(bronze);
      doc.text((subjectTitle || '—').trim(), pCourse.x, pCourse.y, {
        width: pw(TP.course.w),
        align: 'center'
      });

      if (certificateScopeLine && String(certificateScopeLine).trim()) {
        const pSc = px(TP.scope.x, TP.scope.y);
        doc.font('Times-Roman').fontSize(8).fillColor('#475569');
        doc.text(String(certificateScopeLine).trim(), pSc.x, pSc.y, {
          width: pw(TP.scope.w),
          align: 'center'
        });
      }

      const pScore = px(TP.scoreVal.x, TP.scoreVal.y);
      doc.font('Times-Roman').fontSize(11).fillColor(navy);
      doc.text(pctWithNote, pScore.x, pScore.y, { width: pw(TP.scoreVal.w) });

      const pCert = px(TP.certVal.x, TP.certVal.y);
      doc.text((certificateNumber || '—').trim(), pCert.x, pCert.y, {
        width: pw(TP.certVal.w)
      });

      const pIss = px(TP.issueVal.x, TP.issueVal.y);
      doc.text(issueDate, pIss.x, pIss.y, { width: pw(TP.issueVal.w) });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

/** Original text-forward layout (optional URL background texture). */
function buildLegacyCertificatePdf(opts) {
  const {
    recipientName,
    subjectTitle,
    averagePercentage,
    issuedOnText,
    backgroundImageBuffer,
    assignedQuizCount,
    certificateScopeLine,
    certificateNumber,
    candidateAge,
    dateOfBirthText
  } = opts;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [W, H],
      layout: 'landscape',
      margin: 0
    });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    try {
      if (backgroundImageBuffer && backgroundImageBuffer.length > 0) {
        try {
          doc.image(backgroundImageBuffer, 0, 0, { width: W, height: H });
        } catch {
          doc.rect(0, 0, W, H).fill('#fdfbf7');
          doc.strokeColor('#b91c1c').lineWidth(4).rect(24, 24, W - 48, H - 48).stroke();
        }
      } else {
        doc.rect(0, 0, W, H).fill('#fdfbf7');
        doc.strokeColor('#b91c1c').lineWidth(4).rect(24, 24, W - 48, H - 48).stroke();
      }

      const centerX = W / 2;
      doc.fillColor('#1f2937').fontSize(12).text('Certificate of completion', centerX, 120, {
        align: 'center',
        width: W - 80
      });

      doc.fontSize(26).fillColor('#111827').font('Helvetica-Bold');
      doc.text(recipientName || 'Student', centerX, 170, { align: 'center', width: W - 80 });

      const meta = [candidateAge != null ? `Age: ${candidateAge}` : null, dateOfBirthText ? `DOB: ${dateOfBirthText}` : null]
        .filter(Boolean)
        .join('   ');
      if (meta) {
        doc.font('Helvetica').fontSize(10).fillColor('#4b5563');
        doc.text(meta, centerX, 200, { align: 'center', width: W - 80 });
      }

      doc.font('Helvetica').fontSize(14).fillColor('#374151');
      doc.text(`has successfully completed all assigned quizzes in`, centerX, 220, {
        align: 'center',
        width: W - 80
      });

      doc.font('Helvetica-Bold').fontSize(18).fillColor('#991b1b');
      doc.text(subjectTitle || 'Subject', centerX, 248, { align: 'center', width: W - 80 });

      let scoreY = 288;
      if (certificateScopeLine && String(certificateScopeLine).trim()) {
        doc.font('Helvetica').fontSize(12).fillColor('#4b5563');
        doc.text(String(certificateScopeLine).trim(), centerX, 276, { align: 'center', width: W - 100 });
        scoreY = 310;
      }

      doc.font('Helvetica').fontSize(14).fillColor('#374151');
      doc.text(
        `with an average score of ${Number(averagePercentage).toFixed(1)}% across ${assignedQuizCount ?? '—'} assigned quiz(zes).`,
        centerX,
        scoreY,
        { align: 'center', width: W - 100 }
      );

      if (certificateNumber) {
        doc.fontSize(10).fillColor('#6b7280');
        doc.text(`Certificate No.: ${certificateNumber}`, centerX, scoreY + 36, { align: 'center', width: W - 80 });
      }

      if (issuedOnText) {
        doc.fontSize(11).fillColor('#6b7280');
        doc.text(`Issued on ${issuedOnText}`, centerX, H - 120, { align: 'center', width: W - 80 });
      }

      doc.fontSize(10).fillColor('#9ca3af');
      doc.text('Career Master', centerX, H - 88, { align: 'center', width: W - 80 });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Build subject completion certificate PDF.
 * - If `backgroundImageBuffer` is set (from CERTIFICATE_BACKGROUND_URL): legacy layout on that background.
 * - Else if bundled / configured achievement template exists: CareerMaster achievement image + field overlays.
 * - Else: legacy cream layout.
 */
async function buildSubjectCertificatePdf(opts) {
  const hasUrlBackground = opts.backgroundImageBuffer && opts.backgroundImageBuffer.length > 0;
  if (hasUrlBackground) {
    return buildLegacyCertificatePdf(opts);
  }
  const tpl = await resolveAchievementTemplateBuffer();
  if (tpl && tpl.length > 0) {
    return buildAchievementCertificatePdf({ ...opts, templateBuffer: tpl });
  }
  return buildLegacyCertificatePdf({ ...opts, backgroundImageBuffer: null });
}

module.exports = {
  buildSubjectCertificatePdf,
  fetchUrlToBuffer,
  formatDobForCertificate,
  resolveAchievementTemplateBuffer
};
