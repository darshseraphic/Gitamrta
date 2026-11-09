'use strict';

// Vedic Scriptures API, following the endpoint and response fields in bhagvad-geeta.js.
const API_BASE = 'https://vedicscriptures.github.io/slok';
const CHAPTER_VERSE_COUNTS = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 34, 27, 20, 24, 28, 78];
const THEME_MODES = ['system', 'light', 'dark'];
const ALLOWED_AUTHORS = new Set([
  'Swami Adidevananda',
  'Shri Purohit Swami',
  'A.C. Bhaktivedanta Swami Prabhupada'
]);

const $ = (id) => document.getElementById(id);
const elements = {
  themeButton: $('themeButton'),
  themeLabel: $('themeLabel'),
  searchForm: $('searchForm'),
  verseInput: $('verseInput'),
  searchError: $('searchError'),
  randomButton: $('randomButton'),
  verseCard: $('verseCard'),
  verseHeading: $('verseHeading'),
  verseReference: $('verseReference'),
  loadingState: $('loadingState'),
  sanskritSection: $('sanskritSection'),
  sanskritText: $('sanskritText'),
  verseDivider: $('verseDivider'),
  transliterationSection: $('transliterationSection'),
  transliterationText: $('transliterationText'),
  translationDivider: $('translationDivider'),
  translationsGroup: $('translationsGroup'),
  englishTranslationContent: $('englishTranslationContent'),
  hindiCommentaryContent: $('hindiCommentaryContent'),
  verseError: $('verseError'),
  verseErrorDetail: $('verseErrorDetail'),
  retryButton: $('retryButton'),
  verseCardBottom: $('verseCardBottom'),
  verseCount: $('verseCount'),
  copyButton: $('copyButton')
};

let currentVerse = null;
let lastRequested = null;
let activeTheme = 'system';

function storageGet(keys) {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return resolve({});
    chrome.storage.local.get(keys, (result) => resolve(result || {}));
  });
}

function storageSet(values) {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return resolve();
    chrome.storage.local.set(values, resolve);
  });
}

function applyTheme(mode) {
  activeTheme = THEME_MODES.includes(mode) ? mode : 'system';
  if (activeTheme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.dataset.theme = activeTheme;
  }
  const label = activeTheme.charAt(0).toUpperCase() + activeTheme.slice(1);
  elements.themeLabel.textContent = label;
  elements.themeButton.title = `Theme: ${label}. Click to change.`;
  elements.themeButton.setAttribute('aria-label', `Change theme. Current theme: ${label}`);
}

async function cycleTheme() {
  const nextIndex = (THEME_MODES.indexOf(activeTheme) + 1) % THEME_MODES.length;
  const nextTheme = THEME_MODES[nextIndex];
  applyTheme(nextTheme);
  await storageSet({ theme: nextTheme });
}

function setBusy(isBusy) {
  elements.verseCard.setAttribute('aria-busy', String(isBusy));
  elements.randomButton.disabled = isBusy;
  elements.retryButton.disabled = isBusy;
  const submit = elements.searchForm.querySelector('button[type="submit"]');
  submit.disabled = isBusy;
}

function showLoading(chapter, verse) {
  elements.verseHeading.textContent = 'Opening your shloka';
  elements.verseReference.textContent = `${chapter} / ${verse}`;
  elements.loadingState.hidden = false;
  elements.sanskritSection.hidden = true;
  elements.verseDivider.hidden = true;
  elements.transliterationSection.hidden = true;
  elements.translationDivider.hidden = true;
  elements.translationsGroup.hidden = true;
  elements.verseError.hidden = true;
  elements.verseCardBottom.hidden = true;
}

function showError(message) {
  elements.loadingState.hidden = true;
  elements.sanskritSection.hidden = true;
  elements.verseDivider.hidden = true;
  elements.transliterationSection.hidden = true;
  elements.translationDivider.hidden = true;
  elements.translationsGroup.hidden = true;
  elements.verseError.hidden = false;
  elements.verseErrorDetail.textContent = message;
  elements.verseCardBottom.hidden = true;
  elements.verseHeading.textContent = 'A verse awaits';
}

function validateReference(chapter, verse) {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 18) {
    return 'Chapter must be between 1 and 18.';
  }
  const maxVerse = CHAPTER_VERSE_COUNTS[chapter - 1];
  if (!Number.isInteger(verse) || verse < 1 || verse > maxVerse) {
    return `Chapter ${chapter} has ${maxVerse} verses. Enter a verse from 1 to ${maxVerse}.`;
  }
  return '';
}

function parseReference(value) {
  const match = value.trim().match(/^(\d{1,2})\s*\/\s*(\d{1,2})$/);
  if (!match) return { error: 'Use chapter/verse format, such as 2/47.' };
  const chapter = Number(match[1]);
  const verse = Number(match[2]);
  const error = validateReference(chapter, verse);
  return error ? { error } : { chapter, verse };
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getAttributedEntries(data, field) {
  return Object.values(data || {})
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      author: cleanText(item.author),
      text: cleanText(item[field])
    }))
    .filter((item) => item.author && ALLOWED_AUTHORS.has(item.author) && item.text);
}

function renderAttributedContent(container, entries, language, emptyMessage) {
  const fragment = document.createDocumentFragment();

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-content';
    empty.textContent = emptyMessage;
    fragment.appendChild(empty);
  } else {
    entries.forEach(({ author, text }) => {
      const entry = document.createElement('article');
      entry.className = 'attributed-entry';

      const authorLabel = document.createElement('p');
      authorLabel.className = 'attributed-author';
      authorLabel.textContent = author;

      const content = document.createElement('p');
      content.className = 'attributed-text';
      content.lang = language;
      content.textContent = text;

      entry.append(authorLabel, content);
      fragment.appendChild(entry);
    });
  }

  container.replaceChildren(fragment);
}

