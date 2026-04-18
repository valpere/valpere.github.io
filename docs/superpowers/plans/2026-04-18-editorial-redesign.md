# Editorial Homepage Redesign — Variant A

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Variant A (Editorial Grid) homepage redesign across valpere.github.io, matching the design prototype at `/tmp/design_extracted/valpere-github-io/project/Valpere Homepage Redesign.html`.

**Architecture:** Modify existing SCSS token/component/page files and Jekyll layouts (`default.html`, `home.html`) to match the Swiss-editorial aesthetic. New CSS custom properties aliased from the design's `--paper`, `--paper-2`, `--ink`, `--muted` naming are added to `_tokens.scss`. The header and footer in `default.html` are rewritten inline; the entire `home.html` is rewritten section by section. No new files are created — only existing files are modified.

**Tech Stack:** Jekyll 4.4.1, SCSS (native Sass nesting), Liquid templating, vanilla JS (blog category filter)

---

## File map

| File | Change |
|------|--------|
| `_sass/_tokens.scss` | Add editorial token aliases |
| `_sass/_base.scss` | Body background → `--paper` |
| `_sass/_components.scss` | Replace `.site-header`, `.site-footer`, `.hero`, add `.btn--ed-*`, `.ed-hero-card` |
| `_sass/_pages.scss` | Replace all `.home-*` blocks; add tape, proj-grid, work-table, blog, CTA |
| `_layouts/default.html` | Rewrite header HTML, add blog-filter JS, keep footer minimal |
| `_layouts/home.html` | Complete rewrite — hero, tape, projects, work, blog, CTA |

---

### Task 1: Add editorial design tokens

**Files:**
- Modify: `_sass/_tokens.scss`

- [ ] **Step 1: Add tokens to `_sass/_tokens.scss`**

  After line 12 (`--brand-border: #e4e2d8;`) add:

  ```scss
  /* Editorial design system aliases (Variant A) */
  --paper: #F6F4EE;
  --paper-2: #EFECE2;
  --ink: #0A0A0A;
  --muted: #6B6B66;
  --green-ink: #0F6B3F;
  ```

  Then change:
  - Line 11: `--brand-surface: #f8f7f2;` → `--brand-surface: var(--paper);`
  - Line 8: `--brand-muted: #5a5a5a;` → `--brand-muted: var(--muted);`

- [ ] **Step 2: Verify build**

  ```bash
  bundle exec jekyll build 2>&1 | tail -3
  ```
  Expected: `done in X.XXX seconds.` with no error lines.

- [ ] **Step 3: Commit**

  ```bash
  git add _sass/_tokens.scss
  git commit -m "style: add editorial design tokens (--paper, --paper-2, --ink, --muted, --green-ink)"
  ```

---

### Task 2: Update body background and base

**Files:**
- Modify: `_sass/_base.scss`

- [ ] **Step 1: Update body rule in `_sass/_base.scss`**

  Lines 13–22 — change `background-color: var(--brand-white)` and `color: var(--brand-black)`:

  ```scss
  body {
    font-family: var(--font-sans);
    font-weight: var(--fw-normal);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    color: var(--ink);
    background-color: var(--paper);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  ```

  (Added `overflow-x: hidden` to prevent horizontal scroll from marquee tape.)

- [ ] **Step 2: Verify build**

  ```bash
  bundle exec jekyll build 2>&1 | tail -3
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add _sass/_base.scss
  git commit -m "style: body background to --paper (#F6F4EE), overflow-x hidden"
  ```

---

### Task 3: Redesign the editorial header

**Files:**
- Modify: `_sass/_components.scss` — replace `.site-header` block (lines 221–335) and `.lang-btn` (lines 455–474)
- Modify: `_layouts/default.html` — replace header HTML (lines 33–70)

- [ ] **Step 1: Replace `.site-header` SCSS in `_sass/_components.scss`**

  Replace everything from `/* ── Site header ── */` (line 220) through the closing `}` of `.site-header` (line 335), and also replace the `.lang-btn` block (lines 455–474), with:

  ```scss
  /* ── Site header — Editorial ── */
  .site-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--paper);
    border-bottom: 1.5px solid var(--ink);

    .header-inner {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 32px;
      padding: 20px 56px;
      max-width: var(--max-page);
      margin-inline: auto;

      @media (max-width: 1024px) { padding: 16px 32px; }
      @media (max-width: 640px)  { padding: 14px 20px; gap: 12px; }
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      color: var(--ink);

      img { width: 38px; height: 38px; border-radius: 6px; flex-shrink: 0; }

      .header-logo__name {
        font-size: 17px;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: var(--ink);
        display: block;
        line-height: 1.2;
      }

      .header-logo__tag {
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted);
        font-weight: 500;
        display: block;
        line-height: 1.4;

        @media (max-width: 640px) { display: none; }
      }
    }

    .site-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 28px;
      list-style: none;
      padding: 0;
      margin: 0;

      @media (max-width: 767px) { display: none; }

      a {
        position: relative;
        font-size: 14px;
        font-weight: 500;
        color: var(--ink);
        text-decoration: none;
        padding: 4px 0;

        &::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -6px;
          height: 2px;
          background: var(--brand-green);
          transform: scaleX(0);
          transition: transform 0.15s ease;
        }

        &:hover::after,
        &.active::after { transform: scaleX(1); }
      }
    }

    .nav-util {
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .avail-pill {
      background: var(--ink);
      color: var(--brand-yellow);
      padding: 6px 10px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      white-space: nowrap;

      @media (max-width: 640px) { display: none; }

      .avail-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #34D37A;
        box-shadow: 0 0 0 3px rgba(52,211,122,.25);
        flex-shrink: 0;
      }
    }

    .nav-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--sp-2);
      color: var(--ink);

      @media (max-width: 767px) { display: block; }

      .burger-line {
        display: block;
        width: 22px;
        height: 2px;
        background: currentColor;
        margin-block: 4px;
        transition: transform var(--duration) var(--ease), opacity var(--duration) var(--ease);
      }
    }

    .mobile-nav {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--paper-2);
      border-bottom: 1.5px solid var(--ink);
      padding: var(--sp-4);
      list-style: none;
      margin: 0;
      z-index: 99;

      &.is-open { display: block; }

      a {
        display: block;
        padding: var(--sp-3) var(--sp-4);
        color: var(--ink);
        text-decoration: none;
        font-weight: 500;
        font-size: 15px;
        border-radius: var(--r-sm);

        &:hover { background: var(--brand-yellow); }
      }
    }
  }

  /* lang-btn — editorial version (dark border on light header) */
  .lang-btn {
    border: 1px solid var(--ink);
    border-radius: 4px;
    color: var(--ink);
    padding: 5px 9px;
    font-weight: 700;
    font-size: 11px;
    font-family: var(--font-mono);
    letter-spacing: 0.08em;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    margin-left: 0;

    &:hover { background: var(--ink); color: var(--paper); }

    &:focus-visible { outline: 3px solid var(--brand-yellow); outline-offset: 2px; }
  }
  ```

