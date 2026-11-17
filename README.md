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

| Key | Purpose |
| --- | --- |
| `bio` | `first`, `last`, `title`, optional `tagline`, `image`, and `contact` groups (`email`, `linkedIn`, `github`, `website`, optional `phone`), each a list of `{content, title}`. |
| `bio` extras | Optional `location` and `highlights` (`[{value, label}]`) replace the default headline numbers. |
| `principles`, `proofPoints`, `skills` | Optional sections: `{title, items}` for the first two (proof points are `{title, text}`), and `{title, groups:[{name, items}]}` for skills. |
| `overview` | `title` and `blurb` paragraphs. `{{years}}` is replaced with your years of experience. |
| `experiences` | One entry per organisation with `positions` (`title`, `span.start`, `span.end`, `blurb`, `responsibilities`, `achievements`). A `null` end means current. |
| `educations` | One entry per institute with `certifications` (`qualification`, `title`, `span`, `blurb`). |
| `references` | Endorsements: `author` (`name`, `position`, `organisation`, `date`) and `blurb`. |
| `organisations` | Lookup by name: `blurb`, `link`, `icon`. Every organisation used above should appear here. |

Dates use `YYYY-MM-DD`. Leave out anything you do not want shown; empty sections simply do not render.

Think twice before publishing a phone number: public pages are scraped. The `phone` contact type is supported but optional, and nothing is shown unless you add it.

## Branding (`settings.json`)

Everything is optional; omitted values fall back to the defaults in [`js/config.js`](js/config.js).

```json
{
  "config": "configurables/config.json",
  "branding": {
    "siteTitle": "Jane Doe | Engineer",
    "favicon": "img/favicon.png",
    "theme": "auto",
    "fonts": { "body": "Inter", "heading": "Space Grotesk" },
    "colors": {
      "primary": "#0f766e",
      "accent": "#f59e0b",
      "dark": { "primary": "#2dd4bf" }
    },
    "hero": "gradient",
    "heroImage": null,
    "footer": "Open to new opportunities",
    "sections": { "stats": true, "charts": true, "experience": true, "education": true, "references": true },
    "chartPalette": ["#0f766e", "#f59e0b", "#6366f1"]
  }
}
```

- `theme`: `auto` follows the visitor's system, or force `light` / `dark`.
- `fonts`: any [Google Fonts](https://fonts.google.com) family name.
- `hero`: `gradient`, `solid`, or set `heroImage` for a background photo.
- `colors`: `primary`, `accent`, `background`, `surface`, `text`, `muted`. The nested `dark` object overrides them in dark mode.
- `sections`: switch whole sections off (`stats`, `principles`, `proofPoints`, `skills`, `charts`, `experience`, `education`, `references`).
- `cta`: `{label, href}` adds a button to the hero.
- `detailSwitcher` and `defaultDetail` (0 to 3): show or hide the Brief/Full switcher and pick the starting level.
- `collapseOlderThanYears`: employers that ended longer ago are collapsed by default.

## Layout

```
index.html            page shell
css/style.css         theme, layout, print styles
js/main.js            start-up and controls
js/config.js          settings, loading and normalising the résumé
js/dates.js           date and duration helpers
js/branding.js        applies colours, fonts and theme
js/render.js          builds the page sections
js/charts.js          Chart.js overview charts
configurables/        settings.json, config.example.json (and your config.json)
```

The page has a detail switcher (Brief to Full), light/dark toggle, and a print stylesheet so the browser's "Save as PDF" gives a clean document.
