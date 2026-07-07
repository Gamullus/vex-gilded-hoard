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
