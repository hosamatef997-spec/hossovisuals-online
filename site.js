// language toggle (remembered per viewer), mobile menu, gallery filters, and a viewer for videos and photos
(function () {
  var root = document.documentElement;
  var lang = document.getElementById("lang");
  if (lang) lang.addEventListener("click", function () {
    var en = root.lang !== "en";
    root.lang = en ? "en" : "ar"; root.dir = en ? "ltr" : "rtl";
    try { localStorage.setItem("lang", root.lang); } catch (e) {}
  });
  var menu = document.getElementById("menu");
  if (menu) menu.addEventListener("click", function () { document.querySelector(".top").classList.toggle("open"); });

  var filters = document.getElementById("filters");
  if (filters) filters.addEventListener("click", function (e) {
    var b = e.target.closest("[data-f]"); if (!b) return;
    filters.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
    var f = b.dataset.f;
    document.querySelectorAll("#gal .tile").forEach(function (t) { t.classList.toggle("hide", f !== "all" && t.dataset.cat !== f); });
  });

  var v = document.createElement("div"); v.className = "viewer"; v.innerHTML = '<button class="x" aria-label="Close">✕</button><div class="box"></div>';
  document.body.appendChild(v);
  var box = v.querySelector(".box");
  function close() { v.classList.remove("on"); box.replaceChildren(); }
  v.addEventListener("click", function (e) { if (e.target === v || e.target.classList.contains("x")) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".tile"); if (!t) return;
    var el;
    if (t.dataset.video) { el = document.createElement("video"); el.src = t.dataset.video; el.controls = true; el.autoplay = true; el.playsInline = true; }
    else if (t.dataset.img) { el = document.createElement("img"); el.src = t.dataset.img; el.alt = ""; }
    else return;
    box.replaceChildren(el);
    v.classList.add("on");
  });
})();
