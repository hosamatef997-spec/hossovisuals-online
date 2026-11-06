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

// Glass motion «حركات الآيفون» (Hossam 2026-11-06), inner pages only: things arrive out of a soft blur on the iOS sheet curve,
// every tappable thing springs under the finger, a copy shows the small «اتنسخ» capsule, and the menu tucks away while
// you read down and comes back when you scroll up. Nothing moves when the reader asks for reduced motion.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ar = function () { return (document.body.getAttribute("dir") || "rtl") === "rtl"; };

  // the copied capsule (shown with or without motion; without motion it simply appears)
  var toast = document.createElement("div");
  toast.id = "g-toast"; toast.setAttribute("role", "status"); toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  var tt = 0;
  document.querySelectorAll("[data-copy], .x-pcopy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast.innerHTML = ar() ? "اتنسخ <b>✓</b>" : "Copied <b>✓</b>";
      toast.classList.add("on"); clearTimeout(tt);
      tt = setTimeout(function () { toast.classList.remove("on"); }, 1500);
    });
  });
  if (reduce) return;
  document.documentElement.classList.add("gm");

  // press: a quick shrink under the finger, a spring back on release
  var pressables = ".btn-gold, .btn-outline, .copy button, .x-pcopy, .x-steps .go, .lk, .lib-grid a, .eps li a, .nav-cta, .nav-burger, .lang-toggle button, .x-steps > li, .note";
  document.querySelectorAll(pressables).forEach(function (el) {
    el.classList.add("g-press");
    var up = function () { el.classList.remove("down"); };
    el.addEventListener("pointerdown", function (e) { if (e.button === 0) el.classList.add("down"); });
    ["pointerup", "pointerleave", "pointercancel", "dragstart"].forEach(function (t) { el.addEventListener(t, up); });
  });
  // a step card springs only when the press starts on the card itself, not on its button or link
  document.querySelectorAll(".x-steps > li").forEach(function (li) {
    li.addEventListener("pointerdown", function (e) { if (e.target.closest("a, button, code")) li.classList.remove("down"); }, true);
  });

  // arrival: what is on screen at load already comes in from the CSS (first paint, no flash); what sits below the fold is
  // hidden now, while nobody can see it, and arrives as it scrolls into view
  var vh = window.innerHeight;
  var items = Array.prototype.slice.call(document.querySelectorAll(
    ".page-head > *, .x-steps > li, .note, .next-up, .eps, .phase, .lib-grid a, .lib-film, .links-card > *, .lk, .x-pcard, .x-how, .x-style, .x-drop > *"))
    .filter(function (el) { return el.getBoundingClientRect().top > vh; });
  items.forEach(function (el) { el.classList.add("g-in"); });
  var batch = 0, bt = 0;
  var show = function (el) {
    el.style.setProperty("--gd", Math.min(batch, 6) * 0.07 + "s"); batch++;
    clearTimeout(bt); bt = setTimeout(function () { batch = 0; }, 120);
    el.classList.add("on");
  };
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0 }); // threshold 0: a card taller than the screen still arrives
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(show);

  // the menu tucks away on the way down and springs back on the way up (never while its sheet is open)
  var nav = document.getElementById("nav"), last = window.scrollY, ticking = false;
  if (nav) window.addEventListener("scroll", function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY, open = nav.querySelector(".nav-links.open");
      if (!open && y > 160 && y > last + 4) nav.classList.add("tuck");
      else if (y < last - 4 || y < 120) nav.classList.remove("tuck");
      last = y; ticking = false;
    });
  }, { passive: true });
})();
