export type CmTrophyAgeCategory = 'UNDER_14' | 'UNDER_19' | 'WOMENS_19_25' | 'PARA_OPEN';

export interface AgeCategoryResult {
  category: CmTrophyAgeCategory | null;
  reason?: string; // populated only when category is null
}

const NO_CATEGORY_REASON =
  "No CM Trophy age category applies to this date of birth. Women's category (19–25) is open to female applicants only; applicants outside the eligible DOB windows without a disability certificate are not eligible for CM Trophy 2026.";

// CM Trophy 2026 eligibility windows (fixed, not rolling age-from-today).
// Inclusive on both ends, 'YYYY-MM-DD'.
const UNDER_14_RANGE = ['2012-04-01', '2016-03-31'];
const UNDER_19_RANGE = ['2007-04-01', '2011-03-31'];
const WOMENS_19_25_RANGE = ['2001-04-01', '2006-03-31'];

function inRange(dob: string, [start, end]: string[]): boolean {
  return dob >= start && dob <= end;
}

export function computeCmTrophyAgeCategory(params: {
  dob: string; // 'YYYY-MM-DD'
  gender: 'MALE' | 'FEMALE' | '';
  hasDisability: boolean;
}): AgeCategoryResult {
  const { dob, gender, hasDisability } = params;

  if (hasDisability) return { category: 'PARA_OPEN' };
  if (!dob) return { category: null };
  if (Number.isNaN(new Date(dob + 'T00:00:00.000Z').getTime())) return { category: null };

  if (inRange(dob, UNDER_14_RANGE)) return { category: 'UNDER_14' };
  if (inRange(dob, UNDER_19_RANGE)) return { category: 'UNDER_19' };
  if (inRange(dob, WOMENS_19_25_RANGE)) {
    if (gender === 'FEMALE') return { category: 'WOMENS_19_25' };
    return { category: null, reason: NO_CATEGORY_REASON };
  }

  return { category: null, reason: NO_CATEGORY_REASON };
}

export const CM_TROPHY_AGE_CATEGORY_LABELS: Record<CmTrophyAgeCategory, string> = {
  UNDER_14: 'Under 14 / 14 वर्ष से कम',
  UNDER_19: 'Under 19 / 19 वर्ष से कम',
  WOMENS_19_25: "Women's only (19-25) / केवल महिला (19-25)",
  PARA_OPEN: 'Para Athlete (Open) / पैरा एथलीट (ओपन)',
};

export const CM_TROPHY_REGISTRATION_LEVEL_LABELS: Record<string, string> = {
  NYAY_PANCHAYAT: 'Nyay Panchayat / न्याय पंचायत',
  VIDHAN_SABHA: 'Vidhan Sabha / विधान सभा',
  SANSAD: 'Sansad / संसद',
  STATE: 'State / राज्य',
};
