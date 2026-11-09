(() => {
  'use strict';

  const config = window.GITAMRTA_CONFIG || {};
  const body = document.body;
  const themeButton = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const copyButton = document.getElementById('copy-clone');
  const cloneCommand = document.getElementById('clone-command');
  const cloneStatus = document.getElementById('clone-status');
  const year = document.getElementById('year');
  const themeKey = 'gitamrta-site-theme';
  const themeModes = ['system', 'light', 'dark'];

  if (year) year.textContent = String(new Date().getFullYear());

  const validHttpsUrl = (value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  };

  const repositoryUrl = typeof config.repositoryUrl === 'string' ? config.repositoryUrl.trim() : '';
  const repositoryReady = validHttpsUrl(repositoryUrl);
  const repositoryLinks = [
    document.getElementById('repo-project-link')
  ];

  if (repositoryReady) {
    repositoryLinks.forEach((link) => {
      if (!link) return;
      link.href = repositoryUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      const title = link.querySelector('strong');
      if (title) title.textContent = 'View source repository';
    });
    if (cloneCommand) cloneCommand.textContent = `git clone ${repositoryUrl.replace(/\.git\/?$/, '')}.git`;
    if (cloneStatus) cloneStatus.textContent = 'Copy the command to clone the official source.';
  } else {
    repositoryLinks.forEach((link) => {
      if (!link) return;
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', (event) => event.preventDefault());
    });
  }

  const setTheme = (mode) => {
    const theme = themeModes.includes(mode) ? mode : 'system';
    if (theme === 'system') body.removeAttribute('data-theme');
    else body.dataset.theme = theme;

    const label = theme.charAt(0).toUpperCase() + theme.slice(1);
    if (themeLabel) themeLabel.textContent = label;
    if (themeButton) {
      themeButton.title = `Theme: ${label}. Click to change.`;
      themeButton.setAttribute('aria-label', `Change theme. Current theme: ${label}`);
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      metaTheme.setAttribute('content', dark ? '#101010' : '#f1f1f1');
    }

    try { localStorage.setItem(themeKey, theme); } catch { /* The page remains usable without storage. */ }
  };

  let savedTheme = 'system';
  try { savedTheme = localStorage.getItem(themeKey) || 'system'; } catch { /* Use system preference. */ }
  setTheme(savedTheme);

  themeButton?.addEventListener('click', () => {
    const current = themeModes.indexOf(savedTheme);
    savedTheme = themeModes[(current + 1) % themeModes.length];
    setTheme(savedTheme);
  });

  if (menuToggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    };

    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !expanded);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', closeMenu);
  }

  copyButton?.addEventListener('click', async () => {
    if (!cloneCommand || !cloneStatus) return;
    const text = cloneCommand.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      cloneStatus.textContent = 'Clone command copied.';
      copyButton.setAttribute('aria-label', 'Clone command copied');
    } catch {
      cloneStatus.textContent = 'Copy unavailable here. Select the command to copy it.';
      copyButton.setAttribute('aria-label', 'Copy unavailable; select the command manually');
    }
    window.setTimeout(() => {
      cloneStatus.textContent = repositoryReady
        ? 'Copy the command to clone the official source.'
        : 'Repository link will be configured here.';
      copyButton.setAttribute('aria-label', 'Copy clone command');
    }, 2600);
  });

  const currentYear = document.getElementById('year');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();
