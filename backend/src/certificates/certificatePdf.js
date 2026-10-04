const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
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
 * Blank lines printed on the bundled 1024×682 achievement template, in template pixels
 * (x0..x1 = horizontal extent of the rule, y = the rule's row). Measured from the artwork;
 * re-measure if the template image is replaced with a different design.
 */
const ACHIEVEMENT_LINES = {
  name: { x0: 353, x1: 605, y: 289 },
  age: { x0: 665, x1: 828, y: 289 },
  dob: { x0: 322, x1: 828, y: 318 },
  course: { x0: 563, x1: 755, y: 378, overflowX1: 935 },
  scope: { x0: 262, x1: 762, y: 392 },
  score: { x0: 358, x1: 574, y: 492 },
  certNo: { x0: 769, x1: 950, y: 496 },
  issue: { x0: 359, x1: 492, y: 590 }
};

/** Free space between “Date of Issue” and the signature, in template pixels. */
const ACHIEVEMENT_QR = { x: 566, y: 558, size: 50 };

/**
 * @param {string} text
 * @returns {Promise<Buffer|null>}
 */
async function buildQrPngBuffer(text) {
  if (!text) return null;
  try {
    return await QRCode.toBuffer(text, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 240,
      color: { dark: '#152c52', light: '#ffffff' }
    });
  } catch {
    return null;
  }
}

/**
 * Achievement layout: the template already prints the labels and blank lines; we draw only the
 * values, each sitting just above its printed line, shrunk to fit the line width.
 */
async function buildAchievementCertificatePdf(opts) {
  const {
    recipientName,
    subjectTitle,
    averagePercentage,
    issuedOnText,
    templateBuffer,
    certificateNumber,
    certificateScopeLine,
    candidateAge,
    dateOfBirthText,
    assignedQuizCount,
    verifyUrl
  } = opts;

  const intr = imageIntrinsicSize(templateBuffer);
  const tw = intr?.w || BUNDLED_TEMPLATE_W;
  const th = intr?.h || BUNDLED_TEMPLATE_H;
  const pageW = W;
  const pageH = Math.round((W * th) / tw);
  const k = pageW / tw;
  const P = (v) => v * k;

  const navy = '#152c52';
  const bronze = '#9a3412';
  const slate = '#475569';

  const pct = Number(averagePercentage);
  const pctText = Number.isFinite(pct) ? `${pct.toFixed(1)}%` : '—';
  const scoreText =
    assignedQuizCount != null && Number.isFinite(pct)
      ? `${pctText} (${assignedQuizCount} quiz${assignedQuizCount === 1 ? '' : 'zes'})`
      : pctText;
  const ageText = candidateAge != null && candidateAge >= 0 && candidateAge < 130 ? String(candidateAge) : '—';

  const qrPng = await buildQrPngBuffer(verifyUrl);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [pageW, pageH], margin: 0 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    /**
     * Draw `text` with its baseline `gap` template-px above the printed line, centered on it.
     * Font shrinks to fit the line (not below `softMin`); if the line has `overflowX1`, longer text
     * may then extend right to it, shrinking further down to `minSize`. Truncation is a last resort.
     */
    const onLine = (text, line, { font, size, minSize = 7, softMin = minSize, color = navy, gap = 4 }) => {
      const value = String(text ?? '').trim();
      if (!value) return;
      doc.font(font).fillColor(color);
      const lineW = P(line.x1 - line.x0);
      const maxW = P((line.overflowX1 || line.x1) - line.x0);
      let fs = size;
      doc.fontSize(fs);
      while (doc.widthOfString(value) > lineW && fs > softMin) {
        fs -= 0.25;
        doc.fontSize(fs);
      }
      while (doc.widthOfString(value) > maxW && fs > minSize) {
        fs -= 0.25;
        doc.fontSize(fs);
      }
      let out = value;
      let textW = doc.widthOfString(out);
      if (textW > maxW) {
        while (out.length > 1 && doc.widthOfString(`${out}…`) > maxW) out = out.slice(0, -1);
        out = `${out.trimEnd()}…`;
        textW = doc.widthOfString(out);
      }
      const x = textW <= lineW ? P(line.x0) + (lineW - textW) / 2 : P(line.x0);
      doc.text(out, x, P(line.y - gap), { lineBreak: false, baseline: 'alphabetic' });
    };

    try {
      doc.image(templateBuffer, 0, 0, { width: pageW, height: pageH });

      const L = ACHIEVEMENT_LINES;
      onLine(recipientName || 'Student', L.name, { font: 'Times-Bold', size: 17, minSize: 7.5 });
      onLine(ageText, L.age, { font: 'Times-Bold', size: 14 });
      onLine(dateOfBirthText || '—', L.dob, { font: 'Times-Roman', size: 13 });
      onLine(subjectTitle || '—', L.course, {
        font: 'Times-Bold',
        size: 15,
        softMin: 11,
        minSize: 7.5,
        color: bronze
      });
      if (certificateScopeLine && String(certificateScopeLine).trim()) {
        onLine(certificateScopeLine, L.scope, { font: 'Times-Italic', size: 8.5, minSize: 6, color: slate, gap: 0 });
      }
      onLine(scoreText, L.score, { font: 'Times-Bold', size: 13 });
      onLine(certificateNumber || '—', L.certNo, { font: 'Times-Bold', size: 11.5, minSize: 7 });
      onLine(issuedOnText || '—', L.issue, { font: 'Times-Roman', size: 12 });

      if (qrPng) {
        const q = ACHIEVEMENT_QR;
        doc.image(qrPng, P(q.x), P(q.y), { width: P(q.size), height: P(q.size) });
        doc.font('Helvetica').fontSize(5.5).fillColor(slate);
        doc.text('Scan to verify', P(q.x - 10), P(q.y + q.size + 2), {
          width: P(q.size + 20),
          align: 'center',
          lineBreak: false
        });
      }

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
    const doc = new PDFDocument({ size: [W, H], margin: 0 });
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
  resolveAchievementTemplateBuffer,
  ACHIEVEMENT_LINES
};
