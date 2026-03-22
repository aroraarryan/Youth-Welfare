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

// ─── Khel Mahakumbh ───────────────────────────────────────────────────────────

export interface KhelMahakumbhPayload extends BaseRegistrationPayload {
  ageCategory: "JUNIOR" | "SENIOR";
  sportIds: string[]; // 1-3 UUIDs
}

export interface KhelMahakumbhRegistration extends BaseRegistration {
  ageCategory: "JUNIOR" | "SENIOR";
  sports: { id: string; name: string }[];
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
      "/khel-mahakumbh/register",
      payload,
    ),

  trackKhel: (registrationNo: string) =>
    api.get<TrackResponse<KhelMahakumbhRegistration>>(
      `/khel-mahakumbh/track/${registrationNo}`,
    ),

  myKhelRegistrations: () =>
    api.get<{ success: boolean; data: KhelMahakumbhRegistration[] }>(
      "/khel-mahakumbh/my",
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
      "/khel-mahakumbh",
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

  // Admin / Officer — update status
  updateKhelStatus: (id: string, status: RegistrationStatus) =>
    api.patch(`/khel-mahakumbh/${id}/status`, { status }),

  updateVolunteerStatus: (id: string, status: RegistrationStatus) =>
    api.patch(`/volunteer/${id}/status`, { status }),

  updateVocationalStatus: (id: string, status: RegistrationStatus) =>
    api.patch(`/vocational/${id}/status`, { status }),

  updateAdventureStatus: (id: string, status: RegistrationStatus) =>
    api.patch(`/adventure/${id}/status`, { status }),
};
