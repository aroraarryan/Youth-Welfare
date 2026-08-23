import { api, PaginatedResponse } from "../api";

// ─── Shared types ─────────────────────────────────────────────────────────────

export type RegistrationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "WAITLISTED";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type EmergencyRelation =
  | "PARENT"
  | "GUARDIAN"
  | "SPOUSE"
  | "SIBLING"
  | "FRIEND"
  | "OTHER";

interface BaseRegistrationPayload {
  fullName: string;
  dob: Date; // ISO8601 date
  gender: Gender;
  mobile: string;
  email?: string;
  districtId: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: EmergencyRelation;
  consentAccuracy: "true";
  consentMedical: "true";
  consentRules: "true";
  consentData: "true";
}

export interface BaseRegistration {
  id: string;
  registrationNo: string;
  fullName: string;
  status: RegistrationStatus;
  createdAt: string;
  district: { id: string; name: string };
}

// ─── CM Trophy (Khel Mahakumbh 2026) ──────────────────────────────────────────

export type CmTrophyAgeCategory =
  | "UNDER_14"
  | "UNDER_19"
  | "WOMENS_19_25"
  | "PARA_OPEN";
export type CmTrophyRegistrationLevel =
  | "NYAY_PANCHAYAT"
  | "VIDHAN_SABHA"
  | "SANSAD"
  | "STATE";

export interface KhelMahakumbhPayload {
  hasDisability: boolean;
  dob: Date; // ISO8601 date
  ageCategory: CmTrophyAgeCategory;
  gender: "MALE" | "FEMALE";
  sportId: string;
  selectedEvents: string[];

  registrationLevel: CmTrophyRegistrationLevel;

  photoUrl: string;
  fullName: string;
  email?: string; // either email or mobile is required
  mobile?: string;
  aadharNumber: string;
  fathersName: string;
  mothersName: string;
  address: string;
  districtId: string;
  blockId: string;
  // Requirement narrows with registrationLevel: NYAY_PANCHAYAT needs all 3,
  // VIDHAN_SABHA needs the first 2, SANSAD needs just sansadId, STATE needs none.
  sansadId?: string;
  vidhanSabhaId?: string;
  nyayPanchayatId?: string;
  birthEducationCertificateUrl: string;
  residenceProofUrl?: string;
  disabilityCertificateUrl?: string;

  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  passbookOrChequeUrl?: string;
}

export interface KhelMahakumbhRegistration {
  id: string;
  registrationNo: string;
  fullName: string;
  status: RegistrationStatus;
  createdAt: string;
  ageCategory: CmTrophyAgeCategory;
  registrationLevel: CmTrophyRegistrationLevel;
  sport: { id: string; name: string };
  sansad: { id: string; name: string };
  vidhanSabha: { id: string; name: string };
  nyayPanchayat: { id: string; name: string };
}

// ─── Youth Volunteering ───────────────────────────────────────────────────────

export interface VolunteerPayload extends BaseRegistrationPayload {
  serviceAreas: string[];
  availability:
    | "FULL_TIME"
    | "PART_TIME_MORNING"
    | "PART_TIME_EVENING"
    | "WEEKENDS";
  motivation: string;
  qualification: string;
}

export interface VolunteerRegistration extends BaseRegistration {
  serviceAreas: string[];
  availability: string;
}

// ─── Vocational Training ──────────────────────────────────────────────────────

export interface VocationalPayload extends BaseRegistrationPayload {
  sector: string;
  courseDuration: "THREE_MONTHS" | "SIX_MONTHS" | "RPL" | "FLEXIBLE";
  qualification: string;
  employmentStatus: string;
}

export interface VocationalRegistration extends BaseRegistration {
  sector: string;
  courseDuration: string;
}

// ─── Adventure Training ───────────────────────────────────────────────────────

