import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ExternalLink, Skull, Zap } from 'lucide-react';
import EntitySectionContent from '@/components/EntitySectionContent';
import AssetImage from '@/components/AssetImage';
import WikiProse from '@/components/WikiProse';
import SpellChoiceList from '@/components/detail/SpellChoiceList';
import type { WikiEntity } from '@/data/entity-types';
import { translateSchool } from '@/data/entity-translations';
import { entityDetailPath, entityListPath } from '@/lib/entity-paths';
import { getSchoolTheme } from '@/lib/school-theme';
import { tierCategoryLabelPt } from '@/lib/spell-school-progression';

const STAT_KEYS = [
  'cooldown',
  'casttime',
  'damage',
  'healing',
  'duration',
  'type',
  'class',
];

const STAT_LABELS: Record<string, string> = {
  cooldown: 'Recarga',
  casttime: 'Conjuração',
  damage: 'Dano',
  healing: 'Cura',
  duration: 'Duração',
  type: 'Tipo',
  class: 'Classe',
};

type Tab = 'overview' | 'stats';

export default function SpellDetailView({ entity }: { entity: WikiEntity }) {
  const [tab, setTab] = useState<Tab>('overview');
  const theme = getSchoolTheme(entity.school);
  const meta = entity.meta;
  const stats = Object.entries(entity.infobox).filter(([k]) => STAT_KEYS.includes(k));
  const progression = meta?.spellProgression;
  const isDash = progression?.category === 'dash';

  const borderClass = theme?.border ?? 'border-[#333]';

  return (
    <div className="container py-8 max-w-3xl">
      <Link
        href={entityListPath('spell')}
        className="inline-flex items-center gap-2 text-[#888] hover:text-[#c41e3a] mb-8 text-sm"
      >
        <ArrowLeft size={16} />
        Feitiços
      </Link>

      <header
        className={`flex gap-6 mb-8 pb-8 border-b-2 ${borderClass} rounded-xl p-6 ${theme?.bg ?? 'bg-[#111]/50'}`}
        style={theme ? { boxShadow: `0 0 40px ${theme.accent}15` } : undefined}
      >
        <div className="w-24 h-24 shrink-0 rounded-lg bg-[#0a0a0a]/80 flex items-center justify-center p-2 border border-[#333]">
          {entity.image ? (
            <AssetImage src={entity.image} alt="" className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-[#444] text-xs">—</span>
          )}
        </div>
        <div>
          <p
            className="text-[11px] uppercase tracking-[0.2em] mb-2"
            style={{ color: theme?.accent ?? '#c41e3a' }}
          >
            {progression?.labelPt ?? translateSchool(entity.school) ?? 'Feitiço'}
          </p>
          <h1 className="font-gothic text-3xl font-bold text-white">{entity.name}</h1>
          {progression && !isDash && (
            <p className="text-sm text-[#888] mt-2">{tierCategoryLabelPt(progression.category)}</p>
          )}
        </div>
      </header>

      <div className="flex gap-1 mb-8 border-b border-[#252525]">
        {(['overview', 'stats'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${
              tab === id
                ? 'border-[#c41e3a] text-white'
                : 'border-transparent text-[#777]'
            }`}
            style={tab === id && theme ? { borderColor: theme.accent } : undefined}
          >
            {id === 'overview' ? 'Visão geral' : 'Atributos & joias'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-8">
          {isDash && meta?.dashBoss && (
            <section className="rounded-xl border border-[#2a2a2a] p-5 bg-[#111]/60">
              <h2 className="font-gothic text-lg text-white mb-2 flex items-center gap-2">
                <Zap size={18} className="text-[#c41e3a]" />
                Como desbloquear
              </h2>
              <p className="text-sm text-[#888] mb-3">
                Dash (Veil) — desbloqueio <strong className="text-[#bbb]">direto</strong> ao
                derrotar o chefe (não usa ponto de feitiço).
              </p>
              <Link
                href={entityDetailPath('boss', meta.dashBoss.bossSlug)}
                className="inline-flex items-center gap-2 text-white hover:text-[#c41e3a] transition-colors"
              >
                <Skull size={16} />
                {meta.dashBoss.bossName}
              </Link>
            </section>
          )}

          {!isDash && meta?.spellPointBosses && meta.spellPointBosses.length > 0 && (
            <section
              className="rounded-xl border p-5"
              style={
                theme
                  ? {
                      borderColor: `${theme.accent}35`,
                      background: `linear-gradient(135deg, ${theme.accent}10 0%, transparent 70%)`,
                    }
                  : undefined
              }
            >
              <h2 className="font-gothic text-lg text-white mb-2 flex items-center gap-2">
                <Zap size={18} style={{ color: theme?.accent }} />
                Como desbloquear
              </h2>
              <p className="text-sm text-[#888] mb-4">
                Derrote um chefe que concede o ponto de feitiço correspondente; depois{' '}
                <strong className="text-[#bbb]">gaste o ponto</strong> e escolha este feitiço entre
                as opções do mesmo tier.
              </p>
              <ul className="space-y-2">
                {meta.spellPointBosses.map((boss) => (
                  <li key={boss.bossId}>
                    <Link
                      href={entityDetailPath('boss', boss.bossSlug)}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-3 hover:border-[#c41e3a]/40 transition-colors"
                    >
                      <span className="text-white font-medium flex items-center gap-2">
                        <Skull size={14} className="text-[#c41e3a] shrink-0" />
                        {boss.bossName}
                      </span>
                      <span className="text-xs text-[#888]">{boss.labelPt}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {progression && progression.peers.length > 0 && (
            <section>
              <h2 className="font-gothic text-lg text-[#c41e3a] mb-2">
                Outras opções no mesmo tier
              </h2>
              <p className="text-sm text-[#888] mb-3">
                Ao gastar o mesmo tipo de ponto, você escolhe apenas{' '}
                <strong className="text-[#bbb]">uma</strong> destas habilidades:
              </p>
              <SpellChoiceList choices={progression.peers} school={progression.school} />
            </section>
          )}

          {entity.description && (
            <section>
              <h2 className="font-gothic text-lg text-[#c41e3a] mb-3">O que faz</h2>
              <WikiProse text={entity.description} />
            </section>
          )}
          {meta?.unlockRequirement && (
            <section className="rounded-lg border border-[#2a2a2a] p-5 bg-[#111]/60">
              <h2 className="font-gothic text-lg text-white mb-2">Notas da wiki (Fandom)</h2>
              <WikiProse text={meta.unlockRequirement} />
            </section>
          )}
          {(entity.youtubeId || entity.sections.some((s) => s.youtubeId)) && (
            <EntitySectionContent
              sections={entity.sections.filter((s) => s.youtubeId)}
              pageYoutubeId={entity.youtubeId}
            />
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div className="space-y-8">
          {stats.length > 0 ? (
            <dl className="grid grid-cols-2 gap-3">
              {stats.map(([key, val]) => (
                <div
                  key={key}
                  className={`rounded-lg border px-4 py-3 ${borderClass} ${theme?.bg ?? ''}`}
                >
                  <dt className="text-[10px] uppercase text-[#666] mb-1">
                    {STAT_LABELS[key] ?? key}
                  </dt>
                  <dd className="text-sm text-white">{val}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-[#666] text-sm">Sem atributos numéricos na Fandom.</p>
          )}
          {meta?.jewels && (
            <section>
              <h2 className="font-gothic text-lg text-[#c41e3a] mb-3">Joias (modificadores)</h2>
              <WikiProse text={meta.jewels} />
            </section>
          )}
          {entity.sections
            .filter((s) => /jewel/i.test(s.title) && !meta?.jewels)
            .map((s) => (
              <section key={s.title}>
                <h2 className="font-gothic text-lg text-white mb-2">{s.titlePt ?? s.title}</h2>
                <WikiProse text={s.body} />
              </section>
            ))}
        </div>
      )}

      {entity.fandomUrl && (
        <footer className="mt-10 pt-6 border-t border-[#252525]">
          <a
            href={entity.fandomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#c41e3a] inline-flex items-center gap-2"
          >
            Fandom <ExternalLink size={14} />
          </a>
        </footer>
      )}
    </div>
  );
}
