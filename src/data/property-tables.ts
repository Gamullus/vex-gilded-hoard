import type { ClassName, ItemCategory, Rarity } from '../types';

export type PropertyTableKey = 'skill' | 'spell1' | 'spell2' | 'spell3' | 'nonSpell';

export interface RolledProperty {
  table: PropertyTableKey;
  roll: number;
  label: string;
  text: string;
  tags: string[];
  activation: 'passive' | 'daily' | 'charges' | 'reaction' | 'command';
}

export const rarityBonus: Record<Rarity, string> = {
  Common: '+1',
  Uncommon: '+1',
  Rare: '+2',
  'Very Rare': '+3',
  Legendary: '+3',
};

export const propertyCountByRarity: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  'Very Rare': 4,
  Legendary: 5,
};

export const maxSpellLevelByRarity: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  'Very Rare': 3,
  Legendary: 3,
};

export const saveDcByRarity: Record<Rarity, string> = {
  Common: 'DC 11',
  Uncommon: 'DC 13',
  Rare: 'DC 15',
  'Very Rare': 'DC 16',
  Legendary: 'DC 18',
};

export const chargeTextByRarity: Record<Rarity, string> = {
  Common: '1 charge and regains it at dawn',
  Uncommon: '3 charges and regains 1d3 expended charges at dawn',
  Rare: '5 charges and regains 1d4 + 1 expended charges at dawn',
  'Very Rare': '7 charges and regains 1d6 + 1 expended charges at dawn',
  Legendary: '9 charges and regains 1d6 + 3 expended charges at dawn',
};

export function rollPropertyTable(roll: number, rarity: Rarity): PropertyTableKey {
  const maxSpellLevel = maxSpellLevelByRarity[rarity];
  if (roll <= 2) return 'skill';
  if (roll <= 4) return 'spell1';
  if (roll <= 6) return maxSpellLevel >= 2 ? 'spell2' : 'spell1';
  if (roll <= 8) return maxSpellLevel >= 3 ? 'spell3' : 'nonSpell';
  return 'nonSpell';
}

export function getClassSkillPool(className: ClassName): string[] {
  switch (className) {
    case 'Wizard':
    case 'Artificer':
      return ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'];
    case 'Rogue':
      return ['Stealth', 'Sleight of Hand', 'Investigation', 'Acrobatics', 'Deception'];
    case 'Bard':
      return ['Performance', 'Persuasion', 'Deception', 'History', 'Insight'];
    case 'Warlock':
    case 'Sorcerer':
      return ['Deception', 'Persuasion', 'Intimidation', 'Arcana', 'Insight'];
    case 'Paladin':
      return ['Persuasion', 'Intimidation', 'Religion', 'Insight', 'Athletics'];
    case 'Druid':
    case 'Ranger':
      return ['Survival', 'Nature', 'Animal Handling', 'Perception', 'Stealth'];
    case 'Cleric':
      return ['Religion', 'Insight', 'Medicine', 'Perception', 'History'];
    case 'Fighter':
      return ['Athletics', 'Perception', 'Intimidation', 'History', 'Acrobatics'];
    case 'Barbarian':
      return ['Athletics', 'Survival', 'Intimidation', 'Perception', 'Animal Handling'];
    case 'Monk':
      return ['Acrobatics', 'Insight', 'Perception', 'Stealth', 'Athletics'];
    default:
      return ['Acrobatics', 'Athletics', 'Arcana', 'History', 'Investigation', 'Perception', 'Stealth', 'Sleight of Hand', 'Persuasion', 'Survival'];
  }
}

export function skillProperty(skill: string, rarity: Rarity): RolledProperty {
  const bonus = rarityBonus[rarity];
  const rarePlus = rarity === 'Rare' || rarity === 'Very Rare' || rarity === 'Legendary';
  return {
    table: 'skill',
    roll: 0,
    label: `${skill} ${bonus}`,
    text: rarePlus
      ? `You gain proficiency in ${skill}. If you are already proficient, add ${bonus} to ${skill} checks instead.`
      : `Add ${bonus} to ${skill} checks.`,
    tags: ['skill', skill.toLowerCase()],
    activation: 'passive',
  };
}

