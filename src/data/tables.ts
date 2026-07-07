import type { ClassName, ItemCategory, Rarity, RarityRule } from '../types';

export const rarityRules: Record<Rarity, RarityRule> = {
  Common: {
    rarity: 'Common',
    maxSpellLevel: 'Cantrip or 1st-level, usually once per day or consumable',
    maxBonus: 'No static bonus',
    chargeRange: '1 use/day or 1-3 tiny charges',
    guidance: 'Mostly flavor, convenience, small exploration tricks, or a harmless cantrip-scale effect.',
  },
  Uncommon: {
    rarity: 'Uncommon',
    maxSpellLevel: 'Up to 3rd-level once per day, or lower-level effects more often',
    maxBonus: '+1',
    chargeRange: '3-5 charges, 1d4+1 restored at dawn',
    guidance: 'One reliable combat or exploration feature, or a modest passive improvement.',
  },
  Rare: {
    rarity: 'Rare',
    maxSpellLevel: 'Up to 5th-level once per day; lower-level effects can repeat',
    maxBonus: '+2',
    chargeRange: '4-7 charges, 1d6+1 restored at dawn',
    guidance: 'One strong feature plus a small rider, resistance, or limited spell-like burst.',
  },
  'Very Rare': {
    rarity: 'Very Rare',
    maxSpellLevel: 'Up to 8th-level once per day, or previous tiers more freely',
    maxBonus: '+3',
    chargeRange: '6-10 charges, 1d6+2 restored at dawn',
    guidance: 'Multiple major abilities, repeatable movement/control, strong defense, or high-impact spell access.',
  },
  Legendary: {
    rarity: 'Legendary',
    maxSpellLevel: 'Up to 9th-level once per day; lesser powers can be frequent',
    maxBonus: '+4 suggested ceiling for this app, though 5e normally keeps weapons/armor at +3',
    chargeRange: '8-12 charges, 1d8+4 restored at dawn',
    guidance: 'Campaign-defining powers, sentience, strong identity, and restrictions that keep play manageable.',
  },
};

export const categorySubtitles: Record<ItemCategory, string[]> = {
  Weapon: ['blade', 'axe', 'bow', 'spear', 'hammer', 'dagger', 'mace', 'crossbow', 'whip'],
  Armor: ['cuirass', 'mail', 'leathers', 'plate', 'mantle', 'brigandine'],
  Shield: ['shield', 'buckler', 'ward', 'aegis'],
  'Wondrous Item': ['charm', 'orb', 'cloak', 'mask', 'lantern', 'book', 'dice', 'reliquary', 'boots'],
  Ring: ['ring', 'signet', 'band', 'loop'],
  Rod: ['rod', 'scepter', 'baton'],
  Staff: ['staff', 'crook', 'walking staff'],
  Wand: ['wand', 'needle', 'switch', 'spindle'],
  Potion: ['elixir', 'phial', 'draught', 'bottle'],
  Scroll: ['scroll', 'vellum', 'sealed writ'],
};

export const themeWords = [
  'ashen',
  'gilded',
  'moonlit',
  'violet',
  'salt-worn',
  'infernal',
  'serpentine',
  'starless',
  'thornbound',
  'grave-cold',
  'storm-cut',
  'honeyed',
  'bone-white',
  'obsidian',
  'oracle-marked',
];

export const magicVerbs = [
  'binds',
  'drinks',
  'echoes',
  'gilds',
  'remembers',
  'sings to',
  'brands',
  'mirrors',
  'unlocks',
  'hollows',
  'threads',
  'awakens',
];

