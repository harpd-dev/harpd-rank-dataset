# Harpd Rank Dataset

An open, machine-readable dataset of AI products and their Harpd Rank positions — published as a
versioned public mirror so researchers, journalists and developers can cite a stable snapshot
instead of a URL that changes every hour.

> **What this is:** a public snapshot of the [Harpd Rank](https://harpd.com/rank/) board — 89 AI
> products across 28 category boards (19 of them populated), with rank positions, Rank Points,
> verification status, category and canonical profile URLs.
>
> **What this is NOT:** an editorial quality ranking. Harpd Rank is a promotional placement board.
> **Rank Points measure promotional activity (optional Credit spend), not product quality.** We say
> this plainly, in the data and in every derived asset, so the numbers are not misread.

The data is published under **CC BY 4.0**. The sync scripts in `scripts/` are **MIT**.

---

## At a glance (2026-08 snapshot)

| | |
| --- | --- |
| Products | **89** |
| Category boards | **28** (19 with at least one product) |
| Products holding Rank Points | **1** |
| Lifetime Rank Points in the dataset | **125** |
| Verified listings | **1** |
| Data last changed | **2026-08-28** |
| Snapshot last synced | see `manifest.json` → `generatedAt` |
| License | **CC BY 4.0** |
| Source of truth | `https://harpd.com/data/rank.json` |

**Largest categories** (by product count, from `rankings/market-index.json`):

| Category | Products | Share | Rank Points | Current leader |
| --- | --- | --- | --- | --- |
| Developer | 24 | 27.0% | 0 | Cursor |
| Agents | 13 | 14.6% | 0 | Claude |
| SEO | 10 | 11.2% | 0 | Semrush |
| Productivity | 7 | 7.9% | 0 | Notion |
| AI Media | 6 | 6.7% | 125 | imgkit |
| Business | 5 | 5.6% | 0 | FloPay |
| Health | 4 | 4.5% | 0 | Fuel Log |
| Agencies | 4 | 4.5% | 0 | AY Automate |
| Marketing | 3 | 3.4% | 0 | Tutti |

---

## Repository layout

```
schema/       JSON Schemas, INFERRED from the live records on every sync
              (never hand-written — a hand-maintained schema drifts and then lies)
rankings/     current mirror of every public /data/* endpoint
snapshots/    frozen, citable monthly copies + a manifest with sha256 checksums
research/     research reports derived from the same data
methodology/  how ranking works, and the field-level schema documentation
scripts/      sync.mjs — zero-dependency fetcher/validator
manifest.json  top-level manifest: counts, checksums, sync timestamp
```

### `rankings/`

| File | Contents |
| --- | --- |
| `rank.json` | One record per approved product: rank, Rank Points, category, verification, canonical URL. |
| `rank.csv` | Tabular version of `rank.json`. |
| `rank-open-data.json` | **Objective metrics only** — verified GitHub stars and first-party referral counts, with verification timestamps. Deliberately contains **no Rank Points and no rank positions**. |
| `categories.json` | All 28 category boards with product counts and board URLs. |
| `top-products.json` | Top 100 overall with movement, alternatives and compare URLs. |
| `products.json` | Product profiles: maker website, description, tags. |
| `market-index.json` | Per-category aggregation: count, share, Rank Points, leader. |
| `rank-history.json` | Closed monthly/weekly periods, each a reproducible snapshot. |

### `snapshots/`

`snapshots/<YYYY-MM>/` freezes `rank.json`, `rank.csv`, `categories.json` and `market-index.json`
for one period, plus a `manifest.json` with per-file **sha256** checksums. Cite a snapshot, not
`rankings/`, when your work needs to be reproducible.

Current frozen period: `snapshots/2026-08/`.

---

## Schema (rank.json)

```jsonc
{
  "schemaVersion": "1.0",
  "generatedAt": "2026-09-09T04:36:05Z",
  "source": "Harpd Rank",
  "methodology": "https://harpd.com/rank/methodology/",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "count": 89,
  "scope": "overall",
  "lastUpdated": "2026-08-28T05:03:03Z",
  "products": [
    {
      "id": "imgkit-86d32f3e",
      "name": "imgkit",
      "slug": "imgkit-86d32f3e",
      "url": "https://harpd.com/rank/imgkit-86d32f3e/",
      "category": "ai-media",
      "categoryName": "AI Media",
      "rank": 1,
      "rankPoints": 125,
      "verified": false,
      "updatedAt": "2026-08-28T05:03:03Z"
    }
  ]
}
```

Field notes:

- `rankPoints` is **promotional placement** (see the disclaimer below).
- `rank: 0` means the product is listed but not yet on the scored board.
- `verified` means the operator confirmed ownership of the listing. It is not an endorsement.
- `generatedAt` moves on every serialization; `lastUpdated` moves only when a record actually
  changes. Use `lastUpdated` when you need to know whether the *data* is stale.

> **Known upstream inconsistency:** `rank.csv` names the profile column `profile_url` while
> `rank.json` names it `url`. Same value, different key. We mirror both verbatim rather than
> silently reshape a published file; if this matters to you, alias one to the other.

Machine-readable JSON Schemas live in `schema/`.

---

## How ranking works

- Listing a product is **free**. Every approved product enters Overall Rank at 0 Rank Points.
- Spending **1 Credit = 1 permanent Rank Point**.
- Rank Points determine board position within a scope (overall / monthly / weekly) and category.
- Overall Rank Points never reset. Monthly and weekly boards aggregate points earned inside the
  UTC period, and closed periods become **immutable snapshots**.
- Promotional Rank spending requires a verified maker claim. Harpd-operated and unclaimed editorial
  reference listings are excluded from Maker Rank.
- **Trending is organic and independent of Rank Points** — recent unique profile activity, outbound
  clicks and saves in a rolling 7-day window.

Full rules: <https://harpd.com/rank/rules/> · Methodology: <https://harpd.com/rank/methodology/>
· Field-level docs: [`methodology/schema.json`](methodology/schema.json)

### What is deliberately excluded

The dataset never contains user accounts or contact details, billing or processor identifiers,
credentials or secrets, internal review notes, private account fields, or any unapproved or hidden
listing. That exclusion is enforced upstream, not filtered after the fact.

---

## Embedding the board

A live, server-rendered version of this leaderboard can be embedded on any site with one script tag:

```html
<script src="https://harpd.com/embed/rank.js" data-category="agents" data-limit="10" data-theme="auto" async></script>
```

Options: `data-category` (omit for the overall board), `data-limit` (1–50, default 10),
`data-theme` (`light` / `dark` / `auto`), `data-points` (`0` hides the Rank Points column).
Docs and live previews: <https://harpd.com/embed/>

The embed reads the same endpoint as `rankings/rank.json`. It cannot reorder, sponsor-filter or hide
rows, and the promotional-placement disclosure stays visible.

---

## Syncing

```bash
node scripts/sync.mjs              # fetch from https://harpd.com and write
node scripts/sync.mjs --check      # validate the committed files (used by CI)
node scripts/sync.mjs --origin=http://localhost:4322
```

No dependencies (Node 18+). CI runs `--check` on every push and re-syncs weekly.

Two guards, because a public dataset that silently publishes an empty snapshot is worse than one
that is a week stale:

1. Every endpoint must return HTTP 200 **and** a non-empty record set, or the run aborts.
2. `rank.json` may not shrink by more than 25% versus the previous commit. A drop that large means
   the upstream API is degraded, not that products disappeared.

---

## How to cite

Preferred — cite a frozen snapshot:

```bibtex
@misc{harpd-rank-2026-08,
  title        = {Harpd Rank Public Dataset (August 2026 Snapshot)},
  author       = {Harpd},
  year         = {2026},
  month        = {8},
  url          = {https://github.com/harpd-dev/harpd-rank-dataset},
  note         = {Snapshot: snapshots/2026-08/. Licensed CC BY 4.0},
  license      = {CC BY 4.0}
}
```

Plain text:

> Harpd Rank Public Dataset, August 2026 snapshot (89 products, 28 category boards), licensed
> CC BY 4.0 — https://github.com/harpd-dev/harpd-rank-dataset

Live endpoint form: *"Harpd Rank Public Dataset, retrieved 2026-09-09 from
https://harpd.com/data/rank.json, licensed CC BY 4.0."*

Machine-readable citation metadata is in [`CITATION.cff`](CITATION.cff).

**When writing about Rank Points, please preserve the disclaimer:** Rank Points measure promotional
activity, not product quality.

---

## Limitations

State these alongside any figure you quote:

1. **Coverage is participation, not market size.** The dataset describes Harpd Rank participation
   only. It is not a census of the AI product market, and absence from it means nothing.
2. **Rank position is not a quality score.** It is promotional placement.
3. **Objective metrics are sparse.** `rank-open-data.json` only carries values Harpd has verified;
   a missing GitHub star count means "not verified", not "zero".
4. **One snapshot is not a trend.** Movement claims need at least two periods from `snapshots/`.
5. **Categories are Harpd's taxonomy.** Category membership is assigned by Harpd, not by the vendor.

---

## License

Data: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — attribution to Harpd required.
Scripts: MIT. The dataset is a factual compilation of publicly listed products; individual product
names and trademarks belong to their respective owners.

---

## Related

- Harpd — <https://harpd.com/>
- Rank board — <https://harpd.com/rank/>
- Open Data hub (all endpoints) — <https://harpd.com/data/>
- Embeddable widget — <https://harpd.com/embed/>
- Methodology — <https://harpd.com/rank/methodology/>