function renderVerse(data, chapter, verse) {
  const sanskrit = cleanText(data.slok);
  const transliteration = cleanText(data.transliteration);
  if (!sanskrit) throw new Error('The API response did not include a Sanskrit shloka.');

  // The supplied bhagvad-geeta.js maps et to English Translation and hc to Hindi Commentary.
  const englishTranslations = getAttributedEntries(data, 'et');
  const hindiCommentaries = getAttributedEntries(data, 'hc');

  currentVerse = {
    chapter,
    verse,
    sanskrit,
    transliteration,
    englishTranslations,
    hindiCommentaries
  };
  elements.verseHeading.textContent = 'A verse to reflect on';
  elements.verseReference.textContent = `${chapter} / ${verse}`;
  elements.loadingState.hidden = true;
  elements.verseError.hidden = true;
  elements.sanskritText.textContent = sanskrit;
  elements.sanskritSection.hidden = false;
  elements.verseDivider.hidden = !transliteration;
  elements.transliterationText.textContent = transliteration || 'Transliteration is not available for this verse.';
  elements.transliterationSection.hidden = false;

  renderAttributedContent(
    elements.englishTranslationContent,
    englishTranslations,
    'en',
    'No English translation is available for this verse.'
  );
  renderAttributedContent(
    elements.hindiCommentaryContent,
    hindiCommentaries,
    'hi',
    'इस श्लोक के लिए हिन्दी टीका उपलब्ध नहीं है।'
  );
  elements.translationDivider.hidden = false;
  elements.translationsGroup.hidden = false;

  elements.verseCount.textContent = `Chapter ${chapter} · Verse ${verse}`;
  elements.verseCardBottom.hidden = false;
}

async function fetchVerse(chapter, verse) {
  const validationError = validateReference(chapter, verse);
  if (validationError) {
    elements.searchError.textContent = validationError;
    return;
  }

  lastRequested = { chapter, verse };
  currentVerse = null;
  elements.searchError.textContent = '';
  setBusy(true);
  showLoading(chapter, verse);

  try {
    const response = await fetch(`${API_BASE}/${chapter}/${verse}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error('That chapter and verse could not be found.');
      throw new Error(`The scripture service returned status ${response.status}.`);
    }
    const data = await response.json();
    if (!data || !data.slok) throw new Error('The scripture service returned an incomplete verse.');
    renderVerse(data, Number(data.chapter) || chapter, Number(data.verse) || verse);
    await storageSet({ lastVerse: { chapter, verse } });
  } catch (error) {
    showError(error instanceof TypeError ? 'Unable to reach the scripture service. Check your internet connection.' : (error.message || 'Something went wrong while loading the verse.'));
  } finally {
    setBusy(false);
  }
}

function randomReference() {
  // Choose a chapter first, then a valid verse within that chapter.
  let chapter = Math.floor(Math.random() * CHAPTER_VERSE_COUNTS.length) + 1;
  let verse = Math.floor(Math.random() * CHAPTER_VERSE_COUNTS[chapter - 1]) + 1;
  if (lastRequested && chapter === lastRequested.chapter && verse === lastRequested.verse) {
    verse = (verse % CHAPTER_VERSE_COUNTS[chapter - 1]) + 1;
  }
  return { chapter, verse };
}

async function chooseRandomVerse() {
  const { chapter, verse } = randomReference();
  elements.verseInput.value = `${chapter}/${verse}`;
  await fetchVerse(chapter, verse);
}

async function copyCurrentVerse() {
  if (!currentVerse) return;
  const authorLines = (entries) => entries.map(({ author, text }) => `${author}\n${text}`).join('\n\n');
  const text = [
    `Bhagavad Gita ${currentVerse.chapter}/${currentVerse.verse}`,
    currentVerse.sanskrit,
    currentVerse.transliteration,
    currentVerse.englishTranslations.length
      ? `ENGLISH TRANSLATION\n${authorLines(currentVerse.englishTranslations)}`
      : '',
    currentVerse.hindiCommentaries.length
      ? `HINDI COMMENTARY\n${authorLines(currentVerse.hindiCommentaries)}`
      : ''
  ].filter(Boolean).join('\n\n');
  const label = elements.copyButton.querySelector('span');
  try {
    await navigator.clipboard.writeText(text);
    label.textContent = 'Copied';
  } catch (_) {
    label.textContent = 'Copy unavailable';
  }
  window.setTimeout(() => { label.textContent = 'Copy verse'; }, 1400);
}

async function initialize() {
  const saved = await storageGet(['theme', 'lastVerse']);
  applyTheme(saved.theme || 'system');
  elements.searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const parsed = parseReference(elements.verseInput.value);
    if (parsed.error) {
      elements.searchError.textContent = parsed.error;
      elements.verseInput.focus();
      return;
    }
    await fetchVerse(parsed.chapter, parsed.verse);
  });
  elements.themeButton.addEventListener('click', cycleTheme);
  elements.randomButton.addEventListener('click', chooseRandomVerse);
  elements.retryButton.addEventListener('click', () => {
    if (lastRequested) fetchVerse(lastRequested.chapter, lastRequested.verse);
  });
  elements.copyButton.addEventListener('click', copyCurrentVerse);

  if (saved.lastVerse && Number.isInteger(saved.lastVerse.chapter) && Number.isInteger(saved.lastVerse.verse)) {
    const { chapter, verse } = saved.lastVerse;
    if (!validateReference(chapter, verse)) {
      elements.verseInput.value = `${chapter}/${verse}`;
      await fetchVerse(chapter, verse);
      return;
    }
  }
  await chooseRandomVerse();
}

document.addEventListener('DOMContentLoaded', initialize);
