(function () {
  const { fetchIssues, typeOf, statusOf, typeLabel, statusLabel, timeAgo } = window.SupportData;
  let allIssues = [];
  let activeFilter = "all";

  function renderIssueGrid() {
    const grid = document.getElementById("issue-grid");
    const filtered = activeFilter === "all" ? allIssues : allIssues.filter((i) => typeOf(i) === activeFilter);
    grid.innerHTML = "";
    if (!filtered.length) {
      grid.innerHTML = '<div class="empty">Nothing here yet.</div>';
      return;
    }
    const sorted = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    for (const issue of sorted) {
      const t = typeOf(issue);
      const s = statusOf(issue);
      const card = document.createElement("a");
      card.className = "issue-card";
      card.href = issue.html_url;
      card.target = "_blank";
      card.rel = "noopener";
      const sLabel = statusLabel(s);
      card.innerHTML = `
        <div class="badges">
          <span class="badge badge-${t}">${typeLabel(t)}</span>
          ${sLabel ? `<span class="badge badge-status-${s.split(":")[1]}">${sLabel}</span>` : ""}
        </div>
        <div class="issue-title"></div>
        <div class="issue-meta">#${issue.number} · opened ${timeAgo(issue.created_at)} · ${issue.comments} comment${issue.comments === 1 ? "" : "s"}</div>
      `;
      card.querySelector(".issue-title").textContent = issue.title;
      grid.appendChild(card);
    }
  }

  document.getElementById("activity-filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderIssueGrid();
  });

  (async () => {
    try {
      allIssues = await fetchIssues();
      renderIssueGrid();
    } catch (e) {
      document.getElementById("issue-grid").innerHTML = '<div class="empty">Couldn\'t load right now -- <a href="https://github.com/kdht/BJJ-Mind-Map-Support/issues" target="_blank" rel="noopener">view on GitHub</a>.</div>';
    }
  })();
})();
