#!/usr/bin/env python3
"""VeyraX site page generator — renders all inner pages with shared chrome."""
import os

OUT = os.path.dirname(os.path.abspath(__file__))

NAV = """<nav class="nav" id="nav">
  <div class="nav-inner">
    <a class="logo" href="{b}index.html">
      <span class="logo-word">VEYRA</span>
      <span class="logo-x" aria-label="X"><svg viewBox="0 0 48 48" class="x-svg">
        <line class="x-l1" x1="10" y1="10" x2="38" y2="38"/>
        <line class="x-l2" x1="38" y1="10" x2="10" y2="38"/>
        <circle class="x-orbit" cx="24" cy="24" r="20"/>
      </svg></span>
      <span class="logo-word thin">OSINT</span>
    </a>
    <div class="nav-links">
      <a href="{b}services.html">Services</a>
      <a href="{b}playground.html">Playground</a>
      <a href="{b}docs.html">Docs</a>
      <a href="{b}pricing.html">Pricing</a>
      <a href="{b}about.html">About</a>
    </div>
    <div class="nav-cta">
      <a class="btn-ghost magnetic" href="{b}login.html">Sign in</a>
      <a class="btn-primary magnetic" href="{b}signup.html">Get API key</a>
    </div>
    <button class="burger" id="burger" aria-label="menu">☰</button>
  </div>
</nav>"""

FOOTER = """<footer class="footer">
  <div class="wrap footer-grid">
    <div>
      <a class="logo" href="{b}index.html">
        <span class="logo-word">VEYRA</span>
        <span class="logo-x"><svg viewBox="0 0 48 48" class="x-svg">
          <line class="x-l1" x1="10" y1="10" x2="38" y2="38"/>
          <line class="x-l2" x1="38" y1="10" x2="10" y2="38"/>
          <circle class="x-orbit" cx="24" cy="24" r="20"/>
        </svg></span>
      </a>
      <p class="foot-tag">India's lawful data API.<br />Built by <b>Team Veyra</b>.</p>
    </div>
    <div class="foot-col">
      <h5>Services</h5>
      <a href="{b}services/rc.html">Vehicle RC</a><a href="{b}services/dl.html">Driving Licence</a>
      <a href="{b}services/challan.html">eChallan</a><a href="{b}services/aadhaar.html">Aadhaar Linkage</a>
      <a href="{b}services/permit.html">Permit &amp; Tax</a><a href="{b}services/hpt.html">Hypothecation</a>
    </div>
    <div class="foot-col">
      <h5>Platform</h5>
      <a href="{b}playground.html">Playground</a><a href="{b}docs.html">Documentation</a>
      <a href="{b}pricing.html">Pricing</a><a href="{b}dashboard.html">Dashboard</a><a href="{b}status.html">Status</a>
    </div>
    <div class="foot-col">
      <h5>Company &amp; Legal</h5>
      <a href="{b}about.html">About Team Veyra</a><a href="{b}contact.html">Contact</a>
      <a href="{b}legal/terms.html">Terms</a><a href="{b}legal/privacy.html">Privacy</a><a href="{b}legal/aup.html">Acceptable use</a>
    </div>
  </div>
  <div class="wrap foot-base">
    <span>© <span class="yr">2026</span> Team Veyra · VEYRA X OSINT</span>
    <span class="foot-status"><span class="dot"></span> All systems operational</span>
  </div>
</footer>"""

TABBAR = """<nav class="tabbar" aria-label="mobile">
  <a href="{b}index.html" {ah}><svg viewBox="0 0 24 24"><path d="M3 11 L12 3 L21 11 V21 H15 V15 H9 V21 H3 Z"/></svg>Home</a>
  <a href="{b}services.html" {av}><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 20 H17 M12 18 V20"/></svg>Services</a>
  <a href="{b}playground.html" {ap}><svg viewBox="0 0 24 24"><path d="M8 6 L19 12 L8 18 Z"/></svg>Try</a>
  <a href="{b}docs.html" {ad}><svg viewBox="0 0 24 24"><path d="M6 3 H15 L20 8 V21 H6 Z M15 3 V8 H20 M9 13 H17 M9 17 H14"/></svg>Docs</a>
  <a href="{b}dashboard.html" {aa}><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21 Q4 15 12 15 Q20 15 20 21"/></svg>Account</a>
</nav>
<button class="try-fab" aria-label="open playground">Try the API</button>"""

def page(fname, title, desc, body, active="", sub=False):
    b = "../" if sub else ""
    ah = 'class="active"' if active == "home" else ""
    av = 'class="active"' if active == "services" else ""
    ap = 'class="active"' if active == "playground" else ""
    ad = 'class="active"' if active == "docs" else ""
    aa = 'class="active"' if active == "account" else ""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>{title} — VEYRA X OSINT</title>
<meta name="description" content="{desc}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=general-sans@400,500,600&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="{b}style.css?v=20260921c" />
</head>
<body>

<canvas id="liquid"></canvas>
<div class="glow glow-1" data-parallax="0.22" aria-hidden="true"></div>
<div class="glow glow-2" data-parallax="-0.16" aria-hidden="true"></div>
<div class="grid-floor" data-parallax="0.08" aria-hidden="true"></div>
<div class="noise" aria-hidden="true"></div>

{NAV.format(b=b)}

<main>
{body.format(b=b)}
</main>

{FOOTER.format(b=b)}
{TABBAR.format(b=b, ah=ah, av=av, ap=ap, ad=ad, aa=aa)}

<script src="{b}main.js?v=20260921c"></script>
</body>
</html>"""
    path = os.path.join(OUT, fname)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(html)
    print(f"  + {fname}")

# ---------------------------------------------------------------- services hub
SERVICES_HUB = """
<section class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="{b}index.html">home</a> / services</div>
    <h1 class="hero-title" style="font-size:clamp(44px,7vw,84px);margin:0 0 16px">
      <span class="line reveal">The six</span>
      <span class="line reveal grad">services.</span>
    </h1>
    <p class="hero-sub reveal" style="margin:0">Every service is one GET request with your API key. Masked on free tier, full data on Pro.</p>
  </div>
