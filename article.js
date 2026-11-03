// article.html loader: fetch the requested article's markdown from
// /articles/<slug>.md and render it client-side (marked + DOMPurify,
// same libraries the main app uses), so support content is hosted here
// directly instead of linking out to GitHub's wiki UI.
const ALLOWED_SLUGS = new Set([
  "getting-started",
  "creating-your-first-mind-map",
  "using-the-ai-coach",
  "journal-rich-text-vs-markdown",
  "promotion-tracking",
  "account-and-billing",
  "troubleshooting-sign-in",
]);

const params = new URLSearchParams(location.search);
const slug = (params.get("slug") || "").toLowerCase();
const el = document.getElementById("article-body");

async function load() {
  if (!ALLOWED_SLUGS.has(slug)) {
    el.innerHTML = '<h1>Article not found</h1><p>That article doesn\'t exist. <a href="/#articles">Browse all support articles</a>.</p>';
    return;
  }
  try {
    const res = await fetch(`/articles/${slug}.md`);
    if (!res.ok) throw new Error("not found");
    const md = await res.text();
    document.title = (md.match(/^#\s+(.+)$/m)?.[1] || "Support Article") + " — BJJ Mind Map";
    const html = DOMPurify.sanitize(marked.parse(md), {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "code", "pre", "blockquote", "h1", "h2", "h3", "ul", "ol", "li", "a", "hr"],
      ALLOWED_ATTR: ["href", "title"],
      ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/|#)/i,
    });
    el.innerHTML = html;
  } catch {
    el.innerHTML = '<h1>Couldn\'t load this article</h1><p>Please try again, or <a href="/#articles">browse all support articles</a>.</p>';
  }
}
load();
