export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-24 rounded bg-secondary" />
        ))}
      </div>
      <div className="h-72 rounded bg-secondary" />
      <div className="h-72 rounded bg-secondary" />
    </div>
  );
}