- [ ] **Step 2: Replace header HTML in `_layouts/default.html`**

  Replace lines 33–70 (the old `<header class="site-header"...>` block) with:

  ```html
  <header class="site-header" role="banner">
    <div class="header-inner">
      <a href="{{ '/' | relative_url }}" class="header-logo" aria-label="{{ site.title }} home">
        <img src="{{ '/assets/images/brand/logo-mark.png' | relative_url }}" alt="" aria-hidden="true" width="38" height="38">
        <span>
          <span class="header-logo__name">Valentyn Solomko</span>
          <span class="header-logo__tag">Backend · AI · Automation</span>
        </span>
      </a>

      <nav aria-label="Main navigation">
        <ul class="site-nav" role="list">
          {% for item in site.data.nav %}
          <li>
            <a href="{{ item.url | relative_url }}"{% if item.url == '/' %}{% if page.url == '/' %} class="active" aria-current="page"{% endif %}{% elsif page.url contains item.url %} class="active" aria-current="page"{% endif %}>
              {% if site.active_lang == 'uk' %}{{ item.label_uk | default: item.label }}{% else %}{{ item.label }}{% endif %}
            </a>
          </li>
          {% endfor %}
        </ul>
      </nav>

      <div class="nav-util">
        <span class="avail-pill">
          <span class="avail-dot"></span>
          {% if site.active_lang == 'uk' %}Доступний{% else %}Available{% endif %}
        </span>
        {% include lang-switcher.html %}
        <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="mobile-nav">
          <span class="burger-line"></span>
          <span class="burger-line"></span>
          <span class="burger-line"></span>
        </button>
      </div>
    </div>

    <ul class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" role="list">
      {% for item in site.data.nav %}
      <li>
        <a href="{{ item.url | relative_url }}"{% if item.url == '/' %}{% if page.url == '/' %} aria-current="page"{% endif %}{% elsif page.url contains item.url %} aria-current="page"{% endif %}>
          {% if site.active_lang == 'uk' %}{{ item.label_uk | default: item.label }}{% else %}{{ item.label }}{% endif %}
        </a>
      </li>
      {% endfor %}
    </ul>
  </header>
  ```

- [ ] **Step 3: Verify header in browser at `http://127.0.0.1:4001/`**

  Header: paper-white background with 1.5px ink border-bottom. Left: 38px logo PNG + "Valentyn Solomko" (bold 17px) + "Backend · AI · Automation" (11px uppercase muted). Center: nav links dark on light, green underline on hover/active. Right: dark pill "Available" with green dot + bordered lang button.

- [ ] **Step 4: Commit**

  ```bash
  git add _layouts/default.html _sass/_components.scss
  git commit -m "style: editorial header — ink-on-paper, 3-col grid, availability pill, green underline nav"
  ```

---

### Task 4: Update the global footer

**Files:**
- Modify: `_sass/_components.scss` — replace `.site-footer` block (lines 337–390)

- [ ] **Step 1: Replace `.site-footer` SCSS in `_sass/_components.scss`**

  Replace everything from `/* ── Site footer ── */` through the closing `}` of `.site-footer`:

  ```scss
  /* ── Site footer — Editorial ── */
  .site-footer {
    background: var(--ink);
    color: rgba(255,255,255,0.5);
    padding: 22px 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--sp-4);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    @media (max-width: 1024px) { padding: 20px 32px; }
    @media (max-width: 640px)  { padding: 18px 20px; flex-direction: column; text-align: center; gap: var(--sp-3); }

    .footer-copy { margin: 0; }

    .social-icons {
      display: flex;
      gap: var(--sp-3);

      a {
        display: flex;
        align-items: center;
        color: rgba(255,255,255,0.45);
        transition: color 0.15s;

        &:hover { color: var(--brand-yellow); }

        svg { width: 18px; height: 18px; }
      }
    }
  }
  ```

- [ ] **Step 2: Verify footer in browser**

  Footer: slim dark ink bar, mono copyright text left, social SVG icons right. No large gap before footer on non-home pages.

- [ ] **Step 3: Commit**

  ```bash
  git add _sass/_components.scss
  git commit -m "style: editorial footer — slim ink bar, mono text, social icons"
  ```

---

### Task 5: Rewrite the homepage hero section

**Files:**
- Modify: `_sass/_components.scss` — replace `.hero` block and add `.btn--ed-*`, `.ed-hero-card`
- Modify: `_layouts/home.html` — replace hero (lines 1–26)

