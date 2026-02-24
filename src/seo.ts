export type SeoConfig = {
  title: string;
  description: string;
  noindex?: boolean;
};

export const DEFAULT_SEO_DESCRIPTION =
  'CoolVibes is an inclusive social app to connect, chat, and discover people and communities.';

export const SEO_BY_PATH: Array<{ pattern: RegExp; config: SeoConfig }> = [
  {
    pattern: /^\/$/,
    config: {
      title: 'CoolVibes - Inclusive Social Community',
      description: DEFAULT_SEO_DESCRIPTION,
    },
  },
  {
    pattern: /^\/(home|pride|landing)$/,
    config: {
      title: 'CoolVibes - Inclusive Social Community',
      description: DEFAULT_SEO_DESCRIPTION,
    },
  },
  {
    pattern: /^\/search$/,
    config: {
      title: 'Search - CoolVibes',
      description: 'Search users, topics, and conversations on CoolVibes.',
    },
  },
  {
    pattern: /^\/[A-Za-z0-9_.-]+$/,
    config: {
      title: 'Profile - CoolVibes',
      description: 'View user profiles and discover more on CoolVibes.',
    },
  },
  {
    pattern: /^\/[A-Za-z0-9_.-]+\/status\/[^/]+$/,
    config: {
      title: 'Post - CoolVibes',
      description: 'Read posts and join the conversation on CoolVibes.',
    },
  },
  {
    pattern: /^\/status\/[^/]+$/,
    config: {
      title: 'Post - CoolVibes',
      description: 'Read posts and join the conversation on CoolVibes.',
    },
  },
  {
    pattern: /^\/(messages|notifications|wallet|match|nearby|places|classifieds|premium|testpage|profile)$/,
    config: {
      title: 'CoolVibes App',
      description: DEFAULT_SEO_DESCRIPTION,
      noindex: true,
    },
  },
];

export const getSeoForPath = (pathname: string): SeoConfig => {
  for (const entry of SEO_BY_PATH) {
    if (entry.pattern.test(pathname)) return entry.config;
  }
  return {
    title: 'CoolVibes',
    description: DEFAULT_SEO_DESCRIPTION,
    noindex: true,
  };
};
