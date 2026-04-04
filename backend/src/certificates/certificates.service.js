const mongoose = require('mongoose');
const Quiz = require('../quiz/quiz.model');
const Topic = require('../topics/topics.model');
const {
  getAssignedQuizIdsForSubject,
  getAssignedQuizIdsForTopicScope
} = require('../subjects/subjectAssignedQuizzes.util');
const QuizAttempt = require('../quiz/quiz_attempts.model');
const User = require('../user/users.model');
const Subject = require('../subjects/subjects.model');
const SubjectCertificate = require('./subject-certificates.model');
const { resolveUserIdsForBatchScope } = require('../reports/batch_report_filters');
const crypto = require('crypto');
const {
  buildSubjectCertificatePdf,
  fetchUrlToBuffer,
  formatDobForCertificate
} = require('./certificatePdf');
const { uploadPdfBuffer, deleteRawAsset } = require('../utils/cloudinary');
const CertificatesRepository = require('./certificates.repository');
const emailUtil = require('../utils/email');
const env = require('../config/env');
const { ErrorHandler } = require('../middleware/errorHandler');

function newCertificateNumber() {
  return `CM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function normalizeScopeTopicIds(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return [
      ...new Set(
        raw.map((id) => String(id).trim()).filter((id) => mongoose.Types.ObjectId.isValid(id))
      )
    ];
  }
  if (typeof raw === 'string' && raw.trim()) {
    return [
      ...new Set(
        raw
          .split(',')
          .map((s) => s.trim())
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
      )
    ];
  }
  return [];
}

async function resolveQuizIdsForCertificate(subjectId, scopeTopicIds) {
  if (scopeTopicIds && scopeTopicIds.length > 0) {
    return getAssignedQuizIdsForTopicScope(subjectId, scopeTopicIds);
  }
  return getAssignedQuizIdsForSubject(subjectId);
}

async function buildScopeDescription(subjectId, scopeTopicIds) {
  if (!scopeTopicIds || scopeTopicIds.length === 0) return '';
  const sid = new mongoose.Types.ObjectId(subjectId);
  const oids = scopeTopicIds.map((id) => new mongoose.Types.ObjectId(id));
  const rows = await Topic.find({ _id: { $in: oids }, subjectId: sid }).select('title order').lean();
  rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const titles = rows.map((t) => (t.title && String(t.title).trim()) || 'Topic').filter(Boolean);
  if (titles.length === 0) return '';
  const joined = titles.join(', ');
  return joined.length > 140 ? `${joined.slice(0, 137)}…` : joined;
}

const effectivePctAddFields = {
  $addFields: {
    _effectivePct: {
      $cond: [
        { $gt: [{ $ifNull: ['$percentage', 0] }, 0] },
        '$percentage',
        {
          $cond: [
            { $gt: [{ $ifNull: ['$totalMarks', 0] }, 0] },
            {
              $multiply: [
                { $divide: [{ $ifNull: ['$marksObtained', 0] }, '$totalMarks'] },
                100,
              ],
            },
            0,
          ],
        },
      ],
    },
  },
};

/**
 * Aggregate students (role student) with attempts on subject quizzes.
 * @param {boolean} requireAllQuizzes - if true, only users who attempted every assigned quiz
 */
async function aggregateStudentsOnSubjectQuizzes(quizObjectIds, batchUserIds, requireAllQuizzes) {
  const firstMatch = {
    quizId: { $in: quizObjectIds },
    isDeletedForUser: { $ne: true }
  };
  if (batchUserIds !== null) {
    firstMatch.userId = { $in: batchUserIds };
  }

  const pipeline = [
    { $match: firstMatch },
    effectivePctAddFields,
    {
      $group: {
        _id: { userId: '$userId', quizId: '$quizId' },
        bestPct: { $max: '$_effectivePct' },
        hasPass: { $max: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } }
      }
    },
    {
      $group: {
        _id: '$_id.userId',
        pairs: { $push: { quizId: '$_id.quizId', bestPct: '$bestPct', hasPass: '$hasPass' } },
        distinctQuizzes: { $sum: 1 }
      }
    }
  ];

  if (requireAllQuizzes) {
    pipeline.push({ $match: { distinctQuizzes: quizObjectIds.length } });
  }

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $match: { 'user.roles': 'student' } }
  );

  return QuizAttempt.aggregate(pipeline);
}

function buildStudentProgressRow(row, quizObjectIds, quizTitleById, minAvg) {
  const requiredCount = quizObjectIds.length;
  const pairMap = new Map((row.pairs || []).map((p) => [String(p.quizId), p]));

  const perQuiz = quizObjectIds.map((oid) => {
    const id = String(oid);
    const p = pairMap.get(id);
    const attempted = !!p;
    const bestPct = p ? Math.round((Number(p.bestPct) || 0) * 10) / 10 : null;
    const passed = p ? Number(p.hasPass) === 1 : false;
    return {
      quizId: id,
      quizTitle: quizTitleById.get(id) || 'Quiz',
      bestPct,
      passed,
      attempted
    };
  });

  perQuiz.sort((a, b) => a.quizTitle.localeCompare(b.quizTitle, undefined, { sensitivity: 'base' }));

  const attemptedCount = perQuiz.filter((q) => q.attempted).length;
  const passedCount = perQuiz.filter((q) => q.passed).length;
  const allAttempted = attemptedCount === requiredCount;
  const allPassed = passedCount === requiredCount;
  const sum = perQuiz.reduce((s, q) => s + (q.bestPct ?? 0), 0);
  const overallAverage = allAttempted ? Math.round((sum / requiredCount) * 10) / 10 : null;
  const sumAttempted = perQuiz.filter((q) => q.attempted).reduce((s, q) => s + (q.bestPct ?? 0), 0);
  const averageOnAttempted =
    attemptedCount > 0 ? Math.round((sumAttempted / attemptedCount) * 10) / 10 : 0;

  const canIssueCertificate = allAttempted && allPassed && overallAverage != null && overallAverage >= minAvg;

  let status = 'in_progress';
  if (allAttempted) {
    if (!allPassed) status = 'not_all_passed';
    else if (overallAverage < minAvg) status = 'below_avg';
    else status = 'eligible';
  }

  return {
    userId: String(row._id),
    name: row.user?.name,
    email: row.user?.email,
    assignedQuizCount: requiredCount,
    attemptedQuizCount: attemptedCount,
    passedQuizCount: passedCount,
    allQuizzesAttempted: allAttempted,
    allQuizzesPassed: allPassed,
    overallAverage,
    averageOnAttempted,
    canIssueCertificate,
    status,
    perQuiz
  };
}

function toEligibleListEntry(built) {
  const perQuiz = built.perQuiz.map((q) => ({
    quizId: q.quizId,
    quizTitle: q.quizTitle,
    bestPct: q.bestPct ?? 0,
    passed: q.passed
  }));
  return {
    userId: built.userId,
    name: built.name,
    email: built.email,
    averagePercentage: built.overallAverage ?? 0,
    assignedQuizCount: built.assignedQuizCount,
    perQuiz
  };
}

/**
 * Certificate rules: every assigned quiz must have a **passing** attempt (result pass),
 * plus average of best % across those quizzes >= minAverage.
 * Students only see issued certificates; admin can load full progress for everyone.
 */
async function getEligibleStudents(subjectId, { batchScope, batchCode, minAverage, scopeTopicIds = [] }) {
  const quizObjectIds = await resolveQuizIdsForCertificate(subjectId, scopeTopicIds);
  const requiredCount = quizObjectIds.length;
  const minAvg = Number.isFinite(Number(minAverage)) ? Number(minAverage) : 70;
  const scoped = Array.isArray(scopeTopicIds) && scopeTopicIds.length > 0;

  if (requiredCount === 0) {
    return {
      assignedQuizCount: 0,
      quizIds: [],
      eligible: [],
      completedBelowThreshold: [],
      notAllPassed: [],
      minAverage: minAvg,
      certificateScope: scoped ? 'topics' : 'subject',
      scopeTopicIds: scoped ? scopeTopicIds.map(String) : []
    };
  }

  const quizDocs = await Quiz.find({ _id: { $in: quizObjectIds } })
    .select('title')
    .lean();
  const quizTitleById = new Map(quizDocs.map((q) => [String(q._id), (q.title && String(q.title).trim()) || 'Quiz']));

  const batchUserIds = await resolveUserIdsForBatchScope(batchScope, batchCode);
  if (batchUserIds !== null && batchUserIds.length === 0) {
    return {
      assignedQuizCount: requiredCount,
      quizIds: quizObjectIds.map(String),
      eligible: [],
      completedBelowThreshold: [],
      notAllPassed: [],
      minAverage: minAvg,
      certificateScope: scoped ? 'topics' : 'subject',
      scopeTopicIds: scoped ? scopeTopicIds.map(String) : []
    };
  }

  const grouped = await aggregateStudentsOnSubjectQuizzes(quizObjectIds, batchUserIds, true);

  const eligible = [];
  const completedBelowThreshold = [];
  const notAllPassed = [];
  for (const row of grouped) {
    const built = buildStudentProgressRow(row, quizObjectIds, quizTitleById, minAvg);
    const entry = toEligibleListEntry(built);
    if (built.status === 'eligible') {
      eligible.push(entry);
    } else if (built.status === 'below_avg') {
      completedBelowThreshold.push(entry);
    } else if (built.status === 'not_all_passed') {
      notAllPassed.push(entry);
    }
  }

  return {
    assignedQuizCount: requiredCount,
    quizIds: quizObjectIds.map(String),
    eligible,
    completedBelowThreshold,
    notAllPassed,
    minAverage: minAvg,
    certificateScope: scoped ? 'topics' : 'subject',
    scopeTopicIds: scoped ? scopeTopicIds.map(String) : []
  };
}

async function getSubjectProgressRows(subjectId, { batchScope, batchCode, minAverage, scopeTopicIds = [] }) {
  const quizObjectIds = await resolveQuizIdsForCertificate(subjectId, scopeTopicIds);
  const requiredCount = quizObjectIds.length;
  const minAvg = Number.isFinite(Number(minAverage)) ? Number(minAverage) : 70;
  const scoped = Array.isArray(scopeTopicIds) && scopeTopicIds.length > 0;

  if (requiredCount === 0) {
    return {
      assignedQuizCount: 0,
      quizIds: [],
      minAverage: minAvg,
      students: [],
      certificateScope: scoped ? 'topics' : 'subject',
      scopeTopicIds: scoped ? scopeTopicIds.map(String) : []
    };
  }

  const quizDocs = await Quiz.find({ _id: { $in: quizObjectIds } })
    .select('title')
    .lean();
  const quizTitleById = new Map(quizDocs.map((q) => [String(q._id), (q.title && String(q.title).trim()) || 'Quiz']));

  const batchUserIds = await resolveUserIdsForBatchScope(batchScope, batchCode);
  if (batchUserIds !== null && batchUserIds.length === 0) {
    return {
      assignedQuizCount: requiredCount,
      quizIds: quizObjectIds.map(String),
      minAverage: minAvg,
      students: [],
      certificateScope: scoped ? 'topics' : 'subject',
      scopeTopicIds: scoped ? scopeTopicIds.map(String) : []
    };
  }

  const grouped = await aggregateStudentsOnSubjectQuizzes(quizObjectIds, batchUserIds, false);
  const students = grouped
    .map((row) => buildStudentProgressRow(row, quizObjectIds, quizTitleById, minAvg))
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

  return {
    assignedQuizCount: requiredCount,
    quizIds: quizObjectIds.map(String),
    minAverage: minAvg,
    students,
    certificateScope: scoped ? 'topics' : 'subject',
    scopeTopicIds: scoped ? scopeTopicIds.map(String) : []
  };
}

class CertificatesService {
  static async getEligible(subjectId, query) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      throw new ErrorHandler(400, 'Invalid subject id');
    }
    const subject = await Subject.findById(subjectId).select('title').lean();
    if (!subject) {
      throw new ErrorHandler(404, 'Subject not found');
    }
    const minAverage = query.minAverage != null ? Number(query.minAverage) : 70;
    const scopeTopicIds = normalizeScopeTopicIds(query.topicIds);
    const data = await getEligibleStudents(subjectId, {
      batchScope: query.batchScope,
      batchCode: query.batchCode,
      minAverage,
      scopeTopicIds
    });
    return {
      subjectId: String(subjectId),
      subjectTitle: subject.title,
      ...data
    };
  }

  /** All students with any attempt on this subject’s quizzes + pass/attempt counts (admin). */
  static async getSubjectProgress(subjectId, query) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      throw new ErrorHandler(400, 'Invalid subject id');
    }
    const subject = await Subject.findById(subjectId).select('title').lean();
    if (!subject) {
      throw new ErrorHandler(404, 'Subject not found');
    }
    const minAverage = query.minAverage != null ? Number(query.minAverage) : 70;
    const scopeTopicIds = normalizeScopeTopicIds(query.topicIds);
    const data = await getSubjectProgressRows(subjectId, {
      batchScope: query.batchScope,
      batchCode: query.batchCode,
      minAverage,
      scopeTopicIds
    });
    return {
      subjectId: String(subjectId),
      subjectTitle: subject.title,
      ...data
    };
  }

  static async generate({ subjectId, userIds, minAverage, batchScope, batchCode, sendEmail, issuedById, topicScopeIds }) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      throw new ErrorHandler(400, 'Invalid subject id');
    }
    const subject = await Subject.findById(subjectId).lean();
    if (!subject) {
      throw new ErrorHandler(404, 'Subject not found');
    }

    const minAvg = Number.isFinite(Number(minAverage)) ? Number(minAverage) : 70;
    const scopeTopicIds = normalizeScopeTopicIds(topicScopeIds);
    const scopeDescription =
      scopeTopicIds.length > 0 ? await buildScopeDescription(subjectId, scopeTopicIds) : '';
    const certificateScopeLine =
      scopeTopicIds.length > 0
        ? `Scope: ${scopeDescription || 'selected topics (including subtopics)'}`
        : undefined;

    const { eligible, assignedQuizCount } = await getEligibleStudents(subjectId, {
      batchScope,
      batchCode,
      minAverage: minAvg,
      scopeTopicIds
    });

    const eligibleSet = new Set(eligible.map((e) => e.userId));
    const ids = (userIds || []).map((id) => String(id)).filter((id) => eligibleSet.has(id));
    if (ids.length === 0) {
      throw new ErrorHandler(
        400,
        'No selected users are eligible. Each assigned quiz needs a passing attempt, and average best score must be ≥ threshold.'
      );
    }

    let bgBuf = null;
    if (env.CERTIFICATE_BACKGROUND_URL) {
      try {
        bgBuf = await fetchUrlToBuffer(env.CERTIFICATE_BACKGROUND_URL);
      } catch {
        bgBuf = null;
      }
    }

    const issuedOnText = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const created = [];
    for (const uid of ids) {
      const row = eligible.find((e) => e.userId === uid);
      const user = await User.findById(uid).select('name email profile.dateOfBirth').lean();
      if (!user || !user.email) continue;

      const recipientName = (row?.name || user.name || 'Student').trim();
      const { candidateAge } = formatDobForCertificate(user);
      const certificateNumber = newCertificateNumber();

      const pdfBuf = await buildSubjectCertificatePdf({
        recipientName,
        subjectTitle: subject.title,
        averagePercentage: row.averagePercentage,
        issuedOnText,
        backgroundImageBuffer: bgBuf,
        assignedQuizCount,
        certificateScopeLine,
        certificateNumber,
        candidateAge,
        quizAchievementDateText: issuedOnText
      });

      const up = await uploadPdfBuffer(pdfBuf, { folder: 'career-master/certificates' });

      let emailSentAt = null;
      let emailError = null;
      if (sendEmail !== false) {
        const send = await emailUtil.sendCertificateEmail(user.email, recipientName, subject.title, pdfBuf);
        if (send.success) {
          emailSentAt = new Date();
        } else {
          emailError = send.error || 'Email failed';
        }
      }

      const certPayload = {
        userId: uid,
        subjectId: subject._id,
        subjectTitle: subject.title,
        certificateNumber,
        recipientName,
        userEmail: user.email,
        averagePercentage: row.averagePercentage,
        assignedQuizCount,
        minAverageRequired: minAvg,
        pdfUrl: up.url,
        pdfPublicId: up.publicId,
        issuedOnText,
        issuedBy: issuedById,
        emailSentAt,
        emailError,
        certificateScope: scopeTopicIds.length > 0 ? 'topics' : 'subject',
        scopeDescription: scopeTopicIds.length > 0 ? scopeDescription : ''
      };
      if (scopeTopicIds.length > 0) {
        certPayload.scopeRootTopicIds = scopeTopicIds.map((id) => new mongoose.Types.ObjectId(id));
      }
      const doc = await CertificatesRepository.create(certPayload);

      created.push(doc);
    }

    return { count: created.length, certificates: created };
  }

  static async listAdmin(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const search = query.search && String(query.search).trim() ? String(query.search).trim() : undefined;
    return CertificatesRepository.listForAdmin({ page, limit, subjectId: query.subjectId, search });
  }

  static async getById(id) {
    const doc = await CertificatesRepository.findById(id);
    if (!doc) {
      throw new ErrorHandler(404, 'Certificate not found');
    }
    return doc;
  }

  static async listMine(userId) {
    return CertificatesRepository.listForUser(userId);
  }

  static async updateCertificate(id, { recipientName, issuedOnText }) {
    const existing = await SubjectCertificate.findById(id);
    if (!existing) {
      throw new ErrorHandler(404, 'Certificate not found');
    }

    const name = (recipientName != null ? recipientName : existing.recipientName).trim();
    const dateLine =
      issuedOnText !== undefined ? String(issuedOnText).trim() || existing.issuedOnText : existing.issuedOnText;

    let bgBuf = null;
    if (env.CERTIFICATE_BACKGROUND_URL) {
      try {
        bgBuf = await fetchUrlToBuffer(env.CERTIFICATE_BACKGROUND_URL);
      } catch {
        bgBuf = null;
      }
    }

    const certificateScopeLine =
      existing.certificateScope === 'topics' && existing.scopeDescription
        ? `Scope: ${existing.scopeDescription}`
        : undefined;

    const uid = existing.userId?._id || existing.userId;
    let candidateAge;
    if (uid) {
      const u = await User.findById(uid).select('profile.dateOfBirth').lean();
      candidateAge = formatDobForCertificate(u).candidateAge;
    }

    const certificateNumber =
      existing.certificateNumber && String(existing.certificateNumber).trim()
        ? String(existing.certificateNumber).trim()
        : `CM-${String(existing._id).slice(-10).toUpperCase()}`;

    const pdfBuf = await buildSubjectCertificatePdf({
      recipientName: name,
      subjectTitle: existing.subjectTitle,
      averagePercentage: existing.averagePercentage,
      issuedOnText: dateLine,
      backgroundImageBuffer: bgBuf,
      assignedQuizCount: existing.assignedQuizCount,
      certificateScopeLine,
      certificateNumber,
      candidateAge,
      quizAchievementDateText: dateLine
    });

    if (existing.pdfPublicId) {
      try {
        await deleteRawAsset(existing.pdfPublicId);
      } catch {
        /* continue with new upload */
      }
    }

    const up = await uploadPdfBuffer(pdfBuf, { folder: 'career-master/certificates' });

    const updates = {
      recipientName: name,
      issuedOnText: dateLine,
      pdfUrl: up.url,
      pdfPublicId: up.publicId
    };
    if (!existing.certificateNumber || !String(existing.certificateNumber).trim()) {
      updates.certificateNumber = certificateNumber;
    }
    return CertificatesRepository.updateById(id, updates);
  }

  static async deleteCertificate(id) {
    const existing = await SubjectCertificate.findById(id).lean();
    if (!existing) {
      throw new ErrorHandler(404, 'Certificate not found');
    }
    if (existing.pdfPublicId) {
      try {
        await deleteRawAsset(existing.pdfPublicId);
      } catch {
        /* still remove DB row */
      }
    }
    await CertificatesRepository.deleteById(id);
    return { success: true };
  }
}

module.exports = CertificatesService;