</section>

<section class="section" style="padding-top:20px">
  <div class="wrap">
    <div class="svc-grid">
      <article class="svc tilt reveal" data-tilt>
        <div class="svc-icon icon-draw"><svg viewBox="0 0 64 64" class="icon"><path pathLength="1" d="M10 38 L16 22 Q18 17 24 17 H40 Q46 17 48 22 L54 38"/><path pathLength="1" d="M8 38 H56 V48 Q56 51 53 51 H48 L45 45 H19 L16 51 H11 Q8 51 8 48 Z"/><circle cx="20" cy="46" r="4.5"/><circle cx="44" cy="46" r="4.5"/><path pathLength="1" class="ic-accent" d="M20 27 H44"/></svg></div>
        <h3>Vehicle RC</h3><p>Owner, vehicle class, fuel, insurance, fitness, tax — the full registration certificate.</p>
        <div class="svc-meta"><code>GET /api/v1/rc/:regno</code></div>
        <a class="svc-link" href="{b}services/rc.html">Open service →</a>
      </article>
      <article class="svc tilt reveal" data-tilt>
        <div class="svc-icon icon-draw"><svg viewBox="0 0 64 64" class="icon"><rect x="9" y="16" width="46" height="32" rx="5"/><circle cx="24" cy="30" r="6"/><path pathLength="1" d="M14 44 Q24 37 34 44"/><path pathLength="1" class="ic-accent" d="M38 26 H52 M38 33 H48 M38 40 H44"/></svg></div>
        <h3>Driving Licence</h3><p>Holder details, validity, classes — plus photo and Form-3 document.</p>
        <div class="svc-meta"><code>GET /api/v1/dl/:dlno</code></div>
        <a class="svc-link" href="{b}services/dl.html">Open service →</a>
      </article>
      <article class="svc tilt reveal" data-tilt>
        <div class="svc-icon icon-draw"><svg viewBox="0 0 64 64" class="icon"><path pathLength="1" d="M18 10 H46 V54 L40 49 L34 54 L28 49 L22 54 L18 51 Z"/><path pathLength="1" class="ic-accent" d="M25 22 H39 M25 30 H39 M25 38 H33"/><circle cx="44" cy="20" r="9" class="ic-badge"/><path pathLength="1" class="ic-badge-mark" d="M40.5 20 L43 22.5 L47.5 17.5"/></svg></div>
        <h3>eChallan</h3><p>Pending challans, violations, fines and court cases per vehicle.</p>
        <div class="svc-meta"><code>GET /api/v1/challan/:vehicleno</code></div>
        <a class="svc-link" href="{b}services/challan.html">Open service →</a>
      </article>
      <article class="svc tilt reveal" data-tilt>
        <div class="svc-icon icon-draw"><svg viewBox="0 0 64 64" class="icon"><path pathLength="1" d="M32 9 L51 16 V32 Q51 46 32 55 Q13 46 13 32 V16 Z"/><path pathLength="1" class="ic-accent" d="M24 31 L30 37 L41 24"/><path pathLength="1" d="M32 9 V55" class="ic-faint"/></svg></div>
        <h3>Aadhaar Linkage</h3><p>Aadhaar seeding status and lawful eKYC verification per registration.</p>
        <div class="svc-meta"><code>GET /api/v1/aadhaar/:regno</code></div>
        <a class="svc-link" href="{b}services/aadhaar.html">Open service →</a>
      </article>
      <article class="svc tilt reveal" data-tilt>
        <div class="svc-icon icon-draw"><svg viewBox="0 0 64 64" class="icon"><path pathLength="1" d="M10 24 L32 12 L54 24"/><path pathLength="1" d="M15 24 V44 M25 24 V44 M39 24 V44 M49 24 V44"/><path pathLength="1" d="M9 44 H55 V50 H9 Z"/><path pathLength="1" class="ic-accent" d="M32 12 V44"/></svg></div>
        <h3>Hypothecation</h3><p>Active bank loan / financier tied to the vehicle.</p>
        <div class="svc-meta"><code>GET /api/v1/hpt/:regno</code></div>
        <a class="svc-link" href="{b}services/hpt.html">Open service →</a>
      </article>
      <article class="svc tilt reveal" data-tilt>
        <div class="svc-icon icon-draw"><svg viewBox="0 0 64 64" class="icon"><path pathLength="1" d="M16 10 H42 L52 20 V54 H16 Z"/><path pathLength="1" d="M42 10 V20 H52"/><path pathLength="1" class="ic-accent" d="M24 30 H44 M24 38 H44 M24 46 H36"/><circle cx="44" cy="44" r="8" class="ic-badge"/><path pathLength="1" class="ic-badge-mark" d="M40.5 44 L43 46.5 L47.5 41.5"/></svg></div>
        <h3>Permit &amp; Tax</h3><p>Permit validity, road-tax breakup, state / RTO master data.</p>
        <div class="svc-meta"><code>GET /api/v1/permit/:regno</code></div>
        <a class="svc-link" href="{b}services/permit.html">Open service →</a>
      </article>
    </div>
  </div>
