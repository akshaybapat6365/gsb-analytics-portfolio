export function DevEnvBanner() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
  if (major === 20) {
    return null;
  }

  return (
    <div className="mx-auto mb-4 mt-2 w-full max-w-6xl rounded-xl border border-amber-300/20 bg-amber-200/10 px-4 py-3">
      <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-amber-100">
        Dev diagnostics
      </p>
      <p className="mt-2 text-sm text-amber-50/90">
        Node {process.versions.node} detected. Node 20.x is recommended for stable project routing and rendering.
      </p>
    </div>
  );
}
