import { useState } from 'react';
import { Link } from 'wouter';
import WikiPageShell from '@/components/WikiPageShell';
import { getEntitiesByType } from '@/lib/entities';
import { entityDetailPath } from '@/lib/entity-paths';
import { translateSchool } from '@/data/entity-translations';

const WEAPON_TYPES = [
  'Sword',
  'Axe',
  'Mace',
  'Spear',
  'Reaper',
  'Crossbow',
  'Longbow',
  'Pistols',
  'Slashers',
  'Claws',
  'Greatsword',
];

export default function BuildsPage() {
  const spells = getEntitiesByType('spell').filter((s) => s.description);
  const jewels = getEntitiesByType('jewel');
  const weapons = getEntitiesByType('weapon');

  const [weaponType, setWeaponType] = useState(WEAPON_TYPES[0]);
  const [school, setSchool] = useState('Blood');
  const [spellSlots, setSpellSlots] = useState<string[]>(['', '', '', '', '']);
  const [jewelId, setJewelId] = useState('');

  const schoolSpells = spells.filter((s) => s.school === school).slice(0, 40);
  const weaponPick = weapons.find((w) =>
    w.name.toLowerCase().includes(weaponType.toLowerCase())
  );

  const selectClass =
    'w-full bg-[#0f0f0f] border border-[#4a4a4a] rounded px-3 py-2 text-sm text-white focus:border-[#c41e3a] focus:outline-none';

  return (
    <WikiPageShell>
      <div className="container py-10 max-w-4xl">
        <h1 className="font-gothic text-4xl font-bold mb-2">Montador de builds</h1>
        <p className="text-[#888] mb-10 max-w-2xl">
          Combine tipo de arma, escola de magia, feitiços e joia (Soul Shard). Salve
          mentalmente ou anote — persistência local virá em atualização futura.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="gothic-card p-6 space-y-4">
            <h2 className="font-gothic text-lg text-[#c41e3a]">Arma</h2>
            <select
              className={selectClass}
              value={weaponType}
              onChange={(e) => setWeaponType(e.target.value)}
            >
              {WEAPON_TYPES.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            {weaponPick && (
              <Link
                href={entityDetailPath('weapon', weaponPick.slug)}
                className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded border border-[#4a4a4a]/50 hover:border-[#c41e3a]/40"
              >
                {weaponPick.image && (
                  <img src={weaponPick.image} alt="" className="w-10 h-10 object-contain" />
                )}
                <span className="text-sm">{weaponPick.name}</span>
              </Link>
            )}
          </div>

          <div className="gothic-card p-6 space-y-4">
            <h2 className="font-gothic text-lg text-[#c41e3a]">Escola de magia</h2>
            <select
              className={selectClass}
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                setSpellSlots(['', '', '', '', '']);
              }}
            >
              {['Blood', 'Chaos', 'Frost', 'Storm', 'Unholy', 'Illusion', 'Shadow'].map(
                (s) => (
                  <option key={s} value={s}>
                    {translateSchool(s)}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="gothic-card p-6 space-y-4 md:col-span-2">
            <h2 className="font-gothic text-lg text-[#c41e3a]">Feitiços (barra)</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {spellSlots.map((slot, i) => (
                <select
                  key={i}
                  className={selectClass}
                  value={slot}
                  onChange={(e) => {
                    const next = [...spellSlots];
                    next[i] = e.target.value;
                    setSpellSlots(next);
                  }}
                >
                  <option value="">Slot {i + 1} — vazio</option>
                  {schoolSpells.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          <div className="gothic-card p-6 space-y-4 md:col-span-2">
            <h2 className="font-gothic text-lg text-[#c41e3a]">Joia / Soul Shard</h2>
            <select
              className={selectClass}
              value={jewelId}
              onChange={(e) => setJewelId(e.target.value)}
            >
              <option value="">Nenhuma</option>
              {jewels.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
          </div>

          <div className="gothic-card p-6 md:col-span-2 border-[#c41e3a]/30">
            <h2 className="font-gothic text-lg text-[#c41e3a] mb-4">Resumo da build</h2>
            <ul className="text-[#e0e0e0] space-y-2 text-sm">
              <li>
                <strong>Arma:</strong> {weaponType}
              </li>
              <li>
                <strong>Magia:</strong> {translateSchool(school)}
              </li>
              <li>
                <strong>Feitiços:</strong>{' '}
                {spellSlots.filter(Boolean).length
                  ? spellSlots
                      .map((id) => spells.find((s) => s.id === id)?.name ?? '—')
                      .join(' · ')
                  : '—'}
              </li>
              <li>
                <strong>Joia:</strong>{' '}
                {jewels.find((j) => j.id === jewelId)?.name ?? '—'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </WikiPageShell>
  );
}
