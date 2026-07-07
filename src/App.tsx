import { useMemo, useState } from 'react';
import { Copy, Crown, Dice5, Hammer, ScrollText, Shield, Sparkles, WandSparkles } from 'lucide-react';
import { generateItem } from './lib/generator';
import type { ArmorSubtype, ClassName, GeneratorInput, ItemCategory, Rarity, WeaponSubtype } from './types';
import { itemTemplates, rarityRules, spellDamageTable } from './data/tables';

const itemCategories: ItemCategory[] = ['Weapon', 'Armor', 'Shield', 'Wondrous Item', 'Ring', 'Rod', 'Staff', 'Wand', 'Potion', 'Scroll'];
const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];
const weaponSubtypes: WeaponSubtype[] = ['Melee', 'Ranged', 'Two-Handed', 'Versatile', 'Finesse', 'Thrown', 'Ammunition'];
const armorSubtypes: ArmorSubtype[] = ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shield'];
const classNames: ClassName[] = ['Any', 'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];

const defaultInput: GeneratorInput = {
  category: 'Weapon',
  weaponSubtype: 'Versatile',
  armorSubtype: 'Medium Armor',
  rarity: 'Uncommon',
  theme: 'gilded necrotic dragon hoard',
  classAttunement: 'Any',
  creatureStatblock: '',
  allowDownside: true,
  includeSpellLike: true,
};

function App() {
  const [input, setInput] = useState<GeneratorInput>(defaultInput);
  const [rollId, setRollId] = useState(1);
  const generated = useMemo(() => generateItem({ ...input, theme: `${input.theme} #${rollId}` }), [input, rollId]);
  const cleanGenerated = useMemo(() => ({ ...generated, story: generated.story.replace(/ #\d+/g, '') }), [generated]);

  const update = <K extends keyof GeneratorInput>(key: K, value: GeneratorInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  const copyMarkdown = async () => {
    const markdown = `### ${cleanGenerated.name}\n*${cleanGenerated.typeLine} (${cleanGenerated.requiresAttunement})*\n\n${cleanGenerated.appearance}\n\n${cleanGenerated.story}\n\n**Properties**\n${cleanGenerated.properties.map((property) => `- ${property}`).join('\n')}\n\n**Minor Property.** ${cleanGenerated.minorProperty}\n\n**Quirk.** ${cleanGenerated.quirk ?? 'None.'}\n\n${cleanGenerated.craftingHook ? `**Crafting.** ${cleanGenerated.craftingHook}\n\n` : ''}**Balance Notes**\n${cleanGenerated.balanceNotes.map((note) => `- ${note}`).join('\n')}\n\n**Reference Template.** ${cleanGenerated.sourceTemplate}`;
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
            A magic item maker that rolls together rarity limits, class attunement, minor properties, spell-like ceilings,
            and monster-part crafting hooks into a table-ready item card.
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
            Theme
            <input
              value={input.theme}
              onChange={(event) => update('theme', event.target.value)}
              placeholder="necrotic sea, fey moon, storm dragon..."
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
              Include spell-like property
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={input.allowDownside}
                onChange={(event) => update('allowDownside', event.target.checked)}
              />
              Allow downside / counterplay
            </label>
          </div>

          <label>
            Optional Creature Statblock
            <textarea
              value={input.creatureStatblock}
              onChange={(event) => update('creatureStatblock', event.target.value)}
              placeholder={'Paste a monster statblock here. The app will look for name, CR, type, resistances, immunities, vulnerabilities, and signature traits.'}
              rows={8}
            />
          </label>

          <button className="primary-button" type="button" onClick={() => setRollId((id) => id + 1)}>
            <Dice5 size={19} />
            Create Magic Item
          </button>
        </form>

        <section className="result-stack">
          <article className="panel item-card glow-border">
            <div className="item-card-header">
              <div>
                <p className="eyebrow">Generated item</p>
                <h2>{cleanGenerated.name}</h2>
                <p className="type-line">
                  {cleanGenerated.typeLine} · {cleanGenerated.requiresAttunement}
                </p>
              </div>
              <button className="icon-button" type="button" onClick={copyMarkdown} title="Copy as Markdown">
                <Copy size={18} />
              </button>
            </div>

            <p className="boxed-text">{cleanGenerated.appearance}</p>
            <p>{cleanGenerated.story}</p>

            <h3>Properties</h3>
            <ul className="property-list">
              {cleanGenerated.properties.map((property) => (
                <li key={property}>{property}</li>
              ))}
            </ul>

            <div className="minor-grid">
              <div>
                <h3>Minor Property</h3>
                <p>{cleanGenerated.minorProperty}</p>
              </div>
              <div>
                <h3>Quirk</h3>
                <p>{cleanGenerated.quirk}</p>
              </div>
            </div>

            {cleanGenerated.craftingHook && (
              <div className="crafting-hook">
                <Sparkles size={18} />
                <p>{cleanGenerated.craftingHook}</p>
              </div>
            )}

            <h3>Balance Notes</h3>
            <ul className="compact-list">
              {cleanGenerated.balanceNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>

            <p className="template-note">
              <strong>Reference Template:</strong> {cleanGenerated.sourceTemplate}
            </p>
          </article>

          <aside className="panel rules-panel">
            <div className="section-title">
              <Shield size={18} />
              <h2>Rarity Guardrail</h2>
            </div>
            <p>{rarityRules[input.rarity].guidance}</p>
            <dl>
              <div>
                <dt>Max Spell</dt>
                <dd>{rarityRules[input.rarity].maxSpellLevel}</dd>
              </div>
              <div>
                <dt>Max Bonus</dt>
                <dd>{rarityRules[input.rarity].maxBonus}</dd>
              </div>
              <div>
                <dt>Charges</dt>
                <dd>{rarityRules[input.rarity].chargeRange}</dd>
              </div>
            </dl>
          </aside>
        </section>
      </section>

      <section className="panel tables-panel">
        <div className="section-title">
          <ScrollText size={18} />
          <h2>Design Tables</h2>
        </div>
        <div className="tables-grid">
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
          <div className="table-card">
            <h3>Future Database Shape</h3>
            <p>
              Each reference item can store: name, type, rarity, attunement, safe summary, mechanical tags, source/license,
              and deconstruction notes. That lets the generator compare patterns without copying full protected text.
            </p>
            <div className="code-chip">
              <WandSparkles size={16} />
              item → tags → template → unique output
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
