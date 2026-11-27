// HOSSO 3D props (2026-11-27, Hossam «3D look, home+services»): the brand's own cover props — the champagne disc with the
// navy rim and gold inlay, the terracotta 12-point spark, the navy key with the gold enter arrow — as live Three.js objects
// that float, follow the pointer and turn with the scroll. They replace the flat PNG props only once WebGL is running.
// Usage: <div class="h3d" data-h3d="services"></div> inside a positioned parent, then <script type="module" src="/hosso3d.js">.
// Rules: loads after the page is painted (idle), never on reduced-motion / Save-Data / no WebGL, renders only while on screen,
// pixel ratio capped (1.5 phone / 2 desktop). On success the parent gets .h3d-on (CSS hides the PNG props).
// three is resolved through the page's import map (the add-ons import "three" by name)
const ADDONS = "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/";

const C = { navy: 0x0f1b33, navyHi: 0x2a3b63, champ: 0xd8b878, champHi: 0xecd3a0, gold: 0xe2b84a, terra: 0x9c4b2f };

// where each prop sits, in container units (x: 0 left → 1 right, y: 0 top → 1 bottom), size = fraction of container height
const LAYOUTS = {
  services: {
    wide: [
      { k: "disc", x: 0.16, y: 0.24, s: 0.4, rx: 0.35, ry: 0.75, rz: -0.25 },
      { k: "spark", x: 0.31, y: 0.56, s: 0.24, rx: 0.45, ry: -0.5, rz: 0.2 },
      { k: "key", x: 0.18, y: 0.74, s: 0.17, rx: 0.55, ry: 0.55, rz: 0.3 },
    ],
    narrow: [
      { k: "disc", x: 0.02, y: 0.1, s: 0.2, rx: 0.5, ry: 0.5, rz: -0.2 },
      { k: "spark", x: 0.9, y: 0.06, s: 0.12, rx: 0.3, ry: -0.4, rz: 0.2 },
    ],
  },
  home: {
    wide: [
      { k: "disc", x: 0.15, y: 0.37, s: 0.28, rx: 0.35, ry: 0.7, rz: -0.25 },
      { k: "spark", x: 0.3, y: 0.62, s: 0.17, rx: 0.45, ry: -0.5, rz: 0.2 },
      { k: "key", x: 0.12, y: 0.78, s: 0.13, rx: 0.55, ry: 0.55, rz: 0.3 },
    ],
    narrow: [], // phone: the hero words sit on a solid panel under a short film strip, so no props there (and no three.js download)
  },
};
// every other inner page (steps, Claude, library, links…): same places as the services hero, props picked by the page's
// data-props variant (lenses = disc, keys = keys, coins = coin) so each page keeps the look its PNGs had
const VARIANT = { lenses: ["disc", "key"], keys: ["keySlash", "key"], coins: ["coin", "disc"] };
function pageLayout(v) {
  const [main, third] = VARIANT[v] || VARIANT.lenses;
  const pick = (list) => list.map((p) => ({ ...p, k: p.k === "disc" ? main : p.k === "key" ? third : p.k, s: p.k === "disc" && main === "keySlash" ? p.s * 0.78 : p.s }));
  return { wide: pick(LAYOUTS.services.wide), narrow: pick(LAYOUTS.services.narrow) };
}
const presetFor = (h) => (h.dataset.h3d === "page" ? pageLayout(h.dataset.variant) : LAYOUTS[h.dataset.h3d] || LAYOUTS.services);

