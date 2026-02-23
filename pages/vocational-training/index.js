(function () {
  "use strict";

  window._regCollectExtra = function () {
    var form = document.getElementById("kmForm");
    if (!form) return {};
    var gEl = form.querySelector('input[name="trainingMode"]:checked');
    var eEl = form.querySelector('input[name="employmentGoal"]:checked');
    var cEl = form.querySelector('input[name="category"]:checked');
    return {
      sector: (form.elements["sector"] || {}).value || "",
      courseDuration: (form.elements["courseDuration"] || {}).value || "",
      trainingMode: gEl ? gEl.value : "",
      employmentGoal: eEl ? eEl.value : "",
      qualification: (form.elements["qualification"] || {}).value || "",
      employmentStatus: (form.elements["employmentStatus"] || {}).value || "",
      category: cEl ? cEl.value : "",
      aadhaar: (form.elements["aadhaar"] || {}).value || "",
    };
  };

  window._regRestoreExtra = function (draft, form) {
    [
      "sector",
      "courseDuration",
      "qualification",
      "employmentStatus",
      "aadhaar",
    ].forEach(function (n) {
      if (form.elements[n] && draft[n]) form.elements[n].value = draft[n];
    });
    if (draft.trainingMode) {
      form.querySelectorAll('input[name="trainingMode"]').forEach(function (r) {
        r.checked = r.value === draft.trainingMode;
      });
    }
    if (draft.employmentGoal) {
      form
        .querySelectorAll('input[name="employmentGoal"]')
        .forEach(function (r) {
          r.checked = r.value === draft.employmentGoal;
        });
    }
    if (draft.category) {
      form.querySelectorAll('input[name="category"]').forEach(function (r) {
        r.checked = r.value === draft.category;
      });
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.initRegPage({
      storageKey: "vt_registrations",
      draftKey: "vt_form_draft",
      counterKey: "vt_id_counter",
      idPrefix: "VT-UT-2025",
      minAge: 14,
      maxAge: 35,

      extraProgress: function () {
        var extra = window._regCollectExtra ? window._regCollectExtra() : {};
        var n = 0;
        if (extra.sector) n++;
        if (extra.courseDuration) n++;
        if (extra.qualification) n++;
        if (extra.employmentStatus) n++;
        return n;
      },
      extraProgressMax: 4,

      validateExtra: function (data) {
        var errors = [];
        var checks = [
          ["sector", "regSector-err", "Please select a trade / sector."],
          [
            "courseDuration",
            "regCourseDuration-err",
            "Please select a training duration.",
          ],
          [
            "qualification",
            "regQualification-err",
            "Please select your highest qualification.",
          ],
          [
            "employmentStatus",
            "regEmploymentStatus-err",
            "Please select your current status.",
          ],
        ];
        checks.forEach(function (c) {
          if (!data[c[0]]) {
            var el = document.getElementById(c[1]);
            if (el) el.textContent = c[2];
            errors.push({ key: c[0], message: c[2] });
          }
        });
        return errors;
      },

      buildRecord: function (data, base) {
        return Object.assign(base, {
          sector: data.sector || "",
          courseDuration: data.courseDuration || "",
          trainingMode: data.trainingMode || "",
          employmentGoal: data.employmentGoal || "",
          qualification: data.qualification || "",
          employmentStatus: data.employmentStatus || "",
          category: data.category || "",
          aadhaar: data.aadhaar || "",
        });
      },

      buildSuccessRows: function (r) {
        return [
          ["Enrollment ID", r.registrationId],
          ["Full Name", r.fullName],
          ["Date of Birth", r.dob],
          ["Age", r.age + " years"],
          ["Gender", (r.gender || "").replace("_", " ")],
          ["Mobile", "+91 " + r.mobile],
          ["Email", r.email || "Not provided"],
          ["District", r.district],
          ["Sector / Trade", (r.sector || "").replace(/_/g, " ")],
          ["Training Duration", (r.courseDuration || "").replace(/_/g, " ")],
          ["Qualification", (r.qualification || "").replace(/_/g, " ")],
          ["Current Status", (r.employmentStatus || "").replace(/_/g, " ")],
          [
            "Emergency Contact",
            r.emergencyName + " (+91 " + r.emergencyPhone + ")",
          ],
          ["Registered At", new Date(r.registeredAt).toLocaleString()],
        ];
      },

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
          key: "sector",
          label: "Sector",
          render: function (r) {
            return (r.sector || "").replace(/_/g, " ");
          },
        },
        {
          key: "courseDuration",
          label: "Duration",
          render: function (r) {
            return (r.courseDuration || "").replace(/_/g, " ");
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
          key: "employmentStatus",
          label: "Status",
          render: function (r) {
            return (r.employmentStatus || "").replace(/_/g, " ");
          },
        },
      ],
    });
  });
})();
