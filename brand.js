// HOSSO VISUALS — shared behaviour of the inner pages, same as the home page: language toggle (remembered as
// "hosso-lang", the same key the home page uses), the mobile menu, the WhatsApp buttons, the footer year.
var HOSSO = { whatsapp: document.documentElement.dataset.wa || "", email: document.documentElement.dataset.mail || "" };
function setLang(lang) {
  document.body.setAttribute("lang", lang);
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  document.body.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  document.querySelectorAll(".lang-toggle button").forEach(function (b) {
    b.classList.toggle("active", (lang === "en" && b.textContent === "EN") || (lang === "ar" && b.textContent === "ع"));
  });
  try { localStorage.setItem("hosso-lang", lang); } catch (_) {}
}
(function () {
  var s = null; try { s = localStorage.getItem("hosso-lang"); } catch (_) {}
  setLang(s || document.body.dataset.lang || "ar");
  var b = document.querySelector(".nav-burger"), nl = document.querySelector("#nav .nav-links");
  if (b && nl) {
    b.addEventListener("click", function () { var o = nl.classList.toggle("open"); b.classList.toggle("x", o); b.setAttribute("aria-expanded", o ? "true" : "false"); });
    nl.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { nl.classList.remove("open"); b.classList.remove("x"); }); });
  }
  if (HOSSO.whatsapp) {
    var wa = "https://wa.me/" + HOSSO.whatsapp + "?text=" + encodeURIComponent("Hi Hossam! I saw your site and I would love to talk about a project.");
    document.querySelectorAll(".whatsapp-btn").forEach(function (a) { a.href = wa; a.target = "_blank"; a.rel = "noopener"; });
  }
  document.querySelectorAll(".email-btn").forEach(function (a) { a.href = "mailto:" + HOSSO.email + "?subject=" + encodeURIComponent("Project enquiry — HOSSO Visuals"); });
  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var done = function () { btn.classList.add("ok"); setTimeout(function () { btn.classList.remove("ok"); }, 1600); };
      try { navigator.clipboard.writeText(btn.dataset.copy).then(done, done); } catch (_) { done(); }
    });
  });
})();