</section>"""

# ---------------------------------------------------------------- service detail template
def service_page(num, name, tagline, endpoint, params, fields, sample):
    icon_map = {
        "01": '<svg viewBox="0 0 64 64" class="icon"><path pathLength="1" d="M10 38 L16 22 Q18 17 24 17 H40 Q46 17 48 22 L54 38"/><path pathLength="1" d="M8 38 H56 V48 Q56 51 53 51 H48 L45 45 H19 L16 51 H11 Q8 51 8 48 Z"/><circle cx="20" cy="46" r="4.5"/><circle cx="44" cy="46" r="4.5"/><path pathLength="1" class="ic-accent" d="M20 27 H44"/></svg>',
        "02": '<svg viewBox="0 0 64 64" class="icon"><rect x="9" y="16" width="46" height="32" rx="5"/><circle cx="24" cy="30" r="6"/><path pathLength="1" d="M14 44 Q24 37 34 44"/><path pathLength="1" class="ic-accent" d="M38 26 H52 M38 33 H48 M38 40 H44"/></svg>',
        "03": '<svg viewBox="0 0 64 64" class="icon"><path pathLength="1" d="M18 10 H46 V54 L40 49 L34 54 L28 49 L22 54 L18 51 Z"/><path pathLength="1" class="ic-accent" d="M25 22 H39 M25 30 H39 M25 38 H33"/><circle cx="44" cy="20" r="9" class="ic-badge"/><path pathLength="1" class="ic-badge-mark" d="M40.5 20 L43 22.5 L47.5 17.5"/></svg>',
        "04": '<svg viewBox="0 0 64 64" class="icon"><path pathLength="1" d="M32 9 L51 16 V32 Q51 46 32 55 Q13 46 13 32 V16 Z"/><path pathLength="1" class="ic-accent" d="M24 31 L30 37 L41 24"/><path pathLength="1" d="M32 9 V55" class="ic-faint"/></svg>',
        "05": '<svg viewBox="0 0 64 64" class="icon"><path pathLength="1" d="M10 24 L32 12 L54 24"/><path pathLength="1" d="M15 24 V44 M25 24 V44 M39 24 V44 M49 24 V44"/><path pathLength="1" d="M9 44 H55 V50 H9 Z"/><path pathLength="1" class="ic-accent" d="M32 12 V44"/></svg>',
        "06": '<svg viewBox="0 0 64 64" class="icon"><path pathLength="1" d="M16 10 H42 L52 20 V54 H16 Z"/><path pathLength="1" d="M42 10 V20 H52"/><path pathLength="1" class="ic-accent" d="M24 30 H44 M24 38 H44 M24 46 H36"/><circle cx="44" cy="44" r="8" class="ic-badge"/><path pathLength="1" class="ic-badge-mark" d="M40.5 44 L43 46.5 L47.5 41.5"/></svg>',
    }
    esc = lambda s: s.replace("{", "{{").replace("}", "}}") if s else s
    return f"""
<section class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="{{b}}index.html">home</a> / <a href="{{b}}services.html">services</a> / {name.lower()}</div>
    <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
      <div class="deck-ic icon-draw reveal">{icon_map[num]}</div>
      <div>
        <h1 class="hero-title reveal" style="font-size:clamp(40px,6vw,72px);margin:0">{name}</h1>
        <p class="hero-sub reveal" style="margin:6px 0 0">{tagline}</p>
      </div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:30px">
  <div class="wrap" style="max-width:1000px">
    <div class="doc-block reveal">
      <h3>Endpoint</h3>
      <div class="code-win">GET {endpoint}
Header: X-API-Key: vx_live_••••••••</div>
      <table class="param-table">
        <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
        {esc(params)}
      </table>
    </div>

    <div class="doc-block reveal">
      <h3>Response fields</h3>
      <div class="fields" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">{fields}</div>
    </div>

    <div class="doc-block reveal">
      <h3>Example response</h3>
      <div class="code-win">{esc(sample)}</div>
      <p style="margin-top:12px;color:var(--txt-dim);font-size:13.5px">Free-tier responses are masked like above. Pro keys receive full values.</p>
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px">
      <a class="btn-primary btn-lg magnetic" href="{{b}}playground.html">Try it masked</a>
      <a class="btn-ghost btn-lg magnetic" href="{{b}}signup.html">Get a key</a>
      <a class="btn-ghost btn-lg magnetic" href="{{b}}docs.html">Full docs</a>
    </div>
  </div>
