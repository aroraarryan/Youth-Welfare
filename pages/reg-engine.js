(function () {
  "use strict";

  /* ── BACKEND STUBS ─────────────────────────────────── */
  function saveReg(key, record) {
    var list = getReg(key);
    list.push(record);
    localStorage.setItem(key, JSON.stringify(list));
  }
  function getReg(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      return [];
    }
  }
  function deleteReg(key, id) {
    var list = getReg(key).filter(function (r) {
      return r.registrationId !== id;
    });
    localStorage.setItem(key, JSON.stringify(list));
  }

  /* ── UTILS ─────────────────────────────────────────── */
  function $(id) {
    return document.getElementById(id);
  }
  function esc(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function showToast(msg, type) {
    var c = $("regToasts");
    if (!c) return;
    var t = document.createElement("div");
    t.className = "km-toast " + (type || "info");
    t.innerHTML =
      ({ success: "✅", error: "❌", info: "ℹ️" }[type] || "ℹ️") +
      " " +
      esc(msg);
    c.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, 3800);
  }

  /* ── AGE ───────────────────────────────────────────── */
  function computeAge(dob, minAge, maxAge) {
    if (!dob) return { age: null, category: "" };
    var born = new Date(dob);
    if (isNaN(born)) return { age: null, category: "" };
    var today = new Date();
    var age = today.getFullYear() - born.getFullYear();
    var m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
    var cat =
      age >= minAge && age <= 18
        ? "Junior"
        : age > 18 && age <= maxAge
          ? "Senior"
          : age > 18 && age > maxAge
            ? "Overage"
            : "Ineligible";
    if (minAge > 15)
      cat = age >= minAge && age <= maxAge ? "Eligible" : "Ineligible";
    return { age: age, category: cat };
  }

  /* ── PROGRESS ──────────────────────────────────────── */
  function updateProgress(cfg) {
    var data = collectBaseData();
    var tot = 10,
      n = 0;
    if ((data.fullName || "").trim().length >= 3) n++;
    if (data.dob && computeAge(data.dob, cfg.minAge, cfg.maxAge).age !== null)
      n++;
    if (data.gender) n++;
    if ((data.mobile || "").length === 10) n++;
    if (data.district) n++;
    var prev = $("regPhotoPreview");
    if (prev && prev.src && prev.src !== window.location.href && !prev.hidden)
      n++;
    if ((data.emergencyName || "").trim().length >= 3) n++;
    if ((data.emergencyPhone || "").length === 10) n++;
    if (data.emergencyRelation) n++;
    if (
      data.consentAccuracy &&
      data.consentMedical &&
      data.consentRules &&
      data.consentData
    )
      n++;
    // Let page add extra progress via cfg
    if (cfg.extraProgress) n += cfg.extraProgress();

    var pct = Math.min(
      100,
      Math.round((n / (tot + (cfg.extraProgressMax || 0))) * 100),
    );
    var fill = $("kmProgressFill"),
      lbl = $("kmProgressLabel"),
      wrap = $("kmProgress");
    if (fill) fill.style.width = pct + "%";
    if (lbl) lbl.textContent = pct + "% complete";
    if (wrap) wrap.setAttribute("aria-valuenow", pct);
  }

  /* ── DATA COLLECTION (base fields shared by all forms) ─ */
  function collectBaseData() {
    var form = $("kmForm");
    if (!form) return {};
    var gEl = form.querySelector('input[name="gender"]:checked');
    return {
      fullName: (form.elements["fullName"] || {}).value || "",
      dob: (form.elements["dob"] || {}).value || "",
      gender: gEl ? gEl.value : "",
      mobile: (form.elements["mobile"] || {}).value || "",
      email: (form.elements["email"] || {}).value || "",
      district: (form.elements["district"] || {}).value || "",
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

  /* ── BASE VALIDATORS ───────────────────────────────── */
  function makeBaseValidators(minAge, maxAge) {
    return {
      fullName: function (v) {
        v = (v || "").trim();
        if (!v) return "Full name is required.";
        if (v.length < 3) return "Name must be at least 3 characters.";
        return null;
      },
      dob: function (v) {
        if (!v) return "Date of birth is required.";
        var info = computeAge(v, minAge, maxAge);
        if (info.age === null) return "Invalid date.";
        if (info.age < minAge) return "Minimum age is " + minAge + " years.";
        if (info.age > maxAge) return "Maximum age is " + maxAge + " years.";
        return null;
      },
      gender: function (v) {
        return v ? null : "Please select a gender option.";
      },
      mobile: function (v) {
        v = (v || "").trim();
        if (!v) return "Mobile number is required.";
        if (!/^[6-9][0-9]{9}$/.test(v))
          return "Enter a valid 10-digit mobile number.";
        return null;
      },
      email: function (v) {
        v = (v || "").trim();
        if (!v) return null;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
          return "Enter a valid email address.";
        return null;
      },
      district: function (v) {
        return v ? null : "Please select your district.";
      },
      photo: function () {
        var p = $("regPhotoPreview");
        if (!p || !p.src || p.src === window.location.href)
          return "Please upload a photo.";
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
        if (!v) return "Emergency contact phone is required.";
        if (!/^[6-9][0-9]{9}$/.test(v))
          return "Enter a valid 10-digit phone number.";
        return null;
      },
      emergencyRelation: function (v) {
        return v ? null : "Please select the relation.";
      },
      consentAccuracy: function (v) {
        return v ? null : "Please confirm accuracy of information.";
      },
      consentMedical: function (v) {
        return v ? null : "Please confirm medical fitness.";
      },
      consentRules: function (v) {
        return v ? null : "Please agree to program rules.";
      },
      consentData: function (v) {
        return v ? null : "Please consent to data processing.";
      },
    };
  }

  var BASE_ERR_MAP = {
    fullName: "regFullName-err",
    dob: "regDob-err",
    gender: "regGender-err",
    mobile: "regMobile-err",
    email: "regEmail-err",
    district: "regDistrict-err",
    photo: "regPhoto-err",
    emergencyName: "regEmergName-err",
    emergencyPhone: "regEmergPhone-err",
    emergencyRelation: "regEmergRelation-err",
    consentAccuracy: "regConsentAccuracy-err",
    consentMedical: "regConsentMedical-err",
    consentRules: "regConsentRules-err",
    consentData: "regConsentData-err",
  };

  function runValidation(validators, data, extraErrors) {
    var errors = [];
    var checks = [
      ["fullName", data.fullName],
      ["dob", data.dob],
      ["gender", data.gender],
      ["mobile", data.mobile],
      ["email", data.email],
      ["district", data.district],
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
      var key = pair[0],
        val = pair[1];
      var fn = validators[key];
      var err = fn ? fn(val) : null;
      var errEl = BASE_ERR_MAP[key] ? $(BASE_ERR_MAP[key]) : null;
      if (errEl) errEl.textContent = err || "";
      var inputEl = $("reg" + key.charAt(0).toUpperCase() + key.slice(1));
      if (inputEl) {
        inputEl.classList.toggle("error", !!err);
        inputEl.classList.toggle(
          "valid",
          !err && !!(inputEl.value || "").trim(),
        );
      }
      if (err) errors.push({ key: key, message: err });
    });
    (extraErrors || []).forEach(function (e) {
      var errEl = $(e.errId);
      if (errEl) errEl.textContent = e.message;
      errors.push({ key: e.key, message: e.message });
    });
    return errors;
  }

  /* ── PHOTO ──────────────────────────────────────────── */
  function handleFile(file) {
    if (!file) return;
    var errEl = $("regPhoto-err");
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      if (errEl) errEl.textContent = "Only JPEG and PNG accepted.";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      if (errEl) errEl.textContent = "Photo must be under 2MB.";
      return;
    }
    if (errEl) errEl.textContent = "";
    var reader = new FileReader();
    reader.onload = function (e) {
      var src = e.target.result;
      $("regPhotoPreview").src = src;
      $("regPhotoPreview").hidden = false;
      $("regPhotoPreviewWrap").hidden = false;
      $("regPhotoPlaceholder").hidden = true;
      $("regPhotoZone").classList.add("has-photo");
      showToast("Photo uploaded!", "success");
      if (window._regUpdateProgress) window._regUpdateProgress();
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    $("regPhotoPreview").src = "";
    $("regPhotoPreview").hidden = true;
    $("regPhotoPreviewWrap").hidden = true;
    $("regPhotoPlaceholder").hidden = false;
    $("regPhotoZone").classList.remove("has-photo");
    $("regPhotoInput").value = "";
    if (window._regUpdateProgress) window._regUpdateProgress();
  }

  /* ── DRAFT ──────────────────────────────────────────── */
  function restoreDraft(draft) {
    var form = $("kmForm");
    if (!form || !draft) return;
    [
      "fullName",
      "dob",
      "mobile",
      "email",
      "emergencyName",
      "emergencyPhone",
      "medicalConditions",
    ].forEach(function (n) {
      if (form.elements[n] && draft[n] !== undefined)
        form.elements[n].value = draft[n] || "";
    });
    ["district", "emergencyRelation"].forEach(function (n) {
      if (form.elements[n] && draft[n]) form.elements[n].value = draft[n];
    });
    if (draft.gender) {
      form.querySelectorAll('input[name="gender"]').forEach(function (r) {
        r.checked = r.value === draft.gender;
      });
    }
    [
      "consentAccuracy",
      "consentMedical",
      "consentRules",
      "consentData",
    ].forEach(function (n) {
      if (form.elements[n] && draft[n]) form.elements[n].checked = true;
    });
    if (window._regRestoreExtra) window._regRestoreExtra(draft, form);
  }

  /* ── CAPTCHA ────────────────────────────────────────── */
  var CHARS = "ABCDEFGHJKLMNPRSTUVWXYZ23456789";
  function refreshCaptcha() {
    var code = "";
    for (var i = 0; i < 6; i++)
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    var el = $("regCaptchaText");
    if (el) el.textContent = code;
    var inp = $("regCaptchaInput");
    if (inp) inp.value = "";
  }

  /* ── ADMIN TABLE ────────────────────────────────────── */
  function loadAdmin(cfg) {
    var tbody = $("regAdminBody");
    var records = getReg(cfg.storageKey);
    var today = new Date().toDateString();
    var todayCt = 0;
    $("regTotalCount").textContent = records.length;
    if (!records.length) {
      tbody.innerHTML =
        '<tr><td colspan="' +
        (cfg.adminColumns.length + 2) +
        '" class="km-table-empty">No registrations yet.</td></tr>';
      $("regTodayCount").textContent = 0;
      return;
    }
    tbody.innerHTML = records
      .map(function (r) {
        var d = new Date(r.registeredAt);
        if (d.toDateString() === today) todayCt++;
        var cells = cfg.adminColumns.map(function (col) {
          var val = col.render ? col.render(r) : esc(r[col.key] || "");
          return "<td>" + val + "</td>";
        });
        return (
          "<tr>" +
          '<td><span class="km-table-id">' +
          esc(r.registrationId) +
          "</span></td>" +
          cells.join("") +
          '<td style="font-size:11px;color:#94a3b8">' +
          d.toLocaleString() +
          "</td>" +
          '<td><button class="km-btn-del" onclick="regDeleteRecord(\'' +
          esc(r.registrationId) +
          '\')" aria-label="Delete">🗑 Del</button></td>' +
          "</tr>"
        );
      })
      .join("");
    $("regTodayCount").textContent = todayCt;
  }

  /* ── CSV EXPORT ─────────────────────────────────────── */
  function exportCSV(cfg) {
    var recs = getReg(cfg.storageKey);
    if (!recs.length) {
      showToast("No records to export.", "info");
      return;
    }
    function q(v) {
      return '"' + String(v || "").replace(/"/g, '""') + '"';
    }
    var headers = ["Registration ID"]
      .concat(
        cfg.adminColumns.map(function (c) {
          return c.label;
        }),
      )
      .concat(["Registered At"]);
    var rows = [headers.join(",")].concat(
      recs.map(function (r) {
        var vals = cfg.adminColumns.map(function (col) {
          return q(col.csvVal ? col.csvVal(r) : r[col.key] || "");
        });
        return [q(r.registrationId)]
          .concat(vals)
          .concat([q(r.registeredAt)])
          .join(",");
      }),
    );
    var blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = cfg.idPrefix + "_" + Date.now() + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Exported " + recs.length + " record(s).", "success");
  }

  /* ── SECTION OBSERVER ───────────────────────────────── */
  function setupSectionObserver() {
    if (!("IntersectionObserver" in window)) return;
    var links = document.querySelectorAll(".km-sec-link");
    var secs = document.querySelectorAll(".km-fieldset[id]");
    if (!links.length || !secs.length) return;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.classList.remove("active");
            });
            var t = document.querySelector(
              '.km-sec-link[href="#' + entry.target.id + '"]',
            );
            if (t) t.classList.add("active");
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    secs.forEach(function (s) {
      obs.observe(s);
    });
  }

  /* ── SUCCESS SCREEN ─────────────────────────────────── */
  function showSuccess(record, cfg) {
    $("kmForm").hidden = true;
    var sec = $("regSuccess");
    sec.hidden = false;
    sec.scrollIntoView({ behavior: "smooth", block: "start" });
    $("regIdDisplay").textContent = record.registrationId;
    var rows = cfg.buildSuccessRows(record);
    $("regSuccessDetails").innerHTML = rows
      .map(function (r) {
        return (
          '<div class="km-detail-row"><span class="km-detail-label">' +
          esc(r[0]) +
          ':</span><span class="km-detail-val">' +
          esc(r[1]) +
          "</span></div>"
        );
      })
      .join("");
    buildPrint(record, cfg);
    var ann = $("kmLiveAnnouncer");
    if (ann)
      ann.textContent = "Registration successful! ID: " + record.registrationId;
    showToast("Registered! ID: " + record.registrationId, "success");
  }

  function buildPrint(record, cfg) {
    var rows = cfg.buildSuccessRows(record);
    var photoHtml = record.photoData
      ? '<div style="text-align:center;margin-bottom:16px"><img src="' +
        record.photoData +
        '" style="width:90px;height:110px;object-fit:cover;border:2px solid #1e3a8a;border-radius:6px" alt="Photo"/></div>'
      : "";
    $("regPrintContent").innerHTML =
      photoHtml +
      rows
        .map(function (r) {
          return (
            '<div class="km-print-row"><span class="km-print-label">' +
            esc(r[0]) +
            ":</span><span>" +
            esc(r[1]) +
            "</span></div>"
          );
        })
        .join("");
  }

  /* ── REALTIME VALIDATION ────────────────────────────── */
  function setupRealtime(cfg) {
    var form = $("kmForm");
    if (!form) return;
    var validators = makeBaseValidators(cfg.minAge, cfg.maxAge);

    form.addEventListener("input", function () {
      if (window._regUpdateProgress) window._regUpdateProgress();
      clearTimeout(window._regDraftTimer);
      window._regDraftTimer = setTimeout(function () {
        var d = collectBaseData();
        if (window._regCollectExtra)
          d = Object.assign(d, window._regCollectExtra());
        localStorage.setItem(cfg.draftKey, JSON.stringify(d));
      }, 2000);
    });

    var blurFields = [
      ["regFullName", "fullName", "regFullName-err"],
      ["regMobile", "mobile", "regMobile-err"],
      ["regEmail", "email", "regEmail-err"],
      ["regEmergName", "emergencyName", "regEmergName-err"],
      ["regEmergPhone", "emergencyPhone", "regEmergPhone-err"],
    ];
    blurFields.forEach(function (trio) {
      var el = $(trio[0]);
      if (!el) return;
      el.addEventListener("blur", function () {
        var err = validators[trio[1]] ? validators[trio[1]](el.value) : null;
        var errEl = $(trio[2]);
        if (errEl) errEl.textContent = err || "";
        el.classList.toggle("error", !!err);
        el.classList.toggle("valid", !err && !!el.value.trim());
      });
    });

    var dobEl = $("regDob");
    if (dobEl) {
      dobEl.addEventListener("change", function () {
        var info = computeAge(dobEl.value, cfg.minAge, cfg.maxAge);
        $("regCalcAge").textContent =
          info.age !== null ? info.age + " yrs" : "—";
        var catEl = $("regCalcCat");
        catEl.textContent = info.category || "";
        catEl.className = "km-age-badge";
        if (info.category === "Junior") catEl.classList.add("junior");
        else if (info.category === "Senior" || info.category === "Eligible")
          catEl.classList.add("senior");
        else if (info.category === "Ineligible" || info.category === "Overage")
          catEl.classList.add("ineligible");
        var err = validators.dob(dobEl.value);
        var errEl = $("regDob-err");
        if (errEl) errEl.textContent = err || "";
        dobEl.classList.toggle("error", !!err);
        dobEl.classList.toggle("valid", !err && !!dobEl.value);
        if (window._regUpdateProgress) window._regUpdateProgress();
      });
    }

    ["regDistrict", "regEmergRelation"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      var key = el.name;
      var errId =
        id === "regDistrict" ? "regDistrict-err" : "regEmergRelation-err";
      el.addEventListener("change", function () {
        var err = validators[key] ? validators[key](el.value) : null;
        var errEl = $(errId);
        if (errEl) errEl.textContent = err || "";
        el.classList.toggle("error", !!err);
        if (window._regUpdateProgress) window._regUpdateProgress();
      });
    });

    form.querySelectorAll('input[name="gender"]').forEach(function (r) {
      r.addEventListener("change", function () {
        var errEl = $("regGender-err");
        if (errEl) errEl.textContent = "";
        if (window._regUpdateProgress) window._regUpdateProgress();
      });
    });

    [
      "consentAccuracy",
      "consentMedical",
      "consentRules",
      "consentData",
    ].forEach(function (n) {
      var el = form.elements[n];
      if (!el) return;
      var errId =
        "regConsent" + n.charAt(7).toUpperCase() + n.slice(8) + "-err";
      el.addEventListener("change", function () {
        var errEl = $(errId);
        if (errEl) errEl.textContent = "";
        if (window._regUpdateProgress) window._regUpdateProgress();
      });
    });
  }

  /* ── MAIN INIT (called by each page's own JS) ────────── */
  window.initRegPage = function (cfg) {
    var lastRecord = null;
    var validators = makeBaseValidators(cfg.minAge, cfg.maxAge);

    window._regUpdateProgress = function () {
      updateProgress(cfg);
    };

    /* Photo setup */
    var zone = $("regPhotoZone");
    var input = $("regPhotoInput");
    var rmBtn = $("regPhotoRemove");
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
        var f = e.dataTransfer && e.dataTransfer.files[0];
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

    /* DOB max */
    var dob = $("regDob");
    if (dob) dob.max = new Date().toISOString().split("T")[0];

    /* Draft */
    var draft = null;
    try {
      draft = JSON.parse(localStorage.getItem(cfg.draftKey));
    } catch (e) {}
    var banner = $("regDraftBanner");
    if (draft && draft.fullName && banner) {
      banner.hidden = false;
      var rb = $("regRestoreBtn");
      if (rb)
        rb.addEventListener("click", function () {
          restoreDraft(draft);
          banner.hidden = true;
          updateProgress(cfg);
          showToast("Draft restored!", "success");
        });
      var db = $("regDiscardBtn");
      if (db)
        db.addEventListener("click", function () {
          localStorage.removeItem(cfg.draftKey);
          banner.hidden = true;
          showToast("Draft discarded.", "info");
        });
    }

    /* Save draft button */
    var sdBtn = $("regSaveDraft");
    if (sdBtn)
      sdBtn.addEventListener("click", function () {
        var d = collectBaseData();
        if (window._regCollectExtra)
          d = Object.assign(d, window._regCollectExtra());
        localStorage.setItem(cfg.draftKey, JSON.stringify(d));
        showToast("Draft saved!", "success");
      });

    /* Form submit */
    var form = $("kmForm");
    if (form)
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = $("regSubmitBtn");
        btn.classList.add("loading");
        btn.disabled = true;
        setTimeout(function () {
          var data = collectBaseData();
          if (window._regCollectExtra)
            data = Object.assign(data, window._regCollectExtra());
          var extraErrors = cfg.validateExtra ? cfg.validateExtra(data) : [];
          var errors = runValidation(validators, data, extraErrors);
          if (errors.length) {
            btn.classList.remove("loading");
            btn.disabled = false;
            var summary = $("regErrorSummary"),
              list = $("regErrorList");
            summary.hidden = false;
            list.innerHTML = errors
              .map(function (er) {
                return "<li>" + esc(er.message) + "</li>";
              })
              .join("");
            var ann = $("kmLiveAnnouncer");
            if (ann)
              ann.textContent =
                "Form has " + errors.length + " error(s). Please review.";
            summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
            return;
          }
          $("regErrorSummary").hidden = true;
          var n = parseInt(localStorage.getItem(cfg.counterKey) || "0", 10) + 1;
          localStorage.setItem(cfg.counterKey, String(n));
          var ageInfo = computeAge(data.dob, cfg.minAge, cfg.maxAge);
          var base = {
            registrationId: cfg.idPrefix + "-" + String(n).padStart(6, "0"),
            fullName: data.fullName.trim(),
            dob: data.dob,
            age: ageInfo.age,
            gender: data.gender,
            mobile: data.mobile.trim(),
            email: data.email.trim(),
            district: data.district,
            emergencyName: data.emergencyName.trim(),
            emergencyPhone: data.emergencyPhone.trim(),
            emergencyRelation: data.emergencyRelation,
            medicalConditions: data.medicalConditions.trim(),
            photoData: ($("regPhotoPreview") || {}).src || "",
            registeredAt: new Date().toISOString(),
            status: "pending",
          };
          var record = cfg.buildRecord(data, base);
          saveReg(cfg.storageKey, record);
          localStorage.removeItem(cfg.draftKey);
          lastRecord = record;
          btn.classList.remove("loading");
          btn.disabled = false;
          showSuccess(record, cfg);
          loadAdmin(cfg);
        }, 600);
      });

    /* Copy ID */
    var copyBtn = $("regCopyId");
    if (copyBtn)
      copyBtn.addEventListener("click", function () {
        var el = $("regIdDisplay");
        if (!el) return;
        navigator.clipboard &&
          navigator.clipboard.writeText(el.textContent).then(function () {
            showToast("Registration ID copied!", "success");
          });
      });

    /* Admin buttons */
    window.regLoadAdmin = function () {
      loadAdmin(cfg);
    };
    window.regExportCSV = function () {
      exportCSV(cfg);
    };
    window.regClearAll = function () {
      var recs = getReg(cfg.storageKey);
      if (!recs.length) {
        showToast("No records to clear.", "info");
        return;
      }
      if (confirm("Permanently delete all " + recs.length + " record(s)?")) {
        localStorage.removeItem(cfg.storageKey);
        localStorage.removeItem(cfg.counterKey);
        loadAdmin(cfg);
        showToast("All records cleared.", "info");
      }
    };
    window.regDeleteRecord = function (id) {
      if (confirm("Delete " + id + "?")) {
        deleteReg(cfg.storageKey, id);
        loadAdmin(cfg);
        showToast(id + " deleted.", "info");
      }
    };
    window.regPrint = function () {
      window.print();
    };
    window.regRegisterAnother = function () {
      var f = $("kmForm");
      if (f) {
        f.reset();
        f.hidden = false;
      }
      removePhoto();
      $("regCalcAge").textContent = "—";
      $("regCalcCat").textContent = "";
      $("regCalcCat").className = "km-age-badge";
      $("regErrorSummary").hidden = true;
      $("regSuccess").hidden = true;
      updateProgress(cfg);
      $("km-main").scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.regRefreshCaptcha = refreshCaptcha;

    /* Realtime + init */
    setupRealtime(cfg);
    updateProgress(cfg);
    refreshCaptcha();
    loadAdmin(cfg);
    setupSectionObserver();
  };
})();
