import { CmTrophyAgeCategory } from './cmTrophyAgeCategory';

// Team medals: every player of a team has a medal record sharing one teamId; the
// server's tallies (summary, leaderboards) count the team once.
export interface TeamMedalFields {
  teamId?: string | null;
  teamSize?: number | null; // all members of the team, not just the filtered ones
}

// Team-deduped Gold/Silver/Bronze over ALL filtered records (not just the page).
export interface MedalSummary {
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

// Per-application-code problems returned when a team can't be saved (nothing is saved).
export interface TeamMedalError {
  applicationCode: string;
  reason: string;
}

const SHORT_AGE: Record<CmTrophyAgeCategory, string> = {
  UNDER_14: 'U14',
  UNDER_19: 'U19',
  WOMENS_19_25: "Women's 19-25",
  PARA_OPEN: 'Para',
};

// "Team · Cricket Dehradun U19 Male · 11 players"
export function teamLabel(r: {
  sportName: string;
  entityName: string | null;
  ageCategory: CmTrophyAgeCategory | null;
  gender: string | null;
  teamSize?: number | null;
}): string {
  const gender = r.gender ? r.gender.charAt(0) + r.gender.slice(1).toLowerCase() : '';
  const parts = [r.sportName, r.entityName, r.ageCategory ? SHORT_AGE[r.ageCategory] : '', gender].filter(Boolean).join(' ');
  return `Team · ${parts}${r.teamSize ? ` · ${r.teamSize} players` : ''}`;
}

// Sports where every medal is a team medal (slugs from the sports table).
// Keep in sync with backend src/utils/teamMedal.js (enforces the Team column in bulk upload).
const TEAM_SPORT_SLUGS = new Set([
  'cricket', 'football', 'hockey', 'kabaddi', 'kho_kho', 'volleyball', 'basketball', 'handball',
  'netball', 'baseball', 'tug_of_war', 'pitthu', 'goli_block', 'rowing', 'lawn_tennis', 'tennis',
]);
// Pair / relay events inside individual sports (TT & Badminton Doubles, 4x100m Relay, Yogasan Pair).
const TEAM_EVENT_RE = /doubles?|relay|4\s*x|pair/i;

// Add Medal shows the "Team players" section (and saves one team medal) when this is true.
export const isTeamMedal = (sportSlug?: string, event?: string) =>
  (!!sportSlug && TEAM_SPORT_SLUGS.has(sportSlug)) || TEAM_EVENT_RE.test(event ?? '');