</section>"""

RC_PARAMS = """<tr><td><code>regno</code></td><td>string</td><td>Vehicle registration number, e.g. MH02BE0001</td></tr>"""
RC_FIELDS = """<code>owner</code> <code>fatherName</code> <code>vehicle</code> <code>class</code> <code>fuel</code> <code>regDate</code> <code>insuranceUpto</code> <code>fitnessUpto</code> <code>taxUpto</code> <code>puccUpto</code>"""
RC_SAMPLE = """{
  "status": "ok",
  "requestId": "vx_9f2ka81c",
  "data": {
    "regNo": "MH02BE0001",
    "owner": "R****h S****a",
    "fatherName": "S****h S****a",
    "vehicle": "MAHINDRA XUV700 AX7",
    "class": "LMV-CC",
    "fuel": "DIESEL",
    "regDate": "2021-08-14",
    "insuranceUpto": "2027-08-13",
    "fitnessUpto": "2036-08-13",
    "taxUpto": "2036-08-13",
    "masked": true
  }
}"""

DL_PARAMS = """<tr><td><code>dlno</code></td><td>string</td><td>Driving licence number</td></tr>
<tr><td><code>dob</code></td><td>string</td><td>Date of birth (YYYY-MM-DD) — required for photo / Form-3</td></tr>"""
DL_FIELDS = """<code>name</code> <code>dob</code> <code>validity</code> <code>classes</code> <code>status</code> <code>photo</code> <code>form3Pdf</code>"""
DL_SAMPLE = """{
  "status": "ok",
  "requestId": "vx_7d01mma2",
  "data": {
    "dlNo": "MH1220190001234",
    "name": "P****a K***r",
    "validity": "2031-04-02",
    "classes": ["LMV", "MCWG"],
    "status": "ACTIVE",
    "photo": "masked(base64)",
    "masked": true
  }
}"""

CHALLAN_PARAMS = """<tr><td><code>vehicleno</code></td><td>string</td><td>Vehicle registration number</td></tr>"""
CHALLAN_FIELDS = """<code>challanNo</code> <code>violation</code> <code>fine</code> <code>status</code> <code>date</code> <code>court</code>"""
CHALLAN_SAMPLE = """{
  "status": "ok",
  "requestId": "vx_11ke93jd",
  "vehicleNo": "MH12QT1122",
  "pending": 2,
  "items": [
    { "challanNo": "MH****1122", "violation": "SPEEDING",
      "fine": 1000, "status": "PAID", "date": "2026-07-02" },
    { "challanNo": "MH****1187", "violation": "NO_HELMET",
      "fine": 500, "status": "DUE", "date": "2026-08-19" }
  ],
  "masked": true
}"""

AADHAAR_PARAMS = """<tr><td><code>regno</code></td><td>string</td><td>Vehicle registration number</td></tr>"""
AADHAAR_FIELDS = """<code>aadhaarSeeded</code> <code>ekycStatus</code> <code>lastUpdated</code>"""
AADHAAR_SAMPLE = """{
  "status": "ok",
  "requestId": "vx_5m0aqq73",
  "data": {
    "regNo": "MH02BE0001",
    "aadhaarSeeded": true,
    "ekycStatus": "COMPLETED",
    "lastUpdated": "2025-11-30",
    "masked": true
  }
}"""

HPT_PARAMS = """<tr><td><code>regno</code></td><td>string</td><td>Vehicle registration number</td></tr>"""
HPT_FIELDS = """<code>hypothecated</code> <code>financier</code> <code>branch</code> <code>startDate</code> <code>endDate</code>"""
HPT_SAMPLE = """{
  "status": "ok",
  "requestId": "vx_2p8zzq10",
  "data": {
    "regNo": "MH02BE0001",
    "hypothecated": true,
    "financier": "H**** Bank",
    "startDate": "2021-08-01",
    "endDate": "2026-08-01",
    "masked": true
  }
}"""

PERMIT_PARAMS = """<tr><td><code>regno</code></td><td>string</td><td>Vehicle registration number</td></tr>"""
PERMIT_FIELDS = """<code>permitClass</code> <code>validUpto</code> <code>taxMode</code> <code>taxPaidUpto</code> <code>stateCode</code>"""
PERMIT_SAMPLE = """{
  "status": "ok",
  "requestId": "vx_8cv31lla",
  "data": {
    "regNo": "MH02BE0001",
    "permitClass": "National Permit",
    "validUpto": "2027-03-31",
    "taxMode": "PAID",
    "taxPaidUpto": "2027-03-31",
    "masked": true
  }
}"""

# ---------------------------------------------------------------- playground
PLAYGROUND = """
<section class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="{b}index.html">home</a> / playground</div>
    <h1 class="hero-title reveal" style="font-size:clamp(44px,7vw,84px);margin:0 0 16px">Play<span class="grad">ground.</span></h1>
    <p class="hero-sub reveal" style="margin:0">3 free masked queries per visit — no signup. Turnstile-protected, rate-limited, harmless.</p>
  </div>
</section>

<section class="section" style="padding-top:20px">
  <div class="wrap" style="max-width:900px">
    <div class="pg glass-border reveal">
      <div class="pg-controls">
        <div class="pg-field">
          <label>Service</label>
          <div class="seg" id="pg-service">
            <button class="active" data-svc="rc">RC</button>
            <button data-svc="dl">DL</button>
            <button data-svc="challan">Challan</button>
            <button data-svc="permit">Permit</button>
          </div>
        </div>
        <div class="pg-field">
          <label>Query</label>
          <input id="pg-input" type="text" placeholder="MH02BE0001" spellcheck="false" />
        </div>
        <button class="btn-primary btn-lg magnetic" id="pg-run">Run query</button>
        <div class="pg-quota" id="pg-quota">3 free queries left</div>
      </div>
      <pre class="pg-out" id="pg-out">// response appears here — try "MH02BE0001"</pre>
      <p class="pg-note"><svg viewBox="0 0 16 16" class="mini-ic"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7 V5 a2.5 2.5 0 0 1 5 0 V7"/></svg> Masked output · Turnstile protected · No signup</p>
    </div>
  </div>
</section>"""

# ---------------------------------------------------------------- docs
DOCS = """
<section class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="{b}index.html">home</a> / docs</div>
    <h1 class="hero-title reveal" style="font-size:clamp(44px,7vw,84px);margin:0 0 16px">Docu<span class="grad">mentation.</span></h1>
    <p class="hero-sub reveal" style="margin:0">Everything you need to integrate — auth, endpoints, errors, limits.</p>
  </div>
</section>

