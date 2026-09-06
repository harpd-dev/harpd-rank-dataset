# Harpd Rank Dataset

An open, machine-readable dataset of AI products and their Harpd Rank positions.

> **What this is:** a public snapshot of the [Harpd Rank](https://harpd.com/rank/) board — 89 AI products across 19 categories, with rank positions, Rank Points, verification status, category, and profile URLs.
>
> **What this is NOT:** an editorial quality ranking. Harpd Rank is a promotional placement board. **Rank Points measure promotional activity (optional Credit spend), not product quality.** We say this plainly so the data is not misread.

The dataset is published under **CC BY 4.0** — you may reuse, redistribute, and build on it as long as you attribute Harpd.

---

## At a glance (August 2026 snapshot)

- **89** products across **19** categories
- **120** lifetime Rank Points (1 product currently holds Rank Points)
- Snapshot date: **2026-08-28**
- License: **CC BY 4.0**
- Source of truth: `https://harpd.com/data/rank.json`

**Largest categories** (by product count):

| Category | Products | Share | Current leader |
| --- | --- | --- | --- |
| Developer | 24 | 27% | Cursor |
| Agents | 13 | 14.6% | Claude |
| SEO | 10 | 11.2% | Semrush |
| Productivity | 7 | 7.9% | Notion |
| AI Media | 6 | 6.7% | imgkit |
| Business | 5 | 5.6% | FloPay |
| Health | 4 | 4.5% | Fuel Log |
| Agencies | 4 | 4.5% | AY Automate |

*Full breakdown, including movement and share, is in `market-index.json` (see below).*

---

## Endpoints (all CC BY 4.0)

| Endpoint | Format | Contents |
| --- | --- | --- |
| `https://harpd.com/data/rank.json` | JSON | One record per approved product: rank, Rank Points, category, verification status, profile URL. |
| `https://harpd.com/data/top-products.json` | JSON | Top 100 overall with weekly/monthly movement, alternatives and compare URLs. |
| `https://harpd.com/data/market-index.json` | JSON | Per-category aggregation: product count, share, Rank Points, leader, board URL. |
| `https://harpd.com/data/rank.csv` | CSV | Tabular version of `rank.json`. |

No API key required. Rate-limit-friendly (edge-cached). Suitable for notebooks, dashboards, and LLM context.

---

## Schema (rank.json)

```jsonc
{
  "schemaVersion": "1.0",
  "generatedAt": "2026-09-06T11:24:17Z",
  "source": "Harpd Rank",
  "methodology": "https://harpd.com/rank/methodology/",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "count": 89,
  "scope": "overall",
  "lastUpdated": "2026-08-28T05:03:03Z",
  "products": [
    {
      "id": "…",
      "rank": 1,                 // position on the overall board; 0 = unranked
      "name": "imgkit",
      "slug": "imgkit-86d32f3e",
      "profileUrl": "https://harpd.com/rank/imgkit-86d32f3e/",
      "category": "ai-media",
      "categoryName": "AI Media",
      "rankPoints": 120,         // promotional; 0 for most products
      "verified": false,
      "updatedAt": "2026-08-28T05:03:03Z"
    }
  ]
}
```

Key fields: `rankPoints` is promotional placement (see disclaimer). `rank: 0` means the product is listed but not yet on the scored board. `verified` indicates the operator confirmed ownership.

---

## How ranking works

Harpd Rank uses a transparent, credit-based system:

- Listing a product is **free**.
- Spending **1 Credit = 1 Rank Point**.
- Rank Points determine board position within a scope (overall / monthly / weekly) and category.
- Monthly and weekly boards are frozen as reproducible snapshots.

Full rules: <https://harpd.com/rank/rules/> · Methodology: <https://harpd.com/rank/methodology/>

---

## Derived research (monthly)

The same data powers monthly research reports, all computed from closed Rank snapshots:

- AI tools index — <https://harpd.com/research/ai-tools-index/>
- AI tools trends — <https://harpd.com/research/ai-tools-trends/>
- Developer tools index — <https://harpd.com/research/developer-tools-index/>
- AI agent index — <https://harpd.com/research/ai-agent-index/>
- **AI Market Index** — <https://harpd.com/research/ai-market-index/>

---

## How to cite

```bibtex
@misc{harpd-rank-2026-08,
  title  = {Harpd Rank Public Dataset (August 2026 Snapshot)},
  author = {Harpd},
  year   = {2026},
  url    = {https://harpd.com/data/rank.json},
  license = {CC BY 4.0}
}
```

Plain-text: *"Harpd Rank Public Dataset, August 2026 snapshot, licensed CC BY 4.0 (https://harpd.com/data/rank.json)."*

When writing about Rank Points, please preserve the disclaimer: **Rank Points measure promotional activity, not product quality.**

---

## License

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution to Harpd is required. The dataset is a factual compilation of publicly listed products; individual product names and trademarks belong to their respective owners.

---

## Related

- Harpd — <https://harpd.com/> (AI product ranking & intelligence platform)
- Rank board — <https://harpd.com/rank/>
- Open Data hub — <https://harpd.com/data/>
