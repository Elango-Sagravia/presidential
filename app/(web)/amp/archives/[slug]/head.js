export default function Head({ params }) {
  const slug = params.slug;

  return (
    <>
      <title>{slug}</title>
      <link
        rel="canonical"
        href={`https://www.presidentialsummary.com/archives/${slug}`}
      />
      <meta
        name="viewport"
        content="width=device-width,minimum-scale=1,initial-scale=1"
      />
      <script async src="https://cdn.ampproject.org/v0.js"></script>
      <script
        async
        custom-element="amp-img"
        src="https://cdn.ampproject.org/v0/amp-img-0.1.js"
      ></script>
      <style amp-boilerplate>{`body{visibility:hidden}`}</style>
      <noscript>
        <style amp-boilerplate>{`body{visibility:visible}`}</style>
      </noscript>
      <style amp-custom>{`
          body {
            font-family: serif;
            background: #fff;
            color: #000;
            line-height: 1.6;
          }
          h1 {
            font-size: 28px;
            color: #4d3060;
          }
          a {
            color: #4d3060;
            text-decoration: underline;
          }
          p {
            font-size: 16px;
          }
        `}</style>
    </>
  );
}
