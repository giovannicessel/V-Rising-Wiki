import type { CraftRecipeMeta } from '@/data/entity-types';

export default function CraftRecipePanel({ recipe }: { recipe: CraftRecipeMeta }) {
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#111]/80 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#333] text-left text-[#888] text-xs uppercase tracking-wider">
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Materiais</th>
            <th className="px-4 py-3">Estrutura</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3 text-white font-medium">
              {recipe.output ?? '—'}
            </td>
            <td className="px-4 py-3 text-[#ccc]">
              {recipe.materials.length ? (
                <ul className="space-y-1">
                  {recipe.materials.map((m) => (
                    <li key={`${m.name}-${m.quantity}`}>
                      <span className="text-[#c41e3a] font-semibold">{m.quantity}×</span>{' '}
                      {m.name}
                    </li>
                  ))}
                </ul>
              ) : (
                '—'
              )}
            </td>
            <td className="px-4 py-3 text-[#ccc]">{recipe.structure ?? '—'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
