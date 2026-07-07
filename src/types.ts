export type ItemCategory =
  | 'Weapon'
  | 'Armor'
  | 'Shield'
  | 'Wondrous Item'
  | 'Ring'
  | 'Rod'
  | 'Staff'
  | 'Wand'
  | 'Potion'
  | 'Scroll';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';

export type WeaponSubtype =
  | 'Melee'
  | 'Ranged'
  | 'Two-Handed'
  | 'Versatile'
  | 'Finesse'
  | 'Thrown'
  | 'Ammunition';

export type ArmorSubtype = 'Light Armor' | 'Medium Armor' | 'Heavy Armor' | 'Shield';

export type ClassName =
  | 'Any'
  | 'Artificer'
  | 'Barbarian'
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Fighter'
  | 'Monk'
  | 'Paladin'
  | 'Ranger'
  | 'Rogue'
  | 'Sorcerer'
  | 'Warlock'
  | 'Wizard';

export interface GeneratorInput {
  category: ItemCategory;
  weaponSubtype: WeaponSubtype;
  armorSubtype: ArmorSubtype;
  rarity: Rarity;
  theme: string;
  classAttunement: ClassName;
  creatureStatblock: string;
  srdReference: string;
  allowDownside: boolean;
  includeSpellLike: boolean;
}

export interface RarityRule {
  rarity: Rarity;
  maxSpellLevel: string;
  maxBonus: string;
  chargeRange: string;
  guidance: string;
}

export interface CreatureProfile {
  name?: string;
  cr?: string;
  type?: string;
  damageHints: string[];
  defenses: string[];
  traits: string[];
  component?: string;
}

export interface GeneratedItem {
  name: string;
  typeLine: string;
  rarity: Rarity;
  requiresAttunement: string;
  story: string;
  appearance: string;
  properties: string[];
  minorProperty: string;
  quirk?: string;
  craftingHook?: string;
  balanceNotes: string[];
  sourceTemplate: string;
}

export interface SrdDataset {
  metadata: {
    generatedAt: string | null;
    apiRoot: string;
    source: string;
    note: string;
  };
  spells: SrdSpell[];
  magicItems: SrdMagicItem[];
  equipment: SrdEquipment[];
}

export interface SrdSpell {
  index: string;
  name: string;
  level?: number;
  school?: string;
  classes?: string[];
  subclasses?: string[];
  range?: string;
  duration?: string;
  concentration?: boolean;
  ritual?: boolean;
  attackType?: string;
  saveType?: string;
  damageType?: string;
  areaType?: string;
  areaSize?: number;
  desc?: string;
  higherLevel?: string;
  sourceUrl?: string;
}

export interface SrdMagicItem {
  index: string;
  name: string;
  category?: string;
  rarity?: string;
  variants?: string[];
  variant?: boolean;
  desc?: string;
  sourceUrl?: string;
}

export interface SrdEquipment {
  index: string;
  name: string;
  category?: string;
  gearCategory?: string;
  toolCategory?: string;
  weaponCategory?: string;
  weaponRange?: string;
  categoryRange?: string;
  damageDice?: string;
  damageType?: string;
  twoHandedDamageDice?: string;
  twoHandedDamageType?: string;
  properties?: string[];
  armorCategory?: string;
  armorClassBase?: number;
  dexBonus?: boolean;
  maxBonus?: number | null;
  strMinimum?: number;
  stealthDisadvantage?: boolean;
  cost?: string;
  weight?: number;
  desc?: string;
  sourceUrl?: string;
}
