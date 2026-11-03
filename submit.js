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