- [ ] **Step 1: Replace `.hero` block and add editorial components in `_sass/_components.scss`**

  Replace the entire `.hero { ... }` block (lines ~151–218):

  ```scss
  /* ── Hero — Editorial ── */
  .ed-hero {
    display: grid;
    grid-template-columns: 1fr 460px;
    gap: 64px;
    padding: 72px 56px 64px;
    border-bottom: 1.5px solid var(--ink);
    background: var(--paper);

    @media (max-width: 1100px) { grid-template-columns: 1fr; gap: 40px; padding: 48px 32px 40px; }
    @media (max-width: 640px)  { padding: 36px 20px 32px; }

    .eyebrow {
      display: flex;
      gap: 14px;
      align-items: center;
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 28px;
      font-family: var(--font-mono);

      .num { color: var(--ink); font-weight: 700; }
    }

    h1 {
      font-size: 104px;
      line-height: 0.92;
      letter-spacing: -0.045em;
      font-weight: 500;
      max-width: 9ch;
      color: var(--ink);
      margin: 0;

      @media (max-width: 1100px) { font-size: 76px; }
      @media (max-width: 640px)  { font-size: 52px; }

      em { font-style: italic; font-weight: 400; color: var(--brand-green); }

      .swatch {
        display: inline-block;
        width: 0.9em;
        height: 0.9em;
        border-radius: 0.18em;
        background: var(--brand-yellow);
        vertical-align: -0.08em;
        margin: 0 0.05em;
        box-shadow: inset 0 0 0 2px var(--ink);
      }
    }

    .lede {
      margin-top: 28px;
      font-size: 19px;
      line-height: 1.55;
      max-width: 48ch;
      color: #2a2a28;

      @media (max-width: 640px) { font-size: 16px; margin-top: 20px; }

      b {
        font-weight: 600;
        background: linear-gradient(180deg, transparent 62%, rgba(254,215,79,.85) 62%);
      }
    }

    .hero-cta {
      display: flex;
      gap: 14px;
      margin-top: 40px;
      flex-wrap: wrap;

      @media (max-width: 640px) { margin-top: 28px; }
    }
  }

  /* Dark feature card (hero right column) */
  .ed-hero-card {
    background: var(--ink);
    color: var(--paper);
    border-radius: 18px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: relative;
    overflow: hidden;
    align-self: start;

    &::before {
      content: "";
      position: absolute;
      inset: auto -40px -40px auto;
      width: 220px; height: 220px;
      background: var(--brand-yellow);
      border-radius: 999px;
      opacity: 0.18;
      pointer-events: none;
    }

    .card-mk { width: 56px; height: 56px; border-radius: 12px; overflow: hidden; position: relative; z-index: 1; }

    .card-meta {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #8a8a85;
    }

    h3 {
      font-size: 26px;
      line-height: 1.15;
      font-weight: 500;
      letter-spacing: -0.02em;
      position: relative;
      z-index: 1;
      color: var(--paper);
      margin: 0;
    }

    .card-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      border-top: 1px solid #2a2a28;
      padding-top: 22px;
      position: relative;
      z-index: 1;

      .stat-n { font-size: 40px; font-weight: 500; letter-spacing: -0.03em; color: var(--brand-yellow); line-height: 1; }
      .stat-l { font-size: 12px; color: #b4b4ad; margin-top: 4px; font-family: var(--font-mono); letter-spacing: 0.06em; }
    }

    .card-avail {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      position: relative;
      z-index: 1;
      color: var(--paper);

      .avail-dot { width: 8px; height: 8px; border-radius: 999px; background: #34D37A; flex-shrink: 0; }
    }
  }

  /* Editorial pill buttons */
  .btn--ed-primary {
    font-size: 14px;
    font-weight: 500;
    padding: 14px 22px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 1.5px solid var(--ink);
    background: var(--ink);
    color: var(--brand-yellow);
    text-decoration: none;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    white-space: nowrap;

    &:hover { background: var(--brand-green); border-color: var(--brand-green); color: #fff; }
    &:focus-visible { outline: 3px solid var(--brand-yellow); outline-offset: 2px; }
  }

  .btn--ed-ghost {
    font-size: 14px;
    font-weight: 500;
    padding: 14px 22px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 1.5px solid var(--ink);
    background: transparent;
    color: var(--ink);
    text-decoration: none;
    transition: background 0.15s ease, color 0.15s ease;
    white-space: nowrap;

    &:hover { background: var(--ink); color: var(--paper); }
    &:focus-visible { outline: 3px solid var(--brand-yellow); outline-offset: 2px; }
  }
  ```

- [ ] **Step 2: Rewrite `_layouts/home.html` hero section (replace entire file content, lines 1–26)**

  The full new `home.html` starts with:

  ```liquid
  ---
  layout: default
  ---
  <!-- Hero -->
  <section class="ed-hero" aria-labelledby="hero-heading">
    <div>
      <div class="eyebrow">
        <span class="num">01</span>
        <span>{% if site.active_lang == 'uk' %}Бекенд-розробник та фрілансер{% else %}Backend Developer &amp; Freelancer{% endif %}</span>
      </div>
      <h1 id="hero-heading">
        {% if site.active_lang == 'uk' %}
        <em>Валентин</em><br>Соломко<span class="swatch" aria-hidden="true"></span>
        {% else %}
        <em>Backend</em><br>Dev<span class="swatch" aria-hidden="true"></span>
        {% endif %}
      </h1>
      <p class="lede">
        {% if site.active_lang == 'uk' %}
        Бекенд-розробник та фрілансер, що спеціалізується на <b>Go, Java, Groovy, Perl</b>, витяганні даних, Telegram-ботах та AI-інтеграції.
        {% else %}
        Backend developer &amp; freelancer specialising in <b>Go, Java, Groovy, Perl</b>, data extraction, Telegram bots, and AI integration.
        {% endif %}
      </p>
      <div class="hero-cta">
        <a href="{{ '/projects/' | relative_url }}" class="btn--ed-primary">
          {% if site.active_lang == 'uk' %}Проєкти {% else %}View Projects {% endif %}→
        </a>
        <a href="{{ '/about/' | relative_url }}" class="btn--ed-ghost">
          {% if site.active_lang == 'uk' %}Про мене{% else %}About Me{% endif %}
        </a>
      </div>
    </div>

    <!-- Right: dark feature card -->
    {% assign fp = site.data.projects | where: "featured", true | first %}
    {% if fp %}
    <div class="ed-hero-card" aria-label="{% if site.active_lang == 'uk' %}Поточний проєкт{% else %}Current project{% endif %}">
      <img src="{{ '/assets/images/brand/logo-mark.png' | relative_url }}" alt="" aria-hidden="true" class="card-mk">
      <span class="card-meta">{% if site.active_lang == 'uk' %}Зараз будується{% else %}Currently building{% endif %}</span>
      <h3>{{ fp.title }}</h3>
      <div class="card-stats">
        <div><div class="stat-n">4</div><div class="stat-l">agents</div></div>
        <div><div class="stat-n">12</div><div class="stat-l">routes</div></div>
        <div><div class="stat-n">1</div><div class="stat-l">install</div></div>
        <div><div class="stat-n">∞</div><div class="stat-l">workflows</div></div>
      </div>
      <div class="card-avail">
        <span class="avail-dot"></span>
        <span>{% if site.active_lang == 'uk' %}Доступний до співпраці{% else %}Available for work{% endif %}</span>
      </div>
    </div>
    {% endif %}
  </section>
  ```

  **Important:** Do NOT include `{{ content }}` — the old `index.md` body is empty and not needed.

- [ ] **Step 3: Verify hero in browser**

  Large two-column layout: left has 104px heading (`<em>Backend</em><br>Dev` + yellow swatch), lede with yellow highlight on "Go, Java, Groovy, Perl", two pill buttons. Right: dark card with logo, "Currently building", "chorus", 4-stat grid (yellow numbers), green availability dot.

- [ ] **Step 4: Commit**

  ```bash
  git add _layouts/home.html _sass/_components.scss
  git commit -m "feat: editorial hero — 104px display h1, dark feature card, pill CTA buttons"
  ```

---

### Task 6: Add the tech tape marquee

**Files:**
- Modify: `_layouts/home.html` — add tape after hero `</section>`
- Modify: `_sass/_pages.scss` — add tape styles

