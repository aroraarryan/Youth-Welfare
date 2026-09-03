"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { registrationsApi } from "@/lib/api/registrations";
import { sportsApi, CmTrophySportOption } from "@/lib/api/sports";
import { useDistricts, useBlocks } from "@/hooks/useInfrastructure";
import { useSansads, useVidhanSabhas, useNyayPanchayats } from "@/hooks/useCmTrophyGeo";
import {
  computeCmTrophyAgeCategory,
  CM_TROPHY_AGE_CATEGORY_LABELS,
  CM_TROPHY_REGISTRATION_LEVEL_LABELS,
  CmTrophyAgeCategory,
} from "@/lib/cmTrophyAgeCategory";
import { sportDisplayName } from "@/lib/cmTrophySportNames";
import { ApiError } from "@/lib/api";
import { uploadFile } from "@/lib/api/uploads";

interface FieldProps {
  label: string;
  hindi: string;
  required?: boolean;
  children?: React.ReactNode;
}

function Field({ label, hindi, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#374151]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <p className="text-xs text-[#9ca3af] mb-1.5">{hindi}</p>
      {children}
    </div>
  );
}

interface FileFieldProps extends FieldProps {
  fileName: string | null;
  uploading: boolean;
  onChange: (file: File) => void;
  accept?: string;
  hint?: string;
}

function FileField({
  label,
  hindi,
  required,
  fileName,
  uploading,
  onChange,
  accept,
  hint,
}: FileFieldProps) {
  return (
    <Field label={label} hindi={hindi} required={required}>
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center px-4 py-2 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] bg-white cursor-pointer hover:border-[#1e3a8a] transition-colors">
          Choose File
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
              e.target.value = "";
            }}
          />
        </label>
        <span className="text-sm text-[#6b7280] truncate">
          {uploading ? "Uploading…" : (fileName ?? "No file chosen")}
        </span>
      </div>
      {hint && <p className="text-[11px] text-[#9ca3af] mt-1">{hint}</p>}
    </Field>
  );
}

const blank = {
  hasDisability: "" as "" | "yes" | "no",
  dob: "",
  gender: "" as "" | "MALE" | "FEMALE",
  sportId: "",
  contactMethod: "PHONE" as "PHONE" | "EMAIL",
  fullName: "",
  email: "",
  mobile: "",
  aadharNumber: "",
  fathersName: "",
  mothersName: "",
  address: "",
  districtId: "",
  blockId: "",
  sansadId: "",
  vidhanSabhaId: "",
  nyayPanchayatId: "",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
};

