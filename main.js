/* ============================================================
   VEYRA X OSINT — v3 · main.js
   STATIC site. The only JS: tiny UI state helpers.
   No animation loops, no parallax, no canvas, no shaders.
   ============================================================ */
(() => {
  "use strict";
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(hover: none)").matches;

  /* ---------- reveal on scroll (one IO, class toggle only) ---------- */
  const els = $$(".reveal");
  if (isTouch || reduced || !("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: .1, rootMargin: "0px 0px -30px 0px" });
    els.forEach(el => io.observe(el));
  }

  /* ---------- scroll progress bar ---------- */
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);
  let pTick = false;
  addEventListener("scroll", () => {
    if (pTick) return;
    pTick = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
      pTick = false;
    });
  }, { passive: true });

  /* ---------- custom cursor (desktop only, transform-only) ---------- */
  if (!isTouch && !reduced) {
    const lp = (a, b, t) => a + (b - a) * t;
    const mk = cls => { const el = document.createElement("div"); el.className = cls; document.documentElement.appendChild(el); return el; };
    const glow = mk("cursor-glow"), ring = mk("cursor-ring"), dot = mk("cursor-dot");
    ring.innerHTML = "<span></span>";
    document.body.classList.add("has-cursor");
    let gx = -100, gy = -100, rx = gx, ry = gy, wx = gx, wy = gy;
    addEventListener("pointermove", e => {
      gx = e.clientX; gy = e.clientY;
      const t = e.target;
      const view = t.closest && t.closest("[data-cursor]");
      const link = t.closest && t.closest("a, button, .seg button, input, .price");
      document.body.classList.toggle("cur-view", !!view);
      document.body.classList.toggle("cur-link", !!link && !view);
      if (view) ring.firstElementChild.textContent = view.dataset.cursor || "VIEW";
    }, { passive: true });
    // CSS handles hover styles; JS only moves 3 elements, transform-only
    (function loop() {
      rx = lp(rx, gx, .25); ry = lp(ry, gy, .25);
      wx = lp(wx, gx, .1);  wy = lp(wy, gy, .1);
      dot.style.transform  = `translate3d(${gx}px, ${gy}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      glow.style.transform = `translate3d(${wx}px, ${wy}px, 0)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- macOS dock (desktop) — injected on every page ---------- */
  if (!isTouch) {
    try {
    const D = [
      ["Home", "index.html", "M3 10.5 12 3l9 7.5 M5 9.5V21h14V9.5 M9.5 21v-7h5v7"],
      ["Services", "services.html", "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z"],
      ["Playground", "playground.html", "M8 6l-5 6 5 6 M16 6l5 6-5 6"],
      ["Docs", "docs.html", "M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h5"],
      ["Pricing", "pricing.html", "M12 3v18 M8 7h5.5a2.5 2.5 0 0 1 0 5H8h6a2.5 2.5 0 0 1 0 5H8"],
      ["About", "about.html", "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 8h.01 M11 12h1v5h1"],
      ["Dashboard", "dashboard.html", "M4 4h16v16H4z M4 9h16 M9 21V9"],
    ];
    const SEP_BEFORE = 7;                    // separator before the CTA
    const dock = document.createElement("div");
    dock.className = "dock";
    dock.setAttribute("role", "navigation");
    const here = location.pathname.split("/").pop() || "index.html";
    D.forEach(([label, href, d], i) => {
      if (i === SEP_BEFORE) dock.insertAdjacentHTML("beforeend", `<span class="dock-sep"></span>`);
      const active = here === href.split("/").pop() ? " on" : "";
      dock.insertAdjacentHTML("beforeend",
        `<a class="dock-item${active}" href="${href}" data-label="${label}" aria-label="${label}">
           <svg viewBox="0 0 24 24"><path d="${d}"/></svg></a>`);
    });
    const CTA = `<a class="dock-cta" href="signup.html">Get key</a>`;
    dock.insertAdjacentHTML("beforeend", `<span class="dock-sep"></span>${CTA}
      <span class="dock-item dock-home" data-label="Menu" role="button" tabindex="0" aria-label="menu">
        <svg viewBox="0 0 24 24"><path d="M4 7h16 M4 12h16 M4 17h16"/></svg></span>`);
    document.body.appendChild(dock);

    // fisheye magnification (one pointermove listener, transform-only)
    const items = [...dock.querySelectorAll(".dock-item")];
    const scale = el => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      return Math.max(1, 1.62 - d / 130);
    };
    let e = { clientX: -9999 };
    dock.addEventListener("pointermove", ev => { e = ev; items.forEach(it => it.style.transform = `scale(${scale(it)})`); });
    dock.addEventListener("pointerleave", () => { e = { clientX: -9999 }; items.forEach(it => it.style.transform = ""); });
    const homeBtn = dock.querySelector(".dock-home");
    if (homeBtn) homeBtn.addEventListener("click", openMenu);
    } catch (err) { console.warn("dock init skipped:", err); }
  }

  function openMenu() {
    menu.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  /* ---------- overlay menu ---------- */
  const menu = document.createElement("div");
  menu.className = "ov-menu";
  menu.innerHTML = `
    <button class="ov-x" aria-label="close menu">✕</button>
    <nav class="ov-links">
      <a href="index.html"><em>01</em>Home</a>
      <a href="services.html"><em>02</em>Services</a>
      <a href="playground.html"><em>03</em>Playground</a>
      <a href="docs.html"><em>04</em>Docs</a>
      <a href="pricing.html"><em>05</em>Pricing</a>
      <a href="about.html"><em>06</em>About</a>
      <a href="dashboard.html"><em>07</em>Dashboard</a>
    </nav>
    <div class="ov-foot">
      <span>VEYRA X OSINT</span>
      <span><span class="dot"></span> all systems operational</span>
    </div>`;
  document.body.appendChild(menu);
  const burger = $("#burger");
  if (burger) burger.addEventListener("click", () => {
    menu.classList.add("open");
    document.body.style.overflow = "hidden";
  });
  menu.querySelector(".ov-x").addEventListener("click", closeMenu);
  menu.querySelectorAll(".ov-links a").forEach(a =>
    a.addEventListener("click", closeMenu));
  addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
  function closeMenu() {
    menu.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ---------- curtain page transition ---------- */
  const curtain = document.createElement("div");
  curtain.className = "curtain";
  curtain.innerHTML = "<span></span><span></span><span></span><span></span><span></span>";
  document.body.appendChild(curtain);
  $$('a[href$=".html"]').forEach(a => {
    a.addEventListener("click", e => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank") return;
      e.preventDefault();
      closeMenu();
      curtain.classList.add("run");
      setTimeout(() => location.href = href, 500);
    });
  });
  addEventListener("pageshow", () => curtain.classList.remove("run"));

  /* ---------- playground (masked demo) ---------- */
  const pgRun = $("#pg-run"), pgOut = $("#pg-out"), pgQuota = $("#pg-quota"),
        pgInput = $("#pg-input"), seg = $("#pg-service");
  let svc = "rc", quota = 3;
  if (seg) {
    $$("button", seg).forEach(b => b.addEventListener("click", () => {
      $(".active", seg)?.classList.remove("active");
      b.classList.add("active");
      svc = b.dataset.svc;
      if (pgInput) pgInput.placeholder = svc === "dl" ? "MH1220190001234" : "MH02BE0001";
    }));
  }
  const mask = n => n ? String(n).split(" ").map(w => w[0] + "*".repeat(Math.max(w.length - 1, 1))).join(" ") : n;
  function fakeResponse() {
    const q = (pgInput?.value || "MH02BE0001").toUpperCase().trim();
    const rid = "vx_" + Math.random().toString(36).slice(2, 10);
    if (svc === "rc") return { status: "ok", requestId: rid, data: {
      regNo: q, owner: mask("Rahul Sharma"), fatherName: mask("Suresh Sharma"),
      vehicle: "MAHINDRA XUV700 AX7", fuel: "DIESEL", class: "LMV-CC",
      regDate: "2021-08-14", insuranceUpto: "2027-08-13", fitnessUpto: "2036-08-13",
      taxUpto: "2036-08-13", masked: true } };
    if (svc === "dl") return { status: "ok", requestId: rid, data: {
      dlNo: q, name: mask("Priya Kapoor"), dob: "19**-0*-2*",
      validity: "2031-04-02", classes: ["LMV", "MCWG"], status: "ACTIVE", masked: true } };
    if (svc === "challan") return { status: "ok", requestId: rid, vehicleNo: q, pending: 1,
      items: [{ challanNo: "MH****" + q.slice(-4), violation: "OVERSPEED",
        fine: 1000, status: "DUE", date: new Date().toISOString().slice(0, 10) }], masked: true };
    return { status: "ok", requestId: rid, data: {
      regNo: q, permitClass: "National Permit", validUpto: "2027-03-31",
      taxMode: "PAID", masked: true } };
  }
  if (pgRun) {
    pgRun.addEventListener("click", () => {
      if (quota <= 0) { pgOut.textContent = "⚠ free demo limit reached — get a key to keep querying."; return; }
      quota--;
      if (pgQuota) pgQuota.textContent = `${quota} free quer${quota === 1 ? "y" : "ies"} left`;
      pgOut.textContent = "… querying";
      setTimeout(() => { pgOut.textContent = JSON.stringify(fakeResponse(), null, 2); }, 550);
    });
    pgInput?.addEventListener("keydown", e => { if (e.key === "Enter") pgRun.click(); });
  }

  /* ---------- demo payment modal ---------- */
  const payOverlay = document.createElement("div");
  payOverlay.className = "pay-overlay";
  payOverlay.innerHTML = `
    <div class="pay-modal" role="dialog" aria-label="checkout">
      <button class="pay-x" aria-label="close">✕</button>
      <div class="pay-head">
        <span class="pay-brand">⌖ VEYRA<span>X</span></span>
        <span class="pay-amount">₹299<span>/mo</span></span>
      </div>
      <p class="pay-plan">Pro — 5,000 full queries / month</p>
      <div class="seg pay-tabs">
        <button class="active" data-pane="upi">UPI</button>
        <button data-pane="card">Card</button>
        <button data-pane="net">NetBanking</button>
      </div>
      <div class="pay-pane on" data-pane="upi">
        <div class="field"><label>UPI ID</label><input type="text" placeholder="name@okhdfc / name@upi" /></div>
      </div>
      <div class="pay-pane" data-pane="card">
        <div class="field"><label>CARD NUMBER</label><input type="text" placeholder="4111 1111 1111 1111" /></div>
        <div style="display:flex;gap:10px">
          <div class="field" style="flex:1"><label>EXPIRY</label><input type="text" placeholder="MM/YY" /></div>
          <div class="field" style="flex:1"><label>CVV</label><input type="password" placeholder="•••" /></div>
        </div>
      </div>
      <div class="pay-pane" data-pane="net">
        <div class="field"><label>BANK</label>
          <div class="seg" style="display:flex;flex-wrap:wrap">
            <button type="button">HDFC</button><button type="button">SBI</button>
            <button type="button">ICICI</button><button type="button">Axis</button>
          </div>
        </div>
      </div>
      <button class="btn-primary btn-block pay-now">Pay ₹299</button>
      <p class="pay-note">Demo checkout · secured by Razorpay · GST invoice included</p>
      <div class="pay-done">
        <svg viewBox="0 0 52 52" class="pay-check"><circle cx="26" cy="26" r="24"/><path d="M15 27 L23 35 L38 18"/></svg>
        <h3>Pro activated</h3>
        <p style="color:var(--txt-2);font-size:14px">Your key is upgraded. 5,000 full queries unlocked.</p>
      </div>
    </div>`;
  document.body.appendChild(payOverlay);
  const openPay = () => { payOverlay.classList.add("open"); document.body.style.overflow = "hidden"; };
  const closePay = () => {
    payOverlay.classList.remove("open");
    payOverlay.querySelector(".pay-modal").classList.remove("done");
    document.body.style.overflow = "";
  };
  $$('[data-pay], .price-featured .btn-primary').forEach(b =>
    b.addEventListener("click", e => { e.preventDefault(); openPay(); }));
  payOverlay.querySelector(".pay-x").addEventListener("click", closePay);
  payOverlay.addEventListener("click", e => { if (e.target === payOverlay) closePay(); });
  $$(".pay-tabs button", payOverlay).forEach(t => t.addEventListener("click", () => {
    $$(".pay-tabs button", payOverlay).forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    $$(".pay-pane", payOverlay).forEach(p => p.classList.toggle("on", p.dataset.pane === t.dataset.pane));
  }));
  payOverlay.querySelector(".pay-now").addEventListener("click", function () {
    this.textContent = "Processing…";
    setTimeout(() => {
      payOverlay.querySelector(".pay-modal").classList.add("done");
      this.textContent = "Pay ₹299";
    }, 1400);
  });

  /* ---------- terminal typer (static fallback on touch/reduced) ---------- */
  const termBody = $("#term-body");
  if (termBody) {
    const CMD = '$ curl -s "https://api.veyrax.osint/api/v1/rc/MH02BE0001" \\\n    -H "Authorization: Bearer vx_live_********"';
    const OUT = JSON.stringify({
      status: "ok", requestId: "vx_9f2ka81m",
      data: {
        regNo: "MH02BE0001", owner: "R****h S****a",
        vehicle: "MAHINDRA XUV700 AX7", fuel: "DIESEL",
        class: "LMV-CC", insuranceUpto: "2027-08-13",
        fitnessUpto: "2036-08-13", masked: true
      }
    }, null, 2);
    const FULL = CMD + "\n\n" + OUT;
    if (isTouch || reduced) {
      termBody.textContent = FULL;
    } else {
      const caret = document.createElement("span");
      caret.className = "term-caret";
      const txt = document.createTextNode("");
      termBody.appendChild(txt);
      termBody.appendChild(caret);
      let i = 0, phase = "type";
      (function tick() {
        if (i < FULL.length) {
          i += (i < CMD.length) ? 1 : 3;              // type cmd slow, JSON fast
          txt.nodeValue = FULL.slice(0, i);
          const speed = i < CMD.length ? 26 : 7;
          setTimeout(tick, speed);
        } else {
          setTimeout(() => {                          // hold, wipe, loop
            i = 0; txt.nodeValue = "";
            setTimeout(tick, 350);
          }, 4200);
        }
      })();
    }
  }

  /* ---------- stats count-up (static fallback on touch/reduced) ---------- */
  const stats = $("#stats");
  if (stats) {
    const nums = $$("[data-count]", stats);
    const final = el => (el.dataset.count || "0") + (el.dataset.suffix || "");
    if (isTouch || reduced || !("IntersectionObserver" in window)) {
      nums.forEach(el => el.textContent = final(el));
    } else {
      const io2 = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          io2.unobserve(en.target);
          nums.forEach(el => {
            const target = parseFloat(el.dataset.count), sfx = el.dataset.suffix || "";
            const t0 = performance.now(), dur = 1100;
            (function step(now) {
              const p = Math.min((now - t0) / dur, 1);
              const e = 1 - Math.pow(1 - p, 3);          // easeOutCubic
              el.textContent = Math.round(target * e) + sfx;
              if (p < 1) requestAnimationFrame(step);
              else el.textContent = target + sfx;
            })(t0);
          });
        });
      }, { threshold: .4 });
      io2.observe(stats);
    }
  }

  /* ---------- space scene: starfield canvas + hero parallax (desktop only) ---------- */
  const heroInner = $(".hero-inner");
  const plxEls = $$("[data-plx]");
  if (!isTouch && !reduced) {
    try {
    // starfield — original code, three depth layers, twinkle, scroll+mouse drift
    const cv = document.createElement("canvas");
    cv.className = "bg-space";
    cv.setAttribute("aria-hidden", "true");
    document.body.prepend(cv);
    const ctx = cv.getContext("2d");
    if (ctx) {
      const TINTS = [[255,255,255],[255,255,255],[255,255,255],[94,242,195],[122,182,255],[255,255,255]];
      let W, H, stars = [], DPR;
      let mx = .5, my = .5, smx = .5, smy = .5;
      const build = () => {
        DPR = Math.min(devicePixelRatio || 1, 1.5);
        W = innerWidth; H = innerHeight;
        cv.width = W * DPR; cv.height = H * DPR;
        cv.style.width = W + "px"; cv.style.height = H + "px";
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        const n = Math.min(190, Math.round((W * H) / 8500));
        stars = Array.from({ length: n }, () => {
          const z = .2 + Math.random() * .8;             // depth 0.2 (far) → 1 (near)
          return {
            x: Math.random() * W, y: Math.random() * H, z,
            r: (.4 + z * 1.15) * (Math.random() * .7 + .65),
            tw: Math.random() * Math.PI * 2,
            ts: .5 + Math.random() * 1.6,
            c: TINTS[(Math.random() * TINTS.length) | 0]
          };
        });
      };
      build();
      let rT; addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(build, 180); });
      addEventListener("pointermove", e => { mx = e.clientX / W; my = e.clientY / H; }, { passive: true });

      // nebula glow blobs pre-rendered once (cheap each frame: 2 drawImage)
      const neb = document.createElement("canvas");
      neb.width = neb.height = 480;
      const nctx = neb.getContext("2d");
      const blob = (x, y, r, col) => {
        const g = nctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
        nctx.fillStyle = g; nctx.fillRect(0, 0, 480, 480);
      };
      blob(140, 150, 210, "rgba(94,242,195,.055)");
      blob(360, 340, 240, "rgba(122,120,255,.05)");

      let frames = 0, acc = 0, capped = false;
      let sy = scrollY, lastT = performance.now();
      const loop = t => {
        const dt = Math.min((t - lastT) / 16.7, 3); lastT = t;
        sy += (scrollY - sy) * .08;                      // lerped scroll
        smx += (mx - smx) * .04; smy += (my - smy) * .04;
        ctx.clearRect(0, 0, W, H);
        // nebula drifts opposite the stars
        ctx.drawImage(neb, -smx * 60 - 120, -smy * 60 + sy * -.03 - 140);
        ctx.drawImage(neb, W - 480 + smx * 80, H - 480 - smy * 50 - sy * .02);
        for (const s of stars) {
          s.x -= s.z * .06 * dt;                         // slow leftward drift
          if (s.x < -4) { s.x = W + 4; s.y = Math.random() * H; }
          s.tw += s.ts * .015 * dt;
          const a = .25 + .55 * s.z + Math.sin(s.tw) * .3 * s.z;
          const px = s.x + (smx - .5) * 42 * s.z;        // mouse parallax by depth
          const py = s.y + (smy - .5) * 26 * s.z + sy * .1 * s.z; // scroll parallax
          ctx.globalAlpha = Math.max(a, .05);
          ctx.fillStyle = `rgb(${s.c[0]},${s.c[1]},${s.c[2]})`;
          ctx.beginPath(); ctx.arc(px, py, s.r, 0, 6.2832); ctx.fill();
        }
        ctx.globalAlpha = 1;
        // adaptive: if slow, drop half the stars once
        acc += dt; if (++frames === 130) {
          if (acc / 130 > 1.35 && !capped) { stars.length = Math.floor(stars.length * .5); capped = true; }
          frames = acc = 0;
        }
      };
      let live = true;
      const raf = t => { if (live) { loop(t); requestAnimationFrame(raf); } };
      requestAnimationFrame(raf);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { live = false; }
        else if (!live) { live = true; lastT = performance.now(); requestAnimationFrame(raf); }
      });
    }

    // hero scroll parallax + fade (transform/opacity only, shared rAF)
    if (heroInner || plxEls.length) {
      let psy = scrollY, tickQ = false;
      const apply = () => {
        tickQ = false;
        if (heroInner) {
          const f = Math.max(1 - psy / 620, 0);
          heroInner.style.opacity = f;
          heroInner.style.transform = `translateY(${psy * .16}px)`;
        }
        for (const el of plxEls) {
          el.style.transform = `translate3d(0, ${psy * parseFloat(el.dataset.plx)}px, 0)`;
        }
      };
      addEventListener("scroll", () => {
        psy = scrollY;
        if (!tickQ) { tickQ = true; requestAnimationFrame(apply); }
      }, { passive: true });
      apply();
    }
    } catch (err) { console.warn("hero fx skipped:", err); }
  } else {
    // touch/reduced: hero stays visible, parallax layers pinned
    plxEls.forEach(el => el.style.transform = "none");
  }

  /* ---------- docs scroll-spy: color nav + light the focused block ---------- */
  const dnav = $(".docs-nav");
  if (dnav) {
    const links = $$('a[href^="#"]', dnav);
    const blocks = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
    const setActive = id => {
      links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + id));
      blocks.forEach(b => b.classList.toggle("lit", b.id === id));
    };
    if (isTouch || !("IntersectionObserver" in window)) {
      // click-driven only
      links.forEach(a => a.addEventListener("click", () =>
        setActive(a.getAttribute("href").slice(1))));
    } else {
      const spy = new IntersectionObserver(entries => {
        const vis = entries.filter(en => en.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      }, { rootMargin: "-35% 0px -55% 0px", threshold: [0, .05, .25, .5] });
      blocks.forEach(b => spy.observe(b));
      links.forEach(a => a.addEventListener("click", () =>
        setActive(a.getAttribute("href").slice(1))));
    }
  }

  /* ---------- cylindrical pricing wall (desktop) ---------- */
  const stage = $(".cyl-stage"), cyl = $(".cyl");
  if (stage && cyl && !isTouch && !reduced) {
    try {
    const cards = $$(".price", cyl);
    const N = cards.length;
    if (N) {
      const STEP = 360 / N;
      const RAD = Math.round((cards[0].offsetWidth || 340) / (2 * Math.tan(Math.PI / N))) + 90;
      cards.forEach((c, i) => {
        c.style.setProperty("--a", (i * STEP) + "deg");
        c.style.setProperty("--r", RAD + "px");
      });
      let theta = -((focusIdx() ) * STEP), vel = 0, dragging = false, lastX = 0, raf = null;
      function focusIdx() {
        const norm = ((-theta % 360) + 360) % 360;
        return Math.round(norm / STEP) % N;
      }
      const render = () => {
        cyl.style.setProperty("--theta", theta + "deg");
        const f = focusIdx();
        cards.forEach((c, i) => {
          let d = Math.abs(i - f); d = Math.min(d, N - d);   // shortest way around
          c.classList.toggle("focus", d === 0);
          c.style.setProperty("--s", d === 0 ? 1 : Math.max(.72, 1 - d * .12));
        });
      };
      const spin = () => {
        if (!dragging) {
          theta += vel; vel *= .94;                           // inertia
          // gently settle to nearest card
          const target = -focusIdx() * STEP;
          theta += (target - theta) * .06;
        }
        render();
        raf = requestAnimationFrame(spin);
      };
      stage.addEventListener("pointerdown", ev => {
        dragging = true; lastX = ev.clientX; vel = 0;
        stage.classList.add("grabbing"); stage.setPointerCapture(ev.pointerId);
      });
      stage.addEventListener("pointermove", ev => {
        if (!dragging) return;
        const dx = ev.clientX - lastX; lastX = ev.clientX;
        theta += dx * .22; vel = dx * .22;
      });
      const stop = () => { dragging = false; stage.classList.remove("grabbing"); };
      stage.addEventListener("pointerup", stop);
      stage.addEventListener("pointercancel", stop);
      // arrows / keys
      const stepBy = dir => { vel = 0; theta = -(focusIdx() + dir) * STEP; };
      stage.setAttribute("tabindex", "0");
      stage.addEventListener("keydown", ev => {
        if (ev.key === "ArrowRight") { stepBy(1); ev.preventDefault(); }
        if (ev.key === "ArrowLeft")  { stepBy(-1); ev.preventDefault(); }
      });
      render(); raf = requestAnimationFrame(spin);
    }
    } catch (err) { console.warn("cylinder skipped:", err); }
  }

  /* footer year */
  $$(".yr").forEach(el => el.textContent = new Date().getFullYear());
})();