- [ ] **Step 1: Add tape SCSS at the top of `_sass/_pages.scss`** (before or replacing existing `.home-projects`)

  Add this block:

  ```scss
  /* ── Tech tape marquee ── */
  .ed-tape {
    background: var(--brand-yellow);
    border-top: 1.5px solid var(--ink);
    border-bottom: 1.5px solid var(--ink);
    overflow: hidden;
    position: relative;
  }

  .ed-tape-inner {
    display: flex;
    gap: 40px;
    padding: 18px 0;
    white-space: nowrap;
    animation: tape 50s linear infinite;
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--ink);

    span { display: inline-flex; align-items: center; gap: 40px; }

    .tape-dot {
      width: 8px;
      height: 8px;
      background: var(--ink);
      border-radius: 2px;
      display: inline-block;
      flex-shrink: 0;
    }
  }

  @keyframes tape {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ed-tape-inner { animation: none; }
  }
  ```

- [ ] **Step 2: Add tape HTML to `_layouts/home.html`** (immediately after the hero `</section>` tag)

  ```html
  <!-- Tech tape -->
  <div class="ed-tape" aria-hidden="true">
    <div class="ed-tape-inner">
      <span>
        <i class="tape-dot"></i> Go
        <i class="tape-dot"></i> Java
        <i class="tape-dot"></i> Groovy
        <i class="tape-dot"></i> Perl
        <i class="tape-dot"></i> Claude Code
        <i class="tape-dot"></i> MCP
        <i class="tape-dot"></i> Telegram API
        <i class="tape-dot"></i> PostgreSQL
        <i class="tape-dot"></i> Redis
        <i class="tape-dot"></i> Docker
        <i class="tape-dot"></i> Kubernetes
        <i class="tape-dot"></i> REST API
        <i class="tape-dot"></i> gRPC
        <i class="tape-dot"></i> n8n
        <i class="tape-dot"></i> Supabase
      </span>
      <span aria-hidden="true">
        <i class="tape-dot"></i> Go
        <i class="tape-dot"></i> Java
        <i class="tape-dot"></i> Groovy
        <i class="tape-dot"></i> Perl
        <i class="tape-dot"></i> Claude Code
        <i class="tape-dot"></i> MCP
        <i class="tape-dot"></i> Telegram API
        <i class="tape-dot"></i> PostgreSQL
        <i class="tape-dot"></i> Redis
        <i class="tape-dot"></i> Docker
        <i class="tape-dot"></i> Kubernetes
        <i class="tape-dot"></i> REST API
        <i class="tape-dot"></i> gRPC
        <i class="tape-dot"></i> n8n
        <i class="tape-dot"></i> Supabase
      </span>
    </div>
  </div>
  ```

- [ ] **Step 3: Verify tape in browser**

  Yellow band scrolling right-to-left, black dot separators, JetBrains Mono 14px. No horizontal scrollbar on the page.

- [ ] **Step 4: Commit**

  ```bash
  git add _layouts/home.html _sass/_pages.scss
  git commit -m "feat: tech tape — yellow marquee with animated tech stack items"
  ```

---

### Task 7: Rewrite the projects grid section

**Files:**
- Modify: `_layouts/home.html` — replace `<!-- Featured Projects -->` section
- Modify: `_sass/_pages.scss` — add `.ed-projects`, `.ed-sec-head`, `.ed-proj-grid`, `.ed-proj`

- [ ] **Step 1: Add editorial projects SCSS to `_sass/_pages.scss`**

  Replace the `.home-projects` block with:

  ```scss
  /* ── Shared section header ── */
  .ed-sec-head {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 40px;
    align-items: end;
    padding: 72px 56px 24px;

    @media (max-width: 1024px) { padding: 48px 32px 20px; }
    @media (max-width: 640px)  { grid-template-columns: auto 1fr; gap: 12px; padding: 36px 20px 16px;
      .sec-sub { display: none; }
    }

    .sec-num {
      font-family: var(--font-mono);
      font-size: 13px;
      letter-spacing: 0.14em;
      color: var(--muted);
      align-self: start;
      padding-top: 6px;
    }

    h2 {
      font-size: 44px;
      letter-spacing: -0.03em;
      font-weight: 500;
      line-height: 1;
      margin: 0;

      @media (max-width: 640px) { font-size: 32px; }
    }

    .sec-sub {
      font-size: 14px;
      color: var(--muted);
      max-width: 38ch;
      text-align: right;
      line-height: 1.5;
    }
  }

  /* ── Editorial projects grid ── */
  .ed-projects { background: var(--paper); }

  .ed-proj-grid {
    padding: 24px 56px 48px;
    display: grid;
    grid-template-columns: 1.3fr 0.7fr;
    gap: 24px;

    @media (max-width: 1100px) { grid-template-columns: 1fr; padding: 20px 32px 40px; }
    @media (max-width: 640px)  { padding: 16px 20px 32px; }
  }

  .ed-proj {
    background: var(--paper-2);
    border: 1.5px solid var(--ink);
    border-radius: 18px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    text-decoration: none;
    color: var(--ink);

    &:hover { transform: translate(-3px, -3px); box-shadow: 6px 6px 0 var(--ink); }

    &.ed-proj--hero { grid-row: span 2; }

    @media (max-width: 1100px) {
      &.ed-proj--hero { grid-row: auto; }
    }

    .proj-thumb {
      aspect-ratio: 16 / 9;
      overflow: hidden;
      border-bottom: 1.5px solid var(--ink);
      background: var(--paper-2);

      img { width: 100%; height: 100%; object-fit: cover; display: block; }
    }

    &.ed-proj--hero .proj-thumb { aspect-ratio: 16 / 10; }

    .proj-body {
      padding: 24px 26px 26px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      flex: 1;
    }

    .proj-tagline {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
      display: flex;
      gap: 10px;
      align-items: center;

      .proj-sq { width: 7px; height: 7px; background: var(--brand-green); border-radius: 1px; flex-shrink: 0; }
    }

    h3 { font-size: 28px; line-height: 1.1; letter-spacing: -0.02em; font-weight: 500; margin: 0; color: var(--ink); }
    &.ed-proj--hero h3 { font-size: 36px; }

    p { font-size: 14.5px; line-height: 1.55; color: #2a2a28; flex: 1; margin: 0; }

    .proj-chips { display: flex; flex-wrap: wrap; gap: 6px; }

    .proj-chip {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 4px 9px;
      border: 1px solid var(--ink);
      border-radius: 999px;
      background: var(--paper);
      white-space: nowrap;
      color: var(--ink);
    }

    .proj-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px dashed #bcbab0;
      margin-top: 4px;

      .proj-links {
        display: flex;
        gap: 14px;
        font-size: 12px;
        font-weight: 500;
        font-family: var(--font-mono);
        letter-spacing: 0.08em;

        a {
          border-bottom: 1.5px solid var(--ink);
          padding-bottom: 2px;
          color: var(--ink);
          text-decoration: none;

          &:hover { color: var(--brand-green); border-color: var(--brand-green); }
        }
      }
    }
  }

  .ed-proj-more {
    padding: 0 56px 48px;
    text-align: center;

    @media (max-width: 640px) { padding: 0 20px 32px; }
  }
  ```

