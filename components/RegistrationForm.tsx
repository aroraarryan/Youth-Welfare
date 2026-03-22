"use client";

import { useState, useEffect } from "react";
import {
  registrationsApi,
  EmergencyRelation,
  Gender,
} from "@/lib/api/registrations";
import { infrastructureApi, District } from "@/lib/api/infrastructure";
import { sportsApi, Sport } from "@/lib/api/sports";
import { ApiError } from "@/lib/api";

interface RegistrationFormProps {
  type:
    | "khel-mahakumbh"
    | "youth-volunteering"
    | "vocational-training"
    | "adventure-training";
  /** Only used by non-khel types as string labels for the selection dropdown */
  sportOptions?: string[];
}

const sidebarSteps: Record<string, string[]> = {
  "khel-mahakumbh": [
    "Personal Info",
    "Location & Sport",
    "Photo Upload",
    "Emergency & Medical",
    "Consent",
  ],
  "youth-volunteering": [
    "Personal Info",
    "Location & Preference",
    "Photo Upload",
    "Emergency & Medical",
    "Consent",
  ],
  "vocational-training": [
    "Personal Info",
    "Location & Course",
    "Photo Upload",
    "Emergency & Medical",
    "Consent",
  ],
  "adventure-training": [
    "Personal Info",
    "Location & Activity",
    "Photo Upload",
    "Emergency & Medical",
    "Consent",
  ],
};

const GENDER_MAP: Record<string, Gender> = {
  Male: "MALE",
  Female: "FEMALE",
  Other: "OTHER",
  "Prefer not to say": "PREFER_NOT_TO_SAY",
};
const RELATION_MAP: Record<string, EmergencyRelation> = {
  Parent: "PARENT",
  Guardian: "GUARDIAN",
  Spouse: "SPOUSE",
  Sibling: "SIBLING",
  Friend: "FRIEND",
  Other: "OTHER",
};

