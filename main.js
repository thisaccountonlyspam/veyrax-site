/* ============================================================
   VEYRA X OSINT — main.js · v2 motion engine
   Liquid WebGL (+ripple) · scroll parallax · sticky deck stack ·
   hero char stagger · magnetic · cursor glow · page transitions
   ============================================================ */
(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(hover: none)").matches;
  const desktop = matchMedia("(min-width: 821px)").matches;

  /* ================= liquid WebGL background ================= */
  const canvas = $("#liquid");
  if (canvas && !reduced) initLiquid(canvas);

  function initLiquid(canvas) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true })
            || canvas.getContext("experimental-webgl");
    if (!gl) { document.body.classList.add("no-webgl"); return; }

    // pick float precision the GPU actually supports
    const highOK = (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT) || { precision: 0 }).precision > 0;
    const PREC = highOK ? "highp" : "mediump";

    const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

    const fs = `
      precision ${PREC} float;
      uniform vec2  u_res;
      uniform float u_time;
      uniform vec2  u_mouse;
      uniform vec4  u_rip[6];

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
      float ripple(vec2 px, vec4 rp){
        if(rp.w<=0. || rp.z>3.) return 0.;
        float d = distance(px, rp.xy);
        float t = rp.z;
        return sin(22.*d - t*13.) * exp(-3.2*abs(d - t*1.5)) * exp(-1.6*t);
      }

      void main(){
        vec2 asp = vec2(min(u_res.x,u_res.y));
        vec2 uv=(gl_FragCoord.xy*2.-u_res)/asp.x;
        float t=u_time*.06;
        vec2 m=u_mouse*.18;

        float rip=0.;
        for(int i=0;i<6;i++){ rip += ripple(gl_FragCoord.xy, u_rip[i]); }

        vec2 q=vec2(fbm(uv*1.4+t+m), fbm(uv*1.4-t*.7-m));
        vec2 r=vec2(fbm(uv*1.8+q*1.6+vec2(1.7,9.2)+t), fbm(uv*1.8+q*1.6+vec2(8.3,2.8)-t*.6));
        float f=fbm(uv*1.6+r*1.4 + rip*.55);

        vec3 c1=vec3(.031,.039,.055);
        vec3 c2=vec3(.37,.95,.76);
        vec3 c3=vec3(.35,.65,1.);
        vec3 c4=vec3(.71,.42,1.);

        vec3 col=mix(c1,c2*.55,clamp(f*f*2.2,0.,1.));
        col=mix(col,c3*.5,clamp(length(q)*.55,0.,1.)*.6);
        col=mix(col,c4*.45,clamp(r.x*r.x*1.1,0.,1.)*.5);
        col += vec3(.30,.95,.78)*abs(rip)*.9;

        col*=1.-.45*length(uv*.72);
        gl_FragColor=vec4(col,.9);
      }`;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("[veyra] shader:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    const vs_ = compile(gl.VERTEX_SHADER, vs);
    const fs_ = compile(gl.FRAGMENT_SHADER, fs);
    if (!vs_ || !fs_) { document.body.classList.add("no-webgl"); return; }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs_);
    gl.attachShader(prog, fs_);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[veyra] link:", gl.getProgramInfoLog(prog));
      document.body.classList.add("no-webgl");
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse= gl.getUniformLocation(prog, "u_mouse");
    const uRip  = gl.getUniformLocation(prog, "u_rip");

    const ripples = Array.from({ length: 6 }, () => ({ x: 0, y: 0, t: 99 }));
    let ri = 0;
    window.__veyraRipple = (px, py) => {
      const r = ripples[ri++ % 6];
      r.x = px; r.y = canvas.height - py; r.t = 0;
    };

    let mx = 0, my = 0, tx = 0, ty = 0;
    addEventListener("pointermove", e => {
      tx = (e.clientX / innerWidth - .5) * 2;
      ty = -(e.clientY / innerHeight - .5) * 2;
    }, { passive: true });

    function resize() {
      canvas.width = innerWidth * Math.min(devicePixelRatio, 2);
      canvas.height = innerHeight * Math.min(devicePixelRatio, 2);
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
        ripData[i*4] = r.x; ripData[i*4+1] = r.y; ripData[i*4+2] = r.t; ripData[i*4+3] = 1;
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform4fv(uRip, ripData);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    })(start);
  }

  /* ============ click / tap ripples (WebGL + DOM ring) ============ */
  addEventListener("pointerdown", e => {
    if (window.__veyraRipple)
      window.__veyraRipple(e.clientX * Math.min(devicePixelRatio, 2), e.clientY * Math.min(devicePixelRatio, 2));
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

  /* ================= scroll progress bar ================= */
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  /* ================= nav ================= */
  const nav = $("#nav");
  if (nav) {
    addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 24), { passive: true });
    const burger = $("#burger");
    if (burger) burger.addEventListener("click", () => nav.classList.toggle("open"));
    $$(".nav-links a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
    const chip = document.createElement("span");
    chip.className = "nav-status";
    chip.innerHTML = '<span class="dot"></span> LIVE';
    $(".nav-inner")?.appendChild(chip);
  }

  /* ================= page transitions ================= */
  $$('a[href$=".html"]').forEach(a => {
    a.addEventListener("click", e => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank") return;
      e.preventDefault();
      document.body.classList.add("page-out");
      setTimeout(() => location.href = href, 240);
    });
  });
  addEventListener("pageshow", () => document.body.classList.remove("page-out"));
  document.body.classList.add("page-in");

  /* ================= hero char stagger ================= */
  if (!reduced) {
    $$(".hero-title .line:not(.grad)").forEach(line => {
      if (line.dataset.split) return;
      line.dataset.split = "1";
      const text = line.textContent;
      line.textContent = "";
      [...text].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.style.animationDelay = (0.25 + i * 0.032) + "s";
        s.textContent = ch === " " ? "\u00A0" : ch;
        line.appendChild(s);
      });
    });
  }

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
  let parallaxTick = false;
  const pEls = reduced ? [] : $$("[data-parallax]").map(el => ({
    el, sp: parseFloat(el.dataset.parallax) || .1
  }));
  function parallax() {
    const vh = innerHeight;
    for (const p of pEls) {
      const r = p.el.getBoundingClientRect();
      const center = r.top + r.height / 2 - vh / 2;
      const target = -center * p.sp * .5;
      p.el.style.transform = `translate3d(0, ${target.toFixed(2)}px, 0)`;
    }
    // progress bar
    const doc = document.documentElement;
    const max = doc.scrollHeight - vh;
    progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    parallaxTick = false;
  }
  if (!reduced) {
    addEventListener("scroll", () => {
      if (!parallaxTick) { requestAnimationFrame(parallax); parallaxTick = true; }
    }, { passive: true });
    parallax();
  }

  /* ================= sticky deck stack (desktop) ================= */
  const deck = $(".deck");
  const deckCards = deck ? $$(".deck-card", deck) : [];
  if (deck && deckCards.length) {
    deckCards.forEach((c, i) => { c.style.top = (110 + i * 16) + "px"; });
    if (desktop && !reduced) {
      let tick = false;
      function deckScroll() {
        const vh = innerHeight;
        deckCards.forEach((c, i) => {
          const next = deckCards[i + 1];
          let ov = 0;
          if (next) {
            const nr = next.getBoundingClientRect();
            ov = clamp(1 - (nr.top - (110 + (i + 1) * 16)) / (vh * .55), 0, 1);
          }
          const s = 1 - ov * .10;
          const b = 1 - ov * .48;
          const rx = ov * 4.5;
          c.style.transform = `perspective(1200px) rotateX(${(-rx).toFixed(2)}deg) scale(${s.toFixed(3)})`;
          c.style.filter = `brightness(${b.toFixed(3)}) saturate(${(1 - ov * .3).toFixed(3)})`;
        });
        tick = false;
      }
      addEventListener("scroll", () => {
        if (!tick) { requestAnimationFrame(deckScroll); tick = true; }
      }, { passive: true });
      deckScroll();
    }
  }

  /* swipe-deck dots (mobile) */
  const dots = $$(".deck-dots span");
  const deckTrack = $(".deck");
  if (dots.length && deckTrack) {
    deckTrack.addEventListener("scroll", () => {
      const i = clamp(Math.round(deckTrack.scrollLeft / (deckTrack.scrollWidth / dots.length)), 0, dots.length - 1);
      dots.forEach((d, j) => d.classList.toggle("on", j === i));
    }, { passive: true });
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
        btn.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * .25}px, ${(e.clientY - b.top - b.height / 2) * .35}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ================= mobile bottom sheet ================= */
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
    { "violation": "SPEEDING",   "fine": 1000, "state": "paid" },
    { "violation": "NO_HELMET",  "fine": 500,  "state": "due" }
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
            setTimeout(typeCmd, 16 + Math.random() * 26);
          } else {
            let oi = 0;
            (function typeOut() {
              if (oi <= sc.out.length) {
                termBody.textContent = sc.cmd + "\n\n" + sc.out.slice(0, oi++);
                setTimeout(typeOut, 5);
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