- [ ] **Step 2: Replace the `<!-- Featured Projects -->` section in `_layouts/home.html`**

  Replace the old section (starting `<!-- Featured Projects -->` through the closing `</section>`) with:

  ```liquid
  <!-- Featured Projects -->
  <section class="ed-projects" aria-labelledby="projects-heading">
    <div class="ed-sec-head">
      <span class="sec-num">02</span>
      <h2 id="projects-heading">{% if site.active_lang == 'uk' %}Вибрані проєкти{% else %}Featured Projects{% endif %}</h2>
      <p class="sec-sub">{% if site.active_lang == 'uk' %}Відкриті інструменти та клієнтські рішення.{% else %}Open-source tools &amp; client solutions.{% endif %}</p>
    </div>

    <div class="ed-proj-grid">
      {% assign featured = site.data.projects | where: "featured", true %}
      {% for project in featured %}
      <a href="{{ project.permalink | relative_url }}" class="ed-proj{% if forloop.first %} ed-proj--hero{% endif %}">
        {% if project.hero_image %}
        <div class="proj-thumb">
          <img src="{{ project.hero_image | relative_url }}" alt="{{ project.title }}" loading="{% if forloop.first %}eager{% else %}lazy{% endif %}">
        </div>
        {% endif %}
        <div class="proj-body">
          <div class="proj-tagline">
            <span class="proj-sq"></span>
            <span>{{ project.tech | first }}</span>
          </div>
          <h3>{{ project.title }}</h3>
          <p>{% if site.active_lang == 'uk' %}{{ project.summary_uk }}{% else %}{{ project.summary_en }}{% endif %}</p>
          <div class="proj-chips">
            {% for t in project.tech limit: 5 %}
            <span class="proj-chip">{{ t }}</span>
            {% endfor %}
          </div>
          <div class="proj-foot">
            <div class="proj-links">
              {% if project.links.github %}<a href="{{ project.links.github }}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">GitHub</a>{% endif %}
              {% if project.links.fiverr %}<a href="{{ project.links.fiverr }}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Fiverr</a>{% endif %}
              {% if project.links.upwork %}<a href="{{ project.links.upwork }}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Upwork</a>{% endif %}
            </div>
            <span style="font-size:20px;line-height:1">→</span>
          </div>
        </div>
      </a>
      {% endfor %}
    </div>

    <div class="ed-proj-more">
      <a href="{{ '/projects/' | relative_url }}" class="btn--ed-ghost">{% if site.active_lang == 'uk' %}Усі проєкти →{% else %}All Projects →{% endif %}</a>
    </div>
  </section>
  ```

- [ ] **Step 3: Verify projects grid in browser**

  First featured project (chorus) spans 2 rows on the left (wider column). Smaller cards on the right column. Hover: `translate(-3px,-3px)` + `6px 6px 0 #0A0A0A` box-shadow. Cards have `paper-2` background, 1.5px ink border, rounded corners.

- [ ] **Step 4: Commit**

  ```bash
  git add _layouts/home.html _sass/_pages.scss
  git commit -m "feat: editorial projects grid — 1.3/0.7fr asymmetric, hero card spans 2 rows, hover shadow"
  ```

---

### Task 8: Rewrite the portfolio as a work table

**Files:**
- Modify: `_layouts/home.html` — replace `<!-- Selected Work (Portfolio) -->` section
- Modify: `_sass/_pages.scss` — replace `.home-portfolio` with work table styles

- [ ] **Step 1: Replace `.home-portfolio` SCSS in `_sass/_pages.scss`**

  Replace the `.home-portfolio` block with:

  ```scss
  /* ── Work table ── */
  .ed-work {
    padding: 0 56px 48px;
    background: var(--paper);
    border-top: 1.5px solid var(--ink);

    @media (max-width: 1024px) { padding: 0 32px 40px; }
    @media (max-width: 640px)  { padding: 0 20px 32px; }
  }

  .ed-work-list {
    margin-top: 28px;
    border-top: 1.5px solid var(--ink);
  }

  .ed-work-row {
    display: grid;
    grid-template-columns: 80px 1.2fr 0.7fr auto;
    gap: 32px;
    padding: 28px 0;
    border-bottom: 1px solid #c9c7bc;
    align-items: center;
    text-decoration: none;
    color: var(--ink);
    transition: background 0.2s ease, padding 0.2s ease;
    position: relative;

    @media (max-width: 900px) {
      grid-template-columns: 1fr auto;
      gap: 16px;

      .work-idx, .work-role { display: none; }
    }
    @media (max-width: 640px) { padding: 18px 0; }

    &:hover {
      background: var(--ink);
      color: var(--paper);
      padding-left: 20px;
      padding-right: 20px;

      .work-idx, .work-yr, .work-role { color: #b4b4ad; }
      .work-co { color: var(--brand-yellow); }
    }

    .work-idx { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }

    .work-co {
      font-size: 32px;
      font-weight: 500;
      letter-spacing: -0.02em;

      @media (max-width: 640px) { font-size: 22px; }
    }

    .work-role { font-size: 14px; color: #2a2a28; }

    .work-yr { font-family: var(--font-mono); font-size: 13px; color: var(--muted); text-align: right; white-space: nowrap; }
  }

  .ed-work-more {
    padding-top: 28px;
    text-align: center;
  }
  ```

- [ ] **Step 2: Replace the portfolio section HTML in `_layouts/home.html`**

  Replace the old `<!-- Selected Work (Portfolio) -->` section with:

  ```liquid
  <!-- Work table -->
  <section class="ed-work" aria-labelledby="work-heading">
    <div class="ed-sec-head" style="padding-left:0;padding-right:0">
      <span class="sec-num">03</span>
      <h2 id="work-heading">{% if site.active_lang == 'uk' %}Вибрані роботи{% else %}Selected Work{% endif %}</h2>
      <p class="sec-sub">{% if site.active_lang == 'uk' %}Корпоративні контракти та довгострокові замовлення.{% else %}Enterprise contracts &amp; long-term engagements.{% endif %}</p>
    </div>

    <div class="ed-work-list">
      {% for item in site.data.portfolio %}
      <a href="{{ item.permalink | relative_url }}" class="ed-work-row">
        <span class="work-idx">0{{ forloop.index }}</span>
        <span class="work-co">{{ item.client }}</span>
        <span class="work-role">{{ item.role }}</span>
        <span class="work-yr">{{ item.period }}</span>
      </a>
      {% endfor %}
    </div>

    <div class="ed-work-more">
      <a href="{{ '/portfolio/' | relative_url }}" class="btn--ed-ghost">{% if site.active_lang == 'uk' %}Повне портфоліо →{% else %}Full Portfolio →{% endif %}</a>
    </div>
  </section>
  ```

