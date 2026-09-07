import { Rule } from '@/components/ui/Rule'

export function SectionHead({ id, title, note }: { id: string; title: string; note: string }) {
  return (
    <div className="mt-11">
      <div className="flex items-baseline justify-between pb-[10px]">
        <h2 id={id} className="font-display text-[15px] font-semibold tracking-[-0.015em]">{title}</h2>
        <span className="label">{note}</span>
      </div>
      <Rule />
    </div>
  )
}
