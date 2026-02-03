interface DocSectionProps {
  title: string;
  children: React.ReactNode;
}

export function DocSection({ title, children }: DocSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