export const themeEffects: Record<string, string[]> = {
  fire: ['fire damage', 'smoke-veiled movement', 'heat shimmer illusion', 'burning marks'],
  flame: ['fire damage', 'smoke-veiled movement', 'heat shimmer illusion', 'burning marks'],
  frost: ['cold damage', 'speed reduction', 'ice footing', 'rime armor'],
  ice: ['cold damage', 'speed reduction', 'ice footing', 'rime armor'],
  necrotic: ['necrotic damage', 'temporary hit points', 'grave whispers', 'withered vitality'],
  death: ['necrotic damage', 'temporary hit points', 'grave whispers', 'withered vitality'],
  lightning: ['lightning damage', 'reaction movement', 'metal-seeking sparks', 'thunderclap burst'],
  storm: ['lightning damage', 'reaction movement', 'metal-seeking sparks', 'thunderclap burst'],
  poison: ['poison damage', 'sickened target', 'venom reservoir', 'toxin detection'],
  acid: ['acid damage', 'armor scoring', 'corrosive splash', 'etched trails'],
  psychic: ['psychic damage', 'dreamlike misdirection', 'emotion reading', 'nightmare pulse'],
  dream: ['psychic damage', 'dreamlike misdirection', 'emotion reading', 'nightmare pulse'],
  shadow: ['necrotic damage', 'dim-light stealth', 'silencing veil', 'living shadow'],
  radiant: ['radiant damage', 'truth-revealing glow', 'undead warning', 'halo flare'],
  sea: ['cold damage', 'water breathing', 'mist step', 'tidal shove'],
  fey: ['charm pulse', 'glamour veil', 'name-binding quirk', 'wild growth'],
  dragon: ['elemental damage', 'fearful presence echo', 'scale ward', 'breath-shaped burst'],
};

export const classAttunementHooks: Record<ClassName, string[]> = {
  Any: ['requires attunement'],
  Artificer: ['requires attunement by an artificer', 'responds to infused tools, repaired runes, and crafted sigils'],
  Barbarian: ['requires attunement by a barbarian', 'flares when the wielder enters a rage'],
  Bard: ['requires attunement by a bard', 'answers to performance, voice, rhythm, or story'],
  Cleric: ['requires attunement by a cleric', 'brightens near holy symbols and answered prayers'],
  Druid: ['requires attunement by a druid', 'changes texture with seasons, beasts, and weather'],
  Fighter: ['requires attunement by a fighter', 'rewards practiced stances and disciplined strikes'],
  Monk: ['requires attunement by a monk', 'hums with breath control and ki-like focus'],
  Paladin: ['requires attunement by a paladin', 'weighs oaths, vows, and broken promises'],
  Ranger: ['requires attunement by a ranger', 'tracks spoor, weather, and favored prey'],
  Rogue: ['requires attunement by a rogue', 'prefers hidden hands, locks, shadows, and careful lies'],
  Sorcerer: ['requires attunement by a sorcerer', 'changes in response to innate magic and bloodline surges'],
  Warlock: ['requires attunement by a warlock', 'listens for bargains, patrons, and names spoken in the dark'],
  Wizard: ['requires attunement by a wizard', 'reveals margin-notes, formulae, and spell lattice geometry'],
};

export const minorProperties = [
  'While holding or wearing the item, tiny motes of pale lavender light trace nearby magic within 5 feet, too faint to reveal invisible creatures.',
  'The item never becomes dirty, though blood on it dries into thin black-gold lines before flaking away.',
  'Once per day, the bearer can make the item shed dim lavender light in a 10-foot radius for 10 minutes.',
  'The bearer always knows which direction is north while the item is touching their skin.',
  'The item whispers one harmless sensory detail about its previous owner when first attuned.',
  'When the bearer rolls initiative, the item briefly displays a tiny illusory crown, fang, eye, or coin tied to its theme.',
  'The item feels warm near hidden treasure worth at least 50 gp within 30 feet, but gives no direction.',
  'The bearer can use an action to make the item appear mundane until it is used or until 1 hour passes.',
  'The item leaves a faint scent tied to its theme: ozone, incense, wet stone, old coins, grave soil, or crushed herbs.',
  'The item subtly resizes to fit its attuned bearer, but always keeps one unsettling imperfection.',
];

export const quirks = [
  'It dislikes being stored with mundane coins and clicks softly until separated.',
  'Its magic is silent in direct sunlight and louder in shadow.',
  'A previous owner’s initials appear somewhere new after each long rest.',
  'It becomes slightly heavier when its bearer tells a deliberate lie.',
  'It attracts harmless moths, cinders, droplets, beetles, or sparks during rests.',
  'The command word sounds like a name, but no one remembers whose name it was.',
  'It refuses to harm one oddly specific creature type chosen by the DM.',
  'It occasionally shows a tiny reflection of a treasure hoard that does not exist yet.',
];

