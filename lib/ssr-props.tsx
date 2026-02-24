import type { GetServerSidePropsContext } from 'next';
import type { IncomingHttpHeaders } from 'node:http';
import Head from 'next/head';
import type { ReactNode } from 'react';
import { getSeoForPath } from '../src/seo';
import { Actions } from '../src/services/actions';
import type { SSRDataPayload } from '../src/contexts/SSRDataContext';

export type SSRPageProps = {
  initialPath: string;
  seo: ReturnType<typeof getSeoForPath> & { canonical: string; robots: string };
  ssrData: SSRDataPayload;
  initialTheme: 'light' | 'dark';
};

export type StaticPageResult = {
  props: SSRPageProps;
  revalidate: number;
};

const RESERVED_SINGLE_SEGMENT_ROUTES = new Set([
  'home',
  'pride',
  'landing',
  'search',
  'match',
  'nearby',
  'places',
  'profile',
  'messages',
  'notifications',
  'classifieds',
  'premium',
  'testpage',
  'wallet',
  'status',
]);

const getApiBaseUrl = (headers?: IncomingHttpHeaders) => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.API_URL) return process.env.API_URL;

  const host = headers?.host || '';
  const isLocalHost =
    host.includes('localhost') || host.includes('127.0.0.1') || host.startsWith('192.168.');

  if (isLocalHost) {
    return 'http://localhost:3001';
  }

  return 'https://api.coolvibes.lgbt';
};

export const callAction = async (
  context: GetServerSidePropsContext,
  action: string,
  payload: Record<string, unknown>
) => {
  const cookieHeader = context.req.headers.cookie || '';
  const authCookieValue = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('authToken='))
    ?.split('=')[1];
  const decodedAuthCookie = authCookieValue ? decodeURIComponent(authCookieValue) : null;
  const cookieAuthHeader = decodedAuthCookie
    ? decodedAuthCookie.startsWith('Bearer ')
      ? decodedAuthCookie
      : `Bearer ${decodedAuthCookie}`
    : null;

  const response = await fetch(`${getApiBaseUrl(context.req.headers)}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(context.req.headers.cookie ? { cookie: context.req.headers.cookie } : {}),
      ...(context.req.headers.authorization
        ? { authorization: context.req.headers.authorization as string }
        : cookieAuthHeader
          ? { authorization: cookieAuthHeader }
          : {}),
    },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
};

export const createSSRPageProps = async (
  context: GetServerSidePropsContext,
  path: string
): Promise<SSRPageProps> => {
  const normalizedPath = path.replace(/\/$/, '') || '/';
  const segments = normalizedPath.split('/').filter(Boolean);
  const seoConfig = getSeoForPath(normalizedPath);
  const host = context.req.headers.host || 'coolvibes.lgbt';
  const canonical = `https://${host}${normalizedPath}`;
  const robots = seoConfig.noindex ? 'noindex,nofollow' : 'index,follow';
  const cookieHeader = context.req.headers.cookie || '';
  const authCookieValue = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('authToken='))
    ?.split('=')[1];
  const decodedAuthCookie = authCookieValue ? decodeURIComponent(authCookieValue) : null;
  const headerAuthRaw = (context.req.headers.authorization as string | undefined) || null;
  const headerToken = headerAuthRaw ? headerAuthRaw.replace(/^Bearer\s+/i, '').trim() : null;
  const resolvedAuthToken = decodedAuthCookie || headerToken || null;
  const themeCookie = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('theme='))
    ?.split('=')[1];
  const initialTheme: 'light' | 'dark' = themeCookie === 'light' ? 'light' : 'dark';

  const ssrData: SSRDataPayload = { pathname: normalizedPath };
  ssrData.authToken = resolvedAuthToken;

  if (resolvedAuthToken) {
    const authUserResponse = await callAction(context, Actions.CMD_AUTH_USER_INFO, {});
    const authUser = authUserResponse?.user || authUserResponse || null;
    if (authUser) {
      ssrData.authUser = authUser;
    }
  }

  if (segments.length === 1 && !RESERVED_SINGLE_SEGMENT_ROUTES.has(segments[0])) {
    const username = segments[0];
    const profileResponse = await callAction(context, Actions.USER_FETCH_PROFILE, {
      nickname: username,
    });
    const profileData = profileResponse?.user || profileResponse || null;
    if (profileData) {
      ssrData.profileByUsername = { [username]: profileData };
    }
  }

  if (
    (segments.length === 3 && segments[1] === 'status' && segments[2]) ||
    (segments.length === 2 && segments[0] === 'status' && segments[1])
  ) {
    const postId = segments[segments.length - 1];
    const postResponse = await callAction(context, Actions.POST_FETCH, { post_id: postId });
    const postData = postResponse?.post || postResponse || null;
    if (postData) {
      ssrData.postById = { [String(postId)]: postData };
    }
  }

  if (normalizedPath === '/nearby') {
    const nearbyResponse = await callAction(context, Actions.CMD_USER_FETCH_NEARBY_USERS, {
      limit: 100,
      cursor: null,
    });
    const nearbyUsers = Array.isArray(nearbyResponse?.users) ? nearbyResponse.users : [];
    const nearbyCursor = nearbyResponse?.next_cursor ?? null;
    ssrData.nearby = {
      users: nearbyUsers,
      nextCursor: nearbyCursor,
    };
  }

  return {
    initialPath: normalizedPath,
    seo: {
      ...seoConfig,
      canonical,
      robots,
    },
    ssrData,
    initialTheme,
  };
};

export const createStaticPageProps = (path: string): StaticPageResult => {
  const normalizedPath = path.replace(/\/$/, '') || '/';
  const seoConfig = getSeoForPath(normalizedPath);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coolvibes.lgbt';
  const canonical = `${siteUrl}${normalizedPath}`;
  const robots = seoConfig.noindex ? 'noindex,nofollow' : 'index,follow';

  return {
    props: {
      initialPath: normalizedPath,
      seo: {
        ...seoConfig,
        canonical,
        robots,
      },
      ssrData: { pathname: normalizedPath },
      initialTheme: 'dark',
    },
    revalidate: 60,
  };
};

export function SSRPage({
  seo,
  children,
}: SSRPageProps & { children?: ReactNode }) {
  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="robots" content={seo.robots} />
        <link rel="canonical" href={seo.canonical} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.canonical} />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
      </Head>
      {children}
    </>
  );
}
