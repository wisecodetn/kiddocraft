import { richTextHtml } from "@/lib/richtext";

/** Displays content written in the admin editor (or older Markdown), sanitized server-side. */
export function RichText({ children, className = "" }: { children: string; className?: string }) {
  const html = richTextHtml(children);
  if (!html) return null;
  return <div className={`prose-kc ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