export default function RegistrationForm({
  type,
  sportOptions = [],
}: RegistrationFormProps) {
  // ── Reference data ──────────────────────────────────────────────────────────
  const [districts, setDistricts] = useState<District[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    infrastructureApi
      .getDistricts()
      .then((r) => setDistricts(r.data))
      .catch(() => {});
    if (type === "khel-mahakumbh") {
      sportsApi
        .list()
        .then((r) => setSports(r.data.filter((s) => s.isActive)))
        .catch(() => {});
    }
  }, [type]);

  // ── Form state ───────────────────────────────────────────────────────────────
  const blank = {
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
    districtId: "",
    // khel
    ageCategory: "JUNIOR" as "JUNIOR" | "SENIOR",
    sportIds: [] as string[],
    // volunteer
    serviceAreas: [] as string[],
    availability: "",
    motivation: "",
    qualification: "",
    // vocational
    sector: "",
    courseDuration: "",
    employmentStatus: "",
    // adventure
    courseType: "",
    batchMonth: "",
    accommodation: "",
    fitnessLevel: "",
    swimmingAbility: "",
    // shared
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    consent1: false,
    consent2: false,
    consent3: false,
    consent4: false,
  };

  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");

  const set = (k: string, v: string | boolean | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleSportId = (id: string) =>
    set(
      "sportIds",
      form.sportIds.includes(id)
        ? form.sportIds.filter((x) => x !== id)
        : [...form.sportIds, id],
    );

  const toggleServiceArea = (area: string) =>
    set(
      "serviceAreas",
      form.serviceAreas.includes(area)
        ? form.serviceAreas.filter((x) => x !== area)
        : [...form.serviceAreas, area],
    );

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setFieldErrors({});

    const base = {
      fullName: form.fullName,
      dob: new Date(form.dob),
      gender: GENDER_MAP[form.gender] ?? (form.gender as Gender),
      mobile: form.mobile,
      email: form.email || undefined,
      districtId: form.districtId,
      emergencyName: form.emergencyName,
      emergencyPhone: form.emergencyPhone,
      emergencyRelation:
        RELATION_MAP[form.emergencyRelation] ??
        (form.emergencyRelation as EmergencyRelation),
      consentAccuracy: "true" as const,
      consentMedical: "true" as const,
      consentRules: "true" as const,
      consentData: "true" as const,
    };

    try {
      let regNo = "";

      if (type === "khel-mahakumbh") {
        const res = await registrationsApi.registerKhel({
          ...base,
          ageCategory: form.ageCategory,
          sportIds: form.sportIds,
        });
        regNo = res.data.registrationNo;
      } else if (type === "youth-volunteering") {
        const res = await registrationsApi.registerVolunteer({
          ...base,
          serviceAreas: form.serviceAreas,
          availability: form.availability as
            | "FULL_TIME"
            | "PART_TIME_MORNING"
            | "PART_TIME_EVENING"
            | "WEEKENDS",
          motivation: form.motivation,
          qualification: form.qualification,
        });
        regNo = res.data.registrationNo;
      } else if (type === "vocational-training") {
        const res = await registrationsApi.enrollVocational({
          ...base,
          sector: form.sector,
          courseDuration: form.courseDuration as
            | "THREE_MONTHS"
            | "SIX_MONTHS"
            | "RPL"
            | "FLEXIBLE",
          qualification: form.qualification,
          employmentStatus: form.employmentStatus,
        });
        regNo = res.data.registrationNo;
      } else {
        const res = await registrationsApi.enrollAdventure({
          ...base,
          courseType: form.courseType,
          batchMonth: form.batchMonth,
          accommodation: form.accommodation as
            | "YES_HOSTEL"
            | "YES_TENT"
            | "NO_OWN_ARRANGEMENT",
          fitnessLevel: form.fitnessLevel as
            | "BEGINNER"
            | "INTERMEDIATE"
            | "ADVANCED"
            | "EXPERT",
          swimmingAbility: form.swimmingAbility as
            | "STRONG_SWIMMER"
            | "BASIC_SWIMMER"
            | "NON_SWIMMER",
          qualification: form.qualification,
        });
        regNo = res.data.registrationNo;
      }

      setRegistrationNo(regNo);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors?.length) {
          setFieldErrors(
            Object.fromEntries(err.errors.map((e) => [e.field, e.message])),
          );
        }
      } else {
        setError("Submission failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const steps = sidebarSteps[type];

  // ── Success screen ────────────────────────────────────────────────────────────
  if (registrationNo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-check text-green-600 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-[#1e3a8a] mb-3">
          Registration Successful!
        </h2>
        <p className="text-[#6b7280] mb-6">
          Your registration has been submitted successfully.
        </p>
        <div className="bg-[#eff6ff] border-2 border-[#1e3a8a] rounded-xl px-8 py-5 mb-6">
          <p className="text-sm text-[#6b7280] mb-1">Your Registration ID</p>
          <p className="text-2xl font-bold text-[#1e3a8a] tracking-widest">
            {registrationNo}
          </p>
        </div>
        <p className="text-sm text-[#6b7280] mb-6">
          Please save this ID for tracking your application status.
        </p>
        <button
          onClick={() => {
            setRegistrationNo("");
            setForm(blank);
          }}
          className="bg-[#1e3a8a] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1e40af] transition-colors"
        >
          Register Another
        </button>
      </div>
    );
  }

  // ── Field helpers ─────────────────────────────────────────────────────────────
  const inp =
    "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors";
  const sel = inp + " appearance-none bg-white";

  const section2Label =
    type === "khel-mahakumbh"
      ? "Sport"
      : type === "youth-volunteering"
        ? "Preference"
        : type === "vocational-training"
          ? "Course"
          : "Activity";

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-10 flex gap-8">
      {/* Sidebar */}
      <aside className="flex-none w-[280px] hidden lg:flex flex-col gap-5">
        <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
          <h3 className="text-base font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
            <i className="fas fa-circle-info" /> How to Register
          </h3>
          <ol className="text-sm text-[#4a5568] flex flex-col gap-2 pl-5">
            <li>Fill in your personal details</li>
            <li>Select your district &amp; preference</li>
            <li>Upload a passport-size photo</li>
            <li>Add emergency contact info</li>
            <li>Accept all consent statements</li>
            <li>Submit &amp; note your Registration ID</li>
          </ol>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
          <h3 className="text-base font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
            <i className="fas fa-list-check" /> Sections
          </h3>
          <div className="flex flex-col gap-2">
            {steps.map((step, i) => (
              <a
                key={step}
                href={`#sec-${i + 1}`}
                className="flex items-center gap-2.5 text-sm text-[#4a5568] no-underline py-1 hover:text-[#1e3a8a] transition-colors"
              >
                <span className="w-7 h-7 bg-[#eff6ff] text-[#1e3a8a] rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-[#1e3a8a] rounded-2xl p-6 text-white">
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <i className="fas fa-headset" /> Need Help?
          </h3>
          <p className="text-sm text-white/80 mb-2">Call our help desk:</p>
          <a
            href="tel:+919634312465"
            className="text-white font-bold text-base no-underline"
          >
            +91-9634312465
          </a>
          <p className="text-sm text-white/80 mt-3 mb-1">Email:</p>
          <a
            href="mailto:ywprd.uk@gmail.com"
            className="text-white/90 text-xs no-underline break-all"
          >
            ywprd.uk@gmail.com
          </a>
        </div>
      </aside>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col gap-6"
        noValidate
      >
        {/* Section 1: Personal Info */}
        <fieldset
          id="sec-1"
          className="bg-white rounded-2xl p-8 border border-[#e2e8f0] shadow-sm"
        >
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2 mb-6 pb-3 border-b border-[#e2e8f0] w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm">
              01
            </span>
            Personal Information
          </legend>
          <div className="grid gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="As per Aadhaar / official document"
                required
                className={inp}
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                  required
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  required
                  className={sel}
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  className={inp}
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Section 2: Location & type-specific */}
        <fieldset
          id="sec-2"
          className="bg-white rounded-2xl p-8 border border-[#e2e8f0] shadow-sm"
        >
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2 mb-6 pb-3 border-b border-[#e2e8f0] w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm">
              02
            </span>
            Location &amp; {section2Label}
          </legend>
          <div className="grid gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={form.districtId}
                onChange={(e) => set("districtId", e.target.value)}
                required
                className={sel}
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Khel Mahakumbh */}
            {type === "khel-mahakumbh" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    Age Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.ageCategory}
                    onChange={(e) => set("ageCategory", e.target.value)}
                    required
                    className={sel}
                  >
                    <option value="JUNIOR">Junior</option>
                    <option value="SENIOR">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">
                    Select Sports (1–3) <span className="text-red-500">*</span>
                  </label>
                  {sports.length === 0 ? (
                    <p className="text-sm text-[#9ca3af]">Loading sports…</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {sports.map((s) => (
                        <label
                          key={s.id}
                          className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={form.sportIds.includes(s.id)}
                            onChange={() => toggleSportId(s.id)}
                            disabled={
                              !form.sportIds.includes(s.id) &&
                              form.sportIds.length >= 3
                            }
                            className="w-4 h-4 accent-[#1e3a8a]"
                          />
                          {s.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Youth Volunteering */}
            {type === "youth-volunteering" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">
                    Service Areas <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sportOptions.map((area) => (
                      <label
                        key={area}
                        className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.serviceAreas.includes(area)}
                          onChange={() => toggleServiceArea(area)}
                          className="w-4 h-4 accent-[#1e3a8a]"
                        />
                        {area}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    Availability <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.availability}
                    onChange={(e) => set("availability", e.target.value)}
                    required
                    className={sel}
                  >
                    <option value="">Select Availability</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME_MORNING">
                      Part Time – Morning
                    </option>
                    <option value="PART_TIME_EVENING">
                      Part Time – Evening
                    </option>
                    <option value="WEEKENDS">Weekends Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    Motivation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.motivation}
                    onChange={(e) => set("motivation", e.target.value)}
                    placeholder="Why do you want to volunteer? (10–300 characters)"
                    rows={3}
                    required
                    className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) => set("qualification", e.target.value)}
                    placeholder="Highest qualification"
                    required
                    className={inp}
                  />
                </div>
              </>
            )}

            {/* Vocational Training */}
            {type === "vocational-training" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    Sector / Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.sector}
                    onChange={(e) => set("sector", e.target.value)}
                    required
                    className={sel}
                  >
                    <option value="">Select Course</option>
                    {sportOptions.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    Course Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.courseDuration}
                    onChange={(e) => set("courseDuration", e.target.value)}
                    required
                    className={sel}
                  >
                    <option value="">Select Duration</option>
                    <option value="THREE_MONTHS">3 Months</option>
                    <option value="SIX_MONTHS">6 Months</option>
                    <option value="RPL">RPL</option>
                    <option value="FLEXIBLE">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) => set("qualification", e.target.value)}
                    placeholder="Highest qualification"
                    required
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    Employment Status <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.employmentStatus}
                    onChange={(e) => set("employmentStatus", e.target.value)}
                    placeholder="Currently employed / unemployed / student"
                    required
                    className={inp}
                  />
                </div>
              </>
            )}

            {/* Adventure Training */}
            {type === "adventure-training" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    Course Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.courseType}
                    onChange={(e) => set("courseType", e.target.value)}
                    required
                    className={sel}
                  >
                    <option value="">Select Activity</option>
                    {sportOptions.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                      Batch Month <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="month"
                      value={form.batchMonth}
                      onChange={(e) => set("batchMonth", e.target.value)}
                      required
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                      Accommodation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.accommodation}
                      onChange={(e) => set("accommodation", e.target.value)}
                      required
                      className={sel}
                    >
                      <option value="">Select</option>
                      <option value="YES_HOSTEL">Yes – Hostel</option>
                      <option value="YES_TENT">Yes – Tent</option>
                      <option value="NO_OWN_ARRANGEMENT">
                        No – Own Arrangement
                      </option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                      Fitness Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.fitnessLevel}
                      onChange={(e) => set("fitnessLevel", e.target.value)}
                      required
                      className={sel}
                    >
                      <option value="">Select</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                      Swimming Ability <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.swimmingAbility}
                      onChange={(e) => set("swimmingAbility", e.target.value)}
                      required
                      className={sel}
                    >
                      <option value="">Select</option>
                      <option value="STRONG_SWIMMER">Strong Swimmer</option>
                      <option value="BASIC_SWIMMER">Basic Swimmer</option>
                      <option value="NON_SWIMMER">Non Swimmer</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) => set("qualification", e.target.value)}
                    placeholder="Highest qualification"
                    required
                    className={inp}
                  />
                </div>
              </>
            )}
          </div>
        </fieldset>

        {/* Section 3: Photo Upload */}
        <fieldset
          id="sec-3"
          className="bg-white rounded-2xl p-8 border border-[#e2e8f0] shadow-sm"
        >
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2 mb-6 pb-3 border-b border-[#e2e8f0] w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm">
              03
            </span>
            Photo Upload
          </legend>
          <div className="border-2 border-dashed border-[#cbd5e1] rounded-xl p-10 text-center hover:border-[#1e3a8a] transition-colors cursor-pointer bg-[#f8fafc]">
            <i className="fas fa-cloud-upload-alt text-4xl text-[#94a3b8] mb-3 block" />
            <p className="text-sm font-medium text-[#374151] mb-1">
              Click to upload passport-size photo
            </p>
            <p className="text-xs text-[#9ca3af]">
              JPG, PNG up to 2MB · Minimum 200×200 pixels
            </p>
            <input type="file" accept="image/*" className="hidden" />
          </div>
        </fieldset>

        {/* Section 4: Emergency & Medical */}
        <fieldset
          id="sec-4"
          className="bg-white rounded-2xl p-8 border border-[#e2e8f0] shadow-sm"
        >
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2 mb-6 pb-3 border-b border-[#e2e8f0] w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm">
              04
            </span>
            Emergency &amp; Medical
          </legend>
          <div className="grid gap-5">
            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.emergencyName}
                  onChange={(e) => set("emergencyName", e.target.value)}
                  placeholder="Full name"
                  required
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.emergencyPhone}
                  onChange={(e) => set("emergencyPhone", e.target.value)}
                  placeholder="10-digit number"
                  required
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Relation <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.emergencyRelation}
                  onChange={(e) => set("emergencyRelation", e.target.value)}
                  required
                  className={sel}
                >
                  <option value="">Select</option>
                  <option>Parent</option>
                  <option>Guardian</option>
                  <option>Spouse</option>
                  <option>Sibling</option>
                  <option>Friend</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Section 5: Consent */}
        <fieldset
          id="sec-5"
          className="bg-white rounded-2xl p-8 border border-[#e2e8f0] shadow-sm"
        >
          <legend className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2 mb-6 pb-3 border-b border-[#e2e8f0] w-full">
            <span className="w-8 h-8 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center text-sm">
              05
            </span>
            Consent
          </legend>
          <div className="flex flex-col gap-4">
            {[
              {
                key: "consent1",
                text: "I confirm that all information provided is accurate and true to the best of my knowledge.",
              },
              {
                key: "consent2",
                text: "I agree to abide by all rules and regulations of the program.",
              },
              {
                key: "consent3",
                text: "I consent to the use of my photograph and information for official government records.",
              },
              {
                key: "consent4",
                text: "I have read and agree to the Terms & Conditions and Privacy Policy of the Youth Welfare Portal.",
              },
            ].map((c) => (
              <label
                key={c.key}
                className="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form[c.key as keyof typeof form] as boolean}
                  onChange={(e) => set(c.key, e.target.checked)}
                  required
                  className="w-4 h-4 mt-0.5 accent-[#1e3a8a] flex-shrink-0"
                />
                <span className="text-sm text-[#374151]">{c.text}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <div className="px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}
        {Object.entries(fieldErrors).filter(([, msg]) => msg).length > 0 && (
          <div className="px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex flex-col gap-1">
            {Object.entries(fieldErrors)
              .filter(([, msg]) => msg)
              .map(([field, msg]) => (
                <p key={field} className="flex items-center gap-2">
                  <i className="fas fa-circle-exclamation text-[11px]" />
                  <span className="capitalize">
                    {field.replace(/([A-Z])/g, " $1")}:
                  </span>
                  {msg}
                </p>
              ))}
          </div>
        )}

        {error && (
          <div className="px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}
        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base transition-all shadow-[0_4px_15px_rgba(30,58,138,0.3)] hover:shadow-[0_6px_20px_rgba(30,58,138,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <i className="fas fa-spinner fa-spin" /> Submitting…
            </>
          ) : (
            "Submit Registration"
          )}
        </button>
      </form>
    </div>
  );
}
