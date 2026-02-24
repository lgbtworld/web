import type { AppProps } from 'next/app';
import '../src/index.css';
import RootApp from '../src/RootApp';
import type { SSRPageProps } from '../lib/ssr-props';

export default function MyApp({ Component, pageProps }: AppProps) {
  const typed = pageProps as Partial<SSRPageProps>;
  return (
    <RootApp
      initialPath={typed.initialPath || '/'}
      ssrData={typed.ssrData}
      initialTheme={typed.initialTheme || 'dark'}
      pageContent={<Component {...pageProps} />}
    />
  );
}