<section class="section" style="padding-top:20px">
  <div class="wrap docs-layout">
    <nav class="docs-nav reveal">
      <a href="#quickstart" class="on">Quickstart</a>
      <a href="#auth">Authentication</a>
      <a href="#endpoints">Endpoints</a>
      <a href="#masking">Masking &amp; tiers</a>
      <a href="#errors">Errors</a>
      <a href="#limits">Rate limits</a>
      <a href="#sdks">Code samples</a>
    </nav>
    <div>
      <div class="doc-block reveal" id="quickstart">
        <h3>Quickstart</h3>
        <p style="color:var(--txt-dim)">Get your key from the dashboard, then make your first call:</p>
        <div class="code-win">curl https://api.veyrax.in/api/v1/rc/MH02BE0001 \\
  -H "X-API-Key: vx_live_yourkeyhere"</div>
      </div>
      <div class="doc-block reveal" id="auth">
        <h3>Authentication</h3>
        <p style="color:var(--txt-dim)">All requests need the <code style="color:var(--acc)">X-API-Key</code> header. Keys are scoped, revocable and shown once at creation. Keep them server-side — never ship keys in frontend code.</p>
      </div>
      <div class="doc-block reveal" id="endpoints">
        <h3>Endpoints</h3>
        <table class="param-table">
          <tr><th>Route</th><th>Service</th><th>Description</th></tr>
          <tr><td><code>/api/v1/rc/:regno</code></td><td>RC</td><td>Full registration certificate</td></tr>
          <tr><td><code>/api/v1/dl/:dlno</code></td><td>DL</td><td>Licence details</td></tr>
          <tr><td><code>/api/v1/dl-img/:appl/:dob</code></td><td>DL</td><td>Licence holder photo (base64)</td></tr>
          <tr><td><code>/api/v1/dl-form3/:appl/:dob</code></td><td>DL</td><td>Form 3 PDF (base64)</td></tr>
          <tr><td><code>/api/v1/challan/:vehicleno</code></td><td>eChallan</td><td>Pending challans</td></tr>
          <tr><td><code>/api/v1/aadhaar/:regno</code></td><td>Aadhaar</td><td>Seeding status</td></tr>
          <tr><td><code>/api/v1/hpt/:regno</code></td><td>HPT</td><td>Loan / financier</td></tr>
          <tr><td><code>/api/v1/permit/:regno</code></td><td>Permit</td><td>Permit + tax</td></tr>
          <tr><td><code>/api/v1/tax/:regno</code></td><td>Tax</td><td>Tax breakup</td></tr>
          <tr><td><code>/api/v1/states</code></td><td>Master</td><td>State list</td></tr>
          <tr><td><code>/api/v1/rtos/:code</code></td><td>Master</td><td>RTOs for a state</td></tr>
        </table>
      </div>
      <div class="doc-block reveal" id="masking">
        <h3>Masking &amp; tiers</h3>
        <p style="color:var(--txt-dim)">Trial keys receive masked values (<code style="color:var(--acc)">R****h</code>). Pro keys receive full responses. Masking exists so captured free responses are worthless to scrapers.</p>
      </div>
      <div class="doc-block reveal" id="errors">
        <h3>Errors</h3>
        <table class="param-table">
          <tr><th>Code</th><th>Meaning</th></tr>
          <tr><td><code>400</code></td><td>Bad query — check parameter format</td></tr>
          <tr><td><code>401</code></td><td>Missing or invalid API key</td></tr>
          <tr><td><code>403</code></td><td>Key lacks scope for this service</td></tr>
          <tr><td><code>429</code></td><td>Rate limit exceeded</td></tr>
          <tr><td><code>502</code></td><td>Upstream unavailable — retry with backoff</td></tr>
        </table>
      </div>
      <div class="doc-block reveal" id="limits">
        <h3>Rate limits</h3>
        <p style="color:var(--txt-dim)">Trial: 10 req/day · Pro: 5,000 req/month burst 10/s · Enterprise: custom. Every response carries a <code style="color:var(--acc)">requestId</code> for support.</p>
      </div>
      <div class="doc-block reveal" id="sdks">
        <h3>Code samples</h3>
        <div class="code-win"># Python
import requests
r = requests.get(
    "https://api.veyrax.in/api/v1/rc/MH02BE0001",
    headers={{"X-API-Key": "vx_live_..."}})
print(r.json())</div>
        <div class="code-win">// JavaScript
const r = await fetch(
  "https://api.veyrax.in/api/v1/rc/MH02BE0001",
  {{ headers: {{ "X-API-Key": "vx_live_..." }} }});
console.log(await r.json());</div>
      </div>
    </div>
  </div>
</section>"""

# ---------------------------------------------------------------- pricing
PRICING = """
<section class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="{b}index.html">home</a> / pricing</div>
    <h1 class="hero-title reveal" style="font-size:clamp(44px,7vw,84px);margin:0 0 16px">Simple <span class="grad">pricing.</span></h1>
    <p class="hero-sub reveal" style="margin:0">UPI, cards and netbanking via Razorpay. Cancel anytime. GST invoice included.</p>
  </div>
</section>

<section class="section" style="padding-top:20px">
  <div class="wrap">
    <div class="price-grid">
      <div class="price reveal" data-parallax="0.04">
        <h3>Trial</h3>
        <div class="amount">₹0<span>/forever</span></div>
        <ul><li>10 masked queries / day</li><li>All 6 services</li><li>Community support</li></ul>
        <a class="btn-ghost btn-block magnetic" href="{b}signup.html">Start free</a>
      </div>
      <div class="price price-featured glass-border reveal" data-parallax="0.02">
        <span class="price-tag">MOST POPULAR</span>
        <h3>Pro</h3>
        <div class="amount">₹299<span>/month</span></div>
        <ul><li><b>5,000</b> full queries / month</li><li>Unmasked responses</li><li>Priority latency + cache</li><li>Usage analytics &amp; logs</li><li>Email support</li></ul>
        <a class="btn-primary btn-block magnetic" href="{b}signup.html">Get Pro</a>
      </div>
      <div class="price reveal" data-parallax="0.04">
        <h3>Enterprise</h3>
        <div class="amount custom">Let's talk</div>
        <ul><li>Unlimited scale</li><li>SLA &amp; dedicated infra</li><li>Custom endpoints</li><li>Bulk export formats</li></ul>
        <a class="btn-ghost btn-block magnetic" href="{b}contact.html">Contact us</a>
      </div>
    </div>
    <p style="text-align:center;color:var(--txt-dim);margin-top:28px;font-size:13.5px">All plans include audit logging and the full endpoint set. Prices exclude 18% GST.</p>
  </div>
</section>"""

# ---------------------------------------------------------------- auth
LOGIN = """
<div class="auth-wrap">
  <div class="auth-card glass-border reveal">
    <h2>Welcome back.</h2>
    <p class="sub">Sign in to manage keys, usage and billing.</p>
    <form onsubmit="event.preventDefault();location.href='{b}dashboard.html'">
      <div class="field"><label>EMAIL</label><input type="email" placeholder="you@company.in" required /></div>
      <div class="field"><label>PASSWORD</label><input type="password" placeholder="••••••••" required /></div>
      <button class="btn-primary btn-block" type="submit">Sign in</button>
    </form>
    <p class="auth-alt">No account? <a href="{b}signup.html">Create one free</a></p>
  </div>
