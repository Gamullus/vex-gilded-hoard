import type { ArmorSubtype, ItemCategory, Rarity, WeaponSubtype } from '../../types';

export type CustomReferenceKind = 'Item Reference' | 'Magic Ammunition';

export interface CustomReferenceItem {
  id: string;
  roll: number;
  kind: CustomReferenceKind;
  source: string;
  name: string;
  summary: string;
  tags: string[];
  categoryHint?: ItemCategory;
  rarityHint?: Rarity;
  weaponSubtypeHint?: WeaponSubtype;
  armorSubtypeHint?: ArmorSubtype;
}

const itemCategories = new Set<ItemCategory>(['Weapon', 'Armor', 'Shield', 'Wondrous Item', 'Ring', 'Rod', 'Staff', 'Wand', 'Potion', 'Scroll']);
const rarities = new Set<Rarity>(['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary']);
const weaponSubtypes = new Set<WeaponSubtype>(['Melee', 'Ranged', 'Two-Handed', 'Versatile', 'Finesse', 'Thrown', 'Ammunition']);
const armorSubtypes = new Set<ArmorSubtype>(['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shield']);

function maybeCategory(value: string): ItemCategory | undefined {
  return itemCategories.has(value as ItemCategory) ? (value as ItemCategory) : undefined;
}

function maybeRarity(value: string): Rarity | undefined {
  return rarities.has(value as Rarity) ? (value as Rarity) : undefined;
}

function maybeWeaponSubtype(value: string): WeaponSubtype | undefined {
  return weaponSubtypes.has(value as WeaponSubtype) ? (value as WeaponSubtype) : undefined;
}

function maybeArmorSubtype(value: string): ArmorSubtype | undefined {
  return armorSubtypes.has(value as ArmorSubtype) ? (value as ArmorSubtype) : undefined;
}

function parseRows(raw: string, source: string, kind: CustomReferenceKind): CustomReferenceItem[] {
  return raw
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [roll, name, category, rarity, summary, tags, weaponSubtype, armorSubtype] = line.split('|').map((part) => part.trim());
      const sourceSlug = source.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return {
        id: `${sourceSlug}-${roll.padStart(3, '0')}`,
        roll: Number(roll),
        kind,
        source,
        name,
        summary,
        tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        categoryHint: maybeCategory(category),
        rarityHint: maybeRarity(rarity),
        weaponSubtypeHint: maybeWeaponSubtype(weaponSubtype),
        armorSubtypeHint: maybeArmorSubtype(armorSubtype),
      };
    });
}

