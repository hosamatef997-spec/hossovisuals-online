// The hub (/links/): the newest episode that is out, or whose release time has passed, leads the page; the next scheduled
// one gets a line under it. The list (#hub-eps) is written by tools/make-online.mjs from the series roadmap, so the card
// moves to a new episode by itself at its release time (05:00Z), with no change to the page.
(function () {
  var data = document.getElementById("hub-eps"), card = document.getElementById("hub-ep"), line = document.getElementById("hub-next");
  if (!data || !card) return;
  var eps = JSON.parse(data.textContent), now = Date.now();
  var due = function (e) { return e.out || (e.at && Date.parse(e.at) <= now); };
  var two = function (n) { return (n < 10 ? "0" : "") + n; };
  var cur = eps.filter(due)[0];
  var next = eps.filter(function (e) { return !due(e) && e.at; }).sort(function (a, b) { return a.n - b.n; })[0];
  if (cur) {
    card.href = "/" + cur.slug + "/";
    card.querySelector(".hub-ep-tag b").textContent = "EP " + two(cur.n);
    card.querySelector(".hub-ep-title").innerHTML = cur.title; // escaped by make-online; only <em> for the champagne word
  }
  if (next && line) {
    var tz = "Asia/Dubai", d = new Date(Date.parse(next.at));
    var ymd = function (x) { return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(x); };
    var diff = Math.round((Date.parse(ymd(d)) - Date.parse(ymd(new Date(now)))) / 864e5);
    var h = +new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: tz }).format(d);
    var hh = (h % 12) || 12;
    var dayAr = diff === 0 ? "النهارده" : diff === 1 ? "بكره" : new Intl.DateTimeFormat("ar-EG", { weekday: "long", timeZone: tz }).format(d);
    var dayEn = diff === 0 ? "today" : diff === 1 ? "tomorrow" : new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: tz }).format(d);
    var ar = dayAr + " " + hh + (h < 12 ? " الصبح" : h < 17 ? " الضهر" : " بالليل");
    var en = dayEn + " at " + hh + (h < 12 ? " am" : " pm");
    var tmp = document.createElement("span"); tmp.innerHTML = next.title;
    var title = tmp.textContent;
    var mk = function (lang, label, when) {
      var s = document.createElement("span"); s.setAttribute("data-" + lang, "");
      var b = document.createElement("b"); b.textContent = title;
      s.append(label + " ", b, " · " + when);
      return s;
    };
    line.append(mk("en", "Next episode", en), mk("ar", "الحلقة الجاية", ar));
    line.hidden = false;
  }
})();
