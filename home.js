// Home page: "at a glance" reporting cards (counts by type + by stage).
(async function () {
  const { fetchIssues, typeOf, statusOf, typeLabel, statusLabel } = window.SupportData;
  const typeGrid = document.getElementById("stats-type");
  const stageGrid = document.getElementById("stats-stage");
  try {
    const issues = await fetchIssues();

    const byType = { bug: 0, "feature-request": 0, "support-question": 0, other: 0 };
    const byStage = { "roadmap:planned": 0, "roadmap:in-progress": 0, "roadmap:shipped": 0 };
    for (const i of issues) {
      byType[typeOf(i)] = (byType[typeOf(i)] || 0) + 1;
      const s = statusOf(i);
      if (s) byStage[s] += 1;
    }

    typeGrid.innerHTML = `
      <div class="stat-card"><div class="stat-num">${issues.length}</div><div class="stat-label">Total open</div></div>
      <div class="stat-card stat-bug"><div class="stat-num">${byType.bug}</div><div class="stat-label">Bugs</div></div>
      <div class="stat-card stat-feature-request"><div class="stat-num">${byType["feature-request"]}</div><div class="stat-label">Feature requests</div></div>
      <div class="stat-card stat-support-question"><div class="stat-num">${byType["support-question"]}</div><div class="stat-label">Support questions</div></div>
    `;
    stageGrid.innerHTML = `
      <div class="stat-card"><div class="stat-num">${byStage["roadmap:planned"]}</div><div class="stat-label">${statusLabel("roadmap:planned")}</div></div>
      <div class="stat-card stat-status-in-progress"><div class="stat-num">${byStage["roadmap:in-progress"]}</div><div class="stat-label">${statusLabel("roadmap:in-progress")}</div></div>
      <div class="stat-card stat-status-shipped"><div class="stat-num">${byStage["roadmap:shipped"]}</div><div class="stat-label">${statusLabel("roadmap:shipped")}</div></div>
    `;
  } catch (e) {
    const fallback = '<div class="stat-card"><div class="stat-num">—</div><div class="stat-label">Couldn\'t load</div></div>';
    typeGrid.innerHTML = fallback;
    stageGrid.innerHTML = fallback;
  }
})();
