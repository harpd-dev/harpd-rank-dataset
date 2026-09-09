> Source of truth: `methodology.json` and `schema.json` in this directory are copied verbatim from
> `https://harpd.com/data/methodology.json` and `https://harpd.com/data/schema.json` on every sync.
> This README is the human-readable gloss. If the two ever disagree, the JSON wins.

# How Harpd Rank works

## Scope

Harpd Rank is a public product leaderboard on harpd.com. The dataset describes **Harpd Rank
participation only** — it does not represent the entire product market. A product missing from the
dataset is not a statement about that product.

## Rank Points

- **1 completed Harpd Credit spend on Rank = 1 permanent Rank Point.**
- Overall Rank Points **never reset**.
- Monthly and weekly boards aggregate Rank Points earned inside the UTC period. Once a period
  closes it becomes an **immutable snapshot** (see `snapshots/` in this repository).
- **Rank Points are promotional placement, not an editorial recommendation.** Paying for placement
  does not equal product quality. This disclosure travels with the data and with the embeddable
  widget; it is not optional when you quote Rank Points.

## Boards

| Board | Definition |
| --- | --- |
| Overall | Lifetime leaderboard ordered by all completed Rank Points. |
| Monthly | UTC calendar-month leaderboard. |
| Weekly | UTC Monday–Sunday leaderboard. |

## Entry

- Every approved product enters Overall Rank **for free at 0 Rank Points**.
- Promotional Rank spending requires a **verified maker claim**. Verification confirms control of
  the listing; it is not an endorsement of the product.
- Harpd-operated and unclaimed editorial reference listings are **excluded from Maker Rank**.

## Trending

Trending is **organic and independent of Rank Points**: recent unique profile activity, outbound
clicks and saves in a rolling 7-day window. It cannot be bought.

## Objective (non-sponsored) metrics

`rankings/rank-open-data.json` is the non-sponsored half of the dataset: verified GitHub star counts
and first-party referral counts, each with its own verification timestamp. It deliberately carries
**no Rank Points and no rank positions**, so anyone citing it is citing facts that cannot be
purchased.

Values are only present when Harpd has verified a real source. Nothing here is estimated — a missing
value means "not verified", **not** "zero".

## Timestamps

| Field | Meaning |
| --- | --- |
| `generatedAt` | When the response was serialized. Moves on every rebuild. |
| `lastUpdated` | Most recent **record-level** change in the collection. Moves only when data actually changes. |

Use `lastUpdated` to judge staleness.

## What is excluded

Never included: user accounts or contact details, billing or processor identifiers, credential or
secret material, internal review notes, private account fields, or any unapproved or hidden listing.

## Reproducibility

Every closed period is frozen under `snapshots/<YYYY-MM>/` with sha256 checksums in
`snapshots/<YYYY-MM>/manifest.json`. Re-run `node scripts/sync.mjs --check` to verify the committed
files are intact.
