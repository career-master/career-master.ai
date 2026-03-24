const User = require('../user/users.model');

/**
 * Resolve user IDs for admin report filtering by batch membership.
 * @param {string} [batchScope] - 'all' | 'batch_only' | 'non_batch'
 * @param {string} [batchCode] - optional batch code (must appear in user.batches)
 * @returns {Promise<import('mongoose').Types.ObjectId[]|null>} null = no user filter; [] = no matches
 */
async function resolveUserIdsForBatchScope(batchScope, batchCode) {
  const scope = batchScope && String(batchScope).trim() ? String(batchScope).trim() : 'all';

  if (scope === 'all' && !batchCode) {
    return null;
  }

  if (batchCode && typeof batchCode === 'string' && batchCode.trim() && scope !== 'non_batch') {
    const code = batchCode.trim();
    const users = await User.find({ batches: code }).select('_id').lean();
    return users.map((u) => u._id);
  }

  if (scope === 'batch_only') {
    const users = await User.find({
      batches: { $exists: true, $ne: [] },
    })
      .select('_id')
      .lean();
    return users.map((u) => u._id);
  }

  if (scope === 'non_batch') {
    const users = await User.find({
      $or: [{ batches: { $exists: false } }, { batches: { $size: 0 } }],
    })
      .select('_id')
      .lean();
    return users.map((u) => u._id);
  }

  return null;
}

/**
 * Mongo $match conditions on joined `user` document (after $lookup from users).
 * @param {string} [batchScope]
 * @param {string} [batchCode]
 * @returns {object[]|null} stages to $match, or null if no batch filter
 */
function userDocBatchMatchStages(batchScope, batchCode) {
  const scope = batchScope && String(batchScope).trim() ? String(batchScope).trim() : 'all';
  const code = batchCode && String(batchCode).trim() ? String(batchCode).trim() : '';

  if (scope === 'all' && !code) {
    return null;
  }

  const stages = [];

  if (code && scope !== 'non_batch') {
    stages.push({ $match: { 'user.batches': code } });
  } else if (scope === 'batch_only' && !code) {
    stages.push({ $match: { 'user.batches.0': { $exists: true } } });
  }

  if (scope === 'non_batch') {
    stages.push({
      $match: {
        $or: [{ 'user.batches': { $exists: false } }, { 'user.batches': { $size: 0 } }],
      },
    });
  }

  return stages.length ? stages : null;
}

module.exports = {
  resolveUserIdsForBatchScope,
  userDocBatchMatchStages,
};
