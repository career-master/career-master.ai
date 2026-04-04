const mongoose = require('mongoose');
const Topic = require('../topics/topics.model');
const QuizSet = require('../quiz-sets/quiz-sets.model');

/**
 * Active topics for a subject: direct subjectId match plus nested subtopics (parentTopicId chain).
 */
async function collectActiveTopicIdsForSubject(subjectId) {
  const sid = new mongoose.Types.ObjectId(subjectId);
  const roots = await Topic.find({ subjectId: sid, isActive: true }).select('_id').lean();
  const idSet = new Set(roots.map((t) => String(t._id)));
  let frontier = roots.map((t) => t._id);
  while (frontier.length > 0) {
    const children = await Topic.find({
      parentTopicId: { $in: frontier },
      isActive: true,
    })
      .select('_id')
      .lean();
    const next = [];
    for (const c of children) {
      const key = String(c._id);
      if (!idSet.has(key)) {
        idSet.add(key);
        next.push(c._id);
      }
    }
    frontier = next;
  }
  return [...idSet].map((id) => new mongoose.Types.ObjectId(id));
}

/**
 * Unique quiz ObjectIds assigned to the subject via active quiz sets on active topics (incl. subtopics).
 * Empty topics (no quiz sets) do not contribute.
 */
async function getAssignedQuizIdsForSubject(subjectId) {
  const topicIds = await collectActiveTopicIdsForSubject(subjectId);
  if (topicIds.length === 0) return [];
  const sets = await QuizSet.find({ topicId: { $in: topicIds }, isActive: true }).select('quizId').lean();
  const uniq = new Set();
  for (const s of sets) {
    if (s.quizId) uniq.add(String(s.quizId));
  }
  return [...uniq].map((id) => new mongoose.Types.ObjectId(id));
}

/**
 * Expand selected topic ids to include every active descendant under the same subject (subtopics).
 * @param {string[]} rootTopicIdStrings - Mongo ObjectId strings; must belong to subject
 * @returns {mongoose.Types.ObjectId[]}
 */
async function expandTopicScopeToDescendantIds(subjectId, rootTopicIdStrings) {
  const sid = new mongoose.Types.ObjectId(subjectId);
  const allowed = new Set((await collectActiveTopicIdsForSubject(subjectId)).map((id) => String(id)));
  const roots = (rootTopicIdStrings || []).map(String).filter((id) => mongoose.Types.ObjectId.isValid(id) && allowed.has(id));
  if (roots.length === 0) return [];

  const topics = await Topic.find({ subjectId: sid, isActive: true }).select('_id parentTopicId').lean();
  const childrenByParent = new Map();
  for (const t of topics) {
    if (!t.parentTopicId) continue;
    const p = String(t.parentTopicId);
    if (!childrenByParent.has(p)) childrenByParent.set(p, []);
    childrenByParent.get(p).push(String(t._id));
  }

  const expanded = new Set();
  const stack = [...roots];
  while (stack.length) {
    const id = stack.pop();
    if (!allowed.has(id) || expanded.has(id)) continue;
    expanded.add(id);
    const kids = childrenByParent.get(id) || [];
    for (const k of kids) stack.push(k);
  }
  return [...expanded].map((s) => new mongoose.Types.ObjectId(s));
}

/**
 * Quizzes linked via quiz sets on the given topic roots and all their subtopics within the subject.
 * Pass empty/null roots to use the whole subject (same as getAssignedQuizIdsForSubject).
 */
async function getAssignedQuizIdsForTopicScope(subjectId, scopeRootTopicIdStrings) {
  if (!scopeRootTopicIdStrings || scopeRootTopicIdStrings.length === 0) {
    return getAssignedQuizIdsForSubject(subjectId);
  }
  const expandedTopicIds = await expandTopicScopeToDescendantIds(subjectId, scopeRootTopicIdStrings);
  if (expandedTopicIds.length === 0) return [];
  const sets = await QuizSet.find({ topicId: { $in: expandedTopicIds }, isActive: true }).select('quizId').lean();
  const uniq = new Set();
  for (const s of sets) {
    if (s.quizId) uniq.add(String(s.quizId));
  }
  return [...uniq].map((id) => new mongoose.Types.ObjectId(id));
}

module.exports = {
  collectActiveTopicIdsForSubject,
  getAssignedQuizIdsForSubject,
  expandTopicScopeToDescendantIds,
  getAssignedQuizIdsForTopicScope,
};
