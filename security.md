# Gitamrta Security and Privacy

This document describes the security-relevant behavior of the current Gitamrta Chrome extension source. It is intended to help users understand what the extension can access, what it stores, and how it communicates with the scripture service.

## Permissions requested

The current `manifest.json` declares:

| Permission | Why Gitamrta uses it |
|---|---|
| `storage` | Saves the selected theme and the last viewed chapter/verse using Chrome's local extension storage. |
| Host access to `https://vedicscriptures.github.io/*` | Allows the popup to request scripture JSON from the Vedic Scriptures endpoint. |

The current manifest does not request `tabs`, `activeTab`, `scripting`, `cookies`, `history`, or broad access to all websites. The project contains no content scripts or background service worker; the reader logic runs in the popup.

## Network requests

When Gitamrta loads a verse, the popup makes an HTTPS `GET` request to:

```text
https://vedicscriptures.github.io/slok/{chapter}/{verse}
```

A request is made when the user searches for a verse, selects a random verse, retries a failed request, or when the popup restores the last saved verse. The request includes the chapter and verse in the URL path. The external service and network infrastructure can also observe ordinary connection metadata, such as the connecting IP address and request time. Their handling of that information is outside Gitamrta's control; consult the service provider's own policies.

Gitamrta does not send the current page URL to this API, because the extension does not inspect the active tab or inject scripts into websites. There is no periodic background polling in the current code.

## Local data and clipboard

The extension uses `chrome.storage.local` for these two preferences:

- `theme`: `system`, `light`, or `dark`.
- `lastVerse`: the last viewed chapter and verse numbers.

The current implementation does not save the returned Sanskrit, translation, commentary, or API response in extension storage. It requests the verse again when needed. The copy button writes the currently displayed verse content to the clipboard only after the user activates that button. Gitamrta does not read clipboard contents.

## How content is handled

The popup checks the API response for the expected verse data and verifies the chapter/verse input against the chapter verse-count table in `popup.js`. API-provided text is assigned to DOM text properties such as `textContent`; it is not intentionally interpreted as HTML. This reduces the risk of script injection through verse or commentary text.

The extension requests JSON over HTTPS from the configured API host. It does not load remote JavaScript libraries or execute code returned by the scripture API. As with any software that consumes a remote service, malformed or changed API responses may still cause display or availability problems.

## Security limitations

- Gitamrta depends on an external API. The API may be unavailable, change its response, or apply its own data and privacy policies.
- A host permission is required for the configured API domain. It does not mean Gitamrta has access to every website.
- This document describes the source as it currently exists; a future release may change its behavior or permissions. Review the manifest and release notes when updating.
- No formal independent security audit or penetration test is claimed by this project.
- Installing an unpacked extension means you are running the local project files you selected. Only use a source checkout or release you trust.

## Reporting a vulnerability

Please report suspected security issues privately rather than posting exploit instructions or sensitive details in a public issue. Contact:

**Darshseraphic**  
**Darsh.seraphic@gmail.com**

Include the Gitamrta version, Chrome/Chromium version, operating system, a concise description of the potential impact, and reproduction steps where safe. Remove passwords, tokens, personal data, and unrelated browsing information from logs or screenshots. Do not attempt to access another person's data or disrupt the external API while investigating.

Please allow the project owner an opportunity to review and address the report before publicly disclosing technical details. There is no published bug-bounty program or guaranteed response-time commitment in this repository.

## Related documents

- [`license.txt`](license.txt) — proprietary source-available license and contact information.
- [`contributing.md`](contributing.md) — project feedback and contribution restrictions.
- [`changelog.md`](changelog.md) — recorded features and documentation changes.
