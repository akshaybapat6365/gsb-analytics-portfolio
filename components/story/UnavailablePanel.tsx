type UnavailablePanelProps = {
  title: string;
  reason?: string;
  details?: string[];
};

export function UnavailablePanel({ title, reason, details }: UnavailablePanelProps) {
  return (
    <section className="rounded-2xl border border-amber-300/25 bg-amber-300/8 p-5">
      <p className="font-sans text-xs font-medium uppercase tracking-[0.16em] text-amber-100/90">
        Live Feed Status
      </p>
      <p className="mt-2 text-sm text-slate-100">{title}</p>
      <p className="mt-2 text-xs text-slate-400">
        {reason ?? "Real source feed did not return data. Core scenario modules remain available."}
      </p>
      {details && details.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-slate-300">
          {details.map((detail) => (
            <li key={detail} className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1 w-1 rounded-full bg-amber-200" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
