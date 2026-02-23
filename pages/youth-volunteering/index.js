(function () {
  "use strict";

  var MAX_SERVICE_AREAS = 3;

  /* ── COLLECT EXTRA FIELDS (page-specific) ────────────── */
  window._regCollectExtra = function () {
    var form = document.getElementById("kmForm");
    if (!form) return {};
    var serviceAreas = Array.prototype.slice
      .call(form.querySelectorAll('input[name="serviceArea"]:checked'))
      .map(function (c) {
        return c.value;
      });
    var languages = Array.prototype.slice
      .call(form.querySelectorAll('input[name="language"]:checked'))
      .map(function (c) {
        return c.value;
      });
    return {
      serviceAreas: serviceAreas,
      availability: (form.elements["availability"] || {}).value || "",
      motivation: (form.elements["motivation"] || {}).value || "",
      qualification: (form.elements["qualification"] || {}).value || "",
      yearPassed: (form.elements["yearPassed"] || {}).value || "",
      priorExperience: (form.elements["priorExperience"] || {}).value || "",
      languages: languages,
    };
  };

  /* ── RESTORE EXTRA FIELDS FROM DRAFT ────────────────── */
  window._regRestoreExtra = function (draft, form) {
    if (draft.serviceAreas) {
      form.querySelectorAll('input[name="serviceArea"]').forEach(function (cb) {
        cb.checked = draft.serviceAreas.indexOf(cb.value) !== -1;
      });
    }
    if (draft.languages) {
      form.querySelectorAll('input[name="language"]').forEach(function (cb) {
        cb.checked = draft.languages.indexOf(cb.value) !== -1;
      });
    }
    ["availability", "qualification", "yearPassed"].forEach(function (n) {
      if (form.elements[n] && draft[n]) form.elements[n].value = draft[n];
    });
    ["motivation", "priorExperience"].forEach(function (n) {
      if (form.elements[n] && draft[n]) form.elements[n].value = draft[n];
    });
  };

  /* ── SERVICE AREA MAX SELECTION ─────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("kmForm");
    if (form) {
      form.querySelectorAll('input[name="serviceArea"]').forEach(function (cb) {
        cb.addEventListener("change", function () {
          var sel = Array.prototype.slice.call(
            form.querySelectorAll('input[name="serviceArea"]:checked'),
          );
          if (sel.length > MAX_SERVICE_AREAS) {
            cb.checked = false;
            var t = document.getElementById("regToasts");
            if (t) {
              var toast = document.createElement("div");
              toast.className = "km-toast info";
              toast.innerHTML =
                "ℹ️ You can select up to " +
                MAX_SERVICE_AREAS +
                " service areas.";
              t.appendChild(toast);
              setTimeout(function () {
                toast.remove();
              }, 3800);
            }
          }
          if (window._regUpdateProgress) window._regUpdateProgress();
        });
      });
    }
  });

  /* ── INIT ENGINE ─────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    window.initRegPage({
      storageKey: "yv_registrations",
      draftKey: "yv_form_draft",
      counterKey: "yv_id_counter",
      idPrefix: "YV-UT-2025",
      minAge: 18,
      maxAge: 29,
      successMsg: "Your Youth Volunteering application has been received.",

      /* Extra progress: availability + serviceAreas + qualification */
      extraProgress: function () {
        var extra = window._regCollectExtra ? window._regCollectExtra() : {};
        var n = 0;
        if (extra.availability) n++;
        if (extra.serviceAreas && extra.serviceAreas.length) n++;
        if (extra.qualification) n++;
        return n;
      },
      extraProgressMax: 3,

      /* Extra validation */
      validateExtra: function (data) {
        var errors = [];
        if (!data.serviceAreas || !data.serviceAreas.length) {
          var errEl = document.getElementById("regServiceArea-err");
          if (errEl)
            errEl.textContent = "Please select at least one service area.";
          errors.push({
            key: "serviceArea",
            message: "Please select at least one service area.",
          });
        }
        if (!data.availability) {
          var aErr = document.getElementById("regAvailability-err");
          if (aErr) aErr.textContent = "Please select your availability.";
          errors.push({
            key: "availability",
            message: "Please select your availability.",
          });
        }
        if (!data.qualification) {
          var qErr = document.getElementById("regQualification-err");
          if (qErr)
            qErr.textContent = "Please select your highest qualification.";
          errors.push({
            key: "qualification",
            message: "Please select your highest qualification.",
          });
        }
        return errors;
      },

      /* Merge extra into final record */
      buildRecord: function (data, base) {
        return Object.assign(base, {
          serviceAreas: data.serviceAreas || [],
          availability: data.availability || "",
          motivation: data.motivation || "",
          qualification: data.qualification || "",
          yearPassed: data.yearPassed || "",
          priorExperience: data.priorExperience || "",
          languages: data.languages || [],
        });
      },

      /* Success screen detail rows */
      buildSuccessRows: function (r) {
        var sa = (r.serviceAreas || [])
          .map(function (s) {
            return s.replace(/_/g, " ");
          })
          .join(", ");
        return [
          ["Application ID", r.registrationId],
          ["Full Name", r.fullName],
          ["Date of Birth", r.dob],
          ["Age", r.age + " years"],
          ["Gender", (r.gender || "").replace("_", " ")],
          ["Mobile", "+91 " + r.mobile],
          ["Email", r.email || "Not provided"],
          ["District", r.district],
          ["Service Area(s)", sa],
          ["Availability", (r.availability || "").replace(/_/g, " ")],
          ["Qualification", (r.qualification || "").replace(/_/g, " ")],
          [
            "Emergency Contact",
            r.emergencyName + " (+91 " + r.emergencyPhone + ")",
          ],
          ["Registered At", new Date(r.registeredAt).toLocaleString()],
        ];
      },

      /* Admin table columns */
      adminColumns: [
        { key: "fullName", label: "Name" },
        {
          key: "age",
          label: "Age",
          render: function (r) {
            return r.age + " yr";
          },
        },
        { key: "district", label: "District" },
        {
          key: "serviceAreas",
          label: "Service Areas",
          render: function (r) {
            return (
              '<span style="font-size:11px;white-space:normal">' +
              (r.serviceAreas || [])
                .map(function (s) {
                  return s.replace(/_/g, " ");
                })
                .join(", ") +
              "</span>"
            );
          },
          csvVal: function (r) {
            return (r.serviceAreas || []).join("|");
          },
        },
        {
          key: "qualification",
          label: "Qualification",
          render: function (r) {
            return (r.qualification || "").replace(/_/g, " ");
          },
        },
        {
          key: "availability",
          label: "Availability",
          render: function (r) {
            return (r.availability || "").replace(/_/g, " ");
          },
        },
      ],
    });
  });
})();
