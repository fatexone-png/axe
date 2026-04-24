interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  dark?: boolean;
  id?: string;
}

export default function Section({ title, subtitle, children, dark, id }: SectionProps) {
  return (
    <section
      id={id}
      className={`py-20 px-4 ${dark ? "bg-axe-dark" : "bg-axe-black"}`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-axe-white mb-3">{title}</h2>
          {subtitle && (
            <p className="text-axe-muted text-base md:text-lg max-w-xl mx-auto">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