const classicMagicItemsRaw = `
0|Bag of Holding|Wondrous Item|Uncommon|Objects fit inside a small extradimensional container and can be carried far beyond normal capacity.|storage, extradimensional, utility||
1|Potion of Water Breathing|Potion|Common|The drinker can breathe underwater for the potion duration.|water, breathing, exploration||
2|Bag of Tricks|Wondrous Item|Uncommon|Pull a fuzzy object from the bag and throw it to create a temporary animal servant.|summoning, beasts, random||
3|Amulet of Proof Against Detection|Wondrous Item|Uncommon|The wearer cannot be targeted by crystal balls, scrying, or similar divination detection.|abjuration, anti-divination, stealth||
4|Belt of Dwarvenkind|Wondrous Item|Rare|The belt improves toughness and dwarven traits, such as Constitution and Strength.|dwarf, constitution, strength||
5|Weapon +1/+2/+3|Weapon|Uncommon|A simple magic weapon template that adds a static bonus to attack and damage rolls.|weapon, static bonus, accuracy|Melee|
6|Boots of Striding and Springing|Wondrous Item|Uncommon|The wearer moves faster and jumps much higher and farther.|movement, jumping, exploration||
7|Boots of Levitation|Wondrous Item|Rare|The wearer can levitate as a persistent magical movement effect.|movement, levitation, flight||
8|Bracers of Defense|Wondrous Item|Rare|The wearer gains an AC bonus while not relying on normal armor or shields.|defense, armor class, monk||
9|Belt of Giant Strength|Wondrous Item|Rare|The wearer gains giant-like Strength and improved damage output.|strength, giant, stat replacement||
10|Armor +1/+2/+3|Armor|Rare|A magic armor template that adds a static bonus to AC.|armor, static bonus, armor class||Medium Armor
11|Cloak of Displacement|Wondrous Item|Rare|The cloak makes the wearer harder to hit by shifting their apparent position.|illusion, defense, disadvantage||
12|Brooch of Shielding|Wondrous Item|Uncommon|The brooch protects against magical force and missile-like magic.|force, resistance, magic missile||
13|Broom of Flying|Wondrous Item|Uncommon|A flying broom carries one or more riders, slowing under heavier load.|flight, travel, vehicle||
14|Chime of Opening|Wondrous Item|Rare|A loud chime opens locks and barriers but has limited uses.|unlocking, utility, charges||
15|Potion of Healing|Potion|Common|The potion restores hit points when drunk.|healing, consumable, hit points||
16|Crystal Ball|Wondrous Item|Very Rare|A crystal sphere allows repeat scrying and distant observation.|divination, scrying, vision||
17|Cube of Force|Wondrous Item|Rare|A charged cube creates different force barriers against gases, matter, magic, or living creatures.|force, barrier, charges||
18|Dragon Slayer|Weapon|Rare|A magic weapon that deals extra damage against dragons.|dragon, weapon, bonus damage|Melee|
19|Cloak or Ring of Invisibility|Wondrous Item|Legendary|A worn item grants invisibility like the invisibility spell.|invisibility, stealth, illusion||
20|Shield +1/+2/+3|Shield|Rare|A magic shield template that adds a static bonus to AC.|shield, static bonus, armor class||Shield
21|Efreeti Bottle|Wondrous Item|Very Rare|A bottle contains a bound efreeti that can be released or bargained with.|summoning, fire, genie||
22|Dwarven Thrower|Weapon|Very Rare|A magic thrown weapon returns immediately and is especially deadly in dwarven hands.|returning, thrown, dwarf|Thrown|
23|Drums of Panic|Wondrous Item|Rare|The drums create fear, morale pressure, or panic in nearby listeners.|fear, sound, morale||
24|Dwarven Plate|Armor|Very Rare|Heavy magical plate grants strong AC and resistance to forced movement.|armor, dwarf, forced movement||Heavy Armor
25|Boots or Cloak of Elvenkind|Wondrous Item|Uncommon|Elven gear makes the wearer nearly silent or nearly invisible.|stealth, elven, subtlety||
26|Elven Chain|Armor|Rare|Fine chain armor can be worn even by creatures not normally proficient with medium armor.|armor, elven, proficiency||Medium Armor
27|Eyes of Charming|Wondrous Item|Uncommon|Crystal lenses allow the wearer to charm a creature once per day.|charm, enchantment, social||
28|Flying Carpet|Wondrous Item|Very Rare|A carpet flies and carries riders, with speed reduced by load.|flight, travel, vehicle||
29|Eyes of the Eagle|Wondrous Item|Uncommon|The lenses greatly enhance distant vision.|senses, vision, perception||
30|Candle of Invocation|Wondrous Item|Very Rare|A consecrated candle creates a blessed aura and can be snuffed early.|divine, blessing, aura||
31|Giant Slayer|Weapon|Rare|A weapon deals extra damage and pressure against giants.|giant, weapon, bonus damage|Melee|
32|Gem of Seeing|Wondrous Item|Rare|A charged gem grants truesight and reveals hidden doors, traps, invisible creatures, and magic.|truesight, detection, charges||
33|Frostbrand|Weapon|Very Rare|A cold weapon sheds light, deals frost damage, resists fire, and can extinguish flame.|cold, weapon, fire resistance|Melee|
34|Gem of Brightness|Wondrous Item|Uncommon|A charged gem sheds bright light and can blind creatures.|light, blindness, charges||
35|Cloak or Ring of Protection|Wondrous Item|Rare|A protective item grants bonuses to AC and saving throws.|defense, saving throws, armor class||
36|Helm of Telepathy|Wondrous Item|Uncommon|The helm reads thoughts and can implant suggestions into weaker minds.|telepathy, enchantment, social||
37|Gloves of Dexterity and Thievery|Wondrous Item|Uncommon|The gloves improve Dexterity or thief skills.|dexterity, skills, rogue||
38|Helm of Teleportation|Wondrous Item|Rare|The helm allows teleporting the wearer, another creature, or an object, with recharge through teleport magic.|teleportation, movement, utility||
39|Gloves of Swimming and Climbing|Wondrous Item|Uncommon|The gloves make swimming and climbing as easy as walking.|movement, climbing, swimming||
40|Helm of Comprehend Languages|Wondrous Item|Uncommon|The helm allows the wearer to read magical or mundane writing but is fragile in combat.|language, translation, utility||
41|Holy Avenger|Weapon|Legendary|A sacred sword grants strong protection against magic and extra damage against chaotic or unholy creatures.|holy, radiant, paladin|Melee|
42|Horn of Valhalla|Wondrous Item|Rare|The horn summons berserk warriors to fight beside the user.|summoning, warriors, morale||
43|Horn of Blasting|Wondrous Item|Rare|The horn releases a cone of thunderous force that deafens and damages, especially fragile materials.|thunder, cone, damage||
44|Immovable Rod|Rod|Uncommon|A button fixes the rod magically in place, even against gravity.|utility, immovable, force||
45|Vorpal Sword|Weapon|Legendary|A sword that can instantly sever heads or deal massive damage on a natural 20.|critical, severing, legendary|Melee|
46|Ioun Stone|Wondrous Item|Rare|A floating stone grants a stat, saving throw, absorption, or survival benefit depending on type.|orbiting, stat, defense||
47|Instant Fortress|Wondrous Item|Rare|A small cube expands into a durable adamantine tower with a controlled door.|fortress, shelter, expansion||
48|Luckstone|Wondrous Item|Uncommon|The stone grants a small bonus to saving throws, ability checks, and similar rolls.|luck, saving throws, ability checks||
49|Javelin of Lightning|Weapon|Uncommon|A thrown javelin becomes a lightning bolt before striking the target.|lightning, thrown, line|Thrown|
50|Gauntlets of Ogre Power|Wondrous Item|Uncommon|The gauntlets set the wearer’s Strength to an ogre-like value.|strength, stat replacement, gauntlets||
51|Object of Commanding Elementals|Wondrous Item|Rare|An item that summons or commands an elemental creature.|elemental, summoning, control||
52|Mace of Disruption|Weapon|Rare|A mace is especially destructive against undead and unholy creatures, with turning-like effects.|undead, radiant, disruption|Melee|
53|Necklace of Adaptation|Wondrous Item|Uncommon|The necklace lets the wearer survive without breathing in hostile air or water.|breathing, survival, adaptation||
54|Nine Lives Stealer|Weapon|Very Rare|A sword can steal souls on a natural 20 and is especially feared by living enemies.|soul, critical, death|Melee|
55|Potion of Control Animal|Potion|Uncommon|The potion allows temporary control over animals of different sizes.|beast, control, consumable||
56|Potion of Heroism|Potion|Rare|The drinker fights as though empowered by heroic magic and extra vitality.|heroism, courage, temporary hit points||
57|Potion of Poison|Potion|Common|The potion appears restorative but inflicts the poisoned condition unless resisted.|poison, curse, deception||
58|Pipes of the Sewers|Wondrous Item|Uncommon|The pipes summon and command rats or giant rats.|rats, summoning, control||
59|Ring of Wishes|Ring|Legendary|The ring contains a limited number of wish-level miracles.|wish, legendary, reality||
60|Potion of Fire Resistance|Potion|Uncommon|The drinker gains resistance to fire and better protection against dragon breath.|fire, resistance, consumable||
61|Potion of Haste|Potion|Rare|The drinker gains haste-like speed and combat tempo.|speed, haste, action economy||
62|Ring of Regeneration|Ring|Very Rare|The ring restores hit points over time and can regenerate the body if not utterly destroyed.|healing, regeneration, survival||
63|Rod of Absorption|Rod|Very Rare|The rod absorbs targeted spells and stores spell energy for later use.|spell absorption, charges, defense||
64|Potion of Polymorph|Potion|Rare|The drinker transforms as though affected by a self-polymorph effect.|shapeshift, transformation, consumable||
65|Ring of Control Animals|Ring|Rare|The ring controls multiple animals of varying sizes.|beast, control, ring||
66|Ring of Water Walking|Ring|Uncommon|The wearer walks across water without sinking.|water, movement, exploration||
67|Ring of Fire Resistance|Ring|Rare|The ring grants resistance to fire and advantage against dragon breath.|fire, resistance, defense||
68|Potion of Gaseous Form|Potion|Rare|The drinker’s body turns gaseous and can seep through small gaps.|gaseous, movement, infiltration||
69|Potion of Invisibility|Potion|Uncommon|The drinker becomes invisible for the potion duration.|invisibility, stealth, consumable||
70|Staff of Power|Staff|Very Rare|A powerful staff holds many charges for protection and offensive spells.|staff, charges, spellcasting||
71|Robe of Useful Items|Wondrous Item|Uncommon|The robe has patches that can be removed to create useful objects.|utility, patches, conjuration||
72|Pearl of Power|Wondrous Item|Uncommon|The pearl restores one expended spell slot once per day.|spell slot, recovery, caster||
73|Ring of Telekinesis|Ring|Very Rare|The wearer can use telekinesis indefinitely at high caster strength.|telekinesis, force, control||
74|Robe of Scintillating Colours|Wondrous Item|Very Rare|The robe produces hypnotic, dazzling patterns that can incapacitate viewers.|hypnotic, color, control||
75|Wand of Fireballs|Wand|Rare|A wand casts fireball through limited charges.|fire, explosion, charges||
76|Periapt of Wound Closure|Wondrous Item|Uncommon|The periapt prevents death spirals and accelerates recovery from wounds.|healing, death saves, recovery||
77|Robe of Eyes|Wondrous Item|Rare|The robe prevents surprise and grants expanded vision including invisibility detection.|senses, truesight, perception||
78|Potion of Giant Strength|Potion|Rare|The drinker temporarily gains giant-like Strength and heavy damage output.|strength, giant, consumable||
79|Ring of Spell Storing and Turning|Ring|Rare|The ring stores spells or reflects part of a spell back at its caster.|spell storing, reflection, ring||
80|Figurine of Wondrous Power|Wondrous Item|Rare|A small figurine transforms into a creature for a limited time.|summoning, creature, figurine||
81|Rope of Entanglement|Wondrous Item|Rare|The rope animates to grapple and restrain a target until damaged or escaped.|restraint, rope, control||
82|Staff of Snakes Python or Adder|Staff|Uncommon|The staff turns into a snake or empowers serpent-like attacks.|snake, transformation, staff||
83|Staff of Striking|Staff|Very Rare|The staff stores striking power and can add heavy force to a hit.|staff, melee, charges||
84|Staff of Healing|Staff|Rare|The staff spends charges to cast healing magic.|healing, charges, cleric||
85|Flametongue|Weapon|Rare|The weapon ignites on command and deals extra fire damage while shedding light.|fire, weapon, command word|Melee|
86|Wand of Lightning Bolts|Wand|Rare|A wand casts lightning bolt through limited charges.|lightning, line, charges||
87|Staff of Swarming Insects|Staff|Rare|The staff creates a blinding insect swarm that damages and obscures.|insects, swarm, control||
88|Wand of Paralysis|Wand|Rare|The wand releases a cone or ray of paralysis resisted by magic or will.|paralysis, control, wand||
89|Wand of Web|Wand|Uncommon|The wand casts web to restrain and control an area.|web, restraint, control||
90|Potion of Flying|Potion|Very Rare|The drinker gains flight for the potion duration.|flight, movement, consumable||
91|Sword of Life Stealing|Weapon|Rare|A sword drains life on a natural 20 and grants temporary vitality.|necrotic, critical, temporary hit points|Melee|
92|Staff of the Woodlands|Staff|Rare|A druidic staff casts nature spells and can become or animate a tree.|nature, druid, staff||
93|Staff of Withering|Staff|Rare|The staff spends charges to add necrotic withering and reduce vitality.|necrotic, withering, charges||
94|Sun Blade|Weapon|Rare|A radiant blade sheds sunlight and harms undead especially well.|radiant, sunlight, undead|Melee|
95|Wand of Magic Missiles|Wand|Uncommon|The wand casts magic missile through charges.|force, missiles, charges||
96|Wand of Polymorph|Wand|Very Rare|The wand casts polymorph-like transformation magic.|polymorph, transformation, charges||
97|Wand of Enemy Detection|Wand|Uncommon|The wand reveals nearby hostile creatures even if concealed.|detection, enemies, senses||
98|Sword of Wounding|Weapon|Rare|A sword causes wounds that bleed and resist healing.|bleeding, anti-healing, weapon|Melee|
99|Staff of the Magi|Staff|Legendary|A legendary staff stores many charges, absorbs magic, and contains dangerous arcane power.|legendary, staff, charges||
`;

