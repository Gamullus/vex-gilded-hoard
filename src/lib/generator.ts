import type { CreatureProfile, GeneratedItem, GeneratorInput, Rarity } from '../types';
import {
  bonusByRarity,
  categoryMechanics,
  categorySubtitles,
  chargesByRarity,
  classAttunementHooks,
  damageDiceByRarity,
  downsideOptions,
  itemTemplates,
  magicVerbs,
  minorProperties,
  quirks,
  rarityRules,
  saveDcByRarity,
  spellLikeEffects,
  themeEffects,
  themeWords,
} from '../data/tables';

const rarityOrder: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(items: T[], seed: string, salt: string): T {
  if (!items.length) {
    throw new Error('Cannot pick from an empty list.');
  }
  const index = hash(`${seed}:${salt}`) % items.length;
  return items[index];
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function normalizeTheme(theme: string): string {
  return theme.trim().toLowerCase() || 'gilded hoard';
}

function themeKeywords(theme: string): string[] {
  const normalized = normalizeTheme(theme);
  const direct = Object.keys(themeEffects).filter((key) => normalized.includes(key));
  if (direct.length > 0) return direct;
  return ['shadow'];
}

function referenceText(input: GeneratorInput): string {
  return input.srdReference?.trim() ?? '';
}

function inferDamageType(theme: string, creature: CreatureProfile, reference = ''): string {
  const merged = `${theme} ${creature.damageHints.join(' ')} ${reference}`.toLowerCase();
  if (merged.includes('fire')) return 'fire';
  if (merged.includes('cold') || merged.includes('frost') || merged.includes('ice')) return 'cold';
  if (merged.includes('lightning') || merged.includes('thunder') || merged.includes('storm')) return merged.includes('thunder') ? 'thunder' : 'lightning';
  if (merged.includes('acid')) return 'acid';
  if (merged.includes('poison') || merged.includes('venom')) return 'poison';
  if (merged.includes('psychic') || merged.includes('dream') || merged.includes('mind')) return 'psychic';
  if (merged.includes('radiant') || merged.includes('holy') || merged.includes('sun')) return 'radiant';
  if (merged.includes('necrotic') || merged.includes('death') || merged.includes('undead')) return 'necrotic';
  if (merged.includes('force') || merged.includes('gravity')) return 'force';
  return 'necrotic';
}

export function parseCreatureStatblock(raw: string): CreatureProfile {
  const text = raw.trim();
  if (!text) {
    return { damageHints: [], defenses: [], traits: [] };
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const name = lines[0]?.replace(/[*_#]/g, '').slice(0, 80);
  const typeLine = lines.find((line) => /\b(tiny|small|medium|large|huge|gargantuan)\b/i.test(line));
  const crMatch = text.match(/(?:challenge|cr)\s*(?:rating)?\s*[:\-]?\s*([0-9/]+|\d+)/i);
  const damageSections = [...text.matchAll(/Damage (?:Resistances|Immunities|Vulnerabilities)\s*[:\-]?\s*([^\n]+)/gi)].map((match) => match[1]);
  const conditionSections = [...text.matchAll(/Condition Immunities\s*[:\-]?\s*([^\n]+)/gi)].map((match) => match[1]);
  const damageWords = [
    'acid',
    'cold',
    'fire',
    'force',
    'lightning',
    'necrotic',
    'poison',
    'psychic',
    'radiant',
    'thunder',
  ];
  const damageHints = damageWords.filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(text));

  const traitLines = lines.filter((line) => {
    const looksLikeTrait = /^[A-Z][A-Za-z'’ -]+\./.test(line);
    const usefulKeyword = /(breath|gaze|aura|regeneration|web|pounce|swallow|charm|frightful|shapechanger|spellcasting|incorporeal|amphibious|keen|pack tactics)/i.test(
      line,
    );
    return looksLikeTrait || usefulKeyword;
  });

  const component = chooseCreatureComponent(text);

  return {
    name,
    cr: crMatch?.[1],
    type: typeLine,
    damageHints,
    defenses: [...damageSections, ...conditionSections].map((entry) => entry.trim()).slice(0, 5),
    traits: traitLines.slice(0, 5),
    component,
  };
}

function chooseCreatureComponent(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('dragon') || lower.includes('breath')) return 'a heat-cracked scale and a sliver of heartbone';
  if (lower.includes('spider') || lower.includes('web')) return 'a silk gland, venom pearl, or chitin needle';
  if (lower.includes('undead') || lower.includes('necrotic')) return 'a blackened fingerbone, grave coin, or soul-cold tooth';
  if (lower.includes('fiend') || lower.includes('devil') || lower.includes('demon')) return 'a horn shaving sealed in gold wax';
  if (lower.includes('fey') || lower.includes('charm')) return 'a name-knot of hair, thorn, and moonlit thread';
  if (lower.includes('beast') || lower.includes('pounce')) return 'a fang, claw, or tendon treated with silver oil';
  if (lower.includes('ooze') || lower.includes('acid')) return 'a sealed bead of living acid suspended in glass';
  if (lower.includes('elemental') || lower.includes('storm')) return 'a crystalized mote from the creature’s core';
  return 'a trophy fragment chosen from the creature’s signature anatomy';
}

function makeName(input: GeneratorInput, creature: CreatureProfile): string {
  const seed = JSON.stringify({ ...input, creature });
  const theme = normalizeTheme(input.theme);
  const themeTitle = titleCase(theme.split(/[,:;|/]+/)[0] || pick(themeWords, seed, 'fallback-theme'));
  const noun = pick(categorySubtitles[input.category], seed, 'noun');
  const prefix = pick(themeWords, seed, 'prefix');
  const verb = pick(magicVerbs, seed, 'verb');
  const creatureFragment = creature.name ? ` of the ${creature.name.replace(/^the\s+/i, '')}` : '';

  if (input.category === 'Potion') return `${themeTitle} ${titleCase(noun)} of ${titleCase(verb)}`;
  if (input.category === 'Scroll') return `${titleCase(prefix)} ${titleCase(noun)} of ${themeTitle}`;
  if (creature.name && input.creatureStatblock.trim()) return `${themeTitle} ${titleCase(noun)}${creatureFragment}`;
  return `${titleCase(prefix)} ${titleCase(noun)} of ${themeTitle}`;
}

function makeTypeLine(input: GeneratorInput): string {
  if (input.category === 'Weapon') return `Weapon (${input.weaponSubtype.toLowerCase()}), ${input.rarity}`;
  if (input.category === 'Armor') return `Armor (${input.armorSubtype.toLowerCase()}), ${input.rarity}`;
  if (input.category === 'Shield') return `Shield, ${input.rarity}`;
  return `${input.category}, ${input.rarity}`;
}

function shouldRequireAttunement(input: GeneratorInput): boolean {
  if (input.category === 'Potion' || input.category === 'Scroll') return false;
  if (input.classAttunement !== 'Any') return true;
  if (input.rarity === 'Common') return false;
  if (input.rarity === 'Uncommon') return input.category !== 'Weapon' || input.includeSpellLike;
  return true;
}

function makeAttunement(input: GeneratorInput): string {
  if (!shouldRequireAttunement(input)) return 'does not require attunement';
  return pick(classAttunementHooks[input.classAttunement], JSON.stringify(input), 'class-hook');
}

function makeStory(input: GeneratorInput, creature: CreatureProfile): string {
  const seed = JSON.stringify({ ...input, creature });
  const theme = titleCase(normalizeTheme(input.theme));
  const maker = pick(
    ['a nameless court enchanter', 'a jealous treasure-priest', 'Vex during a sleepless bargain', 'a dragon-hoard goldsmith', 'a battlefield artificer', 'a masked hedge-witch', 'a drowned oracle'],
    seed,
    'maker',
  );
  const history = creature.name
    ? `Its final enchantment was quenched with ${creature.component}, taken from ${creature.name}.`
    : pick(
        [
          'Its first owner vanished after paying a debt in coins that were not minted yet.',
          'It was lost in a vault where every lock had learned to lie.',
          'It was made as a reward, then hidden because the reward proved too tempting.',
          'Its magic still remembers the hand that dropped it into a king’s ransom.',
        ],
        seed,
        'history',
      );

  const ref = referenceText(input)
    ? ' Its enchantment was patterned after an SRD reference entry, then twisted into a new hoard-worthy form.'
    : '';

  return `${maker} made this ${input.category.toLowerCase()} for a ${theme.toLowerCase()} problem that ordinary steel, prayer, or coin could not solve. ${history}${ref}`;
}

function makeAppearance(input: GeneratorInput, creature: CreatureProfile): string {
  const seed = JSON.stringify({ ...input, creature });
  const material = pick(
    ['charcoal iron', 'blackened silver', 'violet glass', 'old bone under gold leaf', 'dark leather and pale thread', 'smoked crystal', 'coin-bright brass'],
    seed,
    'material',
  );
  const detail = creature.component
    ? `A visible setting holds ${creature.component}, worked into the design rather than hidden.`
    : pick(
        [
          'Pale lavender runes wake under moonlight.',
          'Its edges look gilded only when no one is touching it.',
          'A thin line of purple light moves beneath the surface like a trapped thought.',
          'The maker’s mark is a tiny kobold claw stamped inside a coin-shaped seal.',
        ],
        seed,
        'detail',
      );
  return `Made from ${material}, this item keeps the black-charcoal-purple look of Vex’s hoard. ${detail}`;
}

function fillTemplate(template: string, input: GeneratorInput, damageType: string): string {
  return template
    .replaceAll('{bonus}', bonusByRarity[input.rarity])
    .replaceAll('{damageDie}', damageDiceByRarity[input.rarity])
    .replaceAll('{damageType}', damageType)
    .replaceAll('{charges}', chargesByRarity[input.rarity]);
}

function summarizeSrdReference(reference: string): string | undefined {
  if (!reference.trim()) return undefined;
  const compact = reference.replace(/\s+/g, ' ').trim();
  return compact.length > 220 ? `${compact.slice(0, 220)}…` : compact;
}

function makeProperties(input: GeneratorInput, creature: CreatureProfile): string[] {
  const seed = JSON.stringify({ ...input, creature });
  const ref = referenceText(input);
  const damageType = inferDamageType(input.theme, creature, ref);
  const templates = categoryMechanics[input.category];
  const properties = [fillTemplate(pick(templates, seed, 'base-mechanic'), input, damageType)];
  const keyword = themeKeywords(`${input.theme} ${ref}`)[0];
  const themedEffects = themeEffects[keyword] ?? themeEffects.shadow;
  const rider = pick(themedEffects, seed, 'rider');

  if (input.category === 'Weapon') {
    if (input.rarity !== 'Common') {
      properties.push(`The first time each round you trigger the item’s rider, the target must succeed on a ${saveDcByRarity[input.rarity]} saving throw or suffer a brief ${rider} effect until the start of your next turn.`);
    } else {
      properties.push(`The weapon counts as magical and can display a harmless ${rider} sign on command.`);
    }
  } else if (input.category === 'Armor' || input.category === 'Shield') {
    properties.push(`When the theme is relevant, the item can turn a hard hit into a story beat: ${rider}. The DM decides the exact narrow trigger when the item is created.`);
  } else {
    properties.push(`Choose one signature use when the item is created: ${themedEffects.slice(0, 3).join(', ')}. This keeps the item focused instead of becoming a bag of unrelated powers.`);
  }

  if (input.includeSpellLike) {
    const allowed = spellLikeEffects.filter((effect) => rarityOrder.indexOf(effect.minRarity) <= rarityOrder.indexOf(input.rarity));
    properties.push(pick(allowed, seed, 'spell-like').effect);
  }

  const srdSummary = summarizeSrdReference(ref);
  if (srdSummary) {
    properties.push(`SRD reference influence: ${srdSummary} Use it as inspiration for tags, range, damage type, save type, duration, or activation limits, not as a direct copy unless you want the item to reproduce that SRD effect.`);
  }

  if (creature.name) {
    const traitText = creature.traits[0]
      ? `It borrows a restrained version of this creature trait: “${creature.traits[0].slice(0, 120)}${creature.traits[0].length > 120 ? '…' : ''}”`
      : 'It borrows a restrained version of the creature’s strongest visual or defensive theme.';
    properties.push(`${traitText} The borrowed effect should stay below the rarity’s spell/bonus ceiling.`);
  }

  if (input.allowDownside && rarityOrder.indexOf(input.rarity) >= rarityOrder.indexOf('Rare')) {
    properties.push(pick(downsideOptions, seed, 'downside'));
  }

  return properties;
}

function makeCraftingHook(creature: CreatureProfile, input: GeneratorInput): string | undefined {
  if (!creature.name && !input.creatureStatblock.trim()) return undefined;
  const defenses = creature.defenses.length ? ` It especially wants to express ${creature.defenses[0].toLowerCase()}.` : '';
  const cr = creature.cr ? ` CR ${creature.cr}` : '';
  return `Crafting suggestion:${cr} ${creature.name ?? 'the creature'} can provide ${creature.component}.${defenses} The crafter still needs a mundane ${input.category.toLowerCase()} base, rare reagents worth a DM-set cost, and downtime appropriate to the item’s rarity.`;
}

function makeBalanceNotes(input: GeneratorInput): string[] {
  const rule = rarityRules[input.rarity];
  const notes = [
    `${input.rarity} ceiling: ${rule.maxSpellLevel}; static bonus target: ${rule.maxBonus}.`,
    'Keep the item to one main job: either improve something the character already does or grant one new trick.',
  ];

  if (input.includeSpellLike) {
    notes.push('Spell-like effects should use charges, once-per-day limits, a save DC, line of sight, or another clear limiter.');
  }

  if (referenceText(input)) {
    notes.push('The selected SRD entry is used as a comparison pattern for tags and limits. The generated item should still be checked against the rarity ceiling.');
  }

  if (shouldRequireAttunement(input)) {
    notes.push('Attunement is used here to prevent sharing, stacking, and passive bonus abuse.');
  }

  return notes;
}

export function generateItem(input: GeneratorInput): GeneratedItem {
  const creature = parseCreatureStatblock(input.creatureStatblock);
  const seed = JSON.stringify({ ...input, creature, timeBucket: Math.floor(Date.now() / 1000) });
  const sourceTemplate = pick(itemTemplates, seed, 'template');
  const srd = summarizeSrdReference(referenceText(input));

  return {
    name: makeName(input, creature),
    typeLine: makeTypeLine(input),
    rarity: input.rarity,
    requiresAttunement: makeAttunement(input),
    story: makeStory(input, creature),
    appearance: makeAppearance(input, creature),
    properties: makeProperties(input, creature),
    minorProperty: pick(minorProperties, seed, 'minor'),
    quirk: pick(quirks, seed, 'quirk'),
    craftingHook: makeCraftingHook(creature, input),
    balanceNotes: makeBalanceNotes(input),
    sourceTemplate: srd
      ? `${sourceTemplate.name}: ${sourceTemplate.safeSummary} SRD pattern: ${srd}`
      : `${sourceTemplate.name}: ${sourceTemplate.safeSummary}`,
  };
}