export interface AdventurePayload extends BaseRegistrationPayload {
  courseType: string;
  batchMonth: string; // YYYY-MM
  accommodation: "YES_HOSTEL" | "YES_TENT" | "NO_OWN_ARRANGEMENT";
  fitnessLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  swimmingAbility: "STRONG_SWIMMER" | "BASIC_SWIMMER" | "NON_SWIMMER";
  qualification: string;
}

export interface AdventureRegistration extends BaseRegistration {
  courseType: string;
  fitnessLevel: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

interface RegisterResponse<T> {
  success: boolean;
  data: T;
}

interface TrackResponse<T> {
  success: boolean;
  data: T;
}

export const registrationsApi = {
  // Khel Mahakumbh
  registerKhel: (payload: KhelMahakumbhPayload) =>
    api.post<RegisterResponse<KhelMahakumbhRegistration>>(
      "/cm-trophy/registration/register",
      payload,
    ),

  trackKhel: (registrationNo: string) =>
    api.get<TrackResponse<KhelMahakumbhRegistration>>(
      `/cm-trophy/registration/track/${registrationNo}`,
    ),

  myKhelRegistrations: () =>
    api.get<{ success: boolean; data: KhelMahakumbhRegistration[] }>(
      "/cm-trophy/registration/my",
    ),

  // Youth Volunteering
  registerVolunteer: (payload: VolunteerPayload) =>
    api.post<RegisterResponse<VolunteerRegistration>>(
      "/volunteer/register",
      payload,
    ),

  myVolunteerRegistrations: () =>
    api.get<{ success: boolean; data: VolunteerRegistration[] }>(
      "/volunteer/my",
    ),

  // Vocational Training
  enrollVocational: (payload: VocationalPayload) =>
    api.post<RegisterResponse<VocationalRegistration>>(
      "/vocational/enroll",
      payload,
    ),

  myVocationalEnrollments: () =>
    api.get<{ success: boolean; data: VocationalRegistration[] }>(
      "/vocational/my",
    ),

  // Adventure Training
  enrollAdventure: (payload: AdventurePayload) =>
    api.post<RegisterResponse<AdventureRegistration>>(
      "/adventure/enroll",
      payload,
    ),

  myAdventureEnrollments: () =>
    api.get<{ success: boolean; data: AdventureRegistration[] }>(
      "/adventure/my",
    ),

  // Admin / Officer — list all (any module)
  listKhel: (params?: {
    page?: number;
    limit?: number;
    status?: RegistrationStatus;
  }) =>
    api.get<PaginatedResponse<KhelMahakumbhRegistration>>(
      "/cm-trophy/registration",
      params,
    ),

  listVolunteers: (params?: {
    page?: number;
    limit?: number;
    status?: RegistrationStatus;
  }) => api.get<PaginatedResponse<VolunteerRegistration>>("/volunteer", params),

  listVocational: (params?: {
    page?: number;
    limit?: number;
    status?: RegistrationStatus;
  }) =>
    api.get<PaginatedResponse<VocationalRegistration>>("/vocational", params),

  listAdventure: (params?: {
    page?: number;
    limit?: number;
    status?: RegistrationStatus;
  }) => api.get<PaginatedResponse<AdventureRegistration>>("/adventure", params),

  downloadKhelApplicationPdf: (registrationNo: string) =>
    `${process.env.NEXT_PUBLIC_BASE_URL}/cm-trophy/registration/track/${registrationNo}/pdf`,

  // Admin / Officer — update status
  updateKhelStatus: (id: string, status: RegistrationStatus) =>
    api.patch(`/cm-trophy/registration/${id}/status`, { status }),

  updateVolunteerStatus: (id: string, status: RegistrationStatus) =>
    api.patch(`/volunteer/${id}/status`, { status }),

  updateVocationalStatus: (id: string, status: RegistrationStatus) =>
    api.patch(`/vocational/${id}/status`, { status }),

  updateAdventureStatus: (id: string, status: RegistrationStatus) =>
    api.patch(`/adventure/${id}/status`, { status }),
};
