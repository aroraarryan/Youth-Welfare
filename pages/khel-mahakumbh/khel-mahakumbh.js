(function () {
  "use strict";

  /* ──────────────────────────────────────────────────────────────────
     CONSTANTS
     ────────────────────────────────────────────────────────────────── */
  var KM_STORAGE_KEY = "kmk_registrations";
  var KM_DRAFT_KEY = "kmk_form_draft";
  var KM_COUNTER_KEY = "kmk_id_counter";
  var MAX_SPORTS = 3;
  var MAX_PHOTO_MB = 2;
  var MIN_AGE = 10;
  var MAX_AGE = 60;

  /* ──────────────────────────────────────────────────────────────────
     ────────────────────────────────────────────────────────────────── */

  /**
   * Save one registration record.
   * BACKEND: fetch('/api/registrations', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(record) })
   */
  function saveRegistration(record) {
    var list = getRegistrations();
    list.push(record);
    localStorage.setItem(KM_STORAGE_KEY, JSON.stringify(list));
    var n = parseInt(localStorage.getItem(KM_COUNTER_KEY) || "0", 10) + 1;
    localStorage.setItem(KM_COUNTER_KEY, String(n));
    return record;
  }

  /**
   * Fetch all registration records.
   * BACKEND: return fetch('/api/registrations').then(r => r.json())
   */
  function getRegistrations() {
    try {
      return JSON.parse(localStorage.getItem(KM_STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  /**
   * Delete one registration by ID.
   * BACKEND: fetch('/api/registrations/' + id, { method:'DELETE' })
   */
  function deleteRegistration(id) {
    var list = getRegistrations().filter(function (r) {
      return r.registrationId !== id;
    });
    localStorage.setItem(KM_STORAGE_KEY, JSON.stringify(list));
  }

  /* ──────────────────────────────────────────────────────────────────
     REGISTRATION ID GENERATOR
     ────────────────────────────────────────────────────────────────── */
  function generateId() {
    var n = parseInt(localStorage.getItem(KM_COUNTER_KEY) || "0", 10) + 1;
    return "KMK-UT-2026-" + String(n).padStart(6, "0");
  }

  /* ──────────────────────────────────────────────────────────────────
     UTILITY
     ────────────────────────────────────────────────────────────────── */
  function esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function $(id) {
    return document.getElementById(id);
  }

  function showToast(msg, type) {
    var c = $("kmToasts");
    if (!c) return;
    var t = document.createElement("div");
    t.className = "km-toast " + (type || "info");
    var icons = { success: "✅", error: "❌", info: "ℹ️" };
    t.innerHTML = "<span>" + (icons[type] || "ℹ️") + "</span> " + esc(msg);
    c.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, 3800);
  }

  /* ──────────────────────────────────────────────────────────────────
     AGE / CATEGORY
     ────────────────────────────────────────────────────────────────── */
  function computeAge(dobStr) {
    if (!dobStr) return { age: null, category: "" };
    var today = new Date();
    var born = new Date(dobStr);
    if (isNaN(born)) return { age: null, category: "" };
    var age = today.getFullYear() - born.getFullYear();
    var m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
    var cat =
      age >= MIN_AGE && age <= 18
        ? "Junior"
        : age > 18 && age <= MAX_AGE
          ? "Senior"
          : "Ineligible";
    return { age: age, category: cat };
  }

  function refreshAgeDisplay() {
    var dob = $("kmDob");
    var ageEl = $("kmCalcAge");
    var catEl = $("kmCalcCat");
    if (!dob || !ageEl || !catEl) return;
    var info = computeAge(dob.value);
    ageEl.textContent = info.age !== null ? info.age + " yrs" : "—";
    catEl.textContent = info.category || "";
    catEl.className = "km-age-badge";
    if (info.category === "Junior") catEl.classList.add("junior");
    else if (info.category === "Senior") catEl.classList.add("senior");
    else if (info.category === "Ineligible") catEl.classList.add("ineligible");
  }

  /* ──────────────────────────────────────────────────────────────────
     PROGRESS BAR
     ────────────────────────────────────────────────────────────────── */
  function updateProgress() {
    var d = collectData();
    var tot = 14;
    var n = 0;
    if (d.fullName && d.fullName.length >= 3) n++;
    if (d.dob) n++;
    if (d.gender) n++;
    if (d.mobile && d.mobile.length === 10) n++;
    if (d.district) n++;
    if (d.sports && d.sports.length > 0) n++;
    var prev = $("kmPhotoPreview");
    if (prev && prev.src && prev.src !== window.location.href && !prev.hidden)
      n++;
    if (d.emergencyName && d.emergencyName.length >= 3) n++;
    if (d.emergencyPhone && d.emergencyPhone.length === 10) n++;
    if (d.emergencyRelation) n++;
    if (d.consentAccuracy) n++;
    if (d.consentMedical) n++;
    if (d.consentRules) n++;
    if (d.consentData) n++;
    var pct = Math.round((n / tot) * 100);
    var fill = $("kmProgressFill");
    var lbl = $("kmProgressLabel");
    var wrap = $("kmProgress");
    if (fill) fill.style.width = pct + "%";
    if (lbl) lbl.textContent = pct + "% complete";
    if (wrap) wrap.setAttribute("aria-valuenow", pct);
  }

  /* ──────────────────────────────────────────────────────────────────
     DATA COLLECTION
     ────────────────────────────────────────────────────────────────── */
  function collectData() {
    var form = $("kmForm");
    if (!form) return {};
    var genderEl = form.querySelector('input[name="gender"]:checked');
    var sports = Array.prototype.slice
      .call(form.querySelectorAll('input[name="sport"]:checked'))
      .map(function (c) {
        return c.value;
      });

    return {
      fullName: (form.elements["fullName"] || {}).value || "",
      dob: (form.elements["dob"] || {}).value || "",
      gender: genderEl ? genderEl.value : "",
      mobile: (form.elements["mobile"] || {}).value || "",
      email: (form.elements["email"] || {}).value || "",
      district: (form.elements["district"] || {}).value || "",
      sports: sports,
      emergencyName: (form.elements["emergencyName"] || {}).value || "",
      emergencyPhone: (form.elements["emergencyPhone"] || {}).value || "",
      emergencyRelation: (form.elements["emergencyRelation"] || {}).value || "",
      medicalConditions: (form.elements["medicalConditions"] || {}).value || "",
      consentAccuracy:
        (form.elements["consentAccuracy"] || {}).checked || false,
      consentMedical: (form.elements["consentMedical"] || {}).checked || false,
      consentRules: (form.elements["consentRules"] || {}).checked || false,
      consentData: (form.elements["consentData"] || {}).checked || false,
    };
  }

  /* ──────────────────────────────────────────────────────────────────
     VALIDATION
     ────────────────────────────────────────────────────────────────── */
  var validators = {
    fullName: function (v) {
      v = (v || "").trim();
      if (!v) return "Full name is required.";
      if (v.length < 3) return "Name must be at least 3 characters.";
      return null;
    },
    dob: function (v) {
      if (!v) return "Date of birth is required.";
      var info = computeAge(v);
      if (info.age === null) return "Invalid date.";
      if (info.age < MIN_AGE)
        return "Participant must be at least " + MIN_AGE + " years old.";
      if (info.age > MAX_AGE)
        return "Participant must be at most " + MAX_AGE + " years old.";
      return null;
    },
    gender: function (v) {
      return v ? null : "Please select a gender option.";
    },
    mobile: function (v) {
      v = (v || "").trim();
      if (!v) return "Mobile number is required.";
      if (!/^[6-9][0-9]{9}$/.test(v))
        return "Enter a valid 10-digit Indian mobile number (starting 6–9).";
      return null;
    },
    email: function (v) {
      v = (v || "").trim();
      if (!v) return null; // optional
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        return "Enter a valid email address.";
      return null;
    },
    district: function (v) {
      return v ? null : "Please select your district.";
    },
    sport: function (arr) {
      if (!arr || arr.length === 0) return "Please select at least one sport.";
      if (arr.length > MAX_SPORTS)
        return "You can select up to " + MAX_SPORTS + " sports.";
      return null;
    },
    photo: function () {
      var p = $("kmPhotoPreview");
      if (!p || !p.src || p.src === window.location.href)
        return "Please upload a participant photo.";
      return null;
    },
    emergencyName: function (v) {
      v = (v || "").trim();
      if (!v) return "Emergency contact name is required.";
      if (v.length < 3) return "Name must be at least 3 characters.";
      return null;
    },
    emergencyPhone: function (v) {
      v = (v || "").trim();
      if (!v) return "Emergency phone is required.";
      if (!/^[6-9][0-9]{9}$/.test(v))
        return "Enter a valid 10-digit phone number.";
      return null;
    },
    emergencyRelation: function (v) {
      return v ? null : "Please select the relation.";
    },
    consentAccuracy: function (v) {
      return v ? null : "You must confirm the accuracy of your information.";
    },
    consentMedical: function (v) {
      return v ? null : "You must confirm your medical fitness.";
    },
    consentRules: function (v) {
      return v ? null : "You must agree to the event rules.";
    },
    consentData: function (v) {
      return v ? null : "You must consent to data processing.";
    },
  };

  function setFieldState(key, err) {
    var errEl =
      $(
        key.replace(/([A-Z])/g, function (m) {
          return m;
        }) + "-err",
      ) || $("km" + key.charAt(0).toUpperCase() + key.slice(1) + "-err");
    // Try common id patterns
    var ids = [
      "km" + key.charAt(0).toUpperCase() + key.slice(1) + "-err",
      "kmConsent" +
        key.replace("consent", "").charAt(0).toUpperCase() +
        key.replace("consent", "").slice(1) +
        "-err",
    ];
    ids.forEach(function (id) {
      if (!errEl) errEl = $(id);
    });

    if (errEl) errEl.textContent = err || "";

    // Input element
    var input =
      $("km" + key.charAt(0).toUpperCase() + key.slice(1)) ||
      $(
        "km" +
          key.charAt(0).toUpperCase() +
          key.slice(1).replace(/([A-Z])/g, "$1"),
      );
    if (input) {
      input.classList.toggle("error", !!err);
      input.classList.toggle("valid", !err && !!(input.value || "").trim());
      if (err) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  }

  function validateAll(data) {
    var errors = [];
    var checks = [
      ["fullName", data.fullName],
      ["dob", data.dob],
      ["gender", data.gender],
      ["mobile", data.mobile],
      ["email", data.email],
      ["district", data.district],
      ["sport", data.sports],
      ["photo", null],
      ["emergencyName", data.emergencyName],
      ["emergencyPhone", data.emergencyPhone],
      ["emergencyRelation", data.emergencyRelation],
      ["consentAccuracy", data.consentAccuracy],
      ["consentMedical", data.consentMedical],
      ["consentRules", data.consentRules],
      ["consentData", data.consentData],
    ];
    checks.forEach(function (pair) {
      var key = pair[0];
      var val = pair[1];
      var fn = validators[key];
      var err = fn ? fn(val) : null;
      // Map validation key → error element id
      var errId = {
        fullName: "kmFullName-err",
        dob: "kmDob-err",
        gender: "kmGender-err",
        mobile: "kmMobile-err",
        email: "kmEmail-err",
        district: "kmDistrict-err",
        sport: "kmSport-err",
        photo: "kmPhoto-err",
        emergencyName: "kmEmergName-err",
        emergencyPhone: "kmEmergPhone-err",
        emergencyRelation: "kmEmergRelation-err",
        consentAccuracy: "kmConsentAccuracy-err",
        consentMedical: "kmConsentMedical-err",
        consentRules: "kmConsentRules-err",
        consentData: "kmConsentData-err",
      }[key];
      var errEl = errId ? $(errId) : null;
      if (errEl) errEl.textContent = err || "";
      if (err) errors.push({ key: key, message: err });
    });
    return errors;
  }

  /* ──────────────────────────────────────────────────────────────────
     PHOTO UPLOAD
     ────────────────────────────────────────────────────────────────── */
  function handleFile(file) {
    if (!file) return;
    var errEl = $("kmPhoto-err");
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      if (errEl) errEl.textContent = "Only JPEG and PNG are accepted.";
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      if (errEl)
        errEl.textContent =
          "Photo must be under " +
          MAX_PHOTO_MB +
          "MB (yours: " +
          (file.size / 1048576).toFixed(1) +
          "MB).";
      return;
    }
    if (errEl) errEl.textContent = "";
    var reader = new FileReader();
    reader.onload = function (e) {
      var src = e.target.result;
      var prev = $("kmPhotoPreview");
      var wrap = $("kmPhotoPreviewWrap");
      var ph = $("kmPhotoPlaceholder");
      var zone = $("kmPhotoZone");
      prev.src = src;
      prev.hidden = false;
      wrap.hidden = false;
      ph.hidden = true;
      zone.classList.add("has-photo");
      try {
        sessionStorage.setItem("kmk_photo", src);
      } catch (ex) {}
      updateProgress();
      showToast("Photo uploaded!", "success");
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    var prev = $("kmPhotoPreview");
    var wrap = $("kmPhotoPreviewWrap");
    var ph = $("kmPhotoPlaceholder");
    var zone = $("kmPhotoZone");
    var input = $("kmPhotoInput");
    if (prev) {
      prev.src = "";
      prev.hidden = true;
    }
    if (wrap) wrap.hidden = true;
    if (ph) ph.hidden = false;
    if (zone) zone.classList.remove("has-photo");
    if (input) input.value = "";
    sessionStorage.removeItem("kmk_photo");
    updateProgress();
  }

  /* ──────────────────────────────────────────────────────────────────
     DRAFT SAVE / RESTORE
     ────────────────────────────────────────────────────────────────── */
  var draftTimer = null;

  function saveDraft() {
    localStorage.setItem(KM_DRAFT_KEY, JSON.stringify(collectData()));
    showToast("Draft saved!", "success");
  }

  function loadDraft() {
    try {
      return JSON.parse(localStorage.getItem(KM_DRAFT_KEY));
    } catch (e) {
      return null;
    }
  }

  function discardDraft() {
    localStorage.removeItem(KM_DRAFT_KEY);
    sessionStorage.removeItem("kmk_photo");
  }

  function restoreDraft(data) {
    if (!data) return;
    var form = $("kmForm");
    if (!form) return;

    // Text fields
    [
      "fullName",
      "dob",
      "mobile",
      "email",
      "emergencyName",
      "emergencyPhone",
      "medicalConditions",
    ].forEach(function (n) {
      if (form.elements[n] && data[n] !== undefined)
        form.elements[n].value = data[n] || "";
    });
    // Selects
    ["district", "emergencyRelation"].forEach(function (n) {
      if (form.elements[n] && data[n]) form.elements[n].value = data[n];
    });
    // Radio
    if (data.gender) {
      form.querySelectorAll('input[name="gender"]').forEach(function (r) {
        r.checked = r.value === data.gender;
      });
    }
    // Sports checkboxes
    if (data.sports && data.sports.length) {
      form.querySelectorAll('input[name="sport"]').forEach(function (cb) {
        cb.checked = data.sports.indexOf(cb.value) !== -1;
      });
    }
    // Consent
    [
      "consentAccuracy",
      "consentMedical",
      "consentRules",
      "consentData",
    ].forEach(function (n) {
      if (form.elements[n] && data[n]) form.elements[n].checked = true;
    });
    refreshAgeDisplay();
    updateProgress();
  }

  /* ──────────────────────────────────────────────────────────────────
     FORM SUBMISSION
     ────────────────────────────────────────────────────────────────── */
  function handleSubmit(e) {
    e.preventDefault();
    var btn = $("kmSubmitBtn");
    btn.classList.add("loading");
    btn.disabled = true;

    // Slight async delay for UX
    setTimeout(function () {
      var data = collectData();
      var errors = validateAll(data);

      if (errors.length) {
        btn.classList.remove("loading");
        btn.disabled = false;

        // Show error summary
        var summary = $("kmErrorSummary");
        var list = $("kmErrorList");
        summary.hidden = false;
        list.innerHTML = errors
          .map(function (er) {
            return "<li>" + esc(er.message) + "</li>";
          })
          .join("");

        // Screen reader announcement
        var ann = $("kmLiveAnnouncer");
        if (ann)
          ann.textContent =
            "Form has " +
            errors.length +
            " error" +
            (errors.length !== 1 ? "s" : "") +
            ". Please review.";

        // Focus first errored field
        var firstKey = errors[0].key;
        var firstElId = {
          fullName: "kmFullName",
          dob: "kmDob",
          mobile: "kmMobile",
          email: "kmEmail",
          district: "kmDistrict",
          emergencyName: "kmEmergName",
          emergencyPhone: "kmEmergPhone",
          emergencyRelation: "kmEmergRelation",
        }[firstKey];
        var firstEl = firstElId
          ? $(firstElId)
          : document.querySelector('input[name="' + firstKey + '"]');
        if (firstEl) firstEl.focus();

        summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }

      // All good — build record
      $("kmErrorSummary").hidden = true;
      var ageInfo = computeAge(data.dob);
      var photoSrc = ($("kmPhotoPreview") || {}).src || "";

      /* ── BACKEND INTEGRATION POINT ──────────────────────────────
         This is the payload sent to the API.
         Replace saveRegistration() body with your fetch() call.
         ────────────────────────────────────────────────────────── */
      var record = {
        registrationId: generateId(),
        fullName: data.fullName.trim(),
        dob: data.dob,
        age: ageInfo.age,
        category: ageInfo.category,
        gender: data.gender,
        mobile: data.mobile.trim(),
        email: data.email.trim(),
        district: data.district,
        sports: data.sports,
        emergencyName: data.emergencyName.trim(),
        emergencyPhone: data.emergencyPhone.trim(),
        emergencyRelation: data.emergencyRelation,
        medicalConditions: data.medicalConditions.trim(),
        photoData: photoSrc, // base64 — upload separately in production
        registeredAt: new Date().toISOString(),
        status: "pending",
      };

      saveRegistration(record);
      discardDraft();

      btn.classList.remove("loading");
      btn.disabled = false;

      showSuccessScreen(record);
      loadAdminTable();
    }, 600);
  }

  /* ──────────────────────────────────────────────────────────────────
     SUCCESS SCREEN
     ────────────────────────────────────────────────────────────────── */
  var lastRecord = null;

  function showSuccessScreen(record) {
    lastRecord = record;
    $("kmForm").hidden = true;
    var sec = $("kmSuccess");
    sec.hidden = false;
    sec.scrollIntoView({ behavior: "smooth", block: "start" });

    $("kmRegIdDisplay").textContent = record.registrationId;

    var sports = record.sports
      .map(function (s) {
        return s.replace(/_/g, " ");
      })
      .join(", ");
    var rows = [
      ["Name", record.fullName],
      ["Date of Birth", record.dob],
      ["Age / Category", record.age + " yrs / " + record.category],
      ["Gender", record.gender.replace("_", " ")],
      ["Mobile", "+91 " + record.mobile],
      ["Email", record.email || "Not provided"],
      ["District", record.district.replace(/_/g, " ")],
      ["Sports", sports],
      [
        "Emergency",
        record.emergencyName + " (+91 " + record.emergencyPhone + ")",
      ],
    ];
    $("kmSuccessDetails").innerHTML = rows
      .map(function (r) {
        return (
          '<div class="km-detail-row"><span class="km-detail-label">' +
          r[0] +
          ':</span><span class="km-detail-val">' +
          esc(r[1]) +
          "</span></div>"
        );
      })
      .join("");

    buildPrintReceipt(record);

    var ann = $("kmLiveAnnouncer");
    if (ann)
      ann.textContent =
        "Registration successful! Your ID is " + record.registrationId;
    showToast("Registered! ID: " + record.registrationId, "success");
  }

  function buildPrintReceipt(r) {
    var sports = r.sports
      .map(function (s) {
        return s.replace(/_/g, " ");
      })
      .join(", ");
    var rows = [
      ["Registration ID", r.registrationId],
      ["Full Name", r.fullName],
      ["Date of Birth", r.dob],
      ["Age / Category", r.age + " years / " + r.category],
      ["Gender", r.gender.replace("_", " ")],
      ["Mobile", "+91 " + r.mobile],
      ["Email", r.email || "Not provided"],
      ["District", r.district.replace(/_/g, " ")],
      ["Sports", sports],
      [
        "Emergency Contact",
        r.emergencyName +
          " (+91 " +
          r.emergencyPhone +
          ") — " +
          r.emergencyRelation,
      ],
      ["Medical Info", r.medicalConditions || "None"],
      ["Registered At", new Date(r.registeredAt).toLocaleString()],
      ["Status", r.status.toUpperCase()],
    ];
    var photoHtml = r.photoData
      ? '<div style="text-align:center;margin-bottom:16px"><img src="' +
        r.photoData +
        '" style="width:90px;height:110px;object-fit:cover;border:2px solid #1e3a8a;border-radius:6px" alt="Photo" /></div>'
      : "";
    $("kmPrintContent").innerHTML =
      photoHtml +
      rows
        .map(function (row) {
          return (
            '<div class="km-print-row"><span class="km-print-label">' +
            row[0] +
            ":</span><span>" +
            esc(row[1]) +
            "</span></div>"
          );
        })
        .join("");
  }

  /* ──────────────────────────────────────────────────────────────────
     ADMIN TABLE
     ────────────────────────────────────────────────────────────────── */
  function loadAdminTable() {
    var tbody = $("kmAdminBody");
    var records = getRegistrations();
    var today = new Date().toDateString();
    var todayCt = 0;

    $("kmTotalCount").textContent = records.length;

    if (!records.length) {
      tbody.innerHTML =
        '<tr><td colspan="9" class="km-table-empty">No registrations yet. Submit the form above to see records here.</td></tr>';
      $("kmTodayCount").textContent = 0;
      return;
    }

    tbody.innerHTML = records
      .map(function (r) {
        var d = new Date(r.registeredAt);
        if (d.toDateString() === today) todayCt++;
        var sports = r.sports
          .map(function (s) {
            return s.replace(/_/g, " ");
          })
          .join(", ");
        return (
          "<tr>" +
          '<td><span class="km-table-id">' +
          esc(r.registrationId) +
          "</span></td>" +
          "<td>" +
          esc(r.fullName) +
          "</td>" +
          "<td>" +
          r.age +
          "yr/" +
          esc(r.category) +
          "</td>" +
          "<td>" +
          esc(r.gender.replace("_", " ")) +
          "</td>" +
          "<td>" +
          esc(r.district.replace(/_/g, " ")) +
          "</td>" +
          '<td style="max-width:160px;white-space:normal;font-size:12px">' +
          esc(sports) +
          "</td>" +
          "<td>+91 " +
          esc(r.mobile) +
          "</td>" +
          '<td style="font-size:11px;color:#94a3b8">' +
          d.toLocaleString() +
          "</td>" +
          '<td><button class="km-btn-del" onclick="kmDeleteRecord(\'' +
          esc(r.registrationId) +
          '\')" aria-label="Delete ' +
          esc(r.registrationId) +
          '">🗑 Del</button></td>' +
          "</tr>"
        );
      })
      .join("");

    $("kmTodayCount").textContent = todayCt;
  }

  function deleteRecord(id) {
    if (confirm("Delete registration " + id + "? This cannot be undone.")) {
      deleteRegistration(id);
      loadAdminTable();
      showToast(id + " deleted.", "info");
    }
  }

  function clearAll() {
    var recs = getRegistrations();
    if (!recs.length) {
      showToast("No records to clear.", "info");
      return;
    }
    if (
      confirm("Permanently delete all " + recs.length + " registration(s)?")
    ) {
      localStorage.removeItem(KM_STORAGE_KEY);
      localStorage.removeItem(KM_COUNTER_KEY);
      loadAdminTable();
      showToast("All records cleared.", "info");
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     CSV EXPORT
     ────────────────────────────────────────────────────────────────── */
  function exportCSV() {
    var recs = getRegistrations();
    if (!recs.length) {
      showToast("No records to export.", "info");
      return;
    }
    var headers = [
      "Registration ID",
      "Full Name",
      "DOB",
      "Age",
      "Category",
      "Gender",
      "Mobile",
      "Email",
      "District",
      "Sports",
      "Emergency Name",
      "Emergency Phone",
      "Emergency Relation",
      "Medical Conditions",
      "Registered At",
      "Status",
    ];
    function q(v) {
      if (!v) return "";
      return '"' + String(v).replace(/"/g, '""') + '"';
    }
    var rows = [headers.join(",")].concat(
      recs.map(function (r) {
        return [
          r.registrationId,
          q(r.fullName),
          r.dob,
          r.age,
          r.category,
          r.gender,
          r.mobile,
          q(r.email),
          r.district,
          q(r.sports.join("|")),
          q(r.emergencyName),
          r.emergencyPhone,
          r.emergencyRelation,
          q(r.medicalConditions),
          r.registeredAt,
          r.status,
        ].join(",");
      }),
    );
    var blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "KhelMahakumbh2026_" + Date.now() + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Exported " + recs.length + " record(s).", "success");
  }

  /* ──────────────────────────────────────────────────────────────────
     CAPTCHA
     ────────────────────────────────────────────────────────────────── */
  var CHARS = "ABCDEFGHJKLMNPRSTUVWXYZ23456789";
  function refreshCaptcha() {
    var code = "";
    for (var i = 0; i < 6; i++)
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    var el = $("kmCaptchaText");
    if (el) el.textContent = code;
    var inp = $("kmCaptchaInput");
    if (inp) inp.value = "";
  }

  /* ──────────────────────────────────────────────────────────────────
     SIDEBAR SECTION HIGHLIGHTING
     ────────────────────────────────────────────────────────────────── */
  function setupSectionObserver() {
    if (!("IntersectionObserver" in window)) return;
    var links = document.querySelectorAll(".km-sec-link");
    var sections = document.querySelectorAll(".km-fieldset[id]");
    if (!links.length || !sections.length) return;

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.classList.remove("active");
            });
            var target = document.querySelector(
              '.km-sec-link[href="#' + entry.target.id + '"]',
            );
            if (target) target.classList.add("active");
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    sections.forEach(function (s) {
      obs.observe(s);
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     REAL-TIME VALIDATION & AUTO-SAVE
     ────────────────────────────────────────────────────────────────── */
  function setupRealtimeValidation() {
    var form = $("kmForm");
    if (!form) return;

    // Progress on any input
    form.addEventListener("input", function () {
      updateProgress();
      clearTimeout(draftTimer);
      draftTimer = setTimeout(function () {
        localStorage.setItem(KM_DRAFT_KEY, JSON.stringify(collectData()));
      }, 2000);
    });

    // Blur validation for text/tel/email
    [
      "kmFullName",
      "kmMobile",
      "kmEmail",
      "kmEmergName",
      "kmEmergPhone",
    ].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      var key = el.name;
      var errId = {
        fullName: "kmFullName-err",
        mobile: "kmMobile-err",
        email: "kmEmail-err",
        emergencyName: "kmEmergName-err",
        emergencyPhone: "kmEmergPhone-err",
      }[key];
      el.addEventListener("blur", function () {
        var err = validators[key] ? validators[key](el.value) : null;
        var errEl = errId ? $(errId) : null;
        if (errEl) errEl.textContent = err || "";
        el.classList.toggle("error", !!err);
        el.classList.toggle("valid", !err && !!el.value.trim());
      });
    });

    // DOB → age + validate
    var dobEl = $("kmDob");
    if (dobEl) {
      dobEl.addEventListener("change", function () {
        refreshAgeDisplay();
        var err = validators.dob(dobEl.value);
        var errEl = $("kmDob-err");
        if (errEl) errEl.textContent = err || "";
        dobEl.classList.toggle("error", !!err);
        dobEl.classList.toggle("valid", !err && !!dobEl.value);
      });
    }

    // Sport checkboxes — enforce max
    form.querySelectorAll('input[name="sport"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        var sel = Array.prototype.slice.call(
          form.querySelectorAll('input[name="sport"]:checked'),
        );
        if (sel.length > MAX_SPORTS) {
          cb.checked = false;
          showToast(
            "You can select up to " + MAX_SPORTS + " sports only.",
            "info",
          );
          return;
        }
        var err = validators.sport(
          sel.map(function (c) {
            return c.value;
          }),
        );
        var errEl = $("kmSport-err");
        if (errEl) errEl.textContent = err || "";
        updateProgress();
      });
    });

    // Select change validation
    [
      ["kmDistrict", "district", "kmDistrict-err"],
      ["kmEmergRelation", "emergencyRelation", "kmEmergRelation-err"],
    ].forEach(function (trio) {
      var el = $(trio[0]);
      if (!el) return;
      el.addEventListener("change", function () {
        var err = validators[trio[1]] ? validators[trio[1]](el.value) : null;
        var errEl = $(trio[2]);
        if (errEl) errEl.textContent = err || "";
        el.classList.toggle("error", !!err);
        updateProgress();
      });
    });

    // Consent checkboxes
    [
      "consentAccuracy",
      "consentMedical",
      "consentRules",
      "consentData",
    ].forEach(function (name) {
      var el = form.elements[name];
      if (!el) return;
      var errId = {
        consentAccuracy: "kmConsentAccuracy-err",
        consentMedical: "kmConsentMedical-err",
        consentRules: "kmConsentRules-err",
        consentData: "kmConsentData-err",
      }[name];
      el.addEventListener("change", function () {
        var err = validators[name] ? validators[name](el.checked) : null;
        var errEl = errId ? $(errId) : null;
        if (errEl) errEl.textContent = err || "";
        updateProgress();
      });
    });

    // Gender radios
    form.querySelectorAll('input[name="gender"]').forEach(function (r) {
      r.addEventListener("change", function () {
        var errEl = $("kmGender-err");
        if (errEl) errEl.textContent = "";
        updateProgress();
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     PRINT / REGISTER ANOTHER (called by inline onclick)
     ────────────────────────────────────────────────────────────────── */
  function print() {
    window.print();
  }

  function registerAnother() {
    var form = $("kmForm");
    if (form) form.reset();
    removePhoto();
    refreshAgeDisplay();
    updateProgress();
    $("kmErrorSummary").hidden = true;
    $("kmSuccess").hidden = true;
    form.hidden = false;
    $("km-main").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ──────────────────────────────────────────────────────────────────
     INIT
     ────────────────────────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    // Set max DOB = today
    var dobEl = $("kmDob");
    if (dobEl) dobEl.max = new Date().toISOString().split("T")[0];

    // Draft restore check
    var draft = loadDraft();
    var banner = $("kmDraftBanner");
    if (draft && draft.fullName && banner) {
      banner.hidden = false;
      var restoreBtn = $("kmRestoreBtn");
      var discardBtn = $("kmDiscardBtn");
      if (restoreBtn)
        restoreBtn.addEventListener("click", function () {
          restoreDraft(draft);
          banner.hidden = true;
          showToast("Draft restored!", "success");
        });
      if (discardBtn)
        discardBtn.addEventListener("click", function () {
          discardDraft();
          banner.hidden = true;
          showToast("Draft discarded.", "info");
        });
    }

    // Photo zone
    var zone = $("kmPhotoZone");
    var input = $("kmPhotoInput");
    var rmBtn = $("kmPhotoRemove");

    if (zone) {
      zone.addEventListener("click", function (e) {
        if (rmBtn && (e.target === rmBtn || rmBtn.contains(e.target))) return;
        if (input) input.click();
      });
      zone.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (input) input.click();
        }
      });
      zone.addEventListener("dragover", function (e) {
        e.preventDefault();
        zone.classList.add("dragover");
      });
      zone.addEventListener("dragleave", function () {
        zone.classList.remove("dragover");
      });
      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        zone.classList.remove("dragover");
        var f =
          e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) handleFile(f);
      });
    }
    if (input)
      input.addEventListener("change", function (e) {
        handleFile(e.target.files && e.target.files[0]);
      });
    if (rmBtn)
      rmBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        removePhoto();
      });

    // Form submit
    var form = $("kmForm");
    if (form) form.addEventListener("submit", handleSubmit);

    // Save draft button
    var sdBtn = $("kmSaveDraft");
    if (sdBtn) sdBtn.addEventListener("click", saveDraft);

    // Copy reg ID button
    var copyBtn = $("kmCopyId");
    if (copyBtn)
      copyBtn.addEventListener("click", function () {
        var id = $("kmRegIdDisplay");
        if (!id) return;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(id.textContent).then(function () {
            showToast("Registration ID copied!", "success");
          });
        }
      });

    // Realtime validation
    setupRealtimeValidation();

    // Initial state
    updateProgress();
    refreshCaptcha();
    loadAdminTable();
    setupSectionObserver();
  });

  /* ──────────────────────────────────────────────────────────────────
     EXPOSE GLOBALS (for inline onclick= attributes + admin buttons)
     ────────────────────────────────────────────────────────────────── */
  window.kmPrint = print;
  window.kmRegisterAnother = registerAnother;
  window.kmRefreshCaptcha = refreshCaptcha;
  window.kmLoadAdmin = loadAdminTable;
  window.kmExportCSV = exportCSV;
  window.kmClearAll = clearAll;
  window.kmDeleteRecord = deleteRecord;
})();
