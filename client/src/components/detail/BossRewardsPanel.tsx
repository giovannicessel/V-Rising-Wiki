import { Link } from 'wouter';
import { Gem, Package, Sparkles, Wand2, Zap } from 'lucide-react';
import type { BossUnlockEntry, WikiEntity } from '@/data/entity-types';
import { translateSchool } from '@/data/entity-translations';
import { entityDetailPath } from '@/lib/entity-paths';
import { getSchoolTheme } from '@/lib/school-theme';
import { tierCategoryLabelPt } from '@/lib/spell-school-progression';
import { getSoulShardBossTheme } from '@/lib/soul-shard-bosses';
import WikiProse from '@/components/WikiProse';
import { findBossWorldLore } from '@/lib/lore';
import SpellChoiceList from '@/components/detail/SpellChoiceList';
import MainRewardList from '@/components/detail/MainRewardList';

function UnlockCard({
  entry,
  school,
}: {
  entry: BossUnlockEntry;
  school?: string;
}) {
  const theme = school ? getSchoolTheme(school) : null;
  const href =
    entry.entityId && entry.entityType && entry.slug
      ? entityDetailPath(entry.entityType, entry.slug)
      : null;

  const inner = (
    <>
      <div
        className={`w-12 h-12 shrink-0 rounded-lg bg-[#0a0a0a] border flex items-center justify-center overflow-hidden ${
          theme ? theme.border : 'border-[#333]'
        }`}
      >
        {entry.image ? (
          <img src={entry.image} alt="" className="w-full h-full object-contain p-1" />
        ) : (
          <Wand2 size={20} className="text-[#555]" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-white font-medium leading-snug">{entry.name}</p>
        {entry.school && (
          <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: theme?.accent }}>
            {translateSchool(entry.school)}
          </p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex gap-3 p-3 rounded-lg border border-[#2a2a2a] bg-[#111]/80 hover:border-[#c41e3a]/40 transition-colors"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex gap-3 p-3 rounded-lg border border-[#2a2a2a] bg-[#111]/80">{inner}</div>
  );
}

function filterMainRewards(
  entries: BossUnlockEntry[],
  rewards: NonNullable<WikiEntity['meta']>['rewards']
) {
  const skip = new Set<string>();
  for (const v of rewards?.vampirePowers ?? []) {
    skip.add(v.name.toLowerCase());
    if (v.nameEn) skip.add(v.nameEn.toLowerCase());
  }
  return entries.filter((e) => {
    const n = e.name.toLowerCase();
    if (skip.has(n)) return false;
    if (/^forma de /i.test(e.name) && rewards?.vampirePowers?.length) return false;
    return true;
  });
}

export default function BossRewardsPanel({ entity }: { entity: WikiEntity }) {
  const rewards = entity.meta?.rewards;
  const soulShard = getSoulShardBossTheme(entity.id);
  const worldLore = findBossWorldLore(entity);
  const rawMain = rewards?.mainRewards?.length
    ? rewards.mainRewards
    : rewards?.recipes?.length
      ? rewards.recipes
      : [];
  const mainRewards = rewards ? filterMainRewards(rawMain, rewards) : rawMain;

  if (!rewards && !entity.meta?.loot && !soulShard && !worldLore) {
    return (
      <p className="text-[#666] text-sm">Recompensas ainda não catalogadas para este chefe.</p>
    );
  }

  const schoolTheme = rewards?.primarySchool
    ? getSchoolTheme(rewards.primarySchool)
    : null;

  const dash = rewards?.dashUnlock;
  const spellPoint = rewards?.spellPoint;

  return (
    <div className="space-y-8">
      {rewards?.source === 'v1.1' && (
        <p className="text-xs text-[#666] border-l-2 border-[#c41e3a]/50 pl-3">
          Na <strong className="text-[#999]">v1.1</strong>, chefes concedem{' '}
          <strong className="text-[#aaa]">pontos de feitiço</strong> (você escolhe 1 habilidade
          entre as opções do tier). Veils (Dash) são o único feitiço desbloqueado diretamente.
        </p>
      )}

      {spellPoint && schoolTheme && (
        <section
          className="rounded-xl border p-5"
          style={{
            borderColor: `${schoolTheme.accent}40`,
            background: `linear-gradient(135deg, ${schoolTheme.accent}12 0%, transparent 60%)`,
          }}
        >
          <h2 className="font-gothic text-lg text-white mb-1 flex items-center gap-2">
            <Zap size={18} style={{ color: schoolTheme.accent }} />
            Ponto de feitiço
          </h2>
          <p className="text-lg font-semibold text-white mb-1">{spellPoint.labelPt}</p>
          <p className="text-sm text-[#888] mb-4">
            {tierCategoryLabelPt(spellPoint.category)} · escola{' '}
            <span style={{ color: schoolTheme.accent }}>
              {translateSchool(spellPoint.school)}
            </span>
          </p>
          {spellPoint.choices.length > 0 ? (
            <>
              <p className="text-xs uppercase tracking-wider text-[#666] mb-2">
                Escolha 1 ao gastar o ponto:
              </p>
              <SpellChoiceList
                choices={spellPoint.choices}
                school={spellPoint.school}
              />
            </>
          ) : (
            <p className="text-sm text-[#666] italic">
              Catálogo desta escola em atualização na wiki.
            </p>
          )}
        </section>
      )}

      {dash && (
        <section>
          <h2 className="font-gothic text-lg text-white mb-1 flex items-center gap-2">
            <Wand2 size={18} className="text-[#c41e3a]" />
            Dash (Veil)
          </h2>
          <p className="text-sm text-[#888] mb-3">
            Desbloqueio direto — não usa ponto de feitiço.
          </p>
          <UnlockCard entry={dash} school={dash.school ?? rewards?.primarySchool} />
        </section>
      )}

      {soulShard && (
        <section className="rounded-xl border border-amber-500/30 bg-[#15120a]/60 p-5">
          <h2 className="font-gothic text-lg text-amber-200/90 mb-3 flex items-center gap-2">
            <Gem size={18} />
            Soul Shard
          </h2>
          <Link
            href={entityDetailPath('jewel', soulShard.jewelSlug)}
            className="inline-flex items-center gap-3 hover:opacity-90"
          >
            <span className="text-white font-medium" style={{ color: soulShard.accent }}>
              {soulShard.jewelNamePt}
            </span>
          </Link>
        </section>
      )}

      {rewards && rewards.vampirePowers.length > 0 && (
        <section>
          <h2 className="font-gothic text-lg text-white mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-violet-400" />
            Poderes vampíricos
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {rewards.vampirePowers.map((entry) => (
              <UnlockCard key={entry.nameEn ?? entry.name} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {mainRewards.length > 0 && (
        <section>
          <h2 className="font-gothic text-lg text-white mb-3 flex items-center gap-2">
            <Package size={18} className="text-[#888]" />
            Estruturas, receitas e itens
          </h2>
          <MainRewardList rewards={mainRewards} />
        </section>
      )}

      {entity.meta?.loot && (
        <section>
          <h2 className="font-gothic text-lg text-[#c41e3a] mb-3">Loot adicional (wiki)</h2>
          <WikiProse text={entity.meta.loot} />
        </section>
      )}

      {worldLore && (
        <section className="rounded-xl border border-[#333] bg-[#111]/50 p-5">
          <h2 className="font-gothic text-sm text-[#888] mb-2">{worldLore.regionTitle}</h2>
          <WikiProse text={worldLore.lore} />
        </section>
      )}
    </div>
  );
}
