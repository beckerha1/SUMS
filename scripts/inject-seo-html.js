'use strict';

const fs = require('fs');
const path = require('path');

const copy = require('../src/seo/copy.json');
const ROOT = path.join(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const ORIGIN = 'https://sums.games';

const PAGES = {
  '/how-to-play': {
    dir: 'how-to-play',
    title: 'How to Play SUMS | Daily Number Puzzle Rules',
    description:
      'Learn how to play SUMS in minutes. Place numbers in order by selecting adjacent cells that add up to the next number. Free daily Mini and Full puzzles.',
    crawler: howToCrawler(),
    schema: [
      webPage('How to Play SUMS | Daily Number Puzzle Rules', '/how-to-play'),
      breadcrumbs('How to Play SUMS', '/how-to-play'),
      howToSchema(),
    ],
  },
  '/faq': {
    dir: 'faq',
    title: 'SUMS FAQ | Daily Number Puzzle Questions',
    description:
      'Answers about SUMS: how to play, Mini vs Full, hard mode, daily reset time, streaks, and whether you need an account. Free to play at sums.games.',
    crawler: faqCrawler(),
    schema: [
      webPage('SUMS FAQ | Daily Number Puzzle Questions', '/faq'),
      breadcrumbs('SUMS FAQ', '/faq'),
      faqSchema(),
    ],
  },
  '/about': {
    dir: 'about',
    title: 'About SUMS | Daily Number Puzzle by Xavier Games',
    description:
      'SUMS is a free daily number logic puzzle created by Xavier Games. Learn what the game is, how a puzzle works, and the story behind sums.games.',
    crawler: aboutCrawler(),
    schema: [
      webPage('About SUMS | Daily Number Puzzle by Xavier Games', '/about'),
      breadcrumbs('About SUMS', '/about'),
    ],
  },
  '/strategy': {
    dir: 'strategy',
    title: 'SUMS Strategy Guide | Puzzle Difficulty Tips',
    description:
      'How SUMS difficulty works: clue pressure, walls, adjacency, and the Monday-to-Sunday difficulty ramp. Tips for solving Mini and Full daily puzzles.',
    crawler: strategyCrawler(),
    schema: [
      webPage('SUMS Strategy Guide | Puzzle Difficulty Tips', '/strategy'),
      breadcrumbs('SUMS Strategy Guide', '/strategy'),
    ],
  },
  '/privacy': {
    dir: 'privacy',
    title: 'Privacy Policy | SUMS Daily Puzzle',
    description:
      'How SUMS handles data: no account required, stats stored on your device, and details about cookies, Google Analytics, and AdSense.',
    crawler: privacyCrawler(),
    schema: [
      webPage('Privacy Policy | SUMS Daily Puzzle', '/privacy'),
      breadcrumbs('Privacy Policy', '/privacy'),
    ],
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nav() {
  return `<nav aria-label="About SUMS"><ul>
    <li><a href="${ORIGIN}/">Play SUMS</a></li>
    <li><a href="${ORIGIN}/how-to-play">How to play</a></li>
    <li><a href="${ORIGIN}/strategy">Strategy</a></li>
    <li><a href="${ORIGIN}/faq">FAQ</a></li>
    <li><a href="${ORIGIN}/about">About</a></li>
    <li><a href="${ORIGIN}/privacy">Privacy</a></li>
  </ul></nav>`;
}

function wrap(title, body) {
  return `<h1>${escapeHtml(title)}</h1>${nav()}${body}`;
}

function howToCrawler() {
  const steps = copy.howToSteps
    .map((step, index) => `<li id="step-${index + 1}"><strong>${escapeHtml(step.name)}.</strong> ${escapeHtml(step.text)}</li>`)
    .join('');
  return wrap('How to Play SUMS', `<p>SUMS is a free daily number logic puzzle. Fill a grid by placing numbers in order using adjacent sums. Mini SUMS is 5×5; Full SUMS is 7×7. New puzzles publish daily at midnight Eastern Time.</p><h2>Rules, step by step</h2><ol>${steps}</ol>`);
}

function faqCrawler() {
  const items = copy.faq
    .map((item) => `<h2>${escapeHtml(item.question)}</h2><p>${escapeHtml(item.answer)}</p>`)
    .join('');
  return wrap('SUMS FAQ', `<p>Common questions about the free daily number puzzle at sums.games.</p>${items}`);
}

function aboutCrawler() {
  return wrap(
    'About SUMS',
    `<h2>What is SUMS?</h2><p>SUMS is a daily number logic puzzle that combines spatial reasoning with addition. Each day brings a new Mini (5×5) and Full (7×7) puzzle.</p><h2>How to play</h2><p>Place numbers in order by selecting adjacent cells that sum to the next number, then drop the result in a touching empty cell. Gray numbers are clues you must route through.</p><p>Created by Xavier Games. <a href="${ORIGIN}/how-to-play">Full how-to-play guide</a>.</p>`
  );
}

function strategyCrawler() {
  return wrap(
    'SUMS Strategy Guide',
    `<p>SUMS gets harder when each placement leaves fewer legal continuations — not simply when the grid is larger.</p><h2>What increases difficulty</h2><ul><li>Higher target numbers that depend on earlier placements</li><li>Fewer clues, so you build more of the board yourself</li><li>Low-number clues that constrain the opening</li><li>Tight geometry and black-square walls</li></ul><p>Puzzles ramp from Monday difficulty 1 to Sunday difficulty 7.</p>`
  );
}

function privacyCrawler() {
  return wrap(
    'Privacy Policy',
    `<p>SUMS does not require an account. Game statistics stay in your browser’s local storage. The site uses Google Analytics and Google AdSense, which may set cookies. Contact harrison.x.becker@gmail.com with questions.</p>`
  );
}

function webPage(name, pathname) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url: `${ORIGIN}${pathname}`,
    isPartOf: { '@id': `${ORIGIN}/#website` },
    about: { '@id': `${ORIGIN}/#game` },
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };
}

function breadcrumbs(name, pathname) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'SUMS', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name, item: `${ORIGIN}${pathname}` },
    ],
  };
}

