export default function SEO({
  title,
  description,
  keywords,
  canonical,
  image,
  type = "website",
  noIndex = false,
  schema,
}) {
  const href =
    canonical ||
    (typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : undefined);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {href && <link rel="canonical" href={href} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {href && <meta property="og:url" content={href} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </>
  );
}
