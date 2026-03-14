/**
 * Single source of truth for profile completion %.
 * Uses the same required/optional fields and 70/30 weighting as the profile form.
 * Use this everywhere (dashboard, subjects, quizzes) so the % matches what the user sees on the profile page.
 */
type UserLike = {
  name?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string | Date;
    gender?: string;
    guardianName?: string;
    guardianRelation?: string;
    presentAddress?: {
      houseNo?: string;
      street?: string;
      area?: string;
      city?: string;
      district?: string;
      state?: string;
      pinCode?: string;
      country?: string;
    };
    permanentAddress?: {
      city?: string;
      state?: string;
      pinCode?: string;
      country?: string;
    };
    currentQualification?: string;
    institutionName?: string;
    alternateMobile?: string;
    whatsappNumber?: string;
    university?: string;
    yearOfStudy?: number;
    expectedPassingYear?: number;
    percentage?: number;
    cgpa?: number;
    selectedCourses?: string[];
  };
};

function isFilled(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.length > 0;
  if (value == null) return false;
  return String(value).trim().length > 0;
}

export function getProfileCompletion(user: UserLike | null | undefined): number {
  if (!user) return 0;
  const profile = user.profile || {};
  const present = profile.presentAddress || {};
  const permanent = profile.permanentAddress || {};

  // Same required fields as profile form (70% weight)
  const requiredFields = [
    profile.firstName,
    profile.lastName,
    profile.dateOfBirth,
    profile.gender,
    profile.guardianName,
    profile.guardianRelation,
    user.phone,
    present.city,
    present.state,
    present.pinCode,
    present.country,
    profile.currentQualification,
    profile.institutionName,
  ];

  // Same optional fields as profile form (30% weight)
  const optionalFields = [
    user.profilePicture,
    user.email,
    profile.alternateMobile,
    profile.whatsappNumber,
    present.houseNo,
    present.street,
    present.area,
    present.district,
    permanent.city,
    permanent.state,
    permanent.pinCode,
    profile.university,
    profile.yearOfStudy,
    profile.expectedPassingYear,
    profile.percentage ?? profile.cgpa,
    (profile.selectedCourses?.length ?? 0) > 0,
  ];

  const filledRequired = requiredFields.filter(isFilled).length;
  const filledOptional = optionalFields.filter(isFilled).length;
  const requiredScore = (filledRequired / requiredFields.length) * 70;
  const optionalScore = (filledOptional / optionalFields.length) * 30;
  return Math.round(requiredScore + optionalScore);
}
