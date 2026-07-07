import { useMemo, useState } from 'react';
import {
  BookOpen,
  Copy,
  Crown,
  Database,
  Dice5,
  Hammer,
  ScrollText,
  Search,
  Shield,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { generateItem } from './lib/generator';
import type {
  ArmorSubtype,
  ClassName,
  GeneratedItem,
  GeneratorInput,
  ItemCategory,
  Rarity,
  SrdDataset,
  SrdEquipment,
  SrdMagicItem,
  SrdSpell,
  WeaponSubtype,
} from './types';
import { itemTemplates, rarityRules, spellDamageTable } from './data/tables';
import { propertyCountByRarity } from './data/property-tables';
import { customReferenceItems, type CustomReferenceItem } from './data/custom/deconstruction-references';
import rawSrdDataset from './data/srd/srd-dataset.json';

const srdDataset = rawSrdDataset as SrdDataset;

const itemCategories: ItemCategory[] = ['Weapon', 'Armor', 'Shield', 'Wondrous Item', 'Ring', 'Rod', 'Staff', 'Wand', 'Potion', 'Scroll'];
const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];
const weaponSubtypes: WeaponSubtype[] = ['Melee', 'Ranged', 'Two-Handed', 'Versatile', 'Finesse', 'Thrown', 'Ammunition'];
const armorSubtypes: ArmorSubtype[] = ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shield'];
const classNames: ClassName[] = ['Any', 'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];

type ReferenceKind = 'All' | 'Spell' | 'Magic Item' | 'Equipment' | 'Item Reference' | 'Magic Ammunition';

type ReferenceEntry = {
  id: string;
  kind: Exclude<ReferenceKind, 'All'>;
  name: string;
  badge: string;
  summary: string;
  reference: string;
  themeHint: string;
  categoryHint?: ItemCategory;
  weaponSubtypeHint?: WeaponSubtype;
  armorSubtypeHint?: ArmorSubtype;
  rarityHint?: Rarity;
  searchText: string;
};

const defaultInput: GeneratorInput = {
  category: 'Weapon',
  weaponSubtype: 'Versatile',
  armorSubtype: 'Medium Armor',
  rarity: 'Uncommon',
  theme: 'rooftop escape',
  classAttunement: 'Any',
  creatureStatblock: '',
  srdReference: '',
  allowDownside: true,
  includeSpellLike: true,
};

function normalizeRarity(value?: string): Rarity | undefined {
  const text = value?.toLowerCase() ?? '';
  if (text.includes('legendary')) return 'Legendary';
  if (text.includes('very rare')) return 'Very Rare';
  if (text.includes('rare')) return 'Rare';
  if (text.includes('uncommon')) return 'Uncommon';
  if (text.includes('common')) return 'Common';
  return undefined;
}

function themeFromText(...parts: Array<string | undefined>): string {
  const text = parts.filter(Boolean).join(' ').toLowerCase();
  const tags = [
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
    'fey',
    'dragon',
    'shadow',
    'sea',
    'dream',
    'storm',
  ].filter((tag) => text.includes(tag));

  if (text.includes('necromancy')) tags.push('necrotic');
  if (text.includes('evocation')) tags.push('arcane');
  if (text.includes('illusion')) tags.push('illusion');
  if (text.includes('divination')) tags.push('oracle');
  if (text.includes('abjuration')) tags.push('warding');
  if (text.includes('conjuration')) tags.push('summoning');
  if (text.includes('enchantment')) tags.push('charm');
  if (text.includes('transmutation')) tags.push('shifting');

  return Array.from(new Set(tags)).slice(0, 4).join(' ') || 'borrowed talent';
}

function spellToEntry(spell: SrdSpell): ReferenceEntry {
  const classes = spell.classes?.length ? ` · ${spell.classes.join(', ')}` : '';
  const damage = spell.damageType ? ` · ${spell.damageType}` : '';
  const save = spell.saveType ? ` · ${spell.saveType} save` : '';
  const summary = `Level ${spell.level ?? 0} ${spell.school ?? 'spell'}${damage}${save}${classes}`;
  const reference = [
    `SRD Spell: ${spell.name}`,
    `Level: ${spell.level ?? 0}`,
    spell.school ? `School: ${spell.school}` : undefined,
    spell.damageType ? `Damage: ${spell.damageType}` : undefined,
    spell.saveType ? `Save: ${spell.saveType}` : undefined,
    spell.attackType ? `Attack: ${spell.attackType}` : undefined,
    spell.range ? `Range: ${spell.range}` : undefined,
    spell.duration ? `Duration: ${spell.duration}` : undefined,
    spell.classes?.length ? `Classes: ${spell.classes.join(', ')}` : undefined,
    spell.desc ? `Description: ${spell.desc.slice(0, 600)}` : undefined,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    id: `spell:${spell.index}`,
    kind: 'Spell',
    name: spell.name,
    badge: `Spell ${spell.level ?? 0}`,
    summary,
    reference,
    themeHint: themeFromText(spell.name, spell.school, spell.damageType, spell.desc),
    categoryHint: 'Wand',
    rarityHint: spell.level === undefined || spell.level <= 1 ? 'Common' : spell.level <= 2 ? 'Uncommon' : spell.level <= 3 ? 'Rare' : 'Very Rare',
    searchText: `${spell.name} ${summary} ${spell.desc ?? ''}`.toLowerCase(),
  };
}

function magicItemToEntry(item: SrdMagicItem): ReferenceEntry {
  const summary = `${item.rarity ?? 'SRD'} ${item.category ?? 'magic item'}${item.variants?.length ? ` · variants: ${item.variants.join(', ')}` : ''}`;
  const reference = [
    `SRD Magic Item: ${item.name}`,
    item.rarity ? `Rarity: ${item.rarity}` : undefined,
    item.category ? `Category: ${item.category}` : undefined,
    item.variants?.length ? `Variants: ${item.variants.join(', ')}` : undefined,
    item.desc ? `Description: ${item.desc.slice(0, 800)}` : undefined,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    id: `magic-item:${item.index}`,
    kind: 'Magic Item',
    name: item.name,
    badge: item.rarity ?? 'Magic Item',
    summary,
    reference,
    themeHint: themeFromText(item.name, item.rarity, item.category, item.desc),
    categoryHint: 'Wondrous Item',
    rarityHint: normalizeRarity(item.rarity),
    searchText: `${item.name} ${summary} ${item.desc ?? ''}`.toLowerCase(),
  };
}

function equipmentToEntry(item: SrdEquipment): ReferenceEntry {
  const isWeapon = item.category?.toLowerCase().includes('weapon') || Boolean(item.weaponCategory);
  const isArmor = item.category?.toLowerCase().includes('armor') || Boolean(item.armorCategory);
  const categoryHint: ItemCategory = isWeapon ? 'Weapon' : isArmor ? 'Armor' : 'Wondrous Item';
  const weaponSubtypeHint: WeaponSubtype | undefined = item.weaponRange === 'Ranged' ? 'Ranged' : item.properties?.includes('Two-Handed') ? 'Two-Handed' : item.properties?.includes('Versatile') ? 'Versatile' : item.properties?.includes('Thrown') ? 'Thrown' : isWeapon ? 'Melee' : undefined;
  const armorSubtypeHint: ArmorSubtype | undefined = item.armorCategory?.includes('Heavy') ? 'Heavy Armor' : item.armorCategory?.includes('Medium') ? 'Medium Armor' : item.armorCategory?.includes('Light') ? 'Light Armor' : undefined;
  const summary = [item.category, item.weaponCategory, item.armorCategory, item.damageDice, item.damageType, item.properties?.join(', ')].filter(Boolean).join(' · ');
  const reference = [
    `SRD Equipment: ${item.name}`,
    item.category ? `Category: ${item.category}` : undefined,
    item.weaponCategory ? `Weapon Category: ${item.weaponCategory}` : undefined,
    item.armorCategory ? `Armor Category: ${item.armorCategory}` : undefined,
    item.damageDice ? `Damage: ${item.damageDice} ${item.damageType ?? ''}` : undefined,
    item.twoHandedDamageDice ? `Two-Handed Damage: ${item.twoHandedDamageDice} ${item.twoHandedDamageType ?? ''}` : undefined,
    item.properties?.length ? `Properties: ${item.properties.join(', ')}` : undefined,
    item.armorClassBase ? `Base AC: ${item.armorClassBase}` : undefined,
    item.cost ? `Cost: ${item.cost}` : undefined,
    item.weight ? `Weight: ${item.weight}` : undefined,
    item.desc ? `Description: ${item.desc.slice(0, 600)}` : undefined,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    id: `equipment:${item.index}`,
    kind: 'Equipment',
    name: item.name,
    badge: item.category ?? 'Equipment',
    summary,
    reference,
    themeHint: themeFromText(item.name, item.damageType, item.category, item.properties?.join(' '), item.desc),
    categoryHint,
    weaponSubtypeHint,
    armorSubtypeHint,
    searchText: `${item.name} ${summary} ${item.desc ?? ''}`.toLowerCase(),
  };
}

function customReferenceToEntry(item: CustomReferenceItem): ReferenceEntry {
  const summary = `${item.source} · ${item.summary}`;
  const reference = [
    `Custom Reference: ${item.name}`,
    `Source: ${item.source}`,
    `Roll: ${item.roll}`,
    `Kind: ${item.kind}`,
    item.tags.length ? `Tags: ${item.tags.join(', ')}` : undefined,
    `Summary: ${item.summary}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    id: `custom:${item.id}`,
    kind: item.kind,
    name: item.name,
    badge: item.kind === 'Magic Ammunition' ? `Ammo ${item.roll}` : `d100 ${item.roll}`,
    summary,
    reference,
    themeHint: item.tags.join(' ') || themeFromText(item.name, item.summary),
    categoryHint: item.categoryHint,
    weaponSubtypeHint: item.weaponSubtypeHint,
    armorSubtypeHint: item.armorSubtypeHint,
    rarityHint: item.rarityHint,
    searchText: `${item.name} ${summary} ${item.tags.join(' ')}`.toLowerCase(),
  };
}

function makeReferenceEntries(dataset: SrdDataset): ReferenceEntry[] {
  return [
    ...dataset.spells.map(spellToEntry),
    ...dataset.magicItems.map(magicItemToEntry),
    ...dataset.equipment.map(equipmentToEntry),
    ...customReferenceItems.map(customReferenceToEntry),
  ];
}

function App() {
  const [input, setInput] = useState<GeneratorInput>(defaultInput);
  const [generatedItem, setGeneratedItem] = useState<GeneratedItem | null>(null);
  const [referenceQuery, setReferenceQuery] = useState('');
  const [referenceKind, setReferenceKind] = useState<ReferenceKind>('All');
  const [selectedReferenceName, setSelectedReferenceName] = useState<string | null>(null);

  const referenceEntries = useMemo(() => makeReferenceEntries(srdDataset), []);
  const filteredReferenceEntries = useMemo(() => {
    const query = referenceQuery.trim().toLowerCase();
    return referenceEntries
      .filter((entry) => referenceKind === 'All' || entry.kind === referenceKind)
      .filter((entry) => !query || entry.searchText.includes(query))
      .slice(0, 24);
  }, [referenceEntries, referenceKind, referenceQuery]);

  const customItemCount = customReferenceItems.filter((item) => item.kind === 'Item Reference').length;
  const ammunitionCount = customReferenceItems.filter((item) => item.kind === 'Magic Ammunition').length;

  const update = <K extends keyof GeneratorInput>(key: K, value: GeneratorInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  const createItem = () => {
    setGeneratedItem(generateItem({ ...input, theme: `${input.theme} #${Date.now()}` }));
  };

  const useReferenceEntry = (entry: ReferenceEntry) => {
    setSelectedReferenceName(entry.name);
    setInput((current) => ({
      ...current,
      theme: [entry.themeHint, current.theme].filter(Boolean).join(' '),
      category: entry.categoryHint ?? current.category,
      weaponSubtype: entry.weaponSubtypeHint ?? current.weaponSubtype,
      armorSubtype: entry.armorSubtypeHint ?? current.armorSubtype,
      rarity: entry.rarityHint ?? current.rarity,
      includeSpellLike: entry.kind === 'Spell' ? true : current.includeSpellLike,
      srdReference: entry.reference,
    }));
  };

  const clearReferenceEntry = () => {
    setSelectedReferenceName(null);
    update('srdReference', '');
  };

  const copyMarkdown = async () => {
    if (!generatedItem) return;
    const markdown = `### ${generatedItem.name}\n*${generatedItem.typeLine} (${generatedItem.requiresAttunement})*\n\n${generatedItem.appearance}\n\n${generatedItem.story}\n\n**Properties**\n${generatedItem.properties.map((property) => `- ${property}`).join('\n')}\n\n**Minor Property.** ${generatedItem.minorProperty}\n\n**Quirk.** ${generatedItem.quirk ?? 'None.'}\n\n${generatedItem.craftingHook ? `**Crafting.** ${generatedItem.craftingHook}\n\n` : ''}${input.srdReference ? `**Reference Used.** ${selectedReferenceName ?? 'Selected reference'}\n\n` : ''}**Balance Notes**\n${generatedItem.balanceNotes.map((note) => `- ${note}`).join('\n')}\n\n**Reference Template.** ${generatedItem.sourceTemplate}`;
    await navigator.clipboard.writeText(markdown);
  };

  return (
    <main className="shell">
      <section className="hero panel glow-border">
        <div className="brand-mark" aria-hidden="true">
          <Crown size={34} />
        </div>
        <div>
          <p className="eyebrow">Kobold Apps · D&D 5e homebrew forge</p>
          <h1>Vex&apos;s Gilded Hoard</h1>
          <p className="hero-copy">
            Generate item mechanics from rarity budgets, property tables, SRD spell/item patterns, d100 references, and optional monster-part crafting. Nothing is rolled until you press Create.
          </p>
        </div>
      </section>

      <section className="layout">
        <form className="panel controls" onSubmit={(event) => event.preventDefault()}>
          <div className="section-title">
            <Hammer size={18} />
            <h2>Forge Input</h2>
          </div>

          <label>
            Item Type
            <select value={input.category} onChange={(event) => update('category', event.target.value as ItemCategory)}>
              {itemCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          {input.category === 'Weapon' && (
            <label>
              Weapon Subtype
              <select value={input.weaponSubtype} onChange={(event) => update('weaponSubtype', event.target.value as WeaponSubtype)}>
                {weaponSubtypes.map((subtype) => (
                  <option key={subtype}>{subtype}</option>
                ))}
              </select>
            </label>
          )}

          {(input.category === 'Armor' || input.category === 'Shield') && (
            <label>
              Armor / Shield Type
              <select value={input.armorSubtype} onChange={(event) => update('armorSubtype', event.target.value as ArmorSubtype)}>
                {armorSubtypes.map((subtype) => (
                  <option key={subtype}>{subtype}</option>
                ))}
              </select>
            </label>
          )}

          <label>
            Rarity
            <select value={input.rarity} onChange={(event) => update('rarity', event.target.value as Rarity)}>
              {rarities.map((rarity) => (
                <option key={rarity}>{rarity}</option>
              ))}
            </select>
          </label>

          <label>
            Theme / Fame
            <input
              value={input.theme}
              onChange={(event) => update('theme', event.target.value)}
              placeholder="rooftop escape, fire duelist, impossible hunter..."
            />
          </label>

          <label>
            Attunement Class
            <select value={input.classAttunement} onChange={(event) => update('classAttunement', event.target.value as ClassName)}>
              {classNames.map((className) => (
                <option key={className}>{className}</option>
              ))}
            </select>
          </label>

          <div className="switch-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={input.includeSpellLike}
                onChange={(event) => update('includeSpellLike', event.target.checked)}
              />
              Allow spell-like property rolls
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={input.allowDownside}
                onChange={(event) => update('allowDownside', event.target.checked)}
              />
              Allow downside / counterplay notes
            </label>
          </div>

          {input.srdReference && (
            <div className="selected-reference">
              <strong>Reference source:</strong> {selectedReferenceName ?? 'Selected reference'}
              <button type="button" onClick={clearReferenceEntry}>Clear</button>
            </div>
          )}

          <label>
            Optional Creature Statblock
            <textarea
              value={input.creatureStatblock}
              onChange={(event) => update('creatureStatblock', event.target.value)}
              placeholder={'Paste a monster statblock here. The app will look for name, CR, type, resistances, immunities, vulnerabilities, and signature traits.'}
              rows={8}
            />
          </label>

          <button className="primary-button" type="button" onClick={createItem}>
            <Dice5 size={19} />
            {generatedItem ? 'Regenerate With Same Parameters' : 'Create Magic Item'}
          </button>
        </form>

        <section className="result-stack">
          <article className="panel item-card glow-border">
            {generatedItem ? (
              <>
                <div className="item-card-header">
                  <div>
                    <p className="eyebrow">Generated item</p>
                    <h2>{generatedItem.name}</h2>
                    <p className="type-line">
                      {generatedItem.typeLine} · {generatedItem.requiresAttunement}
                    </p>
                  </div>
                  <button className="icon-button" type="button" onClick={copyMarkdown} title="Copy as Markdown">
                    <Copy size={18} />
                  </button>
                </div>

                <p className="boxed-text">{generatedItem.appearance}</p>
                <p>{generatedItem.story}</p>

                <h3>Properties</h3>
                <ul className="property-list">
                  {generatedItem.properties.map((property) => (
                    <li key={property}>{property}</li>
                  ))}
                </ul>

                <div className="minor-grid">
                  <div>
                    <h3>Minor Property</h3>
                    <p>{generatedItem.minorProperty}</p>
                  </div>
                  <div>
                    <h3>Quirk</h3>
                    <p>{generatedItem.quirk}</p>
                  </div>
                </div>

                {generatedItem.craftingHook && (
                  <div className="crafting-hook">
                    <Sparkles size={18} />
                    <p>{generatedItem.craftingHook}</p>
                  </div>
                )}

                <h3>Balance Notes</h3>
                <ul className="compact-list">
                  {generatedItem.balanceNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>

                <p className="template-note">
                  <strong>Reference Template:</strong> {generatedItem.sourceTemplate}
                </p>
              </>
            ) : (
              <div className="empty-srd">
                <Dice5 size={22} />
                <p>Choose the item parameters, optionally pick a reference source below, then press <strong>Create Magic Item</strong>. The app will not roll an item before that.</p>
              </div>
            )}
          </article>

          <aside className="panel rules-panel">
            <div className="section-title">
              <Shield size={18} />
              <h2>Rarity Guardrail</h2>
            </div>
            <p>{rarityRules[input.rarity].guidance}</p>
            <dl>
              <div>
                <dt>Properties</dt>
                <dd>{propertyCountByRarity[input.rarity]} maximum properties</dd>
              </div>
              <div>
                <dt>Max Spell</dt>
                <dd>{rarityRules[input.rarity].maxSpellLevel}</dd>
              </div>
              <div>
                <dt>Max Bonus</dt>
                <dd>{rarityRules[input.rarity].maxBonus}</dd>
              </div>
            </dl>
          </aside>
        </section>
      </section>

      <section className="panel srd-panel">
        <div className="section-title split-title">
          <span>
            <Database size={18} />
            <h2>Reference Database</h2>
          </span>
          <small>
            {srdDataset.spells.length} spells · {srdDataset.magicItems.length} SRD items · {srdDataset.equipment.length} equipment · {customItemCount} d100 items · {ammunitionCount} ammo
          </small>
        </div>
        <p className="srd-note">
          Search a spell, SRD item, equipment entry, classic d100 item, or magic ammunition reference. Click <strong>Use as source</strong> to feed its tags and hints into the next roll.
        </p>
        <div className="srd-controls">
          <label>
            <span><Search size={15} /> Search references</span>
            <input value={referenceQuery} onChange={(event) => setReferenceQuery(event.target.value)} placeholder="feather fall, acrobatics, arrow, invisibility, wand..." />
          </label>
          <label>
            Data Type
            <select value={referenceKind} onChange={(event) => setReferenceKind(event.target.value as ReferenceKind)}>
              {(['All', 'Spell', 'Magic Item', 'Equipment', 'Item Reference', 'Magic Ammunition'] as ReferenceKind[]).map((kind) => (
                <option key={kind}>{kind}</option>
              ))}
            </select>
          </label>
        </div>

        {referenceEntries.length === 0 ? (
          <div className="empty-srd">
            <BookOpen size={20} />
            <p>No reference data is available yet. Run <code>npm run import:srd</code> to fill SRD data, or add custom reference rows under <code>src/data/custom</code>.</p>
          </div>
        ) : (
          <div className="srd-grid">
            {filteredReferenceEntries.map((entry) => (
              <article className="srd-card" key={entry.id}>
                <div>
                  <span className="srd-badge">{entry.badge}</span>
                  <h3>{entry.name}</h3>
                  <p>{entry.summary}</p>
                </div>
                <button type="button" onClick={() => useReferenceEntry(entry)}>Use as source</button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel tables-panel">
        <div className="section-title">
          <ScrollText size={18} />
          <h2>Design Tables</h2>
        </div>
        <div className="tables-grid">
          <div className="table-card">
            <h3>Property Count</h3>
            <table>
              <thead>
                <tr><th>Rarity</th><th>Max Properties</th></tr>
              </thead>
              <tbody>
                {rarities.map((rarity) => (
                  <tr key={rarity}><td>{rarity}</td><td>{propertyCountByRarity[rarity]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-card">
            <h3>Property Table Roll</h3>
            <table>
              <tbody>
                <tr><td>1–2</td><td>Skill check property</td></tr>
                <tr><td>3–4</td><td>1st-level spell property</td></tr>
                <tr><td>5–6</td><td>2nd-level spell property</td></tr>
                <tr><td>7–8</td><td>3rd-level spell property, if rarity allows</td></tr>
                <tr><td>9–10</td><td>Non-spell item property</td></tr>
              </tbody>
            </table>
          </div>
          <div className="table-card">
            <h3>Database Shape</h3>
            <p>
              Reference entries are stored as normalized spells, magic items, equipment, classic item patterns, and ammunition tricks. The generator rolls property tables first, then writes the previous-wielder story from the resulting abilities.
            </p>
            <div className="code-chip">
              <WandSparkles size={16} />
              rarity → property count → table → property
            </div>
          </div>
          <div className="table-card">
            <h3>Spell Damage</h3>
            <table>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>One Target</th>
                  <th>Multiple</th>
                </tr>
              </thead>
              <tbody>
                {spellDamageTable.map(([level, single, multiple]) => (
                  <tr key={level}>
                    <td>{level}</td>
                    <td>{single}</td>
                    <td>{multiple}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-card">
            <h3>Building Blocks</h3>
            <ul className="compact-list">
              {itemTemplates.map((template) => (
                <li key={template.name}>
                  <strong>{template.name}:</strong> {template.safeSummary}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