- [ ] **Step 3: Verify work table in browser**

  Three rows: "CloudBees CD/RO", "PortaSwitch / PortaOne", "Mail.UA". Hover: entire row flips to ink background, company name turns yellow, other text dims to `#b4b4ad`.

- [ ] **Step 4: Commit**

  ```bash
  git add _layouts/home.html _sass/_pages.scss
  git commit -m "feat: work table — hover-invert rows, company turns yellow, mono date column"
  ```

---

### Task 9: Rewrite the blog section with filter chips

**Files:**
- Modify: `_layouts/home.html` — replace `<!-- Latest Writing -->` section
- Modify: `_sass/_pages.scss` — replace `.home-blog` block with blog section styles
- Modify: `_layouts/default.html` — add blog filter JS before `</body>`

- [ ] **Step 1: Replace `.home-blog` SCSS in `_sass/_pages.scss`** with:

  ```scss
  /* ── Blog section ── */
  .ed-blog {
    padding: 0 56px 72px;
    background: var(--paper-2);
    border-top: 1.5px solid var(--ink);
    border-bottom: 1.5px solid var(--ink);

    @media (max-width: 1024px) { padding: 0 32px 48px; }
    @media (max-width: 640px)  { padding: 0 20px 36px; }
  }

  .blog-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 8px 0 28px;
    padding-bottom: 20px;
    border-bottom: 1.5px solid var(--ink);
    align-items: center;

    .filter-label {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
      margin-right: 12px;
    }

    .filter-chip {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 7px 12px;
      border: 1.5px solid var(--ink);
      border-radius: 999px;
      cursor: pointer;
      background: transparent;
      transition: all 0.15s;
      color: var(--ink);

      &:hover { background: var(--paper); }
      &.on { background: var(--ink); color: var(--brand-yellow); }
    }
  }

  .blog-featured {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 0;
    border: 1.5px solid var(--ink);
    border-radius: 18px;
    overflow: hidden;
    margin-bottom: 32px;
    background: var(--paper);
    text-decoration: none;
    color: var(--ink);

    @media (max-width: 768px) { grid-template-columns: 1fr; }

    .feat-img {
      background: var(--brand-green);
      min-height: 320px;
      position: relative;
      display: grid;
      place-items: center;
      border-right: 1.5px solid var(--ink);
      overflow: hidden;

      @media (max-width: 768px) { min-height: 200px; border-right: none; border-bottom: 1.5px solid var(--ink); }

      img { width: 100%; height: 100%; object-fit: cover; }

      .feat-badge {
        position: absolute;
        top: 22px; left: 22px;
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink);
        background: var(--brand-yellow);
        padding: 6px 10px;
        border-radius: 3px;
        font-weight: 700;
      }
    }

    .feat-body {
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      @media (max-width: 640px) { padding: 24px 20px; }

      .feat-meta {
        display: flex;
        gap: 14px;
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--muted);

        .feat-cat { color: var(--brand-green); font-weight: 700; }
      }

      h3 {
        font-size: 36px;
        line-height: 1.05;
        letter-spacing: -0.03em;
        font-weight: 500;
        margin: 0;

        @media (max-width: 640px) { font-size: 26px; }
      }

      p { font-size: 16px; line-height: 1.6; color: #2a2a28; max-width: 52ch; margin: 0; }

      .feat-tags { display: flex; gap: 6px; flex-wrap: wrap; }

      .feat-tag {
        font-family: var(--font-mono);
        font-size: 11px;
        padding: 3px 8px;
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--paper-2);
        color: var(--ink);
      }

      .feat-readmore {
        margin-top: auto;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-family: var(--font-mono);
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        font-weight: 700;
        padding: 12px 16px;
        border: 1.5px solid var(--ink);
        border-radius: 999px;
        align-self: flex-start;
        background: var(--brand-yellow);
        color: var(--ink);
        text-decoration: none;
        transition: transform 0.15s;

        &:hover { transform: translateX(3px); }
      }
    }
  }

  .blog-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 640px)  { grid-template-columns: 1fr; }
  }

  .blog-post-card {
    background: var(--paper);
    border: 1.5px solid var(--ink);
    border-radius: 14px;
    padding: 22px 22px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    color: var(--ink);

    &:hover {
      transform: translate(-2px, -2px);
      box-shadow: 5px 5px 0 var(--ink);
    }

    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      color: var(--muted);

      .post-cat { color: var(--brand-green); font-weight: 700; text-transform: uppercase; }
    }

    h4 { font-size: 19px; line-height: 1.25; letter-spacing: -0.015em; font-weight: 500; flex: 1; margin: 0; color: var(--ink); }
    p { font-size: 13.5px; line-height: 1.55; color: #5a5a55; margin: 0; }

    .post-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px dashed #bcbab0;
      margin-top: 4px;

      .post-tag { font-family: var(--font-mono); font-size: 11px; color: var(--muted); }

      .post-arr {
        width: 28px; height: 28px;
        border-radius: 999px;
        border: 1.5px solid var(--ink);
        display: grid;
        place-items: center;
        font-size: 13px;
        transition: background 0.15s;
        flex-shrink: 0;
      }
    }

    &:hover .post-arr { background: var(--brand-yellow); }
  }

  .blog-all {
    margin-top: 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 22px;
    border-top: 1.5px solid var(--ink);

    .blog-count { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; color: var(--muted); text-transform: uppercase; }

    a {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      font-weight: 700;
      border-bottom: 2px solid var(--ink);
      padding-bottom: 3px;
      color: var(--ink);
      text-decoration: none;

      &:hover { color: var(--brand-green); border-color: var(--brand-green); }
    }
  }
  ```

