// Shared helpers across all pages: fetch + classify GitHub issues.
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
async function fetchIssues() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/issues?state=open&per_page=100`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error("GitHub API " + res.status);
  return (await res.json()).filter((i) => !i.pull_request);
}

window.SupportData = { REPO, typeOf, statusOf, typeLabel, statusLabel, timeAgo, fetchIssues };