export const downsideOptions = [
  'After you use its major property, the item cannot be used again until you spend 1 minute cleaning, feeding, cooling, or calming it.',
  'If you expend its last charge, roll a d20. On a 1, the item loses its magic until the next dawn.',
  'The bearer has disadvantage on Charisma checks against creatures that strongly oppose the item’s theme while its magic is active.',
  'The item’s major property fails in an antimagic field, while silenced, or if the target has total cover.',
  'A creature that succeeds on the saving throw against the item is immune to that same property until the next dawn.',
];

export const spellLikeEffects = [
  {
    label: 'Cantrip spark',
    minRarity: 'Common' as Rarity,
    effect: 'You can use an action to produce a harmless sensory magical effect tied to the item’s theme, or deal 1d6 thematic damage to an unattended Tiny object.',
  },
  {
    label: '1st-level echo',
    minRarity: 'Common' as Rarity,
    effect: 'Once per day, you can cast a 1st-level spell-like effect chosen by the DM that matches the theme. Use DC 13 if a saving throw is needed.',
  },
  {
    label: '3rd-level pulse',
    minRarity: 'Uncommon' as Rarity,
    effect: 'The item has 3 charges. As an action, expend 1 charge to create a limited 1st- to 3rd-level spell-like effect matching the theme. It regains 1d3 expended charges at dawn.',
  },
  {
    label: '5th-level seal',
    minRarity: 'Rare' as Rarity,
    effect: 'Once per day, you can release a powerful spell-like effect of up to 5th level matching the theme. Use DC 15 or your spell save DC, whichever is higher.',
  },
  {
    label: '8th-level relic working',
    minRarity: 'Very Rare' as Rarity,
    effect: 'Once per day, you can invoke a major spell-like effect of up to 8th level matching the theme, or repeatedly use a lower-level thematic effect through charges.',
  },
  {
    label: '9th-level mythic working',
    minRarity: 'Legendary' as Rarity,
    effect: 'Once per day, the item can perform a campaign-scale magical working of up to 9th-level power, subject to DM approval and narrative consequences.',
  },
];

export const categoryMechanics: Record<ItemCategory, string[]> = {
  Weapon: [
    'You gain {bonus} to attack and damage rolls made with this magic weapon.',
    'Once on each of your turns when you hit with this weapon, you can deal an extra {damageDie} {damageType} damage.',
    'When you roll a 20 on an attack roll with this weapon, the target suffers the item’s thematic rider until the end of your next turn.',
  ],
  Armor: [
    'While wearing this armor, you gain {bonus} to AC.',
    'You have advantage on one type of saving throw chosen by the DM when the item is created and tied to its theme.',
    'When a creature hits you with a melee attack, you can use your reaction to impose a small thematic consequence on it.',
  ],
  Shield: [
    'While holding this shield, you gain {bonus} to AC in addition to the shield’s normal bonus.',
    'As a reaction when a creature you can see hits you, you can reduce the damage by {damageDie} and push, mark, chill, reveal, or frighten the attacker according to the item’s theme.',
    'The shield can flare as an action, granting half cover to one ally within 5 feet until the start of your next turn.',
  ],
  'Wondrous Item': [
    'The item has {charges} charges and regains expended charges at dawn. You can expend charges to activate one of its listed thematic properties.',
    'While carrying the item, you gain advantage on one narrow kind of ability check tied to its story.',
    'As an action, you can reveal, hide, translate, bind, unlock, or ward something small according to the item’s theme.',
  ],
  Ring: [
    'While wearing this ring, you gain a persistent minor benefit tied to the theme.',
    'The ring has {charges} charges. You can expend 1 charge as a bonus action to bend luck, movement, speech, or protection in a small thematic way.',
    'If a creature you can see triggers the ring’s theme, you can use your reaction to mark it until the end of your next turn.',
  ],
  Rod: [
    'This rod functions as a spellcasting focus. It has {charges} charges and regains expended charges at dawn.',
    'As an action, you can point the rod at a creature or object you can see within 60 feet to impose the item’s theme as a controlled magical effect.',
    'If the rod is planted into the ground, it creates a 10-foot-radius zone of thematic pressure until the start of your next turn.',
  ],
  Staff: [
    'This staff can be used as a quarterstaff and as a spellcasting focus. It has {charges} charges.',
    'When you hit with the staff, you can expend 1 charge to deal an extra {damageDie} {damageType} damage.',
    'You can expend charges to cast or mimic theme-appropriate utility or combat spells within the rarity limit.',
  ],
  Wand: [
    'This wand has {charges} charges and regains expended charges at dawn.',
    'As an action, expend 1 charge to target a creature or object you can see within 60 feet. The target must succeed on a saving throw or suffer the item’s thematic effect.',
    'The wand’s magic requires line of sight and fails against total cover.',
  ],
  Potion: [
    'When you drink this potion, its magic lasts for 1 hour or until its listed effect is discharged.',
    'The drinker gains a temporary thematic benefit, such as resistance, movement, senses, or one small spell-like effect.',
    'After the potion ends, a harmless visible sign of the theme remains for 1d4 hours.',
  ],
  Scroll: [
    'When read aloud as an action, this scroll creates a one-time spell-like effect within the rarity limit.',
    'A creature proficient in Arcana, Religion, or Nature can identify the scroll’s theme and intended target without expending it.',
    'After the scroll is used, its ash forms a clue, omen, or map fragment tied to the item’s story.',
  ],
};