export const firstLevelSpellProperties: Omit<RolledProperty, 'table'>[] = [
  { roll: 1, label: 'Feather Fall', text: 'You can cast Feather Fall once per day.', tags: ['falling', 'reaction', 'movement'], activation: 'daily' },
  { roll: 2, label: 'Jump', text: 'You can cast Jump on yourself once per day.', tags: ['jump', 'movement'], activation: 'daily' },
  { roll: 3, label: 'Longstrider', text: 'You can cast Longstrider on yourself once per day.', tags: ['speed', 'movement'], activation: 'daily' },
  { roll: 4, label: 'Disguise Self', text: 'You can cast Disguise Self once per day.', tags: ['illusion', 'disguise'], activation: 'daily' },
  { roll: 5, label: 'Detect Magic', text: 'You can cast Detect Magic once per day.', tags: ['detection', 'magic'], activation: 'daily' },
  { roll: 6, label: 'Comprehend Languages', text: 'You can cast Comprehend Languages once per day.', tags: ['language', 'understanding'], activation: 'daily' },
  { roll: 7, label: 'Shield', text: 'You can cast Shield once per day as a reaction.', tags: ['reaction', 'defense'], activation: 'reaction' },
  { roll: 8, label: 'Absorb Elements', text: 'You can cast Absorb Elements once per day as a reaction.', tags: ['reaction', 'resistance'], activation: 'reaction' },
  { roll: 9, label: 'Charm Person', text: 'You can cast Charm Person once per day. The save DC is based on the item rarity.', tags: ['charm', 'social'], activation: 'daily' },
  { roll: 10, label: 'Thunderwave', text: 'You can cast Thunderwave once per day. The save DC is based on the item rarity.', tags: ['thunder', 'push', 'area'], activation: 'daily' },
];

export const secondLevelSpellProperties: Omit<RolledProperty, 'table'>[] = [
  { roll: 1, label: 'Misty Step', text: 'You can cast Misty Step once per day.', tags: ['teleportation', 'movement'], activation: 'daily' },
  { roll: 2, label: 'Invisibility', text: 'You can cast Invisibility on yourself once per day.', tags: ['invisibility', 'stealth'], activation: 'daily' },
  { roll: 3, label: 'Spider Climb', text: 'You can cast Spider Climb on yourself once per day.', tags: ['climbing', 'movement'], activation: 'daily' },
  { roll: 4, label: 'Levitate', text: 'You can cast Levitate once per day. The save DC is based on the item rarity.', tags: ['levitation', 'control'], activation: 'daily' },
  { roll: 5, label: 'See Invisibility', text: 'You can cast See Invisibility once per day.', tags: ['senses', 'invisibility'], activation: 'daily' },
  { roll: 6, label: 'Mirror Image', text: 'You can cast Mirror Image once per day.', tags: ['illusion', 'defense'], activation: 'daily' },
  { roll: 7, label: 'Blur', text: 'You can cast Blur once per day.', tags: ['defense', 'illusion'], activation: 'daily' },
  { roll: 8, label: 'Suggestion', text: 'You can cast Suggestion once per day. The save DC is based on the item rarity.', tags: ['enchantment', 'social'], activation: 'daily' },
  { roll: 9, label: 'Hold Person', text: 'You can cast Hold Person once per day. The save DC is based on the item rarity.', tags: ['paralysis', 'control'], activation: 'daily' },
  { roll: 10, label: 'Lesser Restoration', text: 'You can cast Lesser Restoration once per day.', tags: ['restoration', 'healing'], activation: 'daily' },
];

