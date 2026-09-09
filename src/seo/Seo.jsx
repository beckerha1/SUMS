import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE,
  PAGES,
  SITE_NAME,
  SITE_ORIGIN,
  absoluteUrl,
  extraSchemasForPath,
} from './content';

function upsertMeta(attr, key, value) {
  if (!value) return;
  let element = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function upsertPageSchema(schemas) {
  let element = document.getElementById('page-schema');
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.id = 'page-schema';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
}

function pageForPath(pathname) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return Object.values(PAGES).find((entry) => entry.path === normalized) || null;
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pageForPath(pathname);
    const title = page ? page.title : DEFAULT_TITLE;
    const description = page ? page.description : DEFAULT_DESCRIPTION;
    const canonical = page ? absoluteUrl(page.path) : `${SITE_ORIGIN}${pathname}`;
    const robots = page ? 'index, follow' : 'noindex, follow';
    const ogType = page ? page.ogType : 'website';

    document.title = title;
    upsertMeta('name', 'title', title);
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', OG_IMAGE);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'twitter:url', canonical);
    upsertMeta('property', 'twitter:title', title);
    upsertMeta('property', 'twitter:description', description);
    upsertMeta('property', 'twitter:image', OG_IMAGE);
    upsertCanonical(canonical);
    upsertPageSchema(page ? extraSchemasForPath(page.path) : [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        url: canonical,
      },
    ]);

    const crawler = document.getElementById('crawler-content');
    if (crawler) {
      crawler.setAttribute('hidden', '');
      crawler.setAttribute('aria-hidden', 'true');
    }
  }, [pathname]);

  return null;
}
