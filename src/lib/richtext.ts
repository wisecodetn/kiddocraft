import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

// Rich text written in the admin editor (Quill) is stored as HTML. Content created before the editor
// existed is Markdown; both are accepted everywhere and turned into the same safe HTML.

/** True when the content is already HTML (from the editor) rather than Markdown. */
export const isHtml = (content: string) => /^\s*<(p|h[1-6]|ul|ol|blockquote|div|img|iframe|pre)\b/i.test(content);

/** Markdown → HTML (older content, seed data). */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false, gfm: true, breaks: false });
}

const YOUTUBE = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/[\w-]+/;
const SITE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost").host;
  } catch {
    return "";
  }
})();

const isExternal = (href: string) => {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    return new URL(href).host !== SITE_HOST;
  } catch {
    return true;
  }
};

/**
 * Allow-list sanitizer for editor HTML: structure and formatting only, no scripts, styles limited to colours,
 * iframes only from YouTube. Also applies SEO/perf defaults: H1 → H2 (the page already has its H1),
 * lazy images, external links opened safely in a new tab.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "img", "iframe", "span", "pre", "code", "hr"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      iframe: ["src", "title", "allow", "allowfullscreen", "frameborder", "loading"],
      "*": ["class", "style"],
    },
    allowedClasses: { "*": ["ql-align-center", "ql-align-right", "ql-align-justify", "ql-direction-rtl", "ql-video"] },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i],
        "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i],
        "text-align": [/^(left|right|center|justify)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    exclusiveFilter: (frame) => frame.tag === "iframe" && !YOUTUBE.test(frame.attribs.src ?? ""),
    transformTags: {
      h1: "h2",
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, alt: attribs.alt ?? "", loading: "lazy", decoding: "async" } }),
      iframe: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy", allowfullscreen: "true", frameborder: "0", title: attribs.title || "Vidéo" } }),
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        if (!isExternal(href)) {
          const rest = { ...attribs };
          delete rest.target;
          delete rest.rel;
          return { tagName, attribs: rest };
        }
        // Keep an explicit nofollow/sponsored choice; always add noopener.
        const rel = new Set((attribs.rel ?? "").split(/\s+/).filter(Boolean));
        rel.add("noopener");
        return { tagName, attribs: { ...attribs, target: "_blank", rel: [...rel].join(" ") } };
      },
    },
  });
}

/** Any stored content (HTML or legacy Markdown) → safe HTML for display or for loading into the editor. */
export function richTextHtml(content: string): string {
  if (!content.trim()) return "";
  return sanitizeRichText(isHtml(content) ? content : markdownToHtml(content));
}

/** Plain text of rich content (for meta descriptions, word counts, reading time). */
export function richTextPlain(content: string): string {
  const html = isHtml(content) ? content : markdownToHtml(content);
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
