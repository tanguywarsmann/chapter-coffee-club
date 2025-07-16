interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-serif font-medium text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}