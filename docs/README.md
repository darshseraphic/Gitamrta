# Gitamrta website

A responsive static landing page for the Gitamrta Chrome extension. It adapts the restrained monochrome visual direction of the extension while introducing an editorial hero, an illustrated reader preview, feature panels, a privacy explainer, an installation guide, project-document links, and FAQs.

## Preview locally

Open `index.html` in a browser. The site uses plain HTML, CSS, and JavaScript; no package installation or build step is required.

## Configure the repository link

Edit `config.js` and add the public Gitamrta repository URL:

```js
window.GITAMRTA_CONFIG = {
  repositoryUrl: 'https://github.com/<account>/<repository>'
};
```

The repository URL is intentionally left blank until the official location is ready. When configured, the page updates its source link and `git clone` command automatically.

## File structure

- `index.html` — page structure and Gitamrta product information
- `styles.css` — responsive layout, monochrome design tokens, light/dark/system themes, and reduced-motion support
- `script.js` — theme persistence, mobile navigation, repository configuration, and clone-command copy interaction
- `config.js` — public repository URL placeholder
- `assets/gitamrta-logo.svg` — copy of the extension's master Gitamrta logo

## Deployment

The site is static and can be published from a static hosting provider or a repository Pages feature. Before publishing, set the repository URL in `config.js` and check the relative document links. The page is designed to live in the `website/` directory beside the extension's root documentation files.

## Content accuracy

Product details are based on the current extension implementation and its project documentation. The site describes the extension's present behavior; it does not imply Chrome Web Store availability, offline verse storage, or features not implemented in the current build.
