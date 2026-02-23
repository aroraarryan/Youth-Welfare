(function () {
  "use strict";

  window._regCollectExtra = function () {
    var form = document.getElementById("kmForm");
    if (!form) return {};
    var priorActivities = Array.prototype.slice
      .call(form.querySelectorAll('input[name="priorActivity"]:checked'))
      .map(function (c) {
        return c.value;
      });
    return {
      courseType: (form.elements["courseType"] || {}).value || "",
      batchMonth: (form.elements["batchMonth"] || {}).value || "",
      accommodation: (form.elements["accommodation"] || {}).value || "",
      fitnessLevel: (form.elements["fitnessLevel"] || {}).value || "",
      priorActivities: priorActivities,
      highestAltitude: (form.elements["highestAltitude"] || {}).value || "",
      qualification: (form.elements["qualification"] || {}).value || "",
      swimmingAbility: (form.elements["swimmingAbility"] || {}).value || "",
      bloodGroup: (form.elements["bloodGroup"] || {}).value || "",
    };
  };

  window._regRestoreExtra = function (draft, form) {
    [
      "courseType",
      "batchMonth",
      "accommodation",
      "fitnessLevel",
      "highestAltitude",
      "qualification",
      "swimmingAbility",
      "bloodGroup",
    ].forEach(function (n) {
      if (form.elements[n] && draft[n]) form.elements[n].value = draft[n];
    });
    if (draft.priorActivities) {
      form
        .querySelectorAll('input[name="priorActivity"]')
        .forEach(function (cb) {
          cb.checked = draft.priorActivities.indexOf(cb.value) !== -1;
        });
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.initRegPage({
      storageKey: "at_registrations",
      draftKey: "at_form_draft",
      counterKey: "at_id_counter",
      idPrefix: "AT-UT-2026",
      minAge: 15,
      maxAge: 35,

      extraProgress: function () {
        var extra = window._regCollectExtra ? window._regCollectExtra() : {};
        var n = 0;
        if (extra.courseType) n++;
        if (extra.batchMonth) n++;
        if (extra.fitnessLevel) n++;
        if (extra.qualification) n++;
        if (extra.swimmingAbility) n++;
        return n;
      },
      extraProgressMax: 5,

      validateExtra: function (data) {
        var errors = [];
        var checks = [
          [
            "courseType",
            "regCourseType-err",
            "Please select a course or program type.",
          ],
          [
            "batchMonth",
            "regBatchMonth-err",
            "Please select your preferred batch month.",
          ],
          [
            "accommodation",
            "regAccommodation-err",
            "Please indicate accommodation requirement.",
          ],
          [
            "fitnessLevel",
            "regFitnessLevel-err",
            "Please select your fitness level.",
          ],
          [
            "qualification",
            "regQualification-err",
            "Please select your highest qualification.",
          ],
          [
            "swimmingAbility",
            "regSwimmingAbility-err",
            "Please indicate your swimming ability.",
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
          courseType: data.courseType || "",
          batchMonth: data.batchMonth || "",
          accommodation: data.accommodation || "",
          fitnessLevel: data.fitnessLevel || "",
          priorActivities: data.priorActivities || [],
          highestAltitude: data.highestAltitude || "",
          qualification: data.qualification || "",
          swimmingAbility: data.swimmingAbility || "",
          bloodGroup: data.bloodGroup || "",
        });
      },

      buildSuccessRows: function (r) {
        var pa =
          (r.priorActivities || [])
            .map(function (a) {
              return a.replace(/_/g, " ");
            })
            .join(", ") || "None";
        return [
          ["Registration ID", r.registrationId],
          ["Full Name", r.fullName],
          ["Date of Birth", r.dob],
          ["Age", r.age + " years"],
          ["Gender", (r.gender || "").replace("_", " ")],
          ["Mobile", "+91 " + r.mobile],
          ["Email", r.email || "Not provided"],
          ["Home District", r.district],
          ["Course / Program", (r.courseType || "").replace(/_/g, " ")],
          ["Preferred Batch", (r.batchMonth || "").replace(/_/g, " ")],
          ["Fitness Level", (r.fitnessLevel || "").replace(/_/g, " ")],
          ["Prior Activities", pa],
          ["Swimming Ability", (r.swimmingAbility || "").replace(/_/g, " ")],
          ["Blood Group", r.bloodGroup || "Not provided"],
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
          key: "courseType",
          label: "Course",
          render: function (r) {
            return (r.courseType || "").replace(/_/g, " ");
          },
        },
        {
          key: "batchMonth",
          label: "Batch",
          render: function (r) {
            return (r.batchMonth || "").replace(/_/g, " ");
          },
        },
        {
          key: "fitnessLevel",
          label: "Fitness",
          render: function (r) {
            return (r.fitnessLevel || "").replace(/_/g, " ");
          },
        },
        { key: "bloodGroup", label: "Blood Grp" },
      ],
    });
  });
})();
