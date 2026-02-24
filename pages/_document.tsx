import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";

type Props = {
  initialTheme: 'light' | 'dark';
};

export default function MyDocument({ initialTheme }: Props) {
  return (
    <Html lang="en" className={initialTheme}>
      <Head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icons/icon_512x512.png" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const initialProps = await Document.getInitialProps(ctx);
  const cookieHeader = ctx.req?.headers?.cookie || '';
  const themeCookie = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('theme='))
    ?.split('=')[1];
  const initialTheme: 'light' | 'dark' = themeCookie === 'light' ? 'light' : 'dark';

  return {
    ...initialProps,
    initialTheme,
  };
};
