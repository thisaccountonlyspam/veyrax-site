/* ============================================================
   VEYRA X OSINT — main.js  ·  motion engine
   Liquid WebGL + click ripples · parallax · sticky deck ·
   magnetic buttons · cursor glow · page transitions · playground
   ============================================================ */
(() => {
  "use strict";

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(hover: none)").matches;

  /* ================= liquid WebGL background ================= */
  const canvas = $("#liquid");
  let rippleQueue = [];
  if (canvas && !reduced) initLiquid(canvas);

  function initLiquid(canvas) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true });
    if (!gl) return;

    const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

    const fs = `
      precision highp float;
      uniform vec2  u_res;
      uniform float u_time;
      uniform vec2  u_mouse;
      uniform vec4  u_rip[6];   // xy = pos(px), z = age, w = strength

      vec2 hash(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
        return -1.+2.*fract(sin(p)*43758.5453123); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p);
        vec2 u=f*f*(3.-2.*f);
        return mix(mix(dot(hash(i),f),dot(hash(i+vec2(1,0)),f-vec2(1,0)),u.x),
                   mix(dot(hash(i+vec2(0,1)),f-vec2(0,1)),dot(hash(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);
      }
      float fbm(vec2 p){
        float v=0., a=.55;
        for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=.5; }
        return v;
      }
      // click ripple: expanding ring distortion
      float ripple(vec2 uv, vec4 rp){
        if(rp.w<=0.) return 0.;
        float d = distance(uv*min(u_res.x,u_res.y), rp.xy);
        float t = rp.z;
        float ring = sin(24.*d - t*14.) * exp(-3.5*abs(d - t*1.4)) * exp(-1.8*t) * rp.w;
        return ring;
      }

      void main(){
        vec2 asp = min(u_res.x,u_res.y);
        vec2 uv=(gl_FragCoord.xy*2.-u_res)/asp;
        float t=u_time*.06;
        vec2 m=u_mouse*.18;

        float rip=0.;
        for(int i=0;i<6;i++){ rip += ripple(gl_FragCoord.xy, u_rip[i]); }

        vec2 q=vec2(fbm(uv*1.4+t+m), fbm(uv*1.4-t*.7-m));
        vec2 r=vec2(fbm(uv*1.8+q*1.6+vec2(1.7,9.2)+t), fbm(uv*1.8+q*1.6+vec2(8.3,2.8)-t*.6));
        float f=fbm(uv*1.6+r*1.4 + rip*.6);

        vec3 c1=vec3(.031,.039,.055);
        vec3 c2=vec3(.37,.95,.76);
        vec3 c3=vec3(.35,.65,1.);
        vec3 c4=vec3(.71,.42,1.);

        vec3 col=mix(c1,c2*.55,clamp(f*f*2.2,0.,1.));
        col=mix(col,c3*.5,clamp(length(q)*.55,0.,1.)*.6);
        col=mix(col,c4*.45,clamp(r.x*r.x*1.1,0.,1.)*.5);

        col += vec3(.30,.95,.78)*abs(rip)*.85;   // glow on ripple crests

        float vig=1.-.45*length(uv*.72);
        col*=vig;
        gl_FragColor=vec4(col,.9);
      }`;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uRip = gl.getUniformLocation(prog, "u_rip");

    const ripples = Array.from({ length: 6 }, () => ({ x: 0, y: 0, t: 99, s: 0 }));
    let ri = 0;
    function addRipple(px, py) {
      const r = ripples[ri++ % 6];
      r.x = px; r.y = canvas.height - py; r.t = 0; r.s = 1;
    }
    window.__veyraRipple = addRipple;

    let mx = 0, my = 0, tx = 0, ty = 0;
    addEventListener("pointermove", e => {
      tx = (e.clientX / innerWidth - .5) * 2;
      ty = -(e.clientY / innerHeight - .5) * 2;
    }, { passive: true });

    function resize() {
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize(); addEventListener("resize", resize);

    const start = performance.now();
    const ripData = new Float32Array(24);
    (function frame(now) {
      const t = (now - start) / 1000;
      mx += (tx - mx) * .04; my += (ty - my) * .04;
      for (let i = 0; i < 6; i++) {
        const r = ripples[i];
        r.t += 1 / 60;
        ripData[i*4+0] = r.x; ripData[i*4+1] = r.y;
        ripData[i*4+2] = r.t; ripData[i*4+3] = r.s;
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform4fv(uRip, ripData);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    })(start);
  }

  /* ============ click / tap liquid ripple everywhere ============ */
  addEventListener("pointerdown", e => {
    if (window.__veyraRipple) {
      window.__veyraRipple(e.clientX * devicePixelRatio, e.clientY * devicePixelRatio);
    }
    // DOM ripple ring too (works without WebGL)
    const ring = document.createElement("span");
    ring.className = "click-ring";
    ring.style.left = e.clientX + "px";
    ring.style.top = e.clientY + "px";
    document.body.appendChild(ring);
    ring.addEventListener("animationend", () => ring.remove());
  }, { passive: true });

  /* ============ cursor glow trail (desktop) ============ */
  if (!isTouch && !reduced) {
    const cg = document.createElement("div");
    cg.className = "cursor-glow";
    document.body.appendChild(cg);
    document.body.classList.add("has-cursor");
    let gx = innerWidth / 2, gy = innerHeight / 2, px = gx, py = gy;
    addEventListener("pointermove", e => { gx = e.clientX; gy = e.clientY; }, { passive: true });
    (function follow() {
      px += (gx - px) * .12; py += (gy - py) * .12;
      cg.style.left = px + "px"; cg.style.top = py + "px";
      requestAnimationFrame(follow);
    })();
  }

  /* ================= nav ================= */
  const nav = $("#nav");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 24), { passive: true });
  const burger = $("#burger");
  if (burger) burger.addEventListener("click", () => nav.classList.toggle("open"));
  $$(".nav-links a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

  /* mobile status chip */
  if ($(".nav-inner")) {
    const chip = document.createElement("span");
    chip.className = "nav-status";
    chip.innerHTML = '<span class="dot"></span> LIVE';
    $(".nav-inner").appendChild(chip);
  }

  /* ================= page transitions (internal links) ================= */
  $$('a[href$=".html"], a[href="./"], a[href="/"]').forEach(a => {
    a.addEventListener("click", e => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank") return;
      e.preventDefault();
      document.body.classList.add("page-out");
      setTimeout(() => location.href = href, 260);
    });
  });
  addEventListener("pageshow", () => document.body.classList.remove("page-out"));
  document.body.classList.add("page-in");

  /* ================= scroll reveals ================= */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 70}ms`;
    io.observe(el);
  });

  /* SVG icon draw-in */
  const iconIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); iconIO.unobserve(en.target); }
    });
  }, { threshold: .3 });
  $$(".icon-draw").forEach(el => iconIO.observe(el));

  /* ================= scroll parallax engine ================= */
  if (!reduced) {
    const pEls = $$("[data-parallax]").map(el => ({
      el, sp: parseFloat(el.dataset.parallax) || .1, cur: 0
    }));
    let ticking = false;
    function parallax() {
      const vh = innerHeight;
      const sc = scrollY;
      for (const p of pEls) {
        const r = p.el.getBoundingClientRect();
        const center = r.top + r.height / 2 - vh / 2;
        const target = -center * p.sp * .35;
        p.cur += (target - p.cur) * .1;
        p.el.style.transform = `translate3d(0, ${p.cur.toFixed(2)}px, 0)`;
      }
      ticking = false;
    }
    addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ================= sticky stacking deck (services & pricing) ================= */
  const deck = $(".deck");
  if (deck && !reduced) {
    const cards = $$(".deck-card", deck);
    cards.forEach((card, i) => { card.style.top = `calc(96px + ${i * 14}px)`; });
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const i = cards.indexOf(en.target);
          cards.forEach((c, j) => c.classList.toggle("popped", j <= i));
        }
      });
    }, { threshold: .35 });
    cards.forEach(c => io2.observe(c));
  }

  /* ================= 3D tilt cards (desktop) ================= */
  if (!isTouch && !reduced) {
    $$("[data-tilt]").forEach(card => {
      let raf = null;
      card.addEventListener("pointermove", e => {
        const b = card.getBoundingClientRect();
        const rx = ((e.clientY - b.top) / b.height - .5) * -8;
        const ry = ((e.clientX - b.left) / b.width - .5) * 8;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
        });
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "perspective(700px) rotateX(0) rotateY(0)";
      });
    });
  }

  /* ================= magnetic buttons ================= */
  if (!isTouch && !reduced) {
    $$(".magnetic").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const b = btn.getBoundingClientRect();
        const dx = (e.clientX - b.left - b.width / 2) * .25;
        const dy = (e.clientY - b.top - b.height / 2) * .35;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ================= marquee deck dots + scroll spy ================= */
  const dots = $$(".deck-dots span");
  if (dots.length) {
    const grid = $(".svc-grid");
    grid.addEventListener("scroll", () => {
      const i = Math.round(grid.scrollLeft / (grid.scrollWidth / dots.length - 20));
      dots.forEach((d, j) => d.classList.toggle("on", j === Math.max(0, Math.min(i, dots.length - 1))));
    }, { passive: true });
  }

  /* mobile try-fab + bottom sheet */
  const fab = $(".try-fab");
  const pg = $("#pg");
  if (fab && pg) {
    fab.addEventListener("click", () => {
      pg.classList.add("sheet-open");
      fab.classList.add("hidden");
      document.body.style.overflow = "hidden";
    });
    const close = document.createElement("button");
    close.className = "sheet-close";
    close.setAttribute("aria-label", "close");
    close.textContent = "✕";
    pg.prepend(close);
    close.addEventListener("click", () => {
      pg.classList.remove("sheet-open");
      fab.classList.remove("hidden");
      document.body.style.overflow = "";
    });
  }

  /* ================= terminal typing ================= */
  const termBody = $("#term-body");
  if (termBody) {
    const scenes = [
      { cmd: 'curl api.veyrax.in/api/v1/rc/MH02BE0001 \\\n  -H "X-API-Key: vx_live_••••••••"', out:
`{
  "status": "ok",
  "data": {
    "owner":      "R****h S****a",
    "vehicle":    "MAHINDRA XUV700",
    "regDate":    "2021-08-14",
    "insurance":  "valid till 2027-08-13",
    "fitness":    "valid till 2036-08-13",
    "masked":     true
  }
}` },
      { cmd: 'curl api.veyrax.in/api/v1/challan/MH12QT1122 \\\n  -H "X-API-Key: vx_live_••••••••"', out:
`{
  "status": "ok",
  "pending": 2,
  "items": [
    { "violation": "SPEEDING", "fine": 1000, "state": "paid" },
    { "violation": "NO_HELMET", "fine": 500, "state": "due" }
  ],
  "masked": true
}` },
      { cmd: 'curl api.veyrax.in/api/v1/dl/MH1220190001234 \\\n  -H "X-API-Key: vx_live_••••••••"', out:
`{
  "status": "ok",
  "data": {
    "name":     "P****a K***r",
    "validity": "2031-04-02",
    "classes":  ["LMV", "MCWG"],
    "photo":    "masked(base64)",
    "masked":   true
  }
}` },
    ];

    if (reduced) {
      termBody.textContent = "$ curl api.veyrax.in/api/v1/rc/MH02BE0001\n\n{ status: ok, masked: true }";
    } else {
      let si = 0;
      (function typeScene() {
        const sc = scenes[si % scenes.length]; si++;
        let ci = 0;
        termBody.textContent = "";
        (function typeCmd() {
          if (ci <= sc.cmd.length) {
            termBody.textContent = sc.cmd.slice(0, ci++);
            setTimeout(typeCmd, 18 + Math.random() * 30);
          } else {
            let oi = 0;
            (function typeOut() {
              if (oi <= sc.out.length) {
                termBody.textContent = sc.cmd + "\n\n" + sc.out.slice(0, oi++);
                setTimeout(typeOut, 6);
              } else setTimeout(typeScene, 4200);
            })();
          }
        })();
      })();
    }
  }

  /* ================= stat counters ================= */
  const statsEl = $("#stats");
  if (statsEl) {
    const cio = new IntersectionObserver(en => {
      if (!en[0].isIntersecting) return;
      cio.disconnect();
      $$("b[data-count]", statsEl).forEach(b => {
        const target = +b.dataset.count, suffix = b.dataset.suffix || "";
        const t0 = performance.now(), dur = 1400;
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          b.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: .4 });
    cio.observe(statsEl);
  }

  /* ================= playground ================= */
  const pgRun = $("#pg-run");
  const pgOut = $("#pg-out");
  const pgQuota = $("#pg-quota");
  const pgInput = $("#pg-input");
  const seg = $("#pg-service");
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
      const spin = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];
      let i = 0;
      pgOut.textContent = spin[0] + " querying …";
      const iv = setInterval(() => { pgOut.textContent = spin[i++ % 8] + " querying …"; }, 90);
      setTimeout(() => { clearInterval(iv); pgOut.textContent = JSON.stringify(fakeResponse(), null, 2); }, 900);
    });
    pgInput?.addEventListener("keydown", e => { if (e.key === "Enter") pgRun.click(); });
  }

  /* footer year */
  $$(".yr").forEach(el => el.textContent = new Date().getFullYear());
})();
