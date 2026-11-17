# Résumé site

A static, build-free résumé page driven by one `config.json`, with configurable branding. Live example: <https://camstillhere.github.io/>

## Use it for yourself

1. Fork this repository (or use it as a template). For a user site, name the fork `<username>.github.io`.
2. Copy `configurables/config.example.json` to `configurables/config.json` and fill in your details.
3. Edit `configurables/settings.json`: set `"config": "configurables/config.json"` and adjust the branding.
4. Enable GitHub Pages for the repository (branch `master`/`main`, root folder).

To preview locally, serve the folder over HTTP (modules and `fetch` do not work from `file://`):

```bash
python -m http.server 8000
```

You can also try any config without editing files: `index.html?config=https://example.com/my-config.json` (the host must allow CORS).

## Résumé data (`config.json`)

Only `bio`, `overview`, `experiences` and `organisations` are needed. Every other section appears when its data is present.

| Key | Purpose |
| --- | --- |
| `bio` | `first`, `last`, `title`, optional `tagline`, `location`, `image`, `highlights` (`[{value, label}]`, the headline numbers), and `contact` groups (`email`, `linkedIn`, `github`, `website`, optional `phone`), each a list of `{content, title}`. |
| `overview` | `title` and `blurb` paragraphs. The first is shown as a lead. `{{years}}` becomes your years of experience. |
| `featured` | One signature result: `kicker`, `title`, `text`, `footnote`, and `before` / `after` (`label`, `display`, numeric `value` used to scale the bars). |
| `references` | `author` (`name`, `position`, `organisation`, `date`) and `blurb`. Add `featured: true` and a short `excerpt` (a quote from the blurb) to pull a quote to the top; otherwise the three newest are used. |
| `proofPoints` | `{title, items: [{title, text}]}`. |
| `talks` | `{title, items: [{title, text}]}` shown beneath the proof points. |
| `principles` | `{title, items: ["..."]}`. |
| `skills` | `{title, groups: [{name, items: ["..."]}]}`. |
| `experiences` | One entry per organisation with `positions` (`title`, `span.start`, `span.end`, `blurb`, `responsibilities`, `achievements`). A `null` end means current. |
| `educations` | One entry per institute with `certifications` (`qualification`, `title`, `span`, `blurb`). |
| `organisations` | Lookup by name: `blurb`, `link`, `icon`. Every organisation used above should appear here. |

Dates use `YYYY-MM-DD`. Think twice before publishing a phone number: public pages are scraped. The `phone` contact type is supported but optional, and nothing is shown unless you add it.

## Branding (`settings.json`)

Everything is optional; omitted values fall back to the defaults in [`js/config.js`](js/config.js).

```json
{
  "config": "configurables/config.json",
  "branding": {
    "siteTitle": "Jane Doe | Engineer",
    "favicon": "img/favicon.png",
    "theme": "auto",
    "fonts": { "body": "Inter", "heading": "Newsreader" },
    "colors": {
      "primary": "#14284b",
      "accent": "#8a6a2b",
      "ink": "#0b1424",
      "dark": { "accent": "#d2b36f" }
    },
    "hero": "gradient",
    "heroImage": null,
    "cta": { "label": "Connect on LinkedIn", "href": "https://www.linkedin.com/in/example/" },
    "expandedRoles": 2,
    "footer": null,
    "sections": { "charts": false },
    "chartPalette": ["#14284b", "#8a6a2b", "#2f7f79"]
  }
}
```

- `theme`: `auto` follows the visitor's system, or force `light` / `dark`.
- `fonts`: any [Google Fonts](https://fonts.google.com) family name.
- `colors`: `primary` (links), `accent` (rules and highlights), `ink` (hero and feature band), `background`, `surface`, `text`, `muted`. The nested `dark` object overrides them in dark mode.
- `hero`: `gradient` or `solid`; set `heroImage` for a background photo.
- `cta`: adds a primary button to the hero.
- `expandedRoles`: how many of the most recent roles start expanded; the rest open on click.
- `sections`: switch sections off (`stats`, `featured`, `references`, `proofPoints`, `principles`, `skills`, `charts`, `experience`, `education`). Charts are off by default in this site's settings.

## Layout

```
index.html            page shell
css/style.css         theme, layout, print styles
js/main.js            start-up and controls
js/config.js          settings, loading and normalising the résumé
js/dates.js           date and duration helpers
js/branding.js        applies colours, fonts and theme
js/render.js          builds the page sections
js/charts.js          optional Chart.js overview charts
configurables/        settings.json, config.example.json (and your config.json)
```

There is a light/dark toggle and a print stylesheet that expands every role, so the browser's "Save as PDF" gives a complete, clean document.
