// BJJ Mind Map support site -- no build step, plain JS.
const REPO = "kdht/BJJ-Mind-Map-Support";
const STATUS_LABELS = ["roadmap:planned", "roadmap:in-progress", "roadmap:shipped"];
const TYPE_LABELS = ["bug", "feature-request", "support-question"];

function typeOf(issue) {
  const names = issue.labels.map((l) => l.name || l);
  for (const t of TYPE_LABELS) if (names.includes(t)) return t;
  if (names.includes("enhancement")) return "feature-request";
  return "other";
}
function statusOf(issue) {
  const names = issue.labels.map((l) => l.name || l);
  return STATUS_LABELS.find((s) => names.includes(s)) || null;
}
function typeLabel(t) {
  return { bug: "Bug", "feature-request": "Feature", "support-question": "Support", other: "Other" }[t] || "Other";
}
function statusLabel(s) {
  return { "roadmap:planned": "Planned", "roadmap:in-progress": "In progress", "roadmap:shipped": "Shipped" }[s] || null;
}
function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

let allIssues = [];

async function fetchIssues() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/issues?state=open&per_page=100`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error("GitHub API " + res.status);
  return (await res.json()).filter((i) => !i.pull_request);
}

// --- Roadmap: 3 status columns. ---
function renderRoadmap(issues) {
  const lists = {
    "roadmap:planned": document.querySelector('[data-list="roadmap:planned"]'),
    "roadmap:in-progress": document.querySelector('[data-list="roadmap:in-progress"]'),
    "roadmap:shipped": document.querySelector('[data-list="roadmap:shipped"]'),
  };
  let any = false;
  for (const status of Object.keys(lists)) {
    const matching = issues.filter((i) => statusOf(i) === status);
    const ul = lists[status];
    ul.innerHTML = "";
    if (!matching.length) {
      ul.innerHTML = '<li class="skeleton">Nothing here yet</li>';
      continue;
    }
    any = true;
    for (const issue of matching) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = issue.html_url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = issue.title;
      li.appendChild(a);
      ul.appendChild(li);
    }
  }
  if (!any) document.getElementById("roadmap-fallback").hidden = false;
}

// --- Issues & bugs: a filterable card grid of every open item. ---
let activeFilter = "all";
function renderIssueGrid(issues) {
  const grid = document.getElementById("issue-grid");
  const filtered = activeFilter === "all" ? issues : issues.filter((i) => typeOf(i) === activeFilter);
  grid.innerHTML = "";
  if (!filtered.length) {
    grid.innerHTML = '<div class="empty">Nothing here yet.</div>';
    return;
  }
  // Newest first.
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
  renderIssueGrid(allIssues);
});

async function loadAll() {
  try {
    allIssues = await fetchIssues();
    renderRoadmap(allIssues);
    renderIssueGrid(allIssues);
  } catch (e) {
    document.getElementById("roadmap-fallback").hidden = false;
    document.getElementById("issue-grid").innerHTML = '<div class="empty">Couldn\'t load right now -- <a href="https://github.com/kdht/BJJ-Mind-Map-Support/issues" target="_blank" rel="noopener">view on GitHub</a>.</div>';
  }
}
loadAll();

// --- Feature request form: posts to our own Azure Function (api/submit-request),
// which creates the GitHub issue server-side using a stored token. The
// browser never touches a GitHub token. ---
const form = document.getElementById("request-form");
const statusEl = document.getElementById("f-status");
const submitBtn = document.getElementById("f-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form-status";

  const data = Object.fromEntries(new FormData(form).entries());
  if (data.website) return; // honeypot tripped, silently drop

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";
  try {
    const res = await fetch("/api/submit-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || `Request failed (${res.status})`);
    statusEl.textContent = `Thanks! Your ${data.type.replace("-", " ")} was submitted. `;
    if (out.url) {
      const a = document.createElement("a");
      a.href = out.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "View it on GitHub →";
      statusEl.appendChild(a);
    }
    statusEl.className = "form-status ok";
    form.reset();
    // Refresh the live views so the new submission shows up immediately.
    loadAll();
  } catch (err) {
    statusEl.textContent = "Something went wrong: " + err.message + ". Please try again in a moment.";
    statusEl.className = "form-status err";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
});