function canRun() {
  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (navigator.connection && navigator.connection.saveData) return false;
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

async function boot() {
  // pages built with the flat props get a host next to them automatically (no per-page markup needed)
  document.querySelectorAll(".cl-objs").forEach((o) => {
    if (!o.parentElement || o.parentElement.querySelector("[data-h3d]")) return;
    const h = document.createElement("div"); h.className = "h3d"; h.dataset.h3d = "page"; h.dataset.variant = o.dataset.props || "lenses";
    o.after(h);
  });
  const hosts = [...document.querySelectorAll("[data-h3d]")].filter((h) => h.clientWidth >= 760 || presetFor(h).narrow.length);
  if (!hosts.length || !canRun()) return;
  const [THREE, { RoundedBoxGeometry }, { RoomEnvironment }] = await Promise.all([
    import("three"),
    import(ADDONS + "geometries/RoundedBoxGeometry.js"),
    import(ADDONS + "environments/RoomEnvironment.js"),
  ]);
  hosts.forEach((h) => { try { mount(THREE, RoundedBoxGeometry, RoomEnvironment, h); } catch (e) { console.warn("hosso3d", e); } });
}

function makeProps(THREE, RoundedBoxGeometry) {
  const SEG = innerWidth < 760 ? 48 : 96;
  const M = {
    champ: new THREE.MeshStandardMaterial({ color: C.champ, metalness: 0.3, roughness: 0.3 }),
    navyGloss: new THREE.MeshStandardMaterial({ color: C.navy, metalness: 0.2, roughness: 0.16, envMapIntensity: 0.6 }),
    navyTop: new THREE.MeshStandardMaterial({ color: C.navyHi, metalness: 0.2, roughness: 0.22 }),
    gold: new THREE.MeshStandardMaterial({ color: C.gold, metalness: 1, roughness: 0.22 }),
    terra: new THREE.MeshStandardMaterial({ color: C.terra, metalness: 0.05, roughness: 0.4 }),
  };
  return {
    // the lens disc: champagne pearl face, glossy navy rim, gold ring inlay (unit diameter ≈ 1)
    disc() {
      const g = new THREE.Group();
      const face = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.12, SEG), M.champ);
      face.rotation.x = Math.PI / 2; g.add(face);
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.075, 20, SEG), M.navyGloss));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.011, 8, SEG), M.gold); ring.position.z = 0.062; g.add(ring);
      const ringB = ring.clone(); ringB.position.z = -0.062; g.add(ringB);
      return g;
    },
    // the 12-point spark: 6 rounded bars crossing at the centre = 12 bevelled rays, like the rendered prop (unit diameter ≈ 1)
    spark() {
      const g = new THREE.Group(), bar = new RoundedBoxGeometry(1, 0.15, 0.15, 3, 0.05);
      for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(bar, M.terra); m.rotation.z = (i * Math.PI) / 6; m.position.z = (i % 2) * 0.004; g.add(m); }
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.15, 32), M.terra); hub.rotation.x = Math.PI / 2; g.add(hub);
      return g;
    },
    // the coin: the disc with an embossed «$» on both faces (drawn once to a canvas texture)
    coin() {
      const g = this.disc();
      const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
      x.font = "900 170px 'Bricolage Grotesque', Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillStyle = "rgba(15,27,51,.35)"; x.fillText("$", 134, 138); x.fillStyle = "#c9ced8"; x.fillText("$", 128, 130);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.MeshStandardMaterial({ map: tex, transparent: true, metalness: 0.6, roughness: 0.25 });
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), m); f.position.z = 0.0625; g.add(f);
      const b = f.clone(); b.position.z = -0.0625; b.rotation.y = Math.PI; g.add(b);
      return g;
    },
    // the navy key with the gold slash bar
    keySlash() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new RoundedBoxGeometry(1, 1, 0.5, 6, 0.16), M.navyGloss));
      const top = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.78, 0.06, 4, 0.1), M.navyTop); top.position.z = 0.25; g.add(top);
      const bar = new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.46, 0.06, 2, 0.015), M.gold); bar.rotation.z = -0.55; bar.position.z = 0.3; g.add(bar);
      return g;
    },
    // the navy key with a lighter top and the gold enter arrow (unit width ≈ 1)
    key() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new RoundedBoxGeometry(1, 1, 0.5, 6, 0.16), M.navyGloss));
      const top = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.78, 0.06, 4, 0.1), M.navyTop); top.position.z = 0.25; g.add(top);
      const a = new THREE.Shape();
      a.moveTo(0.16, 0.22); a.lineTo(0.22, 0.22); a.lineTo(0.22, -0.1); a.lineTo(-0.08, -0.1); a.lineTo(-0.08, -0.19);
      a.lineTo(-0.24, -0.05); a.lineTo(-0.08, 0.09); a.lineTo(-0.08, 0); a.lineTo(0.16, 0); a.closePath();
      const ar = new THREE.Mesh(new THREE.ExtrudeGeometry(a, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2 }), M.gold);
      ar.position.z = 0.28; g.add(ar);
      return g;
    },
  };
}

