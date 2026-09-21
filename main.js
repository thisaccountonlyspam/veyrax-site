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

  /* footer year */
  $$(".yr").forEach(el => el.textContent = new Date().getFullYear());
})();
