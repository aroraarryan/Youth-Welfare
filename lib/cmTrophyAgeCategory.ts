export type CmTrophyAgeCategory = 'UNDER_14' | 'UNDER_19' | 'WOMENS_19_25' | 'PARA_OPEN';

export interface AgeCategoryResult {
  category: CmTrophyAgeCategory | null;
  reason?: string; // populated only when category is null
}

const NO_CATEGORY_REASON =
  "No CM Trophy age category applies to this applicant. Women's category (19–25) is open to female applicants only; applicants outside the 0–18 age range without a disability certificate are not eligible for CM Trophy 2026.";

export function computeCmTrophyAgeCategory(params: {
  dob: string; // 'YYYY-MM-DD'
  gender: 'MALE' | 'FEMALE' | '';
  hasDisability: boolean;
  today?: Date; // injectable for testing; defaults to new Date()
}): AgeCategoryResult {
  const { dob, gender, hasDisability, today = new Date() } = params;

  if (hasDisability) return { category: 'PARA_OPEN' };
  if (!dob) return { category: null };

  const birth = new Date(dob + 'T00:00:00.000Z');
  if (Number.isNaN(birth.getTime())) return { category: null };

  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthdayThisYear =
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate());
  if (beforeBirthdayThisYear) age -= 1;

  if (age <= 13) return { category: 'UNDER_14' };
  if (age >= 14 && age <= 18) return { category: 'UNDER_19' };
  if (age >= 19 && age <= 25 && gender === 'FEMALE') return { category: 'WOMENS_19_25' };

  return { category: null, reason: NO_CATEGORY_REASON };
}

export const CM_TROPHY_AGE_CATEGORY_LABELS: Record<CmTrophyAgeCategory, string> = {
  UNDER_14: 'Under 14',
  UNDER_19: 'Under 19',
  WOMENS_19_25: "Women's only (19-25)",
  PARA_OPEN: 'Para Athlete (Open)',
};

export const CM_TROPHY_REGISTRATION_LEVEL_LABELS: Record<string, string> = {
  NYAY_PANCHAYAT: 'Nyay Panchayat',
  VIDHAN_SABHA: 'Vidhan Sabha',
  SANSAD: 'Sansad',
  STATE: 'State',
};