</div>"""

SIGNUP = """
<div class="auth-wrap">
  <div class="auth-card glass-border reveal">
    <h2>Create your key.</h2>
    <p class="sub">Free trial — 10 masked queries a day, all 6 services.</p>
    <form onsubmit="event.preventDefault();location.href='{b}dashboard.html'">
      <div class="field"><label>NAME</label><input type="text" placeholder="Your name" required /></div>
      <div class="field"><label>EMAIL</label><input type="email" placeholder="you@company.in" required /></div>
      <div class="field"><label>PASSWORD</label><input type="password" placeholder="min. 8 characters" required minlength="8" /></div>
      <button class="btn-primary btn-block" type="submit">Create account</button>
      <p style="font-size:11.5px;color:var(--txt-dim);margin-top:12px;text-align:center">By continuing you accept the <a href="{b}legal/terms.html" style="color:var(--acc)">Terms</a> and <a href="{b}legal/aup.html" style="color:var(--acc)">Acceptable Use Policy</a>.</p>
    </form>
    <p class="auth-alt">Already registered? <a href="{b}login.html">Sign in</a></p>
  </div>
</div>"""

# ---------------------------------------------------------------- dashboard
DASHBOARD = """
<section class="page-hero" style="padding-bottom:10px">
  <div class="wrap">
    <div class="crumbs"><a href="{b}index.html">home</a> / dashboard</div>
    <h1 class="hero-title reveal" style="font-size:clamp(36px,5.5vw,64px);margin:0">Dash<span class="grad">board.</span></h1>
  </div>
</section>

<section class="section" style="padding-top:26px">
  <div class="wrap dash-layout">
    <nav class="dash-side reveal">
      <a class="on" href="#overview"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="10" width="7" height="11" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>Overview</a>
      <a href="#keys"><svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12 L20 3 M16 7 L19 10"/></svg>API keys</a>
      <a href="#usage"><svg viewBox="0 0 24 24"><path d="M4 20 V10 M10 20 V4 M16 20 V13 M22 20 H2"/></svg>Usage</a>
      <a href="#logs"><svg viewBox="0 0 24 24"><path d="M4 5 H20 M4 12 H20 M4 19 H14"/></svg>Logs</a>
      <a href="{b}pricing.html"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10 H21 M7 15 H11"/></svg>Billing</a>
      <a href="#settings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2 V6 M12 18 V22 M2 12 H6 M18 12 H22 M5 5 L8 8 M16 16 L19 19 M19 5 L16 8 M8 16 L5 19"/></svg>Settings</a>
    </nav>

    <div>
      <div class="kpi-row" id="overview">
        <div class="kpi reveal"><b>1,284</b><span>queries this month</span></div>
        <div class="kpi reveal"><b>2</b><span>active keys</span></div>
        <div class="kpi reveal"><b style="color:var(--acc)">Pro</b><span>current plan</span></div>
      </div>

      <div class="doc-block reveal" id="keys">
        <h3>API keys</h3>
        <div class="key-row">
          <span class="key-id">vx_live_8f3e…a12c</span>
          <span class="key-status ok">ACTIVE</span>
          <span style="color:var(--txt-dim);font-size:12.5px">created 12 Aug 2026 · expires 12 Sep 2026</span>
          <div class="key-actions">
            <button class="btn-ghost" style="padding:7px 14px;font-size:12.5px">Rotate</button>
            <button class="btn-ghost" style="padding:7px 14px;font-size:12.5px;color:var(--danger);border-color:rgba(255,84,112,.4)">Revoke</button>
          </div>
        </div>
        <div class="key-row">
          <span class="key-id">vx_test_11xk…93jd</span>
          <span class="key-status exp">EXPIRED</span>
          <span style="color:var(--txt-dim);font-size:12.5px">trial key · expired 02 Sep 2026</span>
          <div class="key-actions">
            <button class="btn-primary" style="padding:7px 14px;font-size:12.5px">Renew</button>
          </div>
        </div>
        <button class="btn-primary magnetic" style="margin-top:8px">+ Create new key</button>
      </div>

      <div class="doc-block reveal" id="usage">
        <h3>Usage</h3>
        <div class="code-win" style="min-height:130px">queries/day
  ▁▂▃▂▄▅▄▆▅▇▆█▇▅▄▅▆▇█▇▆▅▄▃▂▃▄▅▆▇
  1     7    14    21    28   (Sep)</div>
      </div>

      <div class="doc-block reveal" id="logs">
        <h3>Recent requests</h3>
        <table class="log-table">
          <tr><td>12:04:22</td><td>GET /api/v1/rc/MH02BE0001</td><td>200 · 182ms</td></tr>
          <tr><td>12:04:02</td><td>GET /api/v1/challan/MH12QT1122</td><td>200 · 205ms</td></tr>
          <tr><td>11:58:47</td><td>GET /api/v1/dl/MH1220190001234</td><td>200 · 173ms</td></tr>
          <tr><td>11:57:10</td><td>GET /api/v1/hpt/MH02BE0001</td><td>403 · 4ms</td></tr>
          <tr><td>11:55:31</td><td>GET /api/v1/permit/DL01AB1234</td><td>200 · 198ms</td></tr>
        </table>
      </div>
    </div>
  </div>
</section>"""

# ---------------------------------------------------------------- about / contact / status
ABOUT = """
<section class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="{b}index.html">home</a> / about</div>
    <h1 class="hero-title reveal" style="font-size:clamp(44px,7vw,84px);margin:0 0 16px">Team <span class="grad">Veyra.</span></h1>
    <p class="hero-sub reveal" style="margin:0">We build lawful data infrastructure for India — fast, auditable, and honest about what it will never be used for.</p>
  </div>
</section>

