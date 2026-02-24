'use client';

import React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

type NavigateOptions = {
  replace?: boolean;
  state?: any;
};

type LocationShape = {
  pathname: string;
  search: string;
  hash: string;
  state: null;
};

function parseLocation(asPath: string): Omit<LocationShape, 'state'> {
  const url = new URL(asPath || '/', 'http://localhost');
  return {
    pathname: url.pathname || '/',
    search: url.search || '',
    hash: url.hash || '',
  };
}

export function useLocation(): LocationShape {
  const router = useRouter();
  const parsed = React.useMemo(() => parseLocation(router.asPath || '/'), [router.asPath]);
  return { ...parsed, state: null };
}

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      if (to === -1) {
        router.back();
      }
      return;
    }

    if (options?.replace) {
      void router.replace(to);
    } else {
      void router.push(to);
    }
  };
}

export function useParams<T extends Record<string, string | undefined>>() {
  const router = useRouter();
  const query = router.query || {};
  return query as T;
}

export function Link({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NextLink href={href} className={className}>
      {children}
    </NextLink>
  );
}
