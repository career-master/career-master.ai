export const PROFILE_MIN_COMPLETION_PERCENT =
  Number(process.env.NEXT_PUBLIC_PROFILE_MIN_COMPLETION_PERCENT || '70');

export const PROFILE_COMPLETION_ENFORCED =
  process.env.NEXT_PUBLIC_PROFILE_COMPLETION_ENFORCED !== 'false';

/** Same fields as backend subject-requests.service calculateProfileCompletion – used for quiz/profile gate per user */
export function getProfileCompletionPercent(user: {
  name?: string;
  phone?: string;
  profile?: Record<string, unknown>;
  profilePicture?: string;
} | null): number {
  if (!user) return 0;
  const fields = [
    user.name,
    user.phone,
    (user.profile as any)?.currentStatus,
    (user.profile as any)?.college,
    (user.profile as any)?.school,
    (user.profile as any)?.jobTitle,
    (user.profile as any)?.interests?.length > 0,
    (user.profile as any)?.learningGoals,
    (user.profile as any)?.city,
    (user.profile as any)?.country,
    user.profilePicture,
  ];
  const filledFields = fields.filter((field) => {
    if (Array.isArray(field)) return field.length > 0;
    return field != null && String(field).trim().length > 0;
  }).length;
  return Math.round((filledFields / fields.length) * 100);
}