- [ ] **Step 2: Replace `<!-- Latest Writing -->` section in `_layouts/home.html`** with:

  ```liquid
  <!-- Blog -->
  {% if site.posts.size > 0 %}
  <section class="ed-blog" aria-labelledby="blog-heading">
    <div class="ed-sec-head" style="padding-left:0;padding-right:0">
      <span class="sec-num">04</span>
      <h2 id="blog-heading">{% if site.active_lang == 'uk' %}Останні статті{% else %}Latest Writing{% endif %}</h2>
      <p class="sec-sub">{% if site.active_lang == 'uk' %}Go, ШІ-інструменти, фріланс.{% else %}Go, AI tooling, freelance engineering.{% endif %}</p>
    </div>

    {% assign all_cats = site.posts | map: "categories" | flatten | uniq %}
    {% if all_cats.size > 0 %}
    <div class="blog-filters" id="blog-filters">
      <span class="filter-label">{% if site.active_lang == 'uk' %}Фільтр{% else %}Filter{% endif %}</span>
      <button class="filter-chip on" data-cat="all">{% if site.active_lang == 'uk' %}Всі{% else %}All{% endif %}</button>
      {% for cat in all_cats %}
      <button class="filter-chip" data-cat="{{ cat | slugify }}">{{ cat }}</button>
      {% endfor %}
    </div>
    {% endif %}

    {% assign first_post = site.posts | first %}
    {% if first_post %}
    <a href="{{ first_post.url | relative_url }}" class="blog-featured">
      <div class="feat-img">
        {% if first_post.image %}
        <img src="{{ first_post.image | relative_url }}" alt="{{ first_post.title }}" loading="eager">
        {% endif %}
        <span class="feat-badge">{% if site.active_lang == 'uk' %}Нова стаття{% else %}Latest Post{% endif %}</span>
      </div>
      <div class="feat-body">
        <div class="feat-meta">
          {% if first_post.categories.size > 0 %}<span class="feat-cat">{{ first_post.categories | first }}</span>{% endif %}
          <span>{{ first_post.date | date: "%B %d, %Y" }}</span>
        </div>
        <h3>{{ first_post.title }}</h3>
        {% if first_post.excerpt %}<p>{{ first_post.excerpt | strip_html | truncate: 200 }}</p>{% endif %}
        {% if first_post.tags.size > 0 %}
        <div class="feat-tags">
          {% for tag in first_post.tags limit: 4 %}<span class="feat-tag">{{ tag }}</span>{% endfor %}
        </div>
        {% endif %}
        <span class="feat-readmore">{% if site.active_lang == 'uk' %}Читати далі{% else %}Read More{% endif %} →</span>
      </div>
    </a>
    {% endif %}

    {% assign grid_posts = site.posts | offset: 1 | limit: 3 %}
    <div class="blog-grid" id="blog-grid">
      {% for post in grid_posts %}
      <a href="{{ post.url | relative_url }}" class="blog-post-card" data-cats="{% for c in post.categories %}{{ c | slugify }} {% endfor %}">
        <div class="post-meta">
          <span class="post-cat">{{ post.categories | first | default: "Post" }}</span>
          <span>{{ post.date | date: "%b %d" }}</span>
        </div>
        <h4>{{ post.title }}</h4>
        {% if post.excerpt %}<p>{{ post.excerpt | strip_html | truncate: 100 }}</p>{% endif %}
        <div class="post-foot">
          <span class="post-tag">{{ post.tags | first }}</span>
          <span class="post-arr">→</span>
        </div>
      </a>
      {% endfor %}
    </div>

    <div class="blog-all">
      <span class="blog-count">{{ site.posts.size }} {% if site.active_lang == 'uk' %}статей{% else %}posts{% endif %}</span>
      <a href="{{ '/blog/' | relative_url }}">{% if site.active_lang == 'uk' %}Всі статті →{% else %}View All Posts →{% endif %}</a>
    </div>
  </section>
  {% endif %}
  ```

- [ ] **Step 3: Add blog filter JS to `_layouts/default.html`** — before `</script>` of the existing mobile nav toggle block, add as a separate `<script>` tag right before `</body>`:

  ```html
  <script>
    (function() {
      var filters = document.getElementById('blog-filters');
      var grid = document.getElementById('blog-grid');
      if (!filters || !grid) return;
      filters.addEventListener('click', function(e) {
        var chip = e.target.closest('.filter-chip');
        if (!chip) return;
        var cat = chip.dataset.cat;
        filters.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('on'); });
        chip.classList.add('on');
        grid.querySelectorAll('.blog-post-card').forEach(function(card) {
          if (cat === 'all') { card.style.display = ''; return; }
          var cats = (card.dataset.cats || '').trim().split(/\s+/);
          card.style.display = cats.indexOf(cat) > -1 ? '' : 'none';
        });
      });
    })();
  </script>
  ```

- [ ] **Step 4: Verify blog section in browser**

  `paper-2` background, filter chips row (active chip: dark with yellow text), featured post (green left panel + white right body with 36px title + yellow "Read More" pill button), 3-col post grid below with hover shadow. Filter chips should hide/show grid posts when clicked.

- [ ] **Step 5: Commit**

  ```bash
  git add _layouts/home.html _layouts/default.html _sass/_pages.scss
  git commit -m "feat: editorial blog — featured post, filter chips JS, 3-col post grid"
  ```

---

### Task 10: Add the dark CTA block

**Files:**
- Modify: `_layouts/home.html` — replace `<!-- CTA -->` section
- Modify: `_sass/_pages.scss` — replace `.home-cta` block

- [ ] **Step 1: Replace `.home-cta` SCSS in `_sass/_pages.scss`** with:

  ```scss
  /* ── Home CTA ── */
  .ed-cta-wrap {
    padding: 24px;
    background: var(--paper-2);

    @media (max-width: 640px) { padding: 16px; }
  }

  .ed-cta {
    border-radius: 22px;
    background: var(--ink);
    color: var(--paper);
    padding: 72px 56px 48px;
    position: relative;
    overflow: hidden;

    @media (max-width: 1024px) { padding: 48px 36px 36px; }
    @media (max-width: 640px)  { padding: 36px 24px 28px; }

    &::before {
      content: "";
      position: absolute;
      top: -120px; right: -120px;
      width: 420px; height: 420px;
      background: var(--brand-yellow);
      border-radius: 999px;
      opacity: 0.14;
      pointer-events: none;
    }

    &::after {
      content: "";
      position: absolute;
      bottom: -180px; left: 40%;
      width: 520px; height: 520px;
      background: var(--brand-green);
      border-radius: 999px;
      opacity: 0.25;
      pointer-events: none;
    }

    .cta-inner {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 40px;
      align-items: end;

      @media (max-width: 900px) { grid-template-columns: 1fr; gap: 32px; }
    }

    h2 {
      font-size: 92px;
      line-height: 0.9;
      letter-spacing: -0.04em;
      font-weight: 500;
      max-width: 14ch;
      color: var(--paper);
      margin: 0;

      @media (max-width: 1024px) { font-size: 64px; }
      @media (max-width: 640px)  { font-size: 48px; }

      em { font-style: italic; color: var(--brand-yellow); font-weight: 400; }
    }

    .cta-links {
      display: flex;
      flex-direction: column;
      min-width: 280px;

      @media (max-width: 640px) { min-width: 0; }

      a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 0;
        border-bottom: 1px solid #2a2a28;
        font-size: 18px;
        color: var(--paper);
        text-decoration: none;
        transition: color 0.15s;

        @media (max-width: 640px) { font-size: 16px; padding: 14px 0; }

        &:hover { color: var(--brand-yellow); }

        .cta-arr { font-family: var(--font-mono); font-size: 14px; color: var(--muted); }
      }
    }

    .cta-foot {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #2a2a28;
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 12px;
      color: #8a8a85;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
      flex-wrap: wrap;
      gap: 12px;

      a { color: #8a8a85; text-decoration: none; &:hover { color: var(--brand-yellow); } }
    }
  }
  ```