function mount(THREE, RoundedBoxGeometry, RoomEnvironment, host) {
  const preset = presetFor(host);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const cv = renderer.domElement; cv.className = "h3d-canvas"; cv.setAttribute("aria-hidden", "true");
  host.appendChild(cv);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  const key = new THREE.DirectionalLight(0xfff1d6, 1.6); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb4ff, 0.9); rim.position.set(4, -2, -3); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100); camera.position.set(0, 0, 10);
  const make = makeProps(THREE, RoundedBoxGeometry);
  const root = new THREE.Group(); scene.add(root);
  let items = [], lastW = 0;

  // place props from the layout in container units onto the z=0 plane of the camera
  function layout() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 760 ? 1.5 : 2);
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z, viewW = viewH * camera.aspect;
    const list = w < 760 ? preset.narrow : preset.wide;
    items.forEach((it) => root.remove(it.obj));
    items = list.map((p, i) => {
      const obj = make[p.k]();
      obj.scale.setScalar(p.s * viewH);
      obj.position.set((p.x - 0.5) * viewW, (0.5 - p.y) * viewH, 0);
      obj.rotation.set(p.rx, p.ry, p.rz);
      root.add(obj);
      return { obj, base: obj.position.clone(), rot: obj.rotation.clone(), ph: i * 1.7, spd: 0.6 + i * 0.15 };
    });
    lastW = w;
    if (!running) renderer.render(scene, camera);
  }

  // pointer parallax + scroll turn (eased)
  let tx = 0, ty = 0, px = 0, py = 0, visible = true, running = false;
  addEventListener("pointermove", (e) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start(); }, { rootMargin: "80px" }).observe(host);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });

  const clock = new THREE.Clock();
  function frame() {
    if (!visible || document.hidden) { running = false; return; }
    const t = clock.getElapsedTime();
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    const sc = Math.min(scrollY / innerHeight, 1.5);
    items.forEach((it) => {
      it.obj.position.y = it.base.y + Math.sin(t * it.spd + it.ph) * 0.06;
      it.obj.position.x = it.base.x + px * 0.08 * (1 + it.ph * 0.2);
      it.obj.rotation.x = it.rot.x + py * 0.25 + Math.sin(t * 0.5 + it.ph) * 0.08;
      it.obj.rotation.y = it.rot.y + px * 0.35 + Math.sin(t * 0.3 + it.ph) * 0.25 + sc * 0.9;
      it.obj.rotation.z = it.rot.z + Math.sin(t * 0.35 + it.ph) * 0.05;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function start() { if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(frame); } }

  layout();
  new ResizeObserver(() => { if (Math.abs((host.clientWidth || 1) - lastW) > 2 || true) layout(); }).observe(host);
  requestAnimationFrame(() => { host.parentElement && host.parentElement.classList.add("h3d-on"); start(); });
}

// start once the page has settled: on the first scroll / touch / pointer move, or 3.5 s after load, whichever comes first
let booted = false;
const kick = () => { if (booted) return; booted = true; ["scroll", "pointermove", "touchstart", "keydown"].forEach((e) => removeEventListener(e, kick)); (window.requestIdleCallback ? requestIdleCallback(boot, { timeout: 1500 }) : setTimeout(boot, 50)); };
const go = () => { ["scroll", "pointermove", "touchstart", "keydown"].forEach((e) => addEventListener(e, kick, { passive: true, once: true })); setTimeout(kick, 3500); };
if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
