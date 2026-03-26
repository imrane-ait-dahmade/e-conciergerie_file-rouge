type AdminSubpagePlaceholderProps = {
  title: string;
  description: string;
};

export function AdminSubpagePlaceholder({ title, description }: AdminSubpagePlaceholderProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
