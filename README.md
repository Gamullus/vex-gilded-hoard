# Vex's Gilded Hoard

A dark fantasy D&D 5e magic item generator for making unique, table-ready treasures from item type, subtype, rarity, theme, class attunement, SRD reference data, and optional monster statblocks.

## First draft features

- Generates a full item card with name, rarity, type line, attunement, mechanics, two-sentence lore, minor property, quirk, balance notes, and crafting hooks.
- Supports weapons, armor, shields, wondrous items, rings, rods, staves, wands, potions, and scrolls.
- Uses rarity power guidance, spell-like limits, charge templates, minor properties, class attunement tables, and creature-part crafting logic.
- Includes a statblock paste box that extracts creature name, CR, type, resistances, immunities, vulnerabilities, and signature wording to suggest crafted item components.
- Includes a local SRD data panel for spells, magic items, and equipment once the one-time importer has been run.
- Uses the requested palette: near-black, charcoal, muted gray, mythic purple, and pale lavender.

## SRD data import

The app is set up for a **one-time SRD pull**, not live API dependency during play.

```bash
npm run import:srd
```

That command fetches SRD spells, magic items, and equipment from `https://www.dnd5eapi.co/api/2014`, normalizes the useful fields, and writes them into:

```text
src/data/srd/srd-dataset.json
```

After that, the UI reads the local JSON file. Search an SRD spell, magic item, or equipment entry, click **Use as source**, and the generator will use it as a pattern for item type, theme tags, rarity, spell-like limits, damage type, save type, range, duration, or equipment base.

## Data note

This repository intentionally does not copy full non-SRD book item text. The current seed data contains original summaries and design templates. The SRD importer only pulls from the open 5e SRD API source you choose with `SRD_API_ROOT`, defaulting to dnd5eapi.co.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Roadmap ideas

- Save generated items to local storage or a backend.
- Import/export item cards as Markdown, JSON, or Foundry VTT items.
- Add a private reference database importer for your own item notes.
- Add image/icon prompt generation for each item.
- Add balance scoring based on party level and attunement pressure.
