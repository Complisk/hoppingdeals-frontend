type JsonLdData =
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

/**
 * Injects JSON-LD structured data into a server-rendered page.
 *
 * Server Component — render it next to the page content from any App Router
 * page file (do NOT add `"use client"`).
 */
const JsonLd = ({ data }: { data: JsonLdData }) => {
  // Escape `<` so user-generated content (e.g. promotion titles) can never
  // terminate the <script> tag early — `\u003c` is valid JSON and reads as `<`.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
};

export default JsonLd;