<section class="section" style="padding-top:20px">
  <div class="wrap" style="max-width:900px">
    <div class="comp-grid">
      <div class="comp reveal"><h4>Why VeyraX exists</h4><p>Vehicle and licence data in India lives behind dated portals. We put the same public-records intelligence behind a clean, fast, honest API for professionals.</p></div>
      <div class="comp reveal"><h4>What we will never do</h4><p>Sell to stalkers. Host scraped dumps. Hide our audit trail. If a use-case feels wrong, we block it first and ask later.</p></div>
      <div class="comp reveal"><h4>How it works inside</h4><p>Requests hit Cloudflare Workers, are rate-limited per key, proxied through Indian infrastructure and cached transiently. No PII is stored permanently.</p></div>
      <div class="comp reveal"><h4>Where we're going</h4><p>More services, sub-100ms medians, an official partner programme for verified businesses, and a public transparency report every quarter.</p></div>
    </div>
  </div>
</section>"""

CONTACT = """
<section class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="{b}index.html">home</a> / contact</div>
    <h1 class="hero-title reveal" style="font-size:clamp(44px,7vw,84px);margin:0 0 16px">Talk to <span class="grad">us.</span></h1>
  </div>
</section>

<section class="section" style="padding-top:20px">
  <div class="wrap" style="max-width:640px">
    <div class="doc-block reveal">
      <form onsubmit="event.preventDefault();this.innerHTML='<p style=color:var(--acc)>Thanks — we usually reply within a day.</p>'">
        <div class="field"><label>NAME</label><input type="text" placeholder="Your name" required /></div>
        <div class="field"><label>EMAIL</label><input type="email" placeholder="you@company.in" required /></div>
        <div class="field"><label>TOPIC</label>
          <div class="seg" style="display:flex">
            <button type="button" class="active">Sales</button>
            <button type="button">Support</button>
            <button type="button">Abuse report</button>
          </div>
        </div>
        <div class="field"><label>MESSAGE</label><input type="text" placeholder="Tell us what you need…" style="height:110px" required /></div>
        <button class="btn-primary btn-block" type="submit">Send message</button>
      </form>
    </div>
  </div>
</section>"""

STATUS = """
<section class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="{b}index.html">home</a> / status</div>
    <h1 class="hero-title reveal" style="font-size:clamp(44px,7vw,84px);margin:0 0 16px">System <span class="grad">status.</span></h1>
  </div>
</section>

<section class="section" style="padding-top:10px">
  <div class="wrap" style="max-width:820px">
    <div class="doc-block reveal">
      <div class="key-row" style="border-color:rgba(94,242,195,.4)">
        <span class="key-status ok">OPERATIONAL</span>
        <span style="font-family:var(--font-display);font-size:19px">API Gateway (Workers)</span>
        <span style="margin-left:auto;color:var(--txt-dim);font-size:12.5px">99.98% / 90d</span>
      </div>
      <div class="key-row" style="border-color:rgba(94,242,195,.4)">
        <span class="key-status ok">OPERATIONAL</span>
        <span style="font-family:var(--font-display);font-size:19px">Upstream proxy (IN)</span>
        <span style="margin-left:auto;color:var(--txt-dim);font-size:12.5px">99.95% / 90d</span>
      </div>
      <div class="key-row">
        <span class="key-status ok">OPERATIONAL</span>
        <span style="font-family:var(--font-display);font-size:19px">Dashboard &amp; billing</span>
        <span style="margin-left:auto;color:var(--txt-dim);font-size:12.5px">100% / 90d</span>
      </div>
      <div class="key-row">
        <span class="key-status ok">OPERATIONAL</span>
        <span style="font-family:var(--font-display);font-size:19px">Playground</span>
        <span style="margin-left:auto;color:var(--txt-dim);font-size:12.5px">100% / 90d</span>
      </div>
    </div>
    <p style="color:var(--txt-dim);font-size:13px;text-align:center">Incidents and maintenance are announced here and on the dashboard.</p>
  </div>
</section>"""

# ---------------------------------------------------------------- legal
def legal(title, body):
    return f"""
<section class="page-hero">
  <div class="wrap">
    <div class="crumbs"><a href="{{b}}index.html">home</a> / <a href="{{b}}legal/terms.html">legal</a> / {title.lower()}</div>
    <h1 class="hero-title reveal" style="font-size:clamp(38px,6vw,64px);margin:0 0 16px">{title}</h1>
    <p class="hero-sub reveal" style="margin:0">Last updated: 21 September 2026</p>
  </div>
</section>
<section class="section" style="padding-top:20px">
  <div class="wrap" style="max-width:820px">{body}</div>