export const itemTemplates = [
  {
    name: 'Static Bonus Template',
    safeSummary: 'A simple enchanted weapon, armor, shield, or focus that grants a rarity-appropriate static bonus.',
  },
  {
    name: 'Charged Wand/Staff Template',
    safeSummary: 'A charged item with limited spell-like activations and dawn recharge.',
  },
  {
    name: 'Resistance Ward Template',
    safeSummary: 'A protective item that grants resistance or advantage against one narrow threat category.',
  },
  {
    name: 'Mobility Utility Template',
    safeSummary: 'An item that improves jumping, climbing, swimming, flying, teleporting, or repositioning within rarity limits.',
  },
  {
    name: 'Detection/Language Template',
    safeSummary: 'A non-combat item that reveals magic, language, invisible marks, hidden doors, creature traces, or ancient lore.',
  },
  {
    name: 'Damage Rider Template',
    safeSummary: 'A weapon or implement that adds limited thematic damage and a small rider on hit.',
  },
  {
    name: 'Summoning/Companion Template',
    safeSummary: 'A higher-rarity item that briefly calls a creature, echo, spirit, or construct with strict duration and usage limits.',
  },
  {
    name: 'Sentient Relic Template',
    safeSummary: 'A very rare or legendary item with a personality, senses, goals, and strong narrative constraints.',
  },
];

export const damageDiceByRarity: Record<Rarity, string> = {
  Common: '1d4',
  Uncommon: '1d6',
  Rare: '1d8',
  'Very Rare': '1d10',
  Legendary: '2d6',
};

export const bonusByRarity: Record<Rarity, string> = {
  Common: '+0',
  Uncommon: '+1',
  Rare: '+2',
  'Very Rare': '+3',
  Legendary: '+3',
};

export const saveDcByRarity: Record<Rarity, string> = {
  Common: 'DC 11',
  Uncommon: 'DC 13',
  Rare: 'DC 15',
  'Very Rare': 'DC 16',
  Legendary: 'DC 18',
};

export const chargesByRarity: Record<Rarity, string> = {
  Common: '1',
  Uncommon: '3',
  Rare: '5',
  'Very Rare': '7',
  Legendary: '9',
};

export const spellDamageTable = [
  ['Cantrip', '1d10', '1d6'],
  ['1', '2d10', '2d6'],
  ['2', '3d10', '3d6'],
  ['3', '5d10', '6d6'],
  ['4', '6d10', '7d6'],
  ['5', '7d10', '8d6'],
  ['6', '10d10', '11d6'],
  ['7', '11d10', '12d6'],
  ['8', '12d10', '13d6'],
  ['9', '15d10', '16d6'],
];
