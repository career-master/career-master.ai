const mongoose = require('mongoose');

/**
 * Subject completion certificate (all assigned quizzes in subject attempted, avg >= threshold).
 */
const subjectCertificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true
    },
    subjectTitle: { type: String, required: true, trim: true },
    certificateNumber: { type: String, trim: true, default: '' },
    recipientName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    averagePercentage: { type: Number, required: true },
    assignedQuizCount: { type: Number, required: true },
    minAverageRequired: { type: Number, default: 70 },
    pdfUrl: { type: String, required: true, trim: true },
    pdfPublicId: { type: String, trim: true },
    issuedOnText: { type: String, trim: true },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emailSentAt: { type: Date, default: null },
    emailError: { type: String, trim: true, default: null },
    /** subject = all quizzes in subject; topics = only quizzes under selected roots + subtopics */
    certificateScope: {
      type: String,
      enum: ['subject', 'topics'],
      default: 'subject'
    },
    scopeRootTopicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    scopeDescription: { type: String, trim: true, default: '' }
  },
  {
    timestamps: true,
    collection: 'subject_certificates'
  }
);

subjectCertificateSchema.index({ userId: 1, createdAt: -1 });
subjectCertificateSchema.index({ subjectId: 1, createdAt: -1 });

const SubjectCertificate = mongoose.model('SubjectCertificate', subjectCertificateSchema);

module.exports = SubjectCertificate;
