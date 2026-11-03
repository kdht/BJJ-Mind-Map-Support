// BJJ Mind Map support site -- no build step, plain JS.
const REPO = "kdht/BJJ-Mind-Map-Support";

// --- Roadmap: fetch public issues from GitHub's REST API directly (no auth
// needed for a public repo's issue reads) and bucket by status label. ---
async function loadRoadmap() {
  const lists = {
    "roadmap:planned": document.querySelector('[data-list="roadmap:planned"]'),
    "roadmap:in-progress": document.querySelector('[data-list="roadmap:in-progress"]'),
    "roadmap:shipped": document.querySelector('[data-list="roadmap:shipped"]'),
  };
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/issues?state=open&per_page=100`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error("GitHub API " + res.status);
    const issues = (await res.json()).filter((i) => !i.pull_request);
    let any = false;
    for (const status of Object.keys(lists)) {
      const matching = issues.filter((i) => i.labels.some((l) => (l.name || l) === status));
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
  } catch (e) {
    document.getElementById("roadmap-fallback").hidden = false;
    for (const ul of Object.values(lists)) {
      if (ul) ul.innerHTML = '<li class="skeleton">Couldn\'t load</li>';
    }
  }
}
loadRoadmap();

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
  } catch (err) {
    statusEl.textContent = "Something went wrong: " + err.message + ". Please try again in a moment.";
    statusEl.className = "form-status err";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
});
