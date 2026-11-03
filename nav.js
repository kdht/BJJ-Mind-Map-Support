// Shared header/footer + mobile hamburger nav, injected into every page's
// <div id="site-header"></div> / <div id="site-footer"></div> placeholders.
// Keeps nav markup in one place across the multi-page site.
(function () {
  const NAV_ITEMS = [
    { href: "/", label: "Home", key: "home" },
    { href: "/roadmap.html", label: "Roadmap", key: "roadmap" },
    { href: "/activity.html", label: "Issues & bugs", key: "activity" },
    { href: "/submit.html", label: "Submit a request", key: "submit" },
    { href: "/support.html", label: "Support articles", key: "support" },
  ];

  function renderHeader(active) {
    const el = document.getElementById("site-header");
    if (!el) return;
    el.innerHTML = `
      <header class="site-header">
        <div class="wrap">
          <a class="brand" href="/">
            <img src="/brand/mark.svg" alt="" class="brand-mark">
            <span>BJJ Mind Map <small>Support</small></span>
          </a>
          <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <nav id="main-nav">
            ${NAV_ITEMS.map((i) => `<a href="${i.href}" class="${i.key === active ? "active" : ""}">${i.label}</a>`).join("")}
            <a href="https://bjjmindmap.com" class="cta">Get the app</a>
          </nav>
        </div>
      </header>
    `;
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("main-nav");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.classList.toggle("open", open);
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.classList.remove("open");
    }));
  }

  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    el.innerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <span>© 2026 KDHT Enterprises LLC — BJJ Mind Map</span>
          <nav>
            <a href="https://bjjmindmap.com">Main site</a>
            <a href="https://bjjmindmap.com/terms.html">Terms</a>
            <a href="https://bjjmindmap.com/privacy.html">Privacy</a>
            <a href="https://github.com/kdht/BJJ-Mind-Map-Support/issues" target="_blank" rel="noopener">All issues (GitHub)</a>
          </nav>
        </div>
      </footer>
    `;
  }

  window.SupportSiteNav = { renderHeader, renderFooter };
})();
