/* ============================================================
   VEYRA X OSINT — main.js
   Liquid WebGL background · terminal · reveals · tilt · playground
   ============================================================ */
(() => {
  "use strict";

  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- liquid shader background ---------------- */
  const canvas = document.getElementById("liquid");
  if (canvas && !prefersReduced) initLiquid(canvas);

  function initLiquid(canvas) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true });
    if (!gl) return;

    const vs = `
      attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

    const fs = `
      precision highp float;
      uniform vec2  u_res;
      uniform float u_time;
      uniform vec2  u_mouse;

      // hash + fbm
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

      void main(){
        vec2 uv=(gl_FragCoord.xy*2.-u_res)/min(u_res.x,u_res.y);
        float t=u_time*.06;

        // mouse parallax drift
        vec2 m=u_mouse*.18;

        // flowing liquid field
        vec2 q=vec2(fbm(uv*1.4+t+m), fbm(uv*1.4-t*.7-m));
        vec2 r=vec2(fbm(uv*1.8+q*1.6+vec2(1.7,9.2)+t), fbm(uv*1.8+q*1.6+vec2(8.3,2.8)-t*.6));
        float f=fbm(uv*1.6+r*1.4);

        // palette: mint / blue / violet on near-black
        vec3 c1=vec3(.031,.039,.055);          // base
        vec3 c2=vec3(.37,.95,.76);             // mint
        vec3 c3=vec3(.35,.65,1.);              // blue
        vec3 c4=vec3(.71,.42,1.);              // violet

        vec3 col=mix(c1,c2*.55,clamp(f*f*2.2,0.,1.));
        col=mix(col,c3*.5,clamp(length(q)*.55,0.,1.)*.6);
        col=mix(col,c4*.45,clamp(r.x*r.x*1.1,0.,1.)*.5);

        // vignette + subtle banding shimmer
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

    let start = performance.now();
    (function frame(now) {
      mx += (tx - mx) * .04; my += (ty - my) * .04;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    })(start);
  }

  /* ---------------- nav ---------------- */
  const nav = document.getElementById("nav");
  addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", scrollY > 24);
  }, { passive: true });

  const burger = document.getElementById("burger");
  if (burger) burger.addEventListener("click", () => nav.classList.toggle("open"));
  document.querySelectorAll(".nav-links a").forEach(a =>
    a.addEventListener("click", () => nav.classList.remove("open")));

  /* ---------------- reveals ---------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 70}ms`;
    io.observe(el);
  });

  /* ---------------- 3D tilt cards ---------------- */
  if (!prefersReduced) {
    document.querySelectorAll("[data-tilt]").forEach(card => {
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

  /* ---------------- terminal typing ---------------- */
  const termBody = document.getElementById("term-body");
  if (termBody && !prefersReduced) {
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
    { "violation": "SPEEDING",  "fine": 1000, "state": "paid" },
    { "violation": "NOHelmet", "fine": 500,  "state": "due" }
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

    let si = 0;
    function typeScene() {
      const sc = scenes[si % scenes.length]; si++;
      let ci = 0;
      termBody.textContent = "";
      termBody.classList.add("cursor");

      (function typeCmd() {
        if (ci <= sc.cmd.length) {
          termBody.textContent = sc.cmd.slice(0, ci++);
          setTimeout(typeCmd, 18 + Math.random() * 30);
        } else {
          let oi = 0;
          termBody.textContent = sc.cmd + "\n\n";
          (function typeOut() {
            if (oi <= sc.out.length) {
              termBody.textContent = sc.cmd + "\n\n" + sc.out.slice(0, oi++);
              setTimeout(typeOut, 6);
            } else setTimeout(typeScene, 4200);
          })();
        }
      })();
    }
    typeScene();
  } else if (termBody) {
    termBody.textContent = "$ curl api.veyrax.in/api/v1/rc/MH02BE0001\n\n{ status: ok, masked: true }";
  }

  /* ---------------- stat counters ---------------- */
  const statsEl = document.getElementById("stats");
  if (statsEl) {
    const cio = new IntersectionObserver(en => {
      if (!en[0].isIntersecting) return;
      cio.disconnect();
      statsEl.querySelectorAll("b[data-count]").forEach(b => {
        const target = +b.dataset.count;
        const suffix = b.dataset.suffix || "";
        const t0 = performance.now(), dur = 1400;
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          b.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: .4 });
    cio.observe(statsEl);
  }

  /* ---------------- playground (masked demo) ---------------- */
  const pgRun = document.getElementById("pg-run");
  const pgOut = document.getElementById("pg-out");
  const pgQuota = document.getElementById("pg-quota");
  const pgInput = document.getElementById("pg-input");
  const seg = document.getElementById("pg-service");
  let svc = "rc", quota = 3;

  if (seg) {
    seg.querySelectorAll("button").forEach(b => {
      b.addEventListener("click", () => {
        seg.querySelector(".active")?.classList.remove("active");
        b.classList.add("active");
        svc = b.dataset.svc;
        pgInput.placeholder = svc === "dl" ? "MH1220190001234" : "MH02BE0001";
      });
    });
  }

  function mask(name) {
    if (!name) return name;
    const parts = String(name).split(" ");
    return parts.map(w => w[0] + "*".repeat(Math.max(w.length - 1, 1))).join(" ");
  }

  function fakeResponse() {
    const q = (pgInput?.value || "MH02BE0001").toUpperCase().trim();
    const now = new Date().toISOString().slice(0, 10);
    if (svc === "rc") return {
      status: "ok", requestId: "vx_" + Math.random().toString(36).slice(2, 10),
      data: { regNo: q, owner: mask("Rahul Sharma"), fatherName: mask("Suresh Sharma"),
        vehicle: "MAHINDRA XUV700 AX7", fuel: "DIESEL", class: "LMV-CC",
        regDate: "2021-08-14", insuranceUpto: "2027-08-13", fitnessUpto: "2036-08-13",
        taxUpto: "2036-08-13", masked: true }
    };
    if (svc === "dl") return {
      status: "ok", requestId: "vx_" + Math.random().toString(36).slice(2, 10),
      data: { dlNo: q, name: mask("Priya Kapoor"), dob: "19**-0*-2*",
        validity: "2031-04-02", classes: ["LMV", "MCWG"], status: "ACTIVE", masked: true }
    };
    if (svc === "challan") return {
      status: "ok", requestId: "vx_" + Math.random().toString(36).slice(2, 10),
      vehicleNo: q, pending: 1,
      items: [{ challanNo: "MH****" + q.slice(-4), violation: "OVERSPEED",
        fine: 1000, status: "DUE", date: now }], masked: true
    };
    return {
      status: "ok", requestId: "vx_" + Math.random().toString(36).slice(2, 10),
      data: { regNo: q, permitClass: "National Permit", validUpto: "2027-03-31",
        taxMode: "PAID", masked: true }
    };
  }

  if (pgRun) {
    pgRun.addEventListener("click", () => {
      if (quota <= 0) {
        pgOut.textContent = "⚠ free demo limit reached — get a key to keep querying.";
        return;
      }
      quota--;
      pgQuota.textContent = `${quota} free quer${quota === 1 ? "y" : "ies"} left`;
      pgOut.textContent = "⣾ querying …";
      const spin = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];
      let i = 0;
      const iv = setInterval(() => { pgOut.textContent = spin[i++ % 8] + " querying …"; }, 90);
      setTimeout(() => {
        clearInterval(iv);
        pgOut.textContent = JSON.stringify(fakeResponse(), null, 2);
      }, 900);
    });
    pgInput?.addEventListener("keydown", e => { if (e.key === "Enter") pgRun.click(); });
  }
})();
