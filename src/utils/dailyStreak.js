const LEGACY_COUNT = 'sums-daily-streak-count';
const LEGACY_LAST = 'sums-daily-streak-last-day';

const modeKeys = (mode) => ({
  count: `sums-daily-streak-${mode}-count`,
  last: `sums-daily-streak-${mode}-last-day`
});

export function getEasternDateKey(date = new Date()) {
  const est = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const y = est.getFullYear();
  const m = String(est.getMonth() + 1).padStart(2, '0');
  const d = String(est.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getEasternYesterdayKey(date = new Date()) {
  const est = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  est.setDate(est.getDate() - 1);
  const y = est.getFullYear();
  const m = String(est.getMonth() + 1).padStart(2, '0');
  const d = String(est.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function loadMode(mode) {
  const { count: cKey, last: lKey } = modeKeys(mode);
  const countRaw = parseInt(localStorage.getItem(cKey) || '0', 10);
  const count = Number.isFinite(countRaw) && countRaw >= 0 ? countRaw : 0;
  const lastWinDay = localStorage.getItem(lKey);
  return { count, lastWinDay: lastWinDay || null };
}

function persistMode(mode, count, lastWinDay) {
  const { count: cKey, last: lKey } = modeKeys(mode);
  if (count > 0 && lastWinDay) {
    localStorage.setItem(cKey, String(count));
    localStorage.setItem(lKey, lastWinDay);
  } else {
    localStorage.removeItem(cKey);
    localStorage.removeItem(lKey);
  }
}

function migrateLegacyIfNeeded() {
  const legacyC = localStorage.getItem(LEGACY_COUNT);
  const legacyL = localStorage.getItem(LEGACY_LAST);
  if (!legacyC || !legacyL) return;
  const countRaw = parseInt(legacyC, 10);
  const count = Number.isFinite(countRaw) && countRaw >= 1 ? countRaw : 0;
  localStorage.removeItem(LEGACY_COUNT);
  localStorage.removeItem(LEGACY_LAST);
  if (count < 1) return;
  for (const mode of ['mini', 'full']) {
    if (!localStorage.getItem(modeKeys(mode).last)) {
      persistMode(mode, count, legacyL);
    }
  }
}

export function normalizeModeIfStale(mode) {
  migrateLegacyIfNeeded();
  const today = getEasternDateKey();
  const yesterday = getEasternYesterdayKey();
  let { count, lastWinDay } = loadMode(mode);
  if (!lastWinDay) {
    return { count: 0, lastWinDay: null };
  }
  if (count < 1) {
    persistMode(mode, 0, null);
    return { count: 0, lastWinDay: null };
  }
  if (lastWinDay === today || lastWinDay === yesterday) {
    return { count, lastWinDay };
  }
  persistMode(mode, 0, null);
  return { count: 0, lastWinDay: null };
}

function infoForMode(mode) {
  const { count, lastWinDay } = normalizeModeIfStale(mode);
  const today = getEasternDateKey();
  const yesterday = getEasternYesterdayKey();
  return {
    count,
    lastWinDay,
    wonToday: lastWinDay === today,
    needsPlayToday: count > 0 && lastWinDay === yesterday
  };
}

export function getDailyStreakInfo() {
  migrateLegacyIfNeeded();
  return {
    mini: infoForMode('mini'),
    full: infoForMode('full')
  };
}

/** One completion per mode per Eastern calendar day advances that mode's streak. */
export function recordDailyPuzzleWin(gameMode) {
  if (gameMode !== 'mini' && gameMode !== 'full') {
    return { count: 0 };
  }
  const today = getEasternDateKey();
  const yesterday = getEasternYesterdayKey();
  let { count, lastWinDay } = normalizeModeIfStale(gameMode);

  if (lastWinDay === today) {
    return { count };
  }

  const nextCount = lastWinDay === yesterday ? count + 1 : 1;
  persistMode(gameMode, nextCount, today);
  return { count: nextCount };
}

export function clearDailyStreak() {
  migrateLegacyIfNeeded();
  persistMode('mini', 0, null);
  persistMode('full', 0, null);
  localStorage.removeItem(LEGACY_COUNT);
  localStorage.removeItem(LEGACY_LAST);
}