- [ ] **Step 2: Replace `<!-- CTA -->` section in `_layouts/home.html`** with:

  ```liquid
  <!-- CTA -->
  <section class="ed-cta-wrap" aria-labelledby="cta-heading">
    <div class="ed-cta">
      <div class="cta-inner">
        <h2 id="cta-heading">
          {% if site.active_lang == 'uk' %}
          Готові до <em>співпраці?</em>
          {% else %}
          Ready to <em>work<br>together?</em>
          {% endif %}
        </h2>
        <div class="cta-links">
          {% if site.data.social.upwork %}
          <a href="{{ site.data.social.upwork.url }}" target="_blank" rel="noopener noreferrer">
            {{ site.data.social.upwork.label }} <span class="cta-arr">↗ 01</span>
          </a>
          {% endif %}
          {% if site.data.social.fiverr %}
          <a href="{{ site.data.social.fiverr.url }}" target="_blank" rel="noopener noreferrer">
            {{ site.data.social.fiverr.label }} <span class="cta-arr">↗ 02</span>
          </a>
          {% endif %}
          {% if site.data.social.freelancehunt %}
          <a href="{{ site.data.social.freelancehunt.url }}" target="_blank" rel="noopener noreferrer">
            {{ site.data.social.freelancehunt.label }} <span class="cta-arr">↗ 03</span>
          </a>
          {% endif %}
          {% if site.data.social.linkedin %}
          <a href="{{ site.data.social.linkedin.url }}" target="_blank" rel="noopener noreferrer">
            {{ site.data.social.linkedin.label }} <span class="cta-arr">↗ 04</span>
          </a>
          {% endif %}
        </div>
      </div>
      <div class="cta-foot">
        <span>&copy; {{ 'now' | date: "%Y" }} Valentyn Solomko</span>
        <span>Backend · AI · Automation</span>
        <a href="{{ site.data.social.github.url }}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      </div>
    </div>
  </section>
  ```

- [ ] **Step 3: Verify CTA in browser**

  Dark rounded block (22px radius, 24px gap from edges). Large "Ready to / work together?" h2 with italic yellow "work together". Right column: Upwork/Fiverr/FreelanceHunt/LinkedIn links with `↗ 01` mono labels. Subtle yellow radial blob top-right, green blob center. Footer bar: copyright + "Backend · AI · Automation" + GitHub link.

- [ ] **Step 4: Commit**

  ```bash
  git add _layouts/home.html _sass/_pages.scss
  git commit -m "feat: editorial CTA — 92px h2, platform links, radial blob accents, dark rounded block"
  ```

---

### Task 11: Final verification and PR

**Files:** All modified files

- [ ] **Step 1: Full build check**

  ```bash
  bundle exec jekyll build 2>&1 | grep -E "^(Error|Liquid|Build|Warning)" | head -20
  ```
  Expected: no `Error` lines. Liquid warnings about missing variables OK.

- [ ] **Step 2: Verify all pages render correctly**

  Check each of these in browser at `http://127.0.0.1:4001/`:

  - `/` — full editorial homepage: paper bg, editorial nav, hero, tape, projects grid, work table, blog, CTA
  - `/about/` — editorial header + footer, page content readable on paper bg
  - `/projects/` — editorial header + footer, projects listing
  - `/blog/` — editorial header + footer, blog listing
  - `/projects/chorus/` — editorial header + footer, project detail

- [ ] **Step 3: Verify mobile at 375px width** using browser DevTools

  Confirm:
  - Header: logo + tag hidden, name visible, burger shows, availability pill hidden
  - Hero: single column, 52px h1, hero card stacks below
  - Projects: single column
  - Work table: company + year columns only
  - Blog: single column cards
  - CTA: 48px h2, stacked layout

- [ ] **Step 4: Create PR**

  ```bash
  git checkout -b editorial-redesign-variant-a
  git push -u origin editorial-redesign-variant-a
  gh pr create \
    --title "feat: Editorial Variant A redesign across all pages" \
    --body "$(cat <<'EOF'
  ## Summary
  - Implements Variant A (Swiss/editorial grid) homepage redesign from design prototype
  - Paper-white (`#F6F4EE`) base replacing green header; ink-on-paper editorial nav with availability pill
  - 104px display hero h1 with italic green em + yellow swatch inline block
  - Yellow marquee tech tape, asymmetric projects grid (1.3/0.7fr), work table with hover-invert rows
  - Blog section: featured post + filter chips JS + 3-col post grid
  - Dark rounded CTA block (92px h2, radial blobs, platform link list)

  ## Test plan
  - [ ] Home: all sections visible, no overflow at 375px
  - [ ] Nav: active underline, mobile burger, availability pill
  - [ ] Hero: 104px h1, dark card with chorus stats
  - [ ] Tape: scrolls without horizontal scrollbar
  - [ ] Projects: first card spans 2 rows, hover shadow
  - [ ] Work: hover flip, yellow company name
  - [ ] Blog: filter chips JS, featured post, grid cards
  - [ ] CTA: radial blobs, italic yellow em

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  ```

- [ ] **Step 5: Wait for Copilot review, address any comments, then merge**

---

## Self-review

**Spec coverage:**
- ✅ Token aliases (`--paper`, `--paper-2`, `--ink`, `--muted`, `--green-ink`) — Task 1
- ✅ Editorial nav (3-col grid, availability pill, green underline, lang button) — Task 3
- ✅ Slim ink footer — Task 4
- ✅ 104px hero h1, italic green em, yellow swatch, lede with highlight — Task 5
- ✅ Dark feature card with chorus stats — Task 5
- ✅ Yellow marquee tape — Task 6
- ✅ Asymmetric projects grid (1.3/0.7fr), hero card spans 2 rows, hover translate+shadow — Task 7
- ✅ Work table with hover-invert rows — Task 8
- ✅ Blog filter chips (JS), featured post, 3-col grid — Task 9
- ✅ Dark rounded CTA, 92px h2, radial blobs, platform links — Task 10
- ✅ Responsive breakpoints throughout each task

**Placeholder scan:** No TBD, no TODO, no "similar to Task N" references. All code blocks are complete.

**Type consistency:** Class names are consistent across HTML and SCSS: `.ed-hero`, `.ed-hero-card`, `.ed-tape`, `.ed-proj`, `.ed-proj--hero`, `.ed-work`, `.ed-work-row`, `.ed-blog`, `.blog-featured`, `.blog-post-card`, `.ed-cta`, `.ed-cta-wrap`, `.btn--ed-primary`, `.btn--ed-ghost`.
