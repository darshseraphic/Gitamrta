# Changelog

This file records the notable features in the current project version and documentation updates. The installed extension version is maintained in `manifest.json`.

## [1.1.1] — 2026-11-07

### Improved readability

- Increased the `TRANSLATIONS & COMMENTARIES` section heading size and strengthened its weight for clearer scanning.
- Increased the `ENGLISH TRANSLATION` and `HINDI COMMENTARY` labels, author attribution, and translation/commentary body text slightly.
- Increased the Hindi commentary text size while preserving its Devanagari-specific font stack and line spacing.
- Increased the size of the unavailable-content message so it remains readable alongside the larger section typography.

## [Unreleased] — 2026-11-07

### Website

- Added a responsive Gitamrta landing page in `website/` with a custom editorial layout, extension preview, feature overview, how-it-works section, privacy explainer, local installation guide, project links, and FAQ.
- Added System, Light, and Dark theme switching with local preference persistence, an accessible mobile navigation menu, and a copyable Git clone command.
- Reused the extension's master Gitamrta SVG logo and left the repository URL as an explicit configuration placeholder until the public source URL is ready.
- Added website setup and deployment notes in `website/README.md`.

### Documentation

- Added a project README covering the app, features, usage, API workflow, local Chrome installation, permissions, and project file layout.
- Added contribution guidance that reflects the limits in the proprietary source-available license.
- Added a security and privacy overview describing permissions, network requests, locally stored preferences, clipboard behavior, and vulnerability reporting.
- Added the exact Gitamrta proprietary source-available license supplied by the copyright holder as `license.txt`.
- Added this changelog.

## [1.1.0] — 2026-11-07

### Features present in this version

- Added the Gitamrta name and shared branding across the popup and Chrome extension icon assets.
- Added random chapter/verse selection and direct `chapter/verse` lookup.
- Added Sanskrit shloka and Roman transliteration display.
- Added English Translation (`et`) and Hindi Commentary (`hc`) sections with supported-author attribution.
- Added copy support for the verse, transliteration, and available translation/commentary text.
- Added System, Light, and Dark themes, with the selected theme and last viewed verse stored locally.
- Added custom text-selection colors, a slim theme-aware scrollbar, accessible focus states, and reduced-motion handling.
- Uses the Vedic Scriptures API endpoint over HTTPS to retrieve verse data.

### Design and implementation

- Uses a monochrome interface adapted from the supplied design reference.
- Uses a shared SVG master logo and PNG icon assets at 16, 32, 48, and 128 pixels.
- Uses Chrome Manifest V3 with `storage` permission and host access limited to the configured scripture API domain.