const magicAmmunitionRaw = `
1|Sky-Drawing Arrow|Weapon|Common|Fired into the sky, it draws clouds across the sun or moon for three turns.|weather, sky, utility|Ammunition|
2|Orchard Circle Arrow|Weapon|Common|Arranged around a tree with other ammunition, it makes fruit enough to feed 2d6 creatures.|food, nature, ritual|Ammunition|
3|Beast-Bond Arrow|Weapon|Uncommon|Animals struck are not harmed and instead serve for one day.|beast, charm, control|Ammunition|
4|Brine Queen Arrow|Weapon|Common|It fires normally underwater or into water.|water, sea, ranged|Ammunition|
5|Goblin-Song Arrow|Weapon|Common|It bursts into loud song in the presence of goblins or hobgoblins.|goblins, sound, warning|Ammunition|
6|Held Trajectory Arrow|Weapon|Uncommon|Command it to stop mid-flight and continue its path later on command.|motion, delayed, control|Ammunition|
7|Rapturous Fireball Arrow|Weapon|Rare|It explodes on impact as a five-die fireball.|fire, explosion, damage|Ammunition|
8|Rimebinding Arrow|Weapon|Uncommon|The first hit coats the target in rime; a second hit freezes them solid.|cold, restraint, escalation|Ammunition|
9|Silken Cord Arrow|Weapon|Uncommon|A command word creates up to 400 feet of tough silken cord after firing.|rope, utility, traversal|Ammunition|
10|Wall-Piercing Arrow|Weapon|Rare|Magical walls of any kind do not impede this missile.|anti-magic, walls, penetration|Ammunition|
11|Forest Ear Arrow|Weapon|Uncommon|After being fired into wood, concentration lets the user hear nearby sounds for three days.|divination, sound, forest|Ammunition|
12|Immunity-Piercing Ammunition|Weapon|Uncommon|Ammunition in the same container conspires together and counts as magical for overcoming immunity.|magic, ammunition, container|Ammunition|
13|Campfire Arrow|Weapon|Common|Consumed in a campfire, it burns warm and bright regardless of weather.|fire, camp, survival|Ammunition|
14|Lawglass Arrow|Weapon|Rare|A crystalline arrow can turn the target’s alignment lawful.|law, alignment, crystal|Ammunition|
15|Silent Impact Arrow|Weapon|Common|It dampens sound, bowstring thrum, and impact noise.|silence, stealth, ranged|Ammunition|
16|Peephole Arrow|Weapon|Uncommon|It drills through wood or stone to create a peephole.|drilling, stone, scouting|Ammunition|
17|Daily Interceptor Arrow|Weapon|Uncommon|Fired into the air each morning, it intercepts a later missile that day.|defense, interception, missile|Ammunition|
18|Mute Night Arrow|Weapon|Uncommon|Eldritch carvings render the target mute for a night and a day.|silence, curse, speech|Ammunition|
19|Elf-Bane Arrow|Weapon|Rare|Elves near it become loud, clumsy, and unable to cast spells.|anti-elf, anti-magic, curse|Ammunition|
20|Baleful Screech Arrow|Weapon|Common|It emits a screech that can trigger morale checks in enemy forces.|fear, sound, morale|Ammunition|
21|Beast-Mind Arrow|Weapon|Rare|On a failed save, the target’s mind is reduced to animal intelligence.|psychic, mind, curse|Ammunition|
22|Moonlit Ammunition Arrow|Weapon|Common|Exposed to full moonlight, it adds 1d4 mundane ammunition pieces to its container.|moon, ammunition, multiplication|Ammunition|
23|Planar Banishment Arrow|Weapon|Rare|Extraplanar creatures hit by it are banished to their home plane.|banishment, planar, extraplanar|Ammunition|
24|Drowning Arrow|Weapon|Rare|On a failed save, the target’s lungs fill with water and they begin drowning.|water, drowning, save|Ammunition|
25|Door-Passing Arrow|Weapon|Uncommon|It fires through doors as if they were not there, if the shooter can sense the target.|phasing, doors, pursuit|Ammunition|
26|Ring-Quiver Arrow|Weapon|Uncommon|Five arrows can be stored as plain rings and called instantly to nock.|storage, rings, quickdraw|Ammunition|
27|Flame-Dousing Arrow|Weapon|Common|Flames within spear-length of the target douse instantly.|fire, extinguish, utility|Ammunition|
28|Flint Petrifier Arrow|Weapon|Rare|A flint-pointed hit can turn the target to stone for a day on a failed save.|petrification, stone, save|Ammunition|
29|Grounding Arrow|Weapon|Uncommon|Flying creatures struck must land within three rounds or crash.|anti-flight, grounding, control|Ammunition|
30|Friendly Fire Arrow|Weapon|Uncommon|The struck foe consistently believes the shot came from an ally.|deception, confusion, social|Ammunition|
31|Detect Magic Arrow|Weapon|Common|Once part of a detection wand, it makes the target’s magic items glow if struck.|detect magic, item reveal, divination|Ammunition|
32|Mercy Off-Hand Arrow|Weapon|Uncommon|When fired from the off-hand, it heals instead of harming.|healing, mercy, off-hand|Ammunition|
33|Tongue-Taking Arrow|Weapon|Common|The shooter gains fluency in the language of the last humanoid shot for a fortnight.|language, humanoid, learning|Ammunition|
34|Illusory Double Arrow|Weapon|Uncommon|Firing it creates an illusory copy of the shooter for 1d4 rounds.|illusion, duplicate, decoy|Ammunition|
35|Glass-and-Sand Arrow|Weapon|Uncommon|Glass and sand do not block or slow its path.|glass, sand, penetration|Ammunition|
36|Paralyzing Toxin Arrow|Weapon|Uncommon|It is coated in paralyzing toxin and requires careful handling.|poison, paralysis, save|Ammunition|
37|Nymph-Tear Arrow|Weapon|Uncommon|Harmless except to hearts, it can cause love at first sight.|charm, love, fey|Ammunition|
38|Chandelier Arrow|Weapon|Common|If it hits a ceiling, it sprouts a crude chandelier with eight candles.|light, creation, ceiling|Ammunition|
39|Shield-Hungry Arrow|Weapon|Uncommon|On hit, it suspends the target’s shield bonus for one round.|shield, anti-defense, debuff|Ammunition|
40|Raise-the-Slain Arrow|Weapon|Very Rare|If it slays a creature, the shooter may raise the creature from the dead in three days.|resurrection, death, delayed|Ammunition|
41|Splint-Mender Arrow|Weapon|Common|Incorporated into a splint or dressing, it triples natural healing speed.|healing, medicine, recovery|Ammunition|
42|Woundless Killer Arrow|Weapon|Uncommon|Creatures slain by it show no noticeable or detectable wound.|stealth, assassination, no wound|Ammunition|
43|Quasi-Earth Arrow|Weapon|Rare|Infused with quasi-elemental earth, it damages structures like a ballista.|earth, siege, structures|Ammunition|
44|Object-Shattering Arrow|Weapon|Uncommon|Instead of damage, the shooter may shatter an object held in the target’s hands.|disarm, shatter, object|Ammunition|
45|War-Dog Miss Arrow|Weapon|Uncommon|If intentionally missed, it transforms into an angry war dog.|summoning, dog, miss|Ammunition|
46|Animal Morale Arrow|Weapon|Common|Its keening scream forces a morale check on animals.|animals, fear, sound|Ammunition|
47|Leapfrog Arrow|Weapon|Uncommon|After striking, it leaps to an adjacent target if able and deals the same damage.|chain, ricochet, multi-target|Ammunition|
48|Interrupting Shot Arrow|Weapon|Uncommon|When loaded and ready, it can interrupt actions to shoot something from a hand.|reaction, disarm, interrupt|Ammunition|
49|Tracker’s Lodging Arrow|Weapon|Uncommon|It lodges in the target and lets the shooter track them flawlessly for up to a month.|tracking, quarry, divination|Ammunition|
50|Depth-Sounding Arrow|Weapon|Common|Loosed into water or a pit, it instantly reveals the depth.|water, depth, scouting|Ammunition|
51|Shapeshifter-Reversion Arrow|Weapon|Rare|Lycanthropes and shapeshifters hit by it revert to their original form.|shapeshifter, lycanthrope, reveal|Ammunition|
52|Magic Missile Absorber Arrow|Weapon|Uncommon|Magic missiles cast on the bearer are absorbed and increase this arrow’s damage.|force, absorption, retaliation|Ammunition|
53|Stirge-Miss Arrow|Weapon|Uncommon|If it misses, it transforms into a stirge and attacks for 1d4 rounds.|summoning, stirge, miss|Ammunition|
54|Quicksilver Arrow|Weapon|Rare|Nonmagical metals worn by the target turn to quicksilver and drip away for one turn.|metal, transmutation, armor|Ammunition|
55|Tether Arrow|Weapon|Uncommon|On command, a sturdy rope or tether trails behind it for climbing or crossing.|rope, climbing, traversal|Ammunition|
56|Furrow Arrow|Weapon|Common|A low shot digs a straight fertile furrow in a field for planting.|farming, earth, utility|Ammunition|
57|Bowstring-Snapping Arrow|Weapon|Uncommon|Even on a miss, if it targeted an archer, the archer’s bowstring snaps.|anti-archer, bowstring, sabotage|Ammunition|
58|Misfortune Arrow|Weapon|Rare|The target takes the worst result on their next three die rolls.|luck, curse, misfortune|Ammunition|
59|Branding Arrow|Weapon|Common|It painlessly brands a customized mark onto a creature’s hide.|marking, brand, tracking|Ammunition|
60|Rope-Severing Arrow|Weapon|Common|It is especially adept at severing ropes and chains, needing no attack roll in simple cases.|severing, rope, chain|Ammunition|
61|Potion-Bearing Arrow|Weapon|Uncommon|A potion poured over it is absorbed and can affect a target on hit without dealing damage.|potion, delivery, no damage|Ammunition|
62|Extreme Range Arrow|Weapon|Uncommon|Spending one round aiming quadruples its range increments.|range, aiming, sniper|Ammunition|
63|Weatherproof Quiver Arrow|Weapon|Common|Its quiver or container never spills and is unaffected by the elements.|container, weatherproof, quiver|Ammunition|
64|Missile-Reducing Arrow|Weapon|Uncommon|It reduces damage from similar missiles by 1d6 before breaking or becoming unusable.|defense, missile, reduction|Ammunition|
65|Water-Finding Arrow|Weapon|Common|Released from the hand, it lazily flies toward the nearest potable water.|water, survival, direction|Ammunition|
66|Corporeality Arrow|Weapon|Rare|It renders incorporeal targets solid and solid targets incorporeal on a failed save.|incorporeal, phasing, save|Ammunition|
67|Net-Fumble Arrow|Weapon|Uncommon|Rolling 1 for damage causes it to become a net and entangle the foe.|net, entangle, fumble|Ammunition|
68|Slow-Time Arrow|Weapon|Uncommon|It seems to take 1d6 rounds to hit, while the shooter can still act.|delay, time, suspense|Ammunition|
69|Handhold Arrow|Weapon|Common|Several fired in quick succession form serviceable handholds for climbing walls.|climbing, handholds, traversal|Ammunition|
70|High-Ground Arrow|Weapon|Uncommon|If fired from a higher altitude than the target, it deals triple damage.|altitude, damage, positioning|Ammunition|
71|Cure-Infection Arrow|Weapon|Rare|After slaying something infectious, the wielder can cure its victims by touch.|cure, disease, infection|Ammunition|
72|Armored Shock Arrow|Weapon|Uncommon|A slight first-touch shock imbues lightning, dealing double damage to armored targets.|lightning, armor, shock|Ammunition|
73|Blood-Seeking Arrow|Weapon|Rare|Smeared with the target’s blood, it can hit that target regardless of distance.|blood, seeking, distance|Ammunition|
74|Splitting Arrow|Weapon|Uncommon|It splits into 1d4 separate missiles when fired, rolling damage for the extras.|multi-shot, splitting, damage|Ammunition|
75|Spoilage Arrow|Weapon|Common|It spoils food and water carried by the target.|spoilage, survival, sabotage|Ammunition|
76|Marked Volley Arrow|Weapon|Rare|After it hits, subsequent missiles fired at the target automatically hit for one hour.|marking, volley, accuracy|Ammunition|
77|Target-Blind Invisibility Arrow|Weapon|Uncommon|A successful hit makes the shooter invisible to the target for 1d6 rounds.|invisibility, stealth, target|Ammunition|
78|Eye-Taking Arrow|Weapon|Rare|When the worst possible attack result is rolled, it takes one of the target’s eyes without fail.|eye, maiming, critical fail|Ammunition|
79|Full-Moon Death Arrow|Weapon|Legendary|Targets hit under full moonlight must save or die.|moon, death, save|Ammunition|
80|Shot-Step Arrow|Weapon|Rare|The shooter can teleport to where the shot lands up to twice per day.|teleportation, movement, landing|Ammunition|
81|Biting Tooth Arrow|Weapon|Uncommon|Tipped with a sharp tooth, it bites like a cave bear on the round after impact.|tooth, bite, beast|Ammunition|
82|Ooze-Glass Arrow|Weapon|Rare|A transparent arrow contains a shrunken ooze or slime released on hit.|ooze, slime, release|Ammunition|
83|Keyhole Knock Arrow|Weapon|Uncommon|A difficult keyhole shot acts as a knock spell.|lock, knock, precision|Ammunition|
84|Corner-Turning Arrow|Weapon|Uncommon|It can turn up to two corners while pursuing fleeing quarry.|seeking, corners, pursuit|Ammunition|
85|Turning Arrow|Weapon|Rare|Undead hit by it must survive a turning check as though by a 5th-level cleric.|undead, turning, radiant|Ammunition|
86|Storm-Splitting Arrow|Weapon|Uncommon|Fog and light rain do not impede it, and it deals double damage during thunderstorms.|storm, weather, thunder|Ammunition|
87|Sparrow Message Arrow|Weapon|Common|Whisper up to ten words to it, and it turns into a sparrow to deliver the message.|message, sparrow, communication|Ammunition|
88|Rusting Plate Arrow|Weapon|Rare|On striking plate armor, it rusts the armor like a rust monster.|rust, armor, corrosion|Ammunition|
89|Potion-Wand Arrow|Weapon|Uncommon|Used to stir a brewing potion, it becomes a one-charge wand for that potion’s spell.|potion, wand, crafting|Ammunition|
90|Unbreakable Load Arrow|Weapon|Uncommon|It is unbreakable, always retrievable, and can support up to a ton.|unbreakable, support, retrieval|Ammunition|
91|Teleport-Lock Arrow|Weapon|Very Rare|Victims cannot teleport or use magic to relocate for one year.|anti-teleport, curse, lockdown|Ammunition|
92|Geyser Arrow|Weapon|Uncommon|A violent geyser erupts at the target’s feet and can toss them into the air.|water, geyser, launch|Ammunition|
93|Hunter’s Scentless Arrow|Weapon|Uncommon|While hunting, the bearer is invisible and unscented to animals.|hunting, animals, stealth|Ammunition|
94|Wakeful Nock Arrow|Weapon|Common|While nocked or loaded in hand, the bearer cannot fall asleep naturally.|wakefulness, guard, sleep|Ammunition|
95|Blind-Mute-Deafen Arrow|Weapon|Rare|Whisper Blind, Mute, or Deafen while firing to impose that condition.|condition, curse, sensory|Ammunition|
96|Meal-Bond Arrow|Weapon|Common|It will never unintentionally strike an ally who has shared a meal with the shooter.|ally-safe, meal, targeting|Ammunition|
97|Feign-Death Arrow|Weapon|Uncommon|A willing target is unharmed and can convincingly feign death for one week.|feign death, willing, deception|Ammunition|
98|Returning Miss Arrow|Weapon|Common|If it misses, it returns to where it was drawn from without fail.|returning, miss, retrieval|Ammunition|
99|Saving-Throw Scroll Arrow|Weapon|Rare|Wrapped tightly in a scroll, it makes a hit target automatically fail its next saving throw.|scroll, save, debuff|Ammunition|
100|Water-Walk Span Arrow|Weapon|Rare|The shooter and up to ten others can walk across any body of water that the shot spans.|water walking, group, travel|Ammunition|
`;

export const classicMagicItemReferences = parseRows(classicMagicItemsRaw, 'Classic d100 Magic Items screenshot', 'Item Reference');
export const magicAmmunitionReferences = parseRows(magicAmmunitionRaw, 'd100 Magic Arrows and Ammunition PDF', 'Magic Ammunition');
export const customReferenceItems = [...classicMagicItemReferences, ...magicAmmunitionReferences];
