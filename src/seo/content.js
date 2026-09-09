import copy from './copy.json';

export const SITE_ORIGIN = 'https://sums.games';
export const SITE_NAME = 'SUMS';
export const DEFAULT_TITLE = 'SUMS — Free Daily Number Puzzle Game';
export const DEFAULT_DESCRIPTION =
  'Play SUMS, a free daily number logic puzzle. Fill Mini (5×5) or Full (7×7) grids by placing numbers in order with adjacent sums. New puzzles every day.';
export const OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

export const FAQ_ITEMS = copy.faq;
export const HOW_TO_STEPS = copy.howToSteps;

export const PAGES = {
  home: {
    path: '/',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    ogType: 'website',
  },
  howToPlay: {
    path: '/how-to-play',
    title: 'How to Play SUMS | Daily Number Puzzle Rules',
    description:
      'Learn how to play SUMS in minutes. Place numbers in order by selecting adjacent cells that add up to the next number. Free daily Mini and Full puzzles.',
    ogType: 'article',
  },
  faq: {
    path: '/faq',
    title: 'SUMS FAQ | Daily Number Puzzle Questions',
    description:
      'Answers about SUMS: how to play, Mini vs Full, hard mode, daily reset time, streaks, and whether you need an account. Free to play at sums.games.',
    ogType: 'article',
  },
  about: {
    path: '/about',
    title: 'About SUMS | Daily Number Puzzle by Xavier Games',
    description:
      'SUMS is a free daily number logic puzzle created by Xavier Games. Learn what the game is, how a puzzle works, and the story behind sums.games.',
    ogType: 'article',
  },
  strategy: {
    path: '/strategy',
    title: 'SUMS Strategy Guide | Puzzle Difficulty Tips',
    description:
      'How SUMS difficulty works: clue pressure, walls, adjacency, and the Monday-to-Sunday difficulty ramp. Tips for solving Mini and Full daily puzzles.',
    ogType: 'article',
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy | SUMS Daily Puzzle',
    description:
      'How SUMS handles data: no account required, stats stored on your device, and details about cookies, Google Analytics, and AdSense.',
    ogType: 'article',
  },
};

export function absoluteUrl(pathname) {
  if (!pathname || pathname === '/') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${pathname}`;
}

export function webPageSchema(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: absoluteUrl(page.path),
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    about: { '@id': `${SITE_ORIGIN}/#game` },
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };
}

export function breadcrumbSchema(page) {
  if (page.path === '/') return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'SUMS',
        item: `${SITE_ORIGIN}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title.split('|')[0].trim(),
        item: absoluteUrl(page.path),
      },
    ],
  };
}

export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'SUMS FAQ',
    url: absoluteUrl(PAGES.faq.path),
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function howToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Play SUMS',
    description: PAGES.howToPlay.description,
    url: absoluteUrl(PAGES.howToPlay.path),
    image: OG_IMAGE,
    tool: [{ '@type': 'HowToTool', name: 'Web browser' }],
    step: HOW_TO_STEPS.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${absoluteUrl(PAGES.howToPlay.path)}#step-${index + 1}`,
    })),
  };
}

export function extraSchemasForPath(pathname) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  const page = Object.values(PAGES).find((entry) => entry.path === normalized);
  if (!page) return [];

  const schemas = [webPageSchema(page)];
  const crumbs = breadcrumbSchema(page);
  if (crumbs) schemas.push(crumbs);
  if (page.path === '/faq') schemas.push(faqSchema());
  if (page.path === '/how-to-play') schemas.push(howToSchema());
  return schemas;
}
