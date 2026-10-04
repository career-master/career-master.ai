const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildSubjectCertificatePdf,
  formatDobForCertificate,
  ACHIEVEMENT_LINES
} = require('../src/certificates/certificatePdf');
const CertificatesRepository = require('../src/certificates/certificates.repository');
const CertificatesService = require('../src/certificates/certificates.service');

const baseOpts = {
  recipientName: 'Test Student',
  subjectTitle: 'HTML',
  averagePercentage: 86.43,
  assignedQuizCount: 3,
  issuedOnText: '4 October 2026',
  certificateNumber: 'CM-TEST-0001',
  candidateAge: 24,
  dateOfBirthText: '12 March 2002'
};

function mediaBox(pdf) {
  const m = pdf.toString('latin1').match(/\/MediaBox \[([\d.\s]+)\]/);
  assert.ok(m, 'PDF has a MediaBox');
  const [, , w, h] = m[1].trim().split(/\s+/).map(Number);
  return { w, h };
}

const imageCount = (pdf) => (pdf.toString('latin1').match(/\/Subtype \/Image/g) || []).length;

test('achievement certificate is a landscape page matching the template aspect ratio', async () => {
  const pdf = await buildSubjectCertificatePdf(baseOpts);
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  const { w, h } = mediaBox(pdf);
  assert.equal(w, 842);
  assert.equal(h, Math.round((842 * 682) / 1024));
  assert.ok(w > h, 'page must be landscape');
});

test('QR code image is embedded only when a verify URL is given', async () => {
  const without = await buildSubjectCertificatePdf(baseOpts);
  const withQr = await buildSubjectCertificatePdf({
    ...baseOpts,
    verifyUrl: 'http://localhost:3000/verify-certificate/CM-TEST-0001'
  });
  assert.ok(imageCount(withQr) > imageCount(without));
});

test('very long name / course / scope and missing DOB still render', async () => {
  const pdf = await buildSubjectCertificatePdf({
    ...baseOpts,
    recipientName: 'Venkata Satya Sai Lakshmi Narasimha Raghuveer Chowdary',
    subjectTitle: 'Public Sector Bank (PSB) Exams – Quantitative Aptitude and Reasoning Ability Full Course',
    certificateScopeLine: 'Scope: Number System, Percentages, Profit and Loss, Time and Work, Averages',
    candidateAge: null,
    dateOfBirthText: null,
    averagePercentage: 'not-a-number',
    assignedQuizCount: undefined
  });
  assert.ok(pdf.length > 1000);
});

test('field lines are inside the 1024×682 template and non-empty', () => {
  for (const [name, l] of Object.entries(ACHIEVEMENT_LINES)) {
    assert.ok(l.x0 >= 0 && l.x1 <= 1024 && l.x0 < l.x1, `${name} x-range`);
    assert.ok(l.y > 0 && l.y < 682, `${name} y`);
    if (l.overflowX1) assert.ok(l.overflowX1 > l.x1 && l.overflowX1 <= 1024, `${name} overflow`);
  }
});

test('formatDobForCertificate returns age and readable DOB', () => {
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - 20);
  dob.setDate(dob.getDate() - 2);
  const r = formatDobForCertificate({ profile: { dateOfBirth: dob.toISOString() } });
  assert.equal(r.candidateAge, 20);
  assert.match(r.dateOfBirthText, /\d{4}$/);
  assert.deepEqual(formatDobForCertificate({}), { candidateAge: null, dateOfBirthText: null });
  assert.deepEqual(formatDobForCertificate({ profile: { dateOfBirth: 'garbage' } }), {
    candidateAge: null,
    dateOfBirthText: null
  });
});

test('verifyByNumber returns only public fields', async (t) => {
  t.mock.method(CertificatesRepository, 'findByCertificateNumber', async (num) =>
    num === 'CM-OK-1'
      ? {
          certificateNumber: 'CM-OK-1',
          recipientName: 'Test Student',
          subjectTitle: 'HTML',
          averagePercentage: 90,
          assignedQuizCount: 2,
          issuedOnText: '4 October 2026',
          createdAt: new Date('2026-10-04'),
          certificateScope: 'subject',
          pdfUrl: 'https://example.com/c.pdf',
          userEmail: 'secret@example.com'
        }
      : null
  );
  const ok = await CertificatesService.verifyByNumber(' CM-OK-1 ');
  assert.equal(ok.valid, true);
  assert.equal(ok.recipientName, 'Test Student');
  assert.equal(ok.userEmail, undefined);
  assert.equal(ok.pdfUrl, undefined);
  assert.equal(ok.hasPdf, true);

  await assert.rejects(CertificatesService.verifyByNumber('CM-NOPE'), (e) => e.statusCode === 404 || /No certificate/.test(e.message));
});