</section>"""

TERMS = legal("Terms of Service", """
<div class="doc-block reveal"><h3>1. The service</h3><p style="color:var(--txt-dim)">VeyraX provides programmatic access to publicly-sourced vehicle, licence and related records via a REST API, subject to these terms and the Acceptable Use Policy.</p></div>
<div class="doc-block reveal"><h3>2. Your account</h3><p style="color:var(--txt-dim)">You are responsible for your keys and all activity under them. Keys are personal to your account and must not be shared, resold or embedded in public client code.</p></div>
<div class="doc-block reveal"><h3>3. Acceptable use</h3><p style="color:var(--txt-dim)">Use must comply with the Acceptable Use Policy. Prohibited uses include stalking, harassment, unlawful surveillance and resale of raw personal data. We log every query with a request ID.</p></div>
<div class="doc-block reveal"><h3>4. Billing</h3><p style="color:var(--txt-dim)">Paid plans renew monthly via Razorpay until cancelled. Fees are exclusive of GST. Refunds follow the policy published at checkout.</p></div>
<div class="doc-block reveal"><h3>5. Availability &amp; liability</h3><p style="color:var(--txt-dim)">The service is provided \"as is\" with a 99.9% uptime target on Pro. Upstream data may be delayed or incorrect; verify critical decisions independently. Our aggregate liability is capped at fees paid in the prior 3 months.</p></div>
<div class="doc-block reveal"><h3>6. Termination</h3><p style="color:var(--txt-dim)">We may suspend or terminate keys that violate these terms or Indian law, and preserve logs where legally required.</p></div>
""")

PRIVACY = legal("Privacy Policy", """
<div class="doc-block reveal"><h3>What we collect</h3><p style="color:var(--txt-dim)">Account email, hashed passwords, API key hashes, request metadata (endpoint, timestamp, latency, status) and payment references from Razorpay. We never see or store your card details.</p></div>
<div class="doc-block reveal"><h3>What we don't collect</h3><p style="color:var(--txt-dim)">We do not permanently store response payloads containing personal data. Cache entries are transient and purged on short TTLs. Free playground queries are not linked to identities.</p></div>
<div class="doc-block reveal"><h3>Why</h3><p style="color:var(--txt-dim)">To operate, bill, secure and improve the service; to prevent abuse; and to comply with lawful requests from Indian authorities under applicable law including the DPDP Act.</p></div>
<div class="doc-block reveal"><h3>Your rights</h3><p style="color:var(--txt-dim)">Request access, correction or deletion of your account data at any time via the contact form. Logs tied to your key can be exported on request for Pro plans.</p></div>
""")

AUP = legal("Acceptable Use Policy", """
<div class="doc-block reveal"><h3>Allowed</h3><p style="color:var(--txt-dim)">KYC and onboarding verification · used-vehicle due diligence · insurance and lending fraud checks · lawful investigations by licensed professionals · journalistic research with editorial oversight.</p></div>
<div class="doc-block reveal"><h3>Strictly prohibited</h3><p style="color:var(--txt-dim)">Stalking, tracking or harassment of individuals · doxxing or public shaming · scraping and reselling raw responses · bulk enumeration of registration numbers · any use violating Indian law.</p></div>
<div class="doc-block reveal"><h3>Enforcement</h3><p style="color:var(--txt-dim)">Every response carries a watermarking request ID. Violating keys are revoked immediately and the account is banned. Where legally required, evidence is preserved and shared with authorities.</p></div>
<div class="doc-block reveal"><h3>Reporting abuse</h3><p style="color:var(--txt-dim)">If you believe VeyraX data has been misused, report it via the contact form with the subject \"Abuse\". We treat reports as priority one.</p></div>
""")

# ---------------------------------------------------------------- 404
NOTFOUND = """
<div class="auth-wrap" style="min-height:100svh">
  <div style="text-align:center">
    <h1 class="hero-title" style="font-size:clamp(80px,18vw,180px);margin:0"><span class="grad">404</span></h1>
    <p class="hero-sub" style="margin:0 auto 30px">This record doesn't exist. Unlike our API responses.</p>
    <a class="btn-primary btn-lg magnetic" href="{b}index.html">Back home</a>
  </div>
</div>"""

# ---------------------------------------------------------------- build all
print("Building VeyraX pages…")
page("services.html", "Services", "All six data services — RC, DL, challan, Aadhaar, permit, hypothecation.", SERVICES_HUB, active="services")
page("services/rc.html", "Vehicle RC API", "Full registration certificate via one GET.", service_page("01", "Vehicle RC", "The complete registration certificate — owner to tax validity.", "https://api.veyrax.in/api/v1/rc/:regno", RC_PARAMS, RC_FIELDS, RC_SAMPLE), sub=True)
page("services/dl.html", "Driving Licence API", "Licence details, photo and Form-3 document.", service_page("02", "Driving Licence", "Holder identity, validity, classes — plus photo &amp; Form-3.", "https://api.veyrax.in/api/v1/dl/:dlno", DL_PARAMS, DL_FIELDS, DL_SAMPLE), sub=True)
page("services/challan.html", "eChallan API", "Pending traffic challans and violations.", service_page("03", "eChallan", "Pending challans, fines, court cases — per vehicle.", "https://api.veyrax.in/api/v1/challan/:vehicleno", CHALLAN_PARAMS, CHALLAN_FIELDS, CHALLAN_SAMPLE), sub=True)
page("services/aadhaar.html", "Aadhaar Linkage API", "Aadhaar seeding status and eKYC.", service_page("04", "Aadhaar Linkage", "Lawful Aadhaar seeding status per registration.", "https://api.veyrax.in/api/v1/aadhaar/:regno", AADHAAR_PARAMS, AADHAAR_FIELDS, AADHAAR_SAMPLE), sub=True)
page("services/hpt.html", "Hypothecation API", "Bank loan / financier on a vehicle.", service_page("05", "Hypothecation", "The lien on the vehicle — before you buy.", "https://api.veyrax.in/api/v1/hpt/:regno", HPT_PARAMS, HPT_FIELDS, HPT_SAMPLE), sub=True)
page("services/permit.html", "Permit & Tax API", "Permit validity and road-tax breakup.", service_page("06", "Permit &amp; Tax", "Permits, tax breakup and RTO master data.", "https://api.veyrax.in/api/v1/permit/:regno", PERMIT_PARAMS, PERMIT_FIELDS, PERMIT_SAMPLE), sub=True)
page("playground.html", "Playground", "Try the API masked — no signup.", PLAYGROUND, active="playground")
page("docs.html", "Documentation", "Auth, endpoints, errors and code samples.", DOCS, active="docs")
page("pricing.html", "Pricing", "Trial, Pro and Enterprise plans.", PRICING)
page("login.html", "Sign in", "Sign in to the VeyraX dashboard.", LOGIN)
page("signup.html", "Create account", "Get your free VeyraX API key.", SIGNUP)
page("dashboard.html", "Dashboard", "Keys, usage and logs.", DASHBOARD, active="account")
page("about.html", "About", "About Team Veyra.", ABOUT)
page("contact.html", "Contact", "Contact Team Veyra.", CONTACT)
page("status.html", "Status", "System status and uptime.", STATUS)
page("legal/terms.html", "Terms of Service", "VeyraX terms of service.", TERMS, sub=True)
page("legal/privacy.html", "Privacy Policy", "VeyraX privacy policy.", PRIVACY, sub=True)
page("legal/aup.html", "Acceptable Use", "VeyraX acceptable use policy.", AUP, sub=True)
page("404.html", "Not found", "Page not found.", NOTFOUND)
print("Done.")
