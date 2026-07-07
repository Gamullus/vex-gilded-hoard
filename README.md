# Vex's Gilded Hoard

A dark fantasy D&D 5e magic item generator for making unique, table-ready treasures from item type, subtype, rarity, theme, class attunement, and optional monster statblocks.

## First draft features

- Generates a full item card with name, rarity, type line, attunement, mechanics, two-sentence lore, minor property, quirk, balance notes, and crafting hooks.
- Supports weapons, armor, shields, wondrous items, rings, rods, staves, wands, potions, and scrolls.
- Uses rarity power guidance, spell-like limits, charge templates, minor properties, class attunement tables, and creature-part crafting logic.
- Includes a statblock paste box that extracts creature name, CR, type, resistances, immunities, vulnerabilities, and signature wording to suggest crafted item components.
- Uses the requested palette: near-black, charcoal, muted gray, mythic purple, and pale lavender.

## Data note

This repository intentionally does not copy full book item text. The current seed data contains original summaries and design templates that can be used as comparison/building blocks. The data layer is built so you can later add your own licensed, private, or open item references.

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
