import type { EntitySection } from '@/data/entity-types';
import { translateSectionTitle } from '@/data/entity-translations';
import WikiProse from '@/components/WikiProse';

function YoutubeEmbed({ id }: { id: string }) {
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#3a3a3a]/80 bg-black/60">
      <iframe
        title="Demonstração em vídeo"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

interface EntitySectionContentProps {
  sections: EntitySection[];
  pageYoutubeId?: string;
}

export default function EntitySectionContent({
  sections,
  pageYoutubeId,
}: EntitySectionContentProps) {
  const mainVideoId =
    pageYoutubeId || sections.find((s) => s.youtubeId)?.youtubeId;

  const textSections = sections.filter(
    (s) => s.body && s.kind !== 'video' && !/video showcase/i.test(s.title)
  );

  if (!mainVideoId && textSections.length === 0) return null;

  return (
    <div className="space-y-8">
      {mainVideoId && (
        <section>
          <h2 className="font-gothic text-lg text-[#c41e3a] mb-4 tracking-wide">
            Demonstração
          </h2>
          <YoutubeEmbed id={mainVideoId} />
        </section>
      )}

      {textSections.map((sec) => (
        <section key={sec.title} className="border-t border-[#2a2a2a] pt-8">
          <h2 className="font-gothic text-lg text-white mb-4 tracking-wide">
            {sec.titlePt ?? translateSectionTitle(sec.title)}
          </h2>
          <WikiProse text={sec.body} />
        </section>
      ))}
    </div>
  );
}