export const thirdLevelSpellProperties: Omit<RolledProperty, 'table'>[] = [
  { roll: 1, label: 'Fly', text: 'You can cast Fly on yourself once per day.', tags: ['flight', 'movement'], activation: 'daily' },
  { roll: 2, label: 'Haste', text: 'You can cast Haste on yourself once per day.', tags: ['speed', 'action economy'], activation: 'daily' },
  { roll: 3, label: 'Slow', text: 'You can cast Slow once per day. The save DC is based on the item rarity.', tags: ['slow', 'control'], activation: 'daily' },
  { roll: 4, label: 'Dispel Magic', text: 'You can cast Dispel Magic once per day.', tags: ['dispel', 'utility'], activation: 'daily' },
  { roll: 5, label: 'Counterspell', text: 'You can cast Counterspell once per day as a reaction.', tags: ['reaction', 'anti-magic'], activation: 'reaction' },
  { roll: 6, label: 'Hypnotic Pattern', text: 'You can cast Hypnotic Pattern once per day. The save DC is based on the item rarity.', tags: ['hypnotic', 'control'], activation: 'daily' },
  { roll: 7, label: 'Fear', text: 'You can cast Fear once per day. The save DC is based on the item rarity.', tags: ['fear', 'control'], activation: 'daily' },
  { roll: 8, label: 'Water Breathing', text: 'You can cast Water Breathing once per day.', tags: ['water', 'breathing'], activation: 'daily' },
  { roll: 9, label: 'Speak with Dead', text: 'You can cast Speak with Dead once per day.', tags: ['dead', 'divination'], activation: 'daily' },
  { roll: 10, label: 'Fireball or Lightning Bolt', text: 'Choose Fireball or Lightning Bolt when the item is created. You can cast the chosen spell once per day. The save DC is based on the item rarity.', tags: ['damage', 'fire', 'lightning'], activation: 'daily' },
];

export function nonSpellProperty(roll: number, rarity: Rarity, itemCategory: ItemCategory): RolledProperty {
  const bonus = rarityBonus[rarity];
  const properties: RolledProperty[] = [
    { table: 'nonSpell', roll: 1, label: 'Rarity Bonus', text: `The item grants ${bonus} to ${itemCategory === 'Armor' || itemCategory === 'Shield' ? 'AC' : itemCategory === 'Weapon' ? 'attack and damage rolls made with it' : 'one saving throw chosen when the item is created'}.`, tags: ['static bonus'], activation: 'passive' },
    { table: 'nonSpell', roll: 2, label: 'Damage Resistance', text: 'You gain resistance to one damage type tied to the item’s theme while attuned to it.', tags: ['resistance', 'defense'], activation: 'passive' },
    { table: 'nonSpell', roll: 3, label: 'Revealing Light', text: 'On command, the item sheds bright light in a 20-foot radius and dim light for another 20 feet. Once per day, it can force one creature in that light to make a saving throw or be blinded until the end of its next turn.', tags: ['light', 'blind'], activation: 'command' },
    { table: 'nonSpell', roll: 4, label: 'Returning', text: 'If the item is thrown, dropped, or knocked from your hand, you can use a bonus action to call it back to your grasp if it is within 60 feet.', tags: ['returning', 'utility'], activation: 'command' },
    { table: 'nonSpell', roll: 5, label: 'Unspoiled Form', text: 'The item cannot be rusted, dirtied, or broken by mundane force, and it cannot be removed from you against your will while you are conscious.', tags: ['durability', 'protection'], activation: 'passive' },
    { table: 'nonSpell', roll: 6, label: 'Warning Sense', text: 'The item grows warm, cold, or heavy when a chosen creature type, school of magic, or danger tied to its theme is within 60 feet.', tags: ['warning', 'detection'], activation: 'passive' },
    { table: 'nonSpell', roll: 7, label: 'Hostile Environment', text: 'Choose one hostile environment when the item is created: underwater, smoke, extreme cold, darkness, or strong wind. You can act normally in that environment while holding or wearing the item.', tags: ['environment', 'survival'], activation: 'passive' },
    { table: 'nonSpell', roll: 8, label: 'Stored Working', text: `The item has ${chargeTextByRarity[rarity]}. You can spend charges to repeat one of its daily spell properties or a lower-rarity spell effect chosen when the item is created.`, tags: ['charges', 'spell storing'], activation: 'charges' },
    { table: 'nonSpell', roll: 9, label: 'Mundane Mask', text: 'As an action, you can make the item appear nonmagical, broken, cheap, harmless, or mundane until it is used or until the next dawn.', tags: ['concealment', 'disguise'], activation: 'command' },
    { table: 'nonSpell', roll: 10, label: 'Success Rider', text: 'When the item’s main effect succeeds, choose one rider when the item is created: push 10 feet, reduce speed by 10 feet, reveal the target, silence the target until the start of your next turn, mark the target, or prevent reactions.', tags: ['rider', 'control'], activation: 'passive' },
  ];
  return properties[Math.max(0, Math.min(9, roll - 1))];
}
