/**
 * Server-side TipTap content renderer
 * Converts TipTap JSON to HTML for SEO and non-JS environments
 */

import type { TipTapNode } from "./utils";
import { generateSlug } from "./utils";

/**
 * Render TipTap JSON content to HTML string
 */
export function renderTipTapToHtml(json: TipTapNode): string {
  if (!json) return "";
  return renderNode(json);
}

function renderNode(node: TipTapNode): string {
  if (!node) return "";

  // Text node
  if (node.text) {
    return renderMarks(escapeHtml(node.text), node.marks);
  }

  // Container node
  const children = node.content?.map(renderNode).join("") || "";

  switch (node.type) {
    case "doc":
      return children;

    case "paragraph":
      return `<p>${children}</p>`;

    case "heading": {
      const level = node.attrs?.level || 2;
      const text = extractPlainText(node);
      const id = generateSlug(text);
      return `<h${level} id="${id}">${children}</h${level}>`;
    }

    case "bulletList":
      return `<ul>${children}</ul>`;

    case "orderedList":
      return `<ol>${children}</ol>`;

    case "listItem":
      return `<li>${children}</li>`;

    case "blockquote":
      return `<blockquote>${children}</blockquote>`;

    case "codeBlock": {
      const language = node.attrs?.language || "";
      return `<pre><code class="language-${language}">${children}</code></pre>`;
    }

    case "horizontalRule":
      return "<hr />";

    case "hardBreak":
      return "<br />";

    case "image": {
      const src = String(node.attrs?.src || "");
      const alt = String(node.attrs?.alt || "");
      const title = String(node.attrs?.title || "");
      return `<figure><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" ${title ? `title="${escapeAttr(title)}"` : ""} loading="lazy" />${title ? `<figcaption>${escapeHtml(title)}</figcaption>` : ""}</figure>`;
    }

    case "citation": {
      const key = String(node.attrs?.key || "");
      const text = String(node.attrs?.text || key);
      return `<cite data-citation-key="${escapeAttr(key)}">${escapeHtml(text)}</cite>`;
    }

    case "callout": {
      const type = node.attrs?.type || "info";
      return `<aside class="callout callout-${type}" role="note">${children}</aside>`;
    }

    default:
      return children;
  }
}

function renderMarks(
  text: string,
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
): string {
  if (!marks || marks.length === 0) {
    return text;
  }

  let result = text;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        result = `<strong>${result}</strong>`;
        break;
      case "italic":
        result = `<em>${result}</em>`;
        break;
      case "underline":
        result = `<u>${result}</u>`;
        break;
      case "strike":
        result = `<s>${result}</s>`;
        break;
      case "code":
        result = `<code>${result}</code>`;
        break;
      case "link": {
        const href = mark.attrs?.href || "";
        const target = mark.attrs?.target || "_blank";
        const rel =
          target === "_blank" ? 'rel="noopener noreferrer"' : "";
        result = `<a href="${escapeAttr(String(href))}" target="${target}" ${rel}>${result}</a>`;
        break;
      }
      case "subscript":
        result = `<sub>${result}</sub>`;
        break;
      case "superscript":
        result = `<sup>${result}</sup>`;
        break;
      case "highlight": {
        const color = mark.attrs?.color || "yellow";
        result = `<mark style="background-color: ${escapeAttr(String(color))}">${result}</mark>`;
        break;
      }
    }
  }

  return result;
}

function extractPlainText(node: TipTapNode): string {
  if (node.text) {
    return node.text;
  }
  if (node.content) {
    return node.content.map(extractPlainText).join("");
  }
  return "";
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Strip all HTML/formatting from TipTap content
 * Useful for search indexing and excerpts
 */
export function stripTipTapContent(json: TipTapNode): string {
  if (!json) return "";

  let text = "";

  if (json.text) {
    text += json.text;
  }

  if (json.content) {
    for (const child of json.content) {
      text += stripTipTapContent(child);
      // Add space after block elements
      if (
        ["paragraph", "heading", "listItem", "blockquote"].includes(
          child.type || ""
        )
      ) {
        text += " ";
      }
    }
  }

  return text.replace(/\s+/g, " ").trim();
}
