const User = require('../user/users.model');

/**
 * Resolve user IDs for admin report filtering by batch membership.
 * @param {string} [batchScope] - 'all' | 'batch_only' | 'non_batch'
 * @param {string} [batchCode] - optional batch code (must appear in user.batches)
 * @returns {Promise<import('mongoose').Types.ObjectId[]|null>} null = no user filter; [] = no matches
 */
async function resolveUserIdsForBatchScope(batchScope, batchCode) {
  const scope = batchScope && String(batchScope).trim() ? String(batchScope).trim() : 'all';
  const code = batchCode && typeof batchCode === 'string' && batchCode.trim() ? batchCode.trim() : '';

  // "all" must never filter by batch; ignore batchCode so leftover UI values do not hide students.
  if (scope === 'all') {
    return null;
  }

  if (scope === 'batch_only') {
    if (code) {
      const users = await User.find({ batches: code }).select('_id').lean();
      return users.map((u) => u._id);
    }
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

  if (scope === 'all') {
    return null;
  }

  if (scope === 'batch_only') {
    if (code) {
      return [{ $match: { 'user.batches': code } }];
    }
    return [{ $match: { 'user.batches.0': { $exists: true } } }];
  }

  if (scope === 'non_batch') {
    return [
      {
        $match: {
          $or: [{ 'user.batches': { $exists: false } }, { 'user.batches': { $size: 0 } }],
        },
      },
    ];
  }

  return null;
}

module.exports = {
  resolveUserIdsForBatchScope,
  userDocBatchMatchStages,
};
