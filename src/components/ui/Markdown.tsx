import ReactMarkdown from "react-markdown";

/** Renders admin-written Markdown. Raw HTML is not rendered (react-markdown escapes it). */
export function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={`prose-kc ${className}`}>
      <ReactMarkdown
        components={{
          // Article titles are the page h1; demote any "# " written in the content.
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
                {children}
              </a>
            );
          },
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} loading="lazy" decoding="async" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
