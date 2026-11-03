// api/submit-request: creates a public GitHub issue from the support site's
// form submission. Runs server-side so the browser never sees a GitHub
// token. Expects { type, title, body, contact } JSON.
const REPO = "kdht/BJJ-Mind-Map-Support";
const ALLOWED_TYPES = {
  "feature-request": ["feature-request", "enhancement"],
  "bug": ["bug"],
  "support-question": ["support-question"],
};

module.exports = async function (context, req) {
  const respond = (status, body) => {
    context.res = {
      status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
  };

  try {
    const { type, title, body, contact, website } = req.body || {};

    // Honeypot: real users never fill this hidden field.
    if (website) return respond(200, { ok: true });

    if (!type || !ALLOWED_TYPES[type]) return respond(400, { error: "Invalid request type." });
    if (!title || typeof title !== "string" || !title.trim()) return respond(400, { error: "Title is required." });
    if (!body || typeof body !== "string" || !body.trim()) return respond(400, { error: "Details are required." });
    if (title.length > 150) return respond(400, { error: "Title is too long." });
    if (body.length > 4000) return respond(400, { error: "Details are too long." });

    const token = process.env.GITHUB_ISSUES_TOKEN;
    if (!token) {
      context.log.error("GITHUB_ISSUES_TOKEN is not configured");
      return respond(500, { error: "Submissions are temporarily unavailable. Please try again later." });
    }

    const safeContact = typeof contact === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? contact : null;
    const issueBody = [
      body.trim(),
      "",
      "---",
      `_Submitted via the support site${safeContact ? ` by ${safeContact}` : " (anonymous)"}._`,
    ].join("\n");

    const ghRes = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "bjjmindmap-support-site",
      },
      body: JSON.stringify({
        title: title.trim().slice(0, 150),
        body: issueBody.slice(0, 5000),
        labels: ALLOWED_TYPES[type],
      }),
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text().catch(() => "");
      context.log.error("GitHub issue creation failed", ghRes.status, errText);
      return respond(502, { error: "Couldn't submit right now. Please try again shortly." });
    }

    const issue = await ghRes.json();
    return respond(200, { ok: true, url: issue.html_url, number: issue.number });
  } catch (err) {
    context.log.error(err);
    return respond(500, { error: "Unexpected error. Please try again." });
  }
};
