(async function () {
  const { fetchIssues, statusOf } = window.SupportData;
  const lists = {
    "roadmap:planned": document.querySelector('[data-list="roadmap:planned"]'),
    "roadmap:in-progress": document.querySelector('[data-list="roadmap:in-progress"]'),
    "roadmap:shipped": document.querySelector('[data-list="roadmap:shipped"]'),
  };
  try {
    const issues = await fetchIssues();
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
  } catch (e) {
    document.getElementById("roadmap-fallback").hidden = false;
    for (const ul of Object.values(lists)) {
      if (ul) ul.innerHTML = '<li class="skeleton">Couldn\'t load</li>';
    }
  }
})();