function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'SUMS FAQ',
    url: `${ORIGIN}/faq`,
    mainEntity: copy.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

function howToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Play SUMS',
    description:
      'Learn how to play SUMS in minutes. Place numbers in order by selecting adjacent cells that add up to the next number. Free daily Mini and Full puzzles.',
    url: `${ORIGIN}/how-to-play`,
    step: copy.howToSteps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${ORIGIN}/how-to-play#step-${index + 1}`,
    })),
  };
}

function applyPage(html, page, pathname) {
  const url = `${ORIGIN}${pathname}`;
  let next = html;
  next = next.replace(/<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`);
  next = next.replace(
    /<meta name="title" content="[^"]*" \/>/,
    `<meta name="title" content="${escapeHtml(page.title)}" />`
  );
  next = next.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(page.description)}" />`
  );
  next = next.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`
  );
  next = next.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${url}" />`
  );
  next = next.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`
  );
  next = next.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`
  );
  next = next.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="article" />`
  );
  next = next.replace(
    /<meta property="twitter:url" content="[^"]*" \/>/,
    `<meta property="twitter:url" content="${url}" />`
  );
  next = next.replace(
    /<meta property="twitter:title" content="[^"]*" \/>/,
    `<meta property="twitter:title" content="${escapeHtml(page.title)}" />`
  );
  next = next.replace(
    /<meta property="twitter:description" content="[^"]*" \/>/,
    `<meta property="twitter:description" content="${escapeHtml(page.description)}" />`
  );
  next = next.replace(
    /<script type="application\/ld\+json" id="page-schema">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" id="page-schema">\n${JSON.stringify(page.schema, null, 2)}\n  </script>`
  );
  next = next.replace(
    /<article id="crawler-content"[^>]*>[\s\S]*?<\/article>/,
    `<article id="crawler-content" style="max-width:720px;margin:24px auto;padding:0 16px;font-family:Arial,sans-serif;line-height:1.6;color:#222;">${page.crawler}</article>`
  );
  return next;
}

function main() {
  const indexPath = path.join(BUILD, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('build/index.html is missing. Run the CRA build first.');
  }
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  Object.entries(PAGES).forEach(([pathname, page]) => {
    const dir = path.join(BUILD, page.dir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), applyPage(indexHtml, page, pathname));
    console.log(`Wrote build/${page.dir}/index.html`);
  });
}

main();
