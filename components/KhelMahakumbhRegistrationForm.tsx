"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { registrationsApi } from "@/lib/api/registrations";
import { infrastructureApi, District } from "@/lib/api/infrastructure";
import { useBlocks } from "@/hooks/useInfrastructure";
import { sportsApi, Sport } from "@/lib/api/sports";
import { ApiError } from "@/lib/api";

// TODO: replace with the final registration-level values once confirmed
const REGISTRATION_LEVELS = [
  { value: "DISTRICT", label: "District" },
  { value: "STATE", label: "State" },
  { value: "NATIONAL", label: "National" },
];

async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "raw" = "image",
): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) return null;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  if (resourceType === "raw") fd.append("resource_type", "raw");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: fd },
  );
  const data = await res.json();
  return data.secure_url ?? null;
}

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

export default function KhelMahakumbhRegistrationForm() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registrationNo, setRegistrationNo] = useState("");

  useEffect(() => {
    infrastructureApi.getDistricts().then((r) => setDistricts(r.data)).catch(() => {});
    sportsApi.list().then((r) => setSports(r.data.filter((s) => s.isActive))).catch(() => {});
  }, []);

  const blank = {
    hasDisability: "" as "" | "yes" | "no",
    dob: "",
    ageCategory: "" as "" | "JUNIOR" | "SENIOR",
    gender: "" as "" | "MALE" | "FEMALE",
    sportId: "",
    registrationLevel: "",
    fullName: "",
    email: "",
    mobile: "",
    aadharNumber: "",
    fathersName: "",
    mothersName: "",
    address: "",
    districtId: "",
    blockId: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
  };

  const [form, setForm] = useState(blank);
  const { blocks, loading: blocksLoading } = useBlocks(form.districtId || undefined);

  const [photoUrl, setPhotoUrl] = useState<{ name: string; url: string } | null>(null);
  const [certUrl, setCertUrl] = useState<{ name: string; url: string } | null>(null);
  const [residenceUrl, setResidenceUrl] = useState<{ name: string; url: string } | null>(null);
  const [passbookUrl, setPassbookUrl] = useState<{ name: string; url: string } | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const set = (k: keyof typeof blank, v: string) =>
    setForm((f) => ({ ...f, [k]: v, ...(k === "districtId" ? { blockId: "" } : {}) }));

  const handleFileUpload = async (
    key: string,
    file: File,
    setter: (v: { name: string; url: string } | null) => void,
    resourceType: "image" | "raw" = "image",
  ) => {
    setUploading((u) => ({ ...u, [key]: true }));
    const url = await uploadToCloudinary(file, resourceType);
    setUploading((u) => ({ ...u, [key]: false }));
    if (url) setter({ name: file.name, url });
  };

  const inp =
    "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-lg text-sm text-[#374151] outline-none focus:border-[#1e3a8a] transition-colors";
  const sel = inp + " appearance-none bg-white";

  const anyUploading = Object.values(uploading).some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!photoUrl) return setError("Please upload the applicant photo.");
    if (!certUrl) return setError("Please upload the birth/education certificate.");

    setSubmitting(true);
    try {
      const res = await registrationsApi.registerKhel({
        hasDisability: form.hasDisability === "yes",
        dob: new Date(form.dob + "T00:00:00.000Z"),
        ageCategory: form.ageCategory as "JUNIOR" | "SENIOR",
        gender: form.gender as "MALE" | "FEMALE",
        sportId: form.sportId,
        registrationLevel: form.registrationLevel,
        photoUrl: photoUrl.url,
        fullName: form.fullName,
        email: form.email || undefined,
        mobile: form.mobile,
        aadharNumber: form.aadharNumber,
        fathersName: form.fathersName,
        mothersName: form.mothersName,
        address: form.address,
        districtId: form.districtId,
        blockId: form.blockId,
        birthEducationCertificateUrl: certUrl.url,
        residenceProofUrl: residenceUrl?.url,
        bankName: form.bankName || undefined,
        accountHolderName: form.accountHolderName || undefined,
        accountNumber: form.accountNumber || undefined,
        ifscCode: form.ifscCode || undefined,
        passbookOrChequeUrl: passbookUrl?.url,
      });
      setRegistrationNo(res.data.registrationNo);
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

  if (registrationNo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-check text-green-600 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-[#1e3a8a] mb-3">Application Submitted!</h2>
        <p className="text-[#6b7280] mb-6">Your Khel Mahakumbh 2026 application has been submitted successfully.</p>
        <div className="bg-[#eff6ff] border-2 border-[#1e3a8a] rounded-xl px-8 py-5 mb-6">
          <p className="text-sm text-[#6b7280] mb-1">Your Registration ID</p>
          <p className="text-2xl font-bold text-[#1e3a8a] tracking-widest">{registrationNo}</p>
        </div>
        <Link
          href="/"
          className="bg-[#1e3a8a] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1e40af] transition-colors no-underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 lg:px-5 py-6 lg:py-10">
      <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1a1a2e]">CM Trophy — Application Form</h1>
      <p className="text-lg font-semibold text-[#374151]">सीएम ट्रॉफी — आवेदन पत्र</p>
      <p className="text-sm text-[#6b7280] mt-2">Fill in all required fields and upload the necessary documents.</p>
      <p className="text-sm text-[#9ca3af] mb-6">कृपया सभी आवश्यक फ़ील्ड भरें और आवश्यक दस्तावेज़ अपलोड करें।</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {/* Section 1: Sport & Events */}
        <fieldset className="bg-white rounded-2xl p-5 lg:p-8 border border-[#e2e8f0] shadow-sm">
          <legend className="text-lg font-bold text-[#1e3a8a] mb-1 w-full">Sport &amp; Events</legend>
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
                      onChange={() => set("hasDisability", v)}
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

            <Field label="Age Category" hindi="आयु वर्ग" required>
              <select
                value={form.ageCategory}
                onChange={(e) => set("ageCategory", e.target.value)}
                required
                className={sel}
              >
                <option value="">Select age category</option>
                <option value="JUNIOR">Junior</option>
                <option value="SENIOR">Senior</option>
              </select>
            </Field>

            <Field label="Gender" hindi="लिंग" required>
              <div className="flex items-center gap-6 pt-1">
                {([
                  { v: "MALE", l: "Male" },
                  { v: "FEMALE", l: "Female" },
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
                className={sel}
              >
                <option value="">Select sport</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </fieldset>

        {/* Section 2: Registration Level & Location */}
        <fieldset className="bg-white rounded-2xl p-5 lg:p-8 border border-[#e2e8f0] shadow-sm">
          <legend className="text-lg font-bold text-[#1e3a8a] mb-1 w-full">Registration Level &amp; Location</legend>
          <p className="text-sm text-[#9ca3af] mb-6 pb-3 border-b border-[#e2e8f0] w-full">पंजीकरण स्तर एवं स्थान</p>
          <Field label="Registration Level" hindi="पंजीकरण स्तर" required>
            <select
              value={form.registrationLevel}
              onChange={(e) => set("registrationLevel", e.target.value)}
              required
              className={sel}
            >
              <option value="">Select registration level</option>
              {REGISTRATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </Field>
        </fieldset>

        {/* Section 3: Personal Details */}
        <fieldset className="bg-white rounded-2xl p-5 lg:p-8 border border-[#e2e8f0] shadow-sm">
          <legend className="text-lg font-bold text-[#1e3a8a] mb-1 w-full">Personal Details</legend>
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
              <Field label="Email" hindi="ईमेल">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inp}
                />
              </Field>
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

        {/* Section 4: Bank Details */}
        <fieldset className="bg-white rounded-2xl p-5 lg:p-8 border border-[#e2e8f0] shadow-sm">
          <legend className="text-lg font-bold text-[#1e3a8a] mb-1 w-full">Bank Details</legend>
          <p className="text-sm text-[#9ca3af] mb-6 pb-3 border-b border-[#e2e8f0] w-full">बैंक विवरण</p>
          <div className="grid gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <Field label="Bank Name" hindi="बैंक का नाम">
                <input
                  type="text"
                  placeholder="Enter bank name"
                  value={form.bankName}
                  onChange={(e) => set("bankName", e.target.value)}
                  className={inp}
                />
              </Field>
              <Field label="Account Holder's Name" hindi="खाताधारक का नाम">
                <input
                  type="text"
                  placeholder="Enter account holder's name"
                  value={form.accountHolderName}
                  onChange={(e) => set("accountHolderName", e.target.value)}
                  className={inp}
                />
              </Field>
              <Field label="Account Number" hindi="खाता संख्या">
                <input
                  type="text"
                  placeholder="Enter account number"
                  value={form.accountNumber}
                  onChange={(e) => set("accountNumber", e.target.value)}
                  className={inp}
                />
              </Field>
              <Field label="IFSC Code" hindi="आईएफएससी कोड">
                <input
                  type="text"
                  placeholder="E.G. SBIN0001234"
                  value={form.ifscCode}
                  onChange={(e) => set("ifscCode", e.target.value.toUpperCase())}
                  className={inp}
                />
              </Field>
            </div>
            <FileField
              label="Passbook / Cancelled Cheque"
              hindi="पासबुक / रद्द किया गया चेक"
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
    </div>
  );
}
