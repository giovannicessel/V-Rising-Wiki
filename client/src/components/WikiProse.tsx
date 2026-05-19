import { isLowQualityText, sanitizeWikiText } from '@/lib/wiki-sanitize';

interface WikiProseProps {
  text: string;
  className?: string;
}

export default function WikiProse({ text, className = '' }: WikiProseProps) {
  const clean = sanitizeWikiText(text);
  if (!clean || isLowQualityText(clean)) return null;

  const blocks = clean.split(/\n{2,}/).filter((b: string) => b.trim().length > 0);

  return (
    <div className={`wiki-prose space-y-4 text-[#c4c4c4] text-[15px] leading-[1.75] ${className}`}>
      {blocks.map((block: string, i: number) => {
        const lines = block.split('\n').filter((l: string) => l.trim());
        const isList =
          lines.length > 1 &&
          lines.every((l: string) => /^[-•*]?\s*\w/.test(l.trim()));

        if (isList) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1.5 marker:text-[#c41e3a]/80">
              {lines.map((line: string, j: number) => (
                <li key={j}>{line.replace(/^[-•*]\s*/, '').trim()}</li>
              ))}
            </ul>
          );
        }

        return <p key={i}>{block.replace(/\n/g, ' ').trim()}</p>;
      })}
    </div>
  );
}
