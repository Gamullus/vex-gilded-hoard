import type { CreatureProfile, GeneratedItem, GeneratorInput } from '../types';
import { categorySubtitles, classAttunementHooks, itemTemplates, rarityRules } from '../data/tables';
import {
  firstLevelSpellProperties,
  getClassSkillPool,
  nonSpellProperty,
  propertyCountByRarity,
  rollPropertyTable,
  saveDcByRarity,
  secondLevelSpellProperties,
  skillProperty,
  thirdLevelSpellProperties,
  type PropertyTableKey,
  type RolledProperty,
} from '../data/property-tables';

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

function die(seed: string, salt: string, sides = 10): number {
  return (hash(`${seed}:${salt}`) % sides) + 1;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function normalizeTheme(theme: string): string {
  return theme.replace(/#\d+$/g, '').trim().toLowerCase() || 'unclaimed relic';
}

function referenceText(input: GeneratorInput): string {
  return input.srdReference?.trim() ?? '';
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
  const damageWords = ['acid', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'poison', 'psychic', 'radiant', 'thunder'];
  const damageHints = damageWords.filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(text));

  const traitLines = lines.filter((line) => {
    const looksLikeTrait = /^[A-Z][A-Za-z'’ -]+\./.test(line);
    const usefulKeyword = /(breath|gaze|aura|regeneration|web|pounce|swallow|charm|frightful|shapechanger|spellcasting|incorporeal|amphibious|keen|pack tactics)/i.test(line);
    return looksLikeTrait || usefulKeyword;
  });

  return {
    name,
    cr: crMatch?.[1],
    type: typeLine,
    damageHints,
    defenses: [...damageSections, ...conditionSections].map((entry) => entry.trim()).slice(0, 5),
    traits: traitLines.slice(0, 5),
    component: chooseCreatureComponent(text),
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

function shouldRequireAttunement(input: GeneratorInput): boolean {
  if (input.category === 'Potion' || input.category === 'Scroll') return false;
  if (input.classAttunement !== 'Any') return true;
  return input.rarity !== 'Common';
}

function makeAttunement(input: GeneratorInput): string {
  if (!shouldRequireAttunement(input)) return 'does not require attunement';
  return pick(classAttunementHooks[input.classAttunement], JSON.stringify(input), 'class-hook');
}

function makeTypeLine(input: GeneratorInput): string {
  if (input.category === 'Weapon') return `Weapon (${input.weaponSubtype.toLowerCase()}), ${input.rarity}`;
  if (input.category === 'Armor') return `Armor (${input.armorSubtype.toLowerCase()}), ${input.rarity}`;
  if (input.category === 'Shield') return `Shield, ${input.rarity}`;
  return `${input.category}, ${input.rarity}`;
}

function makeName(input: GeneratorInput, rolledProperties: RolledProperty[]): string {
  const seed = JSON.stringify({ input, rolledProperties });
  const theme = normalizeTheme(input.theme);
  const themeTitle = titleCase(theme.split(/[,:;|/]+/)[0]);
  const noun = pick(categorySubtitles[input.category], seed, 'noun');
  const signature = rolledProperties[0]?.label ?? 'Burden';
  return `${titleCase(noun)} of ${signature.includes(' or ') ? themeTitle : signature}`;
}

function selectSpellProperty(table: PropertyTableKey, roll: number): RolledProperty {
  const source = table === 'spell1' ? firstLevelSpellProperties : table === 'spell2' ? secondLevelSpellProperties : thirdLevelSpellProperties;
  const selected = source[Math.max(0, Math.min(9, roll - 1))];
  return { ...selected, table };
}

function rollProperties(input: GeneratorInput): RolledProperty[] {
  const propertyCount = propertyCountByRarity[input.rarity];
  const seed = JSON.stringify(input);
  const output: RolledProperty[] = [];
  const usedLabels = new Set<string>();

  for (let i = 0; i < propertyCount; i += 1) {
    let tableRoll = die(seed, `table-${i}`);
    let table = rollPropertyTable(tableRoll, input.rarity);

    if (input.rarity === 'Uncommon' && i === 0) table = 'skill';
    if (input.rarity === 'Uncommon' && i === 1 && table === 'skill') table = 'spell1';

    const propertyRoll = die(seed, `property-${i}`);
    let property: RolledProperty;

    if (table === 'skill') {
      const skillPool = getClassSkillPool(input.classAttunement);
      const skill = skillPool[(propertyRoll - 1) % skillPool.length];
      property = { ...skillProperty(skill, input.rarity), roll: propertyRoll };
    } else if (table === 'nonSpell') {
      property = nonSpellProperty(propertyRoll, input.rarity, input.category);
    } else {
      property = selectSpellProperty(table, propertyRoll);
    }

    if (usedLabels.has(property.label)) {
      property = nonSpellProperty(die(seed, `fallback-${i}`), input.rarity, input.category);
    }

    usedLabels.add(property.label);
    output.push(property);
  }

  return output;
}

function propertyLine(property: RolledProperty, input: GeneratorInput): string {
  const text = property.text.replace('The save DC is based on the item rarity.', `The save DC is ${saveDcByRarity[input.rarity]}.`);
  return `${property.label}. ${text}`;
}

function makeStory(input: GeneratorInput, rolledProperties: RolledProperty[], creature: CreatureProfile): string {
  const famedFor = rolledProperties.map((property) => property.label).join(', ');
  const previousWielder = pick(
    [
      'a duelist whose name opened doors before their blade was ever drawn',
      'a courier who crossed impossible distances and made enemies of every border',
      'a court magician praised for solving problems no one else could even name',
      'a thief celebrated for surviving falls, locks, guards, and bad omens',
      'a monster hunter whose reputation became more dangerous than the beasts',
      'a battlefield saint who was expected to save everyone and could not stop trying',
      'a masked performer whose tricks became indistinguishable from miracles',
      'a sailor whose impossible escapes turned into debts owed to the deep',
    ],
    JSON.stringify(input),
    'previous-wielder',
  );
  const burden = pick(
    [
      'the fame became a leash',
      'every victory created another desperate request',
      'the item began answering need before its bearer could refuse',
      'people stopped seeing a person and only saw the miracle',
      'the last owner could no longer tell whether they chose the item or the item chose for them',
    ],
    JSON.stringify(input),
    'burden',
  );
  const creatureLine = creature.name ? ` Its present form also carries a worked remnant of ${creature.name}.` : '';
  return `This item once belonged to ${previousWielder}, famed for ${famedFor}. Vex took it when ${burden}, leaving the talent behind but removing the worst of the burden.${creatureLine}`;
}

function makeAppearance(input: GeneratorInput, rolledProperties: RolledProperty[], creature: CreatureProfile): string {
  const seed = JSON.stringify({ input, rolledProperties, creature });
  const material = pick(
    ['charcoal iron', 'blackened silver', 'violet glass', 'old bone under gold leaf', 'dark leather and pale thread', 'smoked crystal', 'coin-bright brass'],
    seed,
    'material',
  );
  const propertyMotif = rolledProperties.slice(0, 2).map((property) => property.tags[0]).filter(Boolean).join(' and ');
  const creatureDetail = creature.component ? ` A visible setting holds ${creature.component}.` : '';
  return `Made from ${material}, the item bears small marks suggesting ${propertyMotif || normalizeTheme(input.theme)} rather than open decoration.${creatureDetail}`;
}

function makeMinorProperty(input: GeneratorInput, rolledProperties: RolledProperty[]): string {
  const skill = rolledProperties.find((property) => property.table === 'skill');
  if (skill) return `Its minor property is already represented by ${skill.label}: ${skill.text}`;
  const warning = pick(
    [
      'The item grows warm when its active property can solve a nearby problem.',
      'The item quietly reveals its command word to a newly attuned bearer in a dream.',
      'The item can appear mundane until deliberately used.',
      'The item never harms a creature the bearer has honestly sworn to protect unless the bearer forces it to.',
      'The item briefly shows the silhouette of its previous wielder when initiative is rolled.',
    ],
    JSON.stringify(input),
    'minor',
  );
  return warning;
}

function makeCraftingHook(creature: CreatureProfile, input: GeneratorInput): string | undefined {
  if (!creature.name && !input.creatureStatblock.trim()) return undefined;
  const defenses = creature.defenses.length ? ` It especially wants to express ${creature.defenses[0].toLowerCase()}.` : '';
  const cr = creature.cr ? ` CR ${creature.cr}` : '';
  return `Crafting suggestion:${cr} ${creature.name ?? 'the creature'} can provide ${creature.component}.${defenses} The crafter still needs a mundane ${input.category.toLowerCase()} base, rare reagents worth a DM-set cost, and downtime appropriate to the item’s rarity.`;
}

function summarizeReference(reference: string): string | undefined {
  if (!reference.trim()) return undefined;
  const compact = reference.replace(/\s+/g, ' ').trim();
  return compact.length > 180 ? `${compact.slice(0, 180)}…` : compact;
}

function makeBalanceNotes(input: GeneratorInput, rolledProperties: RolledProperty[]): string[] {
  const rule = rarityRules[input.rarity];
  const reference = summarizeReference(referenceText(input));
  const notes = [
    `${input.rarity} property count: ${rolledProperties.length}. Ceiling: ${rule.maxSpellLevel}; static bonus target: ${rule.maxBonus}.`,
    `Property tables rolled: ${rolledProperties.map((property) => property.table).join(', ')}.`,
  ];

  if (input.rarity === 'Uncommon') notes.push('Uncommon items are capped at two properties: one passive/minor property and one daily, charged, or command property.');
  if (reference) notes.push(`Reference influence: ${reference}`);
  if (shouldRequireAttunement(input)) notes.push('Attunement is used to prevent sharing, stacking, and passive bonus abuse.');
  return notes;
}

export function generateItem(input: GeneratorInput): GeneratedItem {
  const creature = parseCreatureStatblock(input.creatureStatblock);
  const rolledProperties = rollProperties(input);
  const sourceTemplate = pick(itemTemplates, JSON.stringify(input), 'template');

  return {
    name: makeName(input, rolledProperties),
    typeLine: makeTypeLine(input),
    rarity: input.rarity,
    requiresAttunement: makeAttunement(input),
    story: makeStory(input, rolledProperties, creature),
    appearance: makeAppearance(input, rolledProperties, creature),
    properties: rolledProperties.map((property) => propertyLine(property, input)),
    minorProperty: makeMinorProperty(input, rolledProperties),
    quirk: 'The item is not framed as treasure; it is a talent taken from someone who could no longer survive being known for it.',
    craftingHook: makeCraftingHook(creature, input),
    balanceNotes: makeBalanceNotes(input, rolledProperties),
    sourceTemplate: `${sourceTemplate.name}: ${sourceTemplate.safeSummary}`,
  };
}