export default function KhelMahakumbhRegistrationForm() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registrationNo, setRegistrationNo] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState(blank);

  const { districts } = useDistricts();
  const { blocks, loading: blocksLoading } = useBlocks(form.districtId || undefined);

  const { sansads } = useSansads();
  const { vidhanSabhas, loading: vidhanSabhasLoading } = useVidhanSabhas(form.sansadId || undefined);
  const { nyayPanchayats, loading: nyayPanchayatsLoading } = useNyayPanchayats(form.vidhanSabhaId || undefined);

  // ── Age Category: auto-computed from DOB + gender, overridden by disability ──
  const [ageCategory, setAgeCategory] = useState<CmTrophyAgeCategory | "">("");
  const [ageCategoryError, setAgeCategoryError] = useState("");

  useEffect(() => {
    const result = computeCmTrophyAgeCategory({
      dob: form.dob,
      gender: form.gender,
      hasDisability: form.hasDisability === "yes",
    });
    setAgeCategory(result.category ?? "");
    setAgeCategoryError(result.reason ?? "");
  }, [form.dob, form.gender, form.hasDisability]);

  // ── Sport options depend on the resolved age category ────────────────────────
  const [sportOptions, setSportOptions] = useState<CmTrophySportOption[]>([]);
  const [sportOptionsLoading, setSportOptionsLoading] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, sportId: "" }));
    if (!ageCategory) {
      setSportOptions([]);
      return;
    }
    setSportOptionsLoading(true);
    sportsApi
      .listByCmTrophyCategory(ageCategory)
      .then((r) => setSportOptions(r.data))
      .catch(() => setSportOptions([]))
      .finally(() => setSportOptionsLoading(false));
  }, [ageCategory]);

  // Registration Level is fully derived from the selected sport — never user-set.
  const selectedSport = sportOptions.find((s) => s.sportId === form.sportId);
  const registrationLevel = selectedSport?.registrationLevel ?? "";
  const bankRequired = registrationLevel === "STATE";

  // Sansad/VidhanSabha/NyayPanchayat visibility narrows as registrationLevel narrows:
  // NYAY_PANCHAYAT shows all 3, VIDHAN_SABHA shows the first 2, SANSAD shows just Sansad, STATE shows none.
  const showSansad = registrationLevel === "NYAY_PANCHAYAT" || registrationLevel === "VIDHAN_SABHA" || registrationLevel === "SANSAD";
  const showVidhanSabha = registrationLevel === "NYAY_PANCHAYAT" || registrationLevel === "VIDHAN_SABHA";
  const showNyayPanchayat = registrationLevel === "NYAY_PANCHAYAT";

  useEffect(() => {
    setForm((f) => ({
      ...f,
      ...(!showSansad ? { sansadId: "" } : {}),
      ...(!showVidhanSabha ? { vidhanSabhaId: "" } : {}),
      ...(!showNyayPanchayat ? { nyayPanchayatId: "" } : {}),
    }));
  }, [showSansad, showVidhanSabha, showNyayPanchayat]);

  // ── Events: depends on the selected sport + gender ────────────────────────────
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const eligibleEvents = (selectedSport?.events ?? []).filter((e) => !e.gender || e.gender === form.gender);
  const normalEvents = eligibleEvents.filter((e) => !e.isFreeBonus);
  const bonusEvent = eligibleEvents.find((e) => e.isFreeBonus);
  const maxEventsSelectable = selectedSport?.maxEventsSelectable ?? 1;
  const normalSelectedCount = selectedEvents.filter((v) => v !== bonusEvent?.name).length;

  useEffect(() => {
    setSelectedEvents([]);
  }, [form.sportId, form.gender]);

  const toggleNormalEvent = (name: string) => {
    setSelectedEvents((prev) => {
      const isBonus = name === bonusEvent?.name;
      if (isBonus) return prev; // handled by toggleBonusEvent
      if (maxEventsSelectable === 1) {
        // radio-style: replace, keep bonus pick (if any) intact
        const kept = bonusEvent && prev.includes(bonusEvent.name) ? [bonusEvent.name] : [];
        return prev.includes(name) ? kept : [...kept, name];
      }
      // checkbox-style with a cap
      if (prev.includes(name)) return prev.filter((v) => v !== name);
      if (normalSelectedCount >= maxEventsSelectable) return prev;
      return [...prev, name];
    });
  };

  const toggleBonusEvent = () => {
    if (!bonusEvent) return;
    setSelectedEvents((prev) =>
      prev.includes(bonusEvent.name) ? prev.filter((v) => v !== bonusEvent.name) : [...prev, bonusEvent.name],
    );
  };

  const [photoUrl, setPhotoUrl] = useState<{ name: string; url: string } | null>(null);
  const [certUrl, setCertUrl] = useState<{ name: string; url: string } | null>(null);
  const [residenceUrl, setResidenceUrl] = useState<{ name: string; url: string } | null>(null);
  const [disabilityCertUrl, setDisabilityCertUrl] = useState<{ name: string; url: string } | null>(null);
  const [passbookUrl, setPassbookUrl] = useState<{ name: string; url: string } | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const set = (k: keyof typeof blank, v: string) =>
    setForm((f) => ({
      ...f,
      [k]: v,
      ...(k === "districtId" ? { blockId: "" } : {}),
      ...(k === "sansadId" ? { vidhanSabhaId: "", nyayPanchayatId: "" } : {}),
      ...(k === "vidhanSabhaId" ? { nyayPanchayatId: "" } : {}),
    }));

  const setHasDisability = (v: "yes" | "no") => {
    set("hasDisability", v);
    if (v === "no") setDisabilityCertUrl(null);
  };

  const handleFileUpload = async (
    key: string,
    file: File,
    setter: (v: { name: string; url: string } | null) => void,
    resourceType: "image" | "raw" = "image",
  ) => {
    setUploading((u) => ({ ...u, [key]: true }));
    const url = await uploadFile(file, { folder: "cm-trophy", resourceType });
    setUploading((u) => ({ ...u, [key]: false }));
    if (url) setter({ name: file.name, url });
  };

  const inp =
    "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors";
  const sel = inp + " appearance-none bg-white";
  const disabledSel = inp + " appearance-none bg-[#f1f5f9] text-[#6b7280]";

  const anyUploading = Object.values(uploading).some(Boolean);

  const resetForm = () => {
    setForm(blank);
    setSelectedEvents([]);
    setPhotoUrl(null);
    setCertUrl(null);
    setResidenceUrl(null);
    setDisabilityCertUrl(null);
    setPassbookUrl(null);
    setError("");
    setFieldErrors({});
    setShowSuccessModal(false);
    setRegistrationNo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!photoUrl) return setError("Please upload the applicant photo.");
    if (!certUrl) return setError("Please upload the birth/education certificate.");
    if (form.hasDisability === "yes" && !disabilityCertUrl) {
      return setError("Please upload the disability certificate.");
    }
    if (!ageCategory) {
      return setError(ageCategoryError || "Please complete Date of Birth and Gender to determine your age category.");
    }
    if (form.contactMethod === "PHONE" && form.mobile.length !== 10) {
      return setError("Please enter a valid 10-digit phone number.");
    }
    if (form.contactMethod === "EMAIL" && !form.email) {
      return setError("Please enter a valid email address.");
    }
    if (!form.sportId || !registrationLevel) {
      return setError("Please select a sport.");
    }
    if (normalEvents.length > 0 && normalSelectedCount !== maxEventsSelectable) {
      return setError(`Please select exactly ${maxEventsSelectable} event${maxEventsSelectable > 1 ? "s" : ""} for ${selectedSport?.name}.`);
    }
    if (bankRequired && (!form.bankName || !form.accountHolderName || !form.accountNumber || !form.ifscCode || !passbookUrl)) {
      return setError("Bank details are required for State-level registration.");
    }
    if (!form.districtId || !form.blockId) {
      return setError("Please select your District and Block.");
    }
    if (showSansad && !form.sansadId) return setError("Please select your Sansad.");
    if (showVidhanSabha && !form.vidhanSabhaId) return setError("Please select your Vidhan Sabha.");
    if (showNyayPanchayat && !form.nyayPanchayatId) return setError("Please select your Nyay Panchayat.");

    setSubmitting(true);
    try {
      const res = await registrationsApi.registerKhel({
        hasDisability: form.hasDisability === "yes",
        dob: new Date(form.dob + "T00:00:00.000Z"),
        ageCategory,
        gender: form.gender as "MALE" | "FEMALE",
        sportId: form.sportId,
        selectedEvents,
        registrationLevel,
        photoUrl: photoUrl.url,
        fullName: form.fullName,
        email: form.contactMethod === "EMAIL" ? form.email : undefined,
        mobile: form.contactMethod === "PHONE" ? form.mobile : undefined,
        aadharNumber: form.aadharNumber,
        fathersName: form.fathersName,
        mothersName: form.mothersName,
        address: form.address,
        districtId: form.districtId,
        blockId: form.blockId,
        sansadId: showSansad ? form.sansadId : undefined,
        vidhanSabhaId: showVidhanSabha ? form.vidhanSabhaId : undefined,
        nyayPanchayatId: showNyayPanchayat ? form.nyayPanchayatId : undefined,
        birthEducationCertificateUrl: certUrl.url,
        residenceProofUrl: residenceUrl?.url,
        disabilityCertificateUrl: disabilityCertUrl?.url,
        bankName: form.bankName || undefined,
        accountHolderName: form.accountHolderName || undefined,
        accountNumber: form.accountNumber || undefined,
        ifscCode: form.ifscCode || undefined,
        passbookOrChequeUrl: passbookUrl?.url,
      });
      setRegistrationNo(res.data.registrationNo);
      setShowSuccessModal(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors?.length) {
          setFieldErrors(Object.fromEntries(err.errors.map((e) => [e.field, e.message])));
        }
      } else {
        setError("Submission failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 lg:px-5 py-6 lg:py-10">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1a1a2e]">CM Trophy — Application Form</h1>
      <p className="text-lg font-semibold text-[#374151]">सीएम ट्रॉफी — आवेदन पत्र</p>
      <p className="text-sm text-[#6b7280] mt-2">Fill in all required fields and upload the necessary documents.</p>
      <p className="text-sm text-[#9ca3af] mb-6">कृपया सभी आवश्यक फ़ील्ड भरें और आवश्यक दस्तावेज़ अपलोड करें।</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {/* Section 1: Personal Details */}
        <fieldset className="bg-white rounded-2xl p-5 lg:p-8 border border-[#e2e8f0] shadow-sm">
          <div className="text-lg font-bold text-[#1e3a8a] mb-1 w-full">Personal Details</div>
          <p className="text-sm text-[#9ca3af] mb-6 pb-3 border-b border-[#e2e8f0] w-full">व्यक्तिगत विवरण</p>
          <div className="grid gap-5">
            <FileField
              label="Applicant Photo"
              hindi="आवेदक फोटो"
              required
              fileName={photoUrl?.name ?? null}
              uploading={!!uploading.photo}
              onChange={(f) => handleFileUpload("photo", f, setPhotoUrl)}
              accept="image/jpeg,image/png"
              hint="JPG or PNG, under 5MB."
            />

            <Field label="Register Via" hindi="इसके द्वारा पंजीकरण करें" required>
              <div className="flex items-center gap-6 pt-1">
                {([
                  { v: "PHONE", l: "Mobile Number" },
                  { v: "EMAIL", l: "Email ID" },
                ] as const).map(({ v, l }) => (
                  <label key={v} className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      checked={form.contactMethod === v}
                      onChange={() => set("contactMethod", v)}
                      required
                      className="w-4 h-4 accent-[#1e3a8a]"
                    />
                    {l}
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <Field label="Full Name" hindi="पूरा नाम" required>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  required
                  className={inp}
                />
              </Field>
              {form.contactMethod === "PHONE" ? (
                <Field label="Phone Number" hindi="फोन नंबर" required>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    required
                    className={inp}
                  />
                </Field>
              ) : (
                <Field label="Email" hindi="ईमेल" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                    className={inp}
                  />
                </Field>
              )}
              <Field label="Aadhar Number" hindi="आधार संख्या" required>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  value={form.aadharNumber}
                  onChange={(e) => set("aadharNumber", e.target.value.replace(/\D/g, "").slice(0, 12))}
                  required
                  className={inp}
                />
              </Field>
              <Field label="Father's Name" hindi="पिता का नाम" required>
                <input
                  type="text"
                  value={form.fathersName}
                  onChange={(e) => set("fathersName", e.target.value)}
                  required
                  className={inp}
                />
              </Field>
              <Field label="Mother's Name" hindi="माता का नाम" required>
                <input
                  type="text"
                  placeholder="Enter mother's name"
                  value={form.mothersName}
                  onChange={(e) => set("mothersName", e.target.value)}
                  required
                  className={inp}
                />
              </Field>
            </div>

            <Field label="Address" hindi="पता" required>
              <input
                type="text"
                placeholder="Enter address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                required
                className={inp}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <Field label="District" hindi="जिला" required>
                <select
                  value={form.districtId}
                  onChange={(e) => set("districtId", e.target.value)}
                  required
                  className={sel}
                >
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Block" hindi="ब्लॉक" required>
                <select
                  value={form.blockId}
                  onChange={(e) => set("blockId", e.target.value)}
                  required
                  disabled={!form.districtId || blocksLoading}
                  className={sel + " disabled:bg-[#f1f5f9]"}
                >
                  <option value="">Select Block</option>
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <FileField
                label="Birth/Education Certificate"
                hindi="जन्म/शिक्षा प्रमाण पत्र"
                required
                fileName={certUrl?.name ?? null}
                uploading={!!uploading.cert}
                onChange={(f) => handleFileUpload("cert", f, setCertUrl, "raw")}
              />
              <FileField
                label="Residence Proof"
                hindi="निवास प्रमाण"
                fileName={residenceUrl?.name ?? null}
                uploading={!!uploading.residence}
                onChange={(f) => handleFileUpload("residence", f, setResidenceUrl, "raw")}
              />
            </div>
          </div>
        </fieldset>

        {/* Section 2: Sport & Events */}
        <fieldset className="bg-white rounded-2xl p-5 lg:p-8 border border-[#e2e8f0] shadow-sm">
          <div className="text-lg font-bold text-[#1e3a8a] mb-1 w-full">Sport &amp; Events</div>
          <p className="text-sm text-[#9ca3af] mb-6 pb-3 border-b border-[#e2e8f0] w-full">खेल एवं प्रतियोगिताएं</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <Field label="Has Disability?" hindi="क्या दिव्यांग हैं?" required>
              <div className="flex items-center gap-6 pt-1">
                {(["yes", "no"] as const).map((v) => (
                  <label key={v} className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer capitalize">
                    <input
                      type="radio"
                      name="hasDisability"
                      checked={form.hasDisability === v}
                      onChange={() => setHasDisability(v)}
                      required
                      className="w-4 h-4 accent-[#1e3a8a]"
                    />
                    {v}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Date of Birth" hindi="जन्म तिथि" required>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => set("dob", e.target.value)}
                required
                className={inp}
              />
            </Field>

            <Field label="Age Category" hindi="आयु वर्ग (auto)" required>
              <input
                type="text"
                readOnly
                disabled
                value={ageCategory ? CM_TROPHY_AGE_CATEGORY_LABELS[ageCategory] : ""}
                placeholder={form.hasDisability === "yes" ? "Para Athlete (Open)" : "Select date of birth"}
                className={disabledSel + " cursor-not-allowed"}
              />
              {ageCategoryError && (
                <p className="text-[11px] text-red-500 mt-1">{ageCategoryError}</p>
              )}
            </Field>

            <Field label="Gender" hindi="लिंग" required>
              <div className="flex items-center gap-6 pt-1">
                {([
                  { v: "MALE", l: "Male / पुरुष" },
                  { v: "FEMALE", l: "Female / महिला" },
                ] as const).map(({ v, l }) => (
                  <label key={v} className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={form.gender === v}
                      onChange={() => set("gender", v)}
                      required
                      className="w-4 h-4 accent-[#1e3a8a]"
                    />
                    {l}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Sport" hindi="खेल" required>
              <select
                value={form.sportId}
                onChange={(e) => set("sportId", e.target.value)}
                required
                disabled={!ageCategory || sportOptionsLoading}
                className={sel + " disabled:bg-[#f1f5f9]"}
              >
                <option value="">
                  {sportOptionsLoading ? "Loading sports…" : !ageCategory ? "Select date of birth first" : "Select sport"}
                </option>
                {sportOptions.map((s) => (
                  <option key={s.sportId} value={s.sportId}>{sportDisplayName(s.name)}</option>
                ))}
              </select>
            </Field>

            {normalEvents.length > 0 && (
              <Field
                label={`Event${maxEventsSelectable > 1 ? "s" : ""} (choose ${maxEventsSelectable})`}
                hindi="प्रतियोगिता चुनें"
                required
              >
                <div className="flex flex-col gap-1.5 pt-1">
                  {normalEvents.map((ev) => {
                    const checked = selectedEvents.includes(ev.name);
                    const capReached = maxEventsSelectable > 1 && !checked && normalSelectedCount >= maxEventsSelectable;
                    return (
                      <label
                        key={ev.name}
                        className={"flex items-center gap-2 text-sm text-[#374151]" + (capReached ? " opacity-40 cursor-not-allowed" : " cursor-pointer")}
                      >
                        <input
                          type={maxEventsSelectable > 1 ? "checkbox" : "radio"}
                          name="event"
                          checked={checked}
                          disabled={capReached}
                          onChange={() => toggleNormalEvent(ev.name)}
                          className="w-4 h-4 accent-[#1e3a8a]"
                        />
                        {ev.name}
                      </label>
                    );
                  })}
                </div>
                {bonusEvent && (
                  <label className="flex items-center gap-2 text-sm text-[#1e3a8a] font-medium cursor-pointer mt-2 pt-2 border-t border-[#e5e7eb]">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(bonusEvent.name)}
                      onChange={toggleBonusEvent}
                      className="w-4 h-4 accent-[#1e3a8a]"
                    />
                    + {bonusEvent.name} (Free Event)
                  </label>
                )}
              </Field>
            )}

            {form.hasDisability === "yes" && (
              <FileField
                label="Disability Certificate"
                hindi="दिव्यांगता प्रमाण पत्र"
                required
                fileName={disabilityCertUrl?.name ?? null}
                uploading={!!uploading.disabilityCert}
                onChange={(f) => handleFileUpload("disabilityCert", f, setDisabilityCertUrl, "raw")}
              />
            )}
          </div>
        </fieldset>

        {/* Section 3: Registration Level & Location */}
        <fieldset className="bg-white rounded-2xl p-5 lg:p-8 border border-[#e2e8f0] shadow-sm">
          <div className="text-lg font-bold text-[#1e3a8a] mb-1 w-full">Registration Level &amp; Location</div>
          <p className="text-sm text-[#9ca3af] mb-6 pb-3 border-b border-[#e2e8f0] w-full">पंजीकरण स्तर एवं स्थान</p>
          <Field label="Registration Level" hindi="पंजीकरण स्तर (auto)" required>
            <input
              type="text"
              readOnly
              disabled
              value={registrationLevel ? CM_TROPHY_REGISTRATION_LEVEL_LABELS[registrationLevel] : ""}
              placeholder="Select a sport first"
              className={disabledSel + " cursor-not-allowed"}
            />
          </Field>

          {showSansad && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5 mt-5">
              <Field label="Sansad" hindi="संसद" required>
                <select
                  value={form.sansadId}
                  onChange={(e) => set("sansadId", e.target.value)}
                  required
                  className={sel}
                >
                  <option value="">Select Sansad</option>
                  {sansads.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </Field>
              {showVidhanSabha && (
                <Field label="Vidhan Sabha" hindi="विधान सभा" required>
                  <select
                    value={form.vidhanSabhaId}
                    onChange={(e) => set("vidhanSabhaId", e.target.value)}
                    required
                    disabled={!form.sansadId || vidhanSabhasLoading}
                    className={sel + " disabled:bg-[#f1f5f9]"}
                  >
                    <option value="">Select Vidhan Sabha</option>
                    {vidhanSabhas.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </Field>
              )}
              {showNyayPanchayat && (
                <Field label="Nyay Panchayat" hindi="न्याय पंचायत" required>
                  <select
                    value={form.nyayPanchayatId}
                    onChange={(e) => set("nyayPanchayatId", e.target.value)}
                    required
                    disabled={!form.vidhanSabhaId || nyayPanchayatsLoading}
                    className={sel + " disabled:bg-[#f1f5f9]"}
                  >
                    <option value="">Select Nyay Panchayat</option>
                    {nyayPanchayats.map((n) => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          )}
        </fieldset>

        {/* Section 4: Bank Details (unchanged) */}
        <fieldset className="bg-white rounded-2xl p-5 lg:p-8 border border-[#e2e8f0] shadow-sm">
          <div className="text-lg font-bold text-[#1e3a8a] mb-1 w-full">Bank Details</div>
          <p className="text-sm text-[#9ca3af] mb-6 pb-3 border-b border-[#e2e8f0] w-full">
            बैंक विवरण{bankRequired ? " (राज्य स्तर के लिए अनिवार्य)" : ""}
          </p>
          <div className="grid gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <Field label="Bank Name" hindi="बैंक का नाम" required={bankRequired}>
                <input
                  type="text"
                  placeholder="Enter bank name"
                  value={form.bankName}
                  onChange={(e) => set("bankName", e.target.value)}
                  required={bankRequired}
                  className={inp}
                />
              </Field>
              <Field label="Account Holder's Name" hindi="खाताधारक का नाम" required={bankRequired}>
                <input
                  type="text"
                  placeholder="Enter account holder's name"
                  value={form.accountHolderName}
                  onChange={(e) => set("accountHolderName", e.target.value)}
                  required={bankRequired}
                  className={inp}
                />
              </Field>
              <Field label="Account Number" hindi="खाता संख्या" required={bankRequired}>
                <input
                  type="text"
                  placeholder="Enter account number"
                  value={form.accountNumber}
                  onChange={(e) => set("accountNumber", e.target.value)}
                  required={bankRequired}
                  className={inp}
                />
              </Field>
              <Field label="IFSC Code" hindi="आईएफएससी कोड" required={bankRequired}>
                <input
                  type="text"
                  placeholder="E.G. SBIN0001234"
                  value={form.ifscCode}
                  onChange={(e) => set("ifscCode", e.target.value.toUpperCase())}
                  required={bankRequired}
                  className={inp}
                />
              </Field>
            </div>
            <FileField
              label="Passbook / Cancelled Cheque"
              hindi="पासबुक / रद्द किया गया चेक"
              required={bankRequired}
              fileName={passbookUrl?.name ?? null}
              uploading={!!uploading.passbook}
              onChange={(f) => handleFileUpload("passbook", f, setPassbookUrl, "raw")}
            />
          </div>
        </fieldset>

        {error && (
          <div className="px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}
        {Object.entries(fieldErrors).filter(([, msg]) => msg).length > 0 && (
          <div className="px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex flex-col gap-1">
            {Object.entries(fieldErrors)
              .filter(([, msg]) => msg)
              .map(([field, msg]) => (
                <p key={field} className="flex items-center gap-2">
                  <span className="capitalize">{field.replace(/([A-Z])/g, " $1")}:</span> {msg}
                </p>
              ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border-2 border-[#e5e7eb] text-[#374151] font-semibold text-sm hover:border-[#1e3a8a] transition-colors no-underline text-center"
          >
            Cancel
            <span className="block text-xs font-normal text-[#9ca3af]">रद्द करें</span>
          </Link>
          <button
            type="submit"
            disabled={submitting || anyUploading}
            className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {submitting ? "Submitting…" : "Submit Application"}
            <span className="block text-xs font-normal text-white/70">आवेदन जमा करें</span>
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl max-w-[440px] w-full p-8 text-center shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-1">Registration Submitted!</h2>
            <p className="text-base font-semibold text-[#374151] mb-4">पंजीकरण जमा हो गया!</p>
            <p className="text-sm text-[#6b7280] mb-1">Your CMT ID (CM Trophy application number) is:</p>
            <p className="text-2xl font-bold text-[#1e3a8a] tracking-widest mb-4">{registrationNo}</p>
            <p className="text-sm text-[#6b7280] mb-6">
              Save this ID — you&apos;ll need it to check your CM Trophy application status.
            </p>
            <div className="flex gap-3">
              <a
                href={registrationsApi.downloadKhelApplicationPdf(registrationNo)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#1e3a8a] text-[#1e3a8a] font-semibold text-sm text-center hover:bg-[#1e3a8a]/5 transition-colors"
              >
                Download Application Form
                <span className="block text-xs font-normal">आवेदन पत्र डाउनलोड करें</span>
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-semibold text-sm rounded-xl px-4 py-3 transition-colors"
              >
                Continue
                <span className="block text-xs font-normal text-white/70">जारी रखें</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
